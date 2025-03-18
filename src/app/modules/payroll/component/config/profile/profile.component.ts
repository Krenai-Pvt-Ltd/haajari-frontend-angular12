import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { Staff } from 'src/app/models/staff';
import { AddressDetail } from 'src/app/payroll-models/AddressDetail';
import { OrganizationAddressWithStaff } from 'src/app/payroll-models/OrganizationAddressWithStaff';
import { OrganizationUserLocation } from 'src/app/payroll-models/OrganizationUserLocation';
import { PayrollTodoStep } from 'src/app/payroll-models/PayrollTodoStep';
import { Profile } from 'src/app/payroll-models/Profile';
import { StaffAddressDetailsForMultiLocation } from 'src/app/payroll-models/StaffAddressDetailMultiLocation';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  imageChangedEvent: any = null;
  base64: string | null = null;
  isUploading: boolean = false;
  isFileSelected: boolean = false;
  readonly constants = constant;

  readonly Constant = constant

  isDivVisible: boolean = false;
  fetchLocationModal: any;
  bootstrap: any;
  addressId:number=0;

  constructor(
     private _payrollConfigurationService :PayrollConfigurationService,
     private dataService: DataService,
        private _helperService : HelperService,
        private afStorage: AngularFireStorage,
        private activateRoute: ActivatedRoute,
        private router: Router
  ) { 
    if (this.activateRoute.snapshot.queryParamMap.has('tab')) {
      this.currentTab = this.activateRoute.snapshot.queryParamMap.get('tab');
    }
  }

  ngOnInit(): void {
    window.scroll(0,0);
    this.getProfile();
    this.getTodoList();
    this.getOrganizationAdddress();
  }

  

  isAnyFieldFocused = false;

  onFocus() {
    this.isAnyFieldFocused = true;
  }

  selectedLocation: string = 'India';

  selectedCurrency: string = 'INR'; // INR selected by default

  stateCurrency = [
    { "code": "INR", "name": "INR", "symbol": "₹" }
  ];


  stateList=[
    { "id": 1, "name": "Andhra Pradesh" },
    { "id": 2, "name": "Arunachal Pradesh" },
    { "id": 3, "name": "Assam" },
    { "id": 4, "name": "Bihar" },
    { "id": 5, "name": "Chhattisgarh" },
    { "id": 6, "name": "Goa" },
    { "id": 7, "name": "Gujarat" },
    { "id": 8, "name": "Haryana" },
    { "id": 9, "name": "Himachal Pradesh" },
    { "id": 10, "name": "Jharkhand" },
    { "id": 11, "name": "Karnataka" },
    { "id": 12, "name": "Kerala" },
    { "id": 13, "name": "Madhya Pradesh" },
    { "id": 14, "name": "Maharashtra" },
    { "id": 15, "name": "Manipur" },
    { "id": 16, "name": "Meghalaya" },
    { "id": 17, "name": "Mizoram" },
    { "id": 18, "name": "Nagaland" },
    { "id": 19, "name": "Odisha" },
    { "id": 20, "name": "Punjab" },
    { "id": 21, "name": "Rajasthan" },
    { "id": 22, "name": "Sikkim" },
    { "id": 23, "name": "Tamil Nadu" },
    { "id": 24, "name": "Telangana" },
    { "id": 25, "name": "Tripura" },
    { "id": 26, "name": "Uttar Pradesh" },
    { "id": 27, "name": "Uttarakhand" },
    { "id": 28, "name": "West Bengal" }
  ]

  selectedFile: File | null = null;
  
    toggleDiv() {
      this.isDivVisible = !this.isDivVisible;
    }
    closeStatutoryDiv() {
     this.isDivVisible = false;
      this.tab= '';
    }
    
    
    
      selectedPfWage = "12% of Actual PF Wage"; 
  
  employer = [
    { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
    { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
  ];
  employee = [
    { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
    { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
  ];
  
  tab: string = '';
  switchTab(tab: string) {
    this.tab = tab
  }
   
  
  // ################# Profile #######################
  
  formattedDate:string='';
  
  dateFormats = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' }
  ];
  
  onDateFormatChange(format: string) {
    this.profile.dateFormat = format;
    const now = new Date();
    this.formattedDate = this.formatDate(now, format);
    console.log('Selected Date Format:',this.formattedDate );
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
  
  profile:Profile = new Profile();
  getProfile(){
      this._payrollConfigurationService.getOrganizationProfile().subscribe((response) => {
            if(response.status){
              this.profile= response.object;
              if(this.profile==null){
                this.profile = new Profile();
              }
            const now = new Date();
            this.formattedDate = this.formatDate(now, this.profile.dateFormat);
              this.profile.currency = this.profile.currency ? this.profile.currency : 'INR';
            }
          },
          (error) => {
    
          }
        );
      }
  
  
    saveLoader:boolean=false;
    saveOrganizationProfile(){
      this.saveLoader = true;
      this._payrollConfigurationService.saveOrganizationProfile(this.profile).subscribe((response) => {
          if(response.status){
            this._helperService.showToast("Your Organiization Profile has been saved.", Key.TOAST_STATUS_SUCCESS);
            this.isAnyFieldFocused = false;
          }else{
            this._helperService.showToast("Error saving your profile.", Key.TOAST_STATUS_ERROR);
          }
          this.saveLoader = false;
          setTimeout(() => {
            this.route('statutory');
        }, 2000);
        },
        (error) => {
          this.saveLoader = false;
          this._helperService.showToast("Error saving your profile.", Key.TOAST_STATUS_ERROR);

        }
      );
    }
  
    uploadFile(file: File): void {
        const filePath = "logo"+new Date().getTime()+file.name;
        const fileRef = this.afStorage.ref(filePath);
        const task = this.afStorage.upload(filePath, file);
    
        task.snapshotChanges().pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe((url) => {
                this.profile.logo = url;
                this.isUploading=false;
              });
            })
          )
          .subscribe();
      }
  
    
  
      currentTab: any= 'profile';
      route(tabName: string) {
        this.router.navigate(['/payroll/configuration'], {
          queryParams: { tab: tabName },
        });
        this.currentTab=tabName;
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
      console.error('No image to upload!');
      return;
    }
  
    this.isUploading = true;
  
    const blob = this.dataURItoBlob(this.base64);
    const fileName = "cropped_"+new Date().getTime()+".png";
    const file = new File([blob], fileName, { type: 'image/png' });
  
    const filePath = "logo/"+fileName;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
  
    task.snapshotChanges()
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
  
  toDoStepList:PayrollTodoStep[]=new Array();
     getTodoList() {
  
        this._payrollConfigurationService.getTodoList().subscribe(
          (response) => {
            if(response.status){
              this.toDoStepList = response.object;
              this.checkAllCompleted();
  
            }
          },
          (error) => {
    
          }
        );
      }
      checkAllCompleted(): boolean {
        return this.toDoStepList.every(step => step.completed);
      }




      organizationAddress:OrganizationAddressWithStaff[] = new Array();
      getOrganizationAdddress(){
      this._payrollConfigurationService.getOrganizationAddress().subscribe((response) => {
            if(response.status){
              this.organizationAddress= response.object;
              if(this.organizationAddress==null){
                this.organizationAddress = [];
              }
            }
          },
          (error) => {
    
          }
        );
      }



      selectedAddressIndexes: number[] = [];
      onAddressSelect(index: number, event: any) {
        if (event.target.checked) {
          if (!this.selectedAddressIndexes.includes(index)) {
            this.selectedAddressIndexes.push(index);
          }
        } 
      }


      selectUsers:number=0;
      mapUsers(event:any){
        this.selectUsers=event?1:0;
      }



      @ViewChild('closeFetchModal') closeFetchModal!:ElementRef;
      saveFetchedAddressStaff(){
        this.saveLoader = true;
        const selectedAddresses = this.selectedAddressIndexes.map(index => this.organizationAddress[index].organizationAddress.id);
        this._payrollConfigurationService.saveFetchedAddressStaff(selectedAddresses,this.selectUsers).subscribe((response) => {
            if(response.status){
              this.getOrganizationAdddress();
              this.closeFetchModal.nativeElement.click();
              this._helperService.showToast("User Location updated successsfully.", Key.TOAST_STATUS_SUCCESS);
            }else{
              this._helperService.showToast("Error updating.", Key.TOAST_STATUS_ERROR);
            }
            this.saveLoader = false;
          },
          (error) => {
            this.saveLoader = false;
            this._helperService.showToast("Error updating.", Key.TOAST_STATUS_ERROR);
  
          }
        );
      }

      fetchUserList(){
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

  @ViewChild('addLocation') addLocation!:ElementRef; 
  openLocationModal(){
    this.fetchUserList();
    this.organizationUserLocation = new OrganizationUserLocation();
    this.selectedStaffUUIDs = [];
    this.addLocation.nativeElement.click();
  }     

  @ViewChild('closeAddressModal') closeAddressModal!:ElementRef;
  isRegisterLoad : boolean = false;
  organizationUserLocation:OrganizationUserLocation = new OrganizationUserLocation();
  saveUserWorkLocation(){
       this.saveLoader = true;
       this.getSelectedStaffUUIDs();
          var request:StaffAddressDetailsForMultiLocation= new StaffAddressDetailsForMultiLocation;
          request.organizationMultiLocationRequest = this.organizationUserLocation;
          request.userUuidsList = this.selectedStaffUUIDs;
          this._payrollConfigurationService.saveUserWorkLocation(request,this.addressId).subscribe((response) => {
          if(response.status){
            this.getOrganizationAdddress();
            this.closeAddressModal.nativeElement.click();
            this._helperService.showToast("Your Organiization Profile has been saved.", Key.TOAST_STATUS_SUCCESS);
            this.isRegisterLoad = false;

          }else{
            this._helperService.showToast("Error saving your profile.", Key.TOAST_STATUS_ERROR);
          }
          this.saveLoader = false;
        },
        (error) => {
          this.saveLoader = false;
          this._helperService.showToast("Error saving your profile.", Key.TOAST_STATUS_ERROR);
          this.isRegisterLoad = false;


        }
      );
    }



        checkIndividualSelection() {
          this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
          this.isAllSelected = this.isAllUsersSelected;
          this.updateSelectedStaffs();
          this.getOrganizationUser(this.addressId, "");
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
    getOrganizationUser(addressId : number, type:string) {
    this._payrollConfigurationService.getOrganizationUser(this.selectedStaffsUuids, addressId).subscribe(
      (response) => {
        this.userNameWithBranchName = response.listOfObject;
        if( this.userNameWithBranchName.length <1 && type == "SHIFT_USER_EDIT") {
          this.isAllSelected = false;
          this.isAllUsersSelected = false;
        }
      },
      (error) => {
        console.log('error');
      }
    );
  }

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
      .filter(staff => staff.selected)  
      .map(staff => staff.uuid);      

    }

    isWorkLocationFalse(): boolean {
      return this.organizationAddress.length > 0 && this.organizationAddress.some(addr => !addr.organizationAddress.isWorkLocation);
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
    this.getOrganizationUser(this.addressId, "");
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
    this.getOrganizationUser(this.addressId, "");
  }

  onStateChange(event: any) {
    console.log("Selected State:", event);
  }



  openLocationEditModal(addressId:number,orgAaddress : OrganizationAddressWithStaff) {
    this.addressId=addressId;
    this.organizationUserLocation = JSON.parse(JSON.stringify(orgAaddress.organizationAddress));
    this.addLocation.nativeElement.click();
    this.selectedStaffsUuids = orgAaddress.staffs;
    this.fetchUserList();
  }

  openDropdownIndex: number | null = null;

  toggleDropdown(index: number) {
        this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
      }

  isDropdownOpen(index: number): boolean {
    return this.openDropdownIndex === index;
  }

  
        
}