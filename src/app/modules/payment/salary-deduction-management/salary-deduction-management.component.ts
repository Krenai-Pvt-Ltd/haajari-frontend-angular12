import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { EpfDetailsResponse } from 'src/app/models/epf-details-response';
import { EsiDetailsResponse } from 'src/app/models/esi-details-response';
import { TdsDetailsResponse } from 'src/app/models/tds-details-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';

@Component({
  selector: 'app-salary-deduction-management',
  templateUrl: './salary-deduction-management.component.html',
  styleUrls: ['./salary-deduction-management.component.css']
})
export class SalaryDeductionManagementComponent implements OnInit {


  itemPerPage: number = 10;
  pageNumber: number = 1;
  totalItems: number = 0;
  search: string = '';

  @Input() step:any;
  @Input() startDate:any;
  @Input() endDate:any;
  @Output() getData: EventEmitter<number> = new EventEmitter<number>();
    

  readonly EPF = Key.EPF;
  readonly ESI = Key.ESI;
  readonly TDS = Key.TDS;

  sendBulkDataToComponent() {
    this.getData.emit(this.step);
  }

  back(){
    this.sendBulkDataToComponent();
  }

 private searchSubject = new Subject<boolean>();

  constructor(private _dataService : DataService, 
    public _helperService : HelperService,
  private _payrollService: PayrollService) { 

       this.searchSubject
                .pipe(debounceTime(250)) // Wait for 250ms before emitting the value
                .subscribe(searchText => {
                  this.searchByInput(searchText);
                });
    }

  ngOnInit(): void {
    window.scroll(0,0);
    this.selectTabByProcessStep(this.step);
  }


  @ViewChild('step10Tab') step10Tab!: ElementRef;
  @ViewChild('step11Tab') step11Tab!: ElementRef;
  @ViewChild('step12Tab') step12Tab!: ElementRef;
  selectTabByProcessStep(PAYROLL_PROCESS_STEP : number){
      if(PAYROLL_PROCESS_STEP <= this.TDS){
        this.CURRENT_TAB = PAYROLL_PROCESS_STEP;
      }
      this.navigateToTab(this.CURRENT_TAB);
    }
  
  navigateToTab(tabId:number){
    setTimeout(()=>{
      switch(tabId){
      case this.EPF:
        this.step10Tab.nativeElement.click();
        break;
      case this.ESI:
        this.step11Tab.nativeElement.click();
        break;
      case this.TDS:
        this.step12Tab.nativeElement.click();
        break;
      }
    }, 50)
  }


  CURRENT_TAB:number= this.EPF;
  getDataBySelectedTab(){
    switch(this.CURRENT_TAB){
      case this.EPF:
        this.getEpfDetails();
        break;
      case this.ESI:
        this.getEsiDetails();
        break;
      case this.TDS:
        this.getTdsDetails();
        break;
      }
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

  epfDetailsResponseList : EpfDetailsResponse[] = [];
  getEpfDetails() {
    this.epfDetailsResponseList = [];
      this.preRuleForShimmersAndErrorPlaceholdersForEpfDetailsResponse();
      this._payrollService.getEpfDetails(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search).subscribe(
          (response) => {
            if(response.status){
              this.epfDetailsResponseList = response.object;
              this.totalItems = response.totalItems;
                if(this.totalItems ==0){
                  this.dataNotFoundPlaceholderForEpfDetailsResponse = true;
                }
            }
            this.isShimmerForEpfDetailsResponse = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForEpfDetailsResponse = true;
            this.isShimmerForEpfDetailsResponse = false;
          }
        );
  }

  
  esiDetailsResponseList : EsiDetailsResponse[] = [];
  getEsiDetails() {
    this.esiDetailsResponseList = [];
      this.preRuleForShimmersAndErrorPlaceholdersForEsiDetailsResponse();
      this._payrollService.getEsiDetails(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search).subscribe(
        (response) => {
          if(response.status){
            this.esiDetailsResponseList = response.object;
            this.totalItems = response.totalItems;
              if(this.totalItems ==0){
                this.dataNotFoundPlaceholderForEsiDetailsResponse = true;
              }
          }
          this.isShimmerForEsiDetailsResponse = false;
        },
        (error) => {
          this.networkConnectionErrorPlaceHolderForEsiDetailsResponse = true;
          this.isShimmerForEsiDetailsResponse = false;
        }
      );
  }

  tdsDetailsResponseList : TdsDetailsResponse[] = [];
  getTdsDetails() {
    this.tdsDetailsResponseList = [];
      this.preRuleForShimmersAndErrorPlaceholdersForTdsDetailsResponse();
      this._payrollService.getTdsDetails(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search).subscribe(
          (response) => {
            if(response.status){
              this.tdsDetailsResponseList = response.object;
              this.totalItems = response.totalItems;
                if(this.totalItems ==0){
                  this.dataNotFoundPlaceholderForTdsDetailsResponse = true;
                }
            }
            this.isShimmerForTdsDetailsResponse = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForTdsDetailsResponse = true;
            this.isShimmerForTdsDetailsResponse = false;
          }
        );
  }


  selectTab(tab:number){
    this.CURRENT_TAB = tab;
    this.resetSearch();
  }

  searchDebounce(event:any){
    this.searchSubject.next(event)
  }



  searchByInput(event: any) {
    // this.isBeingSearch = true;
    var inp = String.fromCharCode(event.keyCode);
    if (event.type == 'paste') {
      let pastedText = event.clipboardData.getData('text');
      if (pastedText.length > 2) {
        this.pageNumber = 1;
        this.getDataBySelectedTab();
      }

    }else {
      if (this.search.length > 2 && /[a-zA-Z0-9.@]/.test(inp)) {
        this.pageNumber = 1;
        this.getDataBySelectedTab();

      }else if (event.code == 'Backspace' && (event.target.value.length >= 3)) {
        this.pageNumber = 1;
        this.getDataBySelectedTab();

      }else if (this.search.length == 0) {
        this.pageNumber = 1;
        this.search = '';
        this.getDataBySelectedTab();
      }
    }
  }


  resetSearch(){
    this.pageNumber = 1;
    this.totalItems= 0;
    this.search = '';
    this.getDataBySelectedTab();
  }




  pageChange(page:number){
    if(page!= this.pageNumber){
      this.pageNumber = page;
      this.getDataBySelectedTab();
    }

  }


  processing:boolean=false;
  updatePayrollStep(){
    this.processing = true;
    this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate).subscribe((response)=>{
      if(response.status){
        this.step = response.object;
         if( this.step <= this.TDS){
          this.CURRENT_TAB =  this.step;
          this.navigateToTab(this.CURRENT_TAB); 
         }else{
          this.back();
         }
        }
      this.processing = false;
    }, (error) => {
      this.processing = false;
    });
  }

}
