import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { Routes } from 'src/app/constant/Routes';
import { LopReversalResponse } from 'src/app/models/lop-reversal-response';
import { LopSummaryResponse } from 'src/app/models/lop-summary-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-leave-summary',
  templateUrl: './leave-summary.component.html',
  styleUrls: ['./leave-summary.component.css']
})
export class LeaveSummaryComponent implements OnInit {


  itemPerPage: number = 10;
  pageNumber: number = 1;
  totalItems:number=0;
  search: string = '';

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

  readonly TOAST_STATUS_SUCCESS = Key.TOAST_STATUS_SUCCESS;
  readonly TOAST_STATUS_ERROR = Key.TOAST_STATUS_ERROR;

  readonly LEAVES = Key.LEAVES;
  readonly LOP_SUMMARY = Key.LOP_SUMMARY;
  readonly LOP_REVERSAL = Key.LOP_REVERSAL;

   private searchSubject = new Subject<boolean>();
   readonly Routes =Routes;

  constructor(private _dataService : DataService,
     private _payrollService : PayrollService,
           public rbacService: RoleBasedAccessControlService,
     public _helperService:HelperService) {

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


  @ViewChild('step4Tab') step4Tab!: ElementRef;
  @ViewChild('step5Tab') step5Tab!: ElementRef;
  @ViewChild('step6Tab') step6Tab!: ElementRef;
  selectTabByProcessStep(PAYROLL_PROCESS_STEP : number){
    if(PAYROLL_PROCESS_STEP <= this.LOP_REVERSAL){
      this.CURRENT_TAB = PAYROLL_PROCESS_STEP;
    }
    this.navigateToTab(this.CURRENT_TAB);
  }


  navigateToTab(tabId:number){
    setTimeout(()=>{
      switch(tabId){
      case this.LEAVES:
        this.step4Tab.nativeElement.click();
        break;
      case this.LOP_SUMMARY:
        this.step5Tab.nativeElement.click();
        break;
      case this.LOP_REVERSAL:
        this.step6Tab.nativeElement.click();
        break;
      }
    }, 50);
  }


  CURRENT_TAB:number= this.LEAVES;
  getDataBySelectedTab(){
    switch(this.CURRENT_TAB){
      case this.LEAVES:
        this.getUserPendingLeaves();
        break;
      case this.LOP_SUMMARY:
        this.getLOPSummaryDetail();
        break;
      case this.LOP_REVERSAL:
        this.getLOPReversalDetail();
        break;
      }
  }


  selectTab(tab:number){
    this.CURRENT_TAB = tab;
    this.resetSearch();
  }


  isShimmerForPayrollLeaveResponse = false;
  dataNotFoundPlaceholderForPayrollLeaveResponse = false;
  networkConnectionErrorPlaceHolderForPayrollLeaveResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForPayrollLeaveResponse() {
    this.isShimmerForPayrollLeaveResponse = true;
    this.dataNotFoundPlaceholderForPayrollLeaveResponse = false;
    this.networkConnectionErrorPlaceHolderForPayrollLeaveResponse = false;
    this.pendingLeavesList=[];
  }


  isShimmerForLopSummary = false;
  dataNotFoundPlaceholderForLopSummary = false;
  networkConnectionErrorPlaceHolderForLopSummary = false;
  preRuleForShimmersAndErrorPlaceholdersForLopSummary() {
    this.isShimmerForLopSummary = true;
    this.dataNotFoundPlaceholderForLopSummary = false;
    this.networkConnectionErrorPlaceHolderForLopSummary = false;
    this.lopSummaryResponseList = [];
  }

  isShimmerForLopReversal = false;
  dataNotFoundPlaceholderForLopReversal = false;
  networkConnectionErrorPlaceHolderForLopReversal = false;
  preRuleForShimmersAndErrorPlaceholdersForLopReversal() {
    this.isShimmerForLopReversal = true;
    this.dataNotFoundPlaceholderForLopReversal = false;
    this.networkConnectionErrorPlaceHolderForLopReversal = false;
    this.lopReversalResponseList=[];
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

  private downloadFile(response: Blob) {
    debugger
    const fileURL = URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = 'report.xlsx';  // You can change the file name
    a.click();
  }

  pendingLeavesList:any[]=[];
  getUserPendingLeaves(){
    this.preRuleForShimmersAndErrorPlaceholdersForPayrollLeaveResponse();
    this._payrollService.getPendingLeaves(this.startDate,this.endDate,this.pageNumber, this.itemPerPage).subscribe((response) => {
      if(response.status){
        this.pendingLeavesList = response.object;
        this.totalItems = response.totalItems;
        if(this.pendingLeavesList ==null || this.pendingLeavesList.length==0){
          this.dataNotFoundPlaceholderForPayrollLeaveResponse = true;
        }
      }
      this.isShimmerForPayrollLeaveResponse = false;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForPayrollLeaveResponse = true;
      this.isShimmerForPayrollLeaveResponse = false;

    })
  }




@ViewChild('pendingLeaveModalButton') pendingLeaveModalButton!:ElementRef;
  openLeaveLogsModal(leaveId : number, type:string ){
   this.rejectionReason = '';
   this.rejectionToggle = false;
   this.approvedLoader = false;
   this.rejecetdLoader = false;
   this.getPendingLeaveDetail(leaveId,type);
   this.pendingLeaveModalButton.nativeElement.click();
  }



  pendingLeaveDetail:any;
  pendingLeaveDetailFetch : boolean =false;
  getPendingLeaveDetail(leaveId: number, leaveType: string) {
    this.pendingLeaveDetailFetch = true;
    this._dataService.getRequestedUserLeaveByLeaveIdAndLeaveType(leaveId, leaveType).subscribe((response)  => {
        if(response.status){
          this.pendingLeaveDetail = response.object;
        }else{
          this.pendingLeaveDetail = null;
        }
        this.pendingLeaveDetailFetch = false;
      },(error)=>{
        this.pendingLeaveDetailFetch = false;
      });
  }




  approvedLoader:boolean = false;
  rejecetdLoader:boolean=false;
  rejectionToggle:boolean=false;
  rejectionReason: string ='';
  @ViewChild('closePendingLeaveModalButton')closePendingLeaveModalButton!:ElementRef;
  approveOrDenyLeave(leaveId: number, status: string) {
    if(status == 'approved'){
      this.approvedLoader = true;
    }else{
      this.rejecetdLoader = true;
    }
    this._dataService.approveOrRejectLeaveOfUser(leaveId, status, this.rejectionReason).subscribe(
      (response) => {
        if(response.status){
          this.closePendingLeaveModalButton.nativeElement.click();
          this.getUserPendingLeaves();
        }
        this.approvedLoader = false;
        this.rejecetdLoader = false;
      },(error) => {
        this.approvedLoader = false;
        this.rejecetdLoader = false;
        this._helperService.showToast('Error processing!',Key.TOAST_STATUS_ERROR);
      });
  }

  processing:boolean=false;
  updatePayrollStep(){
    this.processing = true;
    this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.CURRENT_TAB).subscribe((response)=>{
      if(response.status){
        this.step = response.object;
         if( this.step <= this.LOP_REVERSAL){
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

  lopSummaryResponseList : LopSummaryResponse [] = new Array();
  getLOPSummaryDetail(){
    this.preRuleForShimmersAndErrorPlaceholdersForLopSummary();
    this._payrollService.getPendingLeaves(this.startDate,this.endDate,this.pageNumber, this.itemPerPage).subscribe((response) => {
      if(response.status){
        this.lopSummaryResponseList = []
        // response.object;
        this.totalItems = 0;
        // response.totalItems;
        if(this.lopSummaryResponseList ==null || this.lopSummaryResponseList.length==0){
          this.dataNotFoundPlaceholderForLopSummary = true;
        }
      }
      this.isShimmerForLopSummary = false;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForLopSummary = true;
      this.isShimmerForLopSummary = false;

    })
  }

  lopReversalResponseList : LopReversalResponse []= new Array();
  getLOPReversalDetail(){
    this.preRuleForShimmersAndErrorPlaceholdersForPayrollLeaveResponse();
    this._payrollService.getPendingLeaves(this.startDate,this.endDate,this.pageNumber, this.itemPerPage).subscribe((response) => {
      if(response.status){
        this.lopReversalResponseList = []
        // response.object;
        this.totalItems = 0;
        // response.totalItems;
        if(this.lopReversalResponseList ==null || this.lopReversalResponseList.length==0){
          this.dataNotFoundPlaceholderForLopReversal = true;
        }
      }
      this.isShimmerForLopReversal = false;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForLopReversal = true;
      this.isShimmerForLopReversal = false;

    })
  }
}
