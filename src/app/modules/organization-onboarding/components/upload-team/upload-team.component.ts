import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { error } from 'console';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { UserListReq } from 'src/app/models/UserListReq';
import { User } from 'src/app/models/user';
import { UserReq } from 'src/app/models/userReq';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

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
    private _location: Location,
    private _router: Router,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.sampleFileUrl =
      'https://firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/Hajiri%2FSample%2FEmployee_Details_Sample%2Femployee_details_sample.xlsx?alt=media';
    this.getUser();
    this.selectMethod('mannual');
    this.checkShiftTimingExistsMethodCall();
    this.getOnboardingVia();
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
    if (method == 'excel') {
      this.selectedMethod = '';
      this.getReport();
      this.importModalOpen.nativeElement.click();
    } else {
      this.selectedMethod = method;
      this.userList = [];
      this.user = new UserReq();
      this.userList.push(this.user);
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
  }

  fileName: any;
  currentFileUpload: any;
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
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.currentFileUpload = file;
      this.fileName = file.name;
      this.uploadUserFile(file, this.fileName);
    }
  }

  importToggle: boolean = false;
  isProgressToggle: boolean = false;
  isErrorToggle: boolean = false;
  errorMessage: string = '';

  alreadyUsedPhoneNumberArray: any = [];
  alreadyUsedEmailArray: any = [];
  uploadUserFile(file: any, fileName: string) {
    debugger;
    this.importToggle = true;
    this.isProgressToggle = true;
    this.isErrorToggle = false;
    this.alreadyUsedPhoneNumberArray = 0;
    this.alreadyUsedEmailArray = 0;
    this.errorMessage = '';
    this._onboardingService.userImport(file, fileName).subscribe(
      (response: any) => {
        if (response.status) {
          this.importToggle = false;
          this.isProgressToggle = false;
          this.getReport();
          this.getUser();
          console.log(this.onboardUserList.length);
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
      },
      (error) => {
        this.importToggle = true;
        this.isErrorToggle = true;
        this.isProgressToggle = false;
        this.errorMessage = error.error.message;
      }
    );
  }

  closeImportModal() {
    this.getUser();
  }

  importLoading: boolean = false;
  importReport: any[] = new Array();
  totalItems: number = 0;

  uploadDate: Date = new Date();

  getReport() {
    debugger;
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
    debugger
    this.isManualUploadSubmitLoader = true;
    if (this.allUsersValid()) {
      this.create();
    } else {
      return;
    }
  }

  isValidUser(u: any): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return (
      !!u.name &&
      u.phone &&
      u.phone.length === 10 &&
      (!u.email || emailRegex.test(u.email))
    );
  }

  // Use this method to determine if all users are valid
  allUsersValid(): boolean {
    debugger
    return (
      !this.isNumberExist &&
      !this.isEmailExist &&
      this.userList.slice(0, -1).every((u) => this.isValidUser(u))
    );
  }

  currentUsersValid(): boolean {
    debugger;
    // const previousEntriesValid = this.userList.slice(0, -1).every((u) => this.isValidUser(u));
    const lastEntryValid = this.isValidUser(this.userList[this.userList.length - 1]);
  
    return (
      !this.isNumberExist &&
      !this.isEmailExist &&
      lastEntryValid
    );
  }


  resetManualUploadModal() {
    debugger;
    this.closeManualUploadModal();

    this.userList.forEach((user) => {
      user.name = '';
      user.phone = '';
      user.email = '';
    });
  }

  @ViewChild('munal-upload') closeManualUploadButton!: ElementRef;
  @ViewChild('closeButton') closeButton!: ElementRef;

  closeManualUploadModal() {
    this.closeButton.nativeElement.click();
  }

  // @ViewChild("closeManualUploadButton") closeManualUploadButton!: ElementRef;
  userListReq: UserListReq = new UserListReq();
  createLoading: boolean = false;
  create() {
    debugger;
    this.userListReq.userList = this.userList.slice(0, -1);
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

  onboardUserList: any[] = new Array();
  loading: boolean = false;
  getUser() {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.loading = true;
    this._onboardingService.getOnboardUser().subscribe(
      (response: any) => {
        if (response.status) {
          this.onboardUserList = response.object;
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
    this.editLoader = true;
    this._onboardingService.editOnboardUser(this.user).subscribe(
      (response: any) => {
        if (response.status) {
          this.getUser();
          this.closeUserEditModal.nativeElement.click();
          this.editLoader = false;
          this.helperService.showToast(
            'user update sucessfully',
            Key.TOAST_STATUS_SUCCESS
          );
        }
      },
      (error) => {
        this.editLoader = false;
      }
    );
  }

  @ViewChild("closeButtonDeleteUser") closeButtonDeleteUser!: ElementRef;
  deleteUser() {
    this._onboardingService.deleteOnboardUser(this.idToDeleteUser).subscribe(
      (response: any) => {
        if (response.status) {
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

  idToDeleteUser : number = 0;
  deleteUserId(id: number) {
    this.idToDeleteUser = id;
  }
  
  listOfIds!: number[];
  deleteUsers() {
    this._onboardingService.deleteOnboardUsers(this.listOfIds).subscribe(
      (response: any) => {
        if (response.status) {
          this.getUser();
        }
      },
      (error) => {}
    );
    this.isErrorToggle = false;
    this.alreadyUsedPhoneNumberArray = 0;
    this.alreadyUsedEmailArray = 0;
  }


  isNumberExist: boolean = false;
  checkNumberExistance(index: number, number: string, uuid: string) {
    if (number.trim() === '') {
      if (index >= 0) {
        this.userList[index].isPhoneExist = false;
      }
      this.isNumberExist = false;
      console.log('Phone number is empty, skipping API call.');
    } else {
      this._onboardingService
        .checkEmployeeNumberExist(number, uuid)
        .subscribe((response: any) => {
          if (index >= 0) {
            this.userList[index].isPhoneExist = response;
          }
          this.isNumberExist = response;
          console.log(response);
        });
    }
  }

  isEmailExist: boolean = false;
  checkEmailExistance(index: number, email: string, uuid: string) {
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
  isNextloading: boolean = false;
  next() {
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
      this._router.navigate(['/organization-onboarding/shift-time-list']);
    } else {
      this._router.navigate(['/organization-onboarding/add-shift-time']);
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
    debugger;
    this.dataService.getOnboardingVia().subscribe(
      (response) => {
        this.onboardingViaString = response.message;
        console.log('this.onboardingViaString ' + this.onboardingViaString);
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
      link.setAttribute('download', 'Organization_Excel_Log.xlsx'); // Set file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
}
