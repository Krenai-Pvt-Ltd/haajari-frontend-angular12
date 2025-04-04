import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { Color } from 'chart.js';
import moment from 'moment';
import { Key } from 'src/app/constant/key';
import { ApproveReq } from 'src/app/models/ApproveReq';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { User } from 'src/app/models/user';
import { UserDto } from 'src/app/models/user-dto.model';
import { DataService } from 'src/app/services/data.service';
import { ExpenseService } from 'src/app/services/expense.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { constant } from 'src/app/constant/constant';


@Component({
  selector: 'app-expense-management',
  templateUrl: './expense-management.component.html',
  styleUrls: ['./expense-management.component.css']
})
export class ExpenseManagementComponent implements OnInit {

  constructor(private dataService: DataService, private expenseService: ExpenseService, private helperService: HelperService,private cdr: ChangeDetectorRef,
    private rbacService: RoleBasedAccessControlService, private afStorage: AngularFireStorage) { }

  showFilter: boolean = false;
  ROLE: any;
  userId: any;
  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get(
      'userId'
    );
    this.userId = userUuidParam?.toString() ?? ''
    this.selectedStatus = [];
    this.getPendingTransactionCount();
    // this.getExpenses();
    this.getExpensesCount();
    // this.getWalletUser();
    this.getRole();
    this.fetchDashboardData();
  }

  changeShowFilter(flag : boolean) {
    this.showFilter = flag;
  }

  companyWalletChangeShowFilter(flag : boolean){
    this.changeShowFilter(flag);
    this.getUsersByFilterMethodCall();
  }

  async getRole(){
    this.ROLE = await this.rbacService.getRole();
  }


  // dashboard(): void {
  //   this.resetFilters()
  // }


   /** Create and View Expense start */
  
   expenseList: any[] = new Array();
   loading: boolean = false;
   totalItems: number = 0
   databaseHelper: DatabaseHelper = new DatabaseHelper();
   statusIds: number[] = new Array();
   startDate: any;
   endDate: any;
   startDateStr: string =''
   endDateStr: string =''
   expenseSelectedDate: Date = new Date();
   selectedFilters: string[] = [];
   tempSelectedFilter: string[] = [];

   dateFilters: { key: string; value: string }[] = [];

   filters:{
    fromDate: any|undefined;
    toDate: any|undefined;
  
  }  = {
    fromDate: undefined,
    toDate: undefined
  };

  displayDateFormat: string = 'DD-MM-YYYY'; // Date format for date picker
  displayDateFormatNew: string = 'YYYY-MM-DD';
  networkDateFormat: string = "yyyy-MM-DD HH:mm:ss";

  // Disable dates greater than 'fromDate' for the 'toDate' field
  disabledDateTo = (current: Date): boolean => {
    return current && this.filters.fromDate && current <= this.filters.fromDate;
  };

  // Disable dates earlier than 'toDate' for the 'fromDate' field (if needed)
  disabledDateFrom = (current: Date): boolean => {
    return current && this.filters.toDate && current >= this.filters.toDate;
  };

  expenseRequest(){
    this.databaseHelper.currentPage = 1;
    this.databaseHelper.itemPerPage = 10;
    this.resetFilters();
    this.getPendingTransactionCount();
    this.statusIds = [13];
    this.selectedStatus = ['Pending'];
    this.tempSelectedFilter = ['Pending'];
  }

   requestsSearch: string = '';
   status13Count: number = 0;

   getPendingTransactionCount() {
    const pendingStatusId: number = 13;

    this.dataService.countPendingTransaction(pendingStatusId).subscribe((res: any) => {
      if (res.status) {
        this.status13Count = res.object;
      }else{
        this.status13Count = 0;
      }
    })
}


    async getExpenses() {
     debugger
     this.loading = true;
     this.expenseList = []
     this.ROLE = await this.rbacService.getRole();
  
     if (this.filters.fromDate !== undefined && this.filters.toDate !== undefined) {
      this.startDate = moment(this.filters.fromDate).format(this.networkDateFormat);
      this.endDate = moment(this.filters.toDate).format(this.networkDateFormat);
    } else {
        this.startDate = undefined;
        this.endDate = undefined;
    }

    // this.startDate =( new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth(), 1).toISOString().split('T')[0])+ " 00:00:00";
    // this.endDate = (new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth() + 1, 0).toISOString().split('T')[0])+ " 23:59:59";
    
    console.log("Start Date :",this.startDate)
    console.log("End Date :", this.endDate);
    this.expenseList = []
     this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate, this.statusIds, this.userId,'',this.requestsSearch).subscribe((res: any) => {
       if (res.status) {
         this.expenseList = res.object
         this.totalItems = res.totalItems
         this.selectedFilters = this.tempSelectedFilter.map(status => `Status: ${status}`);
         this.dateFilters = [...this.tempDateFilters];

         console.log('expenseList: ',this.expenseList)
  
         this.loading = false;
       }else{
        this.selectedFilters = this.tempSelectedFilter.map(status => `Status: ${status}`);
        this.dateFilters = [...this.tempDateFilters];
        this.expenseList = [];
        this.loading = false;
       }
     })
   }

   searchByNameRequest(event: Event): void {
    this.requestsSearch = (event.target as HTMLInputElement).value;
    this.databaseHelper.currentPage = 1;
    this.getExpenses();

  }

   pageChanged(page:any) {
    debugger
    this.databaseHelper.currentPage = page;
    this.getExpenses();
  }
  
  expenseCount: any;
  async getExpensesCount() {
    debugger
    this.expenseCount = []
    this.ROLE = await this.rbacService.getRole();
  
    if(this.expenseSelectedDate == null){
      this.startDate = '';
      this.endDate = '';
    }
  
    this.dataService.getAllExpenseCount(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDateStr, this.endDateStr, this.userId).subscribe((res: any) => {
      if (res.status) {
        this.expenseCount = res.object
  
        console.log('expenseCount: ',this.expenseCount)
  
      }else{
       this.expenseCount = []
       this.loading = false
      }
    })
  }

  statusMap: { [label: string]: number[] } = {
    "Pending": [13],
    "Approved": [14, 40, 53, 46, 41],
    "Rejected": [15]
  };

  selectedStatus: string[] = [];
  

  // Get All Unique Status Labels
  getStatusLabels(): string[] {
    return Object.keys(this.statusMap);
  }

  // Update Selected Status and IDs
  updateStatusIds(selectedLabels: string[]) {
    this.statusIds = [];

    selectedLabels.forEach(label => {
      if (this.statusMap[label]) {
        this.statusIds.push(...this.statusMap[label]);
      }
    });

    this.tempSelectedFilter = selectedLabels;

    console.log('Updated statusIds:', this.statusIds);
    console.log('Selected Filters:', this.tempSelectedFilter);
  }

  tempDateFilters: { key: string; value: string }[] = [];
  
  applyFilters() {
    this.databaseHelper.currentPage = 1;
    console.log("Selected Status IDs:", this.statusIds);
    if (this.filters.fromDate && this.filters.toDate) {
        this.tempDateFilters = [];
        const fromDate = moment(this.filters.fromDate).format(this.displayDateFormat);
        const toDate = moment(this.filters.toDate).format(this.displayDateFormat);
        this.tempDateFilters.push({ key: 'Date', value: `${fromDate} to ${toDate}` });
      }
    this.getExpenses();
    this.showFilter = false;
  }

  resetFilters() {
    this.statusIds = []; 
    this.selectedStatus = []; 
    this.tempSelectedFilter = [];
    this.tempDateFilters = [];
    this.filters = { fromDate: undefined, toDate: undefined };  

    console.log("Filters reset. Fetching all expenses...");

    this.getExpenses();  
}

