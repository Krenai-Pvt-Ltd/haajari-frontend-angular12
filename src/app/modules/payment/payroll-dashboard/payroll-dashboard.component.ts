import { Component, OnInit } from '@angular/core';
import { MonthResponse } from 'src/app/models/month-response';
import { OrganizationMonthWiseSalaryData } from 'src/app/models/organization-month-wise-salary-data';
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
      new Date().getMonth() + 1, // Months are 0-indexed in JavaScript, +1 to match your structure
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      new Date().toLocaleString('default', { month: 'short' }),
      new Date().getFullYear(),
      'Current', // Assuming you want the current status for the current month
      false
    );
  
    this.selectedMonth = this.currentMonthResponse.month;
    this.selectedYear = this.currentMonthResponse.year;

    
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
    // this.getFirstAndLastDateOfMonth(this.selectedDate);
  }

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

    // Disable if the year is before the organization registration year or if the year is after the organization registration year
    if (dateYear < organizationRegistrationYear || dateYear > currentYear) {
      return true;
    }

    return false;
  };

  disableMonths = (): boolean => {
    return true;
  };

  // Fetching organization registration date
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
  getMonthResponseList(date: Date) {
    this.monthResponseList = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const organizationRegistrationYear = new Date(this.organizationRegistrationDate).getFullYear();
    const organizationRegistrationMonth = new Date(this.organizationRegistrationDate).getMonth();

    for (let i = 0; i < 12; i++) {
        // Create a new Date object for each month
        const monthDate = new Date(date.getFullYear(), i);

        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        const status =
            monthDate.getFullYear() < currentYear || (monthDate.getFullYear() === currentYear && i < currentMonth) ? 'Completed' :
            (monthDate.getFullYear() === currentYear && i === currentMonth) ? 'Current' : 'Upcoming';

        // Disabling the future months and the months before organization registration
        const disable = 
            (monthDate.getFullYear() < organizationRegistrationYear || (monthDate.getFullYear() === organizationRegistrationYear && i < organizationRegistrationMonth)) ||
            (monthDate.getFullYear() > currentYear || (monthDate.getFullYear() === currentYear && i > currentMonth));

        // Format the first day of the month as "DD MMM"
        const firstDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);

        // Format the last day of the month as "DD MMM"
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

    console.log(this.monthResponseList);
}


  // This is current month response, default value to fetch the data
  currentMonthResponse: MonthResponse = new MonthResponse(
    0,
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    '',
    0,
    '',
    false,
  );

  selectedMonth : string = this.currentMonthResponse.month;
  selectedYear : number = this.currentMonthResponse.year;
  // Fetching organization individual month salary data
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

  //
}
