import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Key } from 'src/app/constant/key';
import { EpfDetailsRequest } from 'src/app/models/epf-details-request';
import { EpfDetailsResponse } from 'src/app/models/epf-details-response';
import { EsiDetailsRequest } from 'src/app/models/esi-details-request';
import { EsiDetailsResponse } from 'src/app/models/esi-details-response';
import { FinalSettlementResponse } from 'src/app/models/final-settlement-response';
import { LeaveTypeResponse } from 'src/app/models/leave-type-response';
import { LopAdjustmentRequest } from 'src/app/models/lop-adjustment-request';
import { LopReversalRequest } from 'src/app/models/lop-reversal-request';
import { LopReversalResponse } from 'src/app/models/lop-reversal-response';
import { LopSummaryRequest } from 'src/app/models/lop-summary-request';
import { LopSummaryResponse } from 'src/app/models/lop-summary-response';
import { MonthResponse } from 'src/app/models/month-response';
import { NewJoineeAndUserExitRequest } from 'src/app/models/new-joinee-and-user-exit-request';
import { NewJoineeResponse } from 'src/app/models/new-joinee-response';
import { NoticePeriod } from 'src/app/models/notice-period';
import { OrganizationMonthWiseSalaryData } from 'src/app/models/organization-month-wise-salary-data';
import { PayActionType } from 'src/app/models/pay-action-type';
import { PayrollDashboardEmployeeCountResponse } from 'src/app/models/payroll-dashboard-employee-count-response';
import { PayrollLeaveResponse } from 'src/app/models/payroll-leave-response';
import { Role } from 'src/app/models/role';
import { SalaryChangeBonusRequest } from 'src/app/models/salary-change-bonus-request';
import { SalaryChangeBonusResponse } from 'src/app/models/salary-change-bonus-response';
import { SalaryChangeOvertimeRequest } from 'src/app/models/salary-change-overtime-request';
import { SalaryChangeOvertimeResponse } from 'src/app/models/salary-change-overtime-response';
import { SalaryChangeResponse } from 'src/app/models/salary-change-response';
import { TdsDetailsRequest } from 'src/app/models/tds-details-request';
import { TdsDetailsResponse } from 'src/app/models/tds-details-response';
import { UserExitResponse } from 'src/app/models/user-exit-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';

@Component({
  selector: 'app-payroll-dashboard',
  templateUrl: './payroll-dashboard.component.html',
  styleUrls: ['./payroll-dashboard.component.css'],
})
export class PayrollDashboardComponent implements OnInit {
  itemPerPage: number = 8;
  pageNumber: number = 1;
  lastPageNumber: number = 0;
  sort: string = 'asc';
  sortBy: string = 'id';
  search: string = '';
  searchBy: string = 'name';
  total: number = 0;

  payrollToggleView:boolean=false;
  showLeaveComponent:boolean=false;
  showEmployeeComponent:boolean=false;
  showSalaryComponent:boolean=false;
  showEariningComponent:boolean=false;

  readonly TOAST_STATUS_SUCCESS = Key.TOAST_STATUS_SUCCESS;
  readonly TOAST_STATUS_ERROR = Key.TOAST_STATUS_ERROR;

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

  isTaskSuccess : boolean = true;

  // @ViewChild('step1Tab', { static: false }) step1Tab!: ElementRef;
  // @ViewChild('step2Tab', { static: false }) step2Tab!: ElementRef;
  // @ViewChild('step3Tab', { static: false }) step3Tab!: ElementRef;
  // @ViewChild('step4Tab', { static: false }) step4Tab!: ElementRef;
  // @ViewChild('step5Tab', { static: false }) step5Tab!: ElementRef;
  // @ViewChild('step6Tab', { static: false }) step6Tab!: ElementRef;
  // @ViewChild('step7Tab', { static: false }) step7Tab!: ElementRef;
  // @ViewChild('step8Tab', { static: false }) step8Tab!: ElementRef;
  // @ViewChild('step9Tab', { static: false }) step9Tab!: ElementRef;
  // @ViewChild('step10Tab', { static: false }) step10Tab!: ElementRef;
  // @ViewChild('step11Tab', { static: false }) step11Tab!: ElementRef;
  // @ViewChild('step12Tab', { static: false }) step12Tab!: ElementRef;


  // @ViewChild('employeeChangeModal', { static: false }) employeeChangeModal!: ElementRef;
  // @ViewChild('attendanceAndLeaveModal', { static: false }) attendanceAndLeaveModal!: ElementRef;
  // @ViewChild('salaryChangeModal', { static: false }) salaryChangeModal!: ElementRef;
  // @ViewChild('epfEsiTdsModal', { static: false }) epfEsiTdsModal!: ElementRef;

  // navigateToTab(tabId: string): void {
  //   switch (tabId) {
  //     case 'step1-tab':
  //       this.step1Tab.nativeElement.click();
  //       break;
  //     case 'step2-tab':
  //       this.step2Tab.nativeElement.click();
  //       break;
  //     case 'step3-tab':
  //       this.step3Tab.nativeElement.click();
  //       break;
  //     case 'step4-tab':
  //       this.step4Tab.nativeElement.click();
  //       break;
  //     case 'step5-tab':
  //       this.step5Tab.nativeElement.click();
  //       break;
  //     case 'step6-tab':
  //       this.step6Tab.nativeElement.click();
  //       break;
  //     case 'step7-tab':
  //       this.step7Tab.nativeElement.click();
  //       break;
  //     case 'step8-tab':
  //       this.step8Tab.nativeElement.click();
  //       break;
  //     case 'step9-tab':
  //       this.step9Tab.nativeElement.click();
  //       break;
  //     case 'step10-tab':
  //       this.step10Tab.nativeElement.click();
  //       break;
  //     case 'step11-tab':
  //       this.step11Tab.nativeElement.click();
  //       break;
  //     case 'step12-tab':
  //       this.step12Tab.nativeElement.click();
  //       break;
  //     default:
  //       console.error(`Tab with id ${tabId} not found`);
  //       return;
  //   }
  // }

  // ------------------------------
  //Exmployee changes selection
  employeeChangesSection(PAYROLL_PROCESS_STEP : number){
    this.payrollToggleView = true;
    this.showEmployeeComponent = true;
    // if(PAYROLL_PROCESS_STEP == this.FINAL_SETTLEMENT){
    //   this.finalSettlementTab();
    //   this.navigateToTab('step3-tab');
    // } else if(PAYROLL_PROCESS_STEP == this.USER_EXIT){
    //   this.userExitTab();
    //   this.navigateToTab('step2-tab');
    // } else{
    //   this.newJoineeTab();
    // }
  }
  // newJoineeTab() {
  //   this.CURRENT_TAB = this.NEW_JOINEE;
  //   this.CURRENT_TAB_IN_EMPLOYEE_CHANGE = this.NEW_JOINEE;
  //   this.resetCriteriaFilter();
  //   this.getNewJoineeByOrganizationIdMethodCall();
  // }

  // userExitTab() {
  //   this.CURRENT_TAB = this.USER_EXIT;
  //   this.CURRENT_TAB_IN_EMPLOYEE_CHANGE = this.USER_EXIT;
  //   this.resetCriteriaFilter();
  //   this.getUserExitByOrganizationIdMethodCall();
  // }

  // finalSettlementTab() {
  //   this.CURRENT_TAB = this.FINAL_SETTLEMENT;
  //   this.CURRENT_TAB_IN_EMPLOYEE_CHANGE = this.FINAL_SETTLEMENT;
  //   this.resetCriteriaFilter();
  //   this.getFinalSettlementByOrganizationIdMethodCall();
  // }

  // ----------------------------------------------------------
  // Attendance, Leaves and Present Days tab selection
  attendanceAndLeaveSection(PAYROLL_PROCESS_STEP : number){
    this.payrollToggleView = true;
    this.showLeaveComponent = true;
    // if(PAYROLL_PROCESS_STEP == this.LOP_REVERSAL){
    //   this.lopReversalTab();
    //   this.navigateToTab('step6-tab');
    // } else if(PAYROLL_PROCESS_STEP == this.LOP_SUMMARY){
    //   this.lopSummaryTab();
    //   this.navigateToTab('step5-tab');
    // } else{
    //   this.leavesTab();
    // }
  }
  // leavesTab(){
  //   this.CURRENT_TAB = this.LEAVES;
  //   this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = this.LEAVES;
  //   this.resetCriteriaFilter();
  //   console.log("==========getPendingLeaves==========")
  //   // this.getUserPendingLeaves(); ///ABHIJEET
  //   // this.getPayrollLeaveResponseMethodCall();
  // }

