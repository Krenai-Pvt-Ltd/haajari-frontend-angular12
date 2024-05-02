import { Component, OnInit } from '@angular/core';
import { clear } from 'console';
import { Key } from 'src/app/constant/key';
import { FinalSettlementResponse } from 'src/app/models/final-settlement-response';
import { MonthResponse } from 'src/app/models/month-response';
import { NewJoineeResponse } from 'src/app/models/new-joinee-response';
import { OrganizationMonthWiseSalaryData } from 'src/app/models/organization-month-wise-salary-data';
import { PayActionType } from 'src/app/models/pay-action-type';
import { PayrollDashboardEmployeeCountResponse } from 'src/app/models/payroll-dashboard-employee-count-response';
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

  NEW_JOINEE = Key.NEW_JOINEE;
  USER_EXIT = Key.USER_EXIT;
  REGULAR = Key.REGULAR;

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

  constructor(
    private dataService: DataService,
    private helperService: HelperService,
  ) {}

  ngOnInit(): void {
    this.currentMonthResponse = new MonthResponse(
      new Date().getMonth() + 1,
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      new Date().toLocaleString('default', { month: 'short' }),
      new Date().getFullYear(),
      'Current',
      false
    );
  
    this.selectedMonth = this.currentMonthResponse.month;
    this.selectedYear = this.currentMonthResponse.year;


    this.getFirstAndLastDateOfMonth(new Date());
    this.countPayrollDashboardEmployeeByOrganizationIdMethodCall();
    this.getPayActionTypeListMethodCall();

    this.getOrganizationRegistrationDateMethodCall();
    this.getMonthResponseList(this.selectedDate);
    this.getOrganizationIndividualMonthSalaryDataMethodCall(this.currentMonthResponse);
  }

  // Year calendar
  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';

  onYearChange(year: Date): void {
    console.log('Month is getting selected!');
    this.selectedDate = year;
    this.getMonthResponseList(this.selectedDate);

    // Find the first monthResponse with disable as false
    const enabledMonthResponse = this.monthResponseList.find((monthResponse: { disable: any; }) => !monthResponse.disable);
    if (enabledMonthResponse) {
        // Call the method with the found monthResponse
        this.getOrganizationIndividualMonthSalaryDataMethodCall(enabledMonthResponse);
    }

    console.log(this.getMonthResponseList(this.selectedDate));
    // this.getOrganizationIndividualMonthSalaryDataMethodCall();
    // this.getFirstAndLastDateOfMonth(this.selectedDate);
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
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    this.endDate = this.helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    );
  }

  disableYears = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const organizationRegistrationYear = new Date(this.organizationRegistrationDate).getFullYear();
    const organizationRegistrationMonth = new Date(this.organizationRegistrationDate).getMonth();

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
        console.log(error);
      },
    );
  }

  // Getting month list
  monthResponseList: MonthResponse[] = [];
  async getMonthResponseList(date: Date) {
    this.monthResponseList = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const organizationRegistrationYear = new Date(this.organizationRegistrationDate).getFullYear();
    const organizationRegistrationMonth = new Date(this.organizationRegistrationDate).getMonth();

    for (let i = 0; i < 12; i++) {
        // Create a new Date object for each month.
        const monthDate = new Date(date.getFullYear(), i);

        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        const status =
        (monthDate.getFullYear() < organizationRegistrationYear || (monthDate.getFullYear() === organizationRegistrationYear && i < organizationRegistrationMonth)) ? '-' : monthDate.getFullYear() < currentYear || (monthDate.getFullYear() === currentYear && i < currentMonth) ? 'Completed' : (monthDate.getFullYear() === currentYear && i === currentMonth) ? 'Current' : 'Upcoming';

        // Disabling the future months and the months before organization registration.
        const disable = 
            (monthDate.getFullYear() < organizationRegistrationYear || (monthDate.getFullYear() === organizationRegistrationYear && i < organizationRegistrationMonth)) ||
            (monthDate.getFullYear() > currentYear || (monthDate.getFullYear() === currentYear && i > currentMonth));

        // Format the first day of the month as "DD MMM".
        const firstDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);

        // Format the last day of the month as "DD MMM".
        const lastDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        this.monthResponseList.push(
            new MonthResponse(
                i + 1,
                firstDate,
                lastDate,
                monthName,
                monthDate.getFullYear(),
                status,
                disable
            ),
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
    false,
  );

  selectedMonth : string = '';
  selectedYear : number = 0;
  // Fetching organization individual month salary data.
  organizationMonthWiseSalaryData: OrganizationMonthWiseSalaryData = new OrganizationMonthWiseSalaryData();
  getOrganizationIndividualMonthSalaryDataMethodCall(monthResponse: MonthResponse) {
    this.selectedMonth = monthResponse.month;
    this.selectedYear = monthResponse.year;
    this.dataService
      .getOrganizationIndividualMonthSalaryData(
        this.helperService.formatDateToYYYYMMDD(monthResponse.firstDate),
        this.helperService.formatDateToYYYYMMDD(monthResponse.lastDate),
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
          }
          this.isShimmer = true;
        },
        (error) => {
          console.log(error);
          this.isShimmer = false;
          this.networkConnectionErrorPlaceHolder = true;
        },
      );
  }


  //Fetching the employees count with new joinee count and user exit count
  payrollDashboardEmployeeCountResponse : PayrollDashboardEmployeeCountResponse = new PayrollDashboardEmployeeCountResponse();
  countPayrollDashboardEmployeeByOrganizationIdMethodCall(){
    this.dataService.countPayrollDashboardEmployeeByOrganizationId(this.startDate, this.endDate).subscribe((response) => {
      this.payrollDashboardEmployeeCountResponse = response.object;
    }, (error) => {

    })
  }

  //Exmployee changes tab selection
  newJoineeTab(){
    this.resetCriteriaFilter();
    this.getNewJoineeByOrganizationIdMethodCall();
  }

  userExitTab(){
    this.resetCriteriaFilter();
    this.getUserExitByOrganizationIdMethodCall();
  }

  finalSettlementTab(){
    this.resetCriteriaFilter();
    this.getFinalSettlementByOrganizationIdMethodCall();
  }

  //Fetching the new joinee data
  newJoineeResponseList : NewJoineeResponse[] = [];
  debounceTimer : any;
  getNewJoineeByOrganizationIdMethodCall(debounceTime : number = 300){

    this.newJoineeResponseList = [];

    if(this.debounceTimer){
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForNewJoinee();
      this.dataService.getNewJoineeByOrganizationId(this.itemPerPage, this.pageNumber, this.sort, this.sortBy, this.search, this.searchBy, this.startDate, this.endDate).subscribe((response) => {
        if(this.helperService.isListOfObjectNullOrUndefined(response)){

          this.dataNotFoundPlaceholderForNewJoinee = true;
        } else{
          this.newJoineeResponseList = response.listOfObject;
          this.total = response.totalItems;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
          // console.log(this.total);
        }
        this.isShimmerForNewJoinee = false;
      }, (error) => {

        this.networkConnectionErrorPlaceHolderForNewJoinee = true;
        this.isShimmerForNewJoinee = false;
      })
    }, debounceTime)
  }

  //Fetching the pay action type list
  payActionTypeList : PayActionType[] = [];
  getPayActionTypeListMethodCall(){
    this.dataService.getPayActionTypeList().subscribe((response) => {
      if(this.helperService.isListOfObjectNullOrUndefined(response)){

      } else{
        this.payActionTypeList = response.listOfObject;
        this.selectedPayActionType = response.listOfObject[0];
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
  selectPayActionType(payActionType : PayActionType){
    this.selectedPayActionType = payActionType;
    this.isDropdownOpen = false;
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
  changePage(page: number | string, step : number) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }

    if(step == Key.NEW_JOINEE_STEP){
      this.getNewJoineeByOrganizationIdMethodCall();
    }

    if(step == Key.USER_EXIT_STEP){
      this.getUserExitByOrganizationIdMethodCall();
    }

    if(step == Key.FINAL_SETTLEMENT_STEP){
      this.getFinalSettlementByOrganizationIdMethodCall();
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
  searchNewJoinee(event : Event){
    this.helperService.ignoreKeysDuringSearch(event);
    this.resetCriteriaFilterMicro();
    this.getNewJoineeByOrganizationIdMethodCall();
  }

  searchUserExit(event : Event){
    this.helperService.ignoreKeysDuringSearch(event);
    this.resetCriteriaFilterMicro();
    this.getUserExitByOrganizationIdMethodCall();
  }

  searchUsers(event : Event, step : number){
    this.helperService.ignoreKeysDuringSearch(event);
    this.resetCriteriaFilterMicro();

    if(step == Key.NEW_JOINEE_STEP){
      this.getNewJoineeByOrganizationIdMethodCall();
    }

    if(step == Key.USER_EXIT_STEP){
      this.getUserExitByOrganizationIdMethodCall();
    }

    if(step == Key.FINAL_SETTLEMENT_STEP){
      this.getFinalSettlementByOrganizationIdMethodCall();
    }
  }


  // Clearing search text
  clearSearch(step : number){
    this.resetCriteriaFilter();
    if(step == Key.NEW_JOINEE_STEP){
      this.getNewJoineeByOrganizationIdMethodCall();
    }

    if(step == Key.USER_EXIT_STEP){
      this.getUserExitByOrganizationIdMethodCall();
    }

    if(step == Key.FINAL_SETTLEMENT_STEP){

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
  userExitResponseList : UserExitResponse[] = [];
  getUserExitByOrganizationIdMethodCall(){
    this.userExitResponseList = [];
    this.preRuleForShimmersAndErrorPlaceholdersForUserExit();
    this.dataService.getUserExitByOrganizationId(this.itemPerPage, this.pageNumber, this.sort, this.sortBy, this.search, this.searchBy, this.startDate, this.endDate).subscribe((response) => {
      if(this.helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForUserExit = true;
      } else{
        this.userExitResponseList = response.listOfObject;
        this.total = response.totalItems;
        this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
      }
      this.isShimmerForUserExit = false;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForUserExit = true;
      this.isShimmerForUserExit = false;
    })
  }

    //Fetching the final settlement data
    finalSettlementResponseList : FinalSettlementResponse[] = [];
    getFinalSettlementByOrganizationIdMethodCall(){
      this.finalSettlementResponseList = [];
      this.preRuleForShimmersAndErrorPlaceholdersForFinalSettlement();
      this.dataService.getFinalSettlementByOrganizationId(this.itemPerPage, this.pageNumber, this.sort, this.sortBy, this.search, this.searchBy, this.startDate, this.endDate).subscribe((response) => {
        if(this.helperService.isListOfObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForFinalSettlement = true;
        } else{
          this.finalSettlementResponseList = response.listOfObject;
          this.total = response.totalItems;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
        }
        this.isShimmerForFinalSettlement = false;
      }, (error) => {
        this.networkConnectionErrorPlaceHolderForFinalSettlement = true;
        this.isShimmerForFinalSettlement = false;
      })
    }
}









