import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Subject } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { Routes } from 'src/app/constant/Routes';
import { PayActionType } from 'src/app/models/pay-action-type';
import { SalaryChangeBonusResponse } from 'src/app/models/salary-change-bonus-response';
import { SalaryChangeOvertimeResponse } from 'src/app/models/salary-change-overtime-response';
import { SalaryChangeResponse } from 'src/app/models/salary-change-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-earning-management',
  templateUrl: './earning-management.component.html',
  styleUrls: ['./earning-management.component.css']
})
export class EarningManagementComponent implements OnInit {


  itemPerPage: number = 10;
  pageNumber: number = 1;
  search: string = '';
  totalItems: number = 0;

  readonly SALARY_CHANGE = Key.SALARY_CHANGE;
  readonly BONUS = Key.BONUS;
  readonly OVERTIME = Key.OVERTIME;

  readonly constant = constant;
  readonly Routes =Routes;

  @Input() step:any;
  @Input() startDate:any;
  @Input() endDate:any;
  @Output() getData: EventEmitter<number> = new EventEmitter<number>();
    
  sendBulkDataToComponent() {
    this.getData.emit(this.step);
  }


  back(){
    this.sendBulkDataToComponent();
  }

  private searchSubject = new Subject<boolean>();

  constructor(private _dataService : DataService, 
    public _helperService : HelperService,
    private _payrollService : PayrollService,
    public rbacService: RoleBasedAccessControlService,
    private _afStorage: AngularFireStorage) { 


    this.searchSubject.pipe(debounceTime(250)) // Wait for 250ms before emitting the value
        .subscribe(searchText => {
          this.searchByInput(searchText);
        });
    }

  ngOnInit(): void {
    window.scroll(0,0);
    this.selectTabByProcessStep(this.step);
  }


  @ViewChild('step7Tab') step7Tab!: ElementRef;
  @ViewChild('step8Tab') step8Tab!: ElementRef;
  @ViewChild('step9Tab') step9Tab!: ElementRef;
  selectTabByProcessStep(PAYROLL_PROCESS_STEP : number){
    if(PAYROLL_PROCESS_STEP <= this.OVERTIME){
      this.CURRENT_TAB = PAYROLL_PROCESS_STEP;
    }
    this.navigateToTab(this.CURRENT_TAB);
  }


  navigateToTab(tabId:number){
    setTimeout(()=>{
      switch(tabId){
      case this.SALARY_CHANGE:
        this.step7Tab.nativeElement.click();
        break;
      case this.BONUS:
        this.step8Tab.nativeElement.click();
        break;
      case this.OVERTIME:
        this.step9Tab.nativeElement.click();
        break;
      }
    }, 50)
  }



  CURRENT_TAB:number= this.SALARY_CHANGE;
  getDataBySelectedTab(){
    switch(this.CURRENT_TAB){
      case this.SALARY_CHANGE:
        this.getUserSalaryChange();
        break;
      case this.BONUS:
        this.getUserBonus();
        break;
      case this.OVERTIME:
        this.getUserOvertime();
        break;
    }
  }

  isShimmerForSalaryChangeResponse = false;
  dataNotFoundPlaceholderForSalaryChangeResponse = false;
  networkConnectionErrorPlaceHolderForSalaryChangeResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryChangeResponse() {
    this.isShimmerForSalaryChangeResponse = true;
    this.dataNotFoundPlaceholderForSalaryChangeResponse = false;
    this.networkConnectionErrorPlaceHolderForSalaryChangeResponse = false;
    this.salaryChangeResponseList = [];
  }

  isShimmerForSalaryChangeBonusResponse = false;
  dataNotFoundPlaceholderForSalaryChangeBonusResponse = false;
  networkConnectionErrorPlaceHolderForSalaryChangeBonusResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryChangeBonusResponse() {
    this.isShimmerForSalaryChangeBonusResponse = true;
    this.dataNotFoundPlaceholderForSalaryChangeBonusResponse = false;
    this.networkConnectionErrorPlaceHolderForSalaryChangeBonusResponse = false;
    this.salaryChangeBonusResponseList = [];
  }

  isShimmerForSalaryChangeOvertimeResponse = false;
  dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = false;
  networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryChangeOvertimeResponse() {
    this.isShimmerForSalaryChangeOvertimeResponse = true;
    this.dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = false;
    this.networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = false;
    this.salaryChangeOvertimeResponseList = [];
  }