  // lopSummaryTab(){
  //   this.CURRENT_TAB = this.LOP_SUMMARY;
  //   this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = this.LOP_SUMMARY;
  //   this.resetCriteriaFilter();
  //   this.getLopSummaryResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
  // }

  // lopReversalTab(){
  //   this.CURRENT_TAB = this.LOP_REVERSAL;
  //   this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = this.LOP_REVERSAL;
  //   this.resetCriteriaFilter();
  //   this.getLopReversalResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
  // }


  // ----------------------------------------------------------
  // Salary Changes, Bonus and Overtime tab selection
  salaryChangeSection(PAYROLL_PROCESS_STEP : number){
    this.payrollToggleView = true;
    this.showEariningComponent = true;
    // if(PAYROLL_PROCESS_STEP == this.OVERTIME){
    //   this.overtimeTab();
    //   this.navigateToTab('step9-tab');
    // } else if(PAYROLL_PROCESS_STEP == this.BONUS){
    //   this.bonusTab();
    //   this.navigateToTab('step8-tab');
    // } else{
    //   this.salaryChangeTab();
    // }
  }
  // salaryChangeTab(){
  //   this.CURRENT_TAB = this.SALARY_CHANGE;
  //   this.CURRENT_TAB_IN_SALARY_CHANGE = this.SALARY_CHANGE;
  //   this.resetCriteriaFilter();
  //   this.getSalaryChangeResponseListByOrganizationIdMethodCall();
  // }

  // bonusTab(){
  //   this.CURRENT_TAB = this.BONUS;
  //   this.CURRENT_TAB_IN_SALARY_CHANGE = this.BONUS;
  //   this.resetCriteriaFilter();
  //   this.getSalaryChangeBonusResponseListByOrganizationIdMethodCall();
  // }

  // overtimeTab(){
  //   this.CURRENT_TAB = this.OVERTIME;
  //   this.CURRENT_TAB_IN_SALARY_CHANGE = this.OVERTIME;
  //   this.resetCriteriaFilter();
  //   this.getSalaryChangeOvertimeResponseListByOrganizationIdMethodCall();
  // }


  // -----------------------------------------
  // EPF, ESI & TDS
  epfEsiTdsSection(PAYROLL_PROCESS_STEP : number){
    this.payrollToggleView = true;
    this.showSalaryComponent = true;
    // if(PAYROLL_PROCESS_STEP == this.TDS){
    //   this.tdsTab();
    //   this.navigateToTab('step12-tab');
    // } else if(PAYROLL_PROCESS_STEP == this.ESI){
    //   this.esiTab();
    //   this.navigateToTab('step11-tab');
    // } else{
    //   this.epfTab();
    // }
  }
  // epfTab(){
  //   this.CURRENT_TAB = this.EPF;
  //   this.CURRENT_TAB_IN_EPF_ESI_TDS = this.EPF;
  //   this.resetCriteriaFilter();
  //   this.getEpfDetailsResponseListByOrganizationIdMethodCall();
  // }

  // esiTab(){
  //   this.CURRENT_TAB = this.ESI;
  //   this.CURRENT_TAB_IN_EPF_ESI_TDS = this.ESI;
  //   this.resetCriteriaFilter();
  //   this.getEsiDetailsResponseListByOrganizationIdMethodCall();
  // }

  // tdsTab(){
  //   this.CURRENT_TAB = this.TDS;
  //   this.CURRENT_TAB_IN_EPF_ESI_TDS = this.TDS;
  //   this.resetCriteriaFilter();
  //   this.getTdsDetailsResponseListByOrganizationIdMethodCall();
  // }

  // Employee Chages tab-estate
  // employeeChangesBackTab(){
  //   if(this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.FINAL_SETTLEMENT){
  //     this.navigateToTab('step2-tab'); // Navigating to the user exit tab
  //   } else if(this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.USER_EXIT){
  //     this.navigateToTab('step1-tab'); // Navigating to the new joinee tab
  //   }
  // }

  // Attendance & Leave tab-estate
  // attendanceAndLeaveBackTab(){
  //   if(this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LOP_REVERSAL){
  //     this.navigateToTab('step5-tab');
  //   } else if(this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LOP_SUMMARY){
  //     this.navigateToTab('step4-tab');
  //   }
  // }

  // Salary changes, Bonus & Overtime tab-estate
  // salaryChangesBackTab(){
  //   if(this.CURRENT_TAB_IN_SALARY_CHANGE == this.OVERTIME){
  //     this.navigateToTab('step8-tab');
  //   } else if(this.CURRENT_TAB_IN_SALARY_CHANGE == this.BONUS){
  //     this.navigateToTab('step7-tab');
  //   }
  // }

  // epfEsiTdsBackTab(){
  //   if(this.CURRENT_TAB_IN_EPF_ESI_TDS == this.TDS){
  //     this.navigateToTab('step11-tab');
  //   } else if(this.CURRENT_TAB_IN_EPF_ESI_TDS == this.ESI){
  //     this.navigateToTab('step10-tab');
  //   }
  // }

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholders() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  isShimmerForNewJoinee = false;
  dataNotFoundPlaceholderForNewJoinee = false;
  networkConnectionErrorPlaceHolderForNewJoinee = false;
  preRuleForShimmersAndErrorPlaceholdersForNewJoinee() {
    this.isShimmerForNewJoinee = true;
    this.dataNotFoundPlaceholderForNewJoinee = false;
    this.networkConnectionErrorPlaceHolderForNewJoinee = false;
  }

  isShimmerForUserExit = false;
  dataNotFoundPlaceholderForUserExit = false;
  networkConnectionErrorPlaceHolderForUserExit = false;
  preRuleForShimmersAndErrorPlaceholdersForUserExit() {
    this.isShimmerForUserExit = true;
    this.dataNotFoundPlaceholderForUserExit = false;
    this.networkConnectionErrorPlaceHolderForUserExit = false;
  }

  isShimmerForFinalSettlement = false;
  dataNotFoundPlaceholderForFinalSettlement = false;
  networkConnectionErrorPlaceHolderForFinalSettlement = false;
  preRuleForShimmersAndErrorPlaceholdersForFinalSettlement() {
    this.isShimmerForFinalSettlement = true;
    this.dataNotFoundPlaceholderForFinalSettlement = false;
    this.networkConnectionErrorPlaceHolderForFinalSettlement = false;
  }

  isShimmerForPayrollLeaveResponse = false;
  dataNotFoundPlaceholderForPayrollLeaveResponse = false;
  networkConnectionErrorPlaceHolderForPayrollLeaveResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForPayrollLeaveResponse() {
    this.isShimmerForPayrollLeaveResponse = true;
    this.dataNotFoundPlaceholderForPayrollLeaveResponse = false;
    this.networkConnectionErrorPlaceHolderForPayrollLeaveResponse = false;
  }

  isShimmerForLopSummary = false;
  dataNotFoundPlaceholderForLopSummary = false;
  networkConnectionErrorPlaceHolderForLopSummary = false;
  preRuleForShimmersAndErrorPlaceholdersForLopSummary() {
    this.isShimmerForLopSummary = true;
    this.dataNotFoundPlaceholderForLopSummary = false;
    this.networkConnectionErrorPlaceHolderForLopSummary = false;
  }

  isShimmerForLopReversal = false;
  dataNotFoundPlaceholderForLopReversal = false;
  networkConnectionErrorPlaceHolderForLopReversal = false;
  preRuleForShimmersAndErrorPlaceholdersForLopReversal() {
    this.isShimmerForLopReversal = true;
    this.dataNotFoundPlaceholderForLopReversal = false;
    this.networkConnectionErrorPlaceHolderForLopReversal = false;
  }

