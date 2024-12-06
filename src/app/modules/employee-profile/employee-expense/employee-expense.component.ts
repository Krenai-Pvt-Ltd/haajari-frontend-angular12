import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { UserDto } from 'src/app/models/user-dto.model';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-employee-expense',
  templateUrl: './employee-expense.component.html',
  styleUrls: ['./employee-expense.component.css']
})
export class EmployeeExpenseComponent implements OnInit {

  constructor(private dataService: DataService, private helperService: HelperService, 
    private rbacService: RoleBasedAccessControlService, private afStorage: AngularFireStorage) { }

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

    this.getExpenseType();
    this.fetchManagerNames()
  }

  async getRole(){
    this.ROLE = await this.rbacService.getRole();
  }

 /** Create and View Expense start */

 expenseList: any[] = new Array();
 loading: boolean = false;
 databaseHelper: DatabaseHelper = new DatabaseHelper();
 // expSelected:any;
 statusIds: number[] = new Array();
  async getExpenses() {
   debugger
   this.loading = true;
   this.expenseList = []
   this.ROLE = await this.rbacService.getRole();
  
   if(this.expenseSelectedDate == null){
     this.startDate = '';
     this.endDate = '';
   }
   this.expenseList = []
   this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate, this.statusIds).subscribe((res: any) => {
     if (res.status) {
       this.expenseList = res.object

       console.log('expenseList: ',this.expenseList)

       this.loading = false
     }else{
      this.expenseList = []
      this.loading = false
     }
     this.statusIds = []
   })
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

  this.dataService.getAllExpenseCount(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate).subscribe((res: any) => {
    if (res.status) {
      this.expenseCount = res.object

      console.log('expenseCount: ',this.expenseCount)

    }else{
     this.expenseCount = []
     this.loading = false
    }
  })
}

 pastExpenseList: any[] = new Array();
 pastLoading: boolean = false;
 async getPastExpenses() {
  debugger
  this.pastLoading = true;
  this.pastExpenseList = []
  this.expenseList = []
  this.ROLE = await this.rbacService.getRole();
 
  if(this.expenseSelectedDate == null){
    this.startDate = '';
    this.endDate = '';
  }

  this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate, this.statusIds).subscribe((res: any) => {
    if (res.status) {
      this.pastExpenseList = res.object
      this.pastLoading = false
    }else{
     this.pastExpenseList = []
     this.pastLoading = false
    }
    this.statusIds = []
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
  //  this.getExpenses();

   if(this.pastExpenseToggle){
    this.statusIds.push(41);
    this.getExpenses();
   }else{
    this.getExpenses();
   }

 }

 selectedStatus: any
 filterByStatus(statusId: any){
  debugger
  this.statusIds.push(statusId);
  this.selectedStatus = statusId;

  this.getExpenses();
 }

 pastExpenseToggle: boolean = false
 getPastExpense(){
  this.pastExpenseToggle = true;
  this.expenseList = []
  this.statusIds.push(41);

  this.getExpenses();

  // this.getPastExpenses()
 }

 getAllExpenses(){
  this.pastExpenseToggle = false;
  this.expenseList = []
  this.statusIds = []
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
      // console.log('creating.... ')
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
  debugger
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
   this.expenseTypeReq.urls = expense.slipUrls
   this.expenseTypeReq.status = expense.status
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

 managers: UserDto[] = [];
 selectedManagerId!: number;

 fetchManagerNames() {
   this.dataService.getEmployeeManagerDetails(this.userId).subscribe(
     (data: UserDto[]) => {
       this.managers = data;
      //  this.count++;
       // console.log('manager :' + this.managers[2].id);
     },
     (error) => {
      //  this.count++;
     }
   );
 }


 /** Company Expense end **/

 /** Create and view expense end */




  /**
   * Image upload start on Firebase
   */

  /** Image Upload on the Firebase Start */

  isFileSelected = false;
  imagePreviewUrl: any = null;
  selectedFile: any;
  isUploading: boolean = false;
  fileName: any;
  isFileUploaded: boolean = false;
  onFileSelected(event: Event): void {
    debugger;
    
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.isFileUploaded = true;
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
        this.isFileUploaded = false;
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
            // this.expenseTypeReq.url = url;

            this.expenseTypeReq.urls.push(url)

            this.isFileUploaded = false;
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

}
