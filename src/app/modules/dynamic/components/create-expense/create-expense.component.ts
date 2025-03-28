import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import moment from 'moment';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { ApproveReq } from 'src/app/models/ApproveReq';
import { CompanyExpense } from 'src/app/models/CompanyExpense';
import { CompanyExpensePolicyRes } from 'src/app/models/CompanyExpensePolicyRes';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { ExpensePolicy } from 'src/app/models/ExpensePolicy';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { Staff } from 'src/app/models/staff';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-create-expense',
  templateUrl: './create-expense.component.html',
  styleUrls: ['./create-expense.component.css']
})
export class CreateExpenseComponent implements OnInit {

  ROLE: any
  sampleFileUrl: string =''
  // isLoading: boolean = false;

  constructor(private afStorage: AngularFireStorage,
    private dataService: DataService, private helperService: HelperService, private rbacService: RoleBasedAccessControlService) {

    }

  ngOnInit(): void {
    this.sampleFileUrl ="assets/samples/ExpenseSettlementSample.xlsx"

    this.getExpenses();
    this.getAllCompanyExpensePolicy();
    this.switchTab('allExpense');
    this.getTags('EXPENSE');
    this.searchSubject.pipe(debounceTime(1000)).subscribe((searchTerm) => {
      this.getExpenses();
    });
    // this.check1()

  }

  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';
  statusIds: number[] = new Array();
  expenseList: any[] = new Array();
  loading: boolean = false;
  expenseTotalItems: number = 0
  async getExpenses() {
    debugger
    this.loading = true;
    this.expenseList = []
    this.expenseTotalItems = 0
    this.ROLE = await this.rbacService.getRole();

    this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate, this.statusIds, '', this.selectedFilter,this.searchedName).subscribe((res: any) => {
      if (res.status) {
        this.expenseList = res.object
        this.expenseTotalItems = res.totalItems
        this.loading = false
        this.statusIds =[]
      }else{
        this.expenseList = []
        this.expenseTotalItems = 0
        this.loading = false
        this.statusIds = []
      }
    })
  }

  expensePageChanged(page:any) {
    debugger
    this.databaseHelper.currentPage = page;
    this.getExpenses();
  }

  /** Expense start **/
  clearData(){
    debugger
    this.companyExpensePolicyId = 0
    this.tempExpPolicyId = 0;
    this.oldSelectedStaffIdsUser = []
    this.companyExpenseReq = new CompanyExpense();
  }

  expenseTypeList: any[] = new Array();
  expenseTypeReq: ExpenseType = new ExpenseType();
  expenseTypeId: number = 0;
  getExpenseTypeId(id: any) {
    this.expenseTypeReq.expenseTypeId = id
  }

  getExpenseType1() {

    this.expenseTypeReq = new ExpenseType();
    this.expenseTypeId = 0

    this.expenseTypeList = []
    this.dataService.getExpenseType().subscribe((res: any) => {

      if (res.status) {
        this.expenseTypeList = res.object;
      }

    }, error => {
      console.log('something went wrong')
    })
  }

  getExpenseType() {

    this.expenseTypeReq = new ExpenseType();
    this.expenseTypeId = 0

    this.expenseTypeList = []
    this.dataService.getAllExpenseType().subscribe((res: any) => {

      if (res.status) {
        this.expenseTypeList = res.object;
      }
      // console.log('typelist: ',this.expenseTypeList)
    }, error => {
      console.log('something went wrong')
    })
  }

  // Watch for changes in the expense date for the custom date range
  isExpenseDateSelected: boolean = true;
  isCustomDateRange: boolean = false;
  selectExpenseDate(startDate: Date) {
    if (this.isCustomDateRange && startDate) {
      this.expenseTypeReq.expenseDate = this.helperService.formatDateToYYYYMMDD(startDate);
    }
  }

  validatePolicyToggle: boolean = false;
  limitAmount: any;
  checkExpensePolicy(form: NgForm) {
    this.dataService.checkExpensePolicy(this.expenseTypeReq.expenseTypeId, this.expenseTypeReq.amount).subscribe((res: any) => {
      this.limitAmount = res.object;

      if (this.limitAmount > 0) {
        this.validatePolicyToggle = true;
      } else {
        this.createExpense(form);
      }
    })
  }

  setValidateToggle() {
    this.validatePolicyToggle = false;
  }

  @ViewChild('closeExpenseButton') closeExpenseButton!: ElementRef
  createToggle: boolean = false;
  createExpense(form: NgForm) {
    this.createToggle = true;

    this.dataService.createExpense(this.expenseTypeReq).subscribe((res: any) => {
      if (res.status) {
        this.expenseTypeReq = new ExpenseType();
        this.expenseTypeId = 0;
        this.expenseTypeReq.id = 0;
        this.validatePolicyToggle = false;
        form.resetForm();
        this.getExpenses();
        this.createToggle = false;
        this.closeExpenseButton.nativeElement.click()
        this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
      }
    })

    console.log('createExpense Req: ', this.expenseTypeReq)
    // this.expenseTypeReq = new ExpenseType();

    // this.expenseTypeId = 0;
    // this.validatePolicyToggle = false;
    // form.resetForm();
    // this.getExpenses();

    // this.closeExpenseButton.nativeElement.click()
    // console.log('Created Successfully')
  }

  async updateExpense(expense: any) {
    await this.getExpenseType();

    this.expenseTypeReq.id = expense.id
    this.expenseTypeReq.amount = expense.amount
    this.expenseTypeReq.expenseDate = expense.expenseDate
    this.expenseTypeReq.expenseTypeId = expense.expenseTypeId
    this.expenseTypeReq.notes = expense.notes
    this.expenseTypeId = expense.expenseTypeId
  }

  clearExpenseForm(form: NgForm) {
    this.expenseTypeReq = new ExpenseType();
    this.expenseTypeId = 0;
    this.validatePolicyToggle = false;
    form.resetForm();
  }

  deleteImage() {
    this.expenseTypeReq.url = ''
  }

  expenseId: number = 0;
  getExpenseId(id: number) {
    this.expenseId = id;
    console.log('id: ', this.expenseId)
  }

  deleteToggle: boolean = false
  @ViewChild('closeButtonDeleteExpense') closeButtonDeleteExpense!: ElementRef
  deleteExpense() {

    this.dataService.deleteExpense(this.expenseId).subscribe((res: any) => {
      if (res.status) {
        this.closeButtonDeleteExpense.nativeElement.click()
        this.getExpenses();
        this.helperService.showToast(
          'Expense deleted successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      }
    })
  }

  // Function to disable future dates
  disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    // Disable dates after today
    return current && current >= today;
  };

  userExpense!: any;
  fullPartialAmount: any;

  showExpenseComponent: boolean = false;
  expenseData: any= {
    expense: {}
  };
  onExpenseComponentClose() {
    this.getExpenses();
    this.closeApproveModal.nativeElement.click();
    this.showExpenseComponent = false;
  }

  openExpenseComponent(expense:any) {

    this.expenseData.expense =expense ;
    setTimeout(() => {
      this.showExpenseComponent = true;
    }, 1);

  }
  getExpense(expense: any) {

    this.userExpense = null;
    this.rejectDiv = false;
    this.currentId = expense.id;
    this.tags=expense.tags;
    this.userExpense = expense
    console.log('dataset: ',this.userExpense)

    if(this.userExpense.partiallyPaidAmount != null){
      this.expensePaymentType = 'partial'
      this.approveReq.isPartiallyPayment = 1
      this.partiallyPayment = true;
    }

    // this.fullPartialAmount = this.userExpense.amount - this.userExpense.partiallyPaidAmount
    this.fullPartialAmount = this.userExpense.approvedAmount - this.userExpense.partiallyPaidAmount

    this.getExpenseType();
  }

  isCheckboxChecked: boolean = false
  partialAmount: string = '';
  onCheckboxChange(checked: boolean): void {
    this.isCheckboxChecked = checked;
    if (!checked) {
      this.partialAmount = '';
    }
  }

  clearApproveModal() {
    this.isCheckboxChecked = false;
    this.partialAmount = '';
    this.tags = [];
    this.approvedAmount = '';
    this.approveAmountChecked = false;
    this.currentId = 0;
    this.transactionId = ''
    this.settledDate = ''
    this.payCashDiv = false;
    this.rejectDiv = false;
    this.showTransactionDiv = false;

    this.expensePaymentType = 'full'
    this.partialAmount = ''
    this.partiallyPayment = false;

    this.approveReq.rejectionReason = ''

  }

  existTransactionId: boolean = false;
  checkTransactionId(id: number, statusId: number, isCashPayment: number){
    this.dataService.checkExpenseTransactionId(this.transactionId).subscribe((res: any) => {
      if(res.status && res.object){
        this.existTransactionId = true
      }else{
        this.existTransactionId = false;
        this.approveOrDeny(id, statusId, isCashPayment);
      }
    })
  }

  onApproveAmountCheckboxChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!isChecked) {
      this.approvedAmount = '';
    }
  }

  approveReq: ApproveReq = new ApproveReq();
  approveToggle: boolean = false;
  rejectToggle: boolean = false;
  paymentCashYesToggle: boolean = false;
  paymentCashNoToggle: boolean = false;

  approveAmountChecked: boolean = false; // Tracks checkbox state
  approvedAmount: string = '';          // Holds the approved amount


  payrollToggle: boolean = false;
  expenseCancelToggle: boolean = false;
  @ViewChild('closeApproveModal') closeApproveModal!: ElementRef
  approveOrDeny(id: number, statusId: number, isCashPayment: number) {

    debugger

    if(statusId == 14){
      this.approveToggle = true;
    }else if(statusId == 15){
      this.rejectToggle = true;
    }else if(statusId == 40){
      this.payrollToggle = true;
    }else{
      this.expenseCancelToggle = true;
    }

    if(statusId == 41 && isCashPayment == 0){
      this.paymentCashNoToggle = true;
    }else if(statusId == 41 && isCashPayment == 1){
      this.paymentCashYesToggle = true;
    }

    if(isCashPayment == 1 && statusId >= 40){
      this.approveReq.paymentMethod = 'CASH'
    }else if(isCashPayment == 0 && statusId >= 40){
       this.approveReq.paymentMethod = 'ONLINE'
    }

    if(this.approveAmountChecked && this.approvedAmount){
      this.approveReq.approvedAmount = this.approvedAmount
    }else{
      this.approveReq.approvedAmount = this.userExpense.amount
    }

    this.approveReq.id = id;
    this.approveReq.statusId = statusId
    this.approveReq.amount = this.partialAmount
    this.approveReq.transactionId = this.transactionId
    this.approveReq.settledDate = this.settledDate

    this.dataService.updateCompanyExpense(this.approveReq).subscribe((res: any) => {
      if(res.status){
        this.approveReq = new ApproveReq();
        this.getExpenses();
        this.isCheckboxChecked = false;
        this.partialAmount = '';
        this.closeApproveModal.nativeElement.click()
        this.approveToggle = false
        this.rejectToggle = false
        this.rejectDiv = false;
        this.paymentCashNoToggle = false;
        this.paymentCashYesToggle = false;
        this.payCashDiv = false;
        this.showTransactionDiv = false;
        this.settledDate = ''
        this.transactionId = ''

        this.fullPartialAmount = 0
        this.expensePaymentType = 'full'
        this.partiallyPayment = false;

        this.approvedAmount = ''
        this.approveAmountChecked = false;

        this.payrollToggle = false
        this.expenseCancelToggle = false

        this.helperService.showToast(
          res.message,
          Key.TOAST_STATUS_SUCCESS
        );
      }
    })
  }

  showTransactionDiv: boolean = false;
  transactionId: string = ''
  onlineTransaction(){
    this.showTransactionDiv = true;
  }

  settledDate: any;
  selectExpenseSettledDay(startDate: Date) {
    debugger
    // if (this.userResignationReq.isRecommendLastDay == 0 && startDate) {
      this.settledDate = this.helperService.formatDateToYYYYMMDD(startDate);
    // }
  }

  approveOrDenyOld(id: number, statusId: number) {

    debugger

    if(statusId == 14){
      this.approveToggle = true;
    }else if(statusId == 15){
      this.rejectToggle = true;
    }else if(statusId == 40){
      this.payrollToggle = true;
    }else{
      this.expenseCancelToggle = true;
    }

    this.approveReq.id = id;
    this.approveReq.statusId = statusId
    this.approveReq.amount = this.partialAmount
    this.dataService.updateCompanyExpense(this.approveReq).subscribe((res: any) => {
      if(res.status){
        this.approveReq = new ApproveReq();
        this.getExpenses();
        this.isCheckboxChecked = false;
        this.partialAmount = '';
        this.closeApproveModal.nativeElement.click()
        this.approveToggle = false
        this.rejectToggle = false

        this.payrollToggle = false
        this.expenseCancelToggle = false

        this.helperService.showToast(
          res.message,
          Key.TOAST_STATUS_SUCCESS
        );
      }
    })

  }

  /** Company Expense end **/

  rejectDiv: boolean = false;
  showExpenseRejectDiv(){
    this.rejectDiv = true;
  }

  payCashDiv: boolean = false;
  showPayCashDiv(){
    this.payCashDiv = true;
  }

  partiallyPayment: boolean = false;
  expensePaymentType: string = 'full'
  onExpensePaymentTypeChange(type: number): void {
    this.partialAmount = ''

    this.approveReq.isPartiallyPayment = type;
    if (this.approveReq.isPartiallyPayment == 0) {
      this.approveReq.amount = 0;
    }

    if (this.approveReq.isPartiallyPayment == 1) {
      this.expensePaymentType = 'partial'
    }

    this.partiallyPayment = !this.partiallyPayment
  }

  exportUrl: string =''
  exportLoading: boolean = false;
  @ViewChild('expenseDownload') expenseDownload!: ElementRef
  export(){
    this.exportLoading = true;
    this.dataService.exportExpense().subscribe((res: any) => {
      if(res.status){
        this.exportUrl = res.object
        this.exportLoading = false;

        if (this.exportUrl != null) {
          setTimeout(() => {
            this.expenseDownload.nativeElement.click();
          }, 500);
        }
      }else{
        this.exportUrl = ''
        this.exportLoading = false;
      }
    })
  }

  /**
   * Create Expense Policy Start
   */

  // switch tab start

  activeTab: string = 'expensePolicy';

  // Method to switch tabs
  switchTab(tabName: string) {
    this.activeTab = tabName;

    if(tabName === 'allExpense'){
      this.getExpenses()
    }

  }

  @ViewChild('expenseTypeTab') expenseTypeTab!: ElementRef;
  isStaffSelectionFlag: boolean = false;
  expenseTypeSelectionTab() {
    this.expenseTypeTab.nativeElement.click();
    this.isStaffSelectionFlag = false;
    this.activeTab = 'expensePolicy';
  }

  @ViewChild('staffActiveTabInShiftTiming')
  staffActiveTabInShiftTiming!: ElementRef;
  staffActiveTabInShiftTimingMethod() {
    this.getUserByFiltersMethodCall();
    this.getTeamNames();

    this.staffActiveTabInShiftTiming.nativeElement.click();
  }

  /** Create Expense Policy */

  expenseTypeName: string = ''
  isExpenseTypeSelected: boolean = false;
  paymentType: string = ''; // Holds the selected payment type ('fixed' or 'flexible')
  flexibleAmount: number | null = null; // Holds the amount for flexible payment type
  selectExpenseType(expense: any) {
    console.log('expense: ', expense)
    // this.expenseTypeName = expense.name
    this.expenseTypeId = expense

//     const selectedExpense = this.expenseTypeList.find(expense => expense.id === expense);
// console.log('selectedExpense', selectedExpense);
const selectedExpense = this.getDefaultExpenseType(expense);
console.log('selectedExpense', selectedExpense);
this.expenseTypeName = selectedExpense.name


    // this.isExpenseTypeSelected = true;
    // this.paymentType = '';
    // this.flexibleAmount = null;
    this.isExpenseTypeSelected = true;
    if(!this.editIndexPolicyToggle){
       this.isExpenseTypeSelected = true;
    this.paymentType = '';
    this.flexibleAmount = null;
    }

    // console.log('typeId expenseTypeName: ',this.expenseTypeName)

  }


  selectExpenseType1(expense: any) {
    console.log('expense: ', expense)
    this.expenseTypeName = expense.name
    this.expenseTypeId = expense.id

    // this.isExpenseTypeSelected = true;
    // this.paymentType = '';
    // this.flexibleAmount = null;
    this.isExpenseTypeSelected = true;
    if(!this.editIndexPolicyToggle){
       this.isExpenseTypeSelected = true;
    this.paymentType = '';
    this.flexibleAmount = null;
    }

    console.log('typeId: ',this.expenseTypeId)
    console.log('typeId expenseTypeName: ',this.expenseTypeName)

  }

  type: number = 0;
  onPaymentTypeChange(type: number, paymentType: string): void {
    this.type = type;
    this.expensePolicyReq.isFixed = paymentType
    this.paymentType = paymentType;
    if (this.paymentType === 'fixed') {
      this.flexibleAmount = null; // Clear flexible amount if "Fixed" is selected
    }
  }

  // staff selection
  itemPerPage: number = 8;
  pageNumber: number = 1;
  lastPageNumber: number = 0;
  total!: number;
  page = 0;
  itemsPerPage = 6;
  isLoading = false;
  totalCount: number = 0;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];
  selectedTeamName: string = 'All';
  selectedTeamId: number = 0;
  teamNameList: UserTeamDetailsReflection[] = [];
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

  //User selection in staff selection tab
  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;
  totalUserCount: number = 0;
  staffLoading: boolean = false;
  getUserByFiltersMethodCall1() {
    debugger;
    // this.staffs = [];
    this.staffLoading = true;
    // this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc', 'id',this.searchText,'',this.selectedTeamId
    this.dataService.getUsersByFilter(this.databaseHelper.itemPerPage ,this.databaseHelper.currentPage ,'asc', 'id',this.searchText,'',this.selectedTeamId
      ).subscribe(
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
          this.staffLoading = false
          // console.log(this.staffs);
        },
        (error) => {
          console.error(error);
        }
      );
  }

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

  searchUsers() {
    this.getUserByFiltersMethodCall();
  }

  clearSearchText() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }

  isAllUsersSelected: boolean = false;
  allselected: boolean = false;
  selectedStaffIds: number[] = [];

  // Method to toggle all users' selection
  selectAllUsers(isChecked: boolean) {
    debugger
    this.isAllUsersSelected = isChecked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked)); // Update each staff's selected property

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffIds list
      this.selectedStaffIdsUser=[];
      this.getAllUsersUuids().then((allUuids) => {
        console.log(allUuids);
        this.selectedStaffIdsUser = allUuids;
        this.staffs.forEach((element) => {
          element.checked = true;
        });
      });
    } else {
      this.selectedStaffIdsUser = [];
      this.staffs.forEach((element) => {
        element.checked = false;
      });
    }
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

  selectAll(checked: boolean) {
    debugger

    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffIds based on the current page selection
    if (checked) {

      this.staffs.forEach((staff) => {
        if (!this.selectedStaffIds.includes(staff.id)) {
          this.selectedStaffIds.push(staff.id);
        }
      });
    } else {
      this.staffs.forEach((staff) => {
        if (this.selectedStaffIds.includes(staff.id)) {
          this.selectedStaffIds = this.selectedStaffIds.filter(
            (uuid) => uuid !== staff.id
          );
        }
      });
    }

    // console.log('sel all Ids: ', this.selectedStaffIds)

  }

  // Asynchronous function to get all user UUIDs
  selectedStaffIdsUser: number[] = [];
  idOfLeaveSetting: number = 0

  async getAllUsersUuids(): Promise<number[]> {
    const response = await this.dataService
      .getUsersByFilterForLeaveSetting(
        this.total,
        1,
        'asc',
        'id',
        this.searchText,
        '',
        this.idOfLeaveSetting,
        this.selectedTeamId,
        this.selectedStaffIdsUser
      )
      .toPromise();

    return response.users.map((userDto: any) => userDto.id);
  }

  // Call this method when the select all users checkbox value changes
  onSelectAllUsersChange(event: any) {
    this.selectAllUsers(event.target.checked);
  }

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffIds = [];
    this.selectedStaffIdsUser = []
  }

  clearIds() {
    this.selectedStaffIdsUser = []
    this.staffs.forEach((staff, index) => {
      staff.checked = false;
    });
    this.allselected = false;
    this.showAllUser();

  }

  // ##### Pagination ############
  changePage(page: number | string) {
    this.allselected = false;
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

  /** switch tab end */


  // Submit Expense Policy Form
  submitExpensePolicy() {

  }

  deSelectedStaffIdsUser: number[] = [];
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

      if(this.updateToggle){
        this.tempCompanyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser
      }

      // console.log('selectedIds: ', this.selectedStaffIdsUser)
      // console.log('del: ', this.deSelectedStaffIdsUser)
    }

    console.log('selectedIds: ', this.selectedStaffIdsUser)
    console.log('del: ', this.deSelectedStaffIdsUser)

  }

  selectSingle1(event: any, i: any) {
    debugger
    if (event.checked) {
      this.allselected = false;

      if(this.updateToggle){
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
    }

    console.log('selectedIds: ', this.selectedStaffIdsUser)
    console.log('del: ', this.deSelectedStaffIdsUser)

  }

  showAllUser() {
    this.showMappedUserToggle = false;
    this.selectedUserIds = []
    this.getUserByFiltersMethodCall();
  }

  selectedStaffList: Staff[] = [];
  selectedUserIds: number[] = [];
  showMappedUserToggle: boolean = false;
  showMappedUser() {
    this.showMappedUserToggle = true;
    this.selectedUserIds = this.selectedStaffIdsUser

    this.getUserByFiltersMethodCall();

    // console.log('sele staff', this.staffs);
  }


  //Pagination
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  totalItems: number = 0;
  pageChanged(page: any) {
    this.allselected = false;
    if (page != this.databaseHelper.currentPage) {
      this.databaseHelper.currentPage = page;
      this.getUserByFiltersMethodCall();
    }
  }


  /**
   * Image upload start on Firebase
   */

  /** Image Upload on the Firebase Start */

  isFileSelected = false;
  imagePreviewUrl: any = null;
  selectedFile: any;
  isUploading: boolean = false;
  fileName: any;
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      this.fileName = file.name;
      // Check if the file type is valid
      if (this.isValidFileType(file)) {
        this.selectedFile = file;
        this.isUploading = true;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the loaded image as the preview
          this.imagePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(file);

        this.uploadFile(file);

        console.log('url is', this.expenseTypeReq.url)

      } else {
        element.value = '';
        this.expenseTypeReq.url = '';
        // Handle invalid file type here (e.g., show an error message)
        console.error(
          'Invalid file type. Please select a jpg, jpeg, or png file.'
        );
      }
    } else {
      this.isFileSelected = false;
    }
  }

  // Helper function to check if the file type is valid
  isInvalidFileType = false;
  isValidFileType(file: File): boolean {
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const fileType = file.type.split('/').pop(); // Get the file extension from the MIME type

    if (fileType && validExtensions.includes(fileType.toLowerCase())) {
      this.isInvalidFileType = false;
      return true;
    }
    // console.log(this.isInvalidFileType);
    this.isInvalidFileType = true;
    return false;
  }


  uploadFile(file: File): void {
    debugger;
    const filePath = `expense/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .toPromise()
      .then(() => {
        // console.log('Upload completed');
        fileRef
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            console.log('File URL:', url);
            this.isUploading = false;
            this.expenseTypeReq.url = url;
          })
          .catch((error) => {
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        console.error('Error in upload snapshotChanges:', error);
      });

    console.log('upload url is: ', this.expenseTypeReq.url)
  }

  /** Image Upload on Firebase End */

  /**
   * Create Expense Policy
   * we can edit/delete from expesenList by index
   */

  expensePolicyReqList: ExpensePolicy[] = [];
  expensePolicyReq: ExpensePolicy = new ExpensePolicy();
  tempPolicyName: string = ''
  policyAmount: string = ''
  isErrorShow: boolean = true;
  addExpensePolicy(form: NgForm){
    debugger

    this.tempPolicyName = this.policyName;
      this.expensePolicyReq.paymentType = this.type
      this.expensePolicyReq.limitAmount = this.flexibleAmount == null ? 0 : this.flexibleAmount
      this.expensePolicyReq.expenseTypeId = this.expenseTypeId
      this.expensePolicyReq.expenseTypeName = this.expenseTypeName
      this.expensePolicyReq.amount = Number(this.policyAmount)

      // this.paymentType = item.isFixed
      // this.thresholdType = item.isPercent
      // this.isThresholdSelected = item.isThresold

      // this.expensePolicyReq.paymentType = this.paymentType
      this.expensePolicyReq.isPercent = this.thresholdType == null ? '' : this.thresholdType
      this.expensePolicyReq.isThresold = this.isThresholdSelected
      this.expensePolicyReq.isFixed = this.paymentType
      this.expensePolicyReq.isPercentage = (this.thresholdType === 'value' ? 0 : 1 )
      this.policyAmount = this.policyAmount
      this.flexibleAmount = this.flexibleAmount

    if(!this.editIndexPolicyToggle){
      this.expensePolicyReqList.push(this.expensePolicyReq)
    }else{
      this.expensePolicyReqList[this.editIndex] = this.expensePolicyReq;
    }

    this.expensePolicyReq = new ExpensePolicy();
    this.expenseTypeName = this.tempPolicyName
    this.expenseTypeId = 0
    this.expenseTypeName = ''
    this.isExpenseTypeSelected = false;
    this.editIndexPolicyToggle = false;
    this.policyAmount = ''
    this.paymentType = '';
    this.flexibleAmount = null;
    this.editIndex = 0

    this.isErrorShow = false;
    this.resetThresholdOptions()
  }

  clearForm(form: NgForm){
    // this.companyExpensePolicyId = 0;
    // this.companyExpenseReq.id = 0
    // this.companyExpenseReq = new CompanyExpense();
    // this.tempCompanyExpenseReq = new CompanyExpense();
    this.clearPolicyForm();
    form.resetForm()
  }

  policyName: string = ''
  companyExpenseReq: CompanyExpense = new CompanyExpense();
  registerToggle: boolean = false
  @ViewChild('closeExpensePolicyModal') closeExpensePolicyModal!: ElementRef
   registerCompanyExpense1(form: NgForm) {
    debugger

    this.registerToggle = true;
    this.companyExpenseReq.policyName = this.tempPolicyName;
    this.companyExpenseReq.expensePolicyList = this.expensePolicyReqList
    this.companyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;
    this.companyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;

    console.log('Create: ',this.companyExpenseReq)

    // this.dataService.createExpensePolicy(this.companyExpenseReq).subscribe((res: any) => {
    //   if(res.status){
    //     this.closeExpensePolicyModal.nativeElement.click()
    //     form.resetForm()
    //     this.clearPolicyForm();
    //     this.getAllCompanyExpensePolicy()
    //     this.resetThresholdOptions()
    //     this.registerToggle = false
    //     if(this.isMappedUserModalOpen){
    //       this.usersAlreadyAssigned?.nativeElement.click();
    //       this.isMappedUserModalOpen = false
    //     }
    //     this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
    //   }
    // })

  }

  registerCompanyExpense(form: NgForm) {
    debugger

    this.registerToggle = true;

    if(this.isMappedUserModalOpen){
      this.companyExpenseReq.policyName = this.tempCompanyExpenseReq.policyName;
      this.companyExpenseReq.expensePolicyList = this.tempCompanyExpenseReq.expensePolicyList
      // this.companyExpenseReq.selectedUserIds = this.tempCompanyExpenseReq.selectedUserIds;
      this.companyExpenseReq.selectedUserIds = this.tempSelectedStaffIdsUser
      this.companyExpenseReq.deSelectedUserIds = this.tempCompanyExpenseReq.deSelectedUserIds;

    }else{
      // this.companyExpenseReq.id = 0
      this.companyExpensePolicyId = 0;
      this.companyExpenseReq.id = 0
      this.companyExpenseReq.policyName = this.tempPolicyName;
      this.companyExpenseReq.expensePolicyList = this.expensePolicyReqList
      this.companyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;
      this.companyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
    }

    if(this.updateToggle){
      this.companyExpenseReq.id = this.companyExpensePolicyId
      this.companyExpenseReq.policyName = this.pName
      // this.companyExpenseReq.removeUserIds = this.removeUserIds

      // combined which I have deselect from user list and I have select from duplicate user
      if (this.removeUserIds && this.removeUserIds.length > 0) {
        this.companyExpenseReq.deSelectedUserIds = [
          ...this.companyExpenseReq.deSelectedUserIds,
          ...this.removeUserIds
        ];
      }
    }

    if(this.tempExpPolicyId > 0){
      this.companyExpenseReq.id = this.tempExpPolicyId
    }

    // console.log('Create: ',this.companyExpenseReq)
    //      this.closeExpensePolicyModal.nativeElement.click()
    //     form.resetForm()
    //     this.clearPolicyForm();
    //     this.getAllCompanyExpensePolicy()
    //     this.resetThresholdOptions()
    //     this.registerToggle = false
    //     this.userMappedLoading = false;
    //     this.updateToggle = false;
    //     this.isValidated = false;
    //     this.tempSelectedStaffIdsUser = []
    //     this.oldSelectedStaffIdsUser = []

    //     this.companyExpensePolicyId = 0
    //     this.companyExpenseReq.id = 0
    //     this.tempExpPolicyId = 0
    //     this.policyName = ''
    //     this.tempPolicyName = ''
    //     if(this.isMappedUserModalOpen){
    //       this.usersAlreadyAssigned?.nativeElement.click();
    //       this.isMappedUserModalOpen = false
    //     }

    //     this.companyExpenseReq = new CompanyExpense();
    //     this.tempCompanyExpenseReq = new CompanyExpense();
    //     this.helperService.showToast('created', Key.TOAST_STATUS_SUCCESS);


    this.dataService.createExpensePolicy(this.companyExpenseReq).subscribe((res: any) => {
      if(res.status){
        this.closeExpensePolicyModal.nativeElement.click()
        form.resetForm()
        this.clearPolicyForm();
        this.getAllCompanyExpensePolicy()
        this.resetThresholdOptions()
        this.registerToggle = false
        this.userMappedLoading = false;
        this.updateToggle = false;
        this.isValidated = false;
        this.companyExpensePolicyId = 0
        this.companyExpenseReq.id = 0
        this.tempSelectedStaffIdsUser = []
        this.oldSelectedStaffIdsUser = []
        this.policyName = ''
        this.tempPolicyName = ''
        this.tempExpPolicyId = 0
        this.pName = ''
        if(this.isMappedUserModalOpen){
          this.usersAlreadyAssigned?.nativeElement.click();
          this.isMappedUserModalOpen = false
        }
        this.companyExpenseReq = new CompanyExpense();
        this.tempCompanyExpenseReq = new CompanyExpense();
        this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
      }else{
        this.clearPolicyForm();
        this.companyExpensePolicyId = 0
        this.companyExpenseReq.id = 0
      }
    })

  }

  registerCompanyExpenseWork(form: NgForm) {
    debugger

    this.registerToggle = true;

    if(this.isMappedUserModalOpen){
      this.companyExpenseReq.policyName = this.tempCompanyExpenseReq.policyName;
      this.companyExpenseReq.expensePolicyList = this.tempCompanyExpenseReq.expensePolicyList
      // this.companyExpenseReq.expensePolicyList = this.tempExpensePolicyReqList
      this.companyExpenseReq.selectedUserIds = this.tempCompanyExpenseReq.selectedUserIds;
      this.companyExpenseReq.deSelectedUserIds = this.tempCompanyExpenseReq.deSelectedUserIds;

    }else{
      // this.companyExpenseReq.id = 0
      this.companyExpenseReq.policyName = this.tempPolicyName;
      this.companyExpenseReq.expensePolicyList = this.expensePolicyReqList
      this.companyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;
      this.companyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
    }

    if(this.updateToggle){
      this.companyExpenseReq.id = this.companyExpensePolicyId
      this.companyExpenseReq.policyName = this.pName
      // this.companyExpenseReq.removeUserIds = this.removeUserIds

      // combined which I have deselect from user list and I have select from duplicate user
      if (this.removeUserIds && this.removeUserIds.length > 0) {
        this.companyExpenseReq.deSelectedUserIds = [
          ...this.companyExpenseReq.deSelectedUserIds,
          ...this.removeUserIds
        ];
      }

    }

    console.log('Create: ',this.companyExpenseReq)
         this.closeExpensePolicyModal.nativeElement.click()
        form.resetForm()
        this.clearPolicyForm();
        this.getAllCompanyExpensePolicy()
        this.resetThresholdOptions()
        this.registerToggle = false
        this.userMappedLoading = false;
        this.updateToggle = false;
        this.isValidated = false;

        this.companyExpensePolicyId = 0
        this.companyExpenseReq.id = 0
        this.policyName = ''
        this.tempPolicyName = ''
        if(this.isMappedUserModalOpen){
          this.usersAlreadyAssigned?.nativeElement.click();
          this.isMappedUserModalOpen = false
        }

        this.companyExpenseReq = new CompanyExpense();
        this.tempCompanyExpenseReq = new CompanyExpense();
        this.helperService.showToast('created', Key.TOAST_STATUS_SUCCESS);


    // this.dataService.createExpensePolicy(this.companyExpenseReq).subscribe((res: any) => {
    //   if(res.status){
    //     this.closeExpensePolicyModal.nativeElement.click()
    //     form.resetForm()
    //     this.clearPolicyForm();
    //     this.getAllCompanyExpensePolicy()
    //     this.resetThresholdOptions()
    //     this.registerToggle = false
    //     this.userMappedLoading = false;
    //     this.updateToggle = false;
    //     this.isValidated = false;
    //     this.companyExpensePolicyId = 0
    //     this.companyExpenseReq.id = 0
    //     this.policyName = ''
    //     this.tempPolicyName = ''
    //     this.pName = ''
    //     if(this.isMappedUserModalOpen){
    //       this.usersAlreadyAssigned?.nativeElement.click();
    //       this.isMappedUserModalOpen = false
    //       // this.tempCompanyExpenseReq = new CompanyExpense();
    //     }
    //     this.companyExpenseReq = new CompanyExpense();
    //     this.tempCompanyExpenseReq = new CompanyExpense();
    //     this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
    //   }else{
    //     this.clearPolicyForm();
    //     this.companyExpensePolicyId = 0
    //     this.companyExpenseReq.id = 0
    //   }
    // })

  }

  clearPolicyForm(){
    this.companyExpenseReq = new CompanyExpense();
    // this.tempCompanyExpenseReq = new CompanyExpense();

    this.expensePolicyReqList = []
    this.selectedStaffIdsUser = []
    this.deSelectedStaffIdsUser = []
    this.expenseTypeId = 0;
    this.expenseTypeId = 0
    this.expenseTypeName = ''
    this.isExpenseTypeSelected = false;
    this.allselected = false;
    this.policyName = ''
    this.tempPolicyName = ''
    this.paymentType = '';
    this.flexibleAmount = null;
    // this.companyExpensePolicyId = 0
    this.expenseTypeSelectionTab();

  }

  deleteExpensePolicy(index: number){
    this.expensePolicyReqList.splice(index, 1);

  }

  updateToggle: boolean = false
  editIndexPolicyToggle: boolean = false;
  editIndex: number = 0
  async editExpensePolicy(index: number){
    debugger
    this.editIndexPolicyToggle = true;
    this.editIndex = index;
    const item = this.expensePolicyReqList[index];

    console.log('update item: ',item)

    const defaultExpenseType = this.getDefaultExpenseType(item.expenseTypeId);

    this.selectExpenseType(defaultExpenseType)
    this.expensePolicyReq.paymentType = item.paymentType
    this.expensePolicyReq.limitAmount = item.limitAmount
    this.expensePolicyReq.expenseTypeId = item.expenseTypeId
    this.policyAmount = item.amount.toString()
    // this.paymentType = this.paymentType
    // this.isThresholdSelected = this.isThresholdSelected
    this.flexibleAmount = item.limitAmount
    // this.thresholdType = this.thresholdType
    // this.expensePolicyReq.expenseTypeName = this.expenseTypeName

    this.paymentType = item.isFixed
    this.thresholdType = item.isPercent
    this.isThresholdSelected = item.isThresold

    console.log('update expensePolicyReq: ',this.expensePolicyReq)
  }

   getDefaultExpenseType(id: number) {
    return this.expenseTypeList.find(expense => expense.id === id);
  }

  companyExpensePolicyList: CompanyExpensePolicyRes[] = [];
  // companyExpensePolicyList: CompanyExpensePolicyRes = new CompanyExpensePolicyRes();
  getAllCompanyExpensePolicy(){
    // this.companyExpensePolicyList =
    this.isLoading = true;
    this.databaseHelper.currentPage = 1;
    this.databaseHelper.itemPerPage = 10;
    this.dataService.getAllCompanyExpensePolicy(this.databaseHelper).subscribe((res: any) => {
      if(res.status){
        // this.companyExpensePolicyList = res.object
        this.companyExpensePolicyList = res.object
      }
      this.isLoading = false;
      console.log('lsit: ',this.companyExpensePolicyList)
    })
  }

  activeIndex: number | null = null;
  toggleCollapse(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  expensePolicyId: number = 0;
  expensePolicyTypeId: number = 0;
  expenseAppliedCount: number = 0;
  getExpensePolicyOrExpensePolicyTypeId(id: number, isExpensePolicy: boolean, expenseAppliedCount: number) {
    if (isExpensePolicy) {
      this.expensePolicyTypeId = 0;
      this.expensePolicyId = id;
    } else {
      this.expensePolicyId = 0;
      this.expensePolicyTypeId = id;
    }
  }

  deletePolicyToggle: boolean = false
  @ViewChild('closeButtonDeleteExpensePolicy') closeButtonDeleteExpensePolicy!: ElementRef
  deleteExpensePolicyById(){
    this.deletePolicyToggle = true;
    this.dataService.deleteCompanyExpensePolicy(this.expensePolicyId).subscribe((res: any) => {
      if(res.status){
          this.expensePolicyId = 0;
          this.deletePolicyToggle = false;
          this.getAllCompanyExpensePolicy();
          this.closeButtonDeleteExpensePolicy.nativeElement.click()
      }
    })
  }

  deleteExpensePolicyTypeById(){
    this.deletePolicyToggle = true;
    this.dataService.deleteCompanyExpenseTypePolicy(this.expensePolicyTypeId).subscribe((res: any) => {
      if(res.status){
          this.expensePolicyTypeId = 0;
          this.deletePolicyToggle = false;
          this.getAllCompanyExpensePolicy();
          this.closeButtonDeleteExpensePolicy.nativeElement.click()
      }
    })
  }

  // getExpenseInformationById(id: number, flag: boolean){

  // }


  thresholdType: string | null = null;
  thresholdAmount: number =0;
  onThresholdTypeChange(isPercentagFlag: number, type: string): void {
    this.thresholdType = type;
    this.expensePolicyReq.isPercentage = isPercentagFlag
    this.expensePolicyReq.isPercent = type

    this.thresholdAmount = 0; // Reset threshold amount when changing type
    console.log('thresold Type: ',this.expensePolicyReq.isPercentage)
  }

  private resetThresholdOptions(): void {
    this.isThresholdSelected = false;
    this.thresholdType = null;
    this.thresholdAmount = 0;
    this.flexibleAmount = null
    this.expensePolicyReq.isPercentage
  }


  isThresholdSelected: boolean = false;
  setThresold(isChecked: boolean): void {
    this.isThresholdSelected = isChecked;
    this.expensePolicyReq.isThresold = isChecked

    if(!isChecked){
      this.resetThresholdOptions()
    }
  }



  /** User already mapped  */
  closeModal(){

  }

  userNameWithBranchName: any[] = new Array();
  @ViewChild("closeButton") closeButton!:ElementRef;

  @ViewChild('usersAlreadyAssigned') usersAlreadyAssigned!: ElementRef
  tempSelectedStaffIdsUser: number[] = [];
  isMappedUserModalOpen: boolean = false;
  userMappedLoading: boolean = false;

  tempCompanyExpenseReq: CompanyExpense = new CompanyExpense();
  tempExpensePolicyReqList: ExpensePolicy[] = [];
  pName: string = ''
  getUserMappedWithPolicy(form: NgForm){
    debugger
    this.userMappedLoading = true;
    this.userNameWithBranchName = []
    this.dataService.getUserMappedWithPolicy(this.selectedStaffIdsUser, this.companyExpensePolicyId).subscribe((response: any) => {

      if(response.status){
        this.userNameWithBranchName = response.object;
        this.tempSelectedStaffIdsUser = this.selectedStaffIdsUser

        // Add temp request for create expense
        // this.tempExpensePolicyReqList = this.expensePolicyReqList
        this.pName = this.policyName
      this.tempCompanyExpenseReq.policyName = this.tempPolicyName;
      this.tempCompanyExpenseReq.expensePolicyList = this.expensePolicyReqList
      this.tempCompanyExpenseReq.selectedUserIds = this.selectedStaffIdsUser

      this.tempCompanyExpenseReq.deSelectedUserIds = this.userNameWithBranchName.map(item => item.id);

      }

      console.log('userLen: ',this.userNameWithBranchName.length)
        if( this.userNameWithBranchName.length != 0) {
          this.isMappedUserModalOpen = true;
          // console.log('Opening modal..')
          this.closeExpensePolicyModal.nativeElement.click();
          this.usersAlreadyAssigned.nativeElement.click();
          this.userMappedLoading = false;
        }else{
          // console.log('Going to create..')
          this.registerCompanyExpense(form);
        }

      },
      (error:any) => {
        console.log('error');
      }
    );
  }


  remainingIds: number[] = [];
  removeUserIds: number[] = [];
  removeUser(userId: number) {
    debugger

    // if(!this.updateToggle){
    //   this.deSelectedStaffIdsUser = []
    // }

    console.log('temp req: ',this.tempCompanyExpenseReq)

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
      this.tempCompanyExpenseReq.removeUserIds = this.removeUserIds;
    }else{
      this.deSelectedStaffIdsUser = this.remainingIds
      this.tempCompanyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
    }

    this.tempCompanyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;

    // if(this.removeUserIds.length > 0){
    //   if (this.tempCompanyExpenseReq.selectedUserIds.includes(userId)) {
    //     const index = this.tempCompanyExpenseReq.selectedUserIds.indexOf(userId);
    //     if (index > -1) {
    //       this.tempCompanyExpenseReq.selectedUserIds.splice(index, 1);
    //     }
    //   }
    // }

    // this.tempCompanyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
  }


  removeUser1(userId: number) {
    debugger
    this.deSelectedStaffIdsUser = []

    console.log('temp req: ',this.tempCompanyExpenseReq)

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
    this.deSelectedStaffIdsUser = this.remainingIds

    if(this.updateToggle){
      this.removeUserIds = this.remainingIds;
    }

    this.tempCompanyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;
    this.tempCompanyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
  }

  isValidated: boolean = false;
  checkValidation() {
    this.isValidated ? false : true;
  }


  /** User already mapped end */

  oldSelectedStaffIdsUser: number[] = []
  getExpenseInformationById1(companyExpense: CompanyExpensePolicyRes){

      debugger
      this.updateToggle = true;
      this.expensePolicyReq = new ExpensePolicy()

      console.log('expense obj: ',companyExpense)

      // const item = this.expensePolicyReqList[index];

      // console.log('update item: ',item)

      // const defaultExpenseType = this.getDefaultExpenseType(companyExpense.companyExpensePolicyTypeRes.expenseTypeId);

      // this.expensePolicyReqList = companyExpense.companyExpensePolicyTypeRes;


      companyExpense.companyExpensePolicyTypeRes.forEach((expenseType: any) => {
        this.expensePolicyReq.paymentType = expenseType.isFlexibleAmount
        this.expensePolicyReq.limitAmount = expenseType.flexibleAmount == null ? 0 : expenseType.flexibleAmount
        this.expensePolicyReq.expenseTypeId = expenseType.expenseTypeId
        this.expensePolicyReq.expenseTypeName = expenseType.expenseTypeName
        this.expensePolicyReq.amount = Number(expenseType.amount)

        // this.expensePolicyReq.isPercent = this.thresholdType == null ? '' : this.thresholdType
        // this.expensePolicyReq.isThresold = this.isThresholdSelected
        // this.expensePolicyReq.isFixed = this.paymentType
        this.expensePolicyReq.isPercentage = expenseType.isPercentage
        // this.expensePolicyReq.isPercentage = (this.thresholdType === 'value' ? 0 : 1 )

        this.expensePolicyReqList.push(this.expensePolicyReq)
      })

      console.log('expensePolicyReqList: ',this.expensePolicyReqList)

      this.staffs.forEach((staff, index) => {
        // this.staffs[index].checked = true;
        staff.checked = companyExpense.userIds.includes(staff.id);
      });

      companyExpense.userIds.forEach((id: number) => {
        this.selectedStaffIdsUser.push(id)

      });

      this.policyName = companyExpense.policyName

      // set expense type end

      // this.selectExpenseType(defaultExpenseType)
      // this.expensePolicyReq.paymentType = item.paymentType
      // this.expensePolicyReq.limitAmount = item.limitAmount
      // this.expensePolicyReq.expenseTypeId = item.expenseTypeId
      // this.policyAmount = item.amount.toString()

      // this.flexibleAmount = item.limitAmount

      // this.paymentType = item.isFixed
      // this.thresholdType = item.isPercent
      // this.isThresholdSelected = item.isThresold

      // this.updateToggle = false;

      console.log('update expensePolicyReq: ',this.expensePolicyReq)
  }

  companyExpensePolicyId: number = 0;
  tempExpPolicyId: number =0;
  getExpenseInformationById(companyExpense: CompanyExpensePolicyRes){

    debugger
    this.updateToggle = true;
    this.companyExpensePolicyId = companyExpense.id
    this.tempExpPolicyId = companyExpense.id;

    this.expensePolicyReq = new ExpensePolicy()
    this.expensePolicyReqList = []
    this.oldSelectedStaffIdsUser = []

    // console.log('expense obj: ',companyExpense)

    companyExpense.companyExpensePolicyTypeRes.forEach((expenseType: any) => {
      // Create a new instance for each `expenseType` to avoid reference issues
      const expensePolicyReq = {
        paymentType: expenseType.isFlexibleAmount,
        limitAmount: expenseType.flexibleAmount == null ? 0 : expenseType.flexibleAmount,
        expenseTypeId: expenseType.expenseTypeId,
        expenseTypeName: expenseType.expenseTypeName,
        amount: Number(expenseType.amount),
        isPercentage: expenseType.isPercentage,
        isThresold: false,
        isFixed: (expenseType.isFlexibleAmount == 1 ? 'fixed' : ''),
        isPercent: ''
      };

      // Push the new object into the list
      this.expensePolicyReqList.push(expensePolicyReq);
    });

    // console.log('type list: ',this.expensePolicyReqList)

    this.staffs.forEach((staff) => {
      staff.checked = companyExpense.userIds.includes(staff.id);
    });

    companyExpense.userIds.forEach((id: number) => {
      this.selectedStaffIdsUser.push(id)
      this.oldSelectedStaffIdsUser.push(id)
    });

    // this.oldSelectedStaffIdsUser = this.selectedStaffIdsUser
    console.log('old sel IDS: ',this.oldSelectedStaffIdsUser)

    this.policyName = companyExpense.policyName
    this.updateToggle = true;

    // console.log('update expensePolicyReq: ',this.expensePolicyReq)
}


/** Set Excel data start */

isShimmer: boolean = false;
isProgressToggle: boolean = false;
isErrorToggle: boolean = false;
onboardUserList: any[] = new Array();
errorMessage: string =''
currentFileUpload: any;
expectedColumns: string[] = ['Expense Id', 'Settled Amount', 'Transaction Id', 'Payment Method', 'Lapse Remaining Amount'];
correctColumnName: string[] = ['S.No.', 'Submitted Date', 'Expense Id', 'Employee Name', 'Expense Type', 'Expense Date', 'Notes', 'Bill Snapshot', 'Expense Amount', 'Settled Amount', 'Transaction Id', 'Payment Method', 'Lapse Remaining Amount'];


fileColumnName:string[] = [];
isExcel: string = '';
data: any[] = new Array();
 dataWithoutHeader:any=[];
mismatches: string[] = [];
invalidRows: boolean[] = []; // Track invalid rows
invalidCells: boolean[][] = []; // Track invalid cells
isinvalid: boolean=false;
jsonData:any[]=[];
validateMap: Map<string, string[]> = new Map();
@ViewChild('attention') elementToScroll!: ElementRef;

selectFile(event: any) {
  this.validateMap= new Map();
  this.isinvalid = true
  debugger
  if (event.target.files && event.target.files.length > 0) {
    const file = event.target.files[0];
    this.currentFileUpload = file;
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const binaryStr = this.arrayBufferToString(arrayBuffer);
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      this.jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Reset data and error tracking
      this.data = [];
      this.invalidRows = [];
      this.invalidCells = [];
      this.validateMap.clear;

      const columnNames: string[] = this.jsonData[0] as string[];

      debugger
      if (this.validateColumns(columnNames)) {
        this.data = this.jsonData
        .map((row: any[]) => {
          // Ensure each cell is processed
          return row.map((cell: any, index: number) => {
            if (this.data.length === 0) {
              // For the first row, treat all cells as strings
              return cell ? cell.toString().trim() : '';
            } else {
              // Validate date format MM-DD-YYYY
              const isExactFormat = /^\d{2}-\d{2}-\d{4}$/.test(cell);

              // Replace '/' with '-' if present
              if (typeof cell === 'string') {
                cell = cell.replace(/\//g, '-');
              }

              if (isExactFormat) {
                // Parse the date strictly in MM-DD-YYYY format
                const formattedDate = moment(cell, 'yyyy-MM-dd', true);

                // Check if the date is valid and within the next year
                if (formattedDate.isValid()) {
                  const oneYearFromNow = moment().add(1, 'year');

                  if (formattedDate.isBefore(oneYearFromNow)) {
                    return formattedDate.format('yyyy-MM-dd'); // Standard format
                  }
                }
              }
              // Convert other cells to string and trim whitespace
              return cell ? cell.toString().trim() : '';
            }
          });
        })
        .filter((row: any[]) =>
          // Filter out rows where all cells are empty
          row.some((cell: any) => cell !== '')
        );

        this.validateMap.forEach((values, key) => {
          console.log(`Key: ${key}`);
          this.mismatches.push(`Repeating values: "${key}" at row no. ${values}`);
          if(this.elementToScroll){
          this.elementToScroll!.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log('Values:', values);
          }
        });
        // this.totalPage = Math.ceil(this.data.length / this.pageSize);
        this.totalPage = 10;

        // if(this.areAllFalse() && this.mismatches.length===0){
        //   this.isinvalid=false;
        //   this.uploadUserFile(file, this.fileName);
        // }else{
        //   this.isinvalid=true;
        // }

        this.updatePaginatedData();

      } else {
        console.error('Invalid column names');
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

selectAllCurrentPage = false;
selectAllPages = false;
paginatedData: any[] = [];

updatePaginatedData() {
  // Calculate the start index for pagination
  let start = (this.currentPage - 1) * this.pageSize;

  // Adjust start to consider data indexing
  start = start + 1;

  // Slice the data based on the calculated start and page size
  this.paginatedData = this.data.slice(start, start + this.pageSize);
  }

// Method to write
saveFileWhichCreateExcel(data: any[]): void {
  // Step 1: Convert data to a worksheet format
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Step 2: Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Step 3: Write the workbook as a binary Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Step 4: Create a blob and prompt download
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'data.xlsx');
}

saveFile() {
  debugger

  this.validateRowToggle = false

  const stringifiedData = this.data.map((row: any[]) =>
    row.map(cell => cell !== null && cell !== undefined ? String(cell) : '')
  );
  const ws = XLSX.utils.aoa_to_sheet(stringifiedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  // saveAs(blob, 'edited_file.xlsx');
  this.validateMap.clear;

  const file = new File([blob], 'edited_file.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

// Create a fake event to pass to selectFile
// const event = new Event('change');
// Object.defineProperty(event, 'target', { writable: false, value: { files: dataTransfer.files } });
// this.selectFile(event);

  this.validateRows(this.data.slice(1));

  // if(this.validateRowToggle){
  //   this.updatePaginatedData();
  // }else{
  //   this.uploadUserFile(file, 'edited_file.xlsx');
  // }

setTimeout(() => {
   if(this.validateRowToggle){
    this.updatePaginatedData();
  }else{
    this.uploadUserFile(file, 'edited_file.xlsx');
  }
}, 300)
// }, 200)

// setTimeout(() =>{
//   if(!this.validateRowToggle){
//     this.uploadUserFile(file, 'edited_file.xlsx');
//   }
// },200)

}

importToggle: boolean = false;
@ViewChild('closeButtonExcelModal') closeButtonExcelModal!: ElementRef
uploadUserFile(file: any, fileName: string) {
  debugger;
  this.importToggle = true;
  this.isProgressToggle = true;
  this.isErrorToggle = false;
  this.errorMessage = '';
  this.dataService.importExpense(file, fileName).subscribe(
    (response: any) => {
      if (response.status) {
        this.importToggle = false;
        this.isProgressToggle = false;
        this.getExpenses();
        this.closeButtonExcelModal.nativeElement.click()

        this.data = []
        this.isinvalid = false;
        this.fileColumnName = []
        this.paginatedData = []

      } else {
        this.importToggle = true;
        this.isErrorToggle = true;
        this.isProgressToggle = false;
        this.errorMessage = response.message;
      }
    },
    (error) => {
      this.importToggle = true;
      this.isErrorToggle = true;
      this.isProgressToggle = false;
      this.errorMessage = error.error.message;
    }
  );
}


currentPage: number = 1;
pageSize: number = 10; // Adjust based on your requirements
totalPage: number = 0;

onPageChange(page: number) {
  // this.bulkShift=null;
  // this.bulkLeave=[];
  // this.bulkTeam=[];
  // this.selectAllCurrentPage=false;
  this.currentPage = page;
}

  // firstUpload:boolean=true;
  // areAllFalse(): boolean {
  //   if(this.firstUpload===true){
  //     this.firstUpload=false;
  //     return false;
  //   }
  //   return this.invalidCells
  //     .reduce((acc, row, rowIndex) => {
  //       return acc.concat(row.filter((_, colIndex) => this.expectedColumns[colIndex] !== "LeaveNames"));
  //     }, [])
  //     .every(value => value === false);
  // }

  arrayBufferToString(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    let binaryStr = '';
    for (let i = 0; i < byteArray.length; i++) {
      binaryStr += String.fromCharCode(byteArray[i]);
    }
    return binaryStr;
  }


  validateColumns(columnNames: string[]): boolean {
    debugger
    this.mismatches = []; // Reset mismatches

    const normalizedColumnNames = columnNames.map(col => col.trim());
    this.fileColumnName=normalizedColumnNames;
    const normalizedExpectedColumns = this.expectedColumns.map(col => col.trim());
    const normalizedCorrectColumns = this.correctColumnName.map(col => col.trim());

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

  readonly constants = constant;
  validateRowToggle: boolean = false;
  duplicateTransactionId: boolean = false;
  //  validateRows(rows: any[]): void {
  async validateRows(rows: any[]): Promise<void> {
    debugger;

    this.invalidRows = new Array(rows.length).fill(false); // Reset invalid rows
    this.invalidCells = Array.from({ length: rows.length }, () => new Array(this.expectedColumns.length).fill(false)); // Reset invalid cells

    const transactionIdIndex = this.fileColumnName.indexOf('Transaction Id'); // Get the column index for 'Transaction Id'
    const transactionIdMap: { [key: string]: number[] } = {}; // Map to track transaction ids and their corresponding row indices


    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < this.fileColumnName.length; j++) {
        const cellValue = rows[i][j];
        this.invalidCells[i][j] = false;

        if (this.fileColumnName[j] === 'Expense Id') {
          // Validate that the field is a non-empty string
          if (!cellValue || typeof cellValue !== 'string' || cellValue.trim() === '') {
            this.validateRowToggle = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }
        }

        // Expense Amount should be greater than 0 and not be empty
        if (this.fileColumnName[j] === 'Expense Amount') {
          // Check if the field is empty or invalid
          if (!cellValue || cellValue.toString().trim() === '') {
            this.validateRowToggle = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true;
          } else {
            // Ensure the field is a number and greater than 0
            const numericValue = parseFloat(cellValue);
            if (isNaN(numericValue) || numericValue <= 0) {
              this.validateRowToggle = true;
              this.invalidRows[i] = true;
              this.invalidCells[i][j] = true;
            }
          }
        }

      // Settled amount should be less from Expense amount'
      if (this.fileColumnName[j] === 'Settled Amount') {
        // Check if the field is empty or invalid
        if (!cellValue || cellValue.toString().trim() === '') {
          this.validateRowToggle = true;
          this.invalidRows[i] = true;
          this.invalidCells[i][j] = true;
        } else {
          // Ensure the field is a number and greater than 0
          const numericValue = parseFloat(cellValue);
          if (isNaN(numericValue) || numericValue <= 0) {
            this.validateRowToggle = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true;
          } else {
            // Validate that "Settled Amount" is less than "Expense Amount"
            const amountIndex = this.fileColumnName.indexOf('Expense Amount');
            if (amountIndex !== -1) {
              const amountValue = parseFloat(rows[i][amountIndex]);
              if (isNaN(amountValue) || numericValue > amountValue) {
                this.validateRowToggle = true;
                this.invalidRows[i] = true;
                this.invalidCells[i][j] = true; // Mark the "Settled Amount" cell as invalid
              }
            }
          }
        }
      }


      // If you have enter here then the values accpet only 'Online', 'Cash' otherwise not
        if (this.fileColumnName[j] === 'Payment Method1') {
          // Validate that the field contains only 'Online' or 'Cash'
          const validPaymentMethods = ['ONLINE', 'CASH'];
          // if (!cellValue || !validPaymentMethods.includes(cellValue.trim())) {
            if (!cellValue || !validPaymentMethods.includes(cellValue.trim().toUpperCase())) {
            this.validateRowToggle = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }
        }

        if (this.fileColumnName[j] === 'Payment Method') {
          // Validate that the field is a non-empty string
          if (!cellValue || typeof cellValue !== 'string' || cellValue.trim() === '') {
            this.validateRowToggle = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }
        }

        if (this.fileColumnName[j] === 'Transaction Id') {
          // Validate that the field is a non-empty string
          if (!cellValue || typeof cellValue !== 'string' || cellValue.trim() === '') {
            this.validateRowToggle = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }

          const paymentMethodIndex = this.fileColumnName.indexOf('Payment Method');
          const paymentMethod = paymentMethodIndex !== -1 ? rows[i][paymentMethodIndex]?.toString().trim() : null;

          if (paymentMethod) {
            if (paymentMethod.toUpperCase() === 'CASH') {
              this.invalidCells[i][j] = false;
              this.invalidRows[i] = false;
              this.invalidCells[i][j] = false;
            }else if (paymentMethod.toUpperCase() === 'ONLINE') {
              // If Payment Method is 'Online', Transaction Id must not be empty
              if (!cellValue || cellValue.toString().trim() === '') {
                this.validateRowToggle = true;
                this.invalidRows[i] = true;
                this.invalidCells[i][j] = true; // Mark the Transaction Id cell as invalid
              } else {
                // Valid case for 'Online'
                this.invalidCells[i][j] = false;
              }
            }
        }
      }

        // If you have Entered 'Online' then transactin ID is mandotary, for cash it is not
        if (this.fileColumnName[j] === 'Transaction Id1') {
          // Find the index of the 'Payment Method' column
          const paymentMethodIndex = this.fileColumnName.indexOf('Payment Method');
          const paymentMethod = paymentMethodIndex !== -1 ? rows[i][paymentMethodIndex]?.toString().trim() : null;

          if (paymentMethod) {
            if (paymentMethod.toUpperCase() === 'CASH') {

              this.invalidCells[i][j] = false;
              this.invalidRows[i] = false;
              this.invalidCells[i][j] = false;

            } else if (paymentMethod.toUpperCase() === 'ONLINE') {
              // If Payment Method is 'Online', Transaction Id must not be empty
              if (!cellValue || cellValue.toString().trim() === '') {
                this.validateRowToggle = true;
                this.invalidRows[i] = true;
                this.invalidCells[i][j] = true; // Mark the Transaction Id cell as invalid
              } else {
                // Valid case for 'Online'
                this.invalidCells[i][j] = false;
              }
            }
          } else {
            // Invalid Payment Method: Mark Transaction Id as invalid (optional)
            this.validateRowToggle = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true;
          }
        }

        // If you are putting Yes, No then then function will accept only this not another values
        if (this.fileColumnName[j] === 'Lapse Remaining Amount') {
          // Valid values are 'YES' or 'NO'
          const validLapsePaymentAmount = ['YES', 'NO'];

          // Convert cellValue to uppercase and check if it's in the valid set
          if (cellValue && !validLapsePaymentAmount.includes(cellValue.trim().toUpperCase())) {
            // If there's a value, it must be 'YES' or 'NO' (case insensitive)
            this.validateRowToggle = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          } else if (!cellValue || cellValue.trim() === '') {
            // If the field is empty, allow it to be empty
            this.invalidRows[i] = false;
            this.invalidCells[i][j] = false; // Allow empty field
          }
        }


        // If Settled Amount is less than from Expense amount then this function will call
        if (this.fileColumnName[j] === 'Lapse Remaining Amount') {
          const settledAmountIndex = this.fileColumnName.indexOf('Settled Amount');
          const amountIndex = this.fileColumnName.indexOf('Expense Amount');

          const lapseAmount = cellValue ? parseFloat(cellValue) : null;
          const settledAmount = rows[i][settledAmountIndex] ? parseFloat(rows[i][settledAmountIndex]) : null;
          const amount = rows[i][amountIndex] ? parseFloat(rows[i][amountIndex]) : null;

          // Check if "Settled Amount" is less than "Amount" and "Lapse Amount" is empty
          if (settledAmount != null && amount != null && settledAmount < amount && (lapseAmount == null || lapseAmount <= 0)) {
            this.validateRowToggle = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true; // Mark "Lapse Amount" cell as invalid
          }
        }


       // Validate Duplicate 'Transaction Id' field (If transaction Id is duplicate from the DATABASE then will show error)
       if (this.fileColumnName[j] === 'Transaction Id') {
        const transactionIdIndex = this.fileColumnName.indexOf('Transaction Id');
        const transactionId = transactionIdIndex !== -1 ? rows[i][transactionIdIndex]?.toString().trim() : null;

        // Await the transaction ID check
        try {
          const exists = await this.existTransactionIdExcel(transactionId);
          // console.log('Transaction ID exists: ', exists);

          if (exists) {
            this.validateRowToggle = true;
            // this.duplicateTransactionId = true;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }
        } catch (error) {
          console.error('Error checking transaction ID:', error);
          // Handle any errors, you could mark this row as invalid if needed
          this.invalidRows[i] = true;
          this.invalidCells[i][j] = true; // Mark the cell as invalid
        }
      }

      // Check LOCALLY duplicate transaction Id (which is in the input field) start

      if (this.fileColumnName[j] === 'Transaction Id') {
        // Validate non-empty and non-whitespace string
        if (cellValue) {
          // Track transaction ID occurrences
          const trimmedValue = cellValue.trim();
          if (!transactionIdMap[trimmedValue]) {
            transactionIdMap[trimmedValue] = [];
          }
          transactionIdMap[trimmedValue].push(i);
        }
      }

      // Second Pass: Mark duplicates
      for (const [transactionId, rowIndices] of Object.entries(transactionIdMap)) {
        if (rowIndices.length > 1) {
          // Mark all rows containing the duplicate transaction ID
          for (const rowIndex of rowIndices) {
            this.validateRowToggle = true;
            this.invalidRows[rowIndex] = true;
            this.invalidCells[rowIndex][transactionIdIndex] = true; // Mark the specific 'Transaction Id' cell as invalid
          }
        }
      }
    //end


      //over all end

      }

    }
  }

  public existTransactionIdExcel(tranId: any): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.dataService.checkExpenseTransactionId(tranId).subscribe(
        (res: any) => {
          if (res.status && res.object) {
            resolve(true);  // Transaction ID exists
          } else {
            resolve(false);  // Transaction ID does not exist
          }
        },
        (error) => {
          console.error('Error checking transaction ID:', error);
          reject(false);  // Reject the promise in case of an error
        }
      );
    });
  }

  isDuplicateTrnxId: boolean = false;
   isDuplicate(value: string, currentRowIndex: number, rows: any) {
    // this.invalidRows = new Array(rows.length).fill(false);
console.log('calling....')
    // if (!value) return false; // Ignore empty values
    let duplicateCount = 0;

    // Check the "Transaction ID" column across all rows
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]['Transaction Id'] === value) {
        duplicateCount++;
        if (duplicateCount > 1 && i !== currentRowIndex) {
           this.isDuplicateTrnxId = true; // Duplicate found
        }
      }
    }
    this.isDuplicateTrnxId = false;
  }



/** Set Excel data end */


tagsFilteredOptions: string[] = [];
tags: string[] = [];
fetchedTags: string[] = [];
searchTag: string = '';
currentId:number =0;

addTag(): void {
  if (this.searchTag && !this.tags.includes(this.searchTag)) {
    this.tags.push(this.searchTag);
    this.searchTag = ''; // Clear input field after adding
  } else if (this.searchTag) {
    this.helperService.showToast(this.searchTag + ' is Already Added', Key.TOAST_STATUS_ERROR);
  } else if (!this.searchTag) {
    this.helperService.showToast('Empty field cannot be added ', Key.TOAST_STATUS_ERROR);
  }
  this.tagsFilteredOptions = [];
}
checkTagsArraysEqual(): boolean {

  if (this.tags.length !== this.fetchedTags.length) {
    return false;
  }

  // Sort both arrays and compare each element
  const sortedArr1 = [...this.tags].sort();
  const sortedArr2 = [...this.fetchedTags].sort();

  return sortedArr1.every((value, index) => value === sortedArr2[index]);
}

removeTag(skill: string): void {
  const index = this.tags.indexOf(skill);
  if (index !== -1) {
    this.tags.splice(index, 1);
  }
}

onTagsChange(value: string): void {

  this.tagsFilteredOptions = this.fetchedTags.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase()) &&
    !this.tags.includes(option)
  );

}
preventLeadingWhitespace(event: KeyboardEvent): void {
  const inputElement = event.target as HTMLInputElement;

  // Prevent space if it's the first character
  if (event.key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }
  if (!isNaN(Number(event.key)) && event.key !== ' ') {
    event.preventDefault();
  }
}
isTagsLoading:boolean=false;
isTagsEditEnabled:boolean=false;

saveTags() {
  this.isTagsLoading = true;
  this.dataService.saveTags(this.currentId, this.tags).subscribe({
    next: (response) => {
      this.isTagsLoading = false;
      this.searchTag = '';
      this.getExpenses();
      this.isTagsEditEnabled = false;
      this.helperService.showToast('Tags saved successfully', Key.TOAST_STATUS_SUCCESS);
    },
    error: (error) => {
      this.isTagsLoading = false;
      this.searchTag = '';
      this.getExpenses();
      this.helperService.showToast('Error saving tags', Key.TOAST_STATUS_ERROR);
      console.error('Error saving skills:', error);
    },
  });
}

filteredOptions: string[] = [];
  selectedFilter: string = '';
  private searchSubject: Subject<string> = new Subject<string>();
  searchedName: string = '';
  onSearch(value: string): void {
    this.filteredOptions = this.fetchedTags.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
  }

  onOptionSelect(): void {
    if (this.selectedFilter === null) {
      this.selectedFilter = '';
    }
    this.getExpenses();
  }

  onExpenseSearch(value: string): void {
    this.searchedName = value;
    this.searchSubject.next(value);
  }


getTags(type: string): void {
  this.dataService.getTagsByOrganizationIdAndType(type).subscribe({
    next: (data) => {
      this.fetchedTags = data?.tagsList;
      console.log('Tags fetched:', data);
    },
    error: (err) => {
      console.error('Error fetching tags:', err);
    },
  });
}

}
