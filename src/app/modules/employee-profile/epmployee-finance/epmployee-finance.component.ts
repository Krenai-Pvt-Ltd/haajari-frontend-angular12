import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EmployeePayslipLogResponse } from 'src/app/employee-payslip-log-response';
import { EmployeePayslipBreakupResponse } from 'src/app/models/employee-payslip-breakup-response';
import { EmployeePayslipDeductionResponse } from 'src/app/models/employee-payslip-deduction-response';
import { EmployeePayslipResponse } from 'src/app/models/employee-payslip-response';
import { UserPaymentDetail } from 'src/app/models/UserPaymentDetail';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryService } from 'src/app/services/salary.service';
import { EmployeeProfileComponent } from '../employee-profile.component';
import { UserSalaryRevisionRes } from 'src/app/models/UserSalaryRevisionRes';
import { CurrentSalaryDetail } from 'src/app/models/CurrentSalaryDetail';
import { SalaryTemplateComponentResponse } from 'src/app/models/salary-template-component-response';
import { SalaryComponentResponse } from 'src/app/models/salary-component-response';
import { Key } from 'src/app/constant/key';
import { AppraisalRequest } from 'src/app/models/appraisal-request';
import { BonusRequest } from 'src/app/models/bonus-request';
import { NgForm } from '@angular/forms';
import { constant } from 'src/app/constant/constant';
import { StatutoryRequest } from 'src/app/models/statutory-request';
import { UserService } from 'src/app/services/user.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { PayoutDaysSummary } from 'src/app/models/PayoutDaysSummary';
import { SalaryDeductionResponse } from 'src/app/models/SalaryDeductionResponse';
import { SalaryComponent } from 'src/app/models/salary-component';
import { UserSalaryTemplateComponent } from 'src/app/models/UserSalaryTemplateComponent';
import { TaxExemptionValueRes } from 'src/app/models/TaxExemptionValueRes';

@Component({
  selector: 'app-epmployee-finance',
  templateUrl: './epmployee-finance.component.html',
  styleUrls: ['./epmployee-finance.component.css']
})
export class EpmployeeFinanceComponent implements OnInit {

  selectedPayslipUrl!: SafeResourceUrl;
  userUuid: string = '';
  financeBlur: boolean = true;
  isLoading: boolean = false;
  firstTimeLoad: boolean = true;

  constructor(private _dataService: DataService,
    public _helperService: HelperService,
    private _salaryService: SalaryService,
    private sanitizer: DomSanitizer,
    public employeeProfileComponent: EmployeeProfileComponent,
    private _userService: UserService,
    public _roleService: RoleBasedAccessControlService
  ) {

    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userUuid = userUuidParam?.toString() ?? ''
  }


  ngOnInit(): void {
    this.getCurrentSalaryDetail();
    // this.getUserSalaryTemplate();
  }

  ngAfterViewInit() {

  }


  callAllInitialMethod() {
    this.getFirstAndLastDateOfMonth();
    this.getEmployeeBankDetail();
    this.getEmployeeStatutory();
    this.getEmployeeSalaryRevision();
  }

  callInitialMethod() {
    this.getEmployeePayslipResponseByUserUuidMethodCall();
    this.getEmployeePayslipBreakupResponseByUserUuidMethodCall();
    this.getEmployeePayslipDeductionResponseByUserUuidMethodCall();
    this.getPayoutSummary();
  }