  isShimmerForSalaryChangeResponse = false;
  dataNotFoundPlaceholderForSalaryChangeResponse = false;
  networkConnectionErrorPlaceHolderForSalaryChangeResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryChangeResponse() {
    this.isShimmerForSalaryChangeResponse = true;
    this.dataNotFoundPlaceholderForSalaryChangeResponse = false;
    this.networkConnectionErrorPlaceHolderForSalaryChangeResponse = false;
  }

  isShimmerForSalaryChangeBonusResponse = false;
  dataNotFoundPlaceholderForSalaryChangeBonusResponse = false;
  networkConnectionErrorPlaceHolderForSalaryChangeBonusResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryChangeBonusResponse() {
    this.isShimmerForSalaryChangeBonusResponse = true;
    this.dataNotFoundPlaceholderForSalaryChangeBonusResponse = false;
    this.networkConnectionErrorPlaceHolderForSalaryChangeBonusResponse = false;
  }

  isShimmerForSalaryChangeOvertimeResponse = false;
  dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = false;
  networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryChangeOvertimeResponse() {
    this.isShimmerForSalaryChangeOvertimeResponse = true;
    this.dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = false;
    this.networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = false;
  }

  isShimmerForEpfDetailsResponse = false;
  dataNotFoundPlaceholderForEpfDetailsResponse = false;
  networkConnectionErrorPlaceHolderForEpfDetailsResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEpfDetailsResponse() {
    this.isShimmerForEpfDetailsResponse = true;
    this.dataNotFoundPlaceholderForEpfDetailsResponse = false;
    this.networkConnectionErrorPlaceHolderForEpfDetailsResponse = false;
  }

  isShimmerForEsiDetailsResponse = false;
  dataNotFoundPlaceholderForEsiDetailsResponse = false;
  networkConnectionErrorPlaceHolderForEsiDetailsResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEsiDetailsResponse() {
    this.isShimmerForEsiDetailsResponse = true;
    this.dataNotFoundPlaceholderForEsiDetailsResponse = false;
    this.networkConnectionErrorPlaceHolderForEsiDetailsResponse = false;
  }