  salaryChangeResponseList : SalaryChangeResponse[] = [];
  getUserSalaryChange(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeResponse();
    this._payrollService.getUserSalaryChange(this.startDate, this.endDate, 
        this.itemPerPage, this.pageNumber, this.search).subscribe((response) => {

      if(response.object==null || response.object.length == 0){
        this.dataNotFoundPlaceholderForSalaryChangeResponse = true;
      } else{
        this.salaryChangeResponseList = response.object;
        this.totalItems = response.totalItems;
      }

      this.isShimmerForSalaryChangeResponse = false;
    }, (error) => {
      this.isShimmerForSalaryChangeResponse = false;
      this.networkConnectionErrorPlaceHolderForSalaryChangeResponse = true;
    })
  }

  searchDebounce(event:any){
    this.searchSubject.next(event)
  }

  selectTab(tab:number){
    this.CURRENT_TAB = tab;
    this.resetSearch();
  }


  searchByInput(event: any) {
    // this.isBeingSearch = true;
    var inp = String.fromCharCode(event.keyCode);
    if (event.type == 'paste') {
      let pastedText = event.clipboardData.getData('text');
      if (pastedText.length > 2) {
        this.pageNumber = 1;
        this.getDataBySelectedTab();
      }

    }else {
      if (this.search.length > 2 && /[a-zA-Z0-9.@]/.test(inp)) {
        this.pageNumber = 1;
        this.getDataBySelectedTab();

      }else if (event.code == 'Backspace' && (event.target.value.length >= 3)) {
        this.pageNumber = 1;
        this.getDataBySelectedTab();

      }else if (this.search.length == 0) {
        this.pageNumber = 1;
        this.search = '';
        this.getDataBySelectedTab();
      }
    }
  }


  resetSearch(){
    this.pageNumber = 1;
    this.totalItems= 0;
    this.search = '';
    this.getDataBySelectedTab();
  }


  

  pageChange(page:any){
    if(this.pageNumber != page){
      this.pageNumber = page; 
      this.getDataBySelectedTab();
    }
  }

  salaryChangeBonusResponseList : SalaryChangeBonusResponse[] = [];
  getUserBonus(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeBonusResponse();
    this._payrollService.getUserBonusAndDeduction(this.startDate, this.endDate,this.itemPerPage, this.pageNumber).subscribe((response) => {

      if(response.object==null || response.object.length == 0){
        this.dataNotFoundPlaceholderForSalaryChangeBonusResponse = true;
      } else{
        this.salaryChangeBonusResponseList = response.object;
        this.totalItems = response.totalItems;
      }

      this.isShimmerForSalaryChangeBonusResponse = false;
    }, (error) => {
      this.isShimmerForSalaryChangeBonusResponse = false;
      this.networkConnectionErrorPlaceHolderForSalaryChangeResponse = true;
    })
  }

 
  


  salaryChangeOvertimeResponseList : SalaryChangeOvertimeResponse[] = [];
  getUserOvertime(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeOvertimeResponse();
    this._payrollService.getUserOvertime(this.startDate, this.endDate, this.itemPerPage, this.pageNumber).subscribe((response) => {

      if(this._helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = true;
      } else{
        this.salaryChangeOvertimeResponseList = response.listOfObject;
        this.totalItems = response.totalItems;
   
      }
      this.isShimmerForSalaryChangeOvertimeResponse = false;
    }, (error) => {
      this.isShimmerForSalaryChangeOvertimeResponse = false;
      this.networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = true;
    })
  }