  convertNumberToStringFormat(value: number) {
    const formattedValue = value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                            CIRCULAR PROGRESS LINE
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  flipView() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
      card.classList.toggle('is-flipped');
    });
  }


  createCircularPogressLine() {

    const totalLines = 70; // Number of lines
    const radius = 90;
    const center = 100;
    const lineLength = 18;
    const lineWidth = 3;
    const linesGroup = document.getElementById('lines');
    // Clear existing lines
    if (linesGroup) {
      linesGroup.innerHTML = '';
    }
    for (let i = 0; i < totalLines; i++) {
      const angle = (i * 360 / totalLines) * (Math.PI / 180);
      const x1 = center + (radius - lineLength) * Math.cos(angle);
      const y1 = center + (radius - lineLength) * Math.sin(angle);
      const x2 = center + radius * Math.cos(angle);
      const y2 = center + radius * Math.sin(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('stroke-width', lineWidth.toString());
      line.setAttribute('stroke', '#eee');
      line.classList.add('line');
      linesGroup?.appendChild(line);
    }

    const fractionText = document.querySelector('.fraction');
    const progress = this.totalPayoutDays / this.totalStandardDays;
    const activeLines = Math.floor(totalLines * progress);

    const lines = document.querySelectorAll('.line');

    lines.forEach((line, index) => {
      line.setAttribute('stroke', index < activeLines ? '#6b7feb' : '#eee');
    });

    if (fractionText) {
      fractionText.textContent = `${this.totalPayoutDays}/${this.totalStandardDays}`;
    }
  }


  getClass(status: string) {
    // Present, Unmarked, Leave,  WeekOff, Holiday, Halfday, Late
    return {
      present: status === 'Present',
      absent: status === 'Absent',
      leave: status === 'Leave',
      holiday: status === 'Holiday',
      'half-day': status === 'Halfday',
      late: status === 'Late',
      'week-off': status === 'WeekOff',
      'unmarked': status === '-',
    };
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                                   SUMMARY TAB  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  disableMonths = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const userJoiningYear = new Date(
      this._helperService.userJoiningDate
    ).getFullYear();
    const userJoiningMonth = new Date(
      this._helperService.userJoiningDate
    ).getMonth();

    // Disable if the month is before the organization registration month
    if (
      dateYear < userJoiningYear ||
      (dateYear === userJoiningYear &&
        dateMonth < userJoiningMonth)
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

  startDate: string = '';
  endDate: string = '';
  selectedDate: Date = new Date();
  size: 'small' | 'default' | 'large' = 'default';
  //GET START DATE OF MONTH AND END DATE OF MONTH FROM CURRENT DATE
  getFirstAndLastDateOfMonth() {
    this.startDate = this._helperService.formatDateToYYYYMMDD(
      new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1)
    );
    this.endDate = this._helperService.formatDateToYYYYMMDD(
      new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0)
    );
    this.callInitialMethod();
  }


  onMonthChange(): void {
    if (this.selectedDate.getMonth() == new Date(this.startDate).getMonth()) {
      return;
    }
    this.getFirstAndLastDateOfMonth();
  }

  switchFinanceBlur() {
    this.financeBlur = this.financeBlur == true ? false : true;
  }

  employeePayslipResponse: EmployeePayslipResponse = new EmployeePayslipResponse();
  
  getEmployeePayslipResponseByUserUuidMethodCall() {
    this._salaryService.getEmployeePayslipResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      if (response.status) {
        this.employeePayslipResponse = response.object;
        if (this.employeePayslipResponse == null) {
          this.employeePayslipResponse = new EmployeePayslipResponse();
        }
      } else {
        this.employeePayslipResponse = new EmployeePayslipResponse();
      }
    }, (error) => {

    });
  }


  monthlySalary: number = 0;
  earningSalary: number = 0;
  employeePayslipBreakupResponseList: EmployeePayslipBreakupResponse[] = [];
  getEmployeePayslipBreakupResponseByUserUuidMethodCall() {
    this.monthlySalary = 0;
    this.earningSalary = 0;
    this._salaryService.getEmployeePayslipBreakupResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      if (response.status) {
        this.employeePayslipBreakupResponseList = response.object;
        if (this.employeePayslipBreakupResponseList == null) {
          this.employeePayslipBreakupResponseList = [];
        } else {
          this.monthlySalary = this.employeePayslipBreakupResponseList.reduce((total, salary) => total + salary.standardAmount, 0);
          this.earningSalary = this.employeePayslipBreakupResponseList.reduce((total, salary) => total + salary.actualAmount, 0);
        }
      } else {
        this.employeePayslipBreakupResponseList = [];
      }

    }, (error) => {

    })
  }

  salaryDeductionResponse: SalaryDeductionResponse = new SalaryDeductionResponse();
  // employeePayslipDeductionResponse: EmployeePayslipDeductionResponse = new EmployeePayslipDeductionResponse();
  getEmployeePayslipDeductionResponseByUserUuidMethodCall() {
    this._salaryService.getEmployeePayslipDeductionResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      if (response.status) {
        this.salaryDeductionResponse = response.object;
        if (this.salaryDeductionResponse == null) {
          this.salaryDeductionResponse = new SalaryDeductionResponse();
        }
      } else {
        this.salaryDeductionResponse = new SalaryDeductionResponse();
      }
    }, (error) => {

    })
  }


  totalPayoutDays: number = 0;
  totalStandardDays: number = 0;
  totalLopDays: number = 0;
  totalArrearDays: number = 0;
  userPaymentDetail: UserPaymentDetail = new UserPaymentDetail();
  getEmployeeBankDetail() {
    this._salaryService.getEmployeePaymentBankDetail(this.userUuid).subscribe((response) => {
      if (response.status) {
        this.userPaymentDetail = response.object;
        if (this.userPaymentDetail == null) {
          this.userPaymentDetail = new UserPaymentDetail();
        }
      } else {
        this.userPaymentDetail = new UserPaymentDetail();
      }
    }, (error) => {

    })
  }

  isEPF: boolean = false;
  isESI: boolean = false;
  getEmployeeStatutory() {
    this._salaryService.getEmployeeStatutory(this.userUuid).subscribe((response) => {
      if (response.status) {
        this.isEPF = response.object.EPF;
        this.isESI = response.object.ESI;
      }
    }, (error) => {

    })
  }

  payoutDaysSummary: PayoutDaysSummary = new PayoutDaysSummary();
  dateStatuses: any = [];
  getPayoutSummary() {
    this.isLoading = true;
    this._salaryService.getPayoutSummaryDetail(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      if (response.status) {
        this.isLoading = false;
        this.dateStatuses = response.object.dateList;
        this.payoutDaysSummary = response.object.statusCount;
        this.totalStandardDays = response.object.standardDays != null ? response.object.standardDays : 0;
        this.totalPayoutDays = response.object.payoutDays != null ? response.object.payoutDays : 0;
        this.totalLopDays = response.object.lopDays != null ? response.object.lopDays : 0;
        this.totalArrearDays = response.object.arrearDays != null ? response.object.arrearDays : 0;
      }
      this.createCircularPogressLine();
    }, (error) => {
      this.isLoading = false;

    })
  }

  readonly EPF_STATUTORY_ID = 1;
 readonly ESI_STATUTORY_ID = 2;
  epfLoader:boolean=false;
  esiLoader:boolean=false;
  statutoryId:number=0;
  toggleStatutory(statutoryId:number){
      if(this.EPF_STATUTORY_ID == statutoryId){
        this.epfLoader = true;
      }else{
        this.esiLoader= true;
      }
      this._userService.toggleStatutory(this.userUuid, statutoryId).subscribe((response) => {    
          if(response.status){
            if(this.EPF_STATUTORY_ID == statutoryId){
              this.isEPF =  !this.isEPF;
            }else{
              this.isESI =  !this.isESI;
            }
            this._helperService.showToast(response.message,Key.TOAST_STATUS_SUCCESS);
          }else{
            this._helperService.showToast(response.message,Key.TOAST_STATUS_WARNING);
          }   
          this.epfLoader = false;
          this.esiLoader = false;
      },
        (error) => {
          this.epfLoader = false;
          this.esiLoader = false; 
          this._helperService.showToast( 'Error in updating', Key.TOAST_STATUS_ERROR);
        }
      );

    }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                               PAYMENT TAB
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

  currentSalaryDetail: CurrentSalaryDetail = new CurrentSalaryDetail();
  getCurrentSalaryDetail() {
    this._salaryService.getCurrentSalaryDetail(this.userUuid).subscribe((response) => {
      if (response.status) {
        this.currentSalaryDetail = response.object;
        if (this.currentSalaryDetail == null) {
          this.currentSalaryDetail = new CurrentSalaryDetail();
        } else {
          this.callAllInitialMethod();
        }
      } else {
        this.currentSalaryDetail = new CurrentSalaryDetail();
      }
      this.firstTimeLoad = false;
    }, (error) => {

    })
  }

  userSalaryRevisionResList: UserSalaryRevisionRes[] = new Array();
  getEmployeeSalaryRevision() {
    this.userSalaryRevisionResList = [];
    this._salaryService.getEmployeeSalaryRevisionDetail(this.userUuid).subscribe((response) => {
      if (response.status) {
        this.userSalaryRevisionResList = response.object;
      } else {
        this.userSalaryRevisionResList = [];
      }
    }, (error) => {

    })
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                               PAYSLIP TAB
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  disableYears = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const userJoiningYear = new Date(this._helperService.userJoiningDate).getFullYear();
    const dateYear = date.getFullYear();

    // Disable if the year is outside the range of user joining year and current year
    return dateYear < userJoiningYear || dateYear > currentYear;
  };

  selectedYear: Date = new Date();
  startYear: string = '';
  onYearChange(year: any) {
    // console.log("======year=======",year.getFullYear() )
    if (year.getFullYear() === this.startYear) {
      return; // Do nothing if the year hasn't changed
    }
    this.selectedYear = year;
    this.startYear = year.getFullYear();
    this.getEmployeePayslipLog();
  }

  selectedIndex: number = -1;
  selectedPayslip!: EmployeePayslipLogResponse;
  employeePayslipLogResponseList: EmployeePayslipLogResponse[] = [];
  getEmployeePayslipLog() {
    this._salaryService.getEmployeePayslipLogByUserUuid(this.userUuid, this.startYear).subscribe((response) => {
      if (response.status) {
        this.employeePayslipLogResponseList = response.object;
        if (this.employeePayslipLogResponseList == null) {
          this.employeePayslipLogResponseList = [];
        } else {
          if (this.employeePayslipLogResponseList.length > 0) {
            this.selectedIndex = 0;
            this.loadPayslip(this.employeePayslipLogResponseList[0]);
          }
        }
      } else {
        this.employeePayslipLogResponseList = [];
      }
    }, (error) => {

    })
  }


  // Call this method when you have the URL
  loadPayslip(selectedPayslip: EmployeePayslipLogResponse) {
    this.selectedPayslip = selectedPayslip;
    this.selectedPayslipUrl = this.sanitizer.bypassSecurityTrustResourceUrl(selectedPayslip.paySlipUrl);
  }


  // downloadPaySlip(url: string, name: string){
  //   this._helperService.downloadPdf(url, name);
  // }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                // SALARY TEMPLATE 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// userSalaryTemplate: SalaryTemplateComponentResponse = new SalaryTemplateComponentResponse();