  isShimmerForTdsDetailsResponse = false;
  dataNotFoundPlaceholderForTdsDetailsResponse = false;
  networkConnectionErrorPlaceHolderForTdsDetailsResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForTdsDetailsResponse() {
    this.isShimmerForTdsDetailsResponse = true;
    this.dataNotFoundPlaceholderForTdsDetailsResponse = false;
    this.networkConnectionErrorPlaceHolderForTdsDetailsResponse = false;
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
    // this.getOrganizationRegistrationDateMethodCall();
    this.getMonthResponseListByYearMethodCall(this.selectedDate); 
    this.callPayrollDashboardMethod();
    this.getPayActionTypeListMethodCall();
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
  monthResponseList: MonthResponse[] = new Array();
  async getMonthResponseListByYearMethodCall(date: Date){
    return new Promise((resolve, reject) => {
      this.monthResponseList = [];
      this._payrollService.getMonthResponseListByYear(this._helperService.formatDateToYYYYMMDD(date)).subscribe((response) => {
        if(response.status){
          this.monthResponseList = response.object;
        }
        resolve(true);
      }, ((error) => {
        resolve(true);
      }))
    })
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

 
  // Fetching organization registration date.
  // organizationRegistrationDate: string = '';
  // getOrganizationRegistrationDateMethodCall() {
  //   this.dataService.getOrganizationRegistrationDate().subscribe(
  //     (response) => {
  //       this.organizationRegistrationDate = response;
  //     },
  //     (error) => {
  //     }
  //   );
  // }


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
          
          this.organizationMonthWiseSalaryData.epfAmount = this.organizationMonthWiseSalaryData.epfAmount == null ? 0 : this.organizationMonthWiseSalaryData.epfAmount;
          this.organizationMonthWiseSalaryData.esiAmount = this.organizationMonthWiseSalaryData.esiAmount == null ? 0 : this.organizationMonthWiseSalaryData.esiAmount;
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

  
  PAYROLL_PROCESS_STEP : number = 0;
  // get process step of payroll
  getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall(){
    this._payrollService.getPayrollProcessStep(this.startDate, this.endDate).subscribe((response) => {
      if(response.status){
        if(response.object!=null){
          this.PAYROLL_PROCESS_STEP = response.object;
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
    domain: [ '#E9E9FF','#FFA500', '#F8D7D7','#EB5050','#888']
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
        value: this.organizationMonthWiseSalaryData.epfAmount
      },
      {
        name: 'ESI',
        value: this.organizationMonthWiseSalaryData.esiAmount
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


  //Routing to the user profile section
  routeToUserProfile(uuid : string){
    this._helperService.routeToUserProfile(uuid);
  }

  //Fetching the new joinee data
  newJoineeResponseList: NewJoineeResponse[] = [];
  debounceTimer: any;
  selectedPayActionCache: { [uuid: string]: PayActionType } = {};
  commentCache: { [uuid: string]: string } = {};
  getNewJoineeByOrganizationIdMethodCall(debounceTime: number = 300) {
    this.newJoineeResponseList = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForNewJoinee();
      this.dataService
        .getNewJoineeByOrganizationId(
          this.itemPerPage,
          this.pageNumber,
          this.search,
          this.startDate,
          this.endDate
        )
        .subscribe(
          (response) => {
            if (this._helperService.isListOfObjectNullOrUndefined(response)) {
              this.dataNotFoundPlaceholderForNewJoinee = true;
            } else {
              this.newJoineeResponseList = response.listOfObject.map((joinee: NewJoineeResponse) => {
                // Apply cached selection if available
                if (this.selectedPayActionCache[joinee.uuid]) {
                  joinee.payActionType = this.selectedPayActionCache[joinee.uuid];
                  joinee.payActionTypeId = this.selectedPayActionCache[joinee.uuid].id;
                } else {
                  // Set initial selection based on payActionTypeId
                  const selectedPayActionType = this.payActionTypeList.find(
                    (payActionType) => payActionType.id === joinee.payActionTypeId
                  );
                  if (selectedPayActionType) {
                    joinee.payActionType = selectedPayActionType;
                  }
                }
                   // Apply cached comment if available
                   if (this.commentCache[joinee.uuid]) {
                    joinee.comment = this.commentCache[joinee.uuid];
                  }
  
                return joinee;
              });
              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            }
            this.isShimmerForNewJoinee = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForNewJoinee = true;
            this.isShimmerForNewJoinee = false;
          }
        );
    }, debounceTime);
  }


  updateComment(response: any, comment: string) {
    response.comment = comment;
    // Update the cache
    this.commentCache[response.uuid] = comment;
  }

  //Fetching the pay action type list
  payActionTypeList : PayActionType[] = new Array();
  getPayActionTypeListMethodCall(){
    this.dataService.getPayActionTypeList().subscribe((response) => {
      if(response.status){
        this.payActionTypeList = response.listOfObject;
      }
    }, (error) => {

    })
  }

  //Fetching the notice period list
  noticePeriodList : NoticePeriod[] = [];
  getNoticePeriodListMethodCall(){
    this.dataService.getNoticePeriodList().subscribe((response) => {
      if(this._helperService.isListOfObjectNullOrUndefined(response)){

      } else{
        this.noticePeriodList = response.listOfObject;
      }
    }, (error) => {

    })
  }

  //Selecting pay action type
  isDropdownOpen = false;
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectedPayActionType : PayActionType = new PayActionType();
  selectPayActionType(payActionType : PayActionType, response : any){
    debugger
    if(response != undefined && response != null){
      response.payActionTypeId = payActionType.id;
      response.payActionType = payActionType;
      this.selectedPayActionCache[response.uuid] = payActionType;
    }
  }
  getSelectedPayActionTypeName(response: any): string {
    if (response.payActionTypeId === 2) {
      return 'HOLD SALARY';
    } else {
      return 'PROCESS AS SALARY';
    }
  }

  


  // User selection to generate the payout
  // isAllUsersSelected : boolean = false;
  // isAllSelected : boolean = false;
  // selectedStaffsUuids: string[] = [];

  // checkIndividualSelection() {
  //   this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
  //   this.isAllSelected = this.isAllUsersSelected;
  //   this.updateSelectedStaffs();
  // }

  // updateSelectedStaffs() {
  //   this.staffs.forEach((staff) => {
  //     if (staff.selected && !this.selectedStaffsUuids.includes(staff.uuid)) {
  //       this.selectedStaffsUuids.push(staff.uuid);
  //     } else if (
  //       !staff.selected &&
  //       this.selectedStaffsUuids.includes(staff.uuid)
  //     ) {
  //       this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
  //         (uuid) => uuid !== staff.uuid,
  //       );
  //     }
  //   });

  //   this.checkAndUpdateAllSelected();

  //   if (this.selectedStaffsUuids.length === 0) {
  //   }
  // }

  // checkAndUpdateAllSelected() {
  //   this.isAllSelected =
  //     this.staffs.length > 0 && this.staffs.every((staff) => staff.selected);
  //   this.isAllUsersSelected = this.selectedStaffsUuids.length === this.total;
  // }

  // selectAll(checked: boolean) {
  //   this.isAllSelected = checked;
  //   this.staffs.forEach((staff) => (staff.selected = checked));

  //   // Update the selectedStaffsUuids based on the current page selection
  //   if (checked) {
  //     this.staffs.forEach((staff) => {
  //       if (!this.selectedStaffsUuids.includes(staff.uuid)) {
  //         this.selectedStaffsUuids.push(staff.uuid);
  //       }
  //     });
  //   } else {
  //     this.staffs.forEach((staff) => {
  //       if (this.selectedStaffsUuids.includes(staff.uuid)) {
  //         this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
  //           (uuid) => uuid !== staff.uuid,
  //         );
  //       }
  //     });
  //   }
  // }

  // selectAllUsers(isChecked: boolean) {

  //   this.isAllUsersSelected = isChecked;
  //   this.isAllSelected = isChecked;
  //   this.staffs.forEach((staff) => (staff.selected = isChecked));

  //   if (isChecked) {
  //     this.getAllUserUuidsMethodCall().then((allUuids) => {
  //       this.selectedStaffsUuids = allUuids;
  //     });
  //   } else {
  //     this.selectedStaffsUuids = [];
  //   }
  // }

  // unselectAllUsers() {
  //   this.isAllUsersSelected = false;
  //   this.isAllSelected = false;
  //   this.staffs.forEach((staff) => (staff.selected = false));
  //   this.selectedStaffsUuids = [];
  // }

  // searchUsers(){};
  // clearSearch(){};

  //New Joinee Pagination
  // ##### Pagination ############
  changePage(page: number | string, step: number) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }

    // New Joinee, User Exit, etc.
    if (step == this.NEW_JOINEE) {
      this.getNewJoineeByOrganizationIdMethodCall();
    }

    if (step == this.USER_EXIT) {
      this.getUserExitByOrganizationIdMethodCall();
    }

    if (step == this.FINAL_SETTLEMENT) {
      this.getFinalSettlementByOrganizationIdMethodCall();
    }

    // Leaves, Lop Summary, etc.
    if (step == this.LEAVES){
      // this.getUserPendingLeaves();
    }

    if (step == this.LOP_SUMMARY){
      this.getLopSummaryResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
    }

    if(step == this.LOP_REVERSAL){
      this.getLopReversalResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
    }

    // Salary change, bonus & deduction
    if(step == this.SALARY_CHANGE){
      this.getSalaryChangeResponseListByOrganizationIdMethodCall();
    }

    if(step == this.BONUS){
      this.getSalaryChangeBonusResponseListByOrganizationIdMethodCall();
    }

    if(step == this.OVERTIME){

    }

    // EPF, ESI & TDS (OVERRIDE)
    if(step == this.EPF){
      this.getEpfDetailsResponseListByOrganizationIdMethodCall();
    }

    if(step == this.ESI){
      this.getEsiDetailsResponseListByOrganizationIdMethodCall();
    }

    if(step == this.TDS){
      this.getTdsDetailsResponseListByOrganizationIdMethodCall();
    }

    if(step == this.PAYROLL_HISTORY){
      this.getPayrollLogs();
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

  //New Joinee & User Exit Search
  searchNewJoinee(event: Event) {
    this._helperService.ignoreKeysDuringSearch(event);
    this.resetCriteriaFilterMicro();
    this.getNewJoineeByOrganizationIdMethodCall();
  }

  searchUserExit(event: Event) {
    this._helperService.ignoreKeysDuringSearch(event);
    this.resetCriteriaFilterMicro();
    this.getUserExitByOrganizationIdMethodCall();
  }

  searchUsers(event: Event, step: number) {
    this._helperService.ignoreKeysDuringSearch(event);
    this.resetCriteriaFilterMicro();

    if (step == this.NEW_JOINEE) {
      this.getNewJoineeByOrganizationIdMethodCall();
    }

    if (step == this.USER_EXIT) {
      this.getUserExitByOrganizationIdMethodCall();
    }

    if (step == this.FINAL_SETTLEMENT) {
      this.getFinalSettlementByOrganizationIdMethodCall();
    }
  }

  // Clearing search text
  clearSearch(step: number) {
    this.resetCriteriaFilter();
    if (step == this.NEW_JOINEE) {
      this.getNewJoineeByOrganizationIdMethodCall();
    }

    if (step == this.USER_EXIT) {
      this.getUserExitByOrganizationIdMethodCall();
    }

    if (step == this.FINAL_SETTLEMENT) {
      this.getFinalSettlementByOrganizationIdMethodCall();
    }
  }

  resetCriteriaFilter() {
    this.itemPerPage = 8;
    this.pageNumber = 1;
    this.lastPageNumber = 0;
    this.total = 0;
    this.sort = 'asc';
    this.sortBy = 'id';
    this.search = '';
    this.searchBy = 'name';
    
  }

  resetCriteriaFilterMicro() {
    this.itemPerPage = 8;
    this.pageNumber = 1;
    this.lastPageNumber = 0;
    this.total = 0;
  }

  //Fetching the user exit data
  userExitResponseList: UserExitResponse[] = [];
  getUserExitByOrganizationIdMethodCall(debounceTime: number = 300) {
    debugger
    this.userExitResponseList = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForUserExit();
      this.dataService
        .getUserExitByOrganizationId(
          this.itemPerPage,
          this.pageNumber,
          this.sort,
          this.sortBy,
          this.search,
          this.searchBy,
          this.startDate,
          this.endDate
        )
        .subscribe(
          (response) => {
            if (this._helperService.isListOfObjectNullOrUndefined(response)) {
              this.dataNotFoundPlaceholderForUserExit = true;
            } else {
              this.userExitResponseList = response.listOfObject.map((exit: UserExitResponse) => {
                // Apply cached pay action type if available
                if (this.selectedPayActionCache[exit.uuid]) {
                  exit.payActionType = this.selectedPayActionCache[exit.uuid];
                  exit.payActionTypeId = this.selectedPayActionCache[exit.uuid].id;
                  // console.log(exit.name, exit.payActionType)
                } else {
                  // Set initial selection based on payActionTypeId
                  const selectedPayActionType = this.payActionTypeList.find(
                    (payActionType) => payActionType.id === exit.payActionTypeId
                  );
                  if (selectedPayActionType) {
                    exit.payActionType = selectedPayActionType;
                  }
                }

                // Apply cached comment if available
                if (this.commentCache[exit.uuid]) {
                  exit.comment = this.commentCache[exit.uuid];
                }

                return exit;
              });
              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            }
            this.isShimmerForUserExit = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForUserExit = true;
            this.isShimmerForUserExit = false;
          }
        );
    }, debounceTime);
  }

  //Fetching the final settlement data
  finalSettlementResponseList: FinalSettlementResponse[] = [];
  getFinalSettlementByOrganizationIdMethodCall(debounceTime: number = 300) {
    this.finalSettlementResponseList = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForFinalSettlement();
      this.dataService
        .getFinalSettlementByOrganizationId(
          this.itemPerPage,
          this.pageNumber,
          this.sort,
          this.sortBy,
          this.search,
          this.searchBy,
          this.startDate,
          this.endDate
        )
        .subscribe(
          (response) => {
            if (this._helperService.isListOfObjectNullOrUndefined(response)) {
              this.dataNotFoundPlaceholderForFinalSettlement = true;
            } else {
              this.finalSettlementResponseList = response.listOfObject.map((settlement: FinalSettlementResponse) => {
                // Apply cached pay action type if available
                if (this.selectedPayActionCache[settlement.uuid]) {
                  settlement.payActionType = this.selectedPayActionCache[settlement.uuid];
                  settlement.payActionTypeId = this.selectedPayActionCache[settlement.uuid].id;
                } else {
                  // Set initial selection based on payActionTypeId
                  const selectedPayActionType = this.payActionTypeList.find(
                    (payActionType) => payActionType.id === settlement.payActionTypeId
                  );
                  if (selectedPayActionType) {
                    settlement.payActionType = selectedPayActionType;
                  }
                }

                // Apply cached comment if available
                if (this.commentCache[settlement.uuid]) {
                  settlement.comment = this.commentCache[settlement.uuid];
                }

                return settlement;
              });
              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            }
            this.isShimmerForFinalSettlement = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForFinalSettlement = true;
            this.isShimmerForFinalSettlement = false;
          }
        );
    }, debounceTime);
  }
  //Registering new joinee and user exit data to employee month wise salary data
  newJoineeAndUserExitRequestList: NewJoineeAndUserExitRequest[] = [];
  registerNewJoineeAndUserExitMethodCall() {
    debugger;
    if (this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.NEW_JOINEE) {
      this.newJoineeAndUserExitRequestList = [];


        this.newJoineeResponseList.forEach((item) => {
          let newJoineeAndUserExitRequest = new NewJoineeAndUserExitRequest(item.uuid, item.payActionTypeId, item.comment);

          this.newJoineeAndUserExitRequestList.push(newJoineeAndUserExitRequest);
        });
      } 

      if(this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.USER_EXIT){
        this.newJoineeAndUserExitRequestList = [];

        this.userExitResponseList.forEach((item) => {
          let newJoineeAndUserExitRequest = new NewJoineeAndUserExitRequest(item.uuid, item.payActionType.id, item.comment);

          this.newJoineeAndUserExitRequestList.push(newJoineeAndUserExitRequest);
        })
      }

      if(this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.FINAL_SETTLEMENT){
        this.newJoineeAndUserExitRequestList = [];

        this.finalSettlementResponseList.forEach((item) => {
          let newJoineeAndUserExitRequest = new NewJoineeAndUserExitRequest(item.uuid, item.payActionType.id, item.comment);

          this.newJoineeAndUserExitRequestList.push(newJoineeAndUserExitRequest);
        })
      }
      
      this.dataService.registerNewJoineeAndUserExit(this.newJoineeAndUserExitRequestList, this.startDate, this.endDate).subscribe((response) => {
        debugger;
        this.selectedPayActionCache={};
        this.commentCache = {};
        this._helperService.showToast(response.message, this.TOAST_STATUS_SUCCESS);
        if (this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.NEW_JOINEE) {
          this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.USER_EXIT).subscribe((response)=>{
            this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
            setTimeout(() => {
              // this.navigateToTab('step2-tab');
            }, 100);
          }, ((error) => {
            console.log(error);
          }))
        } else if (this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.USER_EXIT) {
          this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.FINAL_SETTLEMENT).subscribe((response)=>{
            this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
            setTimeout(() => {
              // this.navigateToTab('step3-tab');
            }, 100)
          }, ((error) => {
            console.log(error);
          }))
        } else if (this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.FINAL_SETTLEMENT){
          debugger;
          this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.LEAVES).subscribe((response)=>{
            this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
            setTimeout(() => {
              // this.employeeChangeModal.nativeElement.click();
            }, 100)
          }, ((error) => {
            console.log(error);
          }))
        }

      }, (error) => {
        this._helperService.showToast(error.error.message, this.TOAST_STATUS_ERROR);
      })
    }




    // #######################################################################
    // Step 2: Attendance, Leaves & Present days

    registerAttendanceAndLeavesMethodCall(CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE : number){
      if(CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LEAVES){
        this.registerPayrollLeave();
      }

      if(CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LOP_SUMMARY){
        this.registerLopSummaryRequestByOrganizationIdAndStartDateMethodCall();
      }

      if(CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LOP_REVERSAL){
        this.registerLopReversalRequestByOrganizationIdAndStartDateMethodCall();
      }
    }

    lopSummaryRequestList : LopSummaryRequest[] = [];
    registerLopSummaryRequestByOrganizationIdAndStartDateMethodCall(){

      this.lopSummaryRequestList = [];

      this.lopSummaryResponseList.forEach((item) => {
        let lopSummaryRequest = new LopSummaryRequest(item.uuid, item.lopDays, item.finalLopDays, item.adjustedLopDays, item.lopSummaryComment);
        
        this.lopSummaryRequestList.push(lopSummaryRequest);
      })

      this._payrollService.registerLopSummaryRequestByOrganizationIdAndStartDateAndEndDate(this.lopSummaryRequestList, this.startDate, this.endDate).subscribe((response) => {
        this.lopSummaryCommentCache = {};
        this.adjustedLopDaysCache = {};
        this._helperService.showToast("LOP summary has been successfully saved.", this.TOAST_STATUS_SUCCESS);
        this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.LOP_REVERSAL).subscribe((response)=>{
          this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
          setTimeout(() => {
            // this.navigateToTab('step6-tab');
          }, 100)
        }, ((error) => {
          console.log(error);
        }))   
      }, (error) => {
        this._helperService.showToast("Error while saving the LOP summary!", this.TOAST_STATUS_ERROR);
        console.log(error);
      })
    }

    lopSummaryResponseList: LopSummaryResponse[] = [];
    adjustedLopDaysCache: { [uuid: string]: number } = {};
    lopSummaryCommentCache: { [uuid: string]: string } = {};
    
    getLopSummaryResponseByOrganizationIdAndStartDateAndEndDateMethodCall() {
      this.preRuleForShimmersAndErrorPlaceholdersForLopSummary();
      this._payrollService.getLopSummaryResponseByOrganizationIdAndStartDateAndEndDate(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe(
        (response) => {
          if (this._helperService.isListOfObjectNullOrUndefined(response)) {
            this.dataNotFoundPlaceholderForLopSummary = true;
          } else {
            this.lopSummaryResponseList = response.listOfObject.map((item: LopSummaryResponse) => {
              // Apply cached adjusted LOP days if available
              if (this.adjustedLopDaysCache[item.uuid]) {
                item.adjustedLopDays = this.adjustedLopDaysCache[item.uuid];
              }
    
              // Apply cached comment if available
              if (this.lopSummaryCommentCache[item.uuid]) {
                item.lopSummaryComment = this.lopSummaryCommentCache[item.uuid];
              }
    
              return item;
            });
    
            this.total = response.totalItems;
            this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
          }
    
          this.isShimmerForLopSummary = false;
        },
        (error) => {
          this.networkConnectionErrorPlaceHolderForLopSummary = true;
          this.isShimmerForLopSummary = false;
        }
      );
    }
    
    // Save adjusted LOP days to cache
    saveAdjustedLopDaysToCache(uuid: string, adjustedLopDays: number) {
      this.adjustedLopDaysCache[uuid] = adjustedLopDays;
    }
    
    // Save comment to cache
    saveLopSummaryCommentToCache(uuid: string, comment: string) {
      this.lopSummaryCommentCache[uuid] = comment;
    }



    lopReversalRequestList : LopReversalRequest[] = [];
    registerLopReversalRequestByOrganizationIdAndStartDateMethodCall(){

      this.lopReversalRequestList = [];

      this.lopReversalResponseList.forEach((item) => {
        let lopReversalRequest = new LopReversalRequest(item.uuid, item.lopDays, item.reversedLopDays, item.comment);
        
        this.lopReversalRequestList.push(lopReversalRequest);
      })

      this._payrollService.registerLopReversalRequestByOrganizationIdAndStartDateAndEndDate(this.lopReversalRequestList, this.startDate, this.endDate).subscribe((response) => {
        this._helperService.showToast("LOP reversed successfully.", this.TOAST_STATUS_SUCCESS);
        this.commentCache = {};
        this.reversedLopDaysCache = {};

        this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.SALARY_CHANGE).subscribe((response)=>{
          this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
          setTimeout(() => {
            // this.attendanceAndLeaveModal.nativeElement.click();
          }, 100)
        }, ((error) => {
          console.log(error);
        }))   
      }, (error) => {
        this._helperService.showToast("Error while saving the LOP Reversal!", this.TOAST_STATUS_ERROR);
        console.log(error);
      })
    }

    lopReversalResponseList: LopReversalResponse[] = [];
