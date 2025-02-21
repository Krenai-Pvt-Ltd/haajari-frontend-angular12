import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  NgForm,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { UserListReq } from 'src/app/models/UserListReq';
import { UserReq } from 'src/app/models/userReq';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { OrganizationShift } from 'src/app/models/shift-type';
import { saveAs } from 'file-saver';
import { EmployeeOnboardingDataDto } from 'src/app/models/employee-onboarding-data-dto';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeaveSettingComponent } from 'src/app/modules/setting/components/leave-setting/leave-setting.component';
import { AttendanceSettingComponent } from 'src/app/modules/setting/components/attendance-setting/attendance-setting.component';
import { TeamComponent } from 'src/app/modules/dynamic/components/team/team.component';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import * as uuid from 'uuid';
import { constant } from 'src/app/constant/constant';

export interface Team {
  label: string;
  value: string;
}

@Component({
  selector: 'app-upload-team',
  templateUrl: './upload-team.component.html',
  styleUrls: ['./upload-team.component.css'],
})
export class UploadTeamComponent implements OnInit {
  form!: FormGroup;
  userList: UserReq[] = new Array();
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  sampleFileUrl: string = ''; //put sample file url
  viewMore: boolean = true;

  @ViewChild('importModalOpen') importModalOpen!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private _onboardingService: OrganizationOnboardingService,
    private dataService: DataService,
    private modalService: NgbModal,
    private _location: Location,
    private _router: Router,
    private helperService: HelperService,
    private db: AngularFireDatabase,
    private rbacService: RoleBasedAccessControlService
  ) {}


  orgRefId: any;
  logInUserUuid: string = '';
  async ngOnInit(): Promise<void> {
    debugger;
    window.scroll(0, 0);
    this.logInUserUuid = await this.rbacService.getUUID();
    this.orgRefId = this.rbacService.getOrgRefUUID();
    // this.sampleFileUrl =
    //   'https://firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/Hajiri%2FSample%2Femployee_details_sample.xlsx?alt=media';

    this.sampleFileUrl ="assets/samples/employee_details_sample.xlsx"

    const localStorageUniqueUuid = localStorage.getItem('uniqueUuid');
    if (localStorageUniqueUuid) {
      this.uniqueUuid = localStorageUniqueUuid;
      this.getFirebaseData();
    }

    // this.getUser();
    this.selectMethod('mannual');
    this.checkShiftTimingExistsMethodCall();
    this.getOnboardingVia();
    this.getOnboardingAdminUserData();
    this.getUsersByFiltersFunction();
    this.getTeamNames();
    this.getLeaveNames();
    this.getUser();
    this.selectMethod('mannual');
    this.getShiftData();

  }

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceholder = false;

  preRuleForShimmersAndErrorPlaceholdersMethodCall() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceholder = false;
  }

  back() {
    this.selectedMethod = '';
  }

  isPreviousLoading: boolean = false;
  backPage() {
    // setTimeout(() => {
    this.isPreviousLoading = true;
    // }, 1000);
    this.dataService.markStepAsCompleted(1);
    // this._onboardingService.saveOrgOnboardingStep(1).subscribe();
    this._onboardingService.saveOrgOnboardingStep(1).subscribe((resp) => {
      this._onboardingService.refreshOnboarding();
      setTimeout(() => {
        this.isPreviousLoading = false;
      }, 5000);
      // this.isPreviousLoading = false;
    });
    // this._router.navigate(['/organization-onboarding/personal-information']);
    // this._onboardingService.refreshOnboarding();
  }
  selectedMethod: string = 'mannual';
  selectMethod(method: string) {
    // debugger
    if (method == 'excel') {
      this.selectedMethod = '';
      this.getReport();
      this.importModalOpen.nativeElement.click();
    } else {
      this.selectedMethod = method;
      this.userList = [];
      this.user = new UserReq();
      this.userList.push(this.user);
      this.showUserList = false;
    }
  }

  // user:{name:string; phone:string; email:string}={name:'',phone:'', email:''};
  user: UserReq = new UserReq();

  addUser() {
    // this.user = { name: '', phone: '', email: ''};
    this.user = new UserReq();
    this.userList.push(this.user);
  }

  removeUser(index: number) {
    this.userList.splice(index, 1);
    if(this.userList.length == 1) {
      this.showUserList = false;
    }
  }

  // selectFile(event: any) {

  //   let fileList!: FileList;
  //   if (event != null) {
  //     fileList = event.target.files;
  //   }

  //   for (var i = 0; i < fileList.length; i++) {
  //     this.currentFileUpload = fileList.item(i);
  //   }

  //   if (this.currentFileUpload != null) {

  //     const formdata: FormData = new FormData();
  //     this.fileName = this.currentFileUpload.name;

  //     this.uploadUserFile(this.currentFileUpload,this.fileName);

  //   }

  // }

  selectFile(event: any) {
    // console.log("🚀 ~ UploadTeamComponent ~ selectFile ~ event:", event)
    // console.log("🚀 ~ UploadTeamComponent ~ selectFile ~ event.target.files && event.target.files.length > 0):", (event.target.files && event.target.files.length > 0))

    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.currentFileUpload = file;
      this.fileName = file.name;
      this.uploadUserFile(file, this.fileName);

      // Reset the file input to allow selecting the same file again
      event.target.value = '';
    }
  }

  @ViewChild('closeButtonExcelModal2') closeButtonExcelModal2!: ElementRef;

  importToggle: boolean = false;
  isProgressToggle: boolean = false;
  isErrorToggle: boolean = false;
  errorMessage: string = '';

  alreadyUsedPhoneNumberArray: any = [];
  alreadyUsedEmailArray: any = [];
  slackFirstPlaceholderFlag :boolean = false;
  slackDataPlaceholderFlag : boolean = false;
  uploadUserFile(file: any, fileName: string) {
    debugger;
    this.importToggle = true;
    this.isProgressToggle = true;
    this.isErrorToggle = false;
    this.alreadyUsedPhoneNumberArray = 0;
    this.alreadyUsedEmailArray = 0;
    this.errorMessage = '';
    this.percentage = 0;
    this.uniqueUuid = uuid.v4();
    localStorage.setItem('uniqueUuid', this.uniqueUuid);
    this.getFirebaseData();

    this._onboardingService.userImportOnboarding(file, fileName, this.uniqueUuid).subscribe(
      (response: any) => {
        if (response.status) {
          this.importToggle = false;
          this.isProgressToggle = false;
          this.getReport();
          // this.getUser();

          if (localStorage.getItem('uniqueUuid')) {
            localStorage.removeItem('uniqueUuid');
          }

          // console.log(this.onboardUserList.length);
          this.alreadyUsedPhoneNumberArray = response.arrayOfString;
          this.alreadyUsedEmailArray = response.arrayOfString2;
        } else {
          this.importToggle = true;
          this.isErrorToggle = true;
          this.isProgressToggle = false;
          this.errorMessage = response.message;
        }
        this.getOrgExcelLogLink();
        // this.importToggle = false;
        this.closeButtonExcelModal2.nativeElement.click();
      },
      (error) => {
        this.importToggle = true;
        this.isErrorToggle = true;
        this.isProgressToggle = false;
        this.errorMessage = error.error.message;
        this.closeButtonExcelModal2.nativeElement.click();
      }
    );
  }

  uniqueUuid: string = '';
  // basePath:"haziri_notific"+"/"+"organi_"+uuid+"/"+"user"+uuid+"/"+uniquesUUid
  percentage!: number;
  toggle: boolean = false;
  firebaseDataReloadFlag = false;
  showNotification = false;
  rotateToggle = false;
  getFirebaseData() {
    debugger
    // console.log(bulkId)
    this.db
      .object(
        'hajiri_notification' +
          '/' +
          'organization_' +
          this.orgRefId +
          '/' +
          'user_' +
          this.logInUserUuid +
          '/' +
          this.uniqueUuid
      )
      .valueChanges()
      .subscribe(async (res) => {
        //@ts-ignore
        var res = res;

        //@ts-ignore
        this.percentage = res!.percentage;
        
        if(this.percentage == 100) {
          this.percentage = 0;
          localStorage.removeItem('uniqueUuid');
            this.showNotification = true;
            setTimeout(() => {
              this.showNotification = false;
            }, 2000);

            this.getUser();
        }
        // console.log('opercent ' + this.percentage);

        //@ts-ignore
        // if (res != undefined && res != null) {

        //   //@ts-ignore
        //   if (res.flag == 1) {
        //     localStorage.removeItem('uniqueUuid');
        //     this.showNotification = true;
        //     setTimeout(() => {
        //       this.showNotification = false;
        //     }, 5000);

        //     this.getUser();
        //   }
        // }
      });
  }


  closeImportModal() {
    this.getUser();
  }

  importLoading: boolean = false;
  importReport: any[] = new Array();
  totalItems: number = 0;

  uploadDate: Date = new Date();

  getReport() {
    // debugger;
    this.importReport = [];
    this.importLoading = true;
    this.databaseHelper.itemPerPage = 5;
    this.databaseHelper.sortBy = 'createdDate';
    this.databaseHelper.sortOrder = 'Desc';
    this._onboardingService.getReport(this.databaseHelper).subscribe(
      (response: any) => {
        if (response.status) {
          this.importReport = response.object;
          this.totalItems = response.totalItems;
        }
        this.importLoading = false;
      },
      (error) => {
        this.importLoading = false;
      }
    );
  }

  pageChangedImport(page: any) {
    if (page != this.databaseHelper.currentPage) {
      this.databaseHelper.currentPage = page;
      this.getReport();
    }
  }

  isFormInvalid: boolean = false;
  @ViewChild('userForm') userForm!: NgForm;
  checkFormValidation() {
    if (this.userForm.invalid) {
      this.isFormInvalid = true;
      return;
    } else {
      this.isFormInvalid = false;
    }
  }
  isManualUploadSubmitLoader: boolean = false;
  submit() {
    // debugger;
    this.isManualUploadSubmitLoader = true;
    if (this.allUsersValid()) {
      this.create();
    } else {
      this.isManualUploadSubmitLoader = false;
      return;
    }
  }


  // allUsersValid(): boolean {
  //   if(!this.lastUsersValid()) {
  //     return false;
  //   }
  //   return this.userList.length > 0 && this.userList.every((u) => this.isValidUser(u));
  // }

  allUsersValid(): boolean {
    debugger

    const lastUser = this.userList[this.userList.length - 1];
    if(this.onboardingViaString === 'SLACK' && !lastUser.email) {
      return false;
    }
    if (!lastUser?.name && !lastUser?.phone && this.userList?.length == 1) {
      return false;
    }
    if (!this.lastUsersValid()) {
      return false;
    }
    return this.userList?.length > 0 && this.userList?.every((u, index) => {
      // if (index === this.userList?.length - 1 && !this.currentUsersValid() && !this.showUserList) {
      //   return false;
      // }
      // if(index === this.userList?.length - 1 && this.showUserList){
      //   return true;
      // }
      if(index === this.userList.length - 1){
        return true;
      }
      
      return this.isValidUser(u);
    });
  }
  lastUsersValid(): boolean {
    // debugger
    const lastUser = this.userList[this.userList.length - 1];
    if(this.onboardingViaString === 'SLACK' && !lastUser?.email) {
      return false;
    }
    if (!lastUser?.name && !lastUser?.phone) {
      return true;
    }
    return this.isValidUser(lastUser);
  }
  currentUsersValid(): boolean {
    // debugger;
    // const previousEntriesValid = this.userList.slice(0, -1).every((u) => this.isValidUser(u));
    const lastEntryValid = this.isValidUser(
      this.userList[this.userList.length - 1]
    );

    return !this.isNumberExist && !this.isEmailExist && lastEntryValid;
  }

  isValidUser(u: any): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]{2,20}$/;
    return (
      !!u?.name &&
      u?.phone &&
      u?.phone.length === 10 &&
      (!u?.email || emailRegex.test(u?.email))
    );
  }

  // Use this method to determine if all users are valid
  // allUsersValid(): boolean {
  //   debugger;
  //   return (
  //     !this.isNumberExist &&
  //     !this.isEmailExist &&
  //     this.userList.slice(0, -1).every((u) => this.isValidUser(u))
  //   );
  // }



  // allUsersValid(): boolean {
  //   return this.userList.length > 0 && this.userList.every((u) => this.isValidUser(u));
  // }


  resetManualUploadModal() {
    // debugger;
    this.userList = [];
    this.closeManualUploadModal();

    // this.userList.forEach((user) => {
    //   user.name = '';
    //   user.phone = '';
    //   user.email = '';
    // });
  }

  @ViewChild('munal-upload') closeManualUploadButton!: ElementRef;
  @ViewChild('closeButton') closeButton!: ElementRef;

  closeManualUploadModal() {

    this.userList[0] = new UserReq();
    //  this.userList.forEach((user) => {
    //   user.name = '';
    //   user.phone = '';
    //   user.email = '';
    // });
    this.closeButton.nativeElement.click();
  }

  // @ViewChild("closeManualUploadButton") closeManualUploadButton!: ElementRef;
  userListReq: UserListReq = new UserListReq();
  createLoading: boolean = false;
  create() {
    debugger;
    this.isManualUploadSubmitLoader = true;
    // this.userListReq.userList = this.userList.slice(0, -1);
    this.userListReq.userList = this.userList;
    this.createLoading = true;
    this._onboardingService.createOnboardUser(this.userListReq).subscribe(
      (response: any) => {
        if (response.status) {
          this.selectedMethod = '';
          this.createLoading = false;
          // this.closeUserEditModal.nativeElement.click();
          this.getUser();
          this.isManualUploadSubmitLoader = false;
          // this.closeManualUploadButton.nativeElement.click();
          this.resetManualUploadModal();
        }
      },
      (error) => {
        this.createLoading = false;
        this.isManualUploadSubmitLoader = false;
        this.resetManualUploadModal();
      }
    );
  }


  restrictToDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.value = input.value.replace(/[^0-9]/g, '');
    }
  }


  onboardUserList: any[] = new Array();
  loading: boolean = false;
  totalOnboardingUserListCount: number = 0;

  page: number = 0;
  size: number = 5;
  getUser() {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.loading = true;
    this.isShimmer = true;
    this._onboardingService.getOnboardUser(this.page, this.size).subscribe(
      (response: any) => {
        if (response.status) {
          this.onboardUserList = response.object;
          this.totalOnboardingUserListCount = response.totalItems;

          if (this.onboardUserList.some(user => this.listOfIds.includes(user.id))) {
            this.isSelectAll = true;
        } else {
            this.isSelectAll = false;
        }
  
        } else {
          this.onboardUserList = [];
          this.dataNotFoundPlaceholder = true;
        }
        this.loading = false;
        this.isShimmer = false;
      },
      (error) => {
        this.loading = false;
        this.networkConnectionErrorPlaceholder = true;
        this.isShimmer = false;
      }
    );
  }

  allUserIds: any[] = [];
  getAllUser() {
    this._onboardingService.getOnboardUser(this.page, this.totalOnboardingUserListCount).subscribe(
      (response: any) => {
        if (response.status) {
          this.allUserIds = response.object;
          this.listOfIds = this.allUserIds.map((user) => user.id);
          // this.listOfIds = [...this.allUserIds];
        }
      },
      (error) => {}
    );
  }

  getRowNumber(index: number): number {
    return this.page * this.size + index + 1;
  }

  nextPage() {
    debugger
    if (this.onboardUserList.length === this.size) {
      // this.unselectAllUsers();
      this.onboardUserList = [];
      this.page++;
      this.getUser();
    }
  }

  previousPage() {
    debugger
    if (this.page > 0) {
      // this.unselectAllUsers();
      this.onboardUserList = [];
      this.page--;
      this.getUser();
    }
  }

  get currentDisplayedCount(): number {
    const previousPagesCount = this.page * this.size;
    const currentPageCount = this.onboardUserList.length;
    return previousPagesCount + currentPageCount;
  }

  @ViewChild('userEditModal') userEditModal!: ElementRef;
  openUserEditModal(user: any) {
    this.isEmailExist = false;
    this.isNumberExist = false;
    this.user = JSON.parse(JSON.stringify(user));
    this.userEditModal.nativeElement.click();
  }

  @ViewChild('closeUserEditModal') closeUserEditModal!: ElementRef;
  editLoader: boolean = false;
  editUser() {
    debugger
    this.editLoader = true;
    this._onboardingService.editOnboardUser(this.user).subscribe(
      (response: any) => {
        if (response.status) {
          this.getUser();
          this.closeUserEditModal.nativeElement.click();
          this.editLoader = false;
          // this.helperService.showToast(
          //   'user update sucessfully',
          //   Key.TOAST_STATUS_SUCCESS
          // );
        }
      },
      (error) => {
        this.editLoader = false;
      }
    );
  }

  @ViewChild('closeButtonDeleteUser') closeButtonDeleteUser!: ElementRef;
  deleteUser() {
    this._onboardingService.deleteOnboardUser(this.idToDeleteUser).subscribe(
      (response: any) => {
        if (response.status) {
          // this.getUser();
          this.page = 0;
          this.totalOnboardingUserListCount = 0;
          this.getUser();
          this.closeButtonDeleteUser.nativeElement.click();
        }
      },
      (error) => {}
    );
    this.isErrorToggle = false;
    this.alreadyUsedPhoneNumberArray = 0;
    this.alreadyUsedEmailArray = 0;
  }

  idToDeleteUser: number = 0;
  deleteUserId(id: number) {
    this.idToDeleteUser = id;
  }

  listOfIds: number[] = [];

  deleteUsers() {
    this._onboardingService.deleteOnboardUsers(this.listOfIds).subscribe(
      (response: any) => {
        if (response.status) {
          this.getUser();
          this.listOfIds = [];
          this.isSelectAll = false;
        }
      },
      (error) => {}
    );
    this.isErrorToggle = false;
    this.alreadyUsedPhoneNumberArray = 0;
    this.alreadyUsedEmailArray = 0;
  }

  isSelectAll: boolean = false;

  toggleUserSelection(userId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.listOfIds.push(userId);
    } else {
      this.listOfIds = this.listOfIds.filter((id) => id !== userId);
    }
    this.isSelectAll = this.onboardUserList.length === this.listOfIds.length;
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.listOfIds = this.onboardUserList.map((user) => user.id);
    } else {
      this.listOfIds = [];
    }
    this.isSelectAll = isChecked;
  }

  selectAllPageUsers() {
    this.getAllUser();
    this.isSelectAll = true;
  }

  unselectAllUsers() {
    this.listOfIds = [];
    this.isSelectAll = false;
  }

  isNumberExist: boolean = false;
  isEmailExist: boolean = false;
  

  checkNumberExistence(index: number, number: string, uuid: string) {
    debugger
    if (number.trim() === '') {
      if (index >= 0) {
        this.userList[index].isPhoneExist = false;
      }
      this.isNumberExist = false;
      // console.log('Phone number is empty, skipping API call.');
    } else {

      this._onboardingService
        .checkEmployeeNumberExist(number, uuid)
        .subscribe((response: any) => {
          if (index >= 0) {
            this.userList[index].isPhoneExist = response;
          }
          this.isNumberExist = response;
          // console.log(response);
        });
    }
  }

  checkNumberExistance(index: number, phone: string, uuid: string): void {
    debugger
    if (!phone.trim()) {
      this.userList[index].isPhoneExist = false;
      this.isNumberExist = false;
      return;
    }
  
    // Ensure last index entry does not check itself but checks all others
    const isDuplicate = this.userList.some((user, i) => {
      return (user.phone === phone && i !== this.userList.length - 1);
    });
  
    if (isDuplicate) {
      this.userList[index].isPhoneExist = true;
      this.isNumberExist = true;
    } else {
      // Check for duplicacy on the backend
      this._onboardingService.checkEmployeeNumberExist(phone, uuid).subscribe((exists: any) => {
        this.userList[index].isPhoneExist = exists;
        this.isNumberExist = exists;
      });
    }
  }
  

  checkEmailExistence(index: number, email: string, uuid: string) {
    debugger;
    // this.userList[index].isEmailExist = false;
    if (email != null && email.length > 5) {
      this._onboardingService
        .checkEmployeeEmailExist(email, uuid)
        .subscribe((response: any) => {
          if (index >= 0) {
            this.userList[index].isEmailExist = response;
          }
          this.isEmailExist = response;
        });
    }
  }


  checkEmailExistance(index: number, email: string, uuid: string): void {
    debugger
    if (!email || email.length <= 5) {
      this.userList[index].isEmailExist = false;
      this.isEmailExist = false;
      return;
    }
  

    // Ensure last index entry does not check itself but checks all others
    const isDuplicate = this.userList.some((user, i) => {
      return (user.email === email && i !== this.userList.length - 1);
    });
  
    if (isDuplicate) {
      this.userList[index].isEmailExist = true;
      this.isEmailExist = true;
    } else {
      // Check for duplicacy on the backend
    this._onboardingService.checkEmployeeEmailExist(email, uuid).subscribe((exists: any) => {
      this.userList[index].isEmailExist = exists;
      this.isEmailExist = exists;
    });
    }


    
  }

  isNextloading: boolean = false;
  next() {
    // debugger;
    // setTimeout(() => {
    this.isNextloading = true;
    // }, 1000);

    this.dataService.markStepAsCompleted(3);
    // this._onboardingService.saveOrgOnboardingStep(3).subscribe();

    this._onboardingService.saveOrgOnboardingStep(3).subscribe((resp) => {
      this._onboardingService.refreshOnboarding();
      this.isNextloading = false;
    });

    if (this.shiftTimingExists) {
      // this._router.navigate(['/organization-onboarding/shift-time-list']);

      this._router.navigate([constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE]);
    } else {
      // this._router.navigate(['/organization-onboarding/add-shift-placeholder']);
      this._router.navigate([constant.ORG_ONBOARDING_SHIFT_TIME_PLACEHOLDER_ROUTE]);

    }

    // this._onboardingService.refreshOnboarding();
  }

  shiftTimingExists = false;
  checkShiftTimingExistsMethodCall() {
    this.dataService.shiftTimingExists().subscribe(
      (response: any) => {
        this.shiftTimingExists = response.object;
      },
      (error) => {}
    );
  }

  @ViewChild('closeUserUpload') closeUserUpload!: ElementRef;
  closeUserUploadModal() {
    this.importToggle = false;
    this.closeImportModal();
    this.closeUserUpload.nativeElement.click();
  }

  formatAsCommaSeparated(items: string[]): string {
    return items.join(', ');
  }

  onboardingViaString: string = '';
  getOnboardingVia() {
    // debugger;
    this.dataService.getOnboardingVia().subscribe(
      (response) => {
        this.onboardingViaString = response.message;
        // console.log('this.onboardingViaString ' + this.onboardingViaString);
      },
      (error) => {
        console.log('error');
      }
    );
  }

  showUserList: boolean = false;

  // viewUserList() {
  //   if (this.showUserList == false) {
  //     this.showUserList = true;
  //   } else {
  //     this.showUserList = false;
  //   }
  // }

  viewUserList() {
    this.showUserList = !this.showUserList;
  }

  excelLogLink!: string;
  getOrgExcelLogLink() {
    this.excelLogLink = '';
    this.dataService.getOrgExcelLogLink().subscribe(
      (response) => {
        this.excelLogLink = response.object;
        console.log('excelLink ' + response.object);
      },
      (error) => {
        console.log('error');
      }
    );
  }

  downloadExcelLog() {
    if (this.excelLogLink) {
      const link = document.createElement('a');
      link.href = this.excelLogLink;
      link.setAttribute('download', 'Organization_Excel_Log.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  adminUser: any;
  getOnboardingAdminUserData() {
    this.dataService.getOnboardingAdminUser().subscribe(
      (response) => {
        this.adminUser = response.object;
        // this.userList = response.object;
      },
      (error) => {
        console.log('error');
      }
    );
  }

  isSyncFlag: boolean = false;
  syncSlackUsersToDatabaseData() {
    this.isSyncFlag = true;
    this.page = 0;
    this.onboardUserList = [];
    this.dataService.syncSlackUsersToDatabase().subscribe(
      (response) => {
        this.isSyncFlag = false;

        this.getUser();
      },
      (error) => {
        this.isSyncFlag = false;
        console.log('error');
      }
    );
  }



  fileName: any;
  currentFileUpload: any;


  expectedColumns: string[] = ['Name*', 'Phone*', 'Email*', 'JoiningDate*', 'Gender*'];
  correctColumnName: string[] = ['S. NO.*', 'Name*', 'Phone*', 'Email*', 'Shift*', 'JoiningDate*', 'Gender*', 'leavenames', 'ctc', 'emptype', 'empId', 'branch', 'department', 'position', 'grade', 'team', 'dob', 'fathername', 'maritalstatus', 'address', 'city', 'state', 'country', 'pincode', 'panno', 'aadharno', 'drivinglicence', 'emergencyname', 'emergencyphone', 'emergencyrelation', 'accountholdername', 'bankname', 'accountnumber', 'ifsccode'];
  fileColumnName:string[] = [];
  genders: string[] = ['Male', 'Female'];
  isExcel: string = '';
  data: any[] = [];
  mismatches: string[] = [];
  invalidRows: boolean[] = []; // Track invalid rows
  invalidCells: boolean[][] = []; // Track invalid cells
  isinvalid: boolean=false;
  jsonData:any[]=[];

  currentPage: number = 1;
  pageSize: number = 10; // Adjust based on your requirements
  totalPage: number = 0;


  selectedTeams: Team[] = [];
  selectedLeaves: Team[] = [];
  teamNameList: Team[] = [];
  leaveNameList: Team[] =[];
  originalLeaveNameList: Team[]=[];
  originalTeamNameList: Team[] = [];
  isLoadingTeams = false;
  isLoadingLeave = false;

  getTeamNames() {
    this.isLoadingTeams = true;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.originalTeamNameList = response.object.map((team: any) => ({
          label: team.teamName,
          value: team.teamId.toString(),
        }));
        this.isLoadingTeams = false;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
        this.isLoadingTeams = false;
      },
    });
  }

  getLeaveNames() {
    this.isLoadingLeave = true;
    this.dataService.getAllLeaveTemplate(1, 100).subscribe({
      next: (response: any) => {
        this.originalLeaveNameList = response.object.map((leave: any) => ({
          label: leave.templateName,
          value: leave.id.toString(),
        }));
        this.isLoadingLeave = false;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
        this.isLoadingLeave = false;
      },
    });
  }

  onSearch(value: string): void {
    this.isLoadingTeams = true;
    if (!value) {
      this.teamNameList = this.originalTeamNameList; // Keep a copy of the original full list
    } else {
      setTimeout(() => {
        this.teamNameList = this.originalTeamNameList.filter((team) =>
        team.label.toLowerCase().includes(value.toLowerCase())
      );
      }, 1000);
    }
    this.isLoadingTeams = false;
  }

  onSearchLeave(value: string): void {
    this.isLoadingLeave = true;
    if (!value) {
      this.leaveNameList = this.originalLeaveNameList;
    } else {
      setTimeout(() => {
        this.leaveNameList = this.originalLeaveNameList.filter((leave) =>
        leave.label.toLowerCase().includes(value.toLowerCase())
        );
      }, 1000);
  }
  this.isLoadingLeave = false;
  }



  emails: string[] = [];
  sendMailExcelUserFlag:boolean = false;
  @ViewChild("closeButtonExcelModal") closeButtonExcelModal!:ElementRef;
  sendEmailToUsers(sendMail:boolean) {
    this.sendMailExcelUserFlag = true;
    this.emails = this.onboardUserList.map(user => user.email).filter(email => email);
    // console.log(this.emails);

    this.dataService
        .sendEmails(this.emails,sendMail)
        .subscribe((response: any) => {
          console.log("Mail sent successfully");
          this.sendMailExcelUserFlag = false;
          this.closeButtonExcelModal.nativeElement.click();
          this.getUsersByFiltersFunction();
          this.getUser();
          const toastMessage = sendMail ? 'Mail sent Successfully.' : 'Operation completed without sending mail.';
          this.helperService.showToast(toastMessage, Key.TOAST_STATUS_SUCCESS);
        },
        (error) => {
          this.sendMailExcelUserFlag = false;
        }
      );
  }

  deleteNewUser(id: number) {
    this._onboardingService.deleteOnboardUser(id).subscribe(
      (response: any) => {
        if (response.status) {
          this.getUser();
        }
      },
      (error) => {}
    );
  }


  @ViewChild('sampleFileModalButton') bulkUpload!:ElementRef;
  openUploadToogle(){
        this.bulkUpload.nativeElement.click();
  }

  isUserShimer: boolean = true;
  placeholder: boolean = false;
  errorToggleTop: boolean = false;
  isMainPlaceholder: boolean = false;
  debounceTimer: any;
  itemPerPage: number = 12;
  pageNumber: number = 1;
  searchText: string = '';
  searchCriteria: string = '';
  users: EmployeeOnboardingDataDto[] = [];
  total!: number;

  getUsersByFiltersFunction(debounceTime: number = 300) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.isUserShimer = true;
    this.debounceTimer = setTimeout(() => {
      this.dataService
        .getUsersByFilterForEmpOnboarding(
          this.itemPerPage,
          this.pageNumber,
          'asc',
          'id',
          this.searchText,
          this.searchCriteria,
          0
        )
        .subscribe(
          (response: any) => {
            this.users = response.users;
            this.total = response.count;

            if(this.searchText == '' && response.count <1) {
              this.isMainPlaceholder = true;
            }else {
              this.isMainPlaceholder = false;
            }
            if (this.users == null) {
              this.users = [];
            }
            if (this.users.length == 0) {
              this.placeholder = true;
              // this.errorToggleTop = false;
              // this.searchUserPlaceholderFlag=true;
            } else {
            }

            this.isUserShimer = false;
          },
          (error) => {
            this.isUserShimer = false;
            this.errorToggleTop = true;
            // const res = document.getElementById(
            //   'error-page'
            // ) as HTMLElement | null;

            // if (res) {
            //   res.style.display = 'block';
            // }
          }
        );
    }, debounceTime);
  }

  shiftList: { value: number, label: string }[] = [];
  selectedShift: number = 0;
  selectedLeave: number = 0;
  isLoadingShifts = false;
  getShiftData() {
    this.isLoadingShifts = true;
    this.dataService.getShifts().subscribe(
      (response) => {
        // console.log('Shift data response:', response);
        if (response && response.listOfObject) {
          this.shiftList = response.listOfObject.map((shift: OrganizationShift) => ({
            value: shift.shiftId,
            label: shift.shiftName
          }));
        } else {
          console.warn('No shift data found in the response.');
        }
        this.isLoadingShifts = false;
        if (this.shiftList.length == 1) {
          this.selectedShift = this.shiftList[0].value;

        }
      },
      (error) => {
        console.error('Error fetching shift data:', error);
        this.isLoadingShifts = false;
      }
    );
  }


  onPageChange(page: number) {
    debugger
    this.currentPage = page;
  }
  get paginatedData() {
    console.log(this.currentPage);
    const start = (this.currentPage - 1) * this.pageSize;
    console.log(start);
    return this.data.slice(start, start + this.pageSize);
  }


  // selectFile(event: any) {
  //   debugger
  //   if (event.target.files && event.target.files.length > 0) {
  //     const file = event.target.files[0];
  //     this.currentFileUpload = file;
  //     this.fileName = file.name;

  //     if (!this.isExcelFile(file)) {
  //       this.isExcel = 'Invalid file type. Please upload an Excel file.';
  //       return;
  //     }

  //     const reader = new FileReader();
  //     reader.onload = (e: ProgressEvent<FileReader>) => {
  //       const arrayBuffer = e.target?.result as ArrayBuffer;
  //       const binaryStr = this.arrayBufferToString(arrayBuffer);
  //       const workbook = XLSX.read(binaryStr, { type: 'binary' });
  //       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  //       this.jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  //       // Reset data and error tracking
  //       this.data = [];
  //       this.invalidRows = [];
  //       this.invalidCells = [];

  //       const columnNames: string[] = this.jsonData[0] as string[];

  //       if (this.validateColumns(columnNames)) {
  //             this.data = this.jsonData.map((row: any[]) => {
  //               // Ensure the 5th column is an array of strings, other columns are treated as strings
  //               return row.map((cell: any, index: number) => {
  //                 if( this.data.length==0){
  //                   return cell ? cell.toString().trim() : '';
  //                 }else{
  //                 if (this.fileColumnName[index] === 'leavenames') {
  //                   return cell ? cell.toString().split(',').map((str: string) => str.trim()) : [];
  //                 }else if (this.fileColumnName[index] === 'joiningdate*' && cell !== 'joiningdate*') {
  //                   // Use regex to check if cell matches exact MM-DD-YYYY format (reject formats like MM/DD/YYYY)
  //                   const isExactFormat = /^\d{2}-\d{2}-\d{4}$/.test(cell);
  //                   if (cell.includes('/')) {
  //                     return undefined;
  //                   }
  //                   console.log(cell);
  //                   cell=cell.replace(/\//g, '-');
  //                   console.log(cell);

  //                   if (isExactFormat) {
  //                       // Parse with strict format checking
  //                       const formattedDate = moment(cell, 'MM-DD-YYYY', true);

  //                       // Check if the date is valid and within the next year
  //                       if (formattedDate.isValid()) {
  //                           const oneYearFromNow = moment().add(1, 'year');

  //                           // Ensure date is within the next year
  //                           if (formattedDate.isBefore(oneYearFromNow)) {
  //                               return formattedDate.format('MM-DD-YYYY');
  //                           }
  //                       }
  //                   }
  //                   // Return empty string if the format, validity, or date range check fails
  //                   return "";
  //                 }
  //                  else {
  //                   // Convert other cells to string and trim whitespace
  //                   return cell ? cell.toString().trim() : '';
  //                 }
  //               }

  //               });
  //             }).filter((row: any[]) =>
  //                       // Filter out empty rows
  //                 row.some((cell: any) => cell !== '')
  //               );




  //         // Validate all rows and keep track of invalid entries
  //         this.validateRows(this.data);
  //         this.totalPage = Math.ceil(this.data.length / this.pageSize);
  //         if(this.areAllFalse()){
  //           this.isinvalid=false;
  //           this.uploadUserFile(file, this.fileName);
  //         }else{
  //           this.isinvalid=true;
  //         }


  //       } else {
  //         console.error('Invalid column names');
  //       }
  //     };
  //     reader.readAsArrayBuffer(file);
  //   }
  // }

  areAllFalse(): boolean {
    return this.invalidCells
      .reduce((acc, row, rowIndex) => {
        return acc.concat(row.filter((_, colIndex) => this.expectedColumns[colIndex] !== "LeaveNames"));
      }, [])
      .every(value => value === false);
  }

  arrayBufferToString(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    let binaryStr = '';
    for (let i = 0; i < byteArray.length; i++) {
      binaryStr += String.fromCharCode(byteArray[i]);
    }
    return binaryStr;
  }

  isExcelFile(file: File): boolean {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel'
    ];

    const allowedExtensions = ['xlsx', 'xls'];

    return allowedMimeTypes.includes(file.type) && allowedExtensions.includes(file.name.split('.').pop()?.toLowerCase() || '');
  }

  validateColumns(columnNames: string[]): boolean {
    this.mismatches = []; // Reset mismatches

    // Step 2: Normalize both expected and actual column names for comparison
    const normalizedColumnNames = columnNames.map(col => col.trim().toLowerCase());
    this.fileColumnName=normalizedColumnNames;
    const normalizedExpectedColumns = this.expectedColumns.map(col => col.trim().toLowerCase());
    const normalizedCorrectColumns = this.correctColumnName.map(col => col.trim().toLowerCase());

    // Step 3: Check that every expected column is present in actual column names
    for (const expectedColumn of normalizedExpectedColumns) {
      if (!normalizedColumnNames.includes(expectedColumn)) {
        console.error(`Missing column: "${expectedColumn}"`);
        this.mismatches.push(`Missing column: "${expectedColumn}"`);
      }
    }

    // Step 4: Check if there are extra or incorrect columns in actual column names
    for (const actualColumn of normalizedColumnNames) {
      if (!normalizedExpectedColumns.includes(actualColumn) && !normalizedCorrectColumns.includes(actualColumn)) {
          console.error(`Unexpected or incorrect column: "${actualColumn}"`);
          this.mismatches.push(`Unexpected or incorrect column: "${actualColumn}"`);
      }
  }

    // Step 4: Log and return false if there are any mismatches
    if (this.mismatches.length > 0) {
      console.error('Column mismatches found:');
      this.mismatches.forEach(mismatch => console.error(mismatch));
      return false;
    }

    return true;
  }

  validateRows(rows: any[]): void {
    this.invalidRows = new Array(rows.length).fill(false); // Reset invalid rows
    this.invalidCells = Array.from({ length: rows.length }, () => new Array(this.expectedColumns.length).fill(false)); // Reset invalid cells

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let rowIsValid = true;

      for (let j = 1; j < this.fileColumnName.length; j++) {

        const cellValue = row[j];
        if (cellValue === undefined || cellValue === null || cellValue.toString().trim() === '') {
          rowIsValid = false;
          this.invalidRows[i] = true; // Mark the row as invalid
          this.invalidCells[i][j] = true; // Mark the cell as invalid
        }
        if (this.fileColumnName[j] === 'phone*' && cellValue) {
          debugger
          const phoneNumber = cellValue.toString().trim();
          if (!/^\d{10}$/.test(phoneNumber)) {
            rowIsValid = false;
            this.invalidRows[i] = true; // Mark the row as invalid
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }
        }

        if (this.fileColumnName[j] === 'shift*' && cellValue) {
          const shiftName = cellValue.toString().trim();
          const shiftExists = this.shiftList.some(shift => shift.label === shiftName);

          if (!shiftExists) {
              rowIsValid = false;
              this.invalidRows[i] = true;
              this.invalidCells[i][j] = true;
              this.data[i][j] = '';
          }
      }
      // if (this.fileColumnName[j] === 'team' ) {
      //   // Split cellValue by commas and trim any whitespace
      //   if(cellValue===undefined || cellValue===""){
      //     this.data[i][j]=[];
      //   }
      //   else{
      //   const selectedTeams: string[] = cellValue.split(',').map((team: string) => team.trim());
      //   this.data[i][j]=selectedTeams;
      //   console.log("this.data[i][j] ",this.data[i][j])
      //   }

      // }

    if (this.fileColumnName[j] === 'leavenames' || this.fileColumnName[j] === 'team') {
      if(cellValue===undefined || cellValue===""){
        this.data[i][j]=[];
      }
      else{
        const selectedData: string[] = cellValue.split(',').map((team: string) => team.trim());
        this.data[i][j]=selectedData;
      }
    }





      if (this.fileColumnName[j] === 'joiningdate*' && cellValue) {
        debugger;

        // Replace slashes with hyphens
        const normalizedCell = cellValue.toString().trim().replace(/\//g, '-');

        // Check if the normalized cell matches the exact MM-DD-YYYY format
        const isExactFormat = /^\d{2}-\d{2}-\d{4}$/.test(normalizedCell);

        if (isExactFormat) {
            // Parse with strict format checking
            const formattedDate = moment(normalizedCell, 'MM-DD-YYYY', true);

            // Check if the date is valid
            if (formattedDate.isValid()) {
                const oneYearFromNow = moment().add(1, 'year');

                // Ensure the date is in the past or less than one year from today
                if (formattedDate.isAfter(oneYearFromNow)) {
                    this.data[i][j] = undefined;
                    rowIsValid = false;
                    this.invalidRows[i] = true; // Mark the row as invalid
                    this.invalidCells[i][j] = true; // Mark the cell as invalid
                }
            } else {
                // If the date is not valid
                this.data[i][j] = undefined;
                rowIsValid = false;
                this.invalidRows[i] = true; // Mark the row as invalid
                this.invalidCells[i][j] = true; // Mark the cell as invalid
            }
        } else {
            // If the format is not exactly MM-DD-YYYY
            this.data[i][j] = undefined;
            rowIsValid = false;
            this.invalidRows[i] = true; // Mark the row as invalid
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }
        }



        if (!this.expectedColumns.some(expectedColumn => expectedColumn.toLowerCase() === this.fileColumnName[j].toLowerCase())) {
          this.invalidCells[i][j] = false;
        }
      }
    }
  }

  getSelectedTeams(teamsString: string): string[] {
    // Split the comma-separated string into an array
    return teamsString ? teamsString.split(',').map(team => team.trim()) : [];
  }

  onMultiSelectChange(selectedOptions: any[], rowIndex: number, colIndex: number) {
    debugger

    this.data[rowIndex][colIndex] = selectedOptions;
    this.onValueChange(rowIndex,colIndex);
  }

  saveFile() {
    const stringifiedData = this.data.map((row: any[]) =>
      row.map(cell => cell !== null && cell !== undefined ? String(cell) : '')
    );
    const ws = XLSX.utils.aoa_to_sheet(stringifiedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'edited_file.xlsx');

    const file = new File([blob], 'edited_file.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

  // Create a fake event to pass to selectFile
  const event = new Event('change');
  Object.defineProperty(event, 'target', { writable: false, value: { files: dataTransfer.files } });
  this.selectFile(event);
  }

  onValueChange(i: number, j: number) {
    if (this.invalidCells[i][j]) {
      this.invalidCells[i][j] = false;
    }
  }

  onDateChange(event: Date, rowIndex: number, columnIndex: number) {
    // Format the selected date to 'MMM dd yyyy'
    const formattedDate =moment(event).format('MM-DD-YYYY');

    //  this.datePipe.transform(event, 'MMM dd yyyy');

    // Assign the formatted date back to your data array
    this.data[rowIndex][columnIndex] = formattedDate;
    this.onValueChange(rowIndex,columnIndex);
  }

  onTeamSelectionChanges(selectedTeams: any[], rowIndex: number, columnIndex: number) {
    this.data[rowIndex][columnIndex] = selectedTeams;
  }

  openAddLeaveModal(): void {
    const modalRef = this.modalService.open(LeaveSettingComponent, {
      size: 'xl',
      backdrop: true,
      windowClass: 'custom-modal-width'
    });

    // Optional: Handle modal close result
    modalRef.result.then(
      (result) => {
        console.log('Modal closed with:', result);
        // Refresh the list or handle result
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }

  openAddShiftModal(): void {
    const modalRef = this.modalService.open(AttendanceSettingComponent, {
      size: 'xl', // Adjust size as needed
      backdrop: true, // Allows closing the modal on outside click
      keyboard: true // Allows closing the modal with the Esc key
    });

    modalRef.result.then(
      (result) => {
        console.log('Modal closed with:', result);
        // Refresh the shift list or handle result
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }
  openAddTeamModal(): void {
    const modalRef = this.modalService.open(TeamComponent, {
      size: 'xl', // Adjust size as needed
      backdrop: true, // Allows closing the modal on outside click
      keyboard: true // Allows closing the modal with the Esc key
    });

    modalRef.result.then(
      (result) => {
        console.log('Modal closed with:', result);
        // Refresh the team list or handle result
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }

  preventPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }
  




}
