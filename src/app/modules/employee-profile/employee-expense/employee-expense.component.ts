import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-employee-expense',
  templateUrl: './employee-expense.component.html',
  styleUrls: ['./employee-expense.component.css']
})
export class EmployeeExpenseComponent implements OnInit {

  constructor(private dataService: DataService, private helperService: HelperService, private rbacService: RoleBasedAccessControlService) { }

  ROLE: any;
  ngOnInit(): void {
    this.getExpenses();
  }

 /** Create and View Expense start */

 expenseList: any[] = new Array();
 loading: boolean = false;
 databaseHelper: DatabaseHelper = new DatabaseHelper();
 // expSelected:any;
  getExpenses() {
   debugger
   this.loading = true;
   this.expenseList = []
   // this.ROLE = await this.rbacService.getRole();
  
   if(this.expenseSelectedDate == null){
     this.startDate = '';
     this.endDate = '';
   }

   this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate).subscribe((res: any) => {
     if (res.status) {
       this.expenseList = res.object
       this.loading = false
     }
   })
 }

 startDate: any;
 endDate: any;
 expenseSelectedDate: Date | null = null;
 onExpenseMonthChange(month: Date): void {
   this.expenseSelectedDate = month;

   if(this.expenseSelectedDate){
       // Calculate the start of the month (first day of the month) and set time to start of the day
     const startOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth(), 1);

     // Calculate the end of the month (last day of the month) and set time to end of the day
     const endOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth() + 1, 0);

     this.startDate = startOfMonth.toDateString() + " 00:00:00"; // Date object
     this.endDate = endOfMonth.toDateString() + " 23:59:59"; // Date object
   }
   this.getExpenses();
 }


 /** Expense start **/

 expenseTypeList: any[] = new Array();
 expenseTypeReq: ExpenseType = new ExpenseType();
 expenseTypeId: number = 0;
 getExpenseTypeId(id: any) {
   this.expenseTypeReq.expenseTypeId = id
 }

 getExpenseType() {

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
   debugger
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

 managerId: number = 0
 getManagerId(id: any) {
   this.expenseTypeReq.managerId = id
 }

 @ViewChild('closeExpenseButton') closeExpenseButton!: ElementRef
 createToggle: boolean = false;
 createExpense(form: NgForm) {
   debugger
   this.createToggle = true;
  
   this.dataService.createExpense(this.expenseTypeReq).subscribe((res: any) => {
     if (res.status) {
       this.expenseTypeReq = new ExpenseType();
       this.expenseTypeId = 0;
       this.managerId = 0
       this.expenseTypeReq.id = 0;
       this.validatePolicyToggle = false;
       form.resetForm();
       this.getExpenses();
       this.createToggle = false;
       this.closeExpenseButton.nativeElement.click()
       this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
     }
   })

   // console.log('createExpense Req: ', this.expenseTypeReq)
   // this.expenseTypeReq = new ExpenseType();

   // this.expenseTypeId = 0;
   // this.validatePolicyToggle = false;
   // this.managerId = 0
   // this.createToggle = false;
   // form.resetForm();
   // this.getExpenses();

   // this.closeExpenseButton.nativeElement.click()
   console.log('Created Successfully')
 }

 async updateExpense(expense: any) {
   await this.getExpenseType();

   // setTimeout(() =>{
   //   this.fetchManagerNames()
   // })
   
   // this.getManagerId(expense.managerId)

   this.expenseTypeReq.id = expense.id
   this.expenseTypeReq.amount = expense.amount
   this.expenseTypeReq.expenseDate = expense.expenseDate
   this.expenseTypeReq.expenseTypeId = expense.expenseTypeId
   this.expenseTypeReq.notes = expense.notes
   this.expenseTypeReq.url = expense.slipUrl
   this.expenseTypeReq.managerId = expense.managerId
   this.expenseTypeId = expense.expenseTypeId
   this.managerId = expense.managerId
   


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

 userExpense: any;
 getExpense(expense: any) {
   this.userExpense = expense
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
 }

 approveToggle: boolean = false;
 @ViewChild('closeApproveModal') closeApproveModal!: ElementRef
 approveOrDeny(id: number, status: string) {
   console.log(id, status)
   this.isCheckboxChecked = false;
   this.partialAmount = '';
   this.closeApproveModal.nativeElement.click()
 }



 /** Company Expense end **/

 /** Create and view expense end */

}
