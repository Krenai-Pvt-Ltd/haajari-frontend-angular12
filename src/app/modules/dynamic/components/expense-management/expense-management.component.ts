import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import moment from 'moment';
import { Key } from 'src/app/constant/key';
import { ApproveReq } from 'src/app/models/ApproveReq';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { UserDto } from 'src/app/models/user-dto.model';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-expense-management',
  templateUrl: './expense-management.component.html',
  styleUrls: ['./expense-management.component.css']
})
export class ExpenseManagementComponent implements OnInit {

  constructor(private dataService: DataService, private helperService: HelperService,private cdr: ChangeDetectorRef,
    private rbacService: RoleBasedAccessControlService, private afStorage: AngularFireStorage) { }

  showFilter: boolean = false;
  ROLE: any;
  userId: any;
  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get(
      'userId'
    );
    this.userId = userUuidParam?.toString() ?? ''
    this.getExpenses();
    this.getExpensesCount();

    this.getRole();
  }

  changeShowFilter(flag : boolean) {
    this.showFilter = flag;
  }

  async getRole(){
    this.ROLE = await this.rbacService.getRole();
  }

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

   requestsSearch: string = '';

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
         this.selectedFilters = [...this.tempSelectedFilter];
         this.dateFilters = [...this.tempDateFilters]; 
        console.log('expenseList: ',this.expenseList)
  
         this.loading = false;
       }else{
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

  statusLabels: { [key: number]: string } = {
    13: "Pending",
    14: "Approved",
    15: "Rejected",
    40: "Approved",
    53: "Approved",
    46: "Approved"
};



  updateStatusIds(event: any, statusIds: number | number[]) {
    const allCheckbox = document.getElementById("all") as HTMLInputElement;

    const idsArray = Array.isArray(statusIds) ? statusIds : [statusIds];

    if (event.target.checked) {
        idsArray.forEach(id => {
            if (!this.statusIds.includes(id)) {
                this.statusIds.push(id);
                if (this.statusLabels[id] && !this.tempSelectedFilter.includes(this.statusLabels[id])) {
                  this.tempSelectedFilter.push(this.statusLabels[id]); 
              }
            }
        });
    } else {
        this.statusIds = this.statusIds.filter(id => !idsArray.includes(id));
        idsArray.forEach(id => {
          if (this.statusLabels[id]) {
              this.tempSelectedFilter = this.tempSelectedFilter.filter(label => label !== this.statusLabels[id]);
          }
      });
    }

    if (!event.target.checked) {
        allCheckbox.checked = false;
    }

    console.log('Updated statusIds:', this.statusIds);
    console.log('Selected Filters:', this.tempSelectedFilter);
  }

  
  updateAllStatus(event: any) {
    const approvedCheckbox = document.getElementById("approved") as HTMLInputElement;
    const rejectedCheckbox = document.getElementById("rejected") as HTMLInputElement;
    const pendingCheckbox = document.getElementById("pending") as HTMLInputElement;
  
    if (event.target.checked) {
      this.statusIds = [13, 14, 15, 40, 53, 46]; 
  
      approvedCheckbox.checked = true;
      rejectedCheckbox.checked = true;
      pendingCheckbox.checked = true;
    } else {
      this.statusIds = []; 
  
      approvedCheckbox.checked = false;
      rejectedCheckbox.checked = false;
      pendingCheckbox.checked = false;
    }
  
    console.log('Updated statusIds after selecting all:', this.statusIds);
  }

  tempDateFilters: { key: string; value: string }[] = [];
  
  applyFilters() {
    this.databaseHelper.currentPage = 1;
    console.log("Selected Status IDs:", this.statusIds);
    if (this.filters.fromDate && this.filters.toDate) {
        const fromDate = moment(this.filters.fromDate).format(this.displayDateFormat);
        const toDate = moment(this.filters.toDate).format(this.displayDateFormat);
        this.tempDateFilters.push({ key: 'Date', value: `${fromDate} to ${toDate}` });
      }
    this.getExpenses();
    this.showFilter = false;
  }

  resetFilters() {
    this.statusIds = [];
  
    (document.getElementById("all") as HTMLInputElement).checked = false;
    (document.getElementById("approved") as HTMLInputElement).checked = false;
    (document.getElementById("rejected") as HTMLInputElement).checked = false;
    (document.getElementById("pending") as HTMLInputElement).checked = false;
  
    console.log("Filters reset. Fetching all expenses...");
  
    this.getExpenses();
    this.tempSelectedFilter = [];
    this.showFilter = false;
  }

  removeFilter(filter: string) {
    const statusIdsToRemove = Object.keys(this.statusLabels)
        .filter(key => this.statusLabels[+key] === filter) 
        .map(key => +key);

    if (statusIdsToRemove.length > 0) {
        this.statusIds = this.statusIds.filter(id => !statusIdsToRemove.includes(id));
        this.tempSelectedFilter = this.tempSelectedFilter.filter(f => f !== filter);

        // Uncheck corresponding checkboxes
        statusIdsToRemove.forEach(statusId => {
            const checkbox = document.getElementById(this.getCheckboxIdByStatus(statusId)) as HTMLInputElement;
            if (checkbox) {
                checkbox.checked = false;
            }
        });
    }

    this.getExpenses();
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


getCheckboxIdByStatus(statusId: number): string {
    switch (statusId) {
        case 14:
        case 40:
        case 53:
        case 46:
            return "approved";
        case 15:
            return "rejected";
        case 13:
            return "pending";
        default:
            return "";
    }
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
expensePaymentType: string = 'full'


}
