import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from 'src/app/models/user';
import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-employee-onboarding',
  templateUrl: './employee-onboarding.component.html',
  styleUrls: ['./employee-onboarding.component.css'],
})
export class EmployeeOnboardingComponent implements OnInit {
  @ViewChild ('inviteModal') inviteModal!: ElementRef;
  @ViewChild('closeInviteModal') closeInviteModal!: ElementRef;
  @ViewChild('personalInformationForm') personalInformationForm!: NgForm;
  userPersonalInformationRequest: UserPersonalInformationRequest = new UserPersonalInformationRequest();
  constructor(
    private dataService: DataService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private helperService: HelperService,
    private modalService: NgbModal
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
          console.log(this.users);
          if (this.users == null) {
            this.users = [];
          }
          if (this.total == null) {
            this.placeholder = true;
            this.errorToggleTop = false;
            this.searchUserPlaceholderFlag=false;
          } else {
            // Additional logic if needed
          }

          this.isUserShimer = false;
        },
        (error) => {
          this.isUserShimer = false;
          this.errorToggleTop = true;
          console.log(error);
          const res = document.getElementById(
            'error-page'
          ) as HTMLElement | null;

          if (res) {
            res.style.display = 'block';
          }
        }
      );
  }

  text = '';
  changeStatus(presenceStatus: Boolean, uuid:string) {
    this.dataService.changeStatusById(presenceStatus, uuid).subscribe(
      (data) => {
        console.log(data);
        console.log('====================');
        location.reload();
      },
      (error) => {
        console.log(error);
        location.reload();
        console.log('-------------------------------');
      }
    );
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    this.getUsersByFiltersFunction();
  }

  selectedStatus: string | null = null;

selectStatus(status: string) {
  this.selectedStatus = status;
  this.searchUsers(status);
}

  searchText: string = '';
  search:string='';
  crossFlag: boolean = false;
  searchUserPlaceholderFlag: boolean=false;
  searchUsers(searchString: string) {
    this.crossFlag = true;
    this.searchUserPlaceholderFlag=true;
    if (searchString === 'any') {
      this.searchText = this.search;
      this.searchCriteria = '';
    } else {
      this.searchText = searchString;
      this.searchCriteria = 'employeeOnboardingStatus';
    }
  
    this.getUsersByFiltersFunction();
    if (this.searchText === '') {
      this.crossFlag = false;
    }
  
    // if ((this.searchText === '' )||(this.searchText=="APPROVED") || (this.searchText=="PENDING" ) ||(this.searchText =="REJECTED")) {
    //   this.crossFlag = false;
    // }
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
 

  reloadPage() {
    location.reload();
  }

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
        console.log(data);
        this.verificationCount = data;

        console.log('====================');
      },
      (error) => {
        console.log(error);
        console.log('-------------------------------');
      }
    );
  }

  employeeStatus: any = {};

  // lastApproved: User[] = [];
  // lastRejected: User[] = [];

  isPendingShimmer:Boolean=false;

  getEmpLastApprovedAndLastRejecetdStatus() {
    this.isPendingShimmer=true;
    debugger;
    this.dataService.getLastApprovedAndLastRejecetd().subscribe(
      (data) => {
        console.log(data);
        this.employeeStatus = data;
        this.isPendingShimmer=false;

        console.log(this.employeeStatus);
        // if(this.employeeStatus!=null){
        //  this.lastApproved= this.employeeStatus.lastApprovedUser;
        //  this.lastRejected= this.employeeStatus.lastRejectedUser;
        // }
        // console.log(this.lastApproved);
        // console.log(this.lastRejected);
      },
      (error) => {
        console.log(error);
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
          console.log(response); 
          this.toggle = false; 

          // Check if the response indicates the email already exists
          if (response.statusResponse === 'existed') {
              this.emailAlreadyExists = true; // Set the flag to display the error message
              this.toggle = false;
          } else {
              this.clearForm();
              this.closeModal();
          }
      },
      (error) => {
          console.error(error);
          this.toggle = false;
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
// requestFlag:boolean=false;
  sendMailToEmployees(email:string){
    debugger
    this.dataService.sendMailToEmployeesToCompleteOnboarding(email)
    .subscribe(
      (response) => {
        // this.requestFlag=true;
        console.log(response); 
        location.reload();
      },
      (error) => {
        console.error(error);
        // location.reload();
      }
    );
  }

// Reset the model
resetForm() {
  if (this.personalInformationForm) {
      this.personalInformationForm.reset();
  }
}

}