removeFilter(filter: string) {
  const statusName = filter.replace("Status: ", ""); 
  const statusIdsToRemove = this.statusMap[statusName] || []; 

  if (statusIdsToRemove.length > 0) {
      this.statusIds = this.statusIds.filter(id => !statusIdsToRemove.includes(id));
      this.tempSelectedFilter = this.tempSelectedFilter.filter(f => f !== statusName);
      this.selectedStatus = this.selectedStatus.filter(f => f !== statusName);
  }
  this.selectedFilters = this.tempSelectedFilter.map(status => `Status: ${status}`);
  this.getExpenses();
  console.log("Removed Status:", statusName);
  console.log("Updated Filters:", this.tempSelectedFilter);
  console.log("Updated Status IDs:", this.statusIds);
}



removeDateFilter(filter: { key: string; value: string }): void {
  this.tempDateFilters = [];
  this.filters = { fromDate: undefined, toDate: undefined };

  console.log("RemoveDate FilterM Start Date :",this.filters.fromDate)
  console.log("End Date :", this.filters.fromDate);
  this.changeShowFilter(false);
  this.applyFilters();
}

getStartIndex(): number {
  return (this.databaseHelper.currentPage - 1) * this.databaseHelper.itemPerPage + 1;
}

getEndIndex(): number {
  const endIndex = this.databaseHelper.currentPage * this.databaseHelper.itemPerPage;
  return endIndex > this.totalItems ? this.totalItems : endIndex;
}


