import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-upload-team',
  templateUrl: './upload-team.component.html',
  styleUrls: ['./upload-team.component.css']
})
export class UploadTeamComponent implements OnInit {

  form!: FormGroup;
  userList:any[]= new Array();
  databaseHelper: DatabaseHelper = new DatabaseHelper();


  @ViewChild('importModalOpen')importModalOpen!:ElementRef

  constructor(private fb: FormBuilder,
    private _onboardingService: OrganizationOnboardingService) {
    this.form = this.fb.group({
      categories: this.fb.array([])
    });
    this.addRow();
   }

  ngOnInit(): void {
    // this.userList.push(this.user);
  }

  uploadMethod: string = '';
  selectMethod(method:string){
    if(method == "excel"){
      this.uploadMethod = '';
      this.importModalOpen.nativeElement.click();
    }
    else
    {
      this.uploadMethod = method;
    }
    
  }

  // user:{name:string; phone:number; email:string}={name:'',phone:0, email:''};
  
  // addUser(){
  //   // var tempElement = JSON.parse(JSON.stringify(this.user))
  //   this.userList.push(this.user);
  //   this.user = { name: '', phone: 0, email: ''};
  // }

  removeUser(index: number) {
    this.userList.splice(index, 1);
  }

  get categories(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  addRow() {
    const newRow = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      userPhone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      userEmail: ['', [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(50)]],

    });

    this.categories.push(newRow);
  }

  fileName: any;
  currentFileUpload: any;
  selectFile(event: any) {
    debugger
    let fileList!: FileList;
    if (event != null) {
      fileList = event.target.files;
    }

    for (var i = 0; i < fileList.length; i++) {
      this.currentFileUpload = fileList.item(i);
    }

    if (this.currentFileUpload != null) {

      const formdata: FormData = new FormData();
      this.fileName = this.currentFileUpload.name;
      
        this.uploadUserFile(this.currentFileUpload,this.fileName);
      
    }

  }

  importToggle: boolean = false;
  uploadUserFile(file: any,fileName:string) {
    debugger
    this.importToggle = true;
    this._onboardingService.userImport(file, fileName).subscribe((response: any) => {
      if (response.status) {
        this.importToggle = false;
      }
      else
      {
        this.importToggle = false;
      }
    })
  }

  closeModal(){

  }


  importLoading: boolean = false;
  importReport: any[] = new Array();
  totalItems:number = 0;

  uploadDate: Date= new Date();

  getReport(type: string) {
    debugger
    this.importReport = [];
    this.importLoading = true;
    this.databaseHelper.itemPerPage = 5;
    this.databaseHelper.sortBy = "createdDate";
    this.databaseHelper.sortOrder = "Desc";
    // this._userService.getReport(type,this.databaseHelper).subscribe((response: any) => {
    //   if (response.status) {
    //     this.importReport = response.object;
    //     this.totalItems = response.totalItems;
    //   }
    //   this.importLoading = false;
    // }, (error) => {
    //   this.toastr.showToasterError("Network Error", "error");
    //   this.importLoading = false;
    // })
  }

  deleteReport(id: number){
    // this._userService.deleteReport(id).subscribe((response: any) => {
    //   if (response.status) {
    //     this.getReport(this.importType);
    //   }
    // }, (error) => {
    //   this.toastr.showToasterError("Network Error", "error");
    // })
  }

  pageChangedImport(page: any) {
    // if (page != this.databaseHelper.currentPage) {
    //   this.databaseHelper.currentPage = page;
    //   this.getReport(this.importType);
    // }
  }
}
