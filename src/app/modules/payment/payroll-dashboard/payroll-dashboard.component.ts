import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Key } from 'src/app/constant/key';
import { MonthResponse } from 'src/app/models/month-response';
import { OrganizationMonthWiseSalaryData } from 'src/app/models/organization-month-wise-salary-data';
import { PayrollDashboardEmployeeCountResponse } from 'src/app/models/payroll-dashboard-employee-count-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';

@Component({
  selector: 'app-payroll-dashboard',
  templateUrl: './payroll-dashboard.component.html',
  styleUrls: ['./payroll-dashboard.component.css'],
})
export class PayrollDashboardComponent implements OnInit {


  payrollToggleView:boolean=false;
  showLeaveComponent:boolean=false;
  showEmployeeComponent:boolean=false;
  showSalaryComponent:boolean=false;
  showEariningComponent:boolean=false;


  // Tab estate
  CURRENT_TAB : number = Key.NEW_JOINEE;

  CURRENT_TAB_IN_EMPLOYEE_CHANGE = Key.NEW_JOINEE;
  readonly NEW_JOINEE = Key.NEW_JOINEE;
  readonly USER_EXIT = Key.USER_EXIT;
  readonly FINAL_SETTLEMENT = Key.FINAL_SETTLEMENT;

  CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = Key.LEAVES;
  readonly LEAVES = Key.LEAVES;
  readonly LOP_SUMMARY = Key.LOP_SUMMARY;
  readonly LOP_REVERSAL = Key.LOP_REVERSAL;

  CURRENT_TAB_IN_SALARY_CHANGE = Key.SALARY_CHANGE;
  readonly SALARY_CHANGE = Key.SALARY_CHANGE;
  readonly BONUS = Key.BONUS;
  readonly OVERTIME = Key.OVERTIME;

  CURRENT_TAB_IN_EPF_ESI_TDS = Key.EPF;
  readonly EPF = Key.EPF;
  readonly ESI = Key.ESI;
  readonly TDS = Key.TDS;

  readonly PAYROLL_STEP_COMPLETED = Key.PAYROLL_STEP_COMPLETED;
  readonly PAYROLL_HISTORY = Key.PAYROLL_HISTORY;



  // ------------------------------

  goToSection(STEP:number){
    switch(STEP){
      case this.CURRENT_TAB_IN_EMPLOYEE_CHANGE:
        this.showEmployeeComponent = true;
        break;
      case this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE:
        this.showLeaveComponent = true;
        break;
      case this.CURRENT_TAB_IN_SALARY_CHANGE:
        this.showEariningComponent = true;
        break;
      case this.CURRENT_TAB_IN_EPF_ESI_TDS:
        this.showSalaryComponent = true;
        break;  
      }
      this.payrollToggleView = true;
  }
  
