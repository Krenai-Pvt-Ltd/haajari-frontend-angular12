import { Component, ElementRef, OnInit, QueryList, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { Staff } from 'src/app/models/staff';
import { OrganizationAddressWithStaff } from 'src/app/payroll-models/OrganizationAddressWithStaff';
import { OrganizationUserLocation } from 'src/app/payroll-models/OrganizationUserLocation';
import { PayrollTodoStep } from 'src/app/payroll-models/PayrollTodoStep';
import { Profile } from 'src/app/payroll-models/Profile';
import { StaffAddressDetailsForMultiLocation } from 'src/app/payroll-models/StaffAddressDetailMultiLocation';
import { State } from 'src/app/payroll-models/State';
import { UserWithBranchName } from 'src/app/payroll-models/UserWithBranchName';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  imageChangedEvent: any = null;
  base64: string | null = null;
  isUploading: boolean = false;
  isFileSelected: boolean = false;


  readonly constant = constant;

  fetchLocationModal: any;
  addressId: number = 0;
  filteredStateList: State[] | undefined;

  constructor(
    private _payrollConfigurationService: PayrollConfigurationService,
    private dataService: DataService,
    private _helperService: HelperService,
    private afStorage: AngularFireStorage,
    private _router: Router
  ) {

  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getProfile();
    this.getOrganizationWorkAdddress();
    this.fetchExistingAddress();
    this.getStateList();
  }

  selectedLocation: string = 'India';
  selectedCurrency: string = 'INR';
  stateCurrency = [{ code: 'INR', name: 'INR', symbol: '₹' }];
  stateList: State[] = new Array();
  getStateList() {
    this._payrollConfigurationService.getState().subscribe(
      (response) => {
        if (response.status) {
          this.stateList = response.object;
          if (this.stateList == null) {
            this.stateList = new Array();
          }
        }
      },
      (error) => {}
    );
  }

  selectedFile: File | null = null;
  // ################# Profile #######################

  formattedDate: string = '';

  dateFormats = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  ];

  onDateFormatChange(format: string) {
    this.profile.dateFormat = format;
    const now = new Date();
    this.formattedDate = this.formatDate(now, format);
    console.log('Selected Date Format:', this.formattedDate);
  }

  formatDate(date: Date, format: string): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    switch (format) {
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  }

  profile: Profile = new Profile();
  getProfile() {
    this._payrollConfigurationService.getOrganizationProfile().subscribe(
      (response) => {
        if (response.status) {
          this.profile = response.object;
          if (this.profile == null) {
            this.profile = new Profile();
          }
          const now = new Date();
          this.profile.dateFormat = this.dateFormats[0].value;
          this.formattedDate = this.formatDate(now, this.profile.dateFormat);
          this.profile.currency = this.profile.currency
            ? this.profile.currency
            : 'INR';
        }
      },
      (error) => {}
    );
  }

    @ViewChild('profileForm') profileForm!:NgForm;
      formReset(){
        window.scroll(0,0);
        this.profileForm.form.markAsPristine();
        this.profileForm.form.markAsUntouched();
      }

  saveLoader: boolean = false;
  saveOrganizationProfile() {
    this.saveLoader = true;
    this._payrollConfigurationService.saveOrganizationProfile(this.profile).subscribe((response) => {
          if (response.status) {
            this.formReset();
            this._helperService.showToast('Your Organiization Profile has been saved.',Key.TOAST_STATUS_SUCCESS);
          } else {
            this._helperService.showToast('Error saving your profile.',Key.TOAST_STATUS_ERROR);
          }
          this.saveLoader = false;
        },
        (error) => {
          this.saveLoader = false;
          this._helperService.showToast('Error saving your profile.',Key.TOAST_STATUS_ERROR);
        }
      );
  }

  uploadFile(file: File): void {
    const filePath = 'logo' + new Date().getTime() + file.name;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.profile.logo = url;
            this.isUploading = false;
          });
        })
      )
      .subscribe();
  }


  fileChangeEvent(event: any): void {
    if (event.target.files.length > 0) {
      this.imageChangedEvent = event;
    }
  }

  imageCropped(event: any): void {
    this.base64 = event.base64;
    this.uploadCroppedImage();
  }

  uploadCroppedImage(): void {
    if (!this.base64) {
      return;
    }

    this.isUploading = true;

    const blob = this.dataURItoBlob(this.base64);
    const fileName = 'cropped_' + new Date().getTime() + '.png';
    const file = new File([blob], fileName, { type: 'image/png' });

    const filePath = 'logo/' + fileName;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.profile.logo = url;
            this.isUploading = false;
            this.profileForm.form.markAsDirty();
          });
        })
      )
      .subscribe();
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  }

  toDoStepList: PayrollTodoStep[] = new Array();
  getTodoList() {
    this._payrollConfigurationService.getTodoList().subscribe(
      (response) => {
        if (response.status) {
          this.toDoStepList = response.object;
          this.checkAllCompleted();
        }
      },
      (error) => {}
    );
  }
  checkAllCompleted(): boolean {
    return this.toDoStepList.every((step) => step.completed);
  }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       WORK-LOCATION                                                                          // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
  organizationAddress: OrganizationAddressWithStaff[] = new Array();
  getOrganizationWorkAdddress() {
    this._payrollConfigurationService.getOrganizationAddress().subscribe(
      (response) => {
        if (response.status) {
          this.organizationAddress = response.object;
          if (this.organizationAddress == null) {
            this.organizationAddress = [];
          }
        }
      },
      (error) => {}
    );
  }

  fetchAddresses: OrganizationAddressWithStaff[] = new Array();
  fetchExistingAddress(){
    this.dataService.getAllAddressDetailsWithStaff() .subscribe(response => {
        if (response.status){
          this.fetchAddresses = response.listOfObject;
          if (this.fetchAddresses == null) {
            this.fetchAddresses = [];
          }
        }else{
          this.fetchAddresses = [];
        }
      }, (error) => {
        
     });
  }

