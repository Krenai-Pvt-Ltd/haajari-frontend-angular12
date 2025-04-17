import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { finalize } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { StaffAddressDetailsForMultiLocationRequest } from 'src/app/models/StaffAddressDetailsForMultiLocationRequest';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
import { OrganizationPersonalInformationRequest } from 'src/app/models/organization-personal-information-request';
import { Staff } from 'src/app/models/staff';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PlacesService } from 'src/app/services/places.service';
import { OnboardingModule } from 'src/app/models/OnboardingModule';
import { Role } from 'src/app/models/role';
import { ActivatedRoute } from '@angular/router';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { EmployeeAdditionalDocument } from 'src/app/models/EmployeeAdditionalDocument';
import { constant } from 'src/app/constant/constant';
import { NotificationTypeInfoRequest } from 'src/app/models/NotificationType';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { Routes } from 'src/app/constant/Routes';

@Component({
  selector: 'app-company-setting',
  templateUrl: './company-setting.component.html',
  styleUrls: ['./company-setting.component.css'],
})
export class CompanySettingComponent implements OnInit {
  organizationPersonalInformationRequest: OrganizationPersonalInformationRequest =
    new OrganizationPersonalInformationRequest();
    roles: Role[] = [];
    onboardingModules: OnboardingModule[] = [];
    pageNumberUser: number = 1;
    ROLE : string = '';
  constructor(
    private dataService: DataService,
    private afStorage: AngularFireStorage,
    public helperService: HelperService,
    private sanitizer: DomSanitizer,
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public rbacService: RoleBasedAccessControlService
  ) { }

  public readonly constants = constant;
  readonly Routes=Routes;


  ngOnInit(): void {
    window.scroll(0, 0);
    this.getROLE();

    this.notificationTypes();
    this.getOrganizationDetailsMethodCall();
    this.getTeamNames();
    this.getUserByFiltersMethodCall();
    this.getAllAddressDetails();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
    this.getAllRolesMethodCall();
    this.fetchOnboardingModules();
    this.fetchDocuments();
    this.getMasterAttendanceModeMethodCall();
  }


  async getROLE() {
    this.ROLE = await this.rbacService.getRole();
  }


  ngAfterViewInit() {

    this.route.queryParams.subscribe(params => {
      const activeTab = params['activeTab'];
      if (activeTab) {
        this.switchTab(activeTab);
      }
    });

  }

  getAllRolesMethodCall() {
    this.dataService
      .getAllRoles(
        this.itemPerPage,
        this.pageNumberUser,
        'asc',
        'id',
        '',
        '',
        0
      )
      .subscribe(
        async (data) => {
          this.roles = data.object;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  fetchOnboardingModules(): void {
    this.dataService.getAllOnboardingModules().subscribe(
      (data) => {
        this.onboardingModules = data;
        this.dataService.getEnabledModuleIds()
      .subscribe((enabledIds: number[]) => {
        // Update the isFlag property of the modules based on the fetched enabled IDs
        this.onboardingModules.forEach(module => {
          module.isFlag = enabledIds.includes(module.id);
        });
      }, error => {
        console.error('Error fetching enabled modules:', error);
      });
      },
      (error) => {
        console.error('Error fetching onboarding modules:', error);
      }
    );
  }
  onModuleSelect(index: number) {
    // this.onboardingModules[index].isFlag = event.target.checked;
    this.onSave();
  }

  onSave() {

    const selectedModuleIds = this.onboardingModules
      .filter(module => module.isFlag)
      .map(module => module.id);


    this.dataService.saveSelectedModuleIds(selectedModuleIds)
      .subscribe(response => {
        console.log('Modules saved:', response);
      }, error => {
        console.error('Error saving modules:', error);
      });
  }
  // showErrorToast(){
  //   // module.isFlag = isFlag;  // Revert the change
  //   this.helperService.showToast(
  //     'You can not update the configuration . You have Read Only access !',
  //     Key.TOAST_STATUS_ERROR
  //   );
  // }

  isFileSelected = false;
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imagePreview: HTMLImageElement = document.getElementById(
          'imagePreview'
        ) as HTMLImageElement;
        imagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);

      this.uploadFile(file);
    } else {
      this.isFileSelected = false;
    }
  }