expenseData: any= {
  expense: {}
};
showExpenseComponent: boolean = false;
@ViewChild('closeApproveModal') closeApproveModal!: ElementRef

onExpenseComponentClose() {
  this.getExpenses();
  this.closeApproveModal.nativeElement.click();
  this.showExpenseComponent = false;
}

openExpenseComponent(expense: any) {
  this.clearApproveModal(); 
  this.expenseData = { expense };
  setTimeout(() => {
    this.showExpenseComponent = true;
  }, 1);
}



  approveReq: ApproveReq = new ApproveReq();
  approveToggle: boolean = false;
  rejectToggle: boolean = false;
  paymentCashYesToggle: boolean = false;
  paymentCashNoToggle: boolean = false;

  approveAmountChecked: boolean = false; 
  approvedAmount: string = '';
  tags: string[] = [];

  isCheckboxChecked: boolean = false
  partialAmount: string = '';
  onCheckboxChange(checked: boolean): void {
    this.isCheckboxChecked = checked;
    if (!checked) {
      this.partialAmount = '';
    }
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
    this.expenseData = {};
  }

  tagsFilteredOptions: string[] = [];

  fetchedTags: string[] = [];
  searchTag: string = '';
  currentId:number =0;
  rejectDiv: boolean = false;
  showExpenseRejectDiv(){
    this.rejectDiv = true;
  }

  payCashDiv: boolean = false;
  showPayCashDiv(){
    this.payCashDiv = true;
  }

  partiallyPayment: boolean = false;
  expensePaymentType: string = 'full';

  resetPagination() {
    this.databaseHelper.search = ""; 
    this.databaseHelper.searchBy = "";
    this.databaseHelper.currentPage = 1;
    this.databaseHelper.itemPerPage = 10;
    this.databaseHelper.sortBy = "";
    this.databaseHelper.sortOrder = ""; 
}

  /** Company Wallet Section **/
  /** View Wallet Balance **/


  companyWalletRequest(){
    this.statusIds = []; 
    this.selectedStatus = []; 
    this.tempSelectedFilter = [];
    this.tempDateFilters = [];
    this.filters = { fromDate: undefined, toDate: undefined };
    this.loading = false;
    this.dashBoardDateView = false;
    this.resetPagination();
    this.getWalletUser();
    this.getUsersByFilterMethodCall();    
 }

  walletUserList: any[] = new Array();
  totalWalletUser : number = 0;
  requestedEmployeeId: number[] = [];
  tempRequestedEmployeeList: string[] = [];
  requestedEmployeeList: string[] = [];

  onEmployeeChange(selectedIds: number[]) {
    this.tempRequestedEmployeeList = this.users
        .filter(user => selectedIds.includes(user.id))
        .map(user => `Employee: ${user.name}`);
  }


  removeWalletFilter(employeeName: string) {
    const cleanName = employeeName.replace("Employee: ", ""); 
    const userToRemove = this.users.find(user => user.name === cleanName);
    
    if (userToRemove) {
        this.tempRequestedEmployeeList = this.tempRequestedEmployeeList.filter(name => name !== employeeName);
        this.requestedEmployeeId = this.requestedEmployeeId.filter(id => id !== userToRemove.id);
    }
    
    this.applyWalletFilters();
  }

  walletPageChanged(page:any) {
    debugger
    this.databaseHelper.currentPage = page;
    this.getWalletUser();
  }

  walletgetEndIndex(): number {
    const endIndex = this.databaseHelper.currentPage * this.databaseHelper.itemPerPage;
    return endIndex > this.totalWalletUser ? this.totalWalletUser : endIndex;
  }


  
  async getWalletUser() {
    debugger
    this.resetUserTransactionToggle();
    this.loading = true;
    this.walletUserList = []

    if(!this.dashBoardDateView){
      if (this.filters.fromDate !== undefined && this.filters.toDate !== undefined) {
        this.startDate = moment(this.filters.fromDate).format(this.networkDateFormat);
        this.endDate = moment(this.filters.toDate).format(this.networkDateFormat);
      } else {
          this.startDate = undefined;
          this.endDate = undefined;
      }
    }

    // this.startDate =( new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth(), 1).toISOString().split('T')[0])+ " 00:00:00";
    // this.endDate = (new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth() + 1, 0).toISOString().split('T')[0])+ " 23:59:59";
    
    console.log("Start Date :",this.startDate)
    console.log("End Date :", this.endDate);
    console.log("Requested Employee Name : ",this.tempRequestedEmployeeList);
  
    this.expenseService.getAllUserByWallet(
      this.ROLE,
      this.databaseHelper.currentPage,
      this.databaseHelper.itemPerPage,
      this.startDate,
      this.endDate,
      '',
      this.requestsSearch,
      this.requestedEmployeeId
    ).subscribe((res: any) => {
      if (res.status) {
        if(!this.dashBoardDateView){
          this.walletUserList = res.object.map((user : any) => {
            return {
              ...user,
              formattedDate: this.formatDate(user.lastTransactionDate),  // Extract Date
              formattedDay: this.formatDay(user.lastTransactionDate)    // Extract Day
            };
          });
        }else{
          this.walletUserList = res.object;
        }
        
  
        this.totalWalletUser = res.totalItems;
        this.dateFilters = [...this.tempDateFilters];
        this.requestedEmployeeList = [...this.tempRequestedEmployeeList];
        console.log('WalletUserList: ', this.walletUserList);
      } else {
        this.walletUserList = [];
        this.dateFilters = [...this.tempDateFilters];
        this.requestedEmployeeList = [...this.tempRequestedEmployeeList];
      }
      this.loading = false;
    });
  }



  applyWalletFilters() {
    this.databaseHelper.currentPage = 1;
    console.log("Selected User IDs:", this.requestedEmployeeId);
    console.log("Start Date : ",this.filters.fromDate)
    console.log("End Date : ",this.filters.toDate)
    if (this.filters.fromDate && this.filters.toDate) {
        this.tempDateFilters = [];
        const fromDate = moment(this.filters.fromDate).format(this.displayDateFormat);
        const toDate = moment(this.filters.toDate).format(this.displayDateFormat);
        this.tempDateFilters.push({ key: 'Date', value: `${fromDate} to ${toDate}` });
      }
    this.getWalletUser();
    this.showFilter = false;
  }

  resetWalletFilters() {
    this.requestedEmployeeId = [];
    this.tempRequestedEmployeeList = [];
    this.tempDateFilters = [];
    this.filters = { fromDate: undefined, toDate: undefined };  

    console.log("Filters reset. Fetching all Wallet Users...");

    this.getWalletUser();  
}


