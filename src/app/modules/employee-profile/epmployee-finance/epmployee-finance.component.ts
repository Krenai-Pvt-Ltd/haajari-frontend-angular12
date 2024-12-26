import { Component, OnInit, AfterViewInit } from '@angular/core';
import { EmployeePayslipLogResponse } from 'src/app/employee-payslip-log-response';
import { EmployeePayslipBreakupResponse } from 'src/app/models/employee-payslip-breakup-response';
import { EmployeePayslipDeductionResponse } from 'src/app/models/employee-payslip-deduction-response';
import { EmployeePayslipResponse } from 'src/app/models/employee-payslip-response';
import { PayoutDaysSummary } from 'src/app/models/payoutDaysSummary';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryService } from 'src/app/services/salary.service';

@Component({
  selector: 'app-epmployee-finance',
  templateUrl: './epmployee-finance.component.html',
  styleUrls: ['./epmployee-finance.component.css']
})
export class EpmployeeFinanceComponent implements OnInit, AfterViewInit {


  userUuid : string ='';
  financeBlur: boolean = true;

  constructor(private _dataService : DataService,
      private _helperService : HelperService,
      private _salaryService : SalaryService
  ) { 

    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userUuid = userUuidParam?.toString() ?? ''
  }


  ngOnInit(): void {

    let currentDate = new Date();
    this.startDate = this._helperService.formatDateToYYYYMMDD(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    );
    this.endDate = this._helperService.formatDateToYYYYMMDD(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    );

    this.getEmployeePayslipResponseByUserUuidMethodCall();
    this.getEmployeePayslipBreakupResponseByUserUuidMethodCall();
    this.getEmployeePayslipDeductionResponseByUserUuidMethodCall();
    this.getEmployeePayslipLogResponseByUserUuidMethodCall();
    this.getPayoutSummary();
  }

