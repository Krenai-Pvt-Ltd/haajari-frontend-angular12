import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import { Key } from 'src/app/constant/key';
import { FullLeaveLogsResponse, PendingLeaveResponse, PendingLeavesResponse } from 'src/app/models/leave-responses.model';
import { UserDto } from 'src/app/models/user-dto.model';
import { UserLeaveRequest } from 'src/app/models/user-leave-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';


@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css']
})
export class LeaveManagementComponent implements OnInit {

  // fullLeaveLogs!: FullLeaveLogsResponse[];
  fullLeaveLogs: any[] = [];
  pendingLeaves: any[] = [];
  approvedRejectedLeaves: any[] = [];
  // pendingLeaves!: PendingLeavesResponse[];
  // approvedRejectedLeaves!: PendingLeavesResponse[];
  specificLeaveRequest!: PendingLeaveResponse;
  searchString: string = '';
  selectedTeamName: string = '';
  page = 0;
  size = 10;
  userLeaveForm!: FormGroup;
  // hasMoreData = true;
  initialLoadDone = false; 
  @ViewChild('logContainer') logContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private rbacService: RoleBasedAccessControlService,
  ) { 

    {
      this.userLeaveForm = this.fb.group({
        startDate: ["", Validators.required],
        endDate: [""],
        leaveType: ["", Validators.required],
        managerId: ["", Validators.required],
        optNotes: ["", Validators.required],
        halfDayLeave: [false],
        dayShift: [false],
        eveningShift: [false],
      });
    }

  }

  get StartDate() {
    return this.userLeaveForm.get("startDate")
  }
  get EndDate() {
    return this.userLeaveForm.get("endDate")
  }
  get LeaveType() {
    return this.userLeaveForm.get("leaveType")
  }
  get ManagerId() {
    return this.userLeaveForm.get("managerId")
  }
  get OptNotes() {
    return this.userLeaveForm.get("optNotes")
  }


  logInUserUuid: string = '';
  ROLE: string | null = '';
  currentNewDate: any;
  currentDate: Date = new Date();

  async ngOnInit(): Promise<void> {
    this.logInUserUuid = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();

    this.getFullLeaveLogs();
    this.getPendingLeaves();
    this.getApprovedRejectedLeaveLogs();
    this.getWeeklyChartData();
    this.getMonthlyChartData();
    this.getTotalConsumedLeaves();
    if(this.ROLE !== 'USER'){
       this.getTeamNames();
    }

    this.fetchManagerNames();
    this.getUserLeaveReq();
    this.currentNewDate = moment(this.currentDate).format('yyyy-MM-DD');
  }

  debounceTimer: any;
  fullLeaveLogSize!: number;
  getFullLeaveLogs(debounceTime: number = 300) {
    return new Promise((resolve, reject) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.dataService.getFullLeaveLogsRoleWise(this.searchString, this.selectedTeamName, this.page, this.size).subscribe({
          next: (response) => {
            if (Array.isArray(response.object)) { // Check if response.object is an array
              this.fullLeaveLogs = [...this.fullLeaveLogs, ...response.object];
              // this.hasMoreData = response.object.length === this.size;
              this.fullLeaveLogSize = this.fullLeaveLogs.length;
            } else {
              console.error('Expected an array but got:', response.object);
            }
          },
          error: (error) => {
            console.error('Failed to fetch full leave logs:', error);
            this.helperService.showToast("Failed to load full leave logs.", Key.TOAST_STATUS_ERROR);
          }
          // next: (response) => { this.fullLeaveLogs = response.object
          //   this.fullLeaveLogSize = this.fullLeaveLogs.length;
          // },
          // error: (error) => {
          //   console.error('Failed to fetch full leave logs:', error);
          //   this.helperService.showToast("Failed to load full leave logs.", Key.TOAST_STATUS_ERROR);
          // }
        });
      }, debounceTime);
    });
  }

  scrollDownRecentActivity(event: any) {
    if (!this.initialLoadDone) return;  
    const target = event.target as HTMLElement;
    const atBottom = target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

    if (atBottom) {
      this.page++;
      this.getFullLeaveLogs();
    }
  }

  loadMoreLogs() {
    this.initialLoadDone = true; 
    this.page++;
    // this.size += 10;
    this.getFullLeaveLogs();
    setTimeout(() => {
      this.scrollToBottom();
    }, 500); 
  }

  scrollToBottom() {
    if (this.logContainer) {
      this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
    }
  }

  searchLeaves() {
    this.page = 0;
    this.size = 10;
    this.fullLeaveLogs = [];
    this.getFullLeaveLogs();
  }

  selectTeam(teamName: string) {
    this.page = 0;
    this.size = 10;
    this.fullLeaveLogs = [];
    this.selectedTeamName = teamName;
    this.getFullLeaveLogs();
}
  clearSearchUsers(){
    this.page = 0;
    this.size = 10;
    this.fullLeaveLogs = [];
    this.searchString='';
    this.getFullLeaveLogs();
  
   }
  
  //  loadMoreLogs() {
  //   this.size= this.size+10;
  //   this.getFullLeaveLogs();
  // }
  pagePendingLeaves = 0;
  sizePendingLeaves = 5;
  pendingLeavesSize!: number;
  initialLoadDoneOfPendingLeaves:boolean = false;
  @ViewChild('logContainerOfPendingLeaves') logContainerOfPendingLeaves!: ElementRef<HTMLDivElement>;


  getPendingLeaves() {
    this.dataService.getPendingLeaves(this.pagePendingLeaves, this.sizePendingLeaves).subscribe({
      next: (response) => {
        this.pendingLeaves = [...this.pendingLeaves, ...response.object];
        // this.pendingLeaves = response.object
      this.pendingLeavesSize = this.pendingLeaves.length},
      error: (error) => {
        console.error('Failed to fetch pending leaves:', error);
        this.helperService.showToast("Failed to load pending leaves.", Key.TOAST_STATUS_ERROR);
      }
    });
  }

  scrollDownRecentActivityOfPendingLeaves(event: any) {
    if (!this.initialLoadDoneOfPendingLeaves) return;  
    const target = event.target as HTMLElement;
    const atBottom = target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

    if (atBottom) {
      this.pagePendingLeaves++;
      this.getPendingLeaves();
    }
  }

  loadMorePendingLeaves(){
    this.initialLoadDoneOfPendingLeaves = true;
    this.pagePendingLeaves++;
    // this.sizePendingLeaves= this.sizePendingLeaves+5;
    this.getPendingLeaves();
    setTimeout(() => {
      this.scrollToBottomOfPendingLeaves();
    }, 500); 
  }

  scrollToBottomOfPendingLeaves() {
    if (this.logContainerOfPendingLeaves) {
      this.logContainerOfPendingLeaves.nativeElement.scrollTop = this.logContainerOfPendingLeaves.nativeElement.scrollHeight;
    }
  }

  pageApprovedRejected = 0;
  sizeApprovedRejected = 5;
  approvedRejectedLeavesSize!:number;
  initialLoadDoneOfApprovedRejected:boolean = false;
  @ViewChild('logContainerOfApprovedRejected') logContainerOfApprovedRejected!: ElementRef<HTMLDivElement>;

  getApprovedRejectedLeaveLogs() {
    this.dataService.getApprovedRejectedLeaveLogs(this.pageApprovedRejected, this.sizeApprovedRejected).subscribe({
      next: (response) => {
        this.approvedRejectedLeaves = [...this.approvedRejectedLeaves, ...response.object];
        // this.approvedRejectedLeaves = response.object
        this.approvedRejectedLeavesSize = this.approvedRejectedLeaves.length},
      error: (error) => {
        console.error('Failed to fetch approved-rejected leave logs:', error);
        this.helperService.showToast("Failed to load approved/rejected leaves.", Key.TOAST_STATUS_ERROR);
      }
    });
  }

  scrollDownRecentActivityOfApprovedRejected(event: any) {
    if (!this.initialLoadDoneOfApprovedRejected) return;  
    const target = event.target as HTMLElement;
    const atBottom = target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

    if (atBottom) {
      this.pageApprovedRejected++;
      this.getApprovedRejectedLeaveLogs();
    }
  }

  loadMoreApprovedRejectedLogs(){
    this.initialLoadDoneOfApprovedRejected = true;
    // this.sizeApprovedRejected= this.sizeApprovedRejected+5;
    this.pageApprovedRejected++;
    this.getApprovedRejectedLeaveLogs(); 
    setTimeout(() => {
      this.scrollToBottomOfApprovedRejected();
    }, 500); 
  }

  scrollToBottomOfApprovedRejected() {
    if (this.logContainerOfApprovedRejected) {
      this.logContainerOfApprovedRejected.nativeElement.scrollTop = this.logContainerOfApprovedRejected.nativeElement.scrollHeight;
    }
  }


  @ViewChild("closeModal") closeModal!: ElementRef;
  approvedLoader: boolean = false;
  rejecetdLoader: boolean = false;
  approveOrDeny(requestId: number, requestedString: string) {
    debugger;

    if(requestedString === 'approved'){
      this.approvedLoader = true;
    }else if(requestedString === 'rejected'){
      this.rejecetdLoader = true;
    }
    this.dataService.approveOrRejectLeaveOfUser(requestId, requestedString).subscribe({
      next: (logs) => {
        console.log('success!');
        this.approvedLoader = false;
        this.rejecetdLoader = false;
        this.getApprovedRejectedLeaveLogs();
        this.getFullLeaveLogs();
        this.getPendingLeaves();
        this.getTotalConsumedLeaves();
        this.getMonthlyChartData();
        this.getWeeklyChartData();
        this.closeModal.nativeElement.click();
        let message = requestedString === 'approved' ? "Leave approved successfully!" : "Leave rejected successfully!";
        this.helperService.showToast(message, Key.TOAST_STATUS_SUCCESS);
      },
      error: (error) => {
        this.approvedLoader = false;
        this.rejecetdLoader = false;
        console.error('There was an error!', error);
        this.helperService.showToast("Error processing leave request!", Key.TOAST_STATUS_ERROR);
      }
    });
  }

  getPendingLeave(leaveId: number, leaveType: string) {
    this.dataService.getRequestedUserLeaveByLeaveIdAndLeaveType(leaveId, leaveType).subscribe({
      next: (response) => this.specificLeaveRequest = response.object[0],
      error: (error) => {
        console.error('Failed to fetch pending leave:', error);
        this.helperService.showToast("Failed to load this pending leave.", Key.TOAST_STATUS_ERROR);
      }
    });
  }

  formatDateIn(newdate:any) {
    const date = new Date(newdate);
    const formattedDate = this.datePipe.transform(date, 'dd MMMM, yyyy');
    return formattedDate;
  }
  formatDate(date: Date) {
    const dateObject = new Date(date);
    const formattedDate = this.datePipe.transform(dateObject, 'yyyy-MM-dd');
    return formattedDate;
  }

  formatTime(date: Date) {
    const dateObject = new Date(date);
    const formattedTime = this.datePipe.transform(dateObject, 'hh:mm a');
    return formattedTime;
  }

  transform(value: string): string {
    if (!value) return value; 
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  teamNameList: string[] = [];
  getTeamNames() {
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.teamNameList = response.object; 
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
        
      }
    });
  }
  
  sliceWord(word: string): string {
    return word.slice(0, 3);
  }

  weeklyChartData: any[] = [];
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal, // Correct type for the group property
    domain: ['#FFD700', '#228B22', '#FF4500'] // Gold, Green, Red
  };
  gradient: boolean = true;
  // view: [number, number] = [300, 150];
  view: [number, number] = [300, 250];
  getWeeklyChartData(){
    this.dataService.getWeeklyLeaveSummary().subscribe(data => {
      this.weeklyChartData = data.map(item => ({
        "name": this.sliceWord(item.weekDay),
        "series": [
          { "name": "Pending", "value": item.pending || 0},
          { "name": "Approved", "value": item.approved || 0},
          { "name": "Rejected", "value": item.rejected || 0}
        ]
      }));
    });
  }

  monthlyChartData: any[] = [];

  getMonthlyChartData(){
    this.dataService.getMonthlyLeaveSummary().subscribe(data => {
      this.monthlyChartData = data.map(item => ({
        "name": this.sliceWord(item.monthName),
        "series": [
          { "name": "Pending", "value": item.pending || 0},
          { "name": "Approved", "value": item.approved || 0},
          { "name": "Rejected", "value": item.rejected || 0}
        ]
      }));
    });
  }

  consumedLeaveData: any[] = [];
  views: [number, number] = [300, 200];

  showXAxis = true;
  showYAxis = true;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Count';
  showYAxisLabel = true;
  yAxisLabel = 'Type';

  colorSchemeConsumed: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#228B22', '#CFC0BB']
  };

  consumedLeaveArray : any[] = [];
  dataReady: boolean = false;
  getTotalConsumedLeaves() {
    this.dataService.getConsumedLeaves().subscribe(data => {
      this.consumedLeaveArray = data;
      this.consumedLeaveData = data.map(item => ({
        name: this.getLeaveInitials(item.leaveType),
        series: [
          { name: "Used", value: item.consumedCount || 0 },
          { name: "Remaining", value: item.remainingCount || 0 }
        ]
      }));
      this.dataReady = true; 
      console.log(this.consumedLeaveData);
    });
  }

  getLeaveInitials(leaveType: string): string {
    const words = leaveType.split(' ');
    if (words.length >= 2) {
      return words[0].charAt(0) + words[1].charAt(0);
    }
    return leaveType;
  }

  // ####   new modal code 

  managers: UserDto[] = [];
  selectedManagerId!: number;

  fetchManagerNames() {
    this.dataService.getEmployeeManagerDetailsLeaveManagemnt().subscribe(
      (data: UserDto[]) => {
        this.managers = data;
      },
      (error) => {
      }
    );
  }

  userLeave: any = [];
  leaveCountPlaceholderFlag: boolean = false;

  getUserLeaveReq() {
    this.leaveCountPlaceholderFlag = false;
    this.dataService.getUserLeaveRequestsForLeaveManagement().subscribe(
      (data) => {
        if (data.body != undefined || data.body != null || data.body.length != 0) {
          this.userLeave = data.body;
        } else {
          this.leaveCountPlaceholderFlag = true;
          return;
        }
      },
      (error) => {
      }
    );
  }


  userLeaveRequest: UserLeaveRequest = new UserLeaveRequest();


  @ViewChild("requestLeaveCloseModel")
  requestLeaveCloseModel!: ElementRef;

  // @ViewChild('userLeaveForm') userLeaveForm: NgForm;


  resetUserLeave() {
    this.userLeaveRequest.startDate = new Date();
    this.userLeaveRequest.endDate = new Date();
    this.userLeaveRequest.halfDayLeave = false;
    this.userLeaveRequest.dayShift = false;
    this.userLeaveRequest.eveningShift = false;
    this.userLeaveRequest.leaveType = "";
    this.userLeaveRequest.managerId = 0;
    this.userLeaveRequest.optNotes = "";
    this.selectedManagerId = 0;

  }
  @ViewChild(FormGroupDirective)
  formGroupDirective!: FormGroupDirective;
  submitLeaveLoader:boolean=false;

  saveLeaveRequestUser() {
    debugger
    this.userLeaveRequest.managerId = this.selectedManagerId;
    this.userLeaveRequest.dayShift = this.dayShiftToggle;
    this.userLeaveRequest.eveningShift = this.eveningShiftToggle;
    this.submitLeaveLoader=true;
    this.dataService.saveLeaveRequestForLeaveManagement(this.userLeaveRequest)
      .subscribe(data => {
        this.submitLeaveLoader=false;
        this.resetUserLeave();
        this.getApprovedRejectedLeaveLogs();
        this.getFullLeaveLogs();
        this.getPendingLeaves();
        this.getTotalConsumedLeaves();
        this.getMonthlyChartData();
        this.getWeeklyChartData();
        this.formGroupDirective.resetForm();
        this.requestLeaveCloseModel.nativeElement.click();
      }, (error) => {
        this.submitLeaveLoader=false;
      })
  }

  dayShiftToggle: boolean = false;
  eveningShiftToggle: boolean = false;

  dayShiftToggleFun(shift: string) {

    if (shift == 'day') {
      this.dayShiftToggle = true;
      this.eveningShiftToggle = false;

    } else if (shift == 'evening') {
      this.eveningShiftToggle = true;
      this.dayShiftToggle == false
    }
    // console.log("day" + this.dayShiftToggle + "evening" + this.eveningShiftToggle);
  }


  halfDayLeaveShiftToggle: boolean = false;

  halfLeaveShiftToggle() {
    this.halfDayLeaveShiftToggle = this.halfDayLeaveShiftToggle == true ? false : true;
  }
  
}
