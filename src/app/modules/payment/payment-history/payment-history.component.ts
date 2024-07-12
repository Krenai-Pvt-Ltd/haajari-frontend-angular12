import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Key } from 'src/app/constant/key';
import { EmployeeMonthWiseSalaryData } from 'src/app/models/employee-month-wise-salary-data';
import { OrganizationMonthWiseSalaryData } from 'src/app/models/organization-month-wise-salary-data';
import { StartDateAndEndDate } from 'src/app/models/start-date-and-end-date';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css'],
})
export class PaymentHistoryComponent implements OnInit {
  itemPerPage: number = 8;
  lastPageNumber: number = 0;
  total : number = 0
  pageNumber: number = 1;
  sort: string = 'asc';
  sortBy: string = 'id';
  search: string = '';
  searchBy: string = 'name';
  selectedEmployeeIds: string[] = [];
  isAllUsersSelected: boolean = false;

  readonly PENDING = Key.PENDING;
  readonly APPROVED = Key.APPROVED;


  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholders() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  constructor(private dataService: DataService, private helperService: HelperService) {
    const currentDate = moment();
    this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD');
    this.endDateStr = currentDate.endOf('month').format('YYYY-MM-DD');

    // Set the default selected month
    this.month = currentDate.format('MMMM');

    this.getFirstAndLastDateOfMonth(this.selectedDate);
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getOrganizationRegistrationDateMethodCall();
    this.getFirstAndLastDateOfMonth(new Date());
  }


  startDateStr: string = '';
  endDateStr: string = '';
  month: string = '';
  inputDate: string = '';

  employeeMonthWiseSalaryDataList: EmployeeMonthWiseSalaryData[] = [];
  getOrganizationMonthWiseSalaryDataMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholders();
    this.dataService
      .getSalarySlipDataMonthwise(
        this.startDate,
        this.endDate,
        this.itemPerPage,
        this.pageNumber,
        this.search,
        this.searchBy
      )
      .subscribe(
        (response) => {
          if (
            response == undefined ||
            response == null ||
            response.listOfObject == undefined ||
            response.listOfObject == null ||
            response.listOfObject.length == 0
          ) {
            this.dataNotFoundPlaceholder = true;
          } else {
            this.employeeMonthWiseSalaryDataList = response.listOfObject;
            this.total = response.totalItems;
            this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
          }
          this.isShimmer = false;
        },
        (error) => {
          this.isShimmer = false;
          this.networkConnectionErrorPlaceHolder = true;
        }
      );
  }

  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';
  startDateAndEndDate : StartDateAndEndDate = new StartDateAndEndDate();

  onMonthChange(month: Date): void {
    console.log('Month is getting selected');
    this.selectedDate = month;
    this.getFirstAndLastDateOfMonth(this.selectedDate);

    console.log(this.startDate, this.endDate);
    // this.getEmployeeMonthWiseSalaryDataMethodCall();
  }

  disableMonths = (date: Date): boolean => {
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

    // Disable if the month is before the organization registration month
    if (
      dateYear < organizationRegistrationYear ||
      (dateYear === organizationRegistrationYear &&
        dateMonth < organizationRegistrationMonth)
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

  organizationRegistrationDate: string = '';
  getOrganizationRegistrationDateMethodCall() {
    debugger;
    this.dataService.getOrganizationRegistrationDate().subscribe(
      (response) => {
        this.organizationRegistrationDate = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getFirstAndLastDateOfMonth(selectedDate: Date) {

    this.startDate = this.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    this.endDate = this.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    );
    this.getOrganizationMonthWiseSalaryDataMethodCall();
    // const endDateWithoutEndHours = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    // this.startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 0, 0, 0).toDateString();
    // this.endDate = new Date(endDateWithoutEndHours.getFullYear(), endDateWithoutEndHours.getMonth() + 1, 0).toDateString() + " " + this.END_HOUR;
  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getOrganizationMonthWiseSalaryDataMethodCall();


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

  searchUsers(event: Event) {
    this.helperService.ignoreKeysDuringSearch(event);
    this.resetCriteriaFilterMicro();
this.getOrganizationMonthWiseSalaryDataMethodCall();
  }

  // Clearing search text
  clearSearch() {
    this.resetCriteriaFilter();
   this.getOrganizationMonthWiseSalaryDataMethodCall();
  }

  toggleEmployeeSelection(uuid: string) {
    const index = this.selectedEmployeeIds.indexOf(uuid);
    if (index === -1) {
      this.selectedEmployeeIds.push(uuid);
    } else {
      this.selectedEmployeeIds.splice(index, 1);
    }
  }
  
  unselectAllUsers() {
    this.selectedEmployeeIds = [];
    this.isAllUsersSelected = false;
  }
  
  getAllSalarySlipDataLogsMonthwiseMethodCall() {
    this.dataService.getAllSalarySlipDataLogsMonthwise(this.startDate, this.endDate).subscribe(
      (response: { listOfObject: EmployeeMonthWiseSalaryData[] }) => {
        
        this.total = response.listOfObject.length;
        this.isAllUsersSelected = true;
        this.selectedEmployeeIds = response.listOfObject.map((employee: EmployeeMonthWiseSalaryData) => employee.uuid);
        console.log(this.selectedEmployeeIds);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectAllUsers(event: any) {
    if (event.target.checked) {
      this.getAllSalarySlipDataLogsMonthwiseMethodCall();
    } else {
      this.selectedEmployeeIds = [];
      this.isAllUsersSelected = false;
    }
  }

  selectUser(uuid: string) {
    if (this.selectedEmployeeIds.includes(uuid)) {
      this.selectedEmployeeIds = this.selectedEmployeeIds.filter(id => id !== uuid);
    } else {
      this.selectedEmployeeIds.push(uuid);
    }
    this.isAllUsersSelected = this.selectedEmployeeIds.length === this.employeeMonthWiseSalaryDataList.length;
  }

  
  updatePayActionTypeFoUsersMethodCall(payActionType: string){
    this.dataService.updatePayActionTypeFoUsers(payActionType, this.selectedEmployeeIds).subscribe(
      (response) => {
        
        this.isAllUsersSelected = false;
        this.selectedEmployeeIds= [];
        this.getOrganizationMonthWiseSalaryDataMethodCall();
      },
      (error) => {
        console.log(error);
      }
    );
  }
  
  generateSalarySlipMethodCall(){
    this.dataService.generateSalarySlip(this.startDate, this.endDate,this.selectedEmployeeIds).subscribe(
      (response) => {
        
        this.isAllUsersSelected = false;
        this.selectedEmployeeIds= [];
        this.getOrganizationMonthWiseSalaryDataMethodCall();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  
  
}
