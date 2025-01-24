import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Key } from 'src/app/constant/key';
import { EmployeeProfileResponse } from 'src/app/models/employee-profile-info';
import { UserPositionDTO } from 'src/app/models/user-position.model';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { differenceInMonths, format, parseISO } from 'date-fns';
import { UserResignation } from 'src/app/models/UserResignation';
import { LoggedInUser } from 'src/app/models/logged-in-user';
import { Skills } from 'src/app/constant/Skills';
import { EmployeeAdditionalDocument } from 'src/app/models/EmployeeAdditionalDocument';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { constant } from 'src/app/constant/constant';
import * as pdfjsLib from 'pdfjs-dist';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { EmployeeProfileComponent } from '../employee-profile.component';



@Component({
  selector: 'app-employee-profile-sidebar',
  templateUrl: './employee-profile-sidebar.component.html',
  styleUrls: ['./employee-profile-sidebar.component.css']
})
export class EmployeeProfileSidebarComponent implements OnInit {
  loggedInUser: LoggedInUser = new LoggedInUser();
  userPositionDTO: UserPositionDTO[] = [];
  userId: any;
  myForm: FormGroup;
  modal: any;
  constructor(private dataService: DataService, private modalService: NgbModal, private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    public helperService: HelperService,
    private employeeProfileComponent: EmployeeProfileComponent,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private roleService: RoleBasedAccessControlService,
    public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage,
    public rbacService: RoleBasedAccessControlService,
    private sanitizer: DomSanitizer,
    private onboardingService: OnboardingService,
    private sharedService: HelperService) {
    this.myForm = this.fb.group({
      position: ['', Validators.required],  // Make Position field required
      effectiveDate: ['', Validators.required],
      isProbation: [false],
      endDate: ['']
    });
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';

    this.profileChangeStatusSubscriber = this.helperService.profileChangeStatus.subscribe((value) => {
      if (value) {
        this.toggle = true;
      } else {
        this.toggle = false;
      }
    });

    // this.userId = "731a011e-ae1e-11ee-9597-784f4361d885";
  }
  profileChangeStatusSubscriber: any;

  //  modalUrl: any;



  toggle: boolean = false;
  ROLE: any;
  UUID: any;
  adminRoleFlag: boolean = false;
  userRoleFlag: boolean = false;
  ADMIN = Key.ADMIN;
  MANAGER = Key.MANAGER;
  USER = Key.USER;
  userInfo: any;
  async ngOnInit(): Promise<void> {
    // this.calculateLasWorkingDay();
    this.getEmployeeProfileData();
    this.getUserAttendanceStatus();
    this.fetchUserPositions();
    this.getSkills();
    this.fetchDocuments();
    this.ROLE = await this.roleService.getRole();
    this.UUID = await this.roleService.getUuid();
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
    console.log('ROLE for emp-sidebar: ', this.ROLE)

    if (this.ROLE == this.ADMIN) {
      this.adminRoleFlag = true;
    }

    if (this.userId == this.UUID) {
      this.userRoleFlag = true;
    }

    this.checkUserExist();

    this.getNoticePeriodDuration()

    this.getUserResignationInfo()
    this.closeModalSubscription = this.sharedService.closeModal$.subscribe(() => {
      if (this.currentModalRef) {
        this.currentModalRef.close();
      }
    });
    this.userInfo = this.rbacService.userInfo;
    console.log('User Info:', this.userInfo);
  }

  ngOnDestroy() {
    debugger
    if (this.closeModalSubscription) {

      this.closeModalSubscription.unsubscribe();
    }
    this.profileChangeStatusSubscriber.complete();
  }

  // ngOnDestroy(){
  //   this.profileChangeStatusSubscriber.complete();
  // }


  employeeProfileResponseData: EmployeeProfileResponse | undefined;
  teamString !: any;
  viewTeamsLess: boolean = true;
  hrPolicyDocuments: EmployeeAdditionalDocument[] = [];
  resigntionStatus: any