removeWalletDateFilter(filter: { key: string; value: string }): void {
  this.tempDateFilters = [];
  this.filters = { fromDate: undefined, toDate: undefined };

  console.log("RemoveDate FilterM Start Date :",this.filters.fromDate)
  console.log("End Date :", this.filters.fromDate);
  this.changeShowFilter(false);
  this.applyWalletFilters();
}


searchByEmployeeName(event: Event): void {
  this.requestsSearch = (event.target as HTMLInputElement).value;
  this.databaseHelper.currentPage = 1;
  this.getWalletUser();

}
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');  // Ensure two digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;  // Format: **DD-MM-YYYY**
  }
  
  formatDay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' }); 
  }


  resetUserTransactionToggle(){
    this.userTransactions = [];
    this.totalTransaction = 0;
    this.totalUsedAmount = 0;
    this.lastTransactionDate = '';
    this.userTransactionLoading = false;
    this.expandedStates = [];
    this.expandedIndex = null;
  }


  userTransactions: any[] = new Array();
  totalTransaction : number = 0;
  totalUsedAmount : number = 0;
  lastTransactionDate : any = '';
  userTransactionLoading : boolean = false;

  fetchUserTransactionsByClick(userId: string) {
    
    console.log("Transaction Length : ",this.userTransactions.length );
    if (this.userTransactions.length != 0) {
      this.resetUserTransactionToggle();
      this.userTransactions = [];
      return;
    }
    this.fetchUserTransactions(userId);
    
  }
  

  fetchUserTransactions(userId: string) {
    this.userTransactionLoading = true;
    this.expenseService.getUserTransactions(userId).subscribe((res: any) => {
      if (res.status) {
        this.userTransactions = res.object;
        this.totalTransaction = res.totalItem;

        // Calculate total used amount (sum of DEBIT transactions)
        this.totalUsedAmount = this.userTransactions
          .filter(transaction => transaction.type === 'DEBIT')
          .reduce((sum, transaction) => sum + transaction.requestedAmount, 0);

        // Get the latest transaction date
        if (this.userTransactions.length > 0) {
          this.lastTransactionDate = this.userTransactions
            .map(transaction => new Date(transaction.transactionDate))
            .sort((a, b) => b.getTime() - a.getTime())[0]; // Get the most recent date
        } else {
          this.lastTransactionDate = null;
        }

        console.log('User Wallet Transactions:', this.userTransactions);
        console.log('Total Used Amount:', this.totalUsedAmount);
        console.log('Last Transaction Date:', this.lastTransactionDate);
        this.userTransactionLoading = false;
        this.loading = false;
      } else {
        this.userTransactions = [];
        this.totalUsedAmount = 0;
        this.lastTransactionDate = null;
        this.loading = false;
        this.userTransactionLoading = false;
      }
    });
}


  getTransactionLabel(transaction: any): string {
    if (transaction.type === 'CREDIT') {
      return 'Recharge Wallet';
    } else if (transaction.type === 'DEBIT' && transaction.expenseType) {
      return transaction.expenseType;
    } else {
      return '---';
    }
  }


  users: User[] = [];
  selectedUserId: string = '';
  amount: number = 0;
  remark: string = '';
  submitted : boolean = false;

  getUsersByFilterMethodCall() {
    this.dataService
      .getUsersByFilter(0, 1, 'asc', 'id', '', 'name', 0)
      .subscribe((data) => {
        this.users = data.users;
        // this.total = data.count;

        // console.log(this.users, this.total);
      });
  }


  isLoadingHnS: boolean = false;
  @ViewChild('rechargeModalClose') rechargeModalClose!: ElementRef;
  rechargeWallet() {
    this.isLoadingHnS = true;
    this.submitted = true;
    if (!this.selectedUserId || this.amount <= 0 || !this.remark) {
      this.isLoadingHnS = false;
      return;
    }

    const requestBody = {
      userUuid: this.selectedUserId,
      walletAmount: this.amount,
      description: this.remark
    };
    console.log("Request Body Parameter : ",requestBody);
    
    this.expenseService.rechargeWallet(requestBody).subscribe((res: any) => {
      if (res.status) {
        // this.rechargeModel = false;
        this.rechargeModalClose.nativeElement.click();
        this.submitted = false;
        this.resetFields();
        this.getWalletUser();
        this.isLoadingHnS = false;
        this.helperService.showToast(`wallet recharge successfully.`, Key.TOAST_STATUS_SUCCESS);
      }else{
        this.isLoadingHnS = false;
        this.rechargeModel = true;
        this.rechargeModalClose.nativeElement.click();
        this.helperService.showToast('failed wallet recharge.', Key.TOAST_STATUS_ERROR);
      }
    })
  }


  resetFields() {
    this.rechargeModel = false;
    this.submitted = false;
    this.selectedUserId = '';
    this.amount = 0;
    this.remark = '';
  }

  rechargeModel: boolean = false;

  openRechargeModel(){
    this.resetFields();
    // this.rechargeModel = true;
    this.getUsersByFilterMethodCall();
  }

  showToast(message: string): void {
    this.getPendingTransactionCount();
    console.log("Success Message From Successfully Approve",message);
    this.helperService.showToast(message, Key.TOAST_STATUS_SUCCESS);
  }


  /**  Download Company Expense */

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

  /* Expense Dashboard Fetch Starts */

  selectedDateRange: [Date, Date] | null = null;

