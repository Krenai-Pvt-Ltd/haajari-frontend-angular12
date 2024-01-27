import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Key } from 'src/app/constant/key';
import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';


@Component({
  selector: 'app-employee-onboarding-data',
  templateUrl: './employee-onboarding-data.component.html',
  styleUrls: ['./employee-onboarding-data.component.css']
})
export class EmployeeOnboardingDataComponent implements OnInit {

    @ViewChild ('inviteModal') inviteModal!: ElementRef;
    @ViewChild('closeInviteModal') closeInviteModal!: ElementRef;
    @ViewChild('personalInformationForm') personalInformationForm!: NgForm;
    userPersonalInformationRequest: UserPersonalInformationRequest = new UserPersonalInformationRequest();
    constructor(
      private dataService: DataService,
      private activateRoute: ActivatedRoute,
      private router: Router,
      private helperService: HelperService,
      private modalService: NgbModal,
      
    ) {}
    users: Users[] = [];
    filteredUsers: Users[] = [];
    itemPerPage: number = 12;
    pageNumber: number = 1;
    total!: number;
    rowNumber: number = 1;
  
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
  
    ngOnInit(): void {
      // this.isUserShimer=true;
      this.getEmployeesOnboardingStatus();
      this.getEmpLastApprovedAndLastRejecetdStatus();
      this.getUsersByFiltersFunction();
    }
  
    isUserShimer: boolean = true;
    placeholder: boolean = false;
    errorToggleTop: boolean = false;
  
    // selectSearchCriteria(option: string) {
    //   this.searchCriteria = option;
    // }
  
    getUsersByFiltersFunction() {
      this.isUserShimer = true;
      this.dataService
        .getUsersByFilter(
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
    }
  
    text = '';
    changeStatus(presenceStatus: Boolean, uuid:string) {
      debugger
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
    if(status=='ALL'){
      this.selectedStatus = '';
      this.searchUsers('any');
    }else{
    this.selectedStatus = status;
    this.searchUsers(status);
    }
    this.search = ''; // Clear the search box text
    this.crossFlag=false;
   
  }
  
    searchText: string = '';
    search:string='';
    crossFlag: boolean = false;
    searchUserPlaceholderFlag: boolean=false;

    resetCriteriaFilter(){
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
      this.search='';
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
        (error) => {
        }
      );
    }
  
    employeeStatus: any = {};
  
    // lastApproved: User[] = [];
    // lastRejected: User[] = [];
  
    isPendingShimmer:Boolean=false;
    networkConnectionErrorPlaceHolder:boolean=false;
    dataNotFoundPlaceHolderForLastApproved = false;
    dataNotFoundPlaceHolderForLastRejected = false;
    dataNotFoundPlaceHolderForLast3PendingUsers = false;

    preMethodCallForShimmersAndOtherConditions(){
      this.isPendingShimmer=true;
      this.networkConnectionErrorPlaceHolder=false;
    }
  
    getEmpLastApprovedAndLastRejecetdStatus() {
      this.preMethodCallForShimmersAndOtherConditions();
      // this.isPendingShimmer=true;
      debugger;
      this.dataService.getLastApprovedAndLastRejecetd().subscribe(
        (data) => {
          this.employeeStatus = data;
          this.isPendingShimmer=false;

          if(data.lastApprovedUser === undefined || data.lastApprovedUser === null){
            this.dataNotFoundPlaceHolderForLastApproved = true;
          }

          if(data.lastRejectedUser === undefined || data.lastRejectedUser === null){
            this.dataNotFoundPlaceHolderForLastRejected = true;
          }

          if(data.last3PendingUsers.length==0){
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
          this.isPendingShimmer=false;
          this.networkConnectionErrorPlaceHolder=true;
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
    this.dataService.setEmployeePersonalDetails(this.userPersonalInformationRequest, userUuid)
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

            this.helperService.showToast("Email sent successfully.", Key.TOAST_STATUS_SUCCESS);
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
  
    closeModal(){
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
    sendMailToEmployees(user:any){
      // this.sendingMailLoader = true;
      debugger
      const userEmail = user.email;
      this.loadingStatus[userEmail] = true;
      this.dataService.sendMailToEmployeesToCompleteOnboarding(userEmail)
      .subscribe(
        (response) => {
          // this.requestFlag=true;
          this.getUsersByFiltersFunction();
          this.getEmpLastApprovedAndLastRejecetdStatus();
          this.getEmployeesOnboardingStatus();
          // location.reload();
          // this.sendingMailLoader=false;
          this.loadingStatus[userEmail] = false;

          this.helperService.showToast("Email sent successfully!", Key.TOAST_STATUS_SUCCESS);
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

  @ViewChild("closeUserDeleteModal") closeUserDeleteModal!:ElementRef;
  disableUserLoader:boolean=false;
  disableUser(userId:number) {
    this.disableUserLoader=true;
    debugger
    this.dataService.disableUserFromDashboard(userId).subscribe(
      (data) => {
        if(this.users.length==1){
          this.pageNumber=this.pageNumber-1;
        }
        this.disableUserLoader=false;
        this.getEmployeesOnboardingStatus();
        this.getUsersByFiltersFunction();
        this.getEmpLastApprovedAndLastRejecetdStatus();
        this.closeUserDeleteModal.nativeElement.click();
        this.helperService.showToast("User Removed Successfully.",Key.TOAST_STATUS_SUCCESS)
      },
      (error) => {
        this.disableUserLoader=false;
        this.helperService.showToast(error.message,Key.TOAST_STATUS_ERROR)

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
  
    
}