  processing:boolean=false;
  updatePayrollStep(){
    this.processing = true;
    this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate,this.CURRENT_TAB).subscribe((response)=>{
      if(response.status){
        this.step = response.object;
        if( this.step <= this.OVERTIME){
          this.CURRENT_TAB =  this.step;
          this.navigateToTab(this.CURRENT_TAB);
         }else{
          this.back();
         }
        }
      this.processing = false;
    }, (error) => {
      this.processing = true;
    });
  }



  uploading:boolean=false;
    selectFile(event: any) {
      let file: File;
      if(event!=undefined){
        if(event.target.files.length > 0){
          this.uploading =true;
          file = event.target.files[0];   
          console.log("==file========",file.type)
          if(constant.ALLOWED_BULK_UPLOAD_FORMATS.includes(file.type)){
            this.uploadToFirebase(file); 
          }else{
            this.uploading =false;
            this._helperService.showToast('You can upload only Excel file',Key.TOAST_STATUS_ERROR);
            return;   
          } 
        }
        event.target.value = '';
      }    
    }
  
  
    currentFileUpload!: File;
    response!: String;
    arrayBuffer: any;
    errormessage: any;
    errorList: any[] = new Array();
    uploadJson:any;
    tempList = [];
    headerNotAvailList: any[] = [];
    // excelHeaders:string[]=['Name','Emp Code','Email','Phone','CTC(Yearly)','Effective Date(MM/DD/YYYY)']
  // validation check from frontend side
    Upload() {
  
        var errorFound = 0;
      
      this.errorList = [];
      this.tempList = [];
      this.headerNotAvailList = [];
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.arrayBuffer = fileReader.result;
        var data = new Uint8Array(this.arrayBuffer);
        var arr = new Array();
        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");
        var workbook = XLSX.read(bstr, { type: "binary" });
        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];
        var rowCount = 0;
        var errorCount = 0;
      
        // console.log("Json", XLSX.utils.sheet_to_json(worksheet));
        //@ts-ignore
        XLSX.utils.sheet_to_json(worksheet,{ raw: true, defval: '', blankrows: false }).forEach((element: ExcelColumns) => {
          // console.log("element", XLSX.utils.sheet_to_json(worksheet,{ raw: true, defval: '', blankrows: false }));
          if (rowCount == 0 && this.headerNotAvailList.length==0) {
            
          if (element.Name == undefined) { this.headerNotAvailList.push("Name") }
          if (element.Email == undefined) { this.headerNotAvailList.push("Email") }
          if (element.Phone == undefined) { this.headerNotAvailList.push("Phone") }
          if (element.Amount == undefined) { this.headerNotAvailList.push("Amount") }
          if (element.Comment == undefined) { this.headerNotAvailList.push("Comment") }
            // console.log(this.headerNotAvailList);
            if (this.headerNotAvailList.length>0 )  { 
              ++errorCount;
              //  this.errorToggle = 1;
               this.uploading= false;
               return;
             }
          }
           
          // }
          console.log("row Count"+rowCount)
  
          ++rowCount;
          /*** VALIDATING CELL VALUES */
   
          this.errormessage = "";

        let x = this.errormessage.split(",");
        var name: string = "";
        x.forEach((element: string) => {
          name = name + element;
        });
        this.uploadJson.S_NO= rowCount+1;
        this.uploadJson.message = name;
        if (errorCount > 0 && name!= "" ) {
        ++errorFound;
        if(this.headerNotAvailList.length==0){
          this.errorList.push(this.uploadJson); 
        }
        this.uploading =false;
          // this.errorToggle = 1;
        }
  
      
        });
        if (errorCount==0  ) {
          this.uploadToFirebase(this.currentFileUpload);
        
        } else if(errorCount > 0 && this.headerNotAvailList.length==0){
          // this.errorToggle = 1;
          this.uploading =false;
          this._helperService.showToast('Resolve csv errors',Key.TOAST_STATUS_ERROR);
          return;
        }
        }      
  
        fileReader.readAsArrayBuffer(this.currentFileUpload);
     
  
  
    }
  
  
    uploadToFirebase(file:any){
        let fileName = file.name.split(" ").join("");;
        let extension = fileName.substring(fileName.lastIndexOf("."), fileName.length);
        fileName = fileName.replace(extension, "").replace(/[^0-9a-zA-Z]/gi, "_")+ new Date().getTime() + extension;
        var firebasePath = "bonus/upload/"+fileName;
        const fileRef = this._afStorage.ref(firebasePath);
        this._afStorage.upload(firebasePath,file).snapshotChanges().pipe(finalize(async () => {
            fileRef.getDownloadURL().subscribe((url: any) => {
              this.processToServer(fileName,url);     
            })
          })
        ).subscribe((res: any) => {
          
  
        })
      }
  
  
      processToServer(fileName:string,url:string) {
        this._payrollService.updateUserBonusDetail(url,fileName,this.startDate, this.endDate).subscribe((response) => {
           if(response.status){
            this.getUserBonus();     
            this._helperService.showToast('Uploaded Successfully',Key.TOAST_STATUS_SUCCESS);
           }else{
            this._helperService.showToast('Failed to upload',Key.TOAST_STATUS_ERROR);
           }
           this.uploading =false;
          },(error) => {
          }
        );
      }


}
