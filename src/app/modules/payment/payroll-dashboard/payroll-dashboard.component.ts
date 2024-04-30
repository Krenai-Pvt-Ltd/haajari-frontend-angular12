import { Component, OnInit } from '@angular/core';
import { MonthResponse } from 'src/app/models/month-response';
import { NewJoineeResponse } from 'src/app/models/new-joinee-response';
import { OrganizationMonthWiseSalaryData } from 'src/app/models/organization-month-wise-salary-data';
import { PayrollDashboardEmployeeCountResponse } from 'src/app/models/payroll-dashboard-employee-count-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-payroll-dashboard',
  templateUrl: './payroll-dashboard.component.html',
  styleUrls: ['./payroll-dashboard.component.css'],
})
export class PayrollDashboardComponent implements OnInit {
  itemPerPage: number = 8;
  pageNumber: number = 0;
  sort: string = 'asc';
  sortBy: string = 'id';
  search: string = '';
  searchBy: string = 'name';

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholders() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
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

  //Fetching the new joinee data
  newJoineeResponseList : NewJoineeResponse[] = [];
  getNewJoineeByOrganizationId(){
    this.dataService.getNewJoineeByOrganizationId(this.itemPerPage, this.pageNumber, this.sort, this.sortBy, this.search, this.searchBy, this.startDate, this.endDate).subscribe((response) => {
      if(response == undefined || response == null || response == undefined || response == null || response.length == 0){

      } else{
        this.newJoineeResponseList = response.listOfObject;
      }
    }, (error) => {

    })
  }
}
