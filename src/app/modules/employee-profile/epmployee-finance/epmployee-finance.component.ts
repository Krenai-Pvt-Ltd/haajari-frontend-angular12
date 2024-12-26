import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EmployeePayslipLogResponse } from 'src/app/employee-payslip-log-response';
import { EmployeePayslipBreakupResponse } from 'src/app/models/employee-payslip-breakup-response';
import { EmployeePayslipDeductionResponse } from 'src/app/models/employee-payslip-deduction-response';
import { EmployeePayslipResponse } from 'src/app/models/employee-payslip-response';
import { PayoutDaysSummary } from 'src/app/models/payoutDaysSummary';
import { UserPaymentDetail } from 'src/app/models/UserPaymentDetail';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryService } from 'src/app/services/salary.service';

@Component({
  selector: 'app-epmployee-finance',
  templateUrl: './epmployee-finance.component.html',
  styleUrls: ['./epmployee-finance.component.css']
})
export class EpmployeeFinanceComponent implements OnInit, AfterViewInit {

  selectedPayslipUrl!: SafeResourceUrl;
  userUuid : string ='';
  financeBlur: boolean = true;

  constructor(private _dataService : DataService,
      public _helperService : HelperService,
      private _salaryService : SalaryService,
      private sanitizer: DomSanitizer
  ) { 

    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userUuid = userUuidParam?.toString() ?? ''
  }


  ngOnInit(): void {
    this.getFirstAndLastDateOfMonth();
    this.getEmployeeBankDetail();
    this.getEmployeeStatutory();
  }


  callInitialMethod(){
    this.getEmployeePayslipResponseByUserUuidMethodCall();
    this.getEmployeePayslipBreakupResponseByUserUuidMethodCall();
    this.getEmployeePayslipDeductionResponseByUserUuidMethodCall();
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
     // Clear existing lines
    if (linesGroup) {
      linesGroup.innerHTML = '';
    }
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
      console.log('fractionText: ',fractionText)
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
  selectedDate:Date = new Date();
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
    if(this.selectedDate.getMonth() == new Date(this.startDate).getMonth()){
      return;
    }
    this.getFirstAndLastDateOfMonth();
  }

  switchFinanceBlur() {
    this.financeBlur = this.financeBlur == true ? false : true;
  }


  employeePayslipResponse : EmployeePayslipResponse = new EmployeePayslipResponse();
  getEmployeePayslipResponseByUserUuidMethodCall(){
    this._salaryService.getEmployeePayslipResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      
      if(response.object==null ){
        this.employeePayslipResponse = new EmployeePayslipResponse();
      }else{
        this.employeePayslipResponse = response.object;
      }
    }, (error) => {
     
    });
  }


  monthlySalary:number=0;
  earningSalary:number=0;
  employeePayslipBreakupResponseList : EmployeePayslipBreakupResponse[] = [];
  getEmployeePayslipBreakupResponseByUserUuidMethodCall(){
    this.monthlySalary =0;
    this.earningSalary = 0;
    this._salaryService.getEmployeePayslipBreakupResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {

      if(response.listOfObject==null || response.listOfObject.length ==0){
        this.employeePayslipBreakupResponseList = [];
      }else{
        this.employeePayslipBreakupResponseList = response.listOfObject;  
        this.employeePayslipBreakupResponseList.forEach((salary)=>{
          this.monthlySalary = this.monthlySalary + salary.standardAmount;
          this.earningSalary = this.earningSalary + salary.actualAmount;
        });
      }
    }, (error) => {
    
    })
  }

  employeePayslipDeductionResponse : EmployeePayslipDeductionResponse = new EmployeePayslipDeductionResponse();
  getEmployeePayslipDeductionResponseByUserUuidMethodCall(){
    this._salaryService.getEmployeePayslipDeductionResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {

        this.employeePayslipDeductionResponse = response.object;
        if( this.employeePayslipDeductionResponse == null){
          this.employeePayslipDeductionResponse = new EmployeePayslipDeductionResponse();
        }
    
    }, (error) => {

    })
  }


  downloadPaySlip(url: string, name: string){
    this._helperService.downloadPdf(url, name);
  }


  totalPayoutDays:number=0;
  totalStandardDays:number= 0;
  totalLopDays:number=0;
  totalArrearDays:number=0;
  userPaymentDetail : UserPaymentDetail = new UserPaymentDetail();
  getEmployeeBankDetail(){
    this._salaryService.getEmployeePaymentBankDetail(this.userUuid).subscribe((response) => {
      if(response.status){
        this.userPaymentDetail = response.object;
        if( this.userPaymentDetail == null){
          this.userPaymentDetail = new UserPaymentDetail();
        }
      }else{
        this.userPaymentDetail = new UserPaymentDetail();
      }
    }, (error) => {
      
    })
  }

  isEPF:boolean=false;
  isESI:boolean=false;
  getEmployeeStatutory(){
    this._salaryService.getEmployeeStatutory(this.userUuid).subscribe((response) => {
      if(response.status){
        this.isEPF = response.object.EPF;
        this.isESI = response.object.ESI;
      }
    }, (error) => {
      
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



  selectedIndex:number=-1;
  selectedPayslip!: EmployeePayslipLogResponse;
  employeePayslipLogResponseList : EmployeePayslipLogResponse[] = [];
  getEmployeePayslipLog(){
    this._salaryService.getEmployeePayslipLogResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
     
        this.employeePayslipLogResponseList = response.listOfObject;
        if(this.employeePayslipLogResponseList.length > 0){
          this.selectedIndex = 0;
          this.loadPayslip( this.employeePayslipLogResponseList[0]);
        }
    }, (error) => {
      
    })
  }


  // Call this method when you have the URL
  loadPayslip(selectedPayslip: EmployeePayslipLogResponse) {
    this.selectedPayslip = selectedPayslip;
    this.selectedPayslipUrl = this.sanitizer.bypassSecurityTrustResourceUrl(selectedPayslip.paySlipUrl);
  }

}


