
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { BulkAction } from 'src/app/models/bulkAction';
import { ESIContributionRate } from 'src/app/models/e-si-contribution-rate';
import { PFContributionRate } from 'src/app/models/p-f-contribution-rate';
import { SalaryCalculationMode } from 'src/app/models/salary-calculation-mode';
import { SalaryComponent } from 'src/app/models/salary-component';
import { SalaryTemplateComponentRequest } from 'src/app/models/salary-template-component-request';
import { SalaryTemplateComponentResponse } from 'src/app/models/salary-template-component-response';
import { Staff } from 'src/app/models/staff';
import { StatutoryAttribute } from 'src/app/models/statutory-attribute';
import { StatutoryAttributeResponse } from 'src/app/models/statutory-attribute-response';
import { StatutoryRequest } from 'src/app/models/statutory-request';
import { StatutoryResponse } from 'src/app/models/statutory-response';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryService } from 'src/app/services/salary.service';
import * as XLSX from 'xlsx';
import { Routes } from 'src/app/constant/Routes';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-salary-setting',
  templateUrl: './salary-setting.component.html',
  styleUrls: ['./salary-setting.component.css'],
})
export class SalarySettingComponent implements OnInit {
  constructor(
    private dataService: DataService,
    public helperService: HelperService,
    private _afStorage: AngularFireStorage,
    private _salaryService: SalaryService,
    public rbacService: RoleBasedAccessControlService,

  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getAllSalaryCalculationModeMethodCall();
    this.getAllTemplateComponentsMethodCall();
    this.getAllSalaryTemplateComponentByOrganizationIdMethodCall();
    this.getSalaryUploadBulkAction();
    this.getPFContributionRateMethodCall();
    this.getESIContributionRateMethodCall();
    this.getAllStatutoriesMethodCall();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged() // Wait 300ms after the last keystroke
    ).subscribe(() => {
      this.pageNumber = 1;
      this.getUserByFiltersMethodCall();
    });
  }

  //Variable for pagination
  pageNumber: number = 1;
  itemPerPage: number = 8;
  total: number = 0;
  lastPageNumber: number = 1;
  searchText: string = '';
  searchBy: string = 'name';
  sort: string = '';
  sortBy: string = 'name';
  staffs: Staff[] = [];
  sampleExcelFile: string =
    'https://firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/sampleFile%2Femployee_salary_detail_sample.xlsx?alt=media&token=8a0ed26e-55a7-4987-876a-bff44f62e2ce';

  CURRENT_TAB_IN_SALARY_TEMPLATE = Key.SALARY_TEMPLATE_STEP;

  SALARY_TEMPLATE_STEP = Key.SALARY_TEMPLATE_STEP;
  STAFF_SELECTION_STEP = Key.STAFF_SELECTION_STEP;

  @ViewChild('salaryTemplateTab', { static: false })
  salaryTemplateTab!: ElementRef;
  @ViewChild('staffSelectionTab', { static: false })
  staffSelectionTab!: ElementRef;
  readonly Routes=Routes;

  //Tab navigation
  salaryTemplateTabClick() {
    this.CURRENT_TAB_IN_SALARY_TEMPLATE = Key.SALARY_TEMPLATE_STEP;
    this.resetCriteriaFilter();
  }

  staffSelectionTabClick() {
    this.CURRENT_TAB_IN_SALARY_TEMPLATE = Key.STAFF_SELECTION_STEP;
    this.resetCriteriaFilter();
    this.getUserByFiltersMethodCall();
  }

  goToSalaryTemplateTab() {
    this.salaryTemplateTab.nativeElement.click();
  }

  goToStaffSelectionTab() {
    this.staffSelectionTab.nativeElement.click();
  }

  //Code for toggle buttons in statutories section
  switchValueForPF = false;
  switchValueForESI = false;
  switchValueForProfessionalTax = false;

  EPF_ID = Key.EPF_ID;
  ESI_ID = Key.ESI_ID;
  PROFESSIONAL_TAX_ID = Key.PROFESSIONAL_TAX_ID;
  LWF_ID = Key.LWF_ID;

  UNRESTRICTED_PF_WAGE = Key.UNRESTRICTED_PF_WAGE;
  RESTRICTED_PF_WAGE_UPTO_15000 = Key.RESTRICTED_PF_WAGE_UPTO_15000;

  setStatutoryVariablesToFalse() {
    this.switchValueForPF = false;
    this.switchValueForESI = false;
    this.switchValueForProfessionalTax = false;
  }

  //Code for shimmers and placeholders
  isShimmerForSalaryCalculationMode = false;
  dataNotFoundPlaceholderForSalaryCalculationMode = false;
  networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall() {
    this.isShimmerForSalaryCalculationMode = true;
    this.dataNotFoundPlaceholderForSalaryCalculationMode = false;
    this.networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  }

  isShimmerForStatutory = false;
  dataNotFoundPlaceholderForStatutory = false;
  networkConnectionErrorPlaceHolderForStatutory = false;
  preRuleForShimmersAndErrorPlaceholdersForStatutoryMethodCall() {
    this.isShimmerForStatutory = true;
    this.dataNotFoundPlaceholderForStatutory = false;
    this.networkConnectionErrorPlaceHolderForStatutory = false;
  }

  isShimmerForSalaryTemplate = false;
  dataNotFoundPlaceholderForSalaryTemplate = false;
  networkConnectionErrorPlaceHolderForSalaryTemplate = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateMethodCall() {
    this.isShimmerForSalaryTemplate = true;
    this.dataNotFoundPlaceholderForSalaryTemplate = false;
    this.networkConnectionErrorPlaceHolderForSalaryTemplate = false;
  }

  isShimmerForSalaryTemplateStaffSelection = false;
  dataNotFoundPlaceholderForSalaryTemplateStaffSelection = false;
  networkConnectionErrorPlaceHolderForSalaryTemplateStaffSelection = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateStaffSelectionMethodCall() {
    this.isShimmerForSalaryTemplateStaffSelection = true;
    this.dataNotFoundPlaceholderForSalaryTemplateStaffSelection = false;
    this.networkConnectionErrorPlaceHolderForSalaryTemplateStaffSelection =false;
  }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                               SECTION  START                                                                       //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //Fetching all the salary calculation mode from the database
  salaryCalculationModeList: SalaryCalculationMode[] = [];
  getAllSalaryCalculationModeMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall();
    this._salaryService.getAllSalaryCalculationMode().subscribe((response) => {
        if(response.status){
          this.salaryCalculationModeList = response.object;
          if(this.salaryCalculationModeList==null){
            this.salaryCalculationModeList = [];
          }
        }
      },
      (error) => {
        this.networkConnectionErrorPlaceHolderForSalaryCalculationMode = true;
      }
    );
  }



  //Fetching salary components
  salaryComponentList: SalaryComponent[] = new Array();
  getAllTemplateComponentsMethodCall() {
    this._salaryService.getAllTemplateComponents().subscribe((response) => {
      if(response.status){
        this.salaryComponentList = response.object;
        if(this.salaryComponentList!=null && this.salaryComponentList.length > 0) {
           this.salaryComponentList.forEach((item) => {
            item.toggle = false;
            item.value = 0;
          });
          this.salaryComponentList[0].toggle = true;
          this.salaryComponentList[0].value = 100;
        }else{
          this.salaryComponentList = [];
        }
      }
      },(error) => {

      }
    );
  }


