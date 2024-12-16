import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EpfDetailsResponse } from 'src/app/models/epf-details-response';
import { EsiDetailsResponse } from 'src/app/models/esi-details-response';
import { TdsDetailsResponse } from 'src/app/models/tds-details-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-salary-deduction-management',
  templateUrl: './salary-deduction-management.component.html',
  styleUrls: ['./salary-deduction-management.component.css']
})
export class SalaryDeductionManagementComponent implements OnInit {


  itemPerPage: number = 8;
  pageNumber: number = 1;
  lastPageNumber: number = 0;
  sort: string = 'asc';
  sortBy: string = 'id';
  search: string = '';
  searchBy: string = 'name';
  total: number = 0;


  @Input() startDate:any;
  @Input() endDate:any;
  @Output() getData: EventEmitter<boolean> = new EventEmitter<boolean>();
    
  sendBulkDataToComponent() {
    this.getData.emit(true);
  }


  back(){
    this.sendBulkDataToComponent();
  }


  constructor(private _dataService : DataService, 
    private _helperService : HelperService) { }

  ngOnInit(): void {
  }


  epfEsiTdsSection(PAYROLL_PROCESS_STEP : number){

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


  debounceTimer:any;
  amountCache: { [uuid: string]: number } = {};
  epfDetailsResponseList : EpfDetailsResponse[] = [];
  getEpfDetailsResponseListByOrganizationIdMethodCall(debounceTime: number = 300) {
    this.epfDetailsResponseList = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForEpfDetailsResponse();
      this._dataService
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
      this._dataService
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
      this._dataService
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

}
