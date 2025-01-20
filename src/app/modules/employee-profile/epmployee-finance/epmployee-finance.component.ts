import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { EmployeePayslipLogResponse } from 'src/app/employee-payslip-log-response';
import { EmployeePayslipBreakupResponse } from 'src/app/models/employee-payslip-breakup-response';
import { EmployeePayslipDeductionResponse } from 'src/app/models/employee-payslip-deduction-response';
import { EmployeePayslipResponse } from 'src/app/models/employee-payslip-response';
import { PayoutDaysSummary } from 'src/app/models/payoutDaysSummary';
import { UserPaymentDetail } from 'src/app/models/UserPaymentDetail';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryService } from 'src/app/services/salary.service';
import { EmployeeProfileComponent } from '../employee-profile.component';
import { UserSalaryRevisionRes } from 'src/app/models/UserSalaryRevisionRes';
import { CurrentSalaryDetail } from 'src/app/models/CurrentSalaryDetail';

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
    public employeeProfileComponent: EmployeeProfileComponent
  ) {

    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userUuid = userUuidParam?.toString() ?? ''
  }


  ngOnInit(): void {
    this.getCurrentSalaryDetail();


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

  employeePayslipDeductionResponse: EmployeePayslipDeductionResponse = new EmployeePayslipDeductionResponse();
  getEmployeePayslipDeductionResponseByUserUuidMethodCall() {
    this._salaryService.getEmployeePayslipDeductionResponseByUserUuid(this.userUuid, this.startDate, this.endDate).subscribe((response) => {
      if (response.status) {
        this.employeePayslipDeductionResponse = response.object;
        if (this.employeePayslipDeductionResponse == null) {
          this.employeePayslipDeductionResponse = new EmployeePayslipDeductionResponse();
        }
      } else {
        this.employeePayslipDeductionResponse = new EmployeePayslipDeductionResponse();
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





}