// getUserSalaryTemplate() {
//   this._salaryService.getUserSalaryTemplate(this.userUuid).subscribe((response) => {
//       if(response.status){
//         this.userSalaryTemplate = response.object;
//         console.log("template==================",this.userSalaryTemplate)
//       }
//     },
//     (error) => {

//     });
// }

// editBasicComponentField:boolean=false;
@ViewChild('salaryTemplateButton')salaryTemplateButton!:ElementRef;
@ViewChild('salaryTemplateCloseButton')salaryTemplateCloseButton!:ElementRef;
openSalaryTemplate(){
  this.getCustomSalaryTemplate();
  // this.editBasicComponentField = false;
  // this.basicAmountFieldTouch = false;
  // this.salaryComponentList = JSON.parse(JSON.stringify(this.userSalaryTemplate.salaryComponentResponseList));
  // this.calculateSalaryComponentFirstTime();
  this.salaryTemplateButton.nativeElement.click();
}


// monthlyCTC: number = 0;
// calculateSalaryComponentFirstTime(){
//   this.monthlyCTC = Math.round(this.currentSalaryDetail.annualCTC / 12);
//   this.salaryComponentList.forEach((component) => {
//     let amount = 0;
//       if (component.id === 2) {
//         // HRA is based on Basic Salary
//         const basicComponent = this.salaryComponentList.find((c) => c.id === 1);
//         amount = basicComponent ? (basicComponent.amount * component.value) / 100 : 0;
//       } else {
//         // Remaining components are based on total salary
//         amount = (this.monthlyCTC * component.value) / 100;
//       }
//       component.amount =Math.round(amount * 100.0)/ 100.0; 
//   });
//   this.computedSalaryList = JSON.parse(JSON.stringify(this.salaryComponentList));
// }

