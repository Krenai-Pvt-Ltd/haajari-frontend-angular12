import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { PayActionType } from 'src/app/models/pay-action-type';
import { SalaryChangeBonusResponse } from 'src/app/models/salary-change-bonus-response';
import { SalaryChangeOvertimeResponse } from 'src/app/models/salary-change-overtime-response';
import { SalaryChangeResponse } from 'src/app/models/salary-change-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';

@Component({
  selector: 'app-earning-management',
  templateUrl: './earning-management.component.html',
  styleUrls: ['./earning-management.component.css']
})
export class EarningManagementComponent implements OnInit {


  itemPerPage: number = 10;
  pageNumber: number = 1;
  search: string = '';
  totalItems: number = 0;

  readonly SALARY_CHANGE = Key.SALARY_CHANGE;
  readonly BONUS = Key.BONUS;
  readonly OVERTIME = Key.OVERTIME;

  @Input() step:any;
  @Input() startDate:any;
  @Input() endDate:any;
  @Output() getData: EventEmitter<number> = new EventEmitter<number>();
    
  sendBulkDataToComponent() {
    this.getData.emit(this.step);
  }


  back(){
    this.sendBulkDataToComponent();
  }

  private searchSubject = new Subject<boolean>();

  constructor(private _dataService : DataService, 
    public _helperService : HelperService,
    private _payrollService : PayrollService) { 


    this.searchSubject.pipe(debounceTime(250)) // Wait for 250ms before emitting the value
        .subscribe(searchText => {
          this.searchByInput(searchText);
        });
    }

  ngOnInit(): void {
    window.scroll(0,0);
    this.selectTabByProcessStep(this.step);
  }


  @ViewChild('step7Tab') step7Tab!: ElementRef;
  @ViewChild('step8Tab') step8Tab!: ElementRef;
  @ViewChild('step9Tab') step9Tab!: ElementRef;
  selectTabByProcessStep(PAYROLL_PROCESS_STEP : number){
    if(PAYROLL_PROCESS_STEP <= this.OVERTIME){
      this.CURRENT_TAB = PAYROLL_PROCESS_STEP;
    }
    this.navigateToTab(this.CURRENT_TAB);
  }


  navigateToTab(tabId:number){
    setTimeout(()=>{
      switch(tabId){
      case this.SALARY_CHANGE:
        this.step7Tab.nativeElement.click();
        break;
      case this.BONUS:
        this.step8Tab.nativeElement.click();
        break;
      case this.OVERTIME:
        this.step9Tab.nativeElement.click();
        break;
      }
    }, 50)
  }



  CURRENT_TAB:number= this.SALARY_CHANGE;
  getDataBySelectedTab(){
    switch(this.CURRENT_TAB){
      case this.SALARY_CHANGE:
        this.getUserSalaryChange();
        break;
      case this.BONUS:
        this.getUserBonus();
        break;
      case this.OVERTIME:
        this.getUserOvertime();
        break;
    }
  }

  isShimmerForSalaryChangeResponse = false;
  dataNotFoundPlaceholderForSalaryChangeResponse = false;
  networkConnectionErrorPlaceHolderForSalaryChangeResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryChangeResponse() {
    this.isShimmerForSalaryChangeResponse = true;
    this.dataNotFoundPlaceholderForSalaryChangeResponse = false;
    this.networkConnectionErrorPlaceHolderForSalaryChangeResponse = false;
    this.salaryChangeResponseList = [];
  }

  isShimmerForSalaryChangeBonusResponse = false;
  dataNotFoundPlaceholderForSalaryChangeBonusResponse = false;
  networkConnectionErrorPlaceHolderForSalaryChangeBonusResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryChangeBonusResponse() {
    this.isShimmerForSalaryChangeBonusResponse = true;
    this.dataNotFoundPlaceholderForSalaryChangeBonusResponse = false;
    this.networkConnectionErrorPlaceHolderForSalaryChangeBonusResponse = false;
    this.salaryChangeBonusResponseList = [];
  }

  isShimmerForSalaryChangeOvertimeResponse = false;
  dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = false;
  networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryChangeOvertimeResponse() {
    this.isShimmerForSalaryChangeOvertimeResponse = true;
    this.dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = false;
    this.networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = false;
    this.salaryChangeOvertimeResponseList = [];
  }




  salaryChangeResponseList : SalaryChangeResponse[] = [];
  getUserSalaryChange(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeResponse();
    this._payrollService.getUserSalaryChange(this.startDate, this.endDate, 
        this.itemPerPage, this.pageNumber, this.search).subscribe((response) => {

      if(response.object==null || response.object.length == 0){
        this.dataNotFoundPlaceholderForSalaryChangeResponse = true;
      } else{
        this.salaryChangeResponseList = response.object;
        this.totalItems = response.totalItems;
      }

      this.isShimmerForSalaryChangeResponse = false;
    }, (error) => {
      this.isShimmerForSalaryChangeResponse = false;
      this.networkConnectionErrorPlaceHolderForSalaryChangeResponse = true;
    })
  }

  searchDebounce(event:any){
    this.searchSubject.next(event)
  }

  selectTab(tab:number){
    this.CURRENT_TAB = tab;
    this.resetSearch();
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


  

  pageChange(page:any){
    if(this.pageNumber != page){
      this.pageNumber = page; 
      this.getDataBySelectedTab();
    }
  }

  salaryChangeBonusResponseList : SalaryChangeBonusResponse[] = [];
  getUserBonus(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeBonusResponse();
    this._payrollService.getUserBonusAndDeduction(this.startDate, this.endDate,this.itemPerPage, this.pageNumber).subscribe((response) => {

      if(response.object==null || response.object.length == 0){
        this.dataNotFoundPlaceholderForSalaryChangeBonusResponse = true;
      } else{
        this.salaryChangeBonusResponseList = response.object;
        this.totalItems = response.totalItems;
      }

      this.isShimmerForSalaryChangeBonusResponse = false;
    }, (error) => {
      this.isShimmerForSalaryChangeBonusResponse = false;
      this.networkConnectionErrorPlaceHolderForSalaryChangeResponse = true;
    })
  }

 
  


  salaryChangeOvertimeResponseList : SalaryChangeOvertimeResponse[] = [];
  getUserOvertime(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeOvertimeResponse();
    this._payrollService.getUserOvertime(this.startDate, this.endDate, this.itemPerPage, this.pageNumber).subscribe((response) => {

      if(this._helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = true;
      } else{
        this.salaryChangeOvertimeResponseList = response.listOfObject;
        this.totalItems = response.totalItems;
   
      }
      this.isShimmerForSalaryChangeOvertimeResponse = false;
    }, (error) => {
      this.isShimmerForSalaryChangeOvertimeResponse = false;
      this.networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = true;
    })
  }


  processing:boolean=false;
  updatePayrollStep(){
    this.processing = true;
    this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate,this.CURRENT_TAB).subscribe((response)=>{
      if(response.status){
        this.step = response.object;
        if( this.step <= this.OVERTIME){
          this.CURRENT_TAB =  this.step;
          this.navigateToTab(this.CURRENT_TAB);
         }else{
          this.back();
         }
        }
      this.processing = false;
    }, (error) => {
      this.processing = true;
    });
  }




}
