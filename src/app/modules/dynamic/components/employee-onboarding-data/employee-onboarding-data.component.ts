import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { EmployeeOnboardingDataDto } from 'src/app/models/employee-onboarding-data-dto';
import { OrganizationShift } from 'src/app/models/shift-type';
import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { UserReq } from 'src/app/models/userReq';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

export interface Team {
  label: string;
  value: string;
}

@Component({
  selector: 'app-employee-onboarding-data',
  templateUrl: './employee-onboarding-data.component.html',
  styleUrls: ['./employee-onboarding-data.component.css'],
})
export class EmployeeOnboardingDataComponent implements OnInit {
  @ViewChild('inviteModal') inviteModal!: ElementRef;
  @ViewChild('closeInviteModal') closeInviteModal!: ElementRef;
  @ViewChild('personalInformationForm') personalInformationForm!: NgForm;
  userPersonalInformationRequest: UserPersonalInformationRequest =
    new UserPersonalInformationRequest();

    @ViewChild('importModalOpen') importModalOpen!: ElementRef;
  constructor(
    private dataService: DataService,
    private activateRoute: ActivatedRoute,
    private _onboardingService: OrganizationOnboardingService,
    private router: Router,
    private helperService: HelperService,
    private modalService: NgbModal,
    private http: HttpClient
  ) {}
  users: EmployeeOnboardingDataDto[] = [];
  filteredUsers: Users[] = [];
  itemPerPage: number = 12;
  pageNumber: number = 1;
  total!: number;
  rowNumber: number = 1;
  sampleFileUrl: string = '';
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  userList: UserReq[] = new Array();

  pendingResponse = 'PENDING';
  approvedResponse = 'APPROVED';
  rejectedResponse = 'REJECTED';
  requestedResponse = 'REQUESTED';
  newUserResponse = 'NEW_USER';

  searchCriteria: string = '';

  searchOptions: string[] = ['PENDING', 'APPROVED', 'REJECTED'];

  routeToUserDetails(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    this.router.navigate(['/employee-profile'], navExtra);
  }

  randomUserUrl = 'http://localhost:8080/api/v2/users/fetch-team-list-user';
  searchChange$ = new BehaviorSubject('');
  optionList: string[] = [];
  selectedUser?: string;
  isLoading = false;

  // onSearch(value: string): void {
  //   this.isLoading = true;
  //   this.searchChange$.next(value);
  // }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.sampleFileUrl =
      'https://firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/Hajiri%2FSample%2FEmployee_Details_Sample%2Femployee_details_sample.xlsx?alt=media';
    // this.isUserShimer=true;
    this.getEmployeesOnboardingStatus();
    // this.getEmpLastApprovedAndLastRejecetdStatus();
    this.getUsersByFiltersFunction();
    this.getTeamNames();
    this.getUser();
    this.selectMethod('mannual');
    this.getShiftData();

    // const getRandomNameList = (): Observable<string[]> =>
    //   this.http.get<string[]>(`${this.randomUserUrl}`).pipe(
    //     catchError(() => of([])),
    //     map((res: string[]) => res.map((team) => team)) // Adjust the mapping here
    //   );

    // const optionList$: Observable<string[]> = this.searchChange$
    //   .asObservable()
    //   .pipe(debounceTime(500))
    //   .pipe(switchMap(getRandomNameList));

