import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { clear } from 'console';
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
import { SalaryChangeOvertimeResponse } from 'src/app/models/salary-change-overtime-response';
import { SalaryChangeResponse } from 'src/app/models/salary-change-response';
import { ShiftTypeResponse } from 'src/app/models/shift-type-response';
import { TdsDetailsRequest } from 'src/app/models/tds-details-request';
import { TdsDetailsResponse } from 'src/app/models/tds-details-response';
import { UserExitResponse } from 'src/app/models/user-exit-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-payroll-dashboard',
  templateUrl: './payroll-dashboard.component.html',
  styleUrls: ['./payroll-dashboard.component.css'],
})
export class PayrollDashboardComponent implements OnInit {
  itemPerPage: number = 2;
  pageNumber: number = 1;
  lastPageNumber: number = 0;
  sort: string = 'asc';
  sortBy: string = 'id';
  search: string = '';
  searchBy: string = 'name';
  total: number = 0;

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


  @ViewChild('step1Tab', { static: false }) step1Tab!: ElementRef;
  @ViewChild('step2Tab', { static: false }) step2Tab!: ElementRef;
  @ViewChild('step3Tab', { static: false }) step3Tab!: ElementRef;
  @ViewChild('step4Tab', { static: false }) step4Tab!: ElementRef;
  @ViewChild('step5Tab', { static: false }) step5Tab!: ElementRef;
  @ViewChild('step6Tab', { static: false }) step6Tab!: ElementRef;
  @ViewChild('step7Tab', { static: false }) step7Tab!: ElementRef;
  @ViewChild('step8Tab', { static: false }) step8Tab!: ElementRef;
  @ViewChild('step9Tab', { static: false }) step9Tab!: ElementRef;
  @ViewChild('step10Tab', { static: false }) step10Tab!: ElementRef;
  @ViewChild('step11Tab', { static: false }) step11Tab!: ElementRef;
  @ViewChild('step12Tab', { static: false }) step12Tab!: ElementRef;

  navigateToTab(tabId: string): void {
    switch (tabId) {
      case 'step1-tab':
        this.step1Tab.nativeElement.click();
        break;
      case 'step2-tab':
        this.step2Tab.nativeElement.click();
        break;
      case 'step3-tab':
        this.step3Tab.nativeElement.click();
        break;
      case 'step4-tab':
        this.step4Tab.nativeElement.click();
        break;
      case 'step5-tab':
        this.step5Tab.nativeElement.click();
        break;
      case 'step6-tab':
        this.step6Tab.nativeElement.click();
        break;
      case 'step7-tab':
        this.step7Tab.nativeElement.click();
        break;
      case 'step8-tab':
        this.step8Tab.nativeElement.click();
        break;
      case 'step9-tab':
        this.step9Tab.nativeElement.click();
        break;
      case 'step10-tab':
        this.step10Tab.nativeElement.click();
        break;
      case 'step11-tab':
        this.step11Tab.nativeElement.click();
        break;
      case 'step12-tab':
        this.step12Tab.nativeElement.click();
        break;
      default:
        console.error(`Tab with id ${tabId} not found`);
        return;
    }
  }

  // ----------------------------------------------------------
  //Exmployee changes tab selection
  newJoineeTab() {
    this.CURRENT_TAB = this.NEW_JOINEE;
    this.CURRENT_TAB_IN_EMPLOYEE_CHANGE = this.NEW_JOINEE;
    this.resetCriteriaFilter();
    this.getNewJoineeByOrganizationIdMethodCall();
  }

  userExitTab() {
    this.CURRENT_TAB = this.USER_EXIT;
    this.CURRENT_TAB_IN_EMPLOYEE_CHANGE = this.USER_EXIT;
    this.resetCriteriaFilter();
    this.getUserExitByOrganizationIdMethodCall();
  }

  finalSettlementTab() {
    this.CURRENT_TAB = this.FINAL_SETTLEMENT;
    this.CURRENT_TAB_IN_EMPLOYEE_CHANGE = this.FINAL_SETTLEMENT;
    this.resetCriteriaFilter();
    this.getFinalSettlementByOrganizationIdMethodCall();
  }

  // ----------------------------------------------------------
  // Attendance, Leaves and Present Days tab selection
  leavesTab(){
    this.CURRENT_TAB = this.LEAVES;
    this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = this.LEAVES;
    this.resetCriteriaFilter();
    this.getPayrollLeaveLogResponseMethodCall();
  }

