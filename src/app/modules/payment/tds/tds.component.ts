import { Component, OnInit } from '@angular/core';
import { EmployeeMonthWiseSalaryData } from 'src/app/models/employee-month-wise-salary-data';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-tds',
  templateUrl: './tds.component.html',
  styleUrls: ['./tds.component.css'],
})
export class TdsComponent implements OnInit {
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

  constructor(private dataService: DataService) {}

  ngOnInit(): void {}

  employeeMonthWiseSalaryDataList: EmployeeMonthWiseSalaryData[] = [];
  getEmployeeMonthWiseSalaryDataMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholders();
    this.dataService
      .getEmployeeMonthWiseSalaryData(
        this.itemPerPage,
        this.pageNumber,
        this.search,
        this.searchBy,
        this.sort,
        this.sortBy,
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
          }
          this.isShimmer = false;
        },
        (error) => {
          this.isShimmer = false;
          this.networkConnectionErrorPlaceHolder = true;
        },
      );
  }
}