selectedAddressIndexes: number[] = [];
selected: boolean = false;

onAddressSelect(index: number, event: any) {
  if (event.target.checked) {
    if (!this.selectedAddressIndexes.includes(index)) {
      this.selectedAddressIndexes.push(index);
      this.selected = true;  
    }
  } else {
    this.selectedAddressIndexes = this.selectedAddressIndexes.filter(
      (i) => i !== index
    );
    this.selected = this.selectedAddressIndexes.length > 0;
  }
}


  selectUsers: number = 0;
  mapUsers(event: any) {
    this.selectUsers = event ? 1 : 0;
  }

  @ViewChild('closeFetchModal') closeFetchModal!: ElementRef;
  @ViewChild('addressCheckbox') addressCheckbox!: QueryList<ElementRef>; 

  saveFetchedAddressStaff() {
    this.saveLoader = true;
    let selectedAddresses = [];
    if (this.fetchAddresses.length == 1) {
      selectedAddresses = [this.fetchAddresses[0].organizationAddress.id];
    } else {
      selectedAddresses = this.selectedAddressIndexes.map(
        (index) => this.fetchAddresses[index].organizationAddress.id
      );
    }
    this._payrollConfigurationService
      .saveFetchedAddressStaff(selectedAddresses, this.selectUsers)
      .subscribe(
        (response) => {
          if (response.status) {
            this.getOrganizationWorkAdddress();
            this.closeFetchModal.nativeElement.click();
            this._helperService.showToast('User Location updated successsfully.',Key.TOAST_STATUS_SUCCESS);
          } else {
            this._helperService.showToast('Error updating.',Key.TOAST_STATUS_ERROR);
          }
          this.saveLoader = false;
        },
        (error) => {
          this.saveLoader = false;
          this._helperService.showToast('Error updating.',Key.TOAST_STATUS_ERROR);
        }
      );
  }


  fetchUserList() {
    this.getUserByFiltersMethodCall();
  }

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
  selectedTeamId: number = 0;
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  getUserByFiltersMethodCall() {
    debugger;
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
        },
        (error) => {
          console.error(error);
        }
      );
  }

  @ViewChild('addLocation') addLocation!: ElementRef;
  openLocationModal() {
    this.fetchUserList();
    this.organizationUserLocation = new OrganizationUserLocation();
    this.selectedStaffsUuids = [];
    this.selectedStaffs = [];
    this.addLocation.nativeElement.click();
    setTimeout(() => {
      if (this.locationSettingTab) {
        this.locationSettingTab.nativeElement.click();
      }
    }, 100);
  }

  

  @ViewChild('closeAddressModal') closeAddressModal!: ElementRef;
  isRegisterLoad: boolean = false;
  isForceUpdate: boolean = false;
  organizationUserLocation: OrganizationUserLocation =
    new OrganizationUserLocation();
  saveUserWorkLocation() {
    this.saveLoader = true;
    this.getSelectedStaffUUIDs();

    let request: StaffAddressDetailsForMultiLocation =
      new StaffAddressDetailsForMultiLocation();
    request.organizationMultiLocationRequest = this.organizationUserLocation;
    request.userUuidsList = this.selectedStaffUUIDs;

    this._payrollConfigurationService
      .saveUserWorkLocation(request, this.addressId, this.isForceUpdate)
      .subscribe(
        (response) => {
          this.saveLoader = false;
          if (response.status) {
            if (response.object && response.object.length > 0) {
              this.userNameWithBranchName = this.staffs.filter((staff) =>
                response.object.some((item: UserWithBranchName) => item.uuid === staff.uuid)
              ).map((staff) => {
                const matchedUser = response.object.find((item: UserWithBranchName) => item.uuid === staff.uuid);
                return {
                  ...staff,
                  branch: matchedUser?.branchName || 'N/A',
                };
              });
              this.openUserAlreadyAssignedModal();
            } else {
              this.getOrganizationWorkAdddress();
              this.closeAddressModal.nativeElement.click();
              this._helperService.showToast('Your user work location updated.',Key.TOAST_STATUS_SUCCESS);
              this.isRegisterLoad = false;
              this.isValidated = false;
              this.isForceUpdate = false;
            }
          } else {
            this._helperService.showToast('Error updating your work location.',Key.TOAST_STATUS_ERROR);
          }
        },
        (error) => {
          this.saveLoader = false;
          this._helperService.showToast('Error updating your work location.',Key.TOAST_STATUS_ERROR);
          this.isRegisterLoad = false;
        }
      );
  }

  openUserAlreadyAssignedModal() {
    setTimeout(() => {
      let modalButton = document.querySelector(
        "[data-bs-target='#usersAlreadyAssigned']"
      ) as HTMLElement | null;
      if (modalButton) {
        modalButton.click();
      }
    }, 100);
  }

  checkIndividualSelection() {
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
  }

  isAllUsersSelected: boolean = false;

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

  userNameWithBranchName: any;

  totalItems: number = 0;
  pageChanged(page: any) {
    debugger;
    if (page != this.databaseHelper.currentPage) {
      this.databaseHelper.currentPage = page;
      this.getUserByFiltersMethodCall();
    }
  }

  selectedStaffUUIDs: string[] = [];
  getSelectedStaffUUIDs(): void {
    this.selectedStaffUUIDs = this.staffs
      .filter((staff) => staff.selected)
      .map((staff) => staff.uuid);
  }

  isWorkLocationFalse(): boolean {
    return (
      this.organizationAddress.length == 0 ||
      this.organizationAddress.some(
        (addr) => !addr.organizationAddress.isWorkLocation
      )
    );
  }

  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));
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

  searchUsers() {
    this.databaseHelper.currentPage = 1;
    this.databaseHelper.itemPerPage = 10;
    this.getUserByFiltersMethodCall();
  }

  clearSearchText() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }

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

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffsUuids = [];
  }

  onStateChange(event: any) {
    console.log('Selected State:', event);
  }

  @ViewChild('locationSettingTab') locationSettingTab!: ElementRef;
  @ViewChild('staffSelectionTab') staffSelectionTab!: ElementRef;
  openLocationEditModal(
    addressId: number,
    orgAaddress: OrganizationAddressWithStaff,
    targetTab: string
  ) {
    this.selectedStaffsUuids = orgAaddress.staffs;
    this.addressId = addressId;
    this.organizationUserLocation = JSON.parse(
      JSON.stringify(orgAaddress.organizationAddress)
    );
    this.addLocation.nativeElement.click();

    this.fetchUserList();
    setTimeout(() => {
      if (targetTab == 'employee') {
        this.staffSelectionTab.nativeElement.click();
      } else if (targetTab == 'location') {
        this.locationSettingTab.nativeElement.click();
      }
    }, 50);
  }

  openDropdownIndex: number | null = null;

  toggleDropdown(index: number) {
    this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
  }

  isDropdownOpen(index: number): boolean {
    return this.openDropdownIndex === index;
  }

  @ViewChild('closeButton2') closeButton2!: ElementRef;
  registerAddress() {
    this.isRegisterLoad = true;
    this.closeButton2.nativeElement.click();
    this.isForceUpdate = true;
    this.saveUserWorkLocation();
  }

  isValidated: boolean = false;
  checkValidation() {
    this.isValidated ? false : true;
  }

  closeModal() {
    this.isValidated = false;
  }

  removeUser(uuid: string) {
    this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
      (id) => id !== uuid
    );

    this.staffs = this.staffs.map((staff) => ({
      ...staff,
      selected: this.selectedStaffsUuids.includes(staff.uuid),
    }));

    this.userNameWithBranchName = this.userNameWithBranchName.filter(
      (user: { uuid: string }) => user.uuid !== uuid
    );

    this.isAllSelected = this.staffs.every((staff) => staff.selected);

    if (this.selectedStaffsUuids.length === 0) {
    }
  }

  searchState(event: string | Event): void {
    const value = typeof event === 'string' ? event : '';
    this.filteredStateList = this.stateList.filter((state) =>
      state.name.toLowerCase().includes(value.toLowerCase())
    );
  }

  openStaffSelection() {
    this.fetchUserList();
    this.staffSelectionTab.nativeElement.click();
  }

  deleteAddress() {
    this.deleteToggle = true;

    this._payrollConfigurationService.deleteAddress(this.addressId).subscribe(
      (response) => {
        if (response.status) {
          this.getOrganizationWorkAdddress();
          this._helperService.showToast(
            'Worklocation deleted.',
            Key.TOAST_STATUS_SUCCESS
          );
        } else {
          this._helperService.showToast(
            'Error deleting your work location.',
            Key.TOAST_STATUS_ERROR
          );
        }
        this.deleteLocationCloseButton.nativeElement.click();
        this.deleteToggle = false;
      },
      (error) => {
        this._helperService.showToast(
          'Error deleting your work location.',
          Key.TOAST_STATUS_ERROR
        );
        this.deleteLocationCloseButton.nativeElement.click();
        this.deleteToggle = false;
      }
    );
  }

  @ViewChild('deleteLocationButton') deleteLocationButton!: ElementRef;
  @ViewChild('deleteLocationCloseButton')
  deleteLocationCloseButton!: ElementRef;
  deleteToggle: boolean = false;
  deleteLocation(addressId: number) {
    this.addressId = addressId;
    this.deleteLocationButton.nativeElement.click();
  }


  routeToStatutory() {
    this._router.navigate(['/payroll/configuration'], {queryParams: { tab: 'statutory'},});
  }

  viewMore:boolean=false;
  toggleViewMore(){
    this.viewMore = !this.viewMore;
  }
}
