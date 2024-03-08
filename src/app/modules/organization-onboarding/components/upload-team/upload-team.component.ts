import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { UserListReq } from 'src/app/models/UserListReq';
import { UserReq } from 'src/app/models/userReq';
import { HelperService } from 'src/app/services/helper.service';
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
    private _onboardingService: OrganizationOnboardingService,
    private _location:Location,
    private _router:Router,
    private helperService : HelperService) {
   }

  ngOnInit(): void {
    this.userList.push(this.user);
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
    }
    
  }

  // user:{name:string; phone:string; email:string}={name:'',phone:'', email:''};
  user:UserReq = new UserReq();
  
  addUser(){
    // this.user = { name: '', phone: '', email: ''};
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

  // deleteReport(id: number){
  //   this._userService.deleteReport(id).subscribe((response: any) => {
  //     if (response.status) {
  //       this.getReport(this.importType);
  //     }
  //   }, (error) => {
  //     this.toastr.showToasterError("Network Error", "error");
  //   })
  // }

  pageChangedImport(page: any) {
    if (page != this.databaseHelper.currentPage) {
      this.databaseHelper.currentPage = page;
      this.getReport();
    }
  }

  userListReq: UserListReq = new UserListReq();
  createLoading: boolean = false;
  create(){
    this.userListReq.userList= this.userList;
    this.createLoading = true;
    this._onboardingService.createUser(this.userListReq).subscribe((response: any) => {
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
        this.loading = false;
      }
      else{
        this.onboardUserList = [];
      }
    }, (error) => {
      this.loading = false;
    })
  }


  @ViewChild('userEditModal')userEditModal!:ElementRef;
  openUserEditModal(user:any){
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
  checkExistance(number:string){
    this._onboardingService.checkNumberExist(number).subscribe((response: any) => {
        this.isNumberExist = response;
    }, (error) => {
      
    })

  }

  onBoardingCompleted(){
    this.helperService.showToast("your organization onboarding has been sucessfully completed", Key.TOAST_STATUS_SUCCESS);
    this._router.navigate(['/dashboard'])
  }
}