onDateRangeChange(dates: [Date, Date] | null) {
  this.selectedDateRange = dates;

  if (dates && dates.length === 2) {
    this.startDate = moment(dates[0]).format(this.networkDateFormat);
    this.endDate = moment(dates[1]).format(this.networkDateFormat);
  } else {
    this.startDate = null;
    this.endDate = null;
  }
  console.log("Dashboard startdate:", this.startDate);
  console.log("Dashboard enddate:", this.endDate);
  this.getWalletUser();
  this.getExpenseSummaryByType();
}


  dashBoardDateView : boolean = false;
  fetchDashboardData(){
    this.startDate = '';
    this.endDate = '';
    this.getExpenseSummaryByType();
    this.getExpenseSummary();
    this.tempDateFilters = [];
    this.filters = { fromDate: undefined, toDate: undefined };
    this.databaseHelper.currentPage = 0;
    this.databaseHelper.itemPerPage = 0;
    this.getWalletUser();
    this.dashBoardDateView = true;
    this.loading = true;
    this.getExpenseTrend();
    this.getTeamWalletAmount();
    this.getCreditWalletAmount();
    this.getDebitWalletAmount();
    this.getTop5UsersWithHighestExpense();
  }

  expenseSummary: any[] = [];

  settledAmount: number = 0;
  unsettledAmount: number = 0;
  rejectedAmount: number = 0;
  pendingAmount: number = 0;
  payrollAmount: number = 0;
  
  getExpenseSummary() {
    this.expenseService.getExpenseSummary().subscribe((res: any) => {
      if (res.status) {
        this.expenseSummary = res.object;

        this.settledAmount = 0;
        this.unsettledAmount = 0;
        this.rejectedAmount = 0;
        this.pendingAmount = 0; // Showing as InProcess
        this.payrollAmount = 0;

        for (let expense of this.expenseSummary) {
          switch (expense.status.id) {
            case 41: // Paid
              this.settledAmount = expense.settledAmount;
              this.unsettledAmount = expense.unSettledAmount;
              break;
            case 15: // Rejected
              this.rejectedAmount = expense.requestedAmount;
              break;
            case 14: // Approved
              this.unsettledAmount = expense.requestedAmount;
              break;
            case 13: // Pending -> showing as Inprocess
              this.pendingAmount = expense.requestedAmount;
              break;
            case 40: // Payroll
            case 53: // Payroll Partial
              this.payrollAmount += expense.requestedAmount;
              break;
            default:
              break;
          }
        }
        console.log("Unsettled Amount : ",this.unsettledAmount);
        console.log("Expense Summary:", res);
      }
    });
  }


  expenseTypeSummery : any[] = [];
  totalExpenseType : number = 0;
  totalAmount: number = 0;
  sChartLoaded: boolean = false;
  chartOptions: any;

  getExpenseSummaryByType() {
    console.log("Summary startDate: ", this.startDate);
    console.log("Summary endDate: ", this.endDate);
    
    this.expenseService.getExpenseBytype(this.startDate, this.endDate).subscribe((res: any) => {
      if (res.status) {
        this.expenseTypeSummery = res.object;
        
        // Calculate total approved amount
        this.totalAmount = this.expenseTypeSummery.reduce((sum, item) => sum + item.approvedAmount, 0);
  
        // Add percentage field to each item
        this.expenseTypeSummery = this.expenseTypeSummery.map(item => ({
          ...item,
          percentage: this.totalAmount > 0 ? ((item.approvedAmount / this.totalAmount) * 100).toFixed(2) : "0.00"
        }));
  
        this.totalExpenseType = res.totalItems;
        this.initializeDonutChart();
        console.log("ExpenseSummaryByType :", this.expenseTypeSummery);
      }
    });
  }

  initializeDonutChart() {
    this.chartOptions = {
      series: this.expenseTypeSummery.map(item => parseFloat(item.percentage) || 0), // Convert to number and prevent NaN
      chart: {
        width: 180,
        type: "donut"
      },
      colors: this.getDynamicColors(this.expenseTypeSummery),
      labels: this.expenseTypeSummery.map(item => item.expenseTypeName),
      dataLabels: {
        enabled: false
      },
      fill: {
        type: "gradient"
      },
      legend: {
        show: false
      },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 10
        }
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (value: number) => `${value.toFixed(2)}%` // Ensure 2 decimal places
        }
      }
    };
  
    this.sChartLoaded = true;
  }
  

  getDynamicColors(data: any[]): string[] {
    const colors = ["#CA365F", "#F3A73D", "#47539F", "#4BC0C0", "#9966FF", "#FF9F40"];
    return data.map((_, index) => colors[index % colors.length]);
  }
  

  //Get Expense Trend for every ststus
  expenseTrend : any[] = [];
  getExpenseTrend() {
    this.expenseService.getExpenseTrends().subscribe((res: any) => {
      if (res.status) {
        this.expenseTrend = res.object;
        this.mapExpenseData();
      }
      
      console.log("ExpenseTrend Data :", res);
      });
  }

  amountChanges: { [key: string]: number } = {};
  rejectedExpenseCountByWeek : number = 0;
  pendingExpenseCountByWeek : number = 0;

  mapExpenseData() {
    this.expenseTrend.forEach(expense => {
      switch (expense.statusId) {
        case 41: // PAID -> Settled Expense
          this.amountChanges['settled'] = expense.amountPercentageChange;
          break;
        case 14: // APPROVED -> Unsettled Expense
          this.amountChanges['unsettled'] = expense.amountPercentageChange;
          break;
        case 15: // REJECTED -> Rejected Expense
          this.rejectedExpenseCountByWeek = expense.currentWeekCount;
          break;
        case 13: // PENDING -> Pending Expense -> showing as In Process
          this.pendingExpenseCountByWeek = expense.currentWeekCount;
          break;
        case 40: // PAYROLL -> Payroll Expense
        this.amountChanges['payroll'] = expense.amountPercentageChange;
          break;
      }
    });
  }


  expandedStates: boolean[] = [];
  expandedIndex: number | null = null;

  toggleCollapse(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
    this.expandedStates[index] = !this.expandedStates[index];
  }
  
  isExpanded(index: number): boolean {
    return this.expandedIndex === index;
  }



 

  /* team wallet transacction */
  teamWallets: any[] = [];
  getTeamWalletAmount() {
    this.expenseService.getTeamWallets().subscribe((res: any) => {
      if (res.status) {
        this.teamWallets = res.object;
      }
      
      console.log("Team Wallet Data :", res);
      });
  }

  creditWalletAmount : number = 0;
  debitWalletAmount : number = 0;

  getCreditWalletAmount() {
    this.expenseService.getCreditWalletAmount().subscribe((res: any) => {
      if (res.status) {
        this.creditWalletAmount = res.object;
      }
      console.log("Credit Wallet Amount : ",this.creditWalletAmount);
      });
  }

  getDebitWalletAmount() {
    this.expenseService.getDebitWalletAmount().subscribe((res: any) => {
      if (res.status) {
        this.debitWalletAmount = res.object;
      }
      console.log("Debit Wallet Amount : ",this.debitWalletAmount);
      });
  }


  topExpenseUser: any[] = [];
  userLoader : boolean = false;
  getTop5UsersWithHighestExpense() {
    this.userLoader = true;
    this.expenseService.getTop5UsersWithHighestExpense().subscribe((res: any) => {
      if (res.status) {
        this.topExpenseUser = res.object;
        this.userLoader = false;
      }
      this.userLoader = false;
      console.log("Top Wallet User List : ",this.topExpenseUser);
      });
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
  fileName: any;
  sampleFileUrl: string ='';
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
  getAbsolute(value: number): number {
    return Math.abs(value);
  }

  

}
