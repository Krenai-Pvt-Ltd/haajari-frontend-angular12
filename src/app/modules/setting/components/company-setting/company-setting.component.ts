import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
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

@Component({
  selector: 'app-company-setting',
  templateUrl: './company-setting.component.html',
  styleUrls: ['./company-setting.component.css'],
})
export class CompanySettingComponent implements OnInit {
  organizationPersonalInformationRequest: OrganizationPersonalInformationRequest =
    new OrganizationPersonalInformationRequest();

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

  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            reject(err);
          }
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }

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
      }
    }
    // this.isStaffSelectionDisabled = !this.isFormInvalidLocation;
  }

  submit() {
    debugger;
    this.checkFormValidationLocation();

    if (this.isFormInvalidLocation == true) {
       this.isStaffSelectionDisabled = true;
      return;
    } else {
      this.openStaffSelection();
    }
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

  saveStaffAddressDetails(): void {

    this.staffAddressDetails.organizationMultiLocationAddressDTO = this.organizationAddressDetail; 
    this.staffAddressDetails.userUuidsList = this.selectedStaffsUuids;

    this.dataService.saveStaffAddressDetails(this.staffAddressDetails, this.addressId)
      .subscribe(response => {
        // console.log('Save Response:', response);
        setTimeout(() => {
            this.helperService.showToast(
              'Location saved successfully',
              Key.TOAST_STATUS_SUCCESS
            );
          }, 1000);
        this.closeButtonLocation.nativeElement.click();
        this.getAllAddressDetails();
      });
  }
 

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  getAllAddressDetails(): void {
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
    this.dataService.getAddressDetailsOfStaffByAddressIdAndType(addressId, addressString)
      .subscribe(response => {
        this.specificAddress = response.object;
        this.organizationAddressDetail = this.specificAddress.organizationAddress;
        if (this.specificAddress.staffListResponse.length > 0) {
          this.selectedStaffsUuids = this.specificAddress.staffListResponse.map((staff: any) => staff.uuid);
        }
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
    this.staffSelectionTab.nativeElement.click();
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


  clearLocationModel() {
    this.locationSettingTab.nativeElement.click();
    this.organizationAddressDetail = new OrganizationAddressDetail();
    // this.selectedShiftType = new ShiftType();
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

  openStaffSelection() {
     this.isStaffSelectionDisabled = false;
    this.staffSelectionTab.nativeElement.click();
  }

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

  triggerFileInput() {
    const fileInput = document.getElementById('hrpolicies') as HTMLInputElement;
    fileInput.click(); 
}
}










