import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { UserListReq } from 'src/app/models/UserListReq';
import { User } from 'src/app/models/user';
import { UserReq } from 'src/app/models/userReq';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-upload-team',
  templateUrl: './upload-team.component.html',
  styleUrls: ['./upload-team.component.css']
})
export class UploadTeamComponent implements OnInit {

  form!: FormGroup;
  userList:UserReq[]= new Array();
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  sampleFileUrl: string = ''; //put sample file url


  @ViewChild('importModalOpen')importModalOpen!:ElementRef

  constructor(private fb: FormBuilder,
    private _onboardingService: OrganizationOnboardingService,
    private dataService: DataService,
    private _location:Location,
    private _router:Router,
    private helperService : HelperService) {
   }

  ngOnInit(): void {
    
    this.sampleFileUrl = 'https://firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/Hajiri%2FSample%2FEmployee_Details_Sample%2FUser Data (1).xlsx?alt=media';
    this.getUser();
  }

  back(){
    this.selectedMethod = '';
  }

  backPage(){
      this._location.back();
  }
  selectedMethod: string = '';
  selectMethod(method:string){
    if(method == "excel"){
      this.selectedMethod = '';
      this.getReport();
      this.importModalOpen.nativeElement.click();
    }
    else
    {
      this.selectedMethod = method;
      this.userList = [];
      this.user = new UserReq();
      this.userList.push(this.user)
    }
    
  }

  // user:{name:string; phone:string; email:string}={name:'',phone:'', email:''};
  user:UserReq = new UserReq();
  
  addUser(){
    // this.user = { name: '', phone: '', email: ''};
    this.user = new UserReq();
    this.userList.push(this.user);
    
  }

  removeUser(index: number) {
    this.userList.splice(index, 1);
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
        this.getReport();
      }
        this.importToggle = false;
    })
  }

  closeImportModal(){
    this.getUser();

  }


  importLoading: boolean = false;
  importReport: any[] = new Array();
  totalItems:number = 0;

  uploadDate: Date= new Date();

  getReport() {
    debugger
    this.importReport = [];
    this.importLoading = true;
    this.databaseHelper.itemPerPage = 5;
    this.databaseHelper.sortBy = "createdDate";
    this.databaseHelper.sortOrder = "Desc";
    this._onboardingService.getReport(this.databaseHelper).subscribe((response: any) => {
      if (response.status) {
        this.importReport = response.object;
        this.totalItems = response.totalItems;
      }
      this.importLoading = false;
    }, (error) => {
      this.importLoading = false;
    })
  }

  pageChangedImport(page: any) {
    if (page != this.databaseHelper.currentPage) {
      this.databaseHelper.currentPage = page;
      this.getReport();
    }
  }

  isFormInvalid: boolean = false;
  @ViewChild('userForm') userForm !: NgForm
  checkFormValidation() {
    if (this.userForm.invalid) {
      this.isFormInvalid = true;
      return
    } else {
      this.isFormInvalid = false;
    }
  }

  submit() {
    this.checkFormValidation();
    if (this.isFormInvalid == true) {
      return
    } else {
      this.create();
    }
  }

  userListReq: UserListReq = new UserListReq();
  createLoading: boolean = false;
  create(){
    this.userListReq.userList= this.userList;
    this.createLoading = true;
    this._onboardingService.createOnboardUser(this.userListReq).subscribe((response: any) => {
      if (response.status) {
        this.selectedMethod = '';
        this.createLoading = false;
        this.getUser();
      }
    }, (error) => {
      this.createLoading = false;
    })

  }

  onboardUserList:any[]= new Array();
  loading: boolean = false;
  getUser(){
    this.loading = true;
    this._onboardingService.getOnboardUser().subscribe((response: any) => {
      if (response.status) {
        this.onboardUserList = response.object;
      }
      else{
        this.onboardUserList = [];
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
    })
  }


  @ViewChild('userEditModal')userEditModal!:ElementRef;
  openUserEditModal(user:any){
    this.isEmailExist = false;
    this.isNumberExist = false;
    this.user = JSON.parse(JSON.stringify(user));
    this.userEditModal.nativeElement.click();
    
  }

  @ViewChild('closeUserEditModal')closeUserEditModal!:ElementRef;
  editLoader: boolean = false
  editUser(){
    this._onboardingService.editOnboardUser(this.user).subscribe((response: any) => {
      this.editLoader = true
      if (response.status) {
        this.getUser();
        this.closeUserEditModal.nativeElement.click();
        this.editLoader = false;
        this.helperService.showToast("user update sucessfully", Key.TOAST_STATUS_SUCCESS);
      }
    }, (error) => {
      this.editLoader = false
    })
  }


  deleteUser(id:number){
    this._onboardingService.deleteOnboardUser(id).subscribe((response: any) => {
      if (response.status) {
        this.getUser();
      }
    }, (error) => {
    })
  }

  isNumberExist: boolean = false;
  checkNumberExistance(index:number, number:string, uuid:string){
    this._onboardingService.checkEmployeeNumberExist(number, uuid).subscribe((response: any) => {
      if(index>=0){
        this.userList[index].isPhoneExist = response;
      }
        this.isNumberExist = response;
    })

  }

  isEmailExist: boolean = false;
  checkEmailExistance(index:number, email:string, uuid:string){
    this.userList[index].isEmailExist = false;
    if(email != null && email.length>5){
      this._onboardingService.checkEmployeeEmailExist(email, uuid).subscribe((response: any) => {
        if(index>=0){
          this.userList[index].isEmailExist = response;
        }
          this.isEmailExist = response;
      })
    }
  }

  next(){
    this.dataService.markStepAsCompleted(3);
    this._onboardingService.saveOrgOnboardingStep(3).subscribe();
    this._router.navigate(['/organization-onboarding/shift-time'])
  }
}
