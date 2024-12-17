import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import moment from 'moment';
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
    this.getOrganizationRegistrationDateMethodCall();
  }

  async getRole(){
    this.ROLE = await this.rbacService.getRole();
  }

 /** Create and View Expense start */

 expenseList: any[] = new Array();
 loading: boolean = false;
 totalItems: number = 0
 databaseHelper: DatabaseHelper = new DatabaseHelper();
 // expSelected:any;
 statusIds: number[] = new Array();
  async getExpenses() {
   debugger
   this.loading = true;
   this.expenseList = []
   this.ROLE = await this.rbacService.getRole();
  
   if(!this.startDate && !this.endDate){
    //  this.startDate = '';
    //  this.endDate = '';

    this.expenseSelectedDate = new Date();
      // Calculate the start of the month (first day of the month) and set time to start of the day
    const startOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth(), 1);

    // Calculate the end of the month (last day of the month) and set time to end of the day
    const endOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth() + 1, 0);

    this.startDate = startOfMonth.toDateString() + " 00:00:00"; // Date object
    this.endDate = endOfMonth.toDateString() + " 23:59:59"; // Date object
   }

   this.expenseList = []
   this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate, this.statusIds, this.userId).subscribe((res: any) => {
     if (res.status) {
       this.expenseList = res.object
       this.totalItems = res.totalItems

      //  console.log('expenseList: ',this.expenseList)

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
 
  console.log("date log1: ",this.expenseSelectedDate)
  if(!this.startDateStr && !this.endDateStr){
    // this.startDate = '';
    // this.endDate = '';
    this.expenseSelectedDate = new Date();

    const startOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth(), 1);

    // Calculate the end of the month (last day of the month) and set time to end of the day
    const endOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth() + 1, 0);

    const currentDate = moment(startOfMonth); // Use the selected date directly
    const currentEndDate = moment(endOfMonth); // Use the selected date directly
    this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD 00:00:00');
    this.endDateStr = currentEndDate.endOf('month').format('YYYY-MM-DD 23:59:59');
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

  this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate, this.statusIds, this.userId).subscribe((res: any) => {
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
 startDateStr: string =''
 endDateStr: string =''

//  expenseSelectedDate: Date | null = null;
 expenseSelectedDate: Date = new Date();
 onExpenseMonthChange(month: Date): void {
  // this.expenseSelectedDate = new Date();
   this.expenseSelectedDate = month;

   if(this.expenseSelectedDate){
       // Calculate the start of the month (first day of the month) and set time to start of the day
     const startOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth(), 1);

     // Calculate the end of the month (last day of the month) and set time to end of the day
     const endOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth() + 1, 0);

     this.startDate = startOfMonth.toDateString() + " 00:00:00"; // Date object
     this.endDate = endOfMonth.toDateString() + " 23:59:59"; // Date object

     const currentDate = moment(startOfMonth); // Use the selected date directly
     const currentEndDate = moment(endOfMonth); // Use the selected date directly
     this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD 00:00:00');
     this.endDateStr = currentEndDate.endOf('month').format('YYYY-MM-DD 23:59:59');
   }
  //  this.getExpenses();

   if(this.pastExpenseToggle){
    this.statusIds.push(41);
    this.getExpenses();
   }else{
    this.getExpenses();
    this.getExpensesCount()
   }
 }

 goToPreviousMonth(): void {
  if (!this.isPreviousDisabled()) {
    this.expenseSelectedDate = new Date(
      this.expenseSelectedDate.getFullYear(),
      this.expenseSelectedDate.getMonth() - 1,
      1
    );
    this.updateStartAndEndDates();
  }
}

goToNextMonth(): void {
  // this.nextMonthDisable = false;
  if (!this.isNextDisabled()) {
    this.expenseSelectedDate = new Date(
      this.expenseSelectedDate.getFullYear(),
      this.expenseSelectedDate.getMonth() + 1,
      1
    );
    this.updateStartAndEndDates();
  }
  // else{
  //   this.nextMonthDisable = true;
  // }
}

updateStartAndEndDates(): void {
  const startOfMonth = new Date(
    this.expenseSelectedDate.getFullYear(),
    this.expenseSelectedDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    this.expenseSelectedDate.getFullYear(),
    this.expenseSelectedDate.getMonth() + 1,
    0
  );

  // this.startDate = `${startOfMonth.toISOString().slice(0, 10)} 00:00:00`;
  // this.endDate = `${endOfMonth.toISOString().slice(0, 10)} 23:59:59`;

  this.startDate = startOfMonth.toDateString() + " 00:00:00"; // Date object
  this.endDate = endOfMonth.toDateString() + " 23:59:59"; // Date object

  const currentDate = moment(startOfMonth); // Use the selected date directly
  const currentEndDate = moment(endOfMonth); // Use the selected date directly
  this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD 00:00:00');
  this.endDateStr = currentEndDate.endOf('month').format('YYYY-MM-DD 23:59:59');

  if (this.pastExpenseToggle) {
    this.statusIds.push(41);
  }
  this.getExpenses();
  this.getExpensesCount()
}

organizationRegistrationDate: string = '';
getOrganizationRegistrationDateMethodCall() {
  debugger;
  this.dataService.getOrganizationRegistrationDate().subscribe(
    (response) => {
      this.organizationRegistrationDate = response;
    },
    (error) => {
      console.log(error);
    }
  );
}

isPreviousDisabled(): boolean {
  // Disable previous button logic (e.g., no date before Jan 2022)

  const organizationRegistrationDate = new Date(this.organizationRegistrationDate);
  return this.expenseSelectedDate <= organizationRegistrationDate
}

nextMonthDisable: boolean = false;
isNextDisabled(): boolean {
  // Disable next button logic (e.g., no date after the current month)
  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth(), 1);
  return this.expenseSelectedDate >= maxDate;
}