reversedLopDaysCache: { [uuid: string]: number } = {};

getLopReversalResponseByOrganizationIdAndStartDateAndEndDateMethodCall(debounceTime: number = 300) {
  this.lopReversalResponseList = [];
  
  if (this.debounceTimer) {
    clearTimeout(this.debounceTimer);
  }
  
  this.debounceTimer = setTimeout(() => {
    this.preRuleForShimmersAndErrorPlaceholdersForLopReversal();
    this._payrollService
      .getLopReversalResponseByOrganizationIdAndStartDateAndEndDate(
        this.startDate,
        this.endDate,
        this.itemPerPage,
        this.pageNumber,
        this.search,
        this.searchBy
      )
      .subscribe(
        (response) => {
          if (this._helperService.isListOfObjectNullOrUndefined(response)) {
            this.dataNotFoundPlaceholderForLopReversal = true;
          } else {
            this.lopReversalResponseList = response.listOfObject.map((lopReversal: LopReversalResponse) => {
              // Apply cached reversed LOP days if available
              if (this.reversedLopDaysCache[lopReversal.uuid]) {
                lopReversal.reversedLopDays = this.reversedLopDaysCache[lopReversal.uuid];
              }

              // Apply cached comment if available
              if (this.commentCache[lopReversal.uuid]) {
                lopReversal.comment = this.commentCache[lopReversal.uuid];
              }

              return lopReversal;
            });

            this.total = response.totalItems;
            this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
          }
          this.isShimmerForLopReversal = false;
        },
        (error) => {
          this.networkConnectionErrorPlaceHolderForLopReversal = true;
          this.isShimmerForLopReversal = false;
        }
      );
  }, debounceTime);
}

