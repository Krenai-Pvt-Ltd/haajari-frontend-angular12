import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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


  itemPerPage: number = 8;
  pageNumber: number = 1;
  lastPageNumber: number = 0;
  search: string = '';
  totalItems: number = 0;

  readonly SALARY_CHANGE = Key.SALARY_CHANGE;
  readonly BONUS = Key.BONUS;
  readonly OVERTIME = Key.OVERTIME;

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
    private _helperService : HelperService,
    private _payrollService : PayrollService) { }

  ngOnInit(): void {
    this.getUserSalaryChange();
    this.getUserBonus();
  }


  salaryChangeSection(PAYROLL_PROCESS_STEP : number){
    this.pageNumber = 1;
    if(PAYROLL_PROCESS_STEP == this.OVERTIME){
      // this.overtimeTab();
      // this.navigateToTab('step9-tab');
    } else if(PAYROLL_PROCESS_STEP == this.BONUS){
      // this.bonusTab();
      // this.navigateToTab('step8-tab');
    } else{
      // this.salaryChangeTab();
    }
  }

  // salaryChangeTab(){
  //   this.CURRENT_TAB = this.SALARY_CHANGE;
  //   this.CURRENT_TAB_IN_SALARY_CHANGE = this.SALARY_CHANGE;
  //   this.resetCriteriaFilter();
  //   this.getSalaryChangeResponseListByOrganizationIdMethodCall();
  // }

  // bonusTab(){
  //   this.CURRENT_TAB = this.BONUS;
  //   this.CURRENT_TAB_IN_SALARY_CHANGE = this.BONUS;
  //   this.resetCriteriaFilter();
  //   this.getSalaryChangeBonusResponseListByOrganizationIdMethodCall();
  // }

  // overtimeTab(){
  //   this.CURRENT_TAB = this.OVERTIME;
  //   this.CURRENT_TAB_IN_SALARY_CHANGE = this.OVERTIME;
  //   this.resetCriteriaFilter();
  //   this.getSalaryChangeOvertimeResponseListByOrganizationIdMethodCall();
  // }

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


  pageChange(page:any, section:any){
    if(this.pageNumber != page){
      this.pageNumber = page; 
      if(section == this.SALARY_CHANGE){
        this.getUserSalaryChange();
      }else if(section == this.BONUS){
        this.getUserBonus();
      }else if(section == this.OVERTIME){ 
        this.getUserOvertime();
      }
    }
    

  }

  startIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }

  lastIndex(): number {
    return Math.min(this.pageNumber * this.itemPerPage, this.totalItems);
  }


  searching(event:any){

  }

  clearSearch(event:any){

  }


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




  payActionTypeList:any[]=[];
  debounceTimer: any;
  selectedPayActionCache: { [uuid: string]: PayActionType } = {};
  commentCache: { [uuid: string]: string } = {};
  salaryChangeBonusResponseList : SalaryChangeBonusResponse[] = [];
  // getSalaryChangeBonusResponseListByOrganizationIdMethodCall(debounceTime: number = 300) {
  //   this.salaryChangeBonusResponseList = [];

  //   if (this.debounceTimer) {
  //     clearTimeout(this.debounceTimer);
  //   }

  //   this.debounceTimer = setTimeout(() => {
  //     this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeBonusResponse();
  //     this._payrollService
  //       .getBonusResponseList(
  //         this.startDate,
  //         this.endDate,
  //         this.itemPerPage,
  //         this.pageNumber
  //       )
  //       .subscribe(
  //         (response) => {
  //           if (this._helperService.isListOfObjectNullOrUndefined(response)) {
  //             this.dataNotFoundPlaceholderForSalaryChangeBonusResponse = true;
  //           } else {
  //             this.salaryChangeBonusResponseList = response.listOfObject.map((salaryChangeBonus: SalaryChangeBonusResponse) => {
  //               // Apply cached selection if available
  //               if (this.selectedPayActionCache[salaryChangeBonus.uuid]) {
  //                 salaryChangeBonus.payActionType = this.selectedPayActionCache[salaryChangeBonus.uuid];
  //                 salaryChangeBonus.payActionTypeId = this.selectedPayActionCache[salaryChangeBonus.uuid].id;
  //               } else {
  //                 // Set initial selection based on payActionTypeId
  //                 const selectedPayActionType = this.payActionTypeList.find(
  //                   (payActionType) => payActionType.id === salaryChangeBonus.payActionTypeId
  //                 );
  //                 if (selectedPayActionType) {
  //                   salaryChangeBonus.payActionType = selectedPayActionType;
  //                 }
  //               }

  //               // Apply cached comment if available
  //               if (this.commentCache[salaryChangeBonus.uuid]) {
  //                 salaryChangeBonus.comment = this.commentCache[salaryChangeBonus.uuid];
  //               }

  //               return salaryChangeBonus;
  //             });
  //             this.totalItems = response.totalItems;
  //             // this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
  //           }
  //           this.isShimmerForSalaryChangeBonusResponse = false;
  //         },
  //         (error) => {
  //           this.isShimmerForSalaryChangeBonusResponse = false;
  //           this.networkConnectionErrorPlaceHolderForSalaryChangeBonusResponse = true;
  //         }
  //       );
  //   }, debounceTime);
  // }


  salaryChangeOvertimeResponseList : SalaryChangeOvertimeResponse[] = [];
  getUserOvertime(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryChangeOvertimeResponse();
    // this._dataService.getSalaryChangeOvertimeResponseListByOrganizationId(this.startDate, this.endDate, this.itemPerPage, this.pageNumber).subscribe((response) => {

    //   if(this._helperService.isListOfObjectNullOrUndefined(response)){
    //     this.dataNotFoundPlaceholderForSalaryChangeOvertimeResponse = true;
    //   } else{
    //     this.salaryChangeOvertimeResponseList = response.listOfObject;
    //     this.totalItems = response.totalItems;
    //     // this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
    //   }
    //   this.isShimmerForSalaryChangeOvertimeResponse = false;
    // }, (error) => {
    //   this.isShimmerForSalaryChangeOvertimeResponse = false;
    //   this.networkConnectionErrorPlaceHolderForSalaryChangeOvertimeResponse = true;
    // })
  }


  updatePayrollStep(){

    // this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.FINAL_SETTLEMENT).subscribe((response)=>{
     
    
    // }, ((error) => {
    
    // }))
  }
  

}