// editComponent(){
//   this.editBasicComponentField = this.editBasicComponentField ? false: true;
//   if(!this.editBasicComponentField){
//     this.basicAmountFieldTouch = false;
//     this.basicAmount  =  0;
//     this.salaryComponentList = JSON.parse(JSON.stringify(this.userSalaryTemplate.salaryComponentResponseList));
//     this.calculateSalaryComponentFirstTime();
//   }else{
//     const basicComponent = this.salaryComponentList.find((c) => c.id === 1);
//     if(basicComponent){
//       this.basicAmount  = basicComponent.amount;
//       basicComponent.isFixed=1;
//     }
//   }
// }

// basicAmountFieldTouch:boolean=false;
// basicAmount:number=0;
// computedSalaryList:SalaryComponentResponse[] = new Array();
// salaryComponentList: SalaryComponentResponse[] = new Array();
// calculateSalaryComponents(): void {
//   if(this.basicAmount > this.monthlyCTC){
//     return;
//   }
//     let remainingSalary = this.monthlyCTC;
//     let totalAmount=0;
//     this.computedSalaryList = [];
//     this.salaryComponentList.forEach((component) => {

//       var computedComponent : SalaryComponentResponse = new SalaryComponentResponse();
//       computedComponent = JSON.parse(JSON.stringify(component));
//         let amount = 0;
//         let percentage =0;
//         // Determine the calculation based on isFixed
//         if (component.isFixed === 1) {
//           amount = this.basicAmount;
//           percentage = (amount/ this.monthlyCTC) * 100;
//         } else if (component.isFixed === 0) {
//             // Percentage-based value
//             if (component.id === 2) {
//                 // HRA is based on Basic Salary
//                 const basicComponent = this.salaryComponentList.find((c) => c.id === 1);
//                 amount = basicComponent ? (basicComponent.amount * component.value) / 100 : 0;
//             } else {
//                 // Remaining components are based on total salary
//                 amount = (this.monthlyCTC * component.value) / 100;
//             }
//             percentage = component.value;
//         }