  lopSummaryTab(){
    this.CURRENT_TAB = this.LOP_SUMMARY;
    this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = this.LOP_SUMMARY;
    this.resetCriteriaFilter();
    this.getLopSummaryResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
  }

  lopReversalTab(){
    this.CURRENT_TAB = this.LOP_REVERSAL;
    this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = this.LOP_REVERSAL;
    this.resetCriteriaFilter();
    this.getLopReversalResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
  }


  // ----------------------------------------------------------
  // Salary Changes, Bonus and Overtime tab selection
  salaryChangeTab(){
    this.CURRENT_TAB = this.SALARY_CHANGE;
    this.CURRENT_TAB_IN_SALARY_CHANGE = this.SALARY_CHANGE;
    this.resetCriteriaFilter();
    this.getSalaryChangeResponseListByOrganizationIdMethodCall();
  }

  bonusTab(){
    this.CURRENT_TAB = this.BONUS;
    this.CURRENT_TAB_IN_SALARY_CHANGE = this.BONUS;
    this.resetCriteriaFilter();
    this.getSalaryChangeBonusResponseListByOrganizationIdMethodCall();
  }

  overtimeTab(){
    this.CURRENT_TAB = this.OVERTIME;
    this.CURRENT_TAB_IN_SALARY_CHANGE = this.OVERTIME;
    this.resetCriteriaFilter();
  }


  // -----------------------------------------
  // EPF, ESI & TDS
  epfTab(){
    this.CURRENT_TAB = this.EPF;
    this.CURRENT_TAB_IN_EPF_ESI_TDS = this.EPF;
    this.resetCriteriaFilter();
    this.getEpfDetailsResponseListByOrganizationIdMethodCall();
  }

  esiTab(){
    this.CURRENT_TAB = this.ESI;
    this.CURRENT_TAB_IN_EPF_ESI_TDS = this.ESI;
    this.resetCriteriaFilter();
    this.getEsiDetailsResponseListByOrganizationIdMethodCall();
  }

  tdsTab(){
    this.CURRENT_TAB = this.TDS;
    this.CURRENT_TAB_IN_EPF_ESI_TDS = this.TDS;
    this.resetCriteriaFilter();
    this.getTdsDetailsResponseListByOrganizationIdMethodCall();
  }

  // Employee Chages tab-estate
  employeeChangesBackTab(){
    if(this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.FINAL_SETTLEMENT){
      this.navigateToTab('step2-tab'); // Navigating to the user exit tab
    } else if(this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.USER_EXIT){
      this.navigateToTab('step1-tab'); // Navigating to the new joinee tab
    }
  }

  // Attendance & Leave tab-estate
  attendanceAndLeaveBackTab(){
    if(this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LOP_REVERSAL){
      this.navigateToTab('step5-tab');
    } else if(this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LOP_SUMMARY){
      this.navigateToTab('step4-tab');
    }
  }

  // Salary changes, Bonus & Overtime tab-estate
  salaryChangesBackTab(){
    if(this.CURRENT_TAB_IN_SALARY_CHANGE == this.OVERTIME){
      this.navigateToTab('step8-tab');
    } else if(this.CURRENT_TAB_IN_SALARY_CHANGE == this.BONUS){
      this.navigateToTab('step7-tab');
    }
  }

  epfEsiTdsBackTab(){
    if(this.CURRENT_TAB_IN_EPF_ESI_TDS == this.TDS){
      this.navigateToTab('step11-tab');
    } else if(this.CURRENT_TAB_IN_EPF_ESI_TDS == this.ESI){
      this.navigateToTab('step10-tab');
    }
  }

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

  constructor(
    private dataService: DataService,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.currentMonthResponse = new MonthResponse(
      new Date().getMonth() + 1,
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      new Date().toLocaleString('default', { month: 'short' }),
      new Date().getFullYear(),
      'Current',
      false
    );



    // this.getUserLeaveReq();

    this.selectedMonth = this.currentMonthResponse.month;
    this.selectedYear = this.currentMonthResponse.year;

    this.getFirstAndLastDateOfMonth(new Date());
    this.countPayrollDashboardEmployeeByOrganizationIdMethodCall();
    this.getPayActionTypeListMethodCall();

    this.getOrganizationRegistrationDateMethodCall();
    this.getMonthResponseList(this.selectedDate);
    this.getOrganizationIndividualMonthSalaryDataMethodCall(
      this.currentMonthResponse
    );

  }

