import { Component, OnInit } from '@angular/core';
import { OrganizationMonthWiseSalaryData } from 'src/app/models/organization-month-wise-salary-data';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css'],
})
export class PaymentHistoryComponent implements OnInit {
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

  ngOnInit(): void {
    window.scroll(0, 0);
  }

  organizationMonthWiseSalaryDataList: OrganizationMonthWiseSalaryData[] = [];
  getOrganizationMonthWiseSalaryDataMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholders();
    this.dataService
      .getOrganizationMonthWiseSalaryData(
        this.itemPerPage,
        this.pageNumber,
        this.sort,
        this.sortBy
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
            this.organizationMonthWiseSalaryDataList = response.listOfObject;
          }
          this.isShimmer = false;
        },
        (error) => {
          this.isShimmer = false;
          this.networkConnectionErrorPlaceHolder = true;
        }
      );
  }
}
