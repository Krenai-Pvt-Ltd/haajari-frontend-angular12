import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { Key } from 'src/app/constant/key';
import { ExpenseType } from 'src/app/models/expenseType';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-create-expense',
  templateUrl: './create-expense.component.html',
  styleUrls: ['./create-expense.component.css']
})
export class CreateExpenseComponent implements OnInit {
  ROLE: any

  constructor(private afStorage: AngularFireStorage, 
    private dataService: DataService, private helperService: HelperService, private rbacService: RoleBasedAccessControlService) { }

  ngOnInit(): void {

    this.getExpenses();
  }


  expenseList: any[] = new Array();
  loading: boolean = false;
 async getExpenses(){
    debugger
    this.loading = true;
    this.expenseList = []
    this.ROLE = await this.rbacService.getRole();

    this.dataService.getAllExpense(this.ROLE, 1, 10).subscribe((res: any) => {
      if(res.status){
        this.expenseList = res.object
        this.loading = false
      }
    })

  }


/** Expense start **/

expenseTypeList: any[] = new Array();
expenseTypeReq: ExpenseType = new ExpenseType();
expenseTypeId: number =0;
getExpenseTypeId(id: any){
  this.expenseTypeReq.expenseTypeId = id
}

getExpenseType(){

  this.expenseTypeReq = new ExpenseType();
  this.expenseTypeId = 0

  this.expenseTypeList = []
  this.dataService.getExpenseType().subscribe((res: any) => {

    if(res.status){
      this.expenseTypeList = res.object;
    }

  }, error =>{
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
  checkExpensePolicy(form: NgForm){
    this.dataService.checkExpensePolicy(this.expenseTypeReq.expenseTypeId, this.expenseTypeReq.amount).subscribe((res: any) =>{
      this.limitAmount = res.object;

      if(this.limitAmount > 0){
        this.validatePolicyToggle = true;
      }else{
        this.createExpense(form);
      }
    })
  }

  setValidateToggle(){
    this.validatePolicyToggle = false;
  }

@ViewChild('closeExpenseButton') closeExpenseButton!: ElementRef
createToggle: boolean = false;
createExpense(form: NgForm){
  this.createToggle = true;

  this.dataService.createExpense(this.expenseTypeReq).subscribe((res: any) => {
    if(res.status){
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

  console.log('createExpense Req: ',this.expenseTypeReq)
      // this.expenseTypeReq = new ExpenseType();

      // this.expenseTypeId = 0;
      // this.validatePolicyToggle = false;
      // form.resetForm();
      // this.getExpenses();

      // this.closeExpenseButton.nativeElement.click()
      // console.log('Created Successfully')
}

async updateExpense(expense: any){
  await this.getExpenseType();

  this.expenseTypeReq.id = expense.id
  this.expenseTypeReq.amount = expense.amount
  this.expenseTypeReq.expenseDate = expense.expenseDate
  this.expenseTypeReq.expenseTypeId = expense.expenseTypeId
  this.expenseTypeReq.notes = expense.notes
  this.expenseTypeId = expense.expenseTypeId
}

clearExpenseForm(form: NgForm){
  this.expenseTypeReq = new ExpenseType();
  this.expenseTypeId = 0;
  this.validatePolicyToggle = false;
  form.resetForm();
}

deleteImage(){
  this.expenseTypeReq.url = ''
}

expenseId: number = 0;
getExpenseId(id: number){
  this.expenseId = id;
  console.log('id: ',this.expenseId)
}

deleteToggle: boolean = false
@ViewChild('closeButtonDeleteExpense') closeButtonDeleteExpense!: ElementRef
deleteExpense(){

  this.dataService.deleteExpense(this.expenseId).subscribe((res: any) => {
    if(res.status){
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

/** Expense end **/






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

    console.log('upload url is: ',this.expenseTypeReq.url )
}

/** Image Upload on Firebase End */

}