  ngAfterViewInit(): void {

    const cards = document.querySelectorAll('.card');

    // Add event listener to flip the card on click
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        card.classList.toggle('is-flipped');
      });
    });
   
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                            CIRCULAR PROGRESS LINE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  totalLines = 70; // Number of lines
  radius = 90;
  center = 100;
  lineLength = 18;
  lineWidth = 3;
  createCircularPogressLine(){
    const linesGroup = document.getElementById('lines');
    for (let i = 0; i < this.totalLines; i++) {
      const angle = (i * 360 / this.totalLines) * (Math.PI / 180);
      const x1 = this.center + (this.radius - this.lineLength) * Math.cos(angle);
      const y1 = this.center + (this.radius - this.lineLength) * Math.sin(angle);
      const x2 = this.center + this.radius * Math.cos(angle);
      const y2 = this.center + this.radius * Math.sin(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('stroke-width', this.lineWidth.toString());
      line.setAttribute('stroke', '#eee');
      line.classList.add('line');
      linesGroup?.appendChild(line);
    }
    this.setProgress();
  }

  setProgress() {
    const fractionText = document.querySelector('.fraction');
    const progress = this.totalPayoutDays / this.totalStandardDays;
    const activeLines = Math.floor(this.totalLines * progress);

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  startDate:string='';
  endDate:string ='';
  //GET START DATE OF MONTH AND END DATE OF MONTH FROM CURRENT DATE
  getFirstAndLastDateOfMonth() {
    let currentDate = new Date();
    this.startDate = this._helperService.formatDateToYYYYMMDD(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    );
    this.endDate = this._helperService.formatDateToYYYYMMDD(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    );
  }

  switchFinanceBlur() {
    this.financeBlur = this.financeBlur == true ? false : true;
  }


  isShimmerForEmployeePayslipResponse = false;
  dataNotFoundPlaceholderForEmployeePayslipResponse = false;
  networkConnectionErrorPlaceHolderForEmployeePayslipResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipResponseMethodCall() {
    this.isShimmerForEmployeePayslipResponse = true;
    this.dataNotFoundPlaceholderForEmployeePayslipResponse = false;
    this.networkConnectionErrorPlaceHolderForEmployeePayslipResponse = false;
  }

  isShimmerForEmployeePayslipBreakupResponse = false;
  dataNotFoundPlaceholderForEmployeePayslipBreakupResponse = false;
  networkConnectionErrorPlaceHolderForEmployeePayslipBreakupResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipBreakupResponseMethodCall() {
    this.isShimmerForEmployeePayslipBreakupResponse = true;
    this.dataNotFoundPlaceholderForEmployeePayslipBreakupResponse = false;
    this.networkConnectionErrorPlaceHolderForEmployeePayslipBreakupResponse = false;
  }

  isShimmerForEmployeePayslipDeductionResponse = false;
  dataNotFoundPlaceholderForEmployeePayslipDeductionResponse = false;
  networkConnectionErrorPlaceHolderForEmployeePayslipDeductionResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipDeductionResponseMethodCall() {
    this.isShimmerForEmployeePayslipDeductionResponse = true;
    this.dataNotFoundPlaceholderForEmployeePayslipDeductionResponse = false;
    this.networkConnectionErrorPlaceHolderForEmployeePayslipDeductionResponse = false;
  }

  isShimmerForEmployeePayslipLogResponse = false;
  dataNotFoundPlaceholderForEmployeePayslipLogResponse = false;
  networkConnectionErrorPlaceHolderForEmployeePayslipLogResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipLogResponseMethodCall() {
    this.isShimmerForEmployeePayslipLogResponse = true;
    this.dataNotFoundPlaceholderForEmployeePayslipLogResponse = false;
    this.networkConnectionErrorPlaceHolderForEmployeePayslipLogResponse = false;
  }

  employeePayslipResponse : EmployeePayslipResponse = new EmployeePayslipResponse();
  getEmployeePayslipResponseByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipResponseMethodCall();
    this._salaryService.getEmployeePayslipResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      if(this._helperService.isObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForEmployeePayslipResponse = true;
        this.employeePayslipResponse = new EmployeePayslipResponse();
        // this.payrollChartDataNotFoundMehthodCall();
      } else{
        this.employeePayslipResponse = response.object;
        // this.payrollChartMehthodCall();
      }
      this.isShimmerForEmployeePayslipResponse = false;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForEmployeePayslipResponse = true;
      this.isShimmerForEmployeePayslipResponse = false;
    })
  }


  monthlySalary:number=0;
  earningSalary:number=0;
  employeePayslipBreakupResponseList : EmployeePayslipBreakupResponse[] = [];
  getEmployeePayslipBreakupResponseByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipBreakupResponseMethodCall();
    this._salaryService.getEmployeePayslipBreakupResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      if(this._helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForEmployeePayslipBreakupResponse = true;
        this.employeePayslipBreakupResponseList = [];
      } else{
        this.employeePayslipBreakupResponseList = response.listOfObject;
        this.monthlySalary =0;
        this.earningSalary = 0;
        this.employeePayslipBreakupResponseList.forEach((salary)=>{
          this.monthlySalary = this.monthlySalary + salary.standardAmount;
          this.earningSalary = this.earningSalary + salary.actualAmount;
        });

      }

      this.isShimmerForEmployeePayslipBreakupResponse = true;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForEmployeePayslipBreakupResponse = true;
      this.isShimmerForEmployeePayslipBreakupResponse = true;
    })
  }

  employeePayslipDeductionResponse : EmployeePayslipDeductionResponse = new EmployeePayslipDeductionResponse();
  getEmployeePayslipDeductionResponseByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipDeductionResponseMethodCall();
    this._salaryService.getEmployeePayslipDeductionResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      if(this._helperService.isObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForEmployeePayslipDeductionResponse = true;
      } else{
        this.employeePayslipDeductionResponse = response.object;
      }

      this.isShimmerForEmployeePayslipDeductionResponse = true;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForEmployeePayslipDeductionResponse = true;
      this.isShimmerForEmployeePayslipDeductionResponse = true;
    })
  }

  employeePayslipLogResponseList : EmployeePayslipLogResponse[] = [];
  getEmployeePayslipLogResponseByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipLogResponseMethodCall();
    this._salaryService.getEmployeePayslipLogResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      if(this._helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForEmployeePayslipLogResponse = true;
      } else{
        this.employeePayslipLogResponseList = response.listOfObject;
  

      }
      this.isShimmerForEmployeePayslipLogResponse = false;
    }, (error) => {
      this.isShimmerForEmployeePayslipLogResponse = false;
      this.networkConnectionErrorPlaceHolderForEmployeePayslipLogResponse = true;
    })
  }

  downloadPaySlip(url: string, name: string){
    this._helperService.downloadPdf(url, name);
  }


 


  totalPayoutDays:number=0;
  totalStandardDays:number= 0;
  totalLopDays:number=0;
  totalArrearDays:number=0;
  getEmployeeBankDetail(){
    this._salaryService.getEmployeePaymentBankDetail(this.userUuid).subscribe((response) => {
      if(this._helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForEmployeePayslipLogResponse = true;
      } else{
        this.employeePayslipLogResponseList = response.listOfObject;
  

      }
      this.isShimmerForEmployeePayslipLogResponse = false;
    }, (error) => {
      this.isShimmerForEmployeePayslipLogResponse = false;
      this.networkConnectionErrorPlaceHolderForEmployeePayslipLogResponse = true;
    })
  }

  payoutDaysSummary : PayoutDaysSummary = new PayoutDaysSummary();
  dateStatuses:any;
  getPayoutSummary(){
    this._salaryService.getPayoutSummaryDetail(this.userUuid,this.startDate, this.endDate).subscribe((response) => {
      if(response.status){
        this.payoutDaysSummary = response.object.statusCount;
        this.dateStatuses = response.object.dateList;
        this.totalStandardDays = response.object.standardDays;
        this.totalPayoutDays = response.object.payoutDays;
        this.totalLopDays = response.object.lopDays;
        this.totalArrearDays = response.object.arrearDays;
        this.createCircularPogressLine();
      } 
    }, (error) => {
      
    })
  }

}


