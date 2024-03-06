import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { UserListReq } from 'src/app/models/UserListReq';
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
    private _router:Router) {
   }

  ngOnInit(): void {
    this.userList.push(this.user);
  }

  back(){
    this.uploadMethod = '';
  }
  uploadMethod: string = '';
  selectMethod(method:string){
    if(method == "excel"){
      this.uploadMethod = '';
      this.getReport();
      this.importModalOpen.nativeElement.click();
    }
    else
    {
      this.uploadMethod = method;
    }
    
  }

  user:{name:string; phone:string; email:string}={name:'',phone:'', email:''};
  
  addUser(){
    this.user = { name: '', phone: '', email: ''};
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

  closeModal(){

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
  create(){
    this.userListReq.userList= this.userList;
    this._onboardingService.createUser(this.userListReq).subscribe((response: any) => {
      if (response.status) {
        // this._router.navigate(['/dashboard']);
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
}