  uploadFile(file: File): void {
    debugger;
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            // console.log('File URL:', url);
            this.organizationPersonalInformationRequest.logo = url;
          });
        })
      )
      .subscribe();
  }

  isEditMode: boolean = false;

  enableEditMode(): void {
    this.isEditMode = true;
  }

  isUpdating: boolean = false;
  selectedFile: File | undefined = undefined;
  toggle = false;
  updateOrganizationPersonalInformationMethodCall() {
    debugger;
    this.isUpdating = true;
    this.isEditMode = false;
    this.dataService
      .updateOrganizationPersonalInformation(
        this.organizationPersonalInformationRequest
      )
      .subscribe(
        (response: OrganizationPersonalInformationRequest) => {
          // console.log(response);
          this.isUpdating = false;
          this.isEditMode = false;
          this.helperService.showToast(
            'Updated Successfully',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          this.helperService.showToast('Error', Key.TOAST_STATUS_ERROR);
          console.error(error);
        }
      );
  }

  companyLogoFileName: string = '';
  isLoading = true;
  getOrganizationDetailsMethodCall() {
    debugger;
    this.dataService.getOrganizationDetails().subscribe(
      (response: OrganizationPersonalInformationRequest) => {
        this.organizationPersonalInformationRequest = response;
        this.isLoading = false;
        this.setImageUrlFromDatabase(response.logo);
        this.companyLogoFileName = this.getFilenameFromUrl(response.logo);
        // console.log(this.organizationPersonalInformationRequest);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  dbImageUrl: string | null = null;
  setImageUrlFromDatabase(url: string) {
    this.dbImageUrl = url;
  }

  getFilenameFromUrl(url: string): string {
    if (!url) return '';

    const decodedUrl = decodeURIComponent(url);

    const parts = decodedUrl.split('/');

    const filenameWithQuery = parts.pop() || '';

    const filename = filenameWithQuery.split('?')[0];

    const cleanFilename = filename.replace(/^\d+_/, '');
    return cleanFilename;
  }

  isFormInvalid: boolean = false;

  @ViewChild('documentsInformationForm') documentsInformationForm!: NgForm;
  checkFormValidation() {
    debugger;
    if (this.documentsInformationForm.invalid) {
      this.isFormInvalid = true;
      return;
    } else {
      this.isFormInvalid = false;
      this.updateOrganizationPersonalInformationMethodCall();
    }
  }

  //  new to upload hr policies

  isEditModeHrPolicies: boolean = false;
  isUpdatingHrPolicies: boolean = false;
  isFileSelectedHrPolicies: boolean = false;
  selectedFileHrPolicies: File | null = null;

  onFileSelectedHrPolicies(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      this.selectedFileHrPolicies = file;
      this.isFileSelectedHrPolicies = true;

      this.uploadFileHrPolicies(file);
    } else {
      this.isFileSelectedHrPolicies = false;
    }
  }

  uploadFileHrPolicies(file: File): void {
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    this.isUpdatingHrPolicies = true;

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          // console.log('File URL:', url);
          this.savePolicyDocToDatabase(url);
          this.isUpdatingHrPolicies = false;
        });
      })
    ).subscribe();
  }

  isDocumentLoading: boolean = false;
  documents: EmployeeAdditionalDocument[] = [];
  doc: EmployeeAdditionalDocument = {
    documentType: constant.DOC_TYPE_HR_POLICY,
    name: 'HR Policy',
    value: 'HR Policy',
    url: '',
    fileName: ''
  };
  deleteDocument(documentId: number | undefined): void {
    this.dataService.deleteDocument(documentId)
      .subscribe(
        (response) => {
          console.log('Document deleted successfully:', response);
          this.fetchDocuments();
        },
        (error) => {
          console.error('Error deleting document:', error);
        }
      );
  }
  fetchDocuments(): void {
    this.dataService.getHrPolicies()
      .subscribe(
        (data) => {
          this.documents = data;
        },
        (error) => {
          console.error('Error fetching documents:', error);
        }
      );
  }

  isYouTubeVideo: boolean = false;
  toggleVideoSelection(event: Event): void {
    debugger
    const checkbox = event.target as HTMLInputElement;
    this.isYouTubeVideo = checkbox.checked;
    this.cdr.detectChanges();
  }

  getYouTubeEmbedUrl(url: string): string | null {
    if (!url) {
      return null;
    }

    const match = url.match(this.regex);

    if (match && match[1]) {
      const videoId = match[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return null; // Return null if the URL is invalid
  }

  handleFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.doc.fileName = target.files?.[0]?.name || '';
    this.selectedFile=target.files?.[0];
  }
  regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+?&v=)|youtu\.be\/)([a-zA-Z0-9_-]+)/;

  isInvalidUrl: boolean = false;
  onDocumentSubmit(): void {
    if(this.isYouTubeVideo){
      this.doc.url = this.doc.url.trim();
      this.doc.url = this.getYouTubeEmbedUrl(this.doc.url) || '';

      if(this.doc.url==undefined || !this.regex.test(this.doc.url)){
        this.helperService.showToast('Please enter a valid YouTube URL', Key.TOAST_STATUS_ERROR);
        this.isInvalidUrl=true;
        return;
      }
      this.savePolicyDocToDatabase(this.doc.url);
      return;
    }
    if (this.selectedFile) {
      this.isUpdatingHrPolicies=true;
      this.uploadFileHrPolicies(this.selectedFile);
    } else {
      console.error('No file selected!');
    }
  }
  savePolicyDocToDatabase(fileUrl: string): void {
    debugger
    this.doc.url=fileUrl;
    this.dataService.saveDocumentForUser('', this.doc).subscribe({
      next: (response) => {
        console.log('Document saved successfully:', response);
        this.helperService.showToast('Document saved successfully:',Key.TOAST_STATUS_SUCCESS);
        this.isUpdatingHrPolicies=false;
        this.doc = { documentType: constant.DOC_TYPE_HR_POLICY, name: 'HR Policy', value: 'HR Policy', url: '', fileName: '' };
        this.isYouTubeVideo = false;
        this.fetchDocuments();
        this.selectedFile=undefined;
        this.closeButtonHrPolicies.nativeElement.click();
      },
      error: (err) => {
        this.helperService.showToast('Some problem in saving Document',Key.TOAST_STATUS_ERROR);
        this.doc = { documentType: constant.DOC_TYPE_HR_POLICY, name: 'HR Policy', value: 'HR Policy', url: '', fileName: '' };
        this.isYouTubeVideo = false;
        this.closeButtonHrPolicies.nativeElement.click();
        this.isUpdatingHrPolicies=false;
        this.selectedFile=undefined;
      },
    });
  }

  onCancel(): void {
    this.doc = { documentType: constant.DOC_TYPE_HR_POLICY, name: 'HR Policy', value: 'HR Policy', url: '', fileName: '' };
    this.isYouTubeVideo = false;
    this.selectedFile=undefined;
    this.isInvalidUrl=false;
  }


  previewString: SafeResourceUrl | null = null;
  isPDF: boolean = false;
  isImage: boolean = false;

  @ViewChild('openDocModalButton') openDocModalButton!: ElementRef;
  getFileName(url: string): string {
    return url.split('/').pop() || 'Hr Policy Doc';
  }

  private updateFileType(url: string) {
    const extension = url.split('?')[0].split('.').pop()?.toLowerCase();
    // this.isImage2 = ['png', 'jpg', 'jpeg', 'gif'].includes(extension!);
    // this.isPDF = extension === 'pdf';
  }

  openViewModal(url: string): void {
    debugger
    // const fileExtension = url.split('.').pop()?.toLowerCase();
    const fileExtension = url.split('?')[0].split('.').pop()?.toLowerCase();
    // this.isPDF = fileExtension === 'pdf';
    if (fileExtension === 'doc' || fileExtension === 'docx') {
      // this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(`https://docs.google.com/gview?url=${url}&embedded=true`);
      this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`);
    } else {
      this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    this.openDocModalButton.nativeElement.click();
  }

  downloadFile(url: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = this.getFileName(url);
    link.click();
  }

  //  new code


  itemPerPage: number = 8;
  pageNumber: number = 1;
  lastPageNumber: number = 0;
  total!: number;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];
  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;
  totalUserCount: number = 0;
  getUserByFiltersMethodCall() {
    debugger;
    // this.staffs = [];
    this.dataService
      .getUsersByFilter(
        this.databaseHelper.itemPerPage,
        this.databaseHelper.currentPage,
        'asc',
        'id',
        this.searchText,
        '',
        this.selectedTeamId
      )
      .subscribe(
        (response) => {
          this.staffs = response.users.map((staff: Staff) => ({
            ...staff,
            selected: this.selectedStaffsUuids.includes(staff.uuid),
          }));
          if (this.selectedTeamId == 0 && this.searchText == '') {
            this.totalUserCount = response.count;
          }
          this.total = response.count;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
          this.pageNumber = Math.min(this.pageNumber, this.lastPageNumber);
          this.isAllSelected = this.staffs.every((staff) => staff.selected);

          // console.log(this.staffs);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  databaseHelper: DatabaseHelper = new DatabaseHelper();
     totalItems: number = 0;
     pageChanged(page: any) {
      debugger;
       if (page != this.databaseHelper.currentPage) {
         this.databaseHelper.currentPage = page;
         this.getUserByFiltersMethodCall();
       }
     }

     clearPage(){
      this.databaseHelper = new DatabaseHelper();
      this.searchText = ''
     }


  teamNameList: UserTeamDetailsReflection[] = [];

  teamId: number = 0;
  getTeamNames() {
    debugger;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.teamNameList = response.object;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
      },
    });
  }

  selectedTeamName: string = 'All';
  selectedTeamId: number = 0;
  selectTeam(teamId: number) {
    debugger;
    if (teamId === 0) {
      this.selectedTeamName = 'All';
    } else {
      const selectedTeam = this.teamNameList.find(
        (team) => team.teamId === teamId
      );
      this.selectedTeamName = selectedTeam ? selectedTeam.teamName : 'All';
    }
    this.itemPerPage = 10;
    this.selectedTeamId = teamId;
    this.getUserByFiltersMethodCall();
  }


  // ##### Pagination ############
  changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getUserByFiltersMethodCall();
  }



  getPages(): number[] {
    const totalPages = Math.ceil(this.total / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.itemPerPage);
  }
  getStartIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }
  getEndIndex(): number {
    const endIndex = this.pageNumber * this.itemPerPage;
    return endIndex > this.total ? this.total : endIndex;
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }


  checkIndividualSelection() {
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
  }

  isAllUsersSelected: boolean = false;

  selectAllUsers(event: any) {
    const isChecked = event.target.checked;
    this.isAllUsersSelected = isChecked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked));

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffsUuids list
      this.getAllUserUuidsMethodCall().then((allUuids) => {
        this.selectedStaffsUuids = allUuids;
      });
    } else {
      this.selectedStaffsUuids = [];
    }
  }


  updateSelectedStaffs() {
    this.staffs.forEach((staff) => {
      if (staff.selected && !this.selectedStaffsUuids.includes(staff.uuid)) {
        this.selectedStaffsUuids.push(staff.uuid);
      } else if (
        !staff.selected &&
        this.selectedStaffsUuids.includes(staff.uuid)
      ) {
        this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
          (uuid) => uuid !== staff.uuid
        );
      }
    });

  }


  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffsUuids based on the current page selection
    if (checked) {
      this.staffs.forEach((staff) => {
        if (!this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids.push(staff.uuid);
        }
      });
    } else {
      this.staffs.forEach((staff) => {
        if (this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
            (uuid) => uuid !== staff.uuid
          );
        }
      });
    }
  }

  onSelectAllUsersChange(event: any) {
    this.selectAllUsers(event.target.checked);
  }

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffsUuids = [];
  }

  clearSearchText() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }


  searchUsers() {
    this.databaseHelper.currentPage = 1;
    this.databaseHelper.itemPerPage = 10;
    this.getUserByFiltersMethodCall();
  }

// Fetching all the uuids of the users by organization
  allUserUuids: string[] = [];
  async getAllUserUuidsMethodCall() {
    return new Promise<string[]>((resolve, reject) => {
      this.dataService.getAllUserUuids().subscribe({
        next: (response) => {
          this.allUserUuids = response.listOfObject;
          resolve(this.allUserUuids);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  //  location



  resetAddressDetailsModal() {
    this.organizationAddressForm.resetForm();
    this.organizationAddressDetail = new OrganizationAddressDetail();
    this.isFormInvalid = false;
  }
  isAttendanceModeBackLoading: boolean = false;

  @ViewChild('placesRef') placesRef!: GooglePlaceDirective;

  public handleAddressChange(e: any) {
    debugger;

    var id = this.organizationAddressDetail.id;
    var branch = this.organizationAddressDetail.branch;
    var radius = this.organizationAddressDetail.radius;
    this.organizationAddressDetail = new OrganizationAddressDetail();
    this.organizationAddressDetail.id = id;
    this.organizationAddressDetail.branch = branch;
    this.organizationAddressDetail.radius = radius;
    this.organizationAddressDetail.longitude = e.geometry.location.lng();
    this.organizationAddressDetail.latitude = e.geometry.location.lat();
    this.isShowMap = true;
    // console.log(e.geometry.location.lat());
    // console.log(e.geometry.location.lng());
    this.organizationAddressDetail.addressLine1 = e.name + ', ' + e.vicinity;

    e?.address_components?.forEach((entry: any) => {
      // console.log(entry);

      if (entry.types?.[0] === 'route') {
        this.organizationAddressDetail.addressLine2 = entry.long_name + ',';
      }
      if (entry.types?.[0] === 'sublocality_level_1') {
        this.organizationAddressDetail.addressLine2 =
          this.organizationAddressDetail.addressLine2 + entry.long_name;
      }
      if (entry.types?.[0] === 'locality') {
        this.organizationAddressDetail.city = entry.long_name;
      }
      if (entry.types?.[0] === 'administrative_area_level_1') {
        this.organizationAddressDetail.state = entry.long_name;
      }
      if (entry.types?.[0] === 'country') {
        this.organizationAddressDetail.country = entry.long_name;
      }
      if (entry.types?.[0] === 'postal_code') {
        this.organizationAddressDetail.pincode = entry.long_name;
      }
    });
  }
  fetchCurrentLocationLoader: boolean = false;
  locationLoader: boolean = false;
  currentLocation() {
    debugger;
    this.isLatLongFieldOpen = false;
    this.locationLoader = true;
    this.fetchCurrentLocationLoader = true;
    this.getCurrentLocation()
      .then((coords) => {
        this.placesService
          .getLocationDetails(coords.latitude, coords.longitude)
          .then((details) => {
            this.locationLoader = false;
            var branch = this.organizationAddressDetail.branch;
            var radius = this.organizationAddressDetail.radius;
            this.organizationAddressDetail = new OrganizationAddressDetail();

            this.organizationAddressDetail.branch = branch;
            this.organizationAddressDetail.radius = radius;
            // this.organizationAddressDetail = new OrganizationAddressDetail();
            // this.organizationAddressDetail.id = id;
            this.organizationAddressDetail.longitude = coords.longitude;
            this.organizationAddressDetail.latitude = coords.latitude;

            // console.log('formatted_address:', details);
            this.organizationAddressDetail.addressLine1 =
              details.formatted_address;
            this.organizationAddressDetail.addressLine2 = '';
            if (details.address_components[1].types[0] === 'locality') {
              this.organizationAddressDetail.city =
                details.address_components[2].long_name;
            }
            if (
              details.address_components[4].types[0] ===
              'administrative_area_level_1'
            ) {
              this.organizationAddressDetail.state =
                details.address_components[4].long_name;
            }
            if (details.address_components[5].types[0] === 'country') {
              this.organizationAddressDetail.country =
                details.address_components[5].long_name;
            }
            if (details.address_components[6].types[0] === 'postal_code') {
              this.organizationAddressDetail.pincode =
                details.address_components[6].long_name;
            }
            this.fetchCurrentLocationLoader = false;
          })
          .catch((error) => {
            console.error(error);
            this.locationLoader = false;
            this.fetchCurrentLocationLoader = false;
          });
        // this.fetchCurrentLocationLoader = false;
      })
      .catch((error) => {
        console.error(error);
        this.locationLoader = false;
        this.fetchCurrentLocationLoader = false;
      });
    // this.fetchCurrentLocationLoader = false;
  }

  isFormInvalidLocation: boolean = false;
  isStaffSelectionDisabled: boolean = false;
  @ViewChild('organizationAddressForm') organizationAddressForm!: NgForm;

  checkFormValidationLocation() {
    debugger;
    if (this.organizationAddressForm.invalid ||
        !this.organizationAddressDetail.longitude ||
        !this.organizationAddressDetail.latitude ||
        !this.organizationAddressDetail.country || !this.organizationAddressDetail.branch) {
      this.isFormInvalidLocation = true;
      this.isStaffSelectionDisabled = true;
    } else {
      if(this.minRadius) {
        this.isFormInvalidLocation = true;
        this.isStaffSelectionDisabled = true;
      }else {
      this.isFormInvalidLocation = false;
      this.isStaffSelectionDisabled = false;
      }
    }
  }

  submit() {
    debugger;
    this.toggle = true;
    this.checkFormValidationLocation();

    if (this.isFormInvalidLocation) {
      this.toggle = false;
      return;
    }

    this.toggle = false;
    this.openStaffSelection();
  }


  openStaffSelection() {
    debugger
    // this.isStaffSelectionDisabled = false;
    this.staffSelectionTab.nativeElement.click();
 }

   organizationAddressDetail: OrganizationAddressDetail =
    new OrganizationAddressDetail();
  // @ViewChild('closeAddressModal') closeAddressModal!: ElementRef;
  // setOrganizationAddressDetailMethodCall() {
  //   this.dataService
  //     .setOrganizationAddressDetail(this.organizationAddressDetail)
  //     .subscribe(
  //       (response: OrganizationAddressDetail) => {
  //         setTimeout(() => {
  //           this.helperService.showToast(
  //             'Attedance Mode updated successfully',
  //             Key.TOAST_STATUS_SUCCESS
  //           );
  //         }, 1000);
  //       },
  //       (error) => {
  //         console.error(error);
  //       }
  //     );
  // }

  //  new code

  allAddresses: any;
  specificAddress: any;
  addressId: number = 0;

  staffAddressDetails: StaffAddressDetailsForMultiLocationRequest = new StaffAddressDetailsForMultiLocationRequest();
  loading: boolean = false;
  saveStaffAddressDetails(): void {

    this.staffAddressDetails.organizationMultiLocationAddressDTO = this.organizationAddressDetail;
    this.staffAddressDetails.userUuidsList = this.selectedStaffsUuids;
    this.loading = true;
    this.dataService.saveStaffAddressDetails(this.staffAddressDetails, this.addressId)
      .subscribe(response => {
        // console.log('Save Response:', response);
        setTimeout(() => {
            this.helperService.showToast(
              'Location saved successfully',
              Key.TOAST_STATUS_SUCCESS
            );
          }, 1000);
          this.loading = false;
          this.isRegisterLoad = false;
          this.isValidated = false;
        this.closeButtonLocation.nativeElement.click();
        this.getAllAddressDetails();
      }, (error) => {
        this.loading = false;
        this.isRegisterLoad = false;
      });
  }


  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  getAllAddressDetails(): void {
    debugger
    this.isShimmer = true;
    this.addressId = 0;
    this.dataService.getAllAddressDetailsWithStaff()
      .subscribe(response => {
        this.allAddresses = response.listOfObject;
        if (this.allAddresses.length == 0) {
          this.dataNotFoundPlaceholder = true;
        } else {
          this.dataNotFoundPlaceholder = false;
        }
        // console.log('All Addresses:', this.allAddresses);
        this.isShimmer = false;
      }, (error) => {
        this.networkConnectionErrorPlaceHolder = true;
        this.isShimmer = false;
      });
  }

  isDefaultAddressSelected: boolean = false;
  getAddressDetails(addressId: number, addressString: string,isDefaultAddressSelected:boolean=false): void {
    this.isDefaultAddressSelected=isDefaultAddressSelected;
    this.addressId = addressId;
    debugger
    this.selectedStaffsUuids = [];
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.dataService.getAddressDetailsOfStaffByAddressIdAndType(addressId, addressString)
      .subscribe(response => {
        this.specificAddress = response.object;
        this.organizationAddressDetail = this.specificAddress.organizationAddress;

        if (this.organizationAddressDetail.latitude == null) {
          this.currentLocation();
        } else {
          this.lat = Number(this.organizationAddressDetail.latitude);
          this.lng = Number(this.organizationAddressDetail.longitude);
          this.organizationAddressDetail.latitude = Number(this.organizationAddressDetail.latitude);
          this.organizationAddressDetail.longitude = Number(this.organizationAddressDetail.longitude);
          this.isShowMap = true;
        }

        if (this.specificAddress.staffListResponse.length > 0) {
          this.selectedStaffsUuids = this.specificAddress.staffListResponse.map((staff: any) => staff.uuid);
          this.getUserByFiltersMethodCall();
        }else {
          this.getUserByFiltersMethodCall();
        }
        // this.updateSelectedStaffs();
         if (this.specificAddress.staffListResponse.length == 1) {
          this.activeIndex = 0;
        }
        // console.log('Specific Address:', this.specificAddress);
      });
  }

  getUsersOfAddressDeatils(addressId: number, addressString: string,isDefaultAddressSelected:boolean=false): void {
    debugger
    this.isDefaultAddressSelected=isDefaultAddressSelected;
     this.organizationAddressDetail = new OrganizationAddressDetail();
    this.clearSearchText();
    this.teamId = 0;
    this.selectedTeamId = 0;
    this.selectedTeamName = 'All';
    this.selectedStaffsUuids = [];
    this.pageNumber = 1;

    this.getAddressDetails(addressId, addressString,isDefaultAddressSelected);
    this.staffSelectionTab.nativeElement.click();
  }

  openEditAddressTab(addressId: number, addressString: string,isDefaultAddressSelected:boolean=false) {
    this.isDefaultAddressSelected=isDefaultAddressSelected;
    if(this.locationSettingTab){
      this.locationSettingTab.nativeElement.click();

    }
    var staffLocation=document.getElementById("staffLocation");

    if(staffLocation){
      staffLocation.classList.add("show","active")
    }
    this.getAddressDetails(addressId, addressString,isDefaultAddressSelected);
  }


  activeIndex: number | null = null;

  toggleCollapse(index: number): void {
    if (this.activeIndex === index) {
      this.activeIndex = null;
    } else {
      this.activeIndex = index;
    }
  }

  @ViewChild('organizationAddressNgForm') organizationAddressNgForm!: NgForm;
  @ViewChild('staffLocation') staffLocation!: ElementRef;

  clearLocationModel() {
    this.staffLocation.nativeElement.click();
    this.locationSettingTab.nativeElement.click();
    var staffLocation=document.getElementById("staffLocation");

    if(staffLocation){
      staffLocation.classList.add("show","active")
    }
    this.organizationAddressDetail = new OrganizationAddressDetail();
    if (this.organizationAddressForm) {
      this.organizationAddressNgForm.resetForm();
    }
    this.addressId = 0;
    this.isFormInvalidLocation = false;
    // this.organizationAddressDetailForm.reset();
    // this.selectedShiftType = new ShiftType();
    // this.addressId = 0;
    this.isShowMap = false;
    this.clearSearchText();
    this.teamId = 0;
    this.selectedTeamId = 0;
    this.selectedTeamName = 'All';
    this.selectedStaffsUuids = [];
    this.pageNumber = 1;
  }

  @ViewChild('locationSettingTab') locationSettingTab!: ElementRef;
  @ViewChild('staffSelectionTab') staffSelectionTab!: ElementRef;
  // @ViewChild('staffselection') staffSelectionTab!: ElementRef;

  @ViewChild('closeButtonLocation') closeButtonLocation!: ElementRef;

  // openStaffSelection() {
  //    this.isStaffSelectionDisabled = false;
  //    this.staffSelectionTab.nativeElement.click();
  // }

   openLocationSetting() {
    this.locationSettingTab.nativeElement.click();
    var staffLocation=document.getElementById("staffLocation");

    if(staffLocation){
      staffLocation.classList.add("show","active")
    }
   }


  activeTab: string = 'companySetting'; // Default tab

  // Method to switch tabs
  switchTab(tabName: string) {
    this.activeTab = tabName;
  }

  // switchTab(tab: string): void {
  //   this.activeTab = tab;
  //   if (tab === 'locationSetting') {
  //     document.querySelector<HTMLButtonElement>('#home-tab')?.click();
  //   } else if (tab === 'companySetting') {
  //     document.querySelector<HTMLButtonElement>('#profile-tab')?.click();
  //   } else if (tab === 'onboardingSetting') {
  //     document.querySelector<HTMLButtonElement>('#onboardingSetting')?.click();
  //   }
  // }

  triggerFileInput() {
    const fileInput = document.getElementById('hrpolicies') as HTMLInputElement;
    fileInput.click();
  }




  radiusOptions: number[] = [50, 100, 200, 500]; // Available radius options
  selectedRadius: number | null = null; // Holds the selected radius or null
  errorMessage: string | null = null; // Error message for invalid input
  onRadiusChange(value: any) {
    // Ensure that the value is either a number or a string that can be converted to a number
    const radiusValue = typeof value === 'string' ? parseInt(value, 10) : value;

    // Validate the radius value
    if (isNaN(radiusValue) || radiusValue < 50) {
      this.errorMessage = 'Radius must be greater than or equal to 50 meters.';
      this.selectedRadius = null; // Reset selected value
    } else {
      this.errorMessage = null; // Clear any previous error
      this.selectedRadius = radiusValue; // Update selected value
    }
  }

  minRadius: boolean = false;
  radiusFilteredOptions: { label: string, value: string }[] = [];
  // onChange(value: string): void {
  //   const numericValue = Number(value);
  //   if (numericValue < 10) {
  //     this.minRadius = true;

  //   } else {
  //     this.minRadius = false;

  //   }
  //   // if (numericValue < 50) {
  //   //   this.minRadius = true;

  //   // } else {
  //   //   this.minRadius = false;

  //   // }
  //   this.radiusFilteredOptions = this.radius.filter((option) =>
  //     option.toLowerCase().includes(value.toLowerCase())
  //   ).map((option) => ({ label: `${option}-Meters`, value: option }));

  // }
  radius: string[] = ["50", "100", "200", "500", "1000"];


  onChange(value: string): void {
    const numericValue = parseInt(value, 10);

    // Check if the value is a valid number
    if (isNaN(numericValue) || numericValue < 10) {
      this.minRadius = true;
    } else {
      this.minRadius = numericValue < 10;
    }

    // Filter predefined options or add custom radius if not in options
    const options = this.radiusOptions
      .filter((option) => option.toString().includes(value))
      .map((option) => ({ label: `${option}-Meters`, value: option.toString() }));

    // Add custom option if greater than 10 and not in predefined options
    if (!this.radiusOptions.includes(numericValue) && numericValue > 10) {
      options.push({ label: `${numericValue}-Meters`, value: numericValue.toString() });
    }

    this.radiusFilteredOptions = options;
  }

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    // Prevent leading spaces
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  onFocus(): void {
    this.radiusFilteredOptions = this.radius.map((option) => ({
      label: `${option}-Meters`,
      value: option
    }));
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    // Check if the pressed key is not a digit (0-9) or is not a control key
    if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }

    // Optionally, restrict the maximum value if it exceeds 99000
    if (input.value.length >= 5 && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  onSelect(event: any): void {

    const selectedValue = event.nzValue;
    this.organizationAddressDetail.radius = selectedValue;
  }


  @ViewChild("closeButtonHrPolicies") closeButtonHrPolicies!:ElementRef;

  @ViewChild("closeButton") closeButton!:ElementRef;



  isValidated: boolean = false;
  checkValidation() {
    this.isValidated ? false : true;
  }




  closeModal() {
    this.isValidated = false;
  }

  @ViewChild("closeButton2") closeButton2!:ElementRef;
  isRegisterLoad : boolean = false;
  registerAddress() {
    debugger;
    this.isRegisterLoad = true;
    this.closeButton2.nativeElement.click();
    this.saveStaffAddressDetails();

    // setTimeout(() => {
    //   this.closeButton.nativeElement.click();
    // }, 300);
  }

  submitDefaultAddress() {
    this.toggle = true;
    this.organizationAddressDetail.branch = "Default";
    this.checkFormValidationLocation();

    if (this.isFormInvalidLocation) {
      this.toggle = false;
      return;
    } else {
    this.setOrganizationAddressDetailMethodCall();
    }
  }


  @ViewChild("closeButtonLocationDefaultAddress") closeButtonLocationDefaultAddress!: ElementRef;
  setOrganizationAddressDetailMethodCall() {
    debugger
    // this.clearLocationModel();
    this.toggle = true;
    this.dataService
      .setOrganizationAddressDetail(this.organizationAddressDetail)
      .subscribe(
        (response: OrganizationAddressDetail) => {
          this.toggle = false;

          this.getOrganizationAddressDetailMethodCall();

          this.getAllAddressDetails();
          // this.closeButtonLocationDefaultAddress.nativeElement.click();
          this.closeButtonLocation.nativeElement.click();
        },
        (error) => {
          console.error(error);
          this.toggle = false;
        }
      );
  }

  isShowMap: boolean = false;
  lat!: number;
  lng!: number;
  zoom: number = 15;
  markerPosition: any;

  getOrganizationAddressDetailMethodCall(isDefaultAddressSelected: boolean = false) {
    debugger
    this.isDefaultAddressSelected=isDefaultAddressSelected;
    if(this.locationSettingTab){
      this.locationSettingTab.nativeElement.click();

    }
    var staffLocation=document.getElementById("staffLocation");

    if(staffLocation){
      staffLocation.classList.add("show","active")
    }
    this.dataService.getOrganizationAddressDetail().subscribe(
      (response: OrganizationAddressDetail) => {
        if (response) {
          console.log(response);
          this.organizationAddressDetail = response;
          // console.log(this.organizationAddressDetail.latitude);
          if (this.organizationAddressDetail.latitude == null) {
            this.currentLocation();
          } else {
            this.lat = Number(this.organizationAddressDetail.latitude);
            this.lng = Number(this.organizationAddressDetail.longitude);
            this.organizationAddressDetail.latitude = Number(this.organizationAddressDetail.latitude);
            this.organizationAddressDetail.longitude = Number(this.organizationAddressDetail.longitude);
            this.isShowMap = true;

            if(+this.organizationAddressDetail.radius < 10) {
              this.minRadius = true;
            }else {
              this.minRadius = false;
            }
          }

        } else {
          console.log('No address details found');
        }
      },
      (error: any) => {
        console.error('Error fetching address details:', error);
      }
    );
  }

  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            this.isShowMap = true;
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            reject(err);
          },
          {
            enableHighAccuracy: true,  // Precise location
          maximumAge: 0              // Prevent cached locations
          }
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }

  mapCenter: { lat: number; lng: number } = { lat: this.lat, lng: this.lng };

  onMapClick(event: any) {
    this.organizationAddressDetail.latitude = event.coords.lat;
    this.organizationAddressDetail.longitude = event.coords.lng;
  }

  onMarkerDragEnd(event: any) {
    this.organizationAddressDetail.latitude = event.coords.lat;
    this.organizationAddressDetail.longitude = event.coords.lng;
    this.mapCenter = { lat: this.lat, lng: this.lng };
  }



  public handleAddressChanges(e: any) {
    //  console.log('ghdm',e);

    this.lat = e.geometry.location.lat();
    this.lng = e.geometry.location.lng();
    // this.getAddress(this.lat, this.lng);
  }


centerChanged(event: any) {
  // console.log(event);
  this.newLat=event.lat;
  this.newLng=event.lng;
}
newLat:any;
newLng:any

mapReady(map:any) {
  // console.log("map=======",map);
map.addListener("dragend", () => {
  this.lat=this.newLat;
  this.lng=this.newLng;
  // console.log("999999",this.lat, this.lng);
  //  this.getAddress(this.lat, this.lng);
  });
}


onZoomChange(event: number) {
  // console.log('Zoom level changed:', event);
  this.lat=this.newLat;
  this.lng=this.newLng;
  // this.getAddress(this.lat, this.lng);
}


getData(event:any){
  debugger
 console.log("event :" + event);

 var id = this.organizationAddressDetail.id;
 var branch = this.organizationAddressDetail.branch;
 var radius = this.organizationAddressDetail.radius;
 this.organizationAddressDetail = new OrganizationAddressDetail();
 this.organizationAddressDetail.id = id;
 this.organizationAddressDetail.branch = branch;
 this.organizationAddressDetail.radius = radius;
 this.organizationAddressDetail.longitude = event.longitude;
 this.organizationAddressDetail.latitude = event.latitude;
 this.organizationAddressDetail.addressLine1 = event.addressLine1
 this.organizationAddressDetail.addressLine2 = event.addressLine2;
 this.organizationAddressDetail.city = event.city;
 this.organizationAddressDetail.state = event.state;
 this.organizationAddressDetail.country = event.country;
 this.organizationAddressDetail.pincode = event.pincode;
//  this.organizationAddressDetail.longitude = event.organizationAddressDetail.longitude;
//  this.organizationAddressDetail.latitude = event.organizationAddressDetail.latitude;
//  this.organizationAddressDetail.addressLine1 = event.organizationAddressDetail.addressLine1
//  this.organizationAddressDetail.addressLine2 = event.organizationAddressDetail.addressLine2;
//  this.organizationAddressDetail.city = event.organizationAddressDetail.city;
//  this.organizationAddressDetail.state = event.organizationAddressDetail.state;
//  this.organizationAddressDetail.country = event.organizationAddressDetail.country;
//  this.organizationAddressDetail.pincode = event.organizationAddressDetail.pincode;

//  this.handleAddressChange(event);
//  this.getAddressFromCoords(event.lat, event.lng);
}

// geoCoder!: google.maps.Geocoder;
// getAddressFromCoords(lat: number, lng: number) {
//   this.geoCoder.geocode({ location: { lat, lng } }, (results, status) => {
//     if (status === 'OK' && results && results[0]) {
//       const details = results[0];
//       this.organizationAddressDetail = new OrganizationAddressDetail();
//       this.organizationAddressDetail.latitude = lat;
//       this.organizationAddressDetail.longitude = lng;
//       this.organizationAddressDetail.addressLine1 = details.formatted_address;

//       details.address_components.forEach((entry) => {
//         if (entry.types.includes('locality')) {
//           this.organizationAddressDetail.city = entry.long_name;
//         }
//         if (entry.types.includes('administrative_area_level_1')) {
//           this.organizationAddressDetail.state = entry.long_name;
//         }
//         if (entry.types.includes('country')) {
//           this.organizationAddressDetail.country = entry.long_name;
//         }
//         if (entry.types.includes('postal_code')) {
//           this.organizationAddressDetail.pincode = entry.long_name;
//         }
//       });

//       this.fetchCurrentLocationLoader = false;
//       this.locationLoader = false;
//     } else {
//       console.error('Geocoder failed due to: ' + status);
//       this.fetchCurrentLocationLoader = false;
//     }
//   });
// }

// geoCoder!: google.maps.Geocoder;
// getAddressFromCoords(lat: number, lng: number) {
//   debugger
//   this.dataService.getAddressFromLatLng(lat, lng).subscribe(
//     (response: any) => {
//       if (response.results && response.results.length > 0) {
//         // this.address = response.results[0].formatted_address;
//         this.organizationAddressDetail = new OrganizationAddressDetail();
//               this.organizationAddressDetail.latitude = lat;
//               this.organizationAddressDetail.longitude = lng;
//               this.organizationAddressDetail.addressLine1 = response.results[0].formatted_address;

//               response.results[0].address_components.forEach((entry: { types: string | string[]; long_name: string; }) => {
//                 if (entry.types.includes('locality')) {
//                   this.organizationAddressDetail.city = entry.long_name;
//                 }
//                 if (entry.types.includes('administrative_area_level_1')) {
//                   this.organizationAddressDetail.state = entry.long_name;
//                 }
//                 if (entry.types.includes('country')) {
//                   this.organizationAddressDetail.country = entry.long_name;
//                 }
//                 if (entry.types.includes('postal_code')) {
//                   this.organizationAddressDetail.pincode = entry.long_name;
//                 }
//               });
//       } else {
//         console.log('No address found');
//       }
//     },
//     (error: any) => {
//       console.error('Error fetching address:', error);
//     }
//   );
// }


isLatLongFieldOpen: boolean = false;
openLatLongField() {
  this.isLatLongFieldOpen = true;
}

getAddressFromCoords(lat: number, lng: number): void {
  debugger
  console.log("7898765678" , lat, lng);
  this.newLat= lat;
  this.newLng= lng;
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK && results && results[0] ) {
      this.handleAddressChange2(results[0]);
    } else {
      console.error('Geocode was not successful for the following reason: ' + status);
    }
  });
}


public handleAddressChange2(e: any) {
  console.log('ghdm',e);
debugger
 // this.lat = e.geometry.location.lat();
 // this.lng = e.geometry.location.lng();


 // this.organizationAddressDetail = new OrganizationAddressDetail();
 this.organizationAddressDetail.longitude = this.newLng;
 this.organizationAddressDetail.latitude = this.newLat;
 this.isShowMap = true;

 this.organizationAddressDetail.addressLine1 = e.formatted_address;

e?.address_components?.forEach((entry: any) => {
 // console.log(entry);

 if (entry.types?.[0] === 'route') {
   this.organizationAddressDetail.addressLine2 = entry.long_name + ',';
 }
 if (entry.types?.[0] === 'sublocality_level_1') {
   this.organizationAddressDetail.addressLine2 =
     this.organizationAddressDetail.addressLine2 + entry.long_name;
 }
 if (entry.types?.[0] === 'locality') {
   this.organizationAddressDetail.city = entry.long_name;
 }
 if (entry.types?.[0] === 'administrative_area_level_1') {
   this.organizationAddressDetail.state = entry.long_name;
 }
 if (entry.types?.[0] === 'country') {
   this.organizationAddressDetail.country = entry.long_name;
 }
 if (entry.types?.[0] === 'postal_code') {
   this.organizationAddressDetail.pincode = entry.long_name;
 }
});


 // this.setLatLng(this.organizationAddressDetail);
 // this.getAddress(this.lat, this.lng);
}


deleteAddressId: number = 0;
deleteToggle: boolean = false;
getAddressTemplateId(currentAddress: number) {
  this.deleteAddressId = currentAddress;
}


@ViewChild('closeButtonDeleteAddress') closeButtonDeleteAddress!: ElementRef;


deleteAddress(addressId: number) {
  this.deleteToggle = true;
  this.dataService.deleteByAddressId(addressId).subscribe(
    (response) => {
      console.log('Delete successful', response);

      this.deleteToggle = false;
      this.deleteAddressId = 0;
      this.closeButtonDeleteAddress.nativeElement.click();
     this.helperService.showToast(
            'Location deleted successfully',
            Key.TOAST_STATUS_SUCCESS
     );
       this.getAllAddressDetails();
    },
    (error) => {
      this.deleteToggle = false;
      console.error('Error deleting address', error);
    }
  );
}

onOrganizationAddressSubmit(){
  if(this.isDefaultAddressSelected){
    this.submitDefaultAddress();
}else{
  this.submit();
}
}

// notification setting

// notificationTypesList: any;

notifications: { [key: string]: any[] } | null = null;
notificationKeys: string[] = [];
selectedTime: Date = new Date(); // Default time

notificationTypes(): Promise<void> {
  debugger
  return new Promise((resolve) => {
    this.dataService.notificationTypes().subscribe(
      (response) => {
        // Assign the response object to the component
        this.notifications = response.object;

        // Extract keys for iteration
        this.notificationKeys = Object.keys(this.notifications ?? {}); // Default to empty object if null

        console.log("🚀 ~ CompanySettingComponent ~ returnnewPromise ~ this.notificationKeys:", this.notificationKeys)
        // Convert the 'minutes' string to a Date object for each notification
        this.notificationKeys.forEach(key => {
          if (this.notifications?.[key]) {

            // Check if the notification type is "Report"
            if (key === 'Report') {
              this.notifications[key].forEach((notification, index) => {
                if (index < 3) { // First three items
                  notification.isBefore = 0;
                  notification.isForced = 1;
                  notification.fixed = true;
                }
              });
            }


            this.notifications[key].forEach(notification => {

              if (notification.minutes) {
                notification.minutes = this.convertTimeStringToDate(notification.minutes);
              }
            });
          }
        });

        this.cdr.detectChanges();
        resolve(); // Resolve after successful execution
      },
      (error) => {
        console.log('Error retrieving notification types:', error);
        resolve(); // Ensure resolve even on error
      }
    );
  });
}



convertTimeStringToDate(timeString: string): Date {

  if (timeString == null || timeString == undefined || timeString=='0') {
     return this.convertTimeStringToDate('00:00');
  }

  const timeParts = timeString.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = 0;  // Default seconds to 0 if missing

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds);

  return date;
}

isAttendanceType(type: string): boolean {
  const attendanceTypes = ['Check in', 'Check Out', 'Break', 'Back', 'Report'];
  return attendanceTypes.includes(type);
}


// isSaveDisabled(notification: any): boolean {
//   debugger
//   return !(notification.isEditMode &&
//     (notification.isBefore === 0 || notification.isBefore === 1) &&
//     notification.minutes &&
//     (notification.isForced === 0 || notification.isForced === 1));
// }

isSaveDisabled(notification: any): boolean {
  debugger;

  console.log("Notification Object:", notification);

  // Check if minutes is a valid Date
  const isMinutesValid = notification.minutes instanceof Date && !isNaN(notification.minutes.getTime());
  // console.log("isMinutesValid:", isMinutesValid, "notification.minutes:", notification.minutes);

  // Check other conditions
  const isEditModeValid = notification.isEditMode;
  // console.log("isEditModeValid:", isEditModeValid);

  const isBeforeValid = notification.isBefore != null;
  // console.log("isBeforeValid:", isBeforeValid, "notification.isBefore:", notification.isBefore);

  const isForcedValid = notification.isForced != null;
  // console.log("isForcedValid:", isForcedValid, "notification.isForced:", notification.isForced);

  const result = !(isEditModeValid && isBeforeValid && isMinutesValid && isForcedValid);
  // console.log("Final Result (isSaveDisabled):", result);

  return result;
}





loadingFlags2: { [key: string]: { [index: number]: boolean } } = {}; // Track loading per notification


toggleNotification(notification: any, type: string, index: number): void {

  debugger
  // Initialize loadingFlags2[type] if not already defined
  if (!this.loadingFlags2[type]) {
    this.loadingFlags2[type] = {};
  }

  // Toggle edit mode for this notification
  notification.isEditMode = !notification.isEditMode;

  // If turning off edit mode (saving), you can perform a save action here
  if (!notification.isEditMode) {
    this.saveNotification(notification, type, index);
  }
}

saveNotification(notification: any, type: string, index: number): void {
  debugger
  let notificationData: NotificationTypeInfoRequest;

  // Ensure the loading flag object exists for the given type
  if (!this.loadingFlags2[type]) {
    this.loadingFlags2[type] = {};
  }
  this.loadingFlags2[type][index] = true; // Start loading
  this.cdr.detectChanges();

  if (type === 'Other') {
    notificationData = {
      id: 0,
      notificationTypeId: notification.notificationTypeId,
      minutes: '',
      sendReminderType: '',
      reminderType: '',
      status: notification.isEnable ? 'DISABLE' : 'ENABLE'
    };
  } else {
    notificationData = {
      id: notification.id ?? 0,
      notificationTypeId: notification.notificationTypeId,
      minutes: notification.minutes ? this.convertDateToTimeString(notification.minutes) : '',
      sendReminderType: notification.isBefore === 1 ?  'BEFORE' : 'AFTER',
      reminderType: notification.isForced === 1 ?  'FORCED' : 'FLEXIBLE',
      status: notification.isEnable ? 'ENABLE' : 'DISABLE'
    };
  }

  this.dataService.saveNotification(notificationData).subscribe(
    response => {
      console.log('Notification updated successfully', response);
      this.helperService.showToast(
        "Notification updated successfully",
        Key.TOAST_STATUS_SUCCESS
      );
      this.loadingFlags2[type][index] = false;
      // this.notificationTypes(); // Refresh notifications list
    },
    error => {
      console.error('Error updating notification', error);
      this.helperService.showToast(
        "Error updating notification",
        Key.TOAST_STATUS_ERROR
      );
      this.loadingFlags2[type][index] = false;
      this.notificationTypes();
    },
    () => {
      this.loadingFlags2[type][index] = false; // Stop loading
      // this.notificationTypes();
      // this.cdr.detectChanges();
    }
  );
}


convertDateToTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}


toggleNotificationValue(notification: any, field: string, operationFlag: boolean): void {

  // notification.isEditMode = true;

  // Toggle logic based on field
  // if (field === 'isEnable') {
  //   // Handle isEnable toggling
  //   notification.isEnable = notification.isEnable === 1 ? 0 : 1;
  // }
  // else if (field === 'isBefore') {
  //   // Handle isBefore toggling
  //   notification.isBefore = notification.isBefore === 1 ? 0 : 1;
  // }
  // else if (field === 'isForced') {
  //   // Handle isForced toggling (this is already handled by ngModel)
  //   notification.isForced = notification.isForced === 1 ? 0 : 1;
  // }
  if (field === 'isEnable') {
    // Handle isEnable toggling
    notification.isEnable = operationFlag;
  }
  else if (field === 'isBefore') {
    // Handle isBefore toggling
    notification.isBefore = operationFlag;
  }
  else if (field === 'isForced') {
    // Handle isForced toggling (this is already handled by ngModel)
    notification.isForced = operationFlag;
  }

}


// shouldShowSwitch(type: string): boolean {
//   return this.notifications?.[type]?.some(notification => notification.isEnable === 1) ?? false;
// }

isSwitchEnabled: { [key: string]: boolean } = {};
loadingFlags: { [key: string]: boolean } = {};
currentType: string | null = null;
disableConfirmed: boolean = false; // Track if user confirmed disable
switchValueString : string = '';
index : number = 0;
notification : any;

// This function is used to return the value of the switch's state for a specific type
shouldShowSwitch(type: string, cancelDisableFlag : boolean): boolean {
  // debugger
  // console.log("🚀 ~ CompanySettingComponent ~ shouldShowSwitch ~ cancelDisableFlag:", cancelDisableFlag)

  if(cancelDisableFlag) {
    return true;
  }
  // Check if the switch is manually enabled or if any notification for the type is enabled
  return this.isSwitchEnabled[type] ?? this.notifications?.[type]?.some(notification => notification.isEnable === 1) ?? false;
}

onSwitchToggle(event: boolean, type: string, switchValue: string): void {
  // debugger
  console.log("event :", event);
  if (!event) {
    // User is trying to disable, show confirmation modal
    this.currentType = type;
    this.switchValueString = switchValue;
    this.disableConfirmed = false; // Reset confirmation state

    setTimeout(() => {
      const modal = document.getElementById('disableConfirmationModal');
      if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
      }
    });
  } else {
    // Enabling directly, update state
    this.isSwitchEnabled[type] = true;
    // this.updateNotificationState(type, true);
  }
}


onToggle(event: boolean, notification: any, type: string, index: number, switchValue: string): void {
  debugger
  console.log("event :" , event , "notification" , notification , "type" , type , "index" , index, "switchValue" , switchValue);
  if (!event) {
    // User is trying to disable, show confirmation modal
    this.currentType = type;
    this.switchValueString = switchValue;
    this.index = index;
    this.notification = notification;
    this.disableConfirmed = false;

    setTimeout(() => {
      const modal = document.getElementById('disableConfirmationModal');
      if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
      }
    });
  } else {

    if(String(switchValue).trim() == 'SHIFT_SWITCH') {
      this.isSwitchEnabled[type] = true;
    }else if (String(switchValue).trim() == 'SHIFT_CHECKBOX' && type) {
      notification.isEditMode = true
      notification.isEnable = true;
      this.toggleNotificationValue(notification, 'isEnable', true);
      // notification.isEnable = notification.isEnable === 1 ? 0 : 1;
      // this.saveNotification(notification, type, index);
    }else if (String(switchValue).trim() == 'OTHER_SWITCH' && type == 'Other') {
      notification.isEnable = !event;
      this.saveNotification(notification, type, index);
      notification.isEnable = event;
    }

  }
}


cancelDisable(): void {
  debugger
  if (this.currentType) {
    // this.isSwitchEnabled[this.currentType] = true;
    // this.shouldShowSwitch(this.currentType, true);
    // this.notificationTypes();
    if(String(this.switchValueString).trim() === 'SHIFT_SWITCH' && this.currentType) {
      this.isSwitchEnabled[this.currentType] = true;
      this.shouldShowSwitch(this.currentType, true);
      // this.updateNotificationState(this.currentType);
      this.currentType = '';
      this.switchValueString = '';
      this.index = 0;
      this.notification = null;
   }else if (String(this.switchValueString).trim() === 'SHIFT_CHECKBOX' && this.currentType) {
    this.notification.isEnable = true;
    // if( this.notification.id != null && this.notification.id > 0) {
    //    this.saveNotification(this.notification, this.currentType, this.index);
    // }
      this.currentType = '';
      this.switchValueString = '';
      // this.index = 0;
      // this.notification = null;
   }else if (String(this.switchValueString).trim() === 'OTHER_SWITCH' && this.currentType) {
    this.notification.isEnable = true;
    // this.notification.isEnable = this.notification.isEnable === 1 ? 1 : 0;
    // if(this.notification.id != null && this.notification.id > 0) {
    //    this.saveNotification(this.notification, this.currentType, this.index);
    // }
     this.notification.isEnable = true;
     this.currentType = '';
     this.switchValueString = '';
    //  this.index = 0;
    //  this.notification = null;
   }
  }
  this.closeDisableModal();
}

confirmDisable(): void {
  debugger
  if (this.currentType) {
    this.handleDisableCases();
  }
  this.closeDisableModal();
}


handleDisableCases() {
  if(String(this.switchValueString).trim() === 'SHIFT_SWITCH' && this.currentType) {
     this.updateNotificationState(this.currentType);
     this.currentType = '';
     this.switchValueString = '';
     this.index = 0;
     this.notification = null;
  }else if (String(this.switchValueString).trim() === 'SHIFT_CHECKBOX' && this.currentType) {
    this.notification.isEnable = false;
    // this.notification.isEnable = this.notification.isEnable === 1 ? 0 : 1;
     if(this.notification.id > 0) {
     this.saveNotification(this.notification, this.currentType, this.index);
     }
     this.currentType = '';
     this.switchValueString = '';
    //  this.index = 0;
    //  this.notification = null;
  }else if (String(this.switchValueString).trim() === 'OTHER_SWITCH' && this.currentType === 'Other') {
    this.notification.isEnable = true;
    this.saveNotification(this.notification, this.currentType, this.index);
    this.notification.isEnable = false;
    this.currentType = '';
    this.switchValueString = '';
    // this.index = 0;
    // this.notification = null;
  }
}

updateNotificationState(type: string): void {
  this.loadingFlags[type] = true;
  this.cdr.detectChanges();

  // Call API to save state
  this.dataService.disableNotification(type).subscribe(
    () => {
      // console.log(`Notification ${isEnabled ? 'enabled' : 'disabled'} successfully.`);
      this.loadingFlags[type] = false;
      this.cdr.detectChanges();
    },
    error => {
      console.error('Error updating notification state:', error);
      this.loadingFlags[type] = false;
      this.cdr.detectChanges();
    }
  );
}

closeDisableModal(): void {
  debugger
  const modal = document.getElementById('disableConfirmationModal');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  }
}



handleSwitchDisable(type: string): Promise<void> {
  return new Promise((resolve) => {
    this.dataService.disableNotification(type).subscribe(
      response => {
        console.log('Notification updated successfully', response);
        this.notificationTypes();
        resolve();
      },
      error => {
        console.error('Error updating notification', error);
        this.notificationTypes();
        resolve();
      }
    );
  });
}


 masterAttendanceModeId: number = 0;
  getMasterAttendanceModeMethodCall() {
    debugger;
    this.dataService.getMasterAttendanceMode().subscribe(
      (response: any) => {
        debugger;
        if (response.status) {
          this.masterAttendanceModeId = response.object;
        }
        console.log(this.masterAttendanceModeId);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  //  new

  staffCount(staff:any){
    if(staff  == null){
      return 0;
    }else{
      return staff.length;
    }
  }


}