    // optionList$.subscribe((data) => {
    //   this.optionList = data;
    //   this.isLoading = false;
    // });
  }

  isUserShimer: boolean = true;
  placeholder: boolean = false;
  errorToggleTop: boolean = false;

  // selectSearchCriteria(option: string) {
  //   this.searchCriteria = option;
  // }
  debounceTimer: any;
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
          this.searchCriteria
          
        )
        .subscribe(
          (response: any) => {
            this.users = response.users;
            this.total = response.count;
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

  text = '';
  changeStatus(presenceStatus: Boolean, uuid: string) {
    debugger;
    this.dataService.changeStatusById(presenceStatus, uuid).subscribe(
      (data) => {
        // location.reload();
        this.getUsersByFiltersFunction();
        // this.helperService.showToast("User disabled");
      },
      (error) => {
        this.getUsersByFiltersFunction();
        // location.reload();
      }
    );
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    this.getUsersByFiltersFunction();
  }

  selectedStatus: string | null = null;

  selectStatus(status: string) {
    if (status == 'ALL') {
      this.selectedStatus = '';
      this.searchUsers('any');
    } else {
      this.selectedStatus = status;
      this.searchUsers(status);
    }
    this.search = ''; // Clear the search box text
    this.crossFlag = false;
  }

  searchText: string = '';
  search: string = '';
  crossFlag: boolean = false;
  searchUserPlaceholderFlag: boolean = false;

  resetCriteriaFilter() {
    this.itemPerPage = 12;
    this.pageNumber = 1;
  }

  searchUsers(searchString: string) {
    this.crossFlag = true;
    // this.searchUserPlaceholderFlag=true;
    if (searchString === 'any') {
      this.searchText = this.search;
      this.searchCriteria = '';
    } else {
      this.searchText = searchString;
      this.searchCriteria = 'employeeOnboardingStatus';
    }

    this.resetCriteriaFilter();
    this.getUsersByFiltersFunction();
    if (this.searchText === '') {
      this.crossFlag = false;
    }

    // if ((this.searchText === '' )||(this.searchText=="APPROVED") || (this.searchText=="PENDING" ) ||(this.searchText =="REJECTED")) {
    //   this.crossFlag = false;
    // }
  }

  // reloadPage() {
  //   location.reload();
  // }

  reloadPage() {
    this.search = '';
    this.searchText = '';
    this.searchCriteria = '';
    this.pageNumber = 1;
    this.itemPerPage = 12;
    this.getUsersByFiltersFunction();
    this.crossFlag = false;
    // location.reload();
  }

  // searchUsers(searchString:string) {
  //   this.crossFlag = true;
  //   if(searchString=='A'){
  //   this.searchText= "APPROVED"
  //   this.searchCriteria = "employeeOnboardingStatus"
  //   this.getUsersByFiltersFunction();
  // }else if(searchString=='P'){
  //   this.searchText= "PENDING"
  //   this.searchCriteria = "employeeOnboardingStatus"
  //   this.getUsersByFiltersFunction();
  // }else if(searchString=='R'){
  //   this.searchText= "REJECTED"
  //   this.searchCriteria = "employeeOnboardingStatus"
  //   this.getUsersByFiltersFunction();
  // }if(searchString=='any'){
  //   this.searchText= this.search
  //   this.searchCriteria = '';
  //   this.getUsersByFiltersFunction();
  // }
  //   // this.getUsersByFiltersFunction();
  //   if (this.searchText == '') {
  //     this.crossFlag = false;
  //   }
  // }

  showProjectOfOnboardingSection: boolean = false;

  changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getUsersByFiltersFunction();
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

  verificationCount: any = {};

  getEmployeesOnboardingStatus() {
    debugger;
    this.dataService.getEmployeesStatus().subscribe(
      (data) => {
        this.verificationCount = data;
      },
      (error) => {}
    );
  }

  employeeStatus: any = {};

  // lastApproved: User[] = [];
  // lastRejected: User[] = [];

  isPendingShimmer: Boolean = false;
  networkConnectionErrorPlaceHolder: boolean = false;
  dataNotFoundPlaceHolderForLastApproved = false;
  dataNotFoundPlaceHolderForLastRejected = false;
  dataNotFoundPlaceHolderForLast3PendingUsers = false;

  preMethodCallForShimmersAndOtherConditions() {
    this.isPendingShimmer = true;
    this.networkConnectionErrorPlaceHolder = false;
  }

  getEmpLastApprovedAndLastRejecetdStatus() {
    this.preMethodCallForShimmersAndOtherConditions();
    // this.isPendingShimmer=true;
    debugger;
    this.dataService.getLastApprovedAndLastRejecetd().subscribe(
      (data) => {
        this.employeeStatus = data;
        this.isPendingShimmer = false;

        if (
          data.lastApprovedUser === undefined ||
          data.lastApprovedUser === null
        ) {
          this.dataNotFoundPlaceHolderForLastApproved = true;
        }

        if (
          data.lastRejectedUser === undefined ||
          data.lastRejectedUser === null
        ) {
          this.dataNotFoundPlaceHolderForLastRejected = true;
        }

        if (data.last3PendingUsers.length == 0) {
          this.dataNotFoundPlaceHolderForLast3PendingUsers = true;
        }

        // this.networkConnectionErrorPlaceHolder=false;
        // if(this.employeeStatus!=null){
        //  this.lastApproved= this.employeeStatus.lastApprovedUser;
        //  this.lastRejected= this.employeeStatus.lastRejectedUser;
        // }
        // console.log(this.lastApproved);
        // console.log(this.lastRejected);
      },
      (error) => {
        this.isPendingShimmer = false;
        this.networkConnectionErrorPlaceHolder = true;
      }
    );
  }

  // Define a new flag
  emailAlreadyExists = false;
  toggle = false;
  setEmployeePersonalDetailsMethodCall() {
    // Reset the flag
    this.emailAlreadyExists = false;

    this.toggle = true;
    const userUuid = '';
    this.dataService
      .setEmployeePersonalDetails(
        this.userPersonalInformationRequest,
        userUuid,
        this.selectedTeamIds
      )
      .subscribe(
        (response: UserPersonalInformationRequest) => {
          this.toggle = false;

          // Check if the response indicates the email already exists
          if (response.statusResponse === 'existed') {
            this.emailAlreadyExists = true; // Set the flag to display the error message
            this.toggle = false;
          } else {
            this.clearForm();
            this.closeModal();
          }
          this.selectedTeamIds = [];
          this.selectedTeams = [];
          this.getUsersByFiltersFunction();
          this.helperService.showToast(
            'Email sent successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          console.error(error);
          this.toggle = false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  clearForm() {
    this.userPersonalInformationRequest = new UserPersonalInformationRequest();
    this.emailAlreadyExists = false;
    // this.personalInformationForm.reset();
  }

  closeModal() {
    this.closeInviteModal.nativeElement.click();
  }

  // loadingDeleteUser: { [key: string]: boolean } = {};
  // disableUserLoader(user: any): boolean {
  //   return this.loadingDeleteUser[user.id] || false;
  // }

  sendingMailLoaderForUser(user: any): boolean {
    return this.loadingStatus[user.email] || false;
  }

  // sendingMailLoader = false;
  loadingStatus: { [key: string]: boolean } = {};

  // requestFlag:boolean=false;
  sendMailToEmployees(user: any) {
    // this.sendingMailLoader = true;
    debugger;
    const userEmail = user.email;
    this.loadingStatus[userEmail] = true;
    this.dataService
      .sendMailToEmployeesToCompleteOnboarding(userEmail)
      .subscribe(
        (response) => {
          // this.requestFlag=true;
          this.getUsersByFiltersFunction();
          this.getEmpLastApprovedAndLastRejecetdStatus();
          this.getEmployeesOnboardingStatus();
          // location.reload();
          // this.sendingMailLoader=false;
          this.loadingStatus[userEmail] = false;

          this.helperService.showToast(
            'Email sent successfully!',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          // console.error(error);
          // location.reload();
          this.loadingStatus[userEmail] = false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  // Reset the model
  resetForm() {
    if (this.personalInformationForm) {
      this.personalInformationForm.reset();
    }
  }

  @ViewChild('closeUserDeleteModal') closeUserDeleteModal!: ElementRef;
  disableUserLoader: boolean = false;
  disableUser(userId: number) {
    this.disableUserLoader = true;
    debugger;
    this.dataService.disableUserFromDashboard(userId).subscribe(
      (data) => {
        if (this.users.length == 1) {
          this.pageNumber = this.pageNumber - 1;
        }
        this.disableUserLoader = false;
        this.getEmployeesOnboardingStatus();
        this.getUsersByFiltersFunction();
        this.getEmpLastApprovedAndLastRejecetdStatus();
        this.closeUserDeleteModal.nativeElement.click();
        this.helperService.showToast(
          'User Removed Successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.disableUserLoader = false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  currentUserId: number | null = null;

  // deleteConfirmationModalRef!: NgbModalRef;

  @ViewChild('deleteConfirmationModal') deleteConfirmationModal: any;

  openDeleteConfirmationModal(userId: number) {
    this.currentUserId = userId;
    // this.deleteConfirmationModalRef = this.modalService.open(this.deleteConfirmationModal);
  }

  deleteUser() {
    if (this.currentUserId !== null) {
      this.disableUser(this.currentUserId);
      // this.modalService.dismissAll();
      this.currentUserId = null;
    }
  }

  closeDeleteModal() {
    this.deleteConfirmationModal.nativeElement.click();
  }

  // dismissModal() {
  //   this.modalService.dismissAll();
  // }

  isShowPendingVerificationTab: boolean = false;

  selectedTeams: Team[] = [];
  teamNameList: Team[] = [];
  isLoadingTeams = false;

  getTeamNames() {
    this.isLoadingTeams = true;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.teamNameList = response.object.map((team: any) => ({
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

  selectedTeamIds: number[] = [];

  // onTeamSelectionChange(selectedTeams: string[]): void {
  //   this.selectedTeamIds = selectedTeams.map((id) => parseInt(id, 10));
  //   console.log('Selected team IDs:', this.selectedTeams);
  // }

  onTeamSelectionChange(selectedTeams: string[]): void {
    this.selectedTeamIds = selectedTeams.map((id) => parseInt(id, 10));
    // console.log('Selected teams:', this.selectedTeams);
  }

  onSearch(value: string): void {
    this.isLoadingTeams = true;

    setTimeout(() => {
      this.teamNameList = this.teamNameList.filter((team) =>
        team.label.toLowerCase().includes(value.toLowerCase())
      );
      this.isLoadingTeams = false;
    }, 1000);
  }



  fileName: any;
  currentFileUpload: any;

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

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceholder = false;

  preRuleForShimmersAndErrorPlaceholdersMethodCall() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceholder = false;
  }

  onboardUserList: any[] = new Array();
  loading: boolean = false;
  getUser() {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.loading = true;
    this._onboardingService.getOnboardUserForEmpOnboardingData().subscribe(
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

  formatAsCommaSeparated(items: string[]): string {
    return items.join(', ');
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

  user: UserReq = new UserReq();

  @ViewChild('userEditModal') userEditModal!: ElementRef;
  openUserEditModal(user: any) {
    this.isEmailExist = false;
    this.isNumberExist = false;
    this.user = JSON.parse(JSON.stringify(user));
    this.userEditModal.nativeElement.click();
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

  emails: string[] = [];
  sendMailExcelUserFlag:boolean = false;
  @ViewChild("closeButtonExcelModal") closeButtonExcelModal!:ElementRef;
  sendEmailToUsers() {
    this.sendMailExcelUserFlag = true;
    this.emails = this.onboardUserList.map(user => user.email).filter(email => email);
    console.log(this.emails);

    this.dataService
        .sendEmails(this.emails)
        .subscribe((response: any) => {
          console.log("Mail sent successfully");
          this.sendMailExcelUserFlag = false;
          this.closeButtonExcelModal.nativeElement.click();
          this.getUsersByFiltersFunction();
          this.getUser();
          this.helperService.showToast(
            'Mail sent Successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          this.sendMailExcelUserFlag = false;
        }
      );
  }

  restrictToDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.value = input.value.replace(/[^0-9]/g, '');
    }
  }

  // shiftList: OrganizationShift[] = [];
  // getShiftData(){
  //   this.dataService.getShifts().subscribe((response) => {
  //     this.organizationShift = response.listOfObject;
  //   }, (error) => {
      
  //   })
  // }
  shiftList: { value: number, label: string }[] = [];
  selectedShift: number | null = null;  
  isLoadingShifts = false;  
  getShiftData() {
    this.isLoadingShifts = true;
    this.dataService.getShifts().subscribe(
      (response) => {
        console.log('Shift data response:', response); // Debugging line
        if (response && response.listOfObject) {
          this.shiftList = response.listOfObject.map((shift: OrganizationShift) => ({
            value: shift.shiftId,
            label: shift.shiftName
          }));
        } else {
          console.warn('No shift data found in the response.');
        }
        this.isLoadingShifts = false;
      },
      (error) => {
        console.error('Error fetching shift data:', error);
        this.isLoadingShifts = false;
      }
    );
  }
  
  


}
