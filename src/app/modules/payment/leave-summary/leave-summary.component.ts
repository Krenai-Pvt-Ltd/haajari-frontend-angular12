import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';

@Component({
  selector: 'app-leave-summary',
  templateUrl: './leave-summary.component.html',
  styleUrls: ['./leave-summary.component.css']
})
export class LeaveSummaryComponent implements OnInit {


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

  readonly TOAST_STATUS_SUCCESS = Key.TOAST_STATUS_SUCCESS;
  readonly TOAST_STATUS_ERROR = Key.TOAST_STATUS_ERROR;

  constructor(private _dataService : DataService,
     private _payrollService : PayrollService,
     private _helperService:HelperService) {


  }

  ngOnInit(): void {
    this.getUserPendingLeaves();
  }


  attendanceAndLeaveSection(PAYROLL_PROCESS_STEP : number){

    // if(PAYROLL_PROCESS_STEP == this.LOP_REVERSAL){
    //   this.lopReversalTab();
    //   this.navigateToTab('step6-tab');
    // } else if(PAYROLL_PROCESS_STEP == this.LOP_SUMMARY){
    //   this.lopSummaryTab();
    //   this.navigateToTab('step5-tab');
    // } else{
    //   this.leavesTab();
    // }
  }

  // leavesTab(){
  //   this.CURRENT_TAB = this.LEAVES;
  //   this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = this.LEAVES;
  //   this.resetCriteriaFilter();
  //   console.log("==========getPendingLeaves==========")
  //   this.getUserPendingLeaves(); ///ABHIJEET
  //   // this.getPayrollLeaveResponseMethodCall();
  // }

  // lopSummaryTab(){
  //   this.CURRENT_TAB = this.LOP_SUMMARY;
  //   this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = this.LOP_SUMMARY;
  //   this.resetCriteriaFilter();
  //   this.getLopSummaryResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
  // }

  // lopReversalTab(){
  //   this.CURRENT_TAB = this.LOP_REVERSAL;
  //   this.CURRENT_TAB_IN_ATTENDANCE_AND_LEAVE = this.LOP_REVERSAL;
  //   this.resetCriteriaFilter();
  //   this.getLopReversalResponseByOrganizationIdAndStartDateAndEndDateMethodCall();
  // }

  back(){
    this.sendBulkDataToComponent();
  }

  isShimmerForPayrollLeaveResponse = false;
  dataNotFoundPlaceholderForPayrollLeaveResponse = false;
  networkConnectionErrorPlaceHolderForPayrollLeaveResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForPayrollLeaveResponse() {
    this.isShimmerForPayrollLeaveResponse = true;
    this.dataNotFoundPlaceholderForPayrollLeaveResponse = false;
    this.networkConnectionErrorPlaceHolderForPayrollLeaveResponse = false;
  }


  isShimmerForLopSummary = false;
  dataNotFoundPlaceholderForLopSummary = false;
  networkConnectionErrorPlaceHolderForLopSummary = false;
  preRuleForShimmersAndErrorPlaceholdersForLopSummary() {
    this.isShimmerForLopSummary = true;
    this.dataNotFoundPlaceholderForLopSummary = false;
    this.networkConnectionErrorPlaceHolderForLopSummary = false;
  }

  isShimmerForLopReversal = false;
  dataNotFoundPlaceholderForLopReversal = false;
  networkConnectionErrorPlaceHolderForLopReversal = false;
  preRuleForShimmersAndErrorPlaceholdersForLopReversal() {
    this.isShimmerForLopReversal = true;
    this.dataNotFoundPlaceholderForLopReversal = false;
    this.networkConnectionErrorPlaceHolderForLopReversal = false;
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
        this.total = response.totalItems;
        this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
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

  updatePayrollStep(){

    // this._payrollService.updatePayrollProcessStep(this.startDate, this.endDate, this.FINAL_SETTLEMENT).subscribe((response)=>{


    // }, ((error) => {

    // }))
  }


}
