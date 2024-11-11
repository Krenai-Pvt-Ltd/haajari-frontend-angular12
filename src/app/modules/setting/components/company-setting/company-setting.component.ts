import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormGroup, NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { async } from 'rxjs';
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
  constructor(
    private dataService: DataService,
    private afStorage: AngularFireStorage,
    private helperService: HelperService,
    private sanitizer: DomSanitizer,
    private placesService: PlacesService
  ) { }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getOrganizationDetailsMethodCall();
    this.getHrPolicy();
    this.getTeamNames();
    this.getUserByFiltersMethodCall();
    this.getAllAddressDetails();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
    this.getAllRolesMethodCall();
    this.fetchOnboardingModules();
    this.dataService.getEnabledModuleIds()
      .subscribe((enabledIds: number[]) => {
        // Update the isFlag property of the modules based on the fetched enabled IDs
        this.onboardingModules.forEach(module => {
          module.isFlag = enabledIds.includes(module.id);
        });
      }, error => {
        console.error('Error fetching enabled modules:', error);
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
  selectedFile: File | null = null;
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

  savePolicyDocToDatabase(fileUrl: string): void {
    debugger
    this.dataService.saveOrganizationHrPolicies(fileUrl).subscribe(response => {
      // console.log('File URL saved to database:', response.message);
      this.helperService.showToast(
        'Doc Uploaded Successfully',
        Key.TOAST_STATUS_SUCCESS
      );
      this.getHrPolicy();
    }, (error) => {
      console.log(error);
    });
  }

  fileUrl!: string;
  docsUploadedDate: any;
  getHrPolicy(): void {
    this.dataService.getOrganizationHrPolicies().subscribe(response => {
      this.fileUrl = response.object.hrPolicyDoc;
      this.docsUploadedDate = response.object.docsUploadedDate;
      // console.log('policy retrieved successfully', response.object);
    }, (error) => {
      console.log(error);
    });
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
        this.itemPerPage,
        this.pageNumber,
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
    this.getOrganizationUserNameWithBranchNameData(this.addressId, "");
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
    this.getOrganizationUserNameWithBranchNameData(this.addressId, "");
  }

  onSelectAllUsersChange(event: any) {
    this.selectAllUsers(event.target.checked);
  }

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffsUuids = [];
    this.getOrganizationUserNameWithBranchNameData(this.addressId, "");
  }

  clearSearchText() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }


  searchUsers() {
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
    this.organizationAddressDetail = new OrganizationAddressDetail();
    this.organizationAddressDetail.id = id;
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
    this.locationLoader = true;
    this.fetchCurrentLocationLoader = true;
    this.getCurrentLocation()
      .then((coords) => {
        this.placesService
          .getLocationDetails(coords.latitude, coords.longitude)
          .then((details) => {
            this.locationLoader = false;
            this.organizationAddressDetail = new OrganizationAddressDetail();
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
            this.fetchCurrentLocationLoader = false;
          });
        // this.fetchCurrentLocationLoader = false;
      })
      .catch((error) => {
        console.error(error);
        this.fetchCurrentLocationLoader = false;
      });
    // this.fetchCurrentLocationLoader = false;
  }

  // getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  //   return new Promise((resolve, reject) => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           resolve({
  //             latitude: position.coords.latitude,
  //             longitude: position.coords.longitude,
  //           });
  //         },
  //         (err) => {
  //           reject(err);
  //         }
  //       );
  //     } else {
  //       reject('Geolocation is not supported by this browser.');
  //     }
  //   });
  // }

  isFormInvalidLocation: boolean = false;
  isStaffSelectionDisabled: boolean = true;
  @ViewChild('organizationAddressForm') organizationAddressForm!: NgForm;
  checkFormValidationLocation() {
    debugger
    if (
      this.organizationAddressForm.invalid ||
      !this.organizationAddressDetail.longitude ||
      !this.organizationAddressDetail.latitude
    ) {
      this.isFormInvalidLocation = true;
      return;
    } else {
      if (!this.organizationAddressDetail.country) {
        this.isFormInvalidLocation = true;
      } else {
        this.isFormInvalidLocation = false;
        // this.isStaffSelectionDisabled = false;
      }
    }
    // this.isStaffSelectionDisabled = !this.isFormInvalidLocation;
  }

  submit() {
    debugger;
    this.toggle = true;
    this.checkFormValidationLocation();

    if (this.isFormInvalidLocation == true) {
       this.isStaffSelectionDisabled = true;
       this.toggle = false;
      return;
    } else {
      this.toggle = false;
      // this.selectAll(true);
      
      this.getOrganizationUserNameWithBranchNameData(this.addressId, "");
      this.openStaffSelection();
      // this.getUserByFiltersMethodCall();
    }
  }


  openStaffSelection() {
    this.isStaffSelectionDisabled = false;
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

  getAddressDetails(addressId: number, addressString: string): void {
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
        }
        // this.updateSelectedStaffs();
         if (this.specificAddress.staffListResponse.length == 1) {
          this.activeIndex = 0;
        }
        // console.log('Specific Address:', this.specificAddress);
      });
  }

  getUsersOfAddressDeatils(addressId: number, addressString: string) {
     this.organizationAddressDetail = new OrganizationAddressDetail();
    this.clearSearchText();
    this.teamId = 0;
    this.selectedTeamId = 0;
    this.selectedTeamName = 'All';
    this.selectedStaffsUuids = [];
    this.pageNumber = 1;
   
    this.getAddressDetails(addressId, addressString);
    this.staffSelectionTab.nativeElement.click();
  }

  openEditAddressTab(addressId: number, addressString: string) {
    this.locationSettingTab.nativeElement.click();
    this.getAddressDetails(addressId, addressString);
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
  clearLocationModel() {
    this.locationSettingTab.nativeElement.click();
    this.organizationAddressDetail = new OrganizationAddressDetail();
    if (this.organizationAddressForm) {
      this.organizationAddressNgForm.resetForm();
    }
    this.addressId = 0;
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
  @ViewChild('closeButtonLocation') closeButtonLocation!: ElementRef;

  // openStaffSelection() {
  //    this.isStaffSelectionDisabled = false;
  //    this.staffSelectionTab.nativeElement.click();
  // }

   openLocationSetting() {
    this.locationSettingTab.nativeElement.click();
   }

  deleteAddress(addressId: number) {
    this.dataService.deleteByAddressId(addressId).subscribe(
      (response) => {
        console.log('Delete successful', response);
       this.helperService.showToast(
              'Location deleted successfully',
              Key.TOAST_STATUS_SUCCESS
       );
         this.getAllAddressDetails();
      },
      (error) => {
        console.error('Error deleting address', error);
      }
    );
  }

  activeTab: string = 'companySetting'; // Default tab

  // Method to switch tabs
  switchTab(tabName: string) {
    this.activeTab = tabName;
  }
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
  onChange(value: string): void {
    const numericValue = Number(value);
    if (numericValue < 10) {
      this.minRadius = true;

    } else {
      this.minRadius = false;

    }
    // if (numericValue < 50) {
    //   this.minRadius = true;

    // } else {
    //   this.minRadius = false;

    // }
    this.radiusFilteredOptions = this.radius.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    ).map((option) => ({ label: `${option}-Meters`, value: option }));

  }
  radius: string[] = ["50", "100", "200", "500", "1000"];

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


  @ViewChild("closeButton") closeButton!:ElementRef;

  userNameWithBranchName: any;
  getOrganizationUserNameWithBranchNameData(addressId : number, type:string) {
    this.dataService.getOrganizationUserNameWithBranchName(this.selectedStaffsUuids, addressId).subscribe(
      (response) => {
        this.userNameWithBranchName = response.listOfObject;
        if( this.userNameWithBranchName.length <1 && type == "SHIFT_USER_EDIT") {
          this.isAllSelected = false;
          this.isAllUsersSelected = false;
          this.closeButton.nativeElement.click();
        }
      },
      (error) => {
        console.log('error');
      }
    );
  }


  isValidated: boolean = false;
  checkValidation() {
    this.isValidated ? false : true;
  }


  removeUser(uuid: string) {
    this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
      (id) => id !== uuid
    );
    this.staffs.forEach((staff) => {
      staff.selected = this.selectedStaffsUuids.includes(staff.uuid);
    });

    this.isAllSelected = false;
    // if(this.selectedStaffsUuids.length <1) {
      // this.unselectAllUsers();
    // }
    // this.updateSelectedStaffs();
    this.userNameWithBranchName = [];
    this.getOrganizationUserNameWithBranchNameData(this.addressId, "SHIFT_USER_EDIT");
    // this.getUserByFiltersMethodCall();
    
  }


  closeModal() {
    this.isValidated = false;
    this.getOrganizationUserNameWithBranchNameData(this.addressId, "");
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
    this.setOrganizationAddressDetailMethodCall();
  }


  @ViewChild("closeButtonLocationDefaultAddress") closeButtonLocationDefaultAddress!: ElementRef;
  setOrganizationAddressDetailMethodCall() {
    debugger
    this.toggle = true;
    this.dataService
      .setOrganizationAddressDetail(this.organizationAddressDetail)
      .subscribe(
        (response: OrganizationAddressDetail) => {
          this.toggle = false;
           
          this.getOrganizationAddressDetailMethodCall();
          this.getAllAddressDetails();
          this.closeButtonLocationDefaultAddress.nativeElement.click();
          
        },
        (error) => {
          console.error(error);
        }
      );
  }

  isShowMap: boolean = false;
  lat!: number;
  lng!: number;
  zoom: number = 15; 
  markerPosition: any;

  getOrganizationAddressDetailMethodCall() {
    debugger;
    this.dataService.getOrganizationAddressDetail().subscribe(
      (response: OrganizationAddressDetail) => {
        if (response) {
          // console.log(response);
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


}