  calendarShimmer :boolean =false;

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholders() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }



  startDate: string = '';
  endDate: string = '';

  constructor(
    private dataService: DataService,
    private _helperService: HelperService,
    private _payrollService : PayrollService,
  
  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getFirstAndLastDateOfMonth(); 
    this.getMonthResponseListByYearMethodCall(this.selectedDate); 
    this.callPayrollDashboardMethod();
    this.getUserSalaryTemplateNotConfig();
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                              DASHBOARD SECTION  START                                                              // 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


  ///COMMON METHOD 
  callPayrollDashboardMethod(){
    this.countPayrollDashboardEmployeeByOrganizationIdMethodCall();
    this.getOrganizationIndividualMonthSalaryDataMethodCall(); 
    this.getOrganizationPreviousMonthSalaryDataMethodCall(); 
    this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
  }


  // Getting month list
  monthResponseList: MonthResponse[] = [];
  currentIndex: number = 0;
  @ViewChild('monthListContainer', { static: false }) monthListContainer!: ElementRef;

  async getMonthResponseListByYearMethodCall(date: Date) {
    return new Promise((resolve, reject) => {
      this.calendarShimmer = true;
      this.monthResponseList = [];
      this._payrollService.getMonthResponseListByYear(this._helperService.formatDateToYYYYMMDD(date)).subscribe(
        (response) => {
          if (response.status) {
            this.monthResponseList = response.object;
          }
          this.calendarShimmer = false;
          resolve(true);
        },
        (error) => {
          this.calendarShimmer = false;
          resolve(true);
        }
      );
    });
  }

  moveLeft() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.scrollToCurrentIndex();
    }
  }

  moveRight() {
    if (this.currentIndex < this.monthResponseList.length - 1) {
      this.currentIndex++;
      this.scrollToCurrentIndex();
    }
  }

  get isLeftDisabled(): boolean {
    return this.currentIndex === 0;
  }

  get isRightDisabled(): boolean {
    return this.currentIndex >= this.monthResponseList.length - 1;
  }

  scrollToCurrentIndex() {
    if (this.monthListContainer) {
      const element = this.monthListContainer.nativeElement;
      const selectedChild = element.children[this.currentIndex];
      if (selectedChild) {
        element.scrollTo({ left: selectedChild.offsetLeft, behavior: 'smooth' });
      }
    }
  }
  


  selectMonth(monthResponse:MonthResponse){
    this.startDate = monthResponse.firstDate;
    this.endDate = monthResponse.lastDate;
    this.callPayrollDashboardMethod();
    this.getPayrollLogs(); 
  }


  
  
  // Year calendar
  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();


  async onYearChange(year: any) {
    if(this.selectedDate.getFullYear() == new Date(this.startDate).getFullYear()){
      return; // Do nothing if the year hasn't changed
    }
    this.selectedDate = year;
    await this.getMonthResponseListByYearMethodCall(this.selectedDate);

    let enabledMonthResponse;

    // Check if the selected year is the current year
    const currentYear = new Date().getFullYear();
    const selectedYear = year.getFullYear();

    if (selectedYear === currentYear) {
      // It's the current year, find the last monthResponse with disable as false
      for (let i = this.monthResponseList.length - 1; i >= 0; i--) {
        if (!this.monthResponseList[i].disable) {
          enabledMonthResponse = this.monthResponseList[i];
          break;
        }
      }
    } else {
      enabledMonthResponse = this.monthResponseList.find(
        (monthResponse) => !monthResponse.disable
      );
    }

    if (enabledMonthResponse) {
      this.startDate = enabledMonthResponse.firstDate;
      this.endDate = enabledMonthResponse.lastDate;
      this.callPayrollDashboardMethod();
    }else{
      this.resetDashboardData();
    }
  }

  disableYears = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const dateYear = date.getFullYear();
    const organizationRegistrationYear = new Date(this._helperService.organizationRegistrationDate).getFullYear();
    // Disable if the year is before the organization registration year or if the year is after the organization registration year.
    if (dateYear < organizationRegistrationYear || dateYear > currentYear) {
      return true;
    }
    return false;
  };



  //Fetching the employees count with new joinee count and user exit count
  payrollDashboardEmployeeCountResponse: PayrollDashboardEmployeeCountResponse = new PayrollDashboardEmployeeCountResponse();
  countPayrollDashboardEmployeeByOrganizationIdMethodCall() {
    this._payrollService.countPayrollDashboard(this.startDate,this.endDate).subscribe( (response) => {
          this.payrollDashboardEmployeeCountResponse = response.object;
          if(this.payrollDashboardEmployeeCountResponse == null){
            this.payrollDashboardEmployeeCountResponse = new PayrollDashboardEmployeeCountResponse();
          }
        },
        (error) => {

        }
      );
  }


  // Fetching organization individual month salary data.
  organizationMonthWiseSalaryData: OrganizationMonthWiseSalaryData = new OrganizationMonthWiseSalaryData();
  getOrganizationIndividualMonthSalaryDataMethodCall() {
    this._payrollService.getIndividualMonthSalary(this.startDate,this.endDate).subscribe((response) => {

        if(response.object!=null){
          this.organizationMonthWiseSalaryData = response.object;
          
          this.organizationMonthWiseSalaryData.employeeEpf = this.organizationMonthWiseSalaryData.employeeEpf == null ? 0 : this.organizationMonthWiseSalaryData.employeeEpf;
          this.organizationMonthWiseSalaryData.employeeEsi = this.organizationMonthWiseSalaryData.employeeEsi == null ? 0 : this.organizationMonthWiseSalaryData.employeeEsi;
          this.organizationMonthWiseSalaryData.employerEpf = this.organizationMonthWiseSalaryData.employerEpf == null ? 0 : this.organizationMonthWiseSalaryData.employerEpf;
          this.organizationMonthWiseSalaryData.employerEsi = this.organizationMonthWiseSalaryData.employerEsi == null ? 0 : this.organizationMonthWiseSalaryData.employerEsi;
          this.organizationMonthWiseSalaryData.tdsAmount = this.organizationMonthWiseSalaryData.tdsAmount == null ? 0 : this.organizationMonthWiseSalaryData.tdsAmount;
          this.organizationMonthWiseSalaryData.grossPay = this.organizationMonthWiseSalaryData.grossPay == null ? 0 : this.organizationMonthWiseSalaryData.grossPay;
          this.organizationMonthWiseSalaryData.netPay = this.organizationMonthWiseSalaryData.netPay == null ? 0 : this.organizationMonthWiseSalaryData.netPay;
          this.payrollChartMehthodCall();
          if( this.organizationMonthWiseSalaryData.grossPay == 0){
            this.resetPayrollChartData();
            this.dataNotFoundPlaceholder = true;
          }
        }else{
          this.dataNotFoundPlaceholder = true;
        }
          this.isShimmer = false;
      },(error) => {
          this.isShimmer = false;
          this.networkConnectionErrorPlaceHolder = true;
        }
      );
  }