  // Year calendar
  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';

  onYearChange(year: Date): void {
    this.selectedDate = year;
    this.getMonthResponseList(this.selectedDate);

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
      this.getOrganizationIndividualMonthSalaryDataMethodCall(
        enabledMonthResponse
      );
    }
  }

  // async onYearChange(year: Date): Promise<void> {
  //   console.log('Month is getting selected!');
  //   this.selectedDate = year;

  //   // Fetching the month responses
  //   const monthResponses = await this.getMonthResponseList(this.selectedDate);
  //   console.log(monthResponses);

  //   // Find the first monthResponse with disable as false
  //   const enabledMonthResponse = monthResponses.find(monthResponse => !monthResponse.disable);

  //   if (enabledMonthResponse) {
  //       // Call the method with the found monthResponse
  //       this.getOrganizationIndividualMonthSalaryDataMethodCall(enabledMonthResponse);
  //   }
  // }

  getFirstAndLastDateOfMonth(selectedDate: Date) {
    this.startDate = this.helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
    this.endDate = this.helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    );
  }

  disableYears = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const organizationRegistrationYear = new Date(
      this.organizationRegistrationDate
    ).getFullYear();
    const organizationRegistrationMonth = new Date(
      this.organizationRegistrationDate
    ).getMonth();

    // Disable if the year is before the organization registration year or if the year is after the organization registration year.
    if (dateYear < organizationRegistrationYear || dateYear > currentYear) {
      return true;
    }

    return false;
  };

  disableMonths = (): boolean => {
    return true;
  };

  // Fetching organization registration date.
  organizationRegistrationDate: string = '';
  getOrganizationRegistrationDateMethodCall() {
    debugger;
    this.dataService.getOrganizationRegistrationDate().subscribe(
      (response) => {
        this.organizationRegistrationDate = response;
      },
      (error) => {
      }
    );
  }

  // Getting month list
  monthResponseList: MonthResponse[] = [];
  async getMonthResponseList(date: Date) {
    this.monthResponseList = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const organizationRegistrationYear = new Date(
      this.organizationRegistrationDate
    ).getFullYear();
    const organizationRegistrationMonth = new Date(
      this.organizationRegistrationDate
    ).getMonth();

    for (let i = 0; i < 12; i++) {
      // Create a new Date object for each month.
      const monthDate = new Date(date.getFullYear(), i);

      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      const status =
        monthDate.getFullYear() < organizationRegistrationYear ||
        (monthDate.getFullYear() === organizationRegistrationYear &&
          i < organizationRegistrationMonth)
          ? '-'
          : monthDate.getFullYear() < currentYear ||
            (monthDate.getFullYear() === currentYear && i < currentMonth)
          ? 'Completed'
          : monthDate.getFullYear() === currentYear && i === currentMonth
          ? 'Current'
          : 'Upcoming';

      // Disabling the future months and the months before organization registration.
      const disable =
        monthDate.getFullYear() < organizationRegistrationYear ||
        (monthDate.getFullYear() === organizationRegistrationYear &&
          i < organizationRegistrationMonth) ||
        monthDate.getFullYear() > currentYear ||
        (monthDate.getFullYear() === currentYear && i > currentMonth);

      // Format the first day of the month as "DD MMM".
      const firstDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1
      );

      // Format the last day of the month as "DD MMM".
      const lastDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0
      );

      this.monthResponseList.push(
        new MonthResponse(
          i + 1,
          firstDate,
          lastDate,
          monthName,
          monthDate.getFullYear(),
          status,
          disable
        )
      );
    }
  }

  //   async getMonthResponseList(date: Date): Promise<MonthResponse[]> {
  //     let monthResponseList: MonthResponse[] = [];
  //     const currentMonth = new Date().getMonth();
  //     const currentYear = new Date().getFullYear();
  //     const organizationRegistrationYear = new Date(this.organizationRegistrationDate).getFullYear();
  //     const organizationRegistrationMonth = new Date(this.organizationRegistrationDate).getMonth();

  //     for (let i = 0; i < 12; i++) {
  //         // Create a new Date object for each month.
  //         const monthDate = new Date(date.getFullYear(), i);
  //         const monthName = monthDate.toLocaleString('default', { month: 'short' });
  //         const status = (monthDate.getFullYear() < organizationRegistrationYear || (monthDate.getFullYear() === organizationRegistrationYear && i < organizationRegistrationMonth)) ? '-' : monthDate.getFullYear() < currentYear || (monthDate.getFullYear() === currentYear && i < currentMonth) ? 'Completed' : (monthDate.getFullYear() === currentYear && i === currentMonth) ? 'Current' : 'Upcoming';
  //         const disable = (monthDate.getFullYear() < organizationRegistrationYear || (monthDate.getFullYear() === organizationRegistrationYear && i < organizationRegistrationMonth)) || (monthDate.getFullYear() > currentYear || (monthDate.getFullYear() === currentYear && i > currentMonth));
  //         const firstDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  //         const lastDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

  //         monthResponseList.push(new MonthResponse(i + 1, firstDate, lastDate, monthName, monthDate.getFullYear(), status, disable));
  //     }

  //     return monthResponseList;
  // }

  // This is current month response, default value to fetch the data.
  currentMonthResponse: MonthResponse = new MonthResponse(
    0,
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    '',
    0,
    '',
    false
  );

  selectedMonth: string = '';
  selectedYear: number = 0;
  // Fetching organization individual month salary data.
  organizationMonthWiseSalaryData: OrganizationMonthWiseSalaryData =
    new OrganizationMonthWiseSalaryData();
  getOrganizationIndividualMonthSalaryDataMethodCall(
    monthResponse: MonthResponse
  ) {
    this.selectedMonth = monthResponse.month;
    this.selectedYear = monthResponse.year;

    this.startDate = this.helperService.formatDateToYYYYMMDD(
      monthResponse.firstDate
    );
    this.endDate = this.helperService.formatDateToYYYYMMDD(
      monthResponse.lastDate
    );

    this.dataService
      .getOrganizationIndividualMonthSalaryData(
        this.helperService.formatDateToYYYYMMDD(monthResponse.firstDate),
        this.helperService.formatDateToYYYYMMDD(monthResponse.lastDate)
      )
      .subscribe(
        (response) => {
          if (
            response == undefined ||
            response == null ||
            response.object == undefined ||
            response.object == null ||
            response.id == 0
          ) {
            this.dataNotFoundPlaceholder = true;
          } else {
            this.organizationMonthWiseSalaryData = response.object;
            this.countPayrollDashboardEmployeeByOrganizationIdMethodCall();
          }
          this.isShimmer = false;
        },
        (error) => {
          this.isShimmer = false;
          this.networkConnectionErrorPlaceHolder = true;
        }
      );
  }

  //Fetching the employees count with new joinee count and user exit count
  payrollDashboardEmployeeCountResponse: PayrollDashboardEmployeeCountResponse =
    new PayrollDashboardEmployeeCountResponse();
  countPayrollDashboardEmployeeByOrganizationIdMethodCall() {
    this.dataService
      .countPayrollDashboardEmployeeByOrganizationId(
        this.startDate,
        this.endDate
      )
      .subscribe(
        (response) => {
          this.payrollDashboardEmployeeCountResponse = response.object;
        },
        (error) => {}
      );
  }



  //Routing to the user profile section
  routeToUserProfile(uuid : string){
    this.helperService.routeToUserProfile(uuid);
  }

  //Fetching the new joinee data
  newJoineeResponseList: NewJoineeResponse[] = [];
  debounceTimer: any;
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
          this.sort,
          this.sortBy,
          this.search,
          this.searchBy,
          this.startDate,
          this.endDate
        )
        .subscribe(
          (response) => {
            if (this.helperService.isListOfObjectNullOrUndefined(response)) {
              this.dataNotFoundPlaceholderForNewJoinee = true;
            } else {
              this.newJoineeResponseList = response.listOfObject;
              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
              // console.log(this.newJoineeResponseList);
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

  //Fetching the pay action type list
  payActionTypeList : PayActionType[] = [];
  getPayActionTypeListMethodCall(){
    this.dataService.getPayActionTypeList().subscribe((response) => {
      if(this.helperService.isListOfObjectNullOrUndefined(response)){

      } else{
        this.payActionTypeList = response.listOfObject;
        // console.log(this.payActionTypeList);
      }
    }, (error) => {

    })
  }

  //Fetching the notice period list
  noticePeriodList : NoticePeriod[] = [];
  getNoticePeriodListMethodCall(){
    this.dataService.getNoticePeriodList().subscribe((response) => {
      if(this.helperService.isListOfObjectNullOrUndefined(response)){

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
    if(response != undefined && response != null){
      response.payActionType = payActionType;
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
    this.helperService.ignoreKeysDuringSearch(event);
    this.resetCriteriaFilterMicro();
    this.getNewJoineeByOrganizationIdMethodCall();
  }

  searchUserExit(event: Event) {
    this.helperService.ignoreKeysDuringSearch(event);
    this.resetCriteriaFilterMicro();
    this.getUserExitByOrganizationIdMethodCall();
  }

  searchUsers(event: Event, step: number) {
    this.helperService.ignoreKeysDuringSearch(event);
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
    this.itemPerPage = 2;
    this.pageNumber = 1;
    this.lastPageNumber = 0;
    this.total = 0;
    this.sort = 'asc';
    this.sortBy = 'id';
    this.search = '';
    this.searchBy = 'name';
  }

  resetCriteriaFilterMicro() {
    this.itemPerPage = 2;
    this.pageNumber = 1;
    this.lastPageNumber = 0;
    this.total = 0;
  }

  //Fetching the user exit data
  userExitResponseList: UserExitResponse[] = [];
  getUserExitByOrganizationIdMethodCall() {
    this.userExitResponseList = [];
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
          if (this.helperService.isListOfObjectNullOrUndefined(response)) {
            this.dataNotFoundPlaceholderForUserExit = true;
          } else {
            this.userExitResponseList = response.listOfObject;
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
  }

  //Fetching the final settlement data
  finalSettlementResponseList: FinalSettlementResponse[] = [];
  getFinalSettlementByOrganizationIdMethodCall() {
    this.finalSettlementResponseList = [];
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
          if (this.helperService.isListOfObjectNullOrUndefined(response)) {
            this.dataNotFoundPlaceholderForFinalSettlement = true;
          } else {
            this.finalSettlementResponseList = response.listOfObject;
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
  }

  //Registering new joinee and user exit data to employee month wise salary data
  newJoineeAndUserExitRequestList: NewJoineeAndUserExitRequest[] = [];
  registerNewJoineeAndUserExitMethodCall() {
    if (this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.NEW_JOINEE) {
      this.newJoineeAndUserExitRequestList = [];


        this.newJoineeResponseList.forEach((item) => {
          let newJoineeAndUserExitRequest = new NewJoineeAndUserExitRequest(item.uuid, item.payActionType.id, item.comment);

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
        console.log(this.CURRENT_TAB_IN_EMPLOYEE_CHANGE);
        this.helperService.showToast(response.message, this.TOAST_STATUS_SUCCESS);
        if (this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.NEW_JOINEE) {
          this.navigateToTab('step2-tab'); //Navigating to the user exit tab
        } else if (this.CURRENT_TAB_IN_EMPLOYEE_CHANGE == this.USER_EXIT) {
          this.navigateToTab('step3-tab'); //Navigating to the full and final settlement tab
        }

      }, (error) => {
        this.helperService.showToast(error.error.message, this.TOAST_STATUS_ERROR);
      })
    }




    // #######################################################################
    // Step 2: Attendance, Leaves & Present days

    registerAttendanceAndLeavesMethodCall(){
      if(this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LEAVES){

      }

      if(this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LOP_SUMMARY){
        this.registerLopSummaryRequestByOrganizationIdAndStartDateMethodCall();
      }

      if(this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE == this.LOP_REVERSAL){
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

      this.dataService.registerLopSummaryRequestByOrganizationIdAndStartDateAndEndDate(this.lopSummaryRequestList, this.startDate, this.endDate).subscribe((response) => {
        this.helperService.showToast("LOP summary has been successfully saved.", this.TOAST_STATUS_SUCCESS);
        this.navigateToTab('step6-tab'); //Navigating to the Lop reversal tab
      }, (error) => {
        this.helperService.showToast("Error while saving the LOP summary!", this.TOAST_STATUS_ERROR);
        console.log(error);
      })
    }

    lopSummaryResponseList : LopSummaryResponse[] = [];
    getLopSummaryResponseByOrganizationIdAndStartDateAndEndDateMethodCall(){
      this.preRuleForShimmersAndErrorPlaceholdersForLopSummary();
      this.dataService.getLopSummaryResponseByOrganizationIdAndStartDateAndEndDate(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe((response) => {

        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForLopSummary = true;
        } else{
          this.lopSummaryResponseList = response.listOfObject;
          this.total = response.totalItems;
          this.lastPageNumber = Math.ceil(this.total/this.itemPerPage);
          // console.log(this.lopSummaryResponseList);
        }

        this.isShimmerForLopSummary = false;
      }, (error) => {
        this.networkConnectionErrorPlaceHolderForLopSummary = true;
        this.isShimmerForLopSummary = false;
      })
    }



    lopReversalRequestList : LopReversalRequest[] = [];
    registerLopReversalRequestByOrganizationIdAndStartDateMethodCall(){

      this.lopReversalRequestList = [];

      this.lopReversalResponseList.forEach((item) => {
        let lopReversalRequest = new LopReversalRequest(item.uuid, item.lopDays, item.reversedLopDays, item.lopReversalComment);
        
        this.lopReversalRequestList.push(lopReversalRequest);
      })

      this.dataService.registerLopReversalRequestByOrganizationIdAndStartDateAndEndDate(this.lopReversalRequestList, this.startDate, this.endDate).subscribe((response) => {
        this.helperService.showToast("LOP reversed successfully.", this.TOAST_STATUS_SUCCESS);
      }, (error) => {
        this.helperService.showToast("Error while saving the LOP Reversal!", this.TOAST_STATUS_ERROR);
        console.log(error);
      })
    }

    lopReversalResponseList : LopReversalResponse[] = [];
    getLopReversalResponseByOrganizationIdAndStartDateAndEndDateMethodCall(){
      this.preRuleForShimmersAndErrorPlaceholdersForLopReversal();
      this.dataService.getLopReversalResponseByOrganizationIdAndStartDateAndEndDate(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe((response) => {

        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForLopReversal = true;
        } else{
          this.lopReversalResponseList = response.listOfObject;
          this.total = response.totalItems;
          this.lastPageNumber = Math.ceil(this.total/this.itemPerPage);
          // console.log(this.lopReversalResponseList);
        }

        this.isShimmerForLopReversal = false;
      }, (error) => {
        this.networkConnectionErrorPlaceHolderForLopReversal = true;
        this.isShimmerForLopReversal = false;
      })
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
        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          return;
        } else{
          this.selectedLeaveTypeResponse = response.listOfObject[0]; //Setting the first object as selected
          this.lopAdjustmentRequest.leaveType = response.listOfObject[0].name;
          this.leaveTypeResponseList = response.listOfObject;
        }
        console.log(this.leaveTypeResponseList);
      }, (error) => {
        console.log(error);
      })
    }

    // API to register leave adjustment request
    lopAdjustmentRequest : LopAdjustmentRequest = new LopAdjustmentRequest();
    registerLopAdjustmentRequestMethodCall(){
      debugger;
      this.dataService.registerLopAdjustmentRequest(this.lopAdjustmentRequest, this.startDate, this.endDate).subscribe((response) => {
        this.closeLopAdjustmentRequestModal.nativeElement.click();
        this.helperService.showToast(response.message, this.TOAST_STATUS_SUCCESS);
        this.getLopSummaryResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
      }, (error) => {
        this.helperService.showToast(error.message, this.TOAST_STATUS_ERROR);
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

      this.lopAdjustmentRequest.startDate = this.helperService.formatDateToYYYYMMDD(dates[0]);
      this.lopAdjustmentRequest.endDate = this.helperService.formatDateToYYYYMMDD(dates[1]);
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
      console.log(count);
      this.lopAdjustmentRequest.lopDaysToBeAdjusted = count;
    }


    // Fetching user's leave for payroll

    payrollLeaveResponseList : PayrollLeaveResponse[] = [];
    getPayrollLeaveResponseMethodCall(){
      this.preRuleForShimmersAndErrorPlaceholdersForPayrollLeaveResponse();
      this.dataService.getPayrollLeaveResponse(
        this.startDate,
        this.endDate,
        this.itemPerPage,
        this.pageNumber,
        this.search,
        this.searchBy
      ).subscribe((response) => {
        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForPayrollLeaveResponse = true;
        } else{
          this.payrollLeaveResponseList = response.listOfObject;
          this.total = response.totalItems;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
        }

        this.isShimmerForPayrollLeaveResponse = false;
      }, (error) => {
        this.networkConnectionErrorPlaceHolder = true;
        this.isShimmerForPayrollLeaveResponse = false;
      })
    }

    getPayrollLeaveLogResponseMethodCall(){
      this.dataService.getPayrollLeaveResponse(
        this.startDate,
        this.endDate,
        this.itemPerPage,
        this.pageNumber,
        this.search,
        this.searchBy
      ).subscribe((response) => {

      }, (error) => {
        
      })
    }

    selectedRole : Role = new Role();
    roles : Role[] = [];




    // #######################################################################
    // Step 3: Salary changes, Bonus & Overtime
    salaryChangeResponseList : SalaryChangeResponse[] = [];
    getSalaryChangeResponseListByOrganizationIdMethodCall(){
      this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeResponse();
      this.dataService.getSalaryChangeResponseListByOrganizationId(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe((response) => {

        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForSalaryChangeResponse = true;
        } else{
          this.salaryChangeResponseList = response.listOfObject;
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
    getSalaryChangeBonusResponseListByOrganizationIdMethodCall(){
      this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeBonusResponse();
      this.dataService.getSalaryChangeBonusResponseListByOrganizationId(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe((response) => {

        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForSalaryChangeBonusResponse = true;
        } else{
          this.salaryChangeBonusResponseList = response.listOfObject;
          this.total = response.totalItems;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
        }

        this.isShimmerForSalaryChangeBonusResponse = false;
      }, (error) => {
        this.isShimmerForSalaryChangeBonusResponse = false;
        this.networkConnectionErrorPlaceHolderForSalaryChangeBonusResponse = true;
      })
    }

    salaryChangeOvertimeResponseList : SalaryChangeOvertimeResponse[] = [];
    getSalaryChangeOvertimeResponseListByOrganizationIdMethodCall(){
      this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeOvertimeResponse();
      this.dataService.getSalaryChangeOvertimeResponseListByOrganizationId(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe((response) => {

        if(this.helperService.isListOfObjectNullOrUndefined(response)){
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
        this.navigateToTab('step9-tab');
      }

      if(CURRENT_TAB_IN_SALARY_CHANGE == this.OVERTIME){

      }
    }

    registerSalaryChangeListByOrganizationIdMethodCall(){
      this.helperService.showToast("Salary changes details saved successfully.", this.TOAST_STATUS_SUCCESS);
      this.navigateToTab('step8-tab');
    }


    salaryChangeBonusRequestList : SalaryChangeBonusRequest[] = [];
    registerSalaryChangeBonusListByOrganizationIdMethodCall(){
      this.salaryChangeBonusRequestList = [];
      
      this.salaryChangeBonusResponseList.forEach((item) => {
        let salaryChangeBonusRequest = new SalaryChangeBonusRequest(item.uuid,item.payActionType.id, item.comment);

        this.salaryChangeBonusRequestList.push(salaryChangeBonusRequest);
      })

      this.dataService.registerSalaryChangeBonusListByOrganizationId(this.salaryChangeBonusRequestList).subscribe((response) => {
        this.helperService.showToast(response.message, this.TOAST_STATUS_SUCCESS);
      }, (error) => {
        this.helperService.showToast("Error while registering the request!", this.TOAST_STATUS_ERROR);
      })
    }



    // ###########################################################
    // Step 4: EPF, ESI & TDS
    
    epfDetailsResponseList : EpfDetailsResponse[] = [];
    getEpfDetailsResponseListByOrganizationIdMethodCall(){
      this.preRuleForShimmersAndErrorPlaceholdersForEpfDetailsResponse();
      this.dataService.getEpfDetailsResponseListByOrganizationId(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe((response) => {
        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForEpfDetailsResponse = true;
        } else{
          this.epfDetailsResponseList = response.listOfObject.map((item: { amount: any; }) => {
            return {
              ...item,
              finalAmount: item.amount
            };
          });

          this.total = response.totalItems;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
        }

        this.isShimmerForEpfDetailsResponse = false;
      }, (error) =>{
        this.networkConnectionErrorPlaceHolderForEpfDetailsResponse = true;
        this.isShimmerForEpfDetailsResponse = false;
      })
    }

    esiDetailsResponseList : EsiDetailsResponse[] = [];
    getEsiDetailsResponseListByOrganizationIdMethodCall(){
      this.preRuleForShimmersAndErrorPlaceholdersForEsiDetailsResponse();
      this.dataService.getEsiDetailsResponseListByOrganizationId(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe((response) => {
        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForEsiDetailsResponse = true;
        } else{
          this.esiDetailsResponseList = response.listOfObject.map((item: { amount: any; }) => {
            return {
              ...item,
              finalAmount: item.amount
            };
          });

          this.total = response.totalItems;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
        }

        this.isShimmerForEsiDetailsResponse = false;
      }, (error) =>{
        this.networkConnectionErrorPlaceHolderForEsiDetailsResponse = true;
        this.isShimmerForEsiDetailsResponse = false;
      })
    }

    tdsDetailsResponseList : TdsDetailsResponse[] = [];
    getTdsDetailsResponseListByOrganizationIdMethodCall(){
      this.preRuleForShimmersAndErrorPlaceholdersForTdsDetailsResponse();
      this.dataService.getTdsDetailsResponseListByOrganizationId(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.search, this.searchBy).subscribe((response) => {
        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForTdsDetailsResponse = true;
        } else{
          this.tdsDetailsResponseList = response.listOfObject.map((item: { amount: any; }) => {
            return {
              ...item,
              finalAmount: item.amount
            };
          });
          this.total = response.totalItems;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
        }

        this.isShimmerForTdsDetailsResponse = false;
      }, (error) =>{
        this.networkConnectionErrorPlaceHolderForTdsDetailsResponse = true;
        this.isShimmerForTdsDetailsResponse = false;
      })
    }


    modifiedValuesMap = new Map<number, any>();

    updateFinalAmount(response : any) {
      if (response.amountToBeAdjusted != null) {
        response.finalAmount = response.amountToBeAdjusted;
      } else {
        response.finalAmount = response.amount;
      }
      

      // const index = this.epfDetailsResponseList.findIndex(detail => detail.uuid == epfDetailsResponse.uuid);
      // if(index != -1){
      //   this.epfDetailsResponseList[index] = {...epfDetailsResponse};
      // } else{
      //   this.epfDetailsRequestList.push(epfDetailsResponse);
      // }
    }


    // updateEsiFinalAmount(esiDetailsResponse : EsiDetailsResponse) {
    //   if (esiDetailsResponse.amountToBeAdjusted != null) {
    //     esiDetailsResponse.finalAmount = esiDetailsResponse.amountToBeAdjusted;
    //   } else {
    //     esiDetailsResponse.finalAmount = esiDetailsResponse.amount;
    //   }
    // }

    // updateTdsFinalAmount(tdsDetailsResponse : TdsDetailsResponse) {
    //   if (tdsDetailsResponse.amountToBeAdjusted != null) {
    //     tdsDetailsResponse.finalAmount = tdsDetailsResponse.amountToBeAdjusted;
    //   } else {
    //     tdsDetailsResponse.finalAmount = tdsDetailsResponse.amount;
    //   }
    // }


    registerEpfEsiTdsMethodCall(CURRENT_TAB_IN_EPF_ESI_TDS : number){

      console.log("REGISTRATION_STARTED...");
      console.log(CURRENT_TAB_IN_EPF_ESI_TDS);

      if(CURRENT_TAB_IN_EPF_ESI_TDS == this.EPF){
        console.log("EPF_REGISTRATION_STARTED...");
        this.registerEpfDetailsListByOrganizationIdMethodCall();
      }

      if(CURRENT_TAB_IN_EPF_ESI_TDS == this.ESI){
        console.log("ESI_REGISTRATION_STARTED...");
        this.registerEsiDetailsListByOrganizationIdMethodCall();
      }

      if(CURRENT_TAB_IN_EPF_ESI_TDS == this.TDS){
        console.log("TDS_REGISTRATION_STARTED...");
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
        this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
        this.navigateToTab('step11-tab');
      }, (error) => {
        this.helperService.showToast("Error while adjusting the epf details!", Key.TOAST_STATUS_ERROR);
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
        this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
        this.navigateToTab('step12-tab');
      }, (error) => {
        this.helperService.showToast("Error while adjusting the esi details!", Key.TOAST_STATUS_ERROR);
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
        this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
      }, (error) => {
        this.helperService.showToast("Error while adjusting the tds details!", Key.TOAST_STATUS_ERROR);
      })
    }


}