  getEmployeeProfileData() {
    debugger
    this.dataService.getEmployeeProfile(this.userId).subscribe((response) => {
      console.log(response.object);
      this.employeeProfileResponseData = response.object;
      this.dataService.employeeData=response.object;
      if (!this.employeeProfileResponseData?.agreementAccepted && this.userId === this.UUID) {
        this.dataService.getHrPolicies()
          .subscribe(
            (data) => {
              this.hrPolicyDocuments = data;
              if (this.hrPolicyDocuments.length > 0) {
                this.openModal();
              }
            },
            (error) => {
              console.error('Error fetching documents:', error);
            }
          );
      }

      this.teamString = this.employeeProfileResponseData?.teams;
      this.splitTeams();
    }, (error) => {
      console.log(error);
    })
    console.log("employee profile", this.employeeProfileResponseData);
  }

  skills: string[] = [];

  searchSkill: string = '';
  addSkill(): void {
    if (this.searchSkill && !this.skills.includes(this.searchSkill)) {
      this.skills.push(this.searchSkill);
      this.searchSkill = ''; // Clear input field after adding
    } else if (this.searchSkill) {
      this.helperService.showToast(this.searchSkill + ' is Already Added', Key.TOAST_STATUS_ERROR);
    } else if (!this.searchSkill) {
      this.helperService.showToast('Empty field cannot be added ', Key.TOAST_STATUS_ERROR);
    }
    this.skillsFilteredOptions = [];
  }
  checkSkillsArraysEqual(): boolean {

    if (this.skills.length !== this.fetchedSkills.length) {
      return false;
    }

    // Sort both arrays and compare each element
    const sortedArr1 = [...this.skills].sort();
    const sortedArr2 = [...this.fetchedSkills].sort();

    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }

  isModalVisible = false;
  openExitModal() {
    this.isModalVisible = true;
  }

  removeSkill(skill: string): void {
    const index = this.skills.indexOf(skill);
    if (index !== -1) {
      this.skills.splice(index, 1);
    }
  }


  fetchedSkills: string[] = [];
  isSkillsLoading: boolean = false;
  viewLess: boolean = true;
  @ViewChild('closeButton') closeButton!: ElementRef;
  saveSkills(): void {
    debugger
    this.isSkillsLoading = true;
    this.dataService.saveSkills(this.userId, this.skills).subscribe(
      (response) => {
        this.isSkillsLoading = false;
        this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
        this.getSkills();
        this.closeButton.nativeElement.click();
      },
      error => {
        this.isSkillsLoading = false;
        console.error('Error saving skills', error);
      }
    );
  }

  // Fetch skills from backend
  getSkills(): void {
    this.dataService.getSkills(this.userId).subscribe(
      (skills) => {
        this.fetchedSkills = skills;
        this.skills = JSON.parse(JSON.stringify(skills));;
      },
      error => {
        console.error('Error fetching skills', error);
      }
    );
  }

  fetchUserPositions(): void {
    this.dataService.getUserPositionsByUserId(this.userId).subscribe({
      next: (data) => {
        this.userPositionDTO = data;
        this.setWithUsDuration();
      },
      error: (err) => {
        console.error('Error fetching user positions:', err);
      },
    });

  }

  teams: string[] = [];

  splitTeams(): void {
    this.teams = this.teamString.split(',').map((team: string) => team.trim());
    console.log(this.teams);
  }

  getFirstLetterOfName(): string {
    return this.employeeProfileResponseData?.userName ? this.employeeProfileResponseData.userName.charAt(0).toUpperCase() : '';
  }


  status: string = '';

  getUserAttendanceStatus() {
    this.dataService.checkinCheckoutStatus(this.userId).subscribe(
      (data) => {
        this.status = data.result;
      },
      (error) => {
      }
    );
  }

  handleBreakButtonClick(command: string) {
    if (command == '/break') {
      this.checkinCheckout('/break')
    } else if (command == '/back') {
      this.checkinCheckout('/break')
    }
  }

  InOutLoader: boolean = false;
  outLoader: boolean = false;
  breakLoader: boolean = false;