// Fetching organization previous month salarry data of selected month.
  organizationPreviousMonthSalaryData: OrganizationMonthWiseSalaryData = new OrganizationMonthWiseSalaryData();
  getOrganizationPreviousMonthSalaryDataMethodCall() {
    this._payrollService.getPreviousMonthSalary(this.startDate,this.endDate).subscribe((response) => {
          if(response.object!=null){
            this.organizationPreviousMonthSalaryData = response.object;
          }
        },(error) => {
          
        }
      );
  }

  // Fetching those user whose salary template is not mapped
  userSalaryTemplateNotConfigCount : number=0;
  getUserSalaryTemplateNotConfig() {
    this._payrollService.getUserSalaryTemplateNotConfig().subscribe((response) => {
          if(response.totalItems!=null){
            this.userSalaryTemplateNotConfigCount = response.totalItems;
          }
        },(error) => {
          
        }
      );
  }
  
  // get process step of payroll
  PAYROLL_PROCESS_STEP : number = 0;
  getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall(){
    this._payrollService.getPayrollProcessStep(this.startDate, this.endDate).subscribe((response) => {
      if(response.status){
        if(response.object!=null){
          this.PAYROLL_PROCESS_STEP = response.object;
        }else{
          this.PAYROLL_PROCESS_STEP = 0;
        }
      }
    }, (error) => {

    })
  }


  view: [number, number] = [400, 270]; // explicitly define as tuple
  // options
  showLegend: boolean = false;
  showLabels: boolean = true;
  explodeSlices: boolean = false;
  doughnut: boolean = true;
  gradient: boolean = true;
  // legendPosition: LegendPosition = 'above' as LegendPosition;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [ '#E9E9FF','#FFA500','#E9E9FF','#FFA500', '#F8D7D7','#EB5050','#888']
  };

  // chart data
  single = [
    {
      name: 'EPF',
      value: 0
    },
    {
      name: 'ESI',
      value: 0
    },
    {
      name: 'EPFC',
      value: 0
    },
    {
      name: 'EESIC',
      value: 0
    },
    {
      name: 'TDS',
      value: 0
    },
    {
      name: 'Net Pay',
      value: 0
    },
    {
      name: 'Not Found',
      value: 0.1
    }
  ];


  payrollChartMehthodCall(){
    this.single = [ 
      {
        name: 'EPF',
        value: this.organizationMonthWiseSalaryData.employeeEpf
      },
      {
        name: 'ESI',
        value: this.organizationMonthWiseSalaryData.employeeEsi
      },
      {
        name: 'EPFC',
        value: this.organizationMonthWiseSalaryData.employerEpf
      },
      {
        name: 'EESIC',
        value: this.organizationMonthWiseSalaryData.employerEsi
      },
      {
        name: 'TDS',
        value: this.organizationMonthWiseSalaryData.tdsAmount
      },
      {
        name: 'Net Pay',
        value: this.organizationMonthWiseSalaryData.netPay
      }
    ];
  }

  resetPayrollChartData(){

    this.single = [
      {
        name: 'EPF',
        value: 0
      },
      {
        name: 'ESI',
        value: 0
      },
      {
        name: 'EPFC',
        value: 0
      },
      {
        name: 'EESIC',
        value: 0
      },
      {
        name: 'TDS',
        value: 0
      },
      {
        name: 'Net Pay',
        value: 0
      },
      {
        name: 'Not Found',
        value: 0.1
      }
    ];
  }


  resetDashboardData(){
    this.organizationMonthWiseSalaryData = new OrganizationMonthWiseSalaryData();
    this.organizationPreviousMonthSalaryData = new OrganizationMonthWiseSalaryData();
    this.payrollDashboardEmployeeCountResponse = new PayrollDashboardEmployeeCountResponse();
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                              DASHBOARD SECTION  END                                                                // 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

isSyncLoading:boolean=false;
  syncPayrollData(){
    this.isSyncLoading = true;
    this._payrollService.syncPayrollMonthlyData(this.startDate, this.endDate).subscribe(
      (response) => {
        if(response.status){
          this.ngOnInit();
          this._helperService.showToast('Sync successfully.', Key.TOAST_STATUS_SUCCESS);
        }else{

        }
        this.isSyncLoading = false;
      },
      (error) => {
        this._helperService.showToast('Error while sync the Payroll!', Key.TOAST_STATUS_ERROR);
        this.isSyncLoading = false;
      }
    );
  }

  payrollLogs: any[] = [];
  isPayrollHistoryPlaceholder = true;
  dataNotFoundPlaceholderForPayrollHistory : boolean = false;
  networkConnectionErrorPlaceHolderForPayrollHistory : boolean = false;
  getPayrollLogs(): void {
    this.payrollLogs = [];
    this._payrollService.getGeneratedPayrollMonthlyLogs(this.startDate, this.endDate).subscribe(
        (response) => {

          if(response.object== null || response.object.length==0){
            this.dataNotFoundPlaceholderForPayrollHistory = true;
          } else{
            this.payrollLogs = response.object;
          }
          this.isPayrollHistoryPlaceholder = this.payrollLogs.length === 0;
        },
        (error) => {
          this.isPayrollHistoryPlaceholder = true;
          this.networkConnectionErrorPlaceHolderForPayrollHistory = true;
        }
      );
  }

  getData(step:any){
    // console.log("====step======",step)
    this.PAYROLL_PROCESS_STEP = step;
    this.payrollToggleView = false;
    this.showLeaveComponent = false;
    this.showEmployeeComponent = false;
    this.showEariningComponent = false;
    this.showSalaryComponent = false;
  }


  RUN_PAYROLL_LOADER : boolean = false;
  @ViewChild('history')history!:ElementRef;
  getPayrollReport(){
    this.RUN_PAYROLL_LOADER = true;
    this._payrollService.generatePayrollReport(this.startDate, this.endDate).subscribe((response) => {
      if(response.status){
        this._helperService.showToast('Payroll generated successfully.', Key.TOAST_STATUS_SUCCESS);
          const downloadLink = document.createElement('a');
          downloadLink.href = response.object;
          downloadLink.download = 'payroll_report.xlsx';
          downloadLink.click();
      }else{

      }
      this.RUN_PAYROLL_LOADER = false;
      },(error) => {
        this._helperService.showToast('Error while generating the Payroll!', Key.TOAST_STATUS_ERROR);
        this.RUN_PAYROLL_LOADER = false;
      });
  } 

}






