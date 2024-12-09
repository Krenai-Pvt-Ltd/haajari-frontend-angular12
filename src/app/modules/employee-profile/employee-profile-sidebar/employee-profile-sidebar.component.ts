import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
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
import { Subject } from 'rxjs';

@Component({
  selector: 'app-employee-profile-sidebar',
  templateUrl: './employee-profile-sidebar.component.html',
  styleUrls: ['./employee-profile-sidebar.component.css']
})
export class EmployeeProfileSidebarComponent implements OnInit {
   loggedInUser: LoggedInUser = new LoggedInUser();
  userPositionDTO: UserPositionDTO[]=[];
  userId : any;
  myForm: FormGroup;
  constructor( private dataService: DataService,private modalService: NgbModal, private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    public helperService: HelperService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private roleService: RoleBasedAccessControlService,
    public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage,
    public rbacService: RoleBasedAccessControlService,
    private sanitizer: DomSanitizer,) {
      this.myForm = this.fb.group({
        position: ['', Validators.required],  // Make Position field required
        effectiveDate: ['', Validators.required],
        isProbation: [false],
        endDate: ['']
      });
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }


    this.profileChangeStatusSubscriber =  this.helperService.profileChangeStatus.subscribe((value)=>{
      if(value){
        this.toggle = true;
      }else{
        this.toggle = false;
      }
    });
  
    // this.userId = "731a011e-ae1e-11ee-9597-784f4361d885";
   }

   profileChangeStatusSubscriber: any;

   

   toggle :boolean = false;
   ROLE : any;
   UUID : any;
   adminRoleFlag : boolean = false;
   userRoleFlag : boolean = false;
   ADMIN = Key.ADMIN;
   MANAGER = Key.MANAGER;
   USER = Key.USER;
  async ngOnInit(): Promise<void> {
    // this.calculateLasWorkingDay();
    this.getEmployeeProfileData();
    this.getUserAttendanceStatus();
    this.fetchUserPositions();

    this.ROLE = await this.roleService.getRole();
    this.UUID = await this.roleService.getUuid();

    console.log('ROLE for emp-sidebar: ',this.ROLE)

    if (this.ROLE == this.ADMIN) {
      this.adminRoleFlag = true;
    }

    if (this.userId == this.UUID) {
      this.userRoleFlag = true;
    }

    this.getNoticePeriodDuration()

    this.getUserResignationInfo()

  }

  ngOnDestroy(){
    this.profileChangeStatusSubscriber.complete();
  }


  employeeProfileResponseData : EmployeeProfileResponse | undefined;
  teamString !: any;
  getEmployeeProfileData() {
    debugger
    this.dataService.getEmployeeProfile(this.userId).subscribe((response) => {
      console.log(response.object);
      this.employeeProfileResponseData = response.object;
      this.teamString = this.employeeProfileResponseData?.teams;
      this.splitTeams();
    }, (error) => {
         console.log(error);
    })
    console.log("employee profile", this.employeeProfileResponseData);
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

  checkinCheckout(command: string) {
    this.InOutLoader = true;
    this.dataService.checkinCheckoutInSlack(this.userId, command).subscribe(
      (data) => {
        this.InOutLoader = false;
        this.helperService.showToast(data.message, Key.TOAST_STATUS_SUCCESS);
        this.getUserAttendanceStatus();
      },
      (error) => {
        this.InOutLoader = false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);

      }
    );
  }


  position: string='';
  positionFilteredOptions: string[] = [];
  onChange(value: string): void {

      this.positionFilteredOptions = this.jobTitles.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
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

  isPromotion: boolean=false;
  openFormModal(validate: String) {
    if(validate==='Promotion'){
      this.isPromotion=false;
    } else {
        this.isPromotion=true;
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
    this.saveButtonLoader=true;
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

  duration: string = '0 year 0 months';
  setWithUsDuration() {
    debugger
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
  }




  // User Resignation start

  @ViewChild('closeResignationButton') closeResignationButton!: ElementRef
  userResignationReq: UserResignation = new UserResignation();
  resignationToggle: boolean = false;
  submitResignation(form: NgForm){

    this.resignationToggle = true;
    this.userResignationReq.createdBy = this.ROLE
    this.userResignationReq.uuid = this.userId
    // console.log('request form : ',this.userResignationReq)
    this.dataService.submitResignation(this.userResignationReq).subscribe((res: any) => {
        if(res.status){
          this.resignationToggle =false
          // this.resignationViewModal = true;
          this.helperService.resignationSubmitted.next(true);
          this.closeResignationButton.nativeElement.click()
          this.clearForm();
          form.resetForm();
        }
    })
  }

  clearFormData(form: NgForm){
    this.clearForm();
    form.resetForm();
  }

  
  clearForm(){
    this.recommendDay = ''
    this.discussionType = ''
    this.userResignationReq.uuid =''
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

    this.userResignationReq.lastWorkingDay = ''
    
    this.userResignationReq.isRecommendLastDay = value == 'Other' ? 1 : 0

    if(this.userResignationReq.isRecommendLastDay == 0){
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

  calculateLasWorkingDay(){
    const today = new Date();
    // const maxDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date
  
    // this.lastWorkingDay = maxDate;
    // this.userResignationReq.lastWorkingDay = maxDate
    this.userResignationReq.lastWorkingDay = this.helperService.formatDateToYYYYMMDD(maxDate);
    // console.log("Max Date: ", this.lastWorkingDay);
  }

  selectLastWorkingDay(startDate: Date) {
    debugger
    if (this.userResignationReq.isRecommendLastDay == 0 && startDate) {
      this.userResignationReq.lastWorkingDay = this.helperService.formatDateToYYYYMMDD(startDate);
    }
  }

  noticePeriodDuration: number = 0;
  getNoticePeriodDuration(){
    this.dataService.getNoticePeriodDuration(this.userId).subscribe((res: any) => {
      if(res.status){
        this.noticePeriodDuration = res.object
        console.log('Duration: ',this.noticePeriodDuration)
      }
    })
  }

  userResignationInfo: any;
  getUserResignationInfo(){
    this.dataService.getUserResignationInfo(this.userId).subscribe((res: any) => {
      if(res.status){
        this.userResignationInfo = res.object[0]
        console.log('userResignationInfo: ',this.userResignationInfo)
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
      if(res.status){
        this.closeApproveModal.nativeElement.click()
        this.approveToggle = false

        this.helperService.showToast(
          res.message,
          Key.TOAST_STATUS_SUCCESS
        );
      }else{
        this.approveToggle = false;
      }
    })

  }

  clearApproveModal(){

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
    this.rbacService.clearRbacService();
    this.helperService.clearHelperService();
    this.router.navigate(['/login']);
  }

  routeToAccountPage(tabName: string) {
    // this.dataService.activeTab = tabName !== 'account';
    this.router.navigate(['/setting/account-settings'], {
      queryParams: { setting: tabName },
    });
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