  checkinCheckout(command: string) {
    this.InOutLoader = true;
    if (command === '/out') {
      this.outLoader = true;
      this.urlModalTemplate.nativeElement.click();
    }
    if (command === '/in') {
      this.urlModalTemplate.nativeElement.click();
    }
    if (command === '/break') {
      this.breakLoader = true;
    }
    this.dataService.checkinCheckoutInSlack(this.userId, command).subscribe(
      (data) => {
        this.InOutLoader = false;
        this.outLoader = false;
        this.breakLoader = false;

        // Check if data.message is a valid URL
        const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/;
        if (urlPattern.test(data.message)) {
          // Open the URL in a UI popup/modal
          console.log('Opening URL in modal:', data.message);
          this.openUrlInModal(data.message);
        } else {
          // Show toast with success message
          this.helperService.showToast(data.message, Key.TOAST_STATUS_SUCCESS);
        }

        this.getUserAttendanceStatus();
      },
      (error) => {
        this.InOutLoader = false;
        this.outLoader = false;
        this.breakLoader = false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  modalUrl: SafeResourceUrl | null = null;
  // @ViewChild('urlModalTemplate', { static: true }) urlModalTemplate!: TemplateRef<any>;
  @ViewChild('urlModalTemplate') urlModalTemplate!: ElementRef;
  currentModalRef: any;
  private closeModalSubscription!: Subscription;


  openUrlInModal(url: string) {
    this.modalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url); // Sanitize URL
    this.currentModalRef = this.modalService.open(this.urlModalTemplate, { size: 'lg', centered: true });

    console.log('Current Modal Ref:', this.currentModalRef);
    // this.dataService.markAttendanceModal = true;
    this.currentModalRef.result.finally(() => {
      this.modalUrl = null;
      this.getUserAttendanceStatus();
    });
  }

  // openUrlInModal(url: string) {
  //   this.modalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url); // Sanitize URL
  //   const modalRef = this.modalService.open(this.urlModalTemplate, { size: 'lg', centered: true });

  //   this.dataService.markAttendanceModal = true;
  //   modalRef.result.finally(() => {
  //     this.modalUrl = null;
  //     this.getUserAttendanceStatus();
  //   });
  // }



  position: string = '';
  positionFilteredOptions: string[] = [];
  skillsFilteredOptions: string[] = [];
  onChange(value: string): void {

    this.positionFilteredOptions = this.jobTitles.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );

  }
  onSkillsChange(value: string): void {

    this.skillsFilteredOptions = Skills.SKILLS.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase()) &&
      !this.skills.includes(option)
    );

  }
  preventLeadingWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
    }
  }

  isPromotion: boolean = false;
  openFormModal(validate: String) {
    if (validate === 'Promotion') {
      this.isPromotion = false;
    } else {
      this.isPromotion = true;
    }

  }

  openConfirmationModal(content: any) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result) {
          this.dataService.completeProbation(this.userId).subscribe(
            response => {
              this.cdr.detectChanges();
              this.helperService.showToast("Probation completed successfully.", Key.TOAST_STATUS_SUCCESS);
            },
            error => {

            }
          );
        }
      },
      (reason) => {
        // Handle dismiss, if needed
      }
    );
  }



  filteredPositions: string[] = [];

  searchPosition(event: Event): void {
    debugger
    const inputValue = (event.target as HTMLInputElement).value; // Extract the string value
    this.filteredPositions = this.jobTitles.filter(position =>
      position.toLowerCase().includes(inputValue.toLowerCase())
    );
  }

  isSaving: boolean = false;
  saveButtonLoader: boolean = false;
  onSubmit() {
    debugger
    this.saveButtonLoader = true;
    if (this.myForm.valid) {
      const userPositionDTO: UserPositionDTO = {
        position: this.myForm.get('position')?.value,
        startDate: this.myForm.get('effectiveDate')?.value,
        endDate: this.myForm.get('endDate')?.value,
        userId: this.userId,
        isProbation: this.myForm.get('isProbation')?.value
      };
      this.isSaving = true;

      // Call the service method to save the user position
      this.dataService.saveUserPosition(userPositionDTO).subscribe(
        (response) => {
          console.log('Position saved successfully', response);
          /// get only sidebar component data
          window.location.reload();
        },
        (error) => {
          console.error('Error saving position', error);
          // Optionally, show an error message
        }
      );
    }
  }

  duration: string = '';
  setWithUsDuration() {
    debugger;

    if (!this.userPositionDTO || this.userPositionDTO.length === 0) {
      this.duration = '';
      return;
    }

    // Get the last element of the DTO
    const lastElement = this.userPositionDTO[this.userPositionDTO.length - 1];

    // If the last element's startDate is empty
    if (!lastElement.startDate) {
      const dates = this.userPositionDTO.map(position => ({
        start: parseISO(position.startDate),
        end: position.endDate ? parseISO(position.endDate) : new Date()
      }));

      const minDate = dates.reduce((min, date) => date.start < min ? date.start : min, dates[0].start);
      const maxDate = dates.reduce((max, date) => date.end > max ? date.end : max, dates[0].end);

      const totalMonths = differenceInMonths(maxDate, minDate);
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;

      this.duration = `${years} years ${months} months`;
    } else {
      // If the last element's startDate is available
      const startDate = parseISO(lastElement.startDate);
      const currentDate = new Date();

      const totalMonths = differenceInMonths(currentDate, startDate);
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;

      this.duration = `${years} years ${months} months`;
    }
  }





  // User Resignation start

  @ViewChild('closeResignationButton') closeResignationButton!: ElementRef
  userResignationReq: UserResignation = new UserResignation();
  resignationToggle: boolean = false;
  submitResignation(form: NgForm) {

    this.resignationToggle = true;
    this.userResignationReq.createdBy = this.ROLE
    this.userResignationReq.uuid = this.userId
    // console.log('request form : ',this.userResignationReq)
    this.dataService.submitResignation(this.userResignationReq).subscribe((res: any) => {
      if (res.status) {
        this.resignationToggle = false
        // this.resignationViewModal = true;
        this.helperService.resignationSubmitted.next(true);
        this.closeResignationButton.nativeElement.click()
        this.clearForm();
        form.resetForm();
      }
    })
  }

  clearFormData(form: NgForm) {
    this.clearForm();
    form.resetForm();
  }


  clearForm() {
    this.recommendDay = ''
    this.discussionType = ''
    this.userResignationReq.uuid = ''
    this.userResignationReq.reason = ''
    this.userResignationReq.comment = ''
    this.userResignationReq.isManagerDiscussion = 0
    this.userResignationReq.isRecommendLastDay = 0
    this.userResignationReq.createdBy = ''
    this.userResignationReq.url = ''
    this.userResignationReq = new UserResignation();
  }

  discussionType: string = ''; // Default selected value
  selectManagerDiscussion(value: string): void {

    this.userResignationReq.isManagerDiscussion = value == 'Yes' ? 1 : 0
  }

  recommendDay: string = ''; // Default selected value
  selectRecommendDay(value: string): void {

    this.userResignationReq.userLastWorkingDay = ''

    this.userResignationReq.isRecommendLastDay = value == 'Other' ? 1 : 0

    if (this.userResignationReq.isRecommendLastDay == 0) {
      this.userResignationReq.lastWorkingDay = ''
      this.calculateLasWorkingDay();
    }

  }

  // Function to disable future dates
  disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    // const maxDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date

    // this.lastWorkingDay = maxDate;
    // console.log("Max Date: ", this.lastWorkingDay);
    // Disable dates from today to maxDate (inclusive)
    return current < today || current > maxDate;
  };

  calculateLasWorkingDay() {
    const today = new Date();
    // const maxDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date

    // this.lastWorkingDay = maxDate;
    // this.userResignationReq.lastWorkingDay = maxDate
    this.userResignationReq.userLastWorkingDay = this.helperService.formatDateToYYYYMMDD(maxDate);
    // console.log("Max Date: ", this.lastWorkingDay);
  }

  selectLastWorkingDay(startDate: Date) {
    debugger
    if (this.userResignationReq.isRecommendLastDay == 0 && startDate) {
      this.userResignationReq.userLastWorkingDay = this.helperService.formatDateToYYYYMMDD(startDate);
    }
  }

  noticePeriodDuration: number = 0;
  getNoticePeriodDuration() {
    this.dataService.getNoticePeriodDuration(this.userId).subscribe((res: any) => {
      if (res.status) {
        this.noticePeriodDuration = res.object
        console.log('Duration: ', this.noticePeriodDuration)
      }
    })
  }

  userResignationInfo: any;
  getUserResignationInfo() {
    this.dataService.getUserResignationInfo(this.userId).subscribe((res: any) => {
      if (res.status) {
        this.userResignationInfo = res.object[0]
        console.log('userResignationInfo: ', this.userResignationInfo)
      }
    })
  }

  existExitPolicy: boolean = false;
  checkUserExist() {
    this.existExitPolicy = false
    this.dataService.checkUserExist(this.userId).subscribe((res: any) => {
      if (res.status && res.object == 1) {
        this.existExitPolicy = true;
      }
    })
  }

  @ViewChild('closeApproveModal') closeApproveModal!: ElementRef
  approveToggle: boolean = false
  // approveOrDeny(id: number, statusId: number) {
  approveOrDeny(id: number) {

    debugger
    this.approveToggle = true;
    this.dataService.updateResignation(id).subscribe((res: any) => {
      if (res.status) {
        this.closeApproveModal.nativeElement.click()
        this.approveToggle = false

        this.helperService.showToast(
          res.message,
          Key.TOAST_STATUS_SUCCESS
        );
      } else {
        this.approveToggle = false;
      }
    })

  }

  clearApproveModal() {

  }


  // User Resignation end



  /**
   * Image upload start on Firebase
   */

  /** Image Upload on the Firebase Start */

  isFileSelected = false;
  imagePreviewUrl: any = null;
  selectedFile: any;
  isUploading: boolean = false;
  fileName: any;
  currentDate: any
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      this.fileName = file.name;
      this.currentDate = new Date()
      // Check if the file type is valid
      if (this.isValidFileType(file)) {
        this.selectedFile = file;
        this.isUploading = true;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the loaded image as the preview
          this.imagePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(file);

        this.uploadFile(file);

        console.log('url is', this.userResignationReq.url)

      } else {
        element.value = '';
        this.userResignationReq.url = '';
        // Handle invalid file type here (e.g., show an error message)
        console.error(
          'Invalid file type. Please select a jpg, jpeg, or png file.'
        );
      }
    } else {
      this.isFileSelected = false;
    }
  }

  // Helper function to check if the file type is valid
  isInvalidFileType = false;
  isValidFileType(file: File): boolean {
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const fileType = file.type.split('/').pop(); // Get the file extension from the MIME type

    if (fileType && validExtensions.includes(fileType.toLowerCase())) {
      this.isInvalidFileType = false;
      return true;
    }
    // console.log(this.isInvalidFileType);
    this.isInvalidFileType = true;
    return false;
  }


  uploadFile(file: File): void {
    debugger;
    const filePath = `resignation/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .toPromise()
      .then(() => {
        // console.log('Upload completed');
        fileRef
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            console.log('File URL:', url);
            this.isUploading = false;
            this.userResignationReq.url = url;
          })
          .catch((error) => {
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        console.error('Error in upload snapshotChanges:', error);
      });

    console.log('upload url is: ', this.userResignationReq.url)
  }

  deleteImage() {
    this.userResignationReq.url = ''
  }



  /** Image Upload on Firebase End */



  onLogout() {
    localStorage.clear();
    this.helperService.orgStepId = 0;
    this.helperService.stepId = 0;
    // this.onboardingService.isLoadingOnboardingStatus = true;
    this.rbacService.clearRbacService();
    this.helperService.clearHelperService();
    this.router.navigate(['/login']);
  }

  // routeToAccountPage(tabName: string) {
  //   // this.dataService.activeTab = tabName !== 'account';
  //   this.router.navigate(['/setting/account-settings'], {
  //     queryParams: { setting: tabName },
  //   });
  // }

  routeToAccountPage(tabName: string) {
    if (this.userId == this.UUID) {
      this.employeeProfileComponent.settingTab.nativeElement.click();
      return;
    }
    // this.dataService.activeTab = tabName !== 'account';
    this.router.navigate(['/setting/account-settings'], {
      queryParams: { setting: tabName },
    });
  }

  isDocumentLoading: boolean = false;
  doc: EmployeeAdditionalDocument = { fileName: '', name: 'Employee Agreement', url: '', value: '', documentType: 'employee_agreement' };
  uploadDocumentFile(event: Event, doc: EmployeeAdditionalDocument): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.doc.name = '';
      this.doc.id = doc.id;
      this.doc.value = doc.value;
      this.doc.name = doc.name;
      this.doc.documentType = doc.documentType;
      this.doc.fileName = file.name;
      this.uploadAdditionalFile(file);
      console.log('Uploading file for document:', doc.name, file);
    }
  }

  uploadAdditionalFile(file: File): void {
    const filePath = `employeeCompanyDocs/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.doc.url = url;
            this.isDocumentLoading = true;
            this.dataService.saveDocumentForUser(this.userId, this.doc).subscribe({
              next: (response) => {
                this.fetchDocuments();
                this.selectedFile = null;
                const closeButton = document.querySelector('#addDocument .close-btn') as HTMLElement;
                if (closeButton) {
                  closeButton.click();
                }

                console.log('Document saved successfully:', response);
                this.helperService.showToast('Document saved successfully:', Key.TOAST_STATUS_SUCCESS);
                this.isDocumentLoading = false;
              },
              error: (err) => {
                this.helperService.showToast('Some problem in saving Document:', Key.TOAST_STATUS_ERROR);
                this.isDocumentLoading = false;
              },
            });
          });
        })
      )
      .subscribe();
  }

  documents: EmployeeAdditionalDocument[] = [];
  fetchDocuments(): void {
    this.dataService.getDocumentsByTypeAndUser(constant.DOC_TYPE_EMPLOYEE_AGREEMENT, this.userId)
      .subscribe(
        (data) => {
          this.documents = data;
        },
        (error) => {
          console.error('Error fetching documents:', error);
        }
      );
  }

  onDocumentSubmit(): void {
    if (this.selectedFile) {
      this.isDocumentLoading = true;
      this.uploadAdditionalFile(this.selectedFile);
    } else {
      console.error('No file selected!');
    }
  }

  downloadSingleImage(fileUrl: string) {

    if (!fileUrl) {
      return;
    }
    debugger
    fetch(fileUrl)
      .then(response => response.blob()) // Convert the image to a Blob
      .then(blob => {
        // Create a temporary URL for the Blob
        const blobUrl = URL.createObjectURL(blob);

        // Create a hidden link element
        const link = document.createElement('a');
        link.href = blobUrl;

        // Extract the file name from the URL or use a default name
        const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'downloaded-file.jpg';

        link.download = fileName;  // This triggers the download

        // Simulate a click to start the download
        link.style.display = 'none';  // Hide the link
        document.body.appendChild(link); // Append the link to the body
        link.click(); // Trigger the download
        document.body.removeChild(link); // Remove the link from the DOM
        URL.revokeObjectURL(blobUrl); // Release the object URL
      })
      .catch(error => {
        console.error('Error downloading file:', error);
      });
  }
  handleFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.doc.fileName = target.files?.[0]?.name || '';
    this.selectedFile = target.files?.[0];
  }

  @ViewChild('pdfModalButton') pdfModalButton!: ElementRef;

  isLastPageRead = false;
  isAgreementAccepted = false;
  totalPages = 0;
  currentPdfIndex = 0;
  lastIndex = -1;

  openModal() {
    debugger
    // console.log('Open modal  ' + this.modalService.hasOpenModals());
    // if (this.pdfModal && this.modalService.hasOpenModals()) {
    //   return;
    // }
    if (this.pdfModalButton) {
      this.pdfModalButton.nativeElement.click();
      this.lastIndex++;
    }
    // this.modalService.open(this.pdfModal, { backdrop: 'static', keyboard: false });

    // Wait for the modal to fully render before loading the PDF
    setTimeout(() => {
      const pdfUrl = this.hrPolicyDocuments[this.currentPdfIndex].url;
      this.loadContent(pdfUrl);
    }, 500);
  }

  loadContent(contentUrl: string) {
    debugger;
    const container = document.getElementById('pdf-container');
    console.log('Container:', container);
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    if (this.isYouTubeUrl(contentUrl)) {
      this.isVideoPolicy=true;
      // Render YouTube content in iframe
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '500px';
      iframe.src = this.getYouTubeEmbedUrl(contentUrl);
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
      this.isLastPageRead = true;
    } else {
      this.isVideoPolicy=false;
      // Render PDF
      this.loadPDF(contentUrl);
    }
  }

  isAccepted: boolean = false;

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isAccepted = checkbox.checked;
  }

  isYouTubeUrl(url: string): boolean {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|embed|watch)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  }

  getYouTubeEmbedUrl(url: string): string {
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  }

  loadPDF(pdfUrl: string) {
    debugger
    const container = document.getElementById('pdf-container');
    console.log('Container:', container);
    if (!container) return;
    pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
      console.log('PDF loaded, number of pages:', pdf.numPages);
      this.totalPages = pdf.numPages;

      // Clear previous content
      container.innerHTML = '';

      // Render pages
      for (let i = 1; i <= pdf.numPages; i++) {
        pdf.getPage(i).then((page) => {
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          if (context) {
            container.appendChild(canvas);
            page.render({ canvasContext: context, viewport }).promise.then(() => {
              if (i === pdf.numPages) {
                this.setupScrollDetection(container);
              }
            });
          }
        });
      }
    });
  }


