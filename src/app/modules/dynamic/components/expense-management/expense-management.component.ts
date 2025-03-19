import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
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
    this.getWalletUser();
    this.getRole();
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
    this.resetFilters();
    this.getPendingTransactionCount();
    this.statusIds = [13];
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
    "All":[13,14,40,53,46,15],
    "Pending": [13],
    "Approved": [14, 40, 53, 46],
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
      this.selectedStatus = this.selectedStatus.filter(f => f !== filter);
  }
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



  /** View Wallet Balance **/


  companyWalletRequest(){
    this.statusIds = []; 
    this.selectedStatus = []; 
    this.tempSelectedFilter = [];
    this.tempDateFilters = [];
    this.filters = { fromDate: undefined, toDate: undefined };
    this.loading = false;
    this.getWalletUser();    
}

  walletUserList: any[] = new Array();
  totalWalletUser : number = 0;
  requestedEmployeeId: number[] = [];
  requestedEmployeeList: string[] = [];

  onEmployeeChange(selectedIds: number[]) {
    this.requestedEmployeeList = this.users
        .filter(user => selectedIds.includes(user.id))
        .map(user => `Employee: ${user.name}`);
  }


  removeWalletFilter(employeeName: string) {
    const cleanName = employeeName.replace("Employee: ", ""); 
    const userToRemove = this.users.find(user => user.name === cleanName);
    
    if (userToRemove) {
        this.requestedEmployeeList = this.requestedEmployeeList.filter(name => name !== employeeName);
        this.requestedEmployeeId = this.requestedEmployeeId.filter(id => id !== userToRemove.id);
    }
    
    this.applyWalletFilters();
  }


  
  async getWalletUser() {
    debugger
    this.loading = true;
    this.walletUserList = []

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
    console.log("Requested Employee Name : ",this.requestedEmployeeList);
  
    this.expenseService.getAllUserByWallet(
      this.databaseHelper.currentPage,
      this.databaseHelper.itemPerPage,
      this.startDate,
      this.endDate,
      '',
      this.requestsSearch,
      this.requestedEmployeeId
    ).subscribe((res: any) => {
      if (res.status) {
        this.walletUserList = res.object.map((user : any) => {
          return {
            ...user,
            formattedDate: this.formatDate(user.lastTransactionDate),  // Extract Date
            formattedDay: this.formatDay(user.lastTransactionDate)    // Extract Day
          };
        });
  
        this.totalWalletUser = res.totalItems;
        this.dateFilters = [...this.tempDateFilters];
        console.log('WalletUserList: ', this.walletUserList);
      } else {
        this.walletUserList = [];
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
    this.requestedEmployeeList = [];
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


  userTransactions: any[] = new Array();
  totalTransaction : number = 0;

  fetchUserTransactions(userId: string) {
    this.expenseService.getUserTransactions(userId).subscribe((res: any) => {
      if (res.status) {
        this.userTransactions = res.object
        this.totalTransaction = res.totalItems
        console.log('UserWalletTransactions: ',this.userTransactions)
 
        this.loading = false;
      }else{
       this.expenseList = [];
       this.loading = false;
      }
    })
    
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
        this.rechargeModel = true;
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


}
