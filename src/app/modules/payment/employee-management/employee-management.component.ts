import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { FinalSettlementResponse } from 'src/app/models/final-settlement-response';
import { NewJoineeResponse } from 'src/app/models/new-joinee-response';
import { PayActionType } from 'src/app/models/pay-action-type';
import { UserExitResponse } from 'src/app/models/user-exit-response';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css']
})
export class EmployeeManagementComponent implements OnInit {


  itemPerPage: number = 10;
  pageNumber: number = 1;
  totalItems:number=0;
  search: string = '';
  total: number = 0;

  readonly constant = constant;

  readonly NEW_JOINEE = Key.NEW_JOINEE;
  readonly USER_EXIT = Key.USER_EXIT;
  readonly FINAL_SETTLEMENT = Key.FINAL_SETTLEMENT;

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

  constructor(public _helperService : HelperService,
  private _payrollService : PayrollService) {


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


  ngOnDestroy() {
    this.searchSubject.complete();
  }

  @ViewChild('step1Tab') step1Tab!: ElementRef;
  @ViewChild('step2Tab') step2Tab!: ElementRef;
  @ViewChild('step3Tab') step3Tab!: ElementRef;
  selectTabByProcessStep(PAYROLL_PROCESS_STEP : number){
    if(PAYROLL_PROCESS_STEP <= this.FINAL_SETTLEMENT){
      this.CURRENT_TAB = PAYROLL_PROCESS_STEP;
    }
    this.navigateToTab(this.CURRENT_TAB);
  }

  navigateToTab(tabId:number){
    setTimeout(()=>{
      switch(tabId){
      case this.NEW_JOINEE:
        this.step1Tab.nativeElement.click();
        break;
      case this.USER_EXIT:
        this.step2Tab.nativeElement.click();
        break;
      case this.FINAL_SETTLEMENT:
        this.step3Tab.nativeElement.click();
        break;
      }
    }, 50)
  }


  isShimmerForNewJoinee = false;
  dataNotFoundPlaceholderForNewJoinee = false;
  networkConnectionErrorPlaceHolderForNewJoinee = false;
  preRuleForShimmersAndErrorPlaceholdersForNewJoinee() {
    this.isShimmerForNewJoinee = true;
    this.dataNotFoundPlaceholderForNewJoinee = false;
    this.networkConnectionErrorPlaceHolderForNewJoinee = false;
    this.newJoineeResponseList = [];
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

  selectTab(tab:number){
    this.CURRENT_TAB = tab;
    this.resetSearch();
  }

  isDownLoading = false;
  download(category:string){
    this.isDownLoading = true;
    this._payrollService
    .generateReport(this.startDate, this.endDate, category, this.search)
    .subscribe((response) => {
      this.isDownLoading = false;
      this.downloadFile(response);
    }
    , (error) => {
      console.log("Error", error);
      this.isDownLoading = false;
    });
  }

  newJoineeResponseList: NewJoineeResponse[] = [];
  getNewJoinee() {

      this.preRuleForShimmersAndErrorPlaceholdersForNewJoinee();
      this._payrollService.getNewJoinee(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search).subscribe((response) => {
            if (response.status) {
                if(response.object == null || response.object.length == 0){
                  this.dataNotFoundPlaceholderForNewJoinee = true;
                }else{
                  this.newJoineeResponseList = response.object;
                  this.totalItems = response.totalItems;
                }
            }
            this.isShimmerForNewJoinee = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForNewJoinee = true;
            this.isShimmerForNewJoinee = false;
          }
        );
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

  CURRENT_TAB:number= this.NEW_JOINEE;
  getDataBySelectedTab(){
    switch(this.CURRENT_TAB){
      case this.NEW_JOINEE:
        this.getNewJoinee();
        break;
      case this.USER_EXIT:
        this.getUserInExitProcess();
        break;
      case this.FINAL_SETTLEMENT:
        this.getFullNFinalUser();
        break;
      }
  }
   

 //Fetching the user exit data
 userExitResponseList: UserExitResponse[] = [];
    getUserInExitProcess() {
        this.preRuleForShimmersAndErrorPlaceholdersForUserExit();
        this._payrollService.getUserInExitProcess(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search).subscribe((response) => {
              if (response.object == null || response.object.length == 0) {
                this.dataNotFoundPlaceholderForUserExit = true;
              } else {
                this.userExitResponseList = response.object
                this.totalItems = response.totalItems;
              }
              this.isShimmerForUserExit = false;
            },
            (error) => {
              this.networkConnectionErrorPlaceHolderForUserExit = true;
              this.isShimmerForUserExit = false;
            });
    }

  //Fetching the final settlement data
  finalSettlementResponseList: FinalSettlementResponse[] = [];
    getFullNFinalUser() {
      this.preRuleForShimmersAndErrorPlaceholdersForFinalSettlement();
      this._payrollService.getFNFUser(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search).subscribe((response) => {
            if (response.object == null || response.object.length == 0) {
              this.dataNotFoundPlaceholderForFinalSettlement = true;
            } else {
              this.finalSettlementResponseList = response.object
              this.totalItems = response.totalItems;
            }
            this.isShimmerForFinalSettlement = false;
          },
          (error) => {
            this.networkConnectionErrorPlaceHolderForFinalSettlement = true;
            this.isShimmerForFinalSettlement = false;
          });
  }


  processing:boolean=false;
  updatePayrollStep(){
    this.processing = true;
    this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate).subscribe((response)=>{
      if(response.status){
      this.step = response.object;
       if( this.step <= this.FINAL_SETTLEMENT){
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



  payActionTypes = [
    { id: 1, value: 'PROCESS' },
    { id: 2, value: 'HOLD' }
  ];
  holdActionIds: number[] = [];
  onPayActionTypeChange(data:any){
    // Check if the ID exists in the array
    const index = this.holdActionIds.findIndex(x => x === data.id);
    if (index == -1) {
      this.holdActionIds.push(data.id); // Add ID if not already in the array
    } else {
      this.holdActionIds.splice(index, 1); // Remove ID if it exists
    }
  }

  pageChange(page:any){
    if(page!= this.pageNumber){
      this.pageNumber = page;
      this.getDataBySelectedTab();
    }

  }

  private downloadFile(response: Blob) {
    const fileURL = URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = 'report.xlsx';  // You can change the file name
    a.click();
  }

}