isVideoPolicy=false;
  setupScrollDetection(container: HTMLElement) {
    debugger
    container.addEventListener('scroll', () => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      if ((container.scrollTop + 10) >= maxScroll) {
        this.isLastPageRead = true;
      }
    });
  }

  acceptAgreement() {
    debugger
    if (this.isLastPageRead) {
      this.isAgreementAccepted = true;
      this.moveToNextPdf();


    } else {
      this.pdfModalButton.nativeElement.click();
      this.helperService.showToast('Please scroll to the last page before accepting.', Key.TOAST_STATUS_ERROR);
    }
  }

  moveToNextPdf() {
    debugger
    this.currentPdfIndex++;

    // If there are more PDFs to show
    if (this.currentPdfIndex < this.hrPolicyDocuments.length) {
      // modal.close();
      // this.modalService.dismissAll();
      this.pdfModalButton.nativeElement.click();
      this.isLastPageRead = false;
      this.isAccepted = false;
      setTimeout(() => {
        this.openModal(); // Open modal with the next PDF
      }, 200);
    } else {
      this.dataService.acceptAgreement().subscribe((res: any) => {
        if (res.status) {
          this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
        }
      })
      // modal.close();s
    }
  }

  jobTitles: string[] = [
    'Accountant',
    'Accounting Manager',
    'Administrative Assistant',
    'AI Developer (Artificial Intelligence)',
    'Angular Developer',
    'AR/VR Developer (Augmented Reality / Virtual Reality)',
    'Assembly Line Worker',
    'Automation Test Engineer',
    'Back-End Developer',
    'Bioinformatics Developer',
    'Blockchain Developer',
    'Brand Manager',
    'Business Analyst',
    'Business Development Executive',
    'Business Development Manager',
    'Buyer',
    'Call Center Agent',
    'Cash Manager',
    'Chief Financial Officer (CFO)',
    'Civil Engineer',
    'Cloud Developer (AWS Developer, Azure Developer, etc.)',
    'Communications Director',
    'Communications Specialist',
    'Compliance Analyst',
    'Compliance Officer',
    'Content Writer',
    'Corporate Lawyer',
    'Corporate Social Responsibility Manager',
    'Corporate Trainer',
    'Creative Director',
    'Customer Service Manager',
    'Customer Service Representative',
    'Database Administrator',
    'Database Developer',
    'Data Warehouse Developer',
    'Desktop Application Developer',
    'DevOps Developer',
    'Digital Marketing Specialist',
    'Distribution Manager',
    'Electrical Engineer',
    'Embedded Systems Developer',
    'EHS Manager',
    'Engineering Manager',
    'Environmental Analyst',
    'Environmental Engineer',
    'Event Coordinator',
    'Executive Assistant',
    'Facilities Manager',
    'Finance Manager',
    'Financial Analyst',
    'Front-End Developer',
    'Full Stack Developer',
    'Game Developer',
    'General Counsel',
    'Go Developer',
    'Graphic Designer',
    'Green Program Manager',
    'Health and Safety Officer',
    'Help Desk Technician',
    'Helpdesk Technician',
    'HR Generalist',
    'HR Manager',
    'HTML/CSS Developer',
    'Human Resources',
    'Information Technology (IT)',
    'Investment Analyst',
    'Inventory Manager',
    'Inventory Specialist',
    'IT Manager',
    'Java Developer',
    'JavaScript Developer',
    'Junior Software Developer',
    'Lead Developer / Technical Lead',
    'Learning and Development Specialist',
    'Legal Assistant',
    'Logistics Coordinator',
    'Logistics Manager',
    'Machine Learning Developer',
    'Maintenance Manager',
    'Maintenance Technician',
    'Manufacturing Engineer',
    'Market Research Analyst',
    'Marketing Manager',
    'Mechanical Engineer',
    'Media Relations Coordinator',
    'Mobile App Developer (Android Developer, iOS Developer)',
    'Network Engineer',
    'Node.js Developer',
    'Office Manager',
    'Operations Analyst',
    'Operations Manager',
    'Paralegal',
    'Payroll Clerk',
    'Payroll Specialist',
    'PHP Developer',
    'Plant Manager',
    'Plumber',
    'Product Designer',
    'Product Developer',
    'Product Manager',
    'Production Manager',
    'Production Planner',
    'Program Manager',
    'Project Coordinator',
    'Project Manager',
    'Public Relations Officer',
    'Procurement Manager',
    'Process Improvement Specialist',
    'Product Development',
    'Product Owner (in a software development context)',
    'Project Management',
    'Public Relations',
    'Purchasing Agent',
    'Python Developer',
    'QA Developer',
    'Quality Assurance Manager',
    'Quality Control Inspector',
    'Quality Control Technician',
    'Quality Inspector',
    'React Developer',
    'Receptionist',
    'Recruiter',
    'Regulatory Affairs Manager',
    'Research and Development (R&D)',
    'Research and Development Engineer',
    'Research Scientist',
    'Risk Analyst',
    'Risk Manager',
    'Robotics Developer',
    'Ruby Developer',
    'R&D Engineer',
    'R&D Manager',
    'Sales Manager',
    'Sales Representative',
    'Scrum Master',
    'Scala Developer',
    'Security Developer',
    'Senior Software Developer',
    'SEO Specialist',
    'Software Architect',
    'Software Development Manager',
    'Software Engineer',
    'Software Test Developer',
    'Software Tester',
    'Software Development',
    'Software Test Developer',
    'Software Tester',
    'Sourcing Manager',
    'Supply Chain Analyst',
    'Supply Chain Manager',
    'Sustainability Coordinator',
    'Sustainability Manager',
    'Systems Administrator',
    'Systems Software Developer',
    'Tax Specialist',
    'Training and Development Officer',
    'Training Manager',
    'Transportation Coordinator',
    'Treasury Analyst',
    'Treasurer',
    'UI (User Interface) Developer',
    'UX (User Experience) Developer',
    'Vue.js Developer',
    'Web Designer',
    'Web Developer',
    'Workplace Safety Officer',
  ];



}
