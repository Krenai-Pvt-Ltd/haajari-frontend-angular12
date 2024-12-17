import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { constant } from 'src/app/constant/constant';
import { FinalSettlementResponse } from 'src/app/models/final-settlement-response';
import { NewJoineeResponse } from 'src/app/models/new-joinee-response';
import { PayActionType } from 'src/app/models/pay-action-type';
import { UserExitResponse } from 'src/app/models/user-exit-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css']
})
export class EmployeeManagementComponent implements OnInit {


  itemPerPage: number = 8;
  pageNumber: number = 1;
  lastPageNumber: number = 0;
  sort: string = 'asc';
  sortBy: string = 'id';
  search: string = '';
  searchBy: string = 'name';
  total: number = 0;

  readonly constant = constant;

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
    // this.getNewJoineeResponsesFromAPI();
    this.getNewJoineeByOrganizationIdMethodCall();
    this.getUserInExitProcess();
    this.getFullNFinalUser();
  }


  employeeChangesSection(PAYROLL_PROCESS_STEP : number){
    // if(PAYROLL_PROCESS_STEP == this.FINAL_SETTLEMENT){
    //   this.finalSettlementTab();
    //   this.navigateToTab('step3-tab');
    // } else if(PAYROLL_PROCESS_STEP == this.USER_EXIT){
    //   this.userExitTab();
    //   this.navigateToTab('step2-tab');
    // } else{
    //   this.newJoineeTab();
    // }
  }


  // newJoineeTab() {
  //   this.CURRENT_TAB = this.NEW_JOINEE;
  //   this.CURRENT_TAB_IN_EMPLOYEE_CHANGE = this.NEW_JOINEE;
  //   this.resetCriteriaFilter();
  //   this.getNewJoineeByOrganizationIdMethodCall();
  // }

  // userExitTab() {
  //   this.CURRENT_TAB = this.USER_EXIT;
  //   this.CURRENT_TAB_IN_EMPLOYEE_CHANGE = this.USER_EXIT;
  //   this.resetCriteriaFilter();
  //   this.getUserExitByOrganizationIdMethodCall();
  // }

  // finalSettlementTab() {
  //   this.CURRENT_TAB = this.FINAL_SETTLEMENT;
  //   this.CURRENT_TAB_IN_EMPLOYEE_CHANGE = this.FINAL_SETTLEMENT;
  //   this.resetCriteriaFilter();
  //   this.getFinalSettlementByOrganizationIdMethodCall();
  // }


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
    this.userExitResponseList = [];
  }

  isShimmerForFinalSettlement = false;
  dataNotFoundPlaceholderForFinalSettlement = false;
  networkConnectionErrorPlaceHolderForFinalSettlement = false;
  preRuleForShimmersAndErrorPlaceholdersForFinalSettlement() {
    this.isShimmerForFinalSettlement = true;
    this.dataNotFoundPlaceholderForFinalSettlement = false;
    this.networkConnectionErrorPlaceHolderForFinalSettlement = false;
    this.finalSettlementResponseList = [];
  }


  payActionTypeList:any[]=[];
  newJoineeResponseList: NewJoineeResponse[] = [];
  debounceTimer: any;
  selectedPayActionCache: { [uuid: string]: PayActionType } = {};
  commentCache: { [uuid: string]: string } = {};
  getNewJoineeByOrganizationIdMethodCall(debounceTime: number = 300) {
    this.newJoineeResponseList = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersForNewJoinee();
      this._dataService
        .getNewJoineeByOrganizationId(
          this.itemPerPage,
          this.pageNumber,
          this.search,
          this.startDate,
          this.endDate
        )
        .subscribe(
          (response) => {
            if (this._helperService.isListOfObjectNullOrUndefined(response)) {
              this.dataNotFoundPlaceholderForNewJoinee = true;
            } else {
              this.newJoineeResponseList = response.listOfObject
              // .map((joinee: NewJoineeResponse) => {
              //   // Apply cached selection if available
              //   if (this.selectedPayActionCache[joinee.uuid]) {
              //     joinee.payActionType = this.selectedPayActionCache[joinee.uuid];
              //     joinee.payActionTypeId = this.selectedPayActionCache[joinee.uuid].id;
              //   } else {
              //     // Set initial selection based on payActionTypeId
              //     const selectedPayActionType = this.payActionTypeList.find(
              //       (payActionType) => payActionType.id === joinee.payActionTypeId
              //     );
              //     if (selectedPayActionType) {
              //       joinee.payActionType = selectedPayActionType;
              //     }
              //   }
              //      // Apply cached comment if available
              //      if (this.commentCache[joinee.uuid]) {
              //       joinee.comment = this.commentCache[joinee.uuid];
              //     }
  
              //   return joinee;
              // });
              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            }
            this.isShimmerForNewJoinee = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForNewJoinee = true;
            this.isShimmerForNewJoinee = false;
          }
        );
    }, debounceTime);
  }


  newJoineeResponseOptions: { payActionTypeId: number, label: string }[] = [];
  getNewJoineeResponsesFromAPI(): void {
    // Fetch data from the API
    this._dataService
    .getNewJoineeByOrganizationId(
      this.itemPerPage,
      this.pageNumber,
      this.search,
      this.startDate,
      this.endDate
    ).subscribe(response => {
      this.newJoineeResponseList = response.listOfObject;
  
      // Map the data to the required format for nz-select
      this.newJoineeResponseOptions = this.newJoineeResponseList.map(item => ({
        payActionTypeId: item.payActionTypeId,
        label: item.name  // Assuming 'name' is used for label
      }));
    });
  }



    //Fetching the user exit data
    userExitResponseList: UserExitResponse[] = [];
    // getUserExitByOrganizationIdMethodCall(debounceTime: number = 300) {
    //   debugger
    //   this.userExitResponseList = [];
  
    //   if (this.debounceTimer) {
    //     clearTimeout(this.debounceTimer);
    //   }
  
    //   this.debounceTimer = setTimeout(() => {
    //     this.preRuleForShimmersAndErrorPlaceholdersForUserExit();
    //     this._payrollService.getUserInExitProcess(
    //         this.itemPerPage,
    //         this.pageNumber,
    //         this.search,
    //         this.startDate,
    //         this.endDate).subscribe((response) => {
    //           if (this._helperService.isListOfObjectNullOrUndefined(response)) {
    //             this.dataNotFoundPlaceholderForUserExit = true;
    //           } else {
    //             this.userExitResponseList = response.listOfObject.map((exit: UserExitResponse) => {
    //               // Apply cached pay action type if available
    //               if (this.selectedPayActionCache[exit.uuid]) {
    //                 exit.payActionType = this.selectedPayActionCache[exit.uuid];
    //                 exit.payActionTypeId = this.selectedPayActionCache[exit.uuid].id;
    //                 // console.log(exit.name, exit.payActionType)
    //               } else {
    //                 // Set initial selection based on payActionTypeId
    //                 const selectedPayActionType = this.payActionTypeList.find(
    //                   (payActionType) => payActionType.id === exit.payActionTypeId
    //                 );
    //                 if (selectedPayActionType) {
    //                   exit.payActionType = selectedPayActionType;
    //                 }
    //               }
  
    //               // Apply cached comment if available
    //               if (this.commentCache[exit.uuid]) {
    //                 exit.comment = this.commentCache[exit.uuid];
    //               }
  
    //               return exit;
    //             });
    //             this.total = response.totalItems;
    //             this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
    //           }
    //           this.isShimmerForUserExit = false;
    //         },
    //         (error) => {
    //           this.networkConnectionErrorPlaceHolderForUserExit = true;
    //           this.isShimmerForUserExit = false;
    //         }
    //       );
    //   }, debounceTime);
    // }
  
    //Fetching the final settlement data
    finalSettlementResponseList: FinalSettlementResponse[] = [];
    // getFinalSettlementByOrganizationIdMethodCall(debounceTime: number = 300) {
    //   this.finalSettlementResponseList = [];
  
    //   if (this.debounceTimer) {
    //     clearTimeout(this.debounceTimer);
    //   }
  
    //   this.debounceTimer = setTimeout(() => {
    //     this.preRuleForShimmersAndErrorPlaceholdersForFinalSettlement();
    //     this._dataService
    //       .getFinalSettlementByOrganizationId(
    //         this.itemPerPage,
    //         this.pageNumber,
    //         this.sort,
    //         this.sortBy,
    //         this.search,
    //         this.searchBy,
    //         this.startDate,
    //         this.endDate
    //       )
    //       .subscribe(
    //         (response) => {
    //           if (this._helperService.isListOfObjectNullOrUndefined(response)) {
    //             this.dataNotFoundPlaceholderForFinalSettlement = true;
    //           } else {
    //             this.finalSettlementResponseList = response.listOfObject.map((settlement: FinalSettlementResponse) => {
    //               // Apply cached pay action type if available
    //               if (this.selectedPayActionCache[settlement.uuid]) {
    //                 settlement.payActionType = this.selectedPayActionCache[settlement.uuid];
    //                 settlement.payActionTypeId = this.selectedPayActionCache[settlement.uuid].id;
    //               } else {
    //                 // Set initial selection based on payActionTypeId
    //                 const selectedPayActionType = this.payActionTypeList.find(
    //                   (payActionType) => payActionType.id === settlement.payActionTypeId
    //                 );
    //                 if (selectedPayActionType) {
    //                   settlement.payActionType = selectedPayActionType;
    //                 }
    //               }
  
    //               // Apply cached comment if available
    //               if (this.commentCache[settlement.uuid]) {
    //                 settlement.comment = this.commentCache[settlement.uuid];
    //               }
  
    //               return settlement;
    //             });
    //             this.total = response.totalItems;
    //             this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
    //           }
    //           this.isShimmerForFinalSettlement = false;
    //         },
    //         (error) => {
    //           this.networkConnectionErrorPlaceHolderForFinalSettlement = true;
    //           this.isShimmerForFinalSettlement = false;
    //         }
    //       );
    //   }, debounceTime);
    // }



    // searchNewJoinee(event: Event) {
    //   this._helperService.ignoreKeysDuringSearch(event);
    //   this.resetCriteriaFilterMicro();
    //   this.getNewJoineeByOrganizationIdMethodCall();
    // }
  
    // searchUserExit(event: Event) {
    //   this._helperService.ignoreKeysDuringSearch(event);
    //   this.resetCriteriaFilterMicro();
    //   this.getUserExitByOrganizationIdMethodCall();
    // }
  
    searchUsers(event: Event, step: number) {
      this._helperService.ignoreKeysDuringSearch(event);
      // this.resetCriteriaFilterMicro();
  
      // if (step == this.NEW_JOINEE) {
      //   this.getNewJoineeByOrganizationIdMethodCall();
      // }
  
      // if (step == this.USER_EXIT) {
      //   this.getUserExitByOrganizationIdMethodCall();
      // }
  
      // if (step == this.FINAL_SETTLEMENT) {
      //   this.getFinalSettlementByOrganizationIdMethodCall();
      // }
    }
  
    // Clearing search text
    clearSearch(step: number) {
      // this.resetCriteriaFilter();
      // if (step == this.NEW_JOINEE) {
      //   this.getNewJoineeByOrganizationIdMethodCall();
      // }
  
      // if (step == this.USER_EXIT) {
      //   this.getUserExitByOrganizationIdMethodCall();
      // }
  
      // if (step == this.FINAL_SETTLEMENT) {
      //   this.getFinalSettlementByOrganizationIdMethodCall();
      // }
    }
  
    // resetCriteriaFilter() {
    //   this.itemPerPage = 8;
    //   this.pageNumber = 1;
    //   this.lastPageNumber = 0;
    //   this.total = 0;
    //   this.sort = 'asc';
    //   this.sortBy = 'id';
    //   this.search = '';
    //   this.searchBy = 'name';
      
    // }
  
    // resetCriteriaFilterMicro() {
    //   this.itemPerPage = 8;
    //   this.pageNumber = 1;
    //   this.lastPageNumber = 0;
    //   this.total = 0;
    // }


    getUserInExitProcess() {
        this.preRuleForShimmersAndErrorPlaceholdersForUserExit();
        this._payrollService.getUserInExitProcess(this.startDate,this.endDate,0,this.itemPerPage,this.pageNumber,this.search).subscribe((response) => {
              if (response.object == null || response.object.length == 0) {
                this.dataNotFoundPlaceholderForUserExit = true;
              } else {
                this.userExitResponseList = response.object
                this.total = response.totalItems;
              }
              this.isShimmerForUserExit = false;
            },
            (error) => {
              this.networkConnectionErrorPlaceHolderForUserExit = true;
              this.isShimmerForUserExit = false;
            });
    }


    getFullNFinalUser() {
      this.preRuleForShimmersAndErrorPlaceholdersForFinalSettlement();
      this._payrollService.getUserInExitProcess(this.startDate,this.endDate,1,this.itemPerPage,this.pageNumber,this.search).subscribe((response) => {
            if (response.object == null || response.object.length == 0) {
              this.dataNotFoundPlaceholderForFinalSettlement = true;
            } else {
              this.finalSettlementResponseList = response.object
              this.total = response.totalItems;
            }
            this.isShimmerForFinalSettlement = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForFinalSettlement = true;
            this.isShimmerForFinalSettlement = false;
          });
  }


  updatePayrollStep(){

    // this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.FINAL_SETTLEMENT).subscribe((response)=>{
     
    
    // }, ((error) => {
    
    // }))
  }
  payActionTypes = [
    { id: 1, value: 'PROCESS' },
    { id: 2, value: 'HOLD' }
  ];



  holdIds: number[] = []; 
  onPayActionTypeChange(data:any){
    console.log("==============log==========",data);
    // Check if the ID exists in the array
    // const index = this.holdIds.findIndex(x => x === data.id);
    // if (index == -1) {
    //   this.holdIds.push(data.id); // Add ID if not already in the array
    // } else {
    //   this.holdIds.splice(index, 1); // Remove ID if it exists
    // }
    // console.log("==============holdIds==========",this.holdIds);
  }

}