// Common method to update and cache reversed LOP days
updateReversedLopDays(response: LopReversalResponse, reversedLopDays: number) {
  response.reversedLopDays = reversedLopDays;
  this.reversedLopDaysCache[response.uuid] = reversedLopDays;
}

// Common method to update and cache comments
updateLopComment(response: LopReversalResponse, comment: string) {
  response.comment = comment;
  this.commentCache[response.uuid] = comment;
}



extractPreviousMonthNameFromDate(dateString : string){
  const date = new Date(dateString);
  
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);

  const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const shortMonthName = monthFormatter.format(date);

  return shortMonthName;
}


  //-------------------------------------
  // API to fetch shift type list by user
  selectedLeaveTypeResponse :  LeaveTypeResponse = new LeaveTypeResponse();

  leaveTypeResponseList : LeaveTypeResponse[] = [];
  getLeaveTypeResponseListByUserUuidMethodCall(uuid : string){
    this.dataService.getLeaveTypeResponseByUserUuid(uuid).subscribe((response) => {
      if(this._helperService.isListOfObjectNullOrUndefined(response)){
        return;
      } else{
        this.selectedLeaveTypeResponse = response.listOfObject[0]; //Setting the first object as selected
        this.lopAdjustmentRequest.leaveType = response.listOfObject[0].name;
        this.leaveTypeResponseList = response.listOfObject;
      }
      // console.log(this.leaveTypeResponseList);
    }, (error) => {
      console.log(error);
    })
  }

  // API to register leave adjustment request
  lopAdjustmentRequest : LopAdjustmentRequest = new LopAdjustmentRequest();
  registerLopAdjustmentRequestMethodCall(){
    debugger;
    this._payrollService.registerLopAdjustmentRequest(this.lopAdjustmentRequest, this.startDate, this.endDate).subscribe((response) => {
      this.closeLopAdjustmentRequestModal.nativeElement.click();
      this._helperService.showToast(response.message, this.TOAST_STATUS_SUCCESS);
      this.getLopSummaryResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
    }, (error) => {
      this._helperService.showToast(error.message, this.TOAST_STATUS_ERROR);
    })
  }


  // Logic to set the values
  selectLeaveType(leaveTypeResponse : LeaveTypeResponse){
    this.lopAdjustmentRequest.leaveType = leaveTypeResponse.name;
  }

  dateRange : Date[] = [];
  selectDateForLopAdjustmentRequest(dates: Date[]): void {
    if (dates && dates.length === 2) {
      this.dateRange[0] = dates[0];
      this.dateRange[1] = dates[1];
    }

    this.lopAdjustmentRequest.startDate = this._helperService.formatDateToYYYYMMDD(dates[0]);
    this.lopAdjustmentRequest.endDate = this._helperService.formatDateToYYYYMMDD(dates[1]);
  }


  // Logic to open lop adjustment modal
  openLopAdjustmentRequestModal(uuid : string, lopDaysToBeAdjusted : number){
    this.getLeaveTypeResponseListByUserUuidMethodCall(uuid);
    this.lopAdjustmentRequest.userUuid = uuid;
    this.lopAdjustmentRequest.lopDaysToBeAdjusted = lopDaysToBeAdjusted;
  }

  // Logic to close lop adjustment modal
  @ViewChild("closeLopAdjustmentRequestModal") closeLopAdjustmentRequestModal !: ElementRef;

  selectLopAdjustmentCount(count : number){
    // console.log(count);
    this.lopAdjustmentRequest.lopDaysToBeAdjusted = count;
  }

  

  // Fetching user's leave for payroll

  payrollLeaveResponseList : PayrollLeaveResponse[] = [];
  // getPayrollLeaveResponseMethodCall(){
  //   this.preRuleForShimmersAndErrorPlaceholdersForPayrollLeaveResponse();
  //   this._payrollService.getPayrollLeaveResponse(
  //     this.startDate,
  //     this.endDate,
  //     this.itemPerPage,
  //     this.pageNumber,
  //     this.search,
  //     this.searchBy
  //   ).subscribe((response) => {
  //     if(this._helperService.isListOfObjectNullOrUndefined(response)){
  //       this.dataNotFoundPlaceholderForPayrollLeaveResponse = true;
  //     } else{
  //       this.payrollLeaveResponseList = response.listOfObject;
  //       this.total = response.totalItems;
  //       this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
  //     }

  //     this.isShimmerForPayrollLeaveResponse = false;
  //   }, (error) => {
  //     this.networkConnectionErrorPlaceHolderForPayrollLeaveResponse = true;
  //     this.isShimmerForPayrollLeaveResponse = false;
  //   })
  // }

  userUuid!: string
  // @ViewChild('leaveLogsModalButton') leaveLogsModalButton !: ElementRef;
  // /userLeaveLogs : UserInfoForPayrollReflection = new UserInfoForPayrollReflection();
  // userLeaveLogs : any;
  // getPayrollLeaveLogResponseMethodCall(userUuid : string){
  //   this.userUuid = userUuid;
  //   this._payrollService.getPayrollLeaveLogsResponse(
  //     userUuid,
  //     this.startDate,
  //     this.endDate
  //   ).subscribe((response) => {
  //     this.userLeaveLogs = response.listOfObject;
  //     // console.log(response.listOfObject);
      
  //   }, (error) => {
      
  //   })
  // }

  

  selectedRole : Role = new Role();
  roles : Role[] = [];




  // #######################################################################
  // Step 3: Salary changes, Bonus & Overtime
  salaryChangeResponseList : SalaryChangeResponse[] = [];
  getSalaryChangeResponseListByOrganizationIdMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeResponse();
    this.dataService.getSalaryChangeResponseListByOrganizationId(this.startDate, this.endDate, this.itemPerPage, this.pageNumber).subscribe((response) => {

      if(response.object==null || response.object.length == 0){
        this.dataNotFoundPlaceholderForSalaryChangeResponse = true;
      } else{
        this.salaryChangeResponseList = response.object;
        this.total = response.totalItems;
        this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
      }

      this.isShimmerForSalaryChangeResponse = false;
    }, (error) => {
      this.isShimmerForSalaryChangeResponse = false;
      this.networkConnectionErrorPlaceHolderForSalaryChangeResponse = true;
    })
  }


  salaryChangeBonusResponseList : SalaryChangeBonusResponse[] = [];
  getSalaryChangeBonusResponseListByOrganizationIdMethodCall(debounceTime: number = 300) {
    this.salaryChangeBonusResponseList = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeBonusResponse();
      this.dataService
        .getSalaryChangeBonusResponseListByOrganizationId(
          this.startDate,
          this.endDate,
          this.itemPerPage,
          this.pageNumber,
          this.search,
          this.searchBy
        )
        .subscribe(
          (response) => {
            if (this._helperService.isListOfObjectNullOrUndefined(response)) {
              this.dataNotFoundPlaceholderForSalaryChangeBonusResponse = true;
            } else {
              this.salaryChangeBonusResponseList = response.listOfObject.map((salaryChangeBonus: SalaryChangeBonusResponse) => {
                // Apply cached selection if available
                if (this.selectedPayActionCache[salaryChangeBonus.uuid]) {
                  salaryChangeBonus.payActionType = this.selectedPayActionCache[salaryChangeBonus.uuid];
                  salaryChangeBonus.payActionTypeId = this.selectedPayActionCache[salaryChangeBonus.uuid].id;
                } else {
                  // Set initial selection based on payActionTypeId
                  const selectedPayActionType = this.payActionTypeList.find(
                    (payActionType) => payActionType.id === salaryChangeBonus.payActionTypeId
                  );
                  if (selectedPayActionType) {
                    salaryChangeBonus.payActionType = selectedPayActionType;
                  }
                }

                // Apply cached comment if available
                if (this.commentCache[salaryChangeBonus.uuid]) {
                  salaryChangeBonus.comment = this.commentCache[salaryChangeBonus.uuid];
                }

                return salaryChangeBonus;
              });
              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            }
            this.isShimmerForSalaryChangeBonusResponse = false;
          },
          (error) => {
            this.isShimmerForSalaryChangeBonusResponse = false;
            this.networkConnectionErrorPlaceHolderForSalaryChangeBonusResponse = true;
          }
        );
    }, debounceTime);
  }
  salaryChangeOvertimeResponseList : SalaryChangeOvertimeResponse[] = [];
  getSalaryChangeOvertimeResponseListByOrganizationIdMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeOvertimeResponse();
    this.dataService.getSalaryChangeOvertimeResponseListByOrganizationId(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe((response) => {

      if(this._helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = true;
      } else{
        this.salaryChangeOvertimeResponseList = response.listOfObject;
        this.total = response.totalItems;
        this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
      }
      this.isShimmerForSalaryChangeOvertimeResponse = false;
    }, (error) => {
      this.isShimmerForSalaryChangeOvertimeResponse = false;
      this.networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = true;
    })
  }


  registerSalaryChangesAndBonusAndOvertimeMethodCall(CURRENT_TAB_IN_SALARY_CHANGE : number){

    if(CURRENT_TAB_IN_SALARY_CHANGE == this.SALARY_CHANGE){
      this.registerSalaryChangeListByOrganizationIdMethodCall();
    }

    if(CURRENT_TAB_IN_SALARY_CHANGE == this.BONUS){
      this.registerSalaryChangeBonusListByOrganizationIdMethodCall();
    }

    if(CURRENT_TAB_IN_SALARY_CHANGE == this.OVERTIME){
      this.registerSalaryChangeOvertimeListByOrganizationIdMethodCall();
    }
  }

  registerSalaryChangeListByOrganizationIdMethodCall(){
    this._helperService.showToast("Salary changes details saved successfully.", this.TOAST_STATUS_SUCCESS);
    this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.BONUS).subscribe((response)=>{
      this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
      setTimeout(() => {
        // this.navigateToTab('step8-tab');
      }, 100)
    }, ((error) => {
      console.log(error);
    }))  
  }


  salaryChangeBonusRequestList : SalaryChangeBonusRequest[] = [];
  registerSalaryChangeBonusListByOrganizationIdMethodCall(){
    debugger
    this.salaryChangeBonusRequestList = [];
    
    this.salaryChangeBonusResponseList.forEach((item) => {
      let salaryChangeBonusRequest = new SalaryChangeBonusRequest(item.uuid,item.payActionType.id, item.comment);

      this.salaryChangeBonusRequestList.push(salaryChangeBonusRequest);
    })

    this.dataService.registerSalaryChangeBonusListByOrganizationId(this.salaryChangeBonusRequestList).subscribe((response) => {
      this.selectedPayActionCache={};
      this.commentCache = {};
      this._helperService.showToast(response.message, this.TOAST_STATUS_SUCCESS);
      this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.OVERTIME).subscribe((response)=>{
        this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
        setTimeout(() => {
          // this.navigateToTab('step9-tab');
        }, 100)
      }, ((error) => {
        console.log(error);
      }))  
    }, (error) => {
      this._helperService.showToast("Error while registering the request!", this.TOAST_STATUS_ERROR);
    })
  }


  salaryChangeOvertimeRequestList : SalaryChangeOvertimeRequest[] = [];
  registerSalaryChangeOvertimeListByOrganizationIdMethodCall(){
    this.salaryChangeOvertimeRequestList = [];
    
    this.salaryChangeOvertimeResponseList.forEach((item) => {
      let salaryChangeOvertimeRequest = new SalaryChangeOvertimeRequest(item.uuid,item.payActionTypeId);

      this.salaryChangeOvertimeRequestList.push(salaryChangeOvertimeRequest);
    })

    this.dataService.registerSalaryChangeOvertimeListByOrganizationId(this.salaryChangeOvertimeRequestList).subscribe((response) => {
      this.selectedPayActionCache={};
      this.commentCache = {};
      this._helperService.showToast(response.message, this.TOAST_STATUS_SUCCESS);
      this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.EPF).subscribe((response)=>{
        this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
        setTimeout(() => {
          // this.salaryChangeModal.nativeElement.click();
        }, 100)
      }, ((error) => {
        console.log(error);
      }))  
    }, (error) => {
      this._helperService.showToast("Error while registering the request!", this.TOAST_STATUS_ERROR);
      // To be commented
      // this.dataService.updatePayrollProcessStep(this.startDate, this.endDate, this.EPF).subscribe((response)=>{
      //   this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
      //   setTimeout(() => {
      //     this.salaryChangeModal.nativeElement.click();
      //   }, 100)
      // }, ((error) => {
      //   console.log(error);
      // }))   
    })
  }



  // ################################################
  // Step 4: EPF, ESI & TDS

  
  updateFinalAmount(response: any) {
    if (response.amountToBeAdjusted != null) {
      response.finalAmount = response.amountToBeAdjusted;
    } else {
      response.finalAmount = response.amount;
    }

    // Update the cache
    this.amountCache[response.uuid] = response.amountToBeAdjusted;

    // Update the list if necessary
    // const index = this.epfDetailsResponseList.findIndex(detail => detail.uuid == response.uuid);
    // if (index != -1) {
    //   this.epfDetailsResponseList[index] = { ...response };
    // }
  }


  amountCache: { [uuid: string]: number } = {};
  epfDetailsResponseList : EpfDetailsResponse[] = [];
  getEpfDetailsResponseListByOrganizationIdMethodCall(debounceTime: number = 300) {
    this.epfDetailsResponseList = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForEpfDetailsResponse();
      this.dataService
        .getEpfDetailsResponseListByOrganizationId(
          this.startDate,
          this.endDate,
          this.itemPerPage,
          this.pageNumber,
          this.search,
          this.searchBy
        )
        .subscribe(
          (response) => {
            if (this._helperService.isListOfObjectNullOrUndefined(response)) {
              this.dataNotFoundPlaceholderForEpfDetailsResponse = true;
            } else {
              this.epfDetailsResponseList = response.listOfObject.map((item: EpfDetailsResponse) => {
                // Apply cached amount if available
                if (this.amountCache[item.uuid]) {
                  item.amountToBeAdjusted = this.amountCache[item.uuid];
                }
                item.finalAmount = item.amountToBeAdjusted || item.amount;
                return item;
              });

              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            }
            this.isShimmerForEpfDetailsResponse = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForEpfDetailsResponse = true;
            this.isShimmerForEpfDetailsResponse = false;
          }
        );
    }, debounceTime);
  }

  
  esiDetailsResponseList : EsiDetailsResponse[] = [];
  getEsiDetailsResponseListByOrganizationIdMethodCall(debounceTime: number = 300) {
    this.esiDetailsResponseList = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForEsiDetailsResponse();
      this.dataService
        .getEsiDetailsResponseListByOrganizationId(
          this.startDate,
          this.endDate,
          this.itemPerPage,
          this.pageNumber,
          this.search,
          this.searchBy
        )
        .subscribe(
          (response) => {
            if (this._helperService.isListOfObjectNullOrUndefined(response)) {
              this.dataNotFoundPlaceholderForEsiDetailsResponse = true;
            } else {
              this.esiDetailsResponseList = response.listOfObject.map((item: EsiDetailsResponse) => {
                // Apply cached amount if available
                if (this.amountCache[item.uuid]) {
                  item.amountToBeAdjusted = this.amountCache[item.uuid];
                }
                item.finalAmount = item.amountToBeAdjusted || item.amount;
                return item;
              });

              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            }
            this.isShimmerForEsiDetailsResponse = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForEsiDetailsResponse = true;
            this.isShimmerForEsiDetailsResponse = false;
          }
        );
    }, debounceTime);
  }

  tdsDetailsResponseList : TdsDetailsResponse[] = [];
  getTdsDetailsResponseListByOrganizationIdMethodCall(debounceTime: number = 300) {
    this.tdsDetailsResponseList = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForTdsDetailsResponse();
      this.dataService
        .getTdsDetailsResponseListByOrganizationId(
          this.startDate,
          this.endDate,
          this.itemPerPage,
          this.pageNumber,
          this.search,
          this.searchBy
        )
        .subscribe(
          (response) => {
            if (this._helperService.isListOfObjectNullOrUndefined(response)) {
              this.dataNotFoundPlaceholderForTdsDetailsResponse = true;
            } else {
              this.tdsDetailsResponseList = response.listOfObject.map((item: TdsDetailsResponse) => {
                // Apply cached amount if available
                if (this.amountCache[item.uuid]) {
                  item.amountToBeAdjusted = this.amountCache[item.uuid];
                }
                item.finalAmount = item.amountToBeAdjusted || item.amount;
                return item;
              });

              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            }
            this.isShimmerForTdsDetailsResponse = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForTdsDetailsResponse = true;
            this.isShimmerForTdsDetailsResponse = false;
          }
        );
    }, debounceTime);
  }


  modifiedValuesMap = new Map<number, any>();



  registerEpfEsiTdsMethodCall(CURRENT_TAB_IN_EPF_ESI_TDS : number){

    if(CURRENT_TAB_IN_EPF_ESI_TDS == this.EPF){
      // console.log("EPF_REGISTRATION_STARTED...");
      this.registerEpfDetailsListByOrganizationIdMethodCall();
    }

    if(CURRENT_TAB_IN_EPF_ESI_TDS == this.ESI){
      // console.log("ESI_REGISTRATION_STARTED...");
      this.registerEsiDetailsListByOrganizationIdMethodCall();
    }

    if(CURRENT_TAB_IN_EPF_ESI_TDS == this.TDS){
      // console.log("TDS_REGISTRATION_STARTED...");
      this.registerTdsDetailsListByOrganizationIdMethodCall();
    }
  }


  epfDetailsRequestList : EpfDetailsRequest[] = [];
  registerEpfDetailsListByOrganizationIdMethodCall(){
    this.epfDetailsRequestList = [];

    this.epfDetailsResponseList.forEach((item) => {
      let epfDetailsRequest = new EpfDetailsRequest(item.uuid, item.finalAmount);
      this.epfDetailsRequestList.push(epfDetailsRequest);
    })

    this.dataService.registerEpfDetailsListByOrganizationId(this.startDate, this.endDate, this.epfDetailsRequestList).subscribe((response) => {
      this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
      this.amountCache = {};
      this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.ESI).subscribe((response)=>{
        this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
        setTimeout(() => {
          // this.navigateToTab('step11-tab');
        }, 100)
      }, ((error) => {
        console.log(error);
      }))   
    }, (error) => {
      this._helperService.showToast("Error while adjusting the epf details!", Key.TOAST_STATUS_ERROR);
    })
  }


  esiDetailsRequestList :EsiDetailsRequest[] = [];
  registerEsiDetailsListByOrganizationIdMethodCall(){
    this.esiDetailsRequestList = [];

    this.esiDetailsResponseList.forEach((item) => {
      let esiDetailsRequest = new EsiDetailsRequest(item.uuid, item.finalAmount);
      this.esiDetailsRequestList.push(esiDetailsRequest);
    })

    this.dataService.registerEsiDetailsListByOrganizationId(this.startDate, this.endDate, this.esiDetailsRequestList).subscribe((response) => {
      this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
      this.amountCache = {};
      this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.TDS).subscribe((response)=>{
        this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
        setTimeout(() => {
          // this.navigateToTab('step12-tab');
        }, 100)
      }, ((error) => {
        console.log(error);
      }))   
    }, (error) => {
      this._helperService.showToast("Error while adjusting the esi details!", Key.TOAST_STATUS_ERROR);
    })
  }


  tdsDetailsRequestList :TdsDetailsRequest[] = [];
  registerTdsDetailsListByOrganizationIdMethodCall(){
    this.tdsDetailsRequestList = [];

    this.tdsDetailsResponseList.forEach((item) => {
      let tdsDetailsRequest = new TdsDetailsRequest(item.uuid, item.finalAmount);
      this.tdsDetailsRequestList.push(tdsDetailsRequest);
    })
    
    this.dataService.registerTdsDetailsListByOrganizationId(this.startDate, this.endDate, this.tdsDetailsRequestList).subscribe((response) => {
      this.amountCache = {};
      this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
      this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, Key.PAYROLL_STEP_COMPLETED).subscribe((response)=>{
        this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
        setTimeout(() => {
          // this.epfEsiTdsModal.nativeElement.click();
        }, 100)
      }, ((error) => {
        console.log(error);
      }))   
    }, (error) => {
      this._helperService.showToast("Error while adjusting the tds details!", Key.TOAST_STATUS_ERROR);
    })
  }

  


  

  
  registerPayrollLeave(){
    // this.lopSummaryTab();
    this._helperService.showToast('Leave details updated successfully.', Key.TOAST_STATUS_SUCCESS);

    this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.LOP_SUMMARY).subscribe((response)=>{
      this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
      setTimeout(() => {
        // this.navigateToTab('step5-tab');
      }, 100)
    }, ((error) => {
      console.log(error);
    }))    
    // this.step5Tab.nativeElement.click();  
    
  }


  
  

  // ########################--Validation--##############################
 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


  RUN_PAYROLL_LOADER : boolean = false;
  generateSalaryReportMethodCall(){
    this.RUN_PAYROLL_LOADER = true;
    this.dataService.generateSalaryReport(this.startDate, this.endDate).subscribe((response) => {
        this.getOrganizationIndividualMonthSalaryDataMethodCall();
        const downloadLink = document.createElement('a');
        downloadLink.href = response.object.reportExcelLink;
        downloadLink.download = 'Report_JULY_1720181370937.xlsx';
        downloadLink.click();
        // console.log(response);
        this.RUN_PAYROLL_LOADER = false;
        this._helperService.showToast('Payroll generated successfully.', Key.TOAST_STATUS_SUCCESS);
        this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, Key.PAYROLL_PORCESSED).subscribe((response)=>{
          this.getPayrollProcessStepByOrganizationIdAndStartDateAndEndDateMethodCall();
        }, ((error) => {
          console.log(error);
        }))  
      },(error) => {
        this._helperService.showToast('Error while generating the Payroll!', Key.TOAST_STATUS_ERROR);
        this.RUN_PAYROLL_LOADER = false;
      });
  } 



  getData(){
    this.payrollToggleView = false;
    this.showLeaveComponent = false;
    this.showEmployeeComponent = false;
    this.showEariningComponent = false;
    this.showSalaryComponent = false;
  }

}






