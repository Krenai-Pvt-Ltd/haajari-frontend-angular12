import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-expense-management',
  templateUrl: './expense-management.component.html',
  styleUrls: ['./expense-management.component.css']
})
export class ExpenseManagementComponent implements OnInit {

  constructor(private dataService: DataService, private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService) { }

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

   requestsSearch: string = '';

    async getExpenses() {
     debugger
     this.loading = true;
     this.expenseList = []
     this.ROLE = await this.rbacService.getRole();
  
     if (this.expenseSelectedDate == null) {
      // If expenseSelectedDate is null, set startDate and endDate to first and last date of the current month
      const currentDate = new Date();
      // this.startDate = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0])+ " 00:00:00";
      // this.endDate = (new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0])+ " 23:59:59";
    } else {
      // If expenseSelectedDate is not null, set startDate and endDate to first and last date of expenseSelectedDate's month
      // this.startDate =( new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth(), 1).toISOString().split('T')[0])+ " 00:00:00";
      // this.endDate = (new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth() + 1, 0).toISOString().split('T')[0])+ " 23:59:59";
    }
     this.expenseList = []
     this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate, this.statusIds, this.userId,'',this.requestsSearch).subscribe((res: any) => {
       if (res.status) {
         this.expenseList = res.object
         this.totalItems = res.totalItems
         this.selectedFilters = [...this.tempSelectedFilter];
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
  
  applyFilters() {
    this.databaseHelper.currentPage = 1;
    console.log("Selected Status IDs:", this.statusIds);
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

  


}