//Fetching salary template components
  salaryTemplateComponentResponseList: SalaryTemplateComponentResponse[] = new Array();
  getAllSalaryTemplateComponentByOrganizationIdMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateMethodCall();
    this._salaryService.getAllSalaryTemplate().subscribe((response) => {
        if(response.status){
          this.salaryTemplateComponentResponseList = response.object;
          if(this.salaryTemplateComponentResponseList!=null && this.salaryTemplateComponentResponseList.length > 0){
            if(this.salaryTemplateComponentResponseList.length == 1) {
               this.activeIndex = 0;
            }
          }else{
            this.dataNotFoundPlaceholderForSalaryTemplate = true;
            this.salaryTemplateComponentResponseList = [];
          }
        }
      },
      (error) => {
        this.networkConnectionErrorPlaceHolderForSalaryTemplate = true;
      }
    );
  }

  //Update the salary calculation mode
  selectedSalaryModeId:number=0;
  @ViewChild('salaryModeClose') salaryModeClose!:ElementRef;
  updateSalaryCalculationMode(salaryCalculationModeId: number) {
      if(!this.rbacService.hasWriteAccess(Routes.SALARYSETTING)){
      this.helperService.showPrivilegeErrorToast();
      return;
      }

    this._salaryService.updateSalaryCalculationMode(salaryCalculationModeId).subscribe((response) => {
        if(response.status){
          this.salaryModeClose.nativeElement.click();
          this.salaryCalculationModeList.forEach((salaryMode)=>{
              if(salaryMode.id == salaryCalculationModeId){
                salaryMode.selected = true;
              }else{
                salaryMode.selected = false;
              }
          });
          this.helperService.showToast(response.message,Key.TOAST_STATUS_SUCCESS);
        }
        },
        (error) => {
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }


  //Fetching the PF contribution rates
  pFContributionRateList: PFContributionRate[] = [];
  getPFContributionRateMethodCall() {
    this._salaryService.getPFContributionRate().subscribe(
      (response) => {
        if(response.status){
          this.pFContributionRateList = response.object;
          if(this.pFContributionRateList == null){
            this.pFContributionRateList = [];
          }
        }
      },
      (error) => {}
    );
  }

   //Fetching the ESI contribution rates
  eSIContributionRateList: ESIContributionRate[] = [];
  getESIContributionRateMethodCall() {
    this._salaryService.getESIContributionRate().subscribe(
      (response) => {
        if(response.status){
          this.eSIContributionRateList = response.object;
          if(this.eSIContributionRateList == null){
            this.eSIContributionRateList = [];
          }
        }
      },
      (error) => {}
    );
  }

  //Fetching the statutories
  statutoryResponseList: StatutoryResponse[] = [];
  getAllStatutoriesMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersForStatutoryMethodCall();
    this._salaryService.getAllStatutories().subscribe((response) => {
      if(response.status){
        this.statutoryResponseList = response.object;
        if(this.statutoryResponseList == null){
          this.dataNotFoundPlaceholderForStatutory = true;
          this.statutoryResponseList = [];
        }
      }
      },
      (error) => {
        this.networkConnectionErrorPlaceHolderForStatutory = true;
      }
    );
  }




  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                            SALARY UPLOAD / DOWNLOAD SECTION START                                                //
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  isViewMore: boolean =false;
  lastUploadedFileName: string = '';
  lastUploadedDate: string = '';
  salaryBulkAction:BulkAction [] = new Array();
  getSalaryUploadBulkAction() {
    this.salaryBulkAction  = [];
    this.lastUploadedFileName ='';
    this.lastUploadedDate = '';
    this._salaryService.getBulkActionLog("IMPORT","User-Salary",1).subscribe((response) => {
        if(response.status){
          this.salaryBulkAction = response.object;
          if(this.salaryBulkAction!=null && this.salaryBulkAction.length>0){
            this.lastUploadedFileName = this.salaryBulkAction[0].fileName;
            this.lastUploadedDate = this.salaryBulkAction[0].createdDate;
          }
        }
      },(error) => {
      }
    );
  }

  uploading:boolean=false;
  selectFile(event: any) {
    if(!this.rbacService.hasWriteAccess(Routes.SALARYSETTING)){
      this.helperService.showPrivilegeErrorToast();
      return;
    }
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
          this.helperService.showToast('You can upload only Excel file',Key.TOAST_STATUS_ERROR);
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
        if (element.CTC == undefined) { this.headerNotAvailList.push("CTC(Yearly)") }
        if (element.date == undefined) { this.headerNotAvailList.push("Effective Date(MM/DD/YYYY)") }
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


        // this.uploadJson = this.trimAll(element);

     //phone number validation
    //  if (!this.isNullOrEmpty(element.Customer_Phone) ) {

    //   if(element.Customer_Phone.length!=ExcelConstants.CUSTOMER_PHONE_LENGTH ){
    //     errorCount++;
    //     this.uploadJson.Customer_Phone = element.Customer_Phone;
    //     this.errormessage = this.errormessage + "," +ExcelConstants.CUSTOMER_PHONE_LENGTH_ERROR;
    //   }
    // }else {
    //     errorCount++;
    //     this.uploadJson.Customer_Phone = element.Customer_Phone;
    //     this.uploadJson.Customer_Phone = "EMPTY Customer_Phone";
    //     this.errormessage = this.errormessage + "," + ExcelConstants.CUSTOMER_PHONE_ERROR;
    //   }


       //Email validation
    //  if (!this.isNullOrEmpty(element.Credit_Amount) ) {

    //   if(Number(element.Credit_Amount) < 1 ){
    //     errorCount++;
    //     this.uploadJson.Credit_Amount = element.Credit_Amount;
    //     this.errormessage = this.errormessage + "," +ExcelConstants.AMOUNT_ERROR;
    //   }
    // }else {
    //     errorCount++;
    //     this.uploadJson.Credit_Amount = element.Credit_Amount;
    //     this.uploadJson.Customer_Phone = "EMPTY Customer_Phone";
    //     this.errormessage = this.errormessage + "," + ExcelConstants.CREDIT_AMOUNT_ERROR;
    //   }


     //CTC validation
    //  if (!this.isNullOrEmpty(element.Remarks) ) {

    //   if(element.Remarks.length > ExcelConstants.GROUP_NAME_MAX_LENGTH){
    //     errorCount++;
    //     this.uploadJson.Remarks = element.Remarks;
    //     this.errormessage = this.errormessage + "," +ExcelConstants.REMARKS_MAX_LENGTH_ERROR;
    //  }
    // }else {

    //   errorCount++;
    //   this.uploadJson.Remarks = element.Remarks;
    //   this.uploadJson.Remarks = "EMPTY Remarks";
    //   this.errormessage = this.errormessage + "," + ExcelConstants.REMARKS_ERROR;
    //    }


       //Effective Date validation
    //  if (!this.isNullOrEmpty(element.Wallet_Type) ) {

    //   if(element.Wallet_Type.trim() != "Main Wallet" && element.Wallet_Type.trim() != "Promo Wallet"){
    //     errorCount++;
    //     this.uploadJson.Wallet_Type = element.Wallet_Type;
    //     this.errormessage = this.errormessage + "," +ExcelConstants.INVALID_WALLET_TYPE;
    //  }
    // }else {

    //   errorCount++;
    //   this.uploadJson.Wallet_Type = element.Wallet_Type;
    //   this.uploadJson.Wallet_Type = "EMPTY Wallet_Type";
    //   this.errormessage = this.errormessage + "," + ExcelConstants.WALLET_TYPE_ERROR;
    //    }



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
        this.helperService.showToast('Resolve csv errors',Key.TOAST_STATUS_ERROR);
        return;
      }
      }

      fileReader.readAsArrayBuffer(this.currentFileUpload);



  }


  uploadToFirebase(file:any){
      let fileName = file.name.split(" ").join("");;
      let extension = fileName.substring(fileName.lastIndexOf("."), fileName.length);
      fileName = fileName.replace(extension, "").replace(/[^0-9a-zA-Z]/gi, "_")+ new Date().getTime() + extension;
      var firebasePath = "salary/upload/"+fileName;
      const fileRef = this._afStorage.ref(firebasePath);
      this._afStorage.upload(firebasePath,file).snapshotChanges().pipe(
        finalize(async () => {
          fileRef.getDownloadURL().subscribe((url: any) => {
            this.processToServer(fileName,url);
          })
        })
      ).subscribe((res: any) => {


      })
    }


    processToServer(fileName:string,url:string) {
      this._salaryService.updateUserSalaryDetail(url,fileName).subscribe((response) => {
         if(response.status){
          this.getSalaryUploadBulkAction();
          this.helperService.showToast('Uploaded Successfully',Key.TOAST_STATUS_SUCCESS);
         }else{
          this.helperService.showToast('Failed to upload',Key.TOAST_STATUS_ERROR);
         }
         this.uploading =false;
        },(error) => {
        }
      );
    }



    getBulkUpdatedUser(bulkId:number) {
      this._salaryService.getUpdatedUser(bulkId).subscribe((response) => {
         if(response.status){
          console.log("=============", response.object)
          //Hold data

         }else{

         }
        },(error) => {
        }
      );
    }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  downloading:boolean=false;
  getCurrentSalaryReport(){
    this.downloading = true;
    this._salaryService.exportCurrentSalaryReport().subscribe((response) => {
      if (response.status) {
        if(response.object!=null){
          this.downloadUrl(response.object);
          // this.downloadExcel(response.object);
        }
      }
      this.downloading = false;
    },
    (error) => {
      this.downloading = false;
    });
  }

  // downloadExcel(url: string) {
  //   this._http.get(url, { responseType: 'blob' }).subscribe(blob => {
  //     saveAs(blob, 'User_Salary.xlsx');
  //   });
  // }

  extractFileName(url: string): string {
    const parts = decodeURIComponent(url).split("/");
    return parts[parts.length - 1].split("?")[0];
  }


  downloadUrl(url:string){
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = this.extractFileName(url);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                            SALARY UPLOAD/DOWNLOAD SECTION END                                                    //
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @ViewChild('statutoryPFButton')statutoryPFButton!:ElementRef;
  @ViewChild('statutoryESIButton')statutoryESIButton!:ElementRef;
  @ViewChild('statutoryProButton')statutoryProButton!:ElementRef;
  @ViewChild('statutoryOffButton')statutoryOffButton!:ElementRef;

  tempStatutoryResp: StatutoryResponse = new StatutoryResponse();
  async toggleStatutory(statutoryResponse: StatutoryResponse) {
    this.tempStatutoryResp = statutoryResponse;
    if (!statutoryResponse.switchValue) {
      await this.getStatutoryAttributeByStatutoryIdMethodCall(statutoryResponse.id);
      if (statutoryResponse.id == this.EPF_ID) {
        this.statutoryPFButton.nativeElement.click();
      } else if (statutoryResponse.id == this.ESI_ID) {
        this.statutoryESIButton.nativeElement.click();
      } else if (statutoryResponse.id == this.PROFESSIONAL_TAX_ID) {
        this.statutoryOffButton.nativeElement.click();
      } else if (statutoryResponse.id == this.LWF_ID) {
        this.statutoryOffButton.nativeElement.click();
      }
    }else {
      this.statutoryOffButton.nativeElement.click();
    }
}


  updateStatutory(){
    this.statutoryRequest = new StatutoryRequest();
    this.statutoryRequest.id = this.tempStatutoryResp .id;
    this.statutoryRequest.name = this.tempStatutoryResp .name;
    this.statutoryRequest.switchValue = !this.tempStatutoryResp .switchValue;
    this.statutoryRequest.statutoryAttributeRequestList = this.statutoryAttributeResponseList;
    this.enableOrDisableStatutoryMethodCall();
  }

  statutoryRequest: StatutoryRequest = new StatutoryRequest();
  isUpdating:boolean = false;
  enableOrDisableStatutoryMethodCall() {
    this.isUpdating =true;
    this.dataService.enableOrDisableStatutory(this.statutoryRequest).subscribe((response) => {
        const item = this.statutoryResponseList.find(x => x.id === this.statutoryRequest.id);
        if(item) {
          if(!item.switchValue){
            item.switchValue = true;
          }else{
            item.switchValue = false;
          }
        }

        this.isUpdating =false;
        this.helperService.showToast(response.message,Key.TOAST_STATUS_SUCCESS);
      },
      (error) => {
        this.isUpdating =false;
        this.helperService.showToast( 'Error in updating ' + this.statutoryRequest.name, Key.TOAST_STATUS_ERROR);

      }
    );
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                             SECTION  END                                                                           //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // async clickSwitch(statutoryResponse: StatutoryResponse) {
  //   if (!statutoryResponse.loading) {
  //     statutoryResponse.loading = true;
  //   }

  //   await this.getStatutoryAttributeByStatutoryIdMethodCall(statutoryResponse.id);

  //   this.statutoryRequest.id = statutoryResponse.id;
  //   this.statutoryRequest.name = statutoryResponse.name;
  //   this.statutoryRequest.switchValue = !statutoryResponse.switchValue;
  //   this.statutoryRequest.statutoryAttributeRequestList =
  //     this.statutoryAttributeResponseList;

  //   // console.log(this.statutoryAttributeResponseList);

  //   if (statutoryResponse.switchValue === false) {
  //     if (statutoryResponse.id == this.EPF_ID) {
  //       this.switchValueForPF = true;
  //     } else if (statutoryResponse.id == this.ESI_ID) {
  //       this.switchValueForESI = true;
  //     } else if (statutoryResponse.id == this.PROFESSIONAL_TAX_ID) {
  //       this.switchValueForProfessionalTax = true;
  //     }
  //   } else {
  //     this.enableOrDisableStatutoryMethodCall();
  //   }
  // }



  selectedPFContributionRateForEmployees: PFContributionRate = {
    id: 1,
    name: '12% of PF Wage (Unrestricted)',
    description: '',
  };

  selectedPFContributionRateForEmployers: PFContributionRate = {
    id: 1,
    name: '12% of PF Wage (Unrestricted)',
    description: '',
  };

  //Fetching statutory's attributes
  statutoryAttributeResponseList: StatutoryAttributeResponse[] = [];
  getStatutoryAttributeByStatutoryIdMethodCall(statutoryId: number) {
    return new Promise((resolve, reject) => {
      this._salaryService.getStatutoryAttributeByStatutoryId(statutoryId).subscribe((response) => {
        if(response.status){

          this.statutoryAttributeResponseList = response.object;

          if (statutoryId == this.EPF_ID) {
              this.statutoryAttributeResponseList.forEach((attr) => {
                if (attr.value == null) {
                  attr.value = this.pFContributionRateList[0].name;
                }
              });
          } else if (statutoryId == this.ESI_ID) {
              this.statutoryAttributeResponseList.forEach((attr) => {
                if (attr.value == null) {
                  const matchingESIRate = this.eSIContributionRateList.find((esi) => esi.id == attr.id);
                  if (matchingESIRate) {
                  attr.value = matchingESIRate.percentage;
                }
              }
            });
          }
        }
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  //Disable other inputs if Employer's PF Contribution input is selected as Unirestricted
  inputsDisabled: boolean = true;
  selectPFContributionRate(
    statutoryAttribute: StatutoryAttribute,
    pFContributionRate: PFContributionRate,
    index: number
  ) {
    statutoryAttribute.value = pFContributionRate.name;

    // console.log(this.statutoryAttributeResponseList);

    if (
      index === 0 &&
      this.pFContributionRateList.indexOf(pFContributionRate) === 0
    ) {
      this.inputsDisabled = true;
    } else {
      this.inputsDisabled = false;
    }

    this.statutoryRequest.statutoryAttributeRequestList =
      this.statutoryAttributeResponseList;
  }

  shouldDisableInput(attributeIndex: number): boolean {
    return this.inputsDisabled && attributeIndex !== 0;
  }

  //register salary template with attribute

  readonly BASIC_PAY_ID = Key.BASIC_PAY_ID;
  readonly HRA_ID = Key.HRA_ID;

  salaryTemplateRegisterButtonLoader: boolean = false;
  salaryTemplateComponentRequest: SalaryTemplateComponentRequest =
    new SalaryTemplateComponentRequest();

  registerSalaryTemplateMethodCall() {
    debugger;
    this.salaryTemplateRegisterButtonLoader = true;

    this.salaryComponentList.forEach((item) => {
      const matchingSalaryComponent =
        this.salaryTemplateComponentRequest.salaryComponentRequestList.find(
          (salaryComponent) => salaryComponent.id === item.id
        );

      if (matchingSalaryComponent) {
        if (item.toggle && item.value != matchingSalaryComponent) {
          matchingSalaryComponent.value = item.value;
        } else {
          matchingSalaryComponent.toggle = false;
        }
      } else {
        if (item.toggle) {
          this.salaryTemplateComponentRequest.salaryComponentRequestList.push(
            item
          );
        }
      }
    });

    this.salaryTemplateComponentRequest.userUuids = this.selectedStaffsUuids;

    this.dataService
      .registerSalaryTemplate(this.salaryTemplateComponentRequest)
      .subscribe(
        (response) => {
          this.salaryTemplateRegisterButtonLoader = false;
          this.cancelSalaryTemplateModal.nativeElement.click();
          this.getAllSalaryTemplateComponentByOrganizationIdMethodCall();
          this.helperService.showToast(
            response.message,
            Key.TOAST_STATUS_SUCCESS
          );
          this.helperService.registerOrganizationRegistratonProcessStepData(
            Key.SALARY_TEMPLATE_ID,
            Key.PROCESS_COMPLETED
          );
        },
        (error) => {
          this.helperService.showToast(
            'Error while registering salary template!',
            Key.TOAST_STATUS_ERROR
          );
          this.salaryTemplateRegisterButtonLoader = false;
        }
      );
  }

  formatterPercent = (value: number): string => `${value} %`;
  parserPercent = (value: string): string => value.replace(' %', '');
  formatterDollar = (value: number): string => `$ ${value}`;
  parserDollar = (value: string): string => value.replace('$ ', '');



  getSalaryTemplateComponentByIdMethodCall(salaryTemplateComponentId: number) {
    this.dataService
      .getSalaryTemplateComponentById(salaryTemplateComponentId)
      .subscribe(
        (response) => {
          this.salaryTemplateComponentRequest = response.object;
        },
        (error) => {}
      );
  }



  @ViewChild('salaryTemplateModal') salaryTemplateModal!: ElementRef;
  @ViewChild('cancelSalaryTemplateModal')
  cancelSalaryTemplateModal!: ElementRef;
  updateSalaryTemplateComponentBySalaryTemplateId(
    salaryTemplateComponentResponse: SalaryTemplateComponentResponse,
    type: string
  ) {
    this.salaryTemplateComponentRequest.id = salaryTemplateComponentResponse.id;
    this.salaryTemplateComponentRequest.name =salaryTemplateComponentResponse.name;
    this.salaryTemplateComponentRequest.description = salaryTemplateComponentResponse.description;
    this.salaryTemplateComponentRequest.salaryComponentRequestList =salaryTemplateComponentResponse.salaryComponentResponseList;
    this.salaryTemplateComponentRequest.userUuids =salaryTemplateComponentResponse.userUuids;
    this.selectedStaffsUuids = salaryTemplateComponentResponse.userUuids;

    salaryTemplateComponentResponse.salaryComponentResponseList.forEach(
      (salaryComponentResponse) => {
        const matchingSalaryComponent = this.salaryComponentList.find(
          (salaryComponent) => salaryComponent.id === salaryComponentResponse.id
        );
        if (matchingSalaryComponent) {
          matchingSalaryComponent.value = salaryComponentResponse.value;
          matchingSalaryComponent.toggle = true;
        }
      }
    );

    this.salaryComponentList.sort(
      (a, b) => (b.toggle ? 1 : 0) - (a.toggle ? 1 : 0)
    );

    if (type == this.STAFF_SELECTION_STEP) {
      this.staffSelectionTab.nativeElement.click();
    }
  }

  clearSalaryTemplateModal() {
    this.salaryTemplateComponentRequest = new SalaryTemplateComponentRequest();
    this.getAllTemplateComponentsMethodCall();
    this.resetCriteriaFilter();
    this.selectedStaffsUuids = [];
    this.isAllUsersSelected = false;
    // this.salaryTemplateTab.nativeElement.click();
  }

  // toggleSalaryComponent(salaryComponent: SalaryComponent): void {
  //   if (salaryComponent.toggle) {
  //     salaryComponent.value = salaryComponent.previousValue;
  //   } else {
  //     salaryComponent.previousValue = salaryComponent.value;
  //     salaryComponent.value = 0;
  //   }
  // }

  deleteSalaryTemplateByIdMethodCall(salaryTemplateId: number) {
    this.dataService.deleteSalaryTemplateById(salaryTemplateId).subscribe(
      (response) => {
        this.helperService.showToast(response.message,Key.TOAST_STATUS_SUCCESS);
        this.getAllSalaryTemplateComponentByOrganizationIdMethodCall();
      },
      (error) => {
        this.helperService.showToast(
          'Error in deleting salary template!',
          Key.TOAST_STATUS_ERROR
        );
      }
    );
  }

  activeIndex: number | null = null;

  toggleCollapse(index: number): void {
    if (this.activeIndex === index) {
      this.activeIndex = null;
      this.activeIndex = index;
    }
  }

  // ##### Staff selection ############

  // Selection functionality
  isAllUsersSelected: boolean = false;
  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;
  totalUserCount: number = 0;

  //Method to select all the user
  selectAll(checked: boolean) {
    if(!this.rbacService.hasWriteAccess(Routes.SALARYSETTING)){
      this.helperService.showPrivilegeErrorToast();
      return;
    }
    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffsUuids based on the current page selection
    if (checked) {
      this.staffs.forEach((staff) => {
        if (!this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids.push(staff.uuid);
        }
      });
    } else {
      this.staffs.forEach((staff) => {
        if (this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
            (uuid) => uuid !== staff.uuid
          );
        }
      });
    }

    this.checkIndividualSelection();
  }

  //Method to select all users on a page
  selectAllUsers(event: any) {
    const isChecked = event.target.checked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked));

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffsUuids list
      this.getAllUserUuidsMethodCall().then((allUuids) => {
        this.selectedStaffsUuids = allUuids;
      });
    } else {
      this.selectedStaffsUuids = [];
    }
  }

  //Method to unselect all users
  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffsUuids = [];
  }

  checkIndividualSelection(isCheckBoxClicked: boolean = false) {
    if(!this.rbacService.hasWriteAccess(Routes.SALARYSETTING) && isCheckBoxClicked){
      this.helperService.showPrivilegeErrorToast();
      return;
    }
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
  }

  checkAndUpdateAllSelected() {
    this.isAllSelected =
      this.staffs.length > 0 && this.staffs.every((staff) => staff.selected);
    this.isAllUsersSelected = this.selectedStaffsUuids.length === this.total;
  }

  updateSelectedStaffs() {
    this.staffs.forEach((staff) => {
      if (staff.selected && !this.selectedStaffsUuids.includes(staff.uuid)) {
        this.selectedStaffsUuids.push(staff.uuid);
      } else if (
        !staff.selected &&
        this.selectedStaffsUuids.includes(staff.uuid)
      ) {
        this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
          (uuid) => uuid !== staff.uuid
        );
      }
    });

    this.checkAndUpdateAllSelected();
  }

  //Method to search users
  private searchSubject = new Subject<string>();
  searchUsers() {
    this.searchSubject.next(this.searchText);
  }
  onSearch(event: any) {
    console.log('Search text:', this.searchText);
    this.searchSubject.next(this.searchText);
  }

  //Method to clear search text
  clearSearchText() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }

  //Method to get user list by pagination
  getUserByFiltersMethodCall() {
    this.staffs = [];
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateStaffSelectionMethodCall();
    this.dataService
      .getUsersByFilter(
        this.itemPerPage,
        this.pageNumber,
        'asc',
        'id',
        this.searchText,
        '',
        this.selectedTeamId
      )
      .subscribe(
        (response) => {
          if (
            response.users == undefined ||
            response.users == null ||
            response.users.length == 0
          ) {
            this.dataNotFoundPlaceholderForSalaryTemplateStaffSelection = true;
            this.isShimmerForSalaryTemplateStaffSelection = false;
          }
          this.staffs = response.users.map((staff: Staff) => ({
            ...staff,
            selected: this.selectedStaffsUuids.includes(staff.uuid),
          }));

          if (this.selectedTeamId == 0 && this.searchText == '') {
            this.totalUserCount = response.count;
          }
          this.total = response.count;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
          this.isAllSelected = this.staffs.every((staff) => staff.selected);

          this.isShimmerForSalaryTemplateStaffSelection = false;
          this.checkIndividualSelection();
        },
        (error) => {
          console.error(error);
          this.isShimmerForSalaryTemplateStaffSelection = false;
          this.networkConnectionErrorPlaceHolderForSalaryTemplateStaffSelection =
            true;
        }
      );
  }

  // Fetching all the uuids of the users by organization
  allUserUuids: string[] = [];
  async getAllUserUuidsMethodCall() {
    return new Promise<string[]>((resolve, reject) => {
      this.dataService.getAllUserUuids().subscribe({
        next: (response) => {
          this.allUserUuids = response.listOfObject;
          resolve(this.allUserUuids);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  //Reset criteria filter
  resetCriteriaFilter() {
    this.itemPerPage = 8;
    this.pageNumber = 1;
    this.lastPageNumber = 0;
    this.total = 0;
    this.sort = 'asc';
    this.sortBy = 'id';
    this.searchText = '';
    this.searchBy = 'name';
  }

  selectedTeamName: string = 'All';
  selectedTeamId: number = 0;
  page = 0;
  selectTeam(teamId: number) {
    debugger;
    if (teamId === 0) {
      this.selectedTeamName = 'All';
    } else {
      const selectedTeam = this.teamNameList.find(
        (team) => team.teamId === teamId
      );
      this.selectedTeamName = selectedTeam ? selectedTeam.teamName : 'All';
    }
    this.page = 0;
    this.itemPerPage = 10;
    // this.fullLeaveLogs = [];
    // this.selectedTeamName = teamName;
    this.selectedTeamId = teamId;
    this.getUserByFiltersMethodCall();
  }

  teamNameList: UserTeamDetailsReflection[] = [];
  teamId: number = 0;
  getTeamNames() {
    debugger;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.teamNameList = response.object;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
      },
    });
  }

  // Pagination
  changePage(page: any) {

    console.log('Page changed:', page);
    console.log('Current page:', this.pageNumber);
    if(page!=this.pageNumber){
      this.pageNumber=page;
     this.getUserByFiltersMethodCall();
    }
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.total / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.itemPerPage);
  }
  getStartIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }
  getEndIndex(): number {
    const endIndex = this.pageNumber * this.itemPerPage;
    return endIndex > this.total ? this.total : endIndex;
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  staffCount(staff:any){
    if(staff  == null){
      return 0;
    }else{
      return staff.length;
    }
  }

  @ViewChild('staffBtn') staffButton!: ElementRef;
  @ViewChild('templateBtn') templateButton!: ElementRef;

  clickStaffTab() {
    this.staffButton.nativeElement.click(); // Triggers the Staff selection tab
  }

  clickTemplateTab() {
    this.templateButton.nativeElement.click(); // Triggers the Template details tab
  }

}