disableMonths = (date: Date): boolean => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const dateYear = date.getFullYear();
  const dateMonth = date.getMonth();
  const organizationRegistrationYear = new Date(
    this.organizationRegistrationDate
  ).getFullYear();
  const organizationRegistrationMonth = new Date(
    this.organizationRegistrationDate
  ).getMonth();

  // Disable if the month is before the organization registration month
  if (
    dateYear < organizationRegistrationYear ||
    (dateYear === organizationRegistrationYear &&
      dateMonth < organizationRegistrationMonth)
  ) {
    return true;
  }

  // Disable if the month is after the current month
  if (
    dateYear > currentYear ||
    (dateYear === currentYear && dateMonth > currentMonth)
  ) {
    return true;
  }

  // Enable the month if it's from January 2023 to the current month
  return false;
};


// Select Month and Next, Previous End

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
       this.createExpense(form);
     }
   })

 }

 cancelExpense(){
  this.validatePolicyToggle = false;
 }

 setValidateToggle() {
   this.validatePolicyToggle = false;
 }

 managerId: number = 0
 getManagerId(id: any) {
   this.expenseTypeReq.managerId = id
 }

 removeImage(url: string): void {
  const index = this.expenseTypeReq.urls.indexOf(url);
  if (index !== -1) {
    this.expenseTypeReq.urls.splice(index, 1); // Remove the specific URL
  }
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
   this.expenseTypeReq.settledDate = expense.settledDate
   this.expenseTypeReq.paymentMethod = expense.paymentMethod
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
   this.deleteExpenseToggle = false;
   form.resetForm();
 }

 deleteImage() {
   this.expenseTypeReq.url = ''
 }

 expenseId: number = 0;
 deleteExpenseToggle: boolean = false;
 getExpenseId(id: number) {
   this.expenseId = id;
  //  this.deleteExpenseToggle = true;
   this.deleteExpenseToggle = !this.deleteExpenseToggle;
   console.log('id: ', this.expenseId)
 }

 deleteToggle: boolean = false
 @ViewChild('closeButtonDeleteExpense') closeButtonDeleteExpense!: ElementRef
 deleteExpense() {
  this.deleteToggle = true;
   this.dataService.deleteExpense(this.expenseId).subscribe((res: any) => {
     if (res.status) {
      //  this.closeButtonDeleteExpense.nativeElement.click()
       this.closeExpenseButton.nativeElement.click()
       this.getExpenses();
       this.expenseId = 0;
       this.deleteExpenseToggle = false;
       this.deleteToggle = false;
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