//         amount= Math.round(amount * 100.0)/ 100.0; 
//         percentage = Math.round(percentage * 100.0)/ 100.0; 

//         totalAmount +=amount;

//         if(remainingSalary>=1){

//           if(totalAmount>this.monthlyCTC){
//             percentage = Math.round(((remainingSalary/ this.monthlyCTC)* 100)* 100.0)/100.0;
//             amount = Math.round(remainingSalary* 100.0)/100.0;
//           }
//           // Deduct the calculated amount from the remaining salary
//           remainingSalary -= amount;

//           console.log("========name======",component.name,"=======percentage=======",percentage,"=======amount======",amount,"===========" );
//           computedComponent.value = percentage ;
//           computedComponent.amount = amount;

//           this.computedSalaryList.push(computedComponent);

//         }

//     });

//     if(remainingSalary>=1){
//         let component = new SalaryComponentResponse();
//         component.id = 17;
//         component.name = 'Other Allowance'
//         component.isFixed = 0;
//         component.value = Math.round(((remainingSalary/ this.monthlyCTC)* 100)* 100.0)/100.0;
//         component.amount = Math.round(remainingSalary* 100.0)/100.0;
//         this.computedSalaryList.push(component);
//     }
//     console.log("=== this.salaryComponentList.====", this.salaryComponentList);
//     console.log("=== this.computedSalaryList.====", this.computedSalaryList);
//   }


