import { Component, OnInit } from '@angular/core';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
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

    async getExpenses() {
     debugger
     this.loading = true;
     this.expenseList = []
     this.ROLE = await this.rbacService.getRole();
  
     if (this.expenseSelectedDate == null) {
      // If expenseSelectedDate is null, set startDate and endDate to first and last date of the current month
      const currentDate = new Date();
      this.startDate = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0])+ " 00:00:00";
      this.endDate = (new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0])+ " 23:59:59";
    } else {
      // If expenseSelectedDate is not null, set startDate and endDate to first and last date of expenseSelectedDate's month
      this.startDate =( new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth(), 1).toISOString().split('T')[0])+ " 00:00:00";
      this.endDate = (new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth() + 1, 0).toISOString().split('T')[0])+ " 23:59:59";
    }
     this.expenseList = []
     this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate, this.statusIds, this.userId,'','').subscribe((res: any) => {
       if (res.status) {
         this.expenseList = res.object
         this.totalItems = res.totalItems
  
        console.log('expenseList: ',this.expenseList)
  
         this.loading = false
       }else{
        this.expenseList = []
        this.loading = false
       }
       this.statusIds = []
     })
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

  


}
