import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { ExitPolicy } from 'src/app/models/ExitPolicy';
import { Staff } from 'src/app/models/staff';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-exist-policy',
  templateUrl: './exist-policy.component.html',
  styleUrls: ['./exist-policy.component.css']
})
export class ExistPolicyComponent implements OnInit {

  databaseHelper: DatabaseHelper = new DatabaseHelper();

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.getExitPolicy();
  }

  isLoading: boolean = false;
  exitPolicyList: any[] = []
  getExitPolicy(){
    this.exitPolicyList = []
  }

  tempPolicyName: string = ''
  policyName: string = ''
  create(){

  }

  clearForm(form: NgForm){
    form.resetForm()
  }

  @ViewChild('exitPolicy') exitPolicy!: ElementRef;
  isStaffSelectionFlag: boolean = false;
  activeTab: string = 'exitPolicy';
  exitPolicySelectionTab() {
    this.exitPolicy.nativeElement.click();
    this.isStaffSelectionFlag = false;
    this.activeTab = 'exitPolicy';
  }

  @ViewChild('staffActiveTabInShiftTiming')
  staffActiveTabInShiftTiming!: ElementRef;
  staffActiveTabInShiftTimingMethod() {
    this.getUserByFiltersMethodCall();
    this.getTeamNames();

    this.staffActiveTabInShiftTiming.nativeElement.click();
  }

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

   // staff selection
   itemPerPage: number = 8;
   pageNumber: number = 1;
   lastPageNumber: number = 0;
   total!: number;
   page = 0;
   itemsPerPage = 6;
   totalCount: number = 0;
   rowNumber: number = 1;
   searchText: string = '';
   staffs: Staff[] = [];
   selectedTeamName: string = 'All';
   selectedTeamId: number = 0;
   selectedStaffIdsUser: number[] = [];
   teamNameList: UserTeamDetailsReflection[] = [];

  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;
  totalUserCount: number = 0;

  isAllUsersSelected: boolean = false;
  allselected: boolean = false;
  staffLoading: boolean = false;
  selectedStaffIds: number[] = [];
  getUserByFiltersMethodCall(){
    debugger
      this.selectedStaffIds = [];
      this.staffLoading = true;

      this.dataService.getUsersByFilter(this.databaseHelper.itemPerPage ,this.databaseHelper.currentPage ,'asc', 'id',this.searchText,'',this.selectedTeamId)
        .subscribe(
          (response) => {

            this.staffs = response.users;

            if (this.staffs != undefined) {
              this.staffs.forEach((staff, index) => {
                staff.checked = this.selectedStaffIdsUser.includes(staff.id);
              });
            } else {
              this.staffs = []
            }

            this.total = response.count;

            this.isAllSelected = this.staffs.every((staff) => staff.selected);

            if (this.selectedTeamId == 0 && this.searchText == '') {
              this.totalUserCount = response.count;
            }
            this.total = response.count;
            this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            this.pageNumber = Math.min(this.pageNumber, this.lastPageNumber);
            this.isAllSelected = this.staffs.every((staff) => staff.selected);
            this.staffLoading = false

            // console.log('staffs: ', this.staffs)
          },
          (error) => {
            console.error(error);
          }
        );
  }


  //Pagination
  totalItems: number = 0;
  userMappedLoading: boolean = false;
  pageChanged(page: any) {
    this.allselected = false;
    if (page != this.databaseHelper.currentPage) {
      this.databaseHelper.currentPage = page;
      this.getUserByFiltersMethodCall();
    }
  }


  clearIds() {
    this.selectedStaffIdsUser = []
    this.staffs.forEach((staff, index) => {
      staff.checked = false;
    });
    this.allselected = false;
    this.showAllUser();
  }

  selectedStaffList: Staff[] = [];
  selectedUserIds: number[] = [];
  showMappedUserToggle: boolean = false;
  showAllUser() {
    this.showMappedUserToggle = false;
    this.selectedUserIds = []
    this.getUserByFiltersMethodCall();
  }


  selectAllEmployee() {
    if (!this.allselected) {
      this.staffs.forEach((element) => {
        this.selectedStaffIdsUser.push(element.id);
        element.checked = true;
      });
      this.allselected = true;
    } else {
      this.staffs.forEach((element: any) => {
        element.checked = false;
      });
      this.allselected = false;
      this.selectedStaffIdsUser = [];
    }
    // console.log('all Ids: ', this.selectedStaffIdsUser)

    this.selectedStaffIdsUser = Array.from(new Set(this.selectedStaffIdsUser));
    // console.log('After SET Ids: ',this.selectedStaffIdsUser)

  }


  deSelectedStaffIdsUser: number[] = [];
  oldSelectedStaffIdsUser: number[] = []
  updateToggle: boolean = false;
  selectSingle(event: any, i: any) {
    debugger
    if (event.checked) {
      this.allselected = false;

      // if(this.updateToggle){
      //   this.deSelectedStaffIdsUser.push(event.id)
      // }

      if(this.updateToggle && this.oldSelectedStaffIdsUser.includes(event.id)){
        this.deSelectedStaffIdsUser.push(event.id)
      }

      this.staffs[i].checked = false;
      var index = this.selectedStaffIdsUser.indexOf(event.id);
      this.selectedStaffIdsUser.splice(index, 1);

      // console.log('deSelectedStaffIdsUser: ', this.deSelectedStaffIdsUser)

      if (this.selectedStaffIdsUser.length == 0 && this.showMappedUserToggle) {
        this.showAllUser();
      }

    } else {
      this.staffs[i].checked = true;
      this.selectedStaffIdsUser.push(event.id);

      if (this.deSelectedStaffIdsUser.includes(event.id)) {
        const index = this.deSelectedStaffIdsUser.indexOf(event.id);
        if (index > -1) {
          this.deSelectedStaffIdsUser.splice(index, 1);
        }
      }

      if (this.selectedStaffIdsUser.length == this.staffs.length) {
        this.allselected = true;
      }

      // now commented
      // if(this.updateToggle){
      //   this.tempCompanyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser
      // }

      // console.log('selectedIds: ', this.selectedStaffIdsUser)
      // console.log('del: ', this.deSelectedStaffIdsUser)
    }

    console.log('selectedIds: ', this.selectedStaffIdsUser)
    console.log('del: ', this.deSelectedStaffIdsUser)

  }


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
    this.page = 0;
    this.itemPerPage = 10;
    this.databaseHelper = new DatabaseHelper();
    // this.fullLeaveLogs = [];
    // this.selectedTeamName = teamName;
    this.selectedTeamId = teamId;
    this.getUserByFiltersMethodCall();
  }

  searchUsers() {
    this.getUserByFiltersMethodCall();
  }

  clearSearchText() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }

  noticePeriodDuration: number = 0;
  userNameWithBranchName: any[] = new Array();
  @ViewChild("closeButton") closeButton!:ElementRef;
  @ViewChild("closeExitPolicyModal") closeExitPolicyModal!:ElementRef;

  @ViewChild('usersAlreadyAssigned') usersAlreadyAssigned!: ElementRef
  tempSelectedStaffIdsUser: number[] = [];
  isMappedUserModalOpen: boolean = false;

  exitPolicyReq: ExitPolicy = new ExitPolicy();

  // tempCompanyExpenseReq: CompanyExpense = new CompanyExpense();
  // tempExpensePolicyReqList: ExpensePolicy[] = [];
  pName: string = ''
  getUserMappedWithPolicy(form: NgForm){
    debugger
    this.userMappedLoading = true;
    this.userNameWithBranchName = []
    this.dataService.getUserMappedWithExitPolicy(this.selectedStaffIdsUser, this.exitPolicyId).subscribe((response: any) => {

      if(response.status){
        this.userNameWithBranchName = response.object;
        this.tempSelectedStaffIdsUser = this.selectedStaffIdsUser

        // Add temp request for create expense
        // this.pName = this.policyName
      // this.tempCompanyExpenseReq.policyName = this.tempPolicyName;
      // this.tempCompanyExpenseReq.expensePolicyList = this.expensePolicyReqList
      // this.tempCompanyExpenseReq.selectedUserIds = this.selectedStaffIdsUser

      // this.tempCompanyExpenseReq.deSelectedUserIds = this.userNameWithBranchName.map(item => item.id);


      this.exitPolicyReq.name = this.policyName
      this.exitPolicyReq.noticePeriod = this.noticePeriodDuration
      this.exitPolicyReq.selectedUserIds = this.selectedStaffIdsUser

      }

      console.log('userLen: ',this.userNameWithBranchName.length)
        if( this.userNameWithBranchName.length != 0) {
          this.isMappedUserModalOpen = true;
          // console.log('Opening modal..')
          this.closeExitPolicyModal.nativeElement.click();
          this.usersAlreadyAssigned.nativeElement.click();
          this.userMappedLoading = false;
        }else{
          // console.log('Going to create..')
          this.registerExitPolicy(form);
        }

      },
      (error:any) => {
        console.log('error');
      }
    );
  }

  isValidated: boolean = false;
  checkValidation() {
    this.isValidated ? false : true;
  }

  closeModal(){

  }


  remainingIds: number[] = [];
  removeUserIds: number[] = [];
  removeUser(userId: number) {
    debugger
    // console.log('temp req: ',this.tempCompanyExpenseReq)

    this.tempSelectedStaffIdsUser = this.tempSelectedStaffIdsUser.filter(
      (id) => id != userId
    );

    // Update the 'selected' status for each staff member based on selectedStaffIdsUser
    this.userNameWithBranchName = this.userNameWithBranchName.filter(
      (staff) => staff.id !== userId
    );

  // Create a new list with only the IDs of the remaining items
   this.remainingIds = this.userNameWithBranchName.map((staff) => staff.id);

    this.selectedStaffIdsUser = this.tempSelectedStaffIdsUser


    if(this.updateToggle){
      this.removeUserIds = this.remainingIds;
      this.exitPolicyReq.removeUserIds = this.removeUserIds;
    }else{
      this.deSelectedStaffIdsUser = this.remainingIds
      this.exitPolicyReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
    }

    this.exitPolicyReq.selectedUserIds = this.selectedStaffIdsUser;
  }



  exitPolicyId: number = 0;
  tempExpPolicyId: number =0;
  // getExpenseInformationById(companyExpense: CompanyExpensePolicyRes){
  getExpenseInformationById(companyExpense: ExitPolicy){

  }

  registerToggle: boolean = false;
  registerExitPolicy(form: NgForm){
    console.log('create req: ',this.exitPolicyReq)
    this.registerToggle = true;
    this.dataService.createExitPolicy(this.exitPolicyReq).subscribe((res: any) => {
      if(res.status){
        this.registerToggle = false;
        this.closeExitPolicyModal.nativeElement.click()

        this.exitPolicyReq = new ExitPolicy();

        form.resetForm()

      }
    });
  }

  clearPolicyForm(){
    this.exitPolicyReq = new ExitPolicy();
    // this.tempCompanyExpenseReq = new CompanyExpense();

    this.selectedStaffIdsUser = []
    this.deSelectedStaffIdsUser = []
    // this.expenseTypeId = 0
    this.allselected = false;
    this.policyName = ''
    this.tempPolicyName = ''
    this.noticePeriodDuration = 0;
    // this.companyExpensePolicyId = 0
    this.exitPolicySelectionTab();

  }

}