readonly BASIC_PAY_ID = Key.BASIC_PAY_ID;
readonly HRA_ID = Key.HRA_ID;
formatterPercent = (value: number): string => `${value} %`;
parserPercent = (value: string): string => value.replace(' %', '');
//  salaryComponentList1: SalaryComponent[] = new Array();
 userSalaryTemplate1 : UserSalaryTemplateComponent = new UserSalaryTemplateComponent();
 userSalaryTemplate2 : UserSalaryTemplateComponent = new UserSalaryTemplateComponent();
  // salaryComponentResponseList : SalaryComponentResponse[] = new Array();
  // taxExemptionValueList : TaxExemptionValueRes [] = new Array();
  templateLoader:boolean=false;
  getCustomSalaryTemplate() {
    this.templateLoader = true;
    this._salaryService.getCustomSalaryTemplate(this.userUuid).subscribe((response) => {
      if(response.status){
        this.userSalaryTemplate1 = response.object;
        if(this.userSalaryTemplate1!=null){
          this.userSalaryTemplate2 = JSON.parse(JSON.stringify(this.userSalaryTemplate1 ));
        }else{
          this.userSalaryTemplate1 = new UserSalaryTemplateComponent();
        }

      }
      this.templateLoader = false;
      },(error) => {
        this.templateLoader = false;
      }
    );
  }

saveLoader:boolean=false;
saveCustomSalaryTemplate() {
  this.saveLoader = true;
  this._salaryService.saveCustomSalaryTemplate(this.userUuid,  this.userSalaryTemplate2).subscribe((response) => {
    if (response.status) {
      this.getEmployeeSalaryRevision();
      this.salaryTemplateCloseButton.nativeElement.click();
       this._helperService.showToast(response.message,Key.TOAST_STATUS_SUCCESS);
    } else {
       this._helperService.showToast(response.message,Key.TOAST_STATUS_WARNING);
    }
    this.saveLoader = false;
  }, (error) => {
    this._helperService.showToast(error.message,Key.TOAST_STATUS_ERROR);
    this.saveLoader = false;
  })
}

@ViewChild('appraisalButton')appraisalButton!:ElementRef;
@ViewChild('appraisalCloseButton')appraisalCloseButton!:ElementRef;
appraisal:AppraisalRequest = new AppraisalRequest();
openAppraisal(){
  this.appraisal = new AppraisalRequest();
  this.appraisal.userUuid = this.userUuid;
  this.appraisal.previousCtc =this.currentSalaryDetail.annualCTC;
  this.appraisalButton.nativeElement.click();
}

changePositionToggle(appraisal:AppraisalRequest){
  appraisal.checked = appraisal.checked? false: true;
  appraisal.position ='';
}

readonly constant = constant;
positionFilteredOptions: string[] = [];
onChange(value: any): void {

  this.positionFilteredOptions = constant.jobTitles.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase())
  );

}


saveAppraisal() {
  this.saveLoader = true;
  this._dataService.saveAppraisalRequest(this.appraisal).subscribe((response) => {
      this._helperService.showToast("Appraisal processed successfully", Key.TOAST_STATUS_SUCCESS);
      this.appraisalCloseButton.nativeElement.click();
      this.saveLoader = false;
    },
    (error) => {
      this._helperService.showToast("Error submitting appraisal request!", Key.TOAST_STATUS_ERROR);
      this.saveLoader = false;

    }
  );
}

@ViewChild('bonusButton')bonusButton!:ElementRef;
@ViewChild('bonusCloseButton')bonusCloseButton!:ElementRef;
@ViewChild('bonusForm')bonusForm!:NgForm;
bonusRequest: BonusRequest = new BonusRequest(); 
openBonus(){
  this.bonusRequest = new BonusRequest();
  this.bonusRequest.userUuid = this.userUuid;
  this.bonusForm.form.markAsUntouched();
  this.bonusForm.form.markAsPristine();
  this.bonusButton.nativeElement.click();
}


saveBonus() {
  this.saveLoader = true;
  this._salaryService.registerBonus(this.bonusRequest).subscribe((response) => {
      if(response.status){
        this._helperService.showToast("Bonus added successfully", Key.TOAST_STATUS_SUCCESS);
        this.bonusCloseButton.nativeElement.click();
      }else{
        this._helperService.showToast("Error submitting bonus request", Key.TOAST_STATUS_ERROR);
      }
      this.saveLoader = false;
    },
    (error) => {
      this.saveLoader = false;
    }
  );
}






}
