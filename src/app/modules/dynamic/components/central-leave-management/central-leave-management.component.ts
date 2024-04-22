import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Key } from 'src/app/constant/key';
import { FullLeaveLogsResponse, PendingLeaveResponse, PendingLeavesResponse } from 'src/app/models/leave-responses.model';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-central-leave-management',
  templateUrl: './central-leave-management.component.html',
  styleUrls: ['./central-leave-management.component.css']
})
export class CentralLeaveManagementComponent implements OnInit {

  fullLeaveLogs!: FullLeaveLogsResponse[];
  pendingLeaves!: PendingLeavesResponse[];
  approvedRejectedLeaves!: PendingLeavesResponse[];
  specificLeaveRequest!: PendingLeaveResponse;
  searchString: string = '';
  selectedTeamName: string = '';
  page = 0;
  size = 10;


  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private datePipe: DatePipe,
    private rbacService: RoleBasedAccessControlService,
  ) { }

  logInUserUuid: string = '';
  ROLE: string | null = '';

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
          next: (response) => { this.fullLeaveLogs = response.object
            this.fullLeaveLogSize = this.fullLeaveLogs.length;
            // this.hasMoreData = response.object.length === this.size;
          },
          error: (error) => {
            console.error('Failed to fetch full leave logs:', error);
            this.helperService.showToast("Failed to load full leave logs.", Key.TOAST_STATUS_ERROR);
          }
        });
      }, debounceTime);
    });
  }

  searchLeaves() {
    this.size = 10;
    this.getFullLeaveLogs();
  }

  selectTeam(teamName: string) {
    this.size = 10;
    this.selectedTeamName = teamName;
    this.getFullLeaveLogs();
}
  clearSearchUsers(){
    this.size = 10;
    this.searchString='';
    this.getFullLeaveLogs();
  
   }
  
   loadMoreLogs() {
    // this.page++;
    this.size= this.size+10;
    this.getFullLeaveLogs();
  }
  pagePendingLeaves = 0;
  sizePendingLeaves = 5;
  pendingLeavesSize!: number;
  getPendingLeaves() {
    this.dataService.getPendingLeaves(this.pagePendingLeaves, this.sizePendingLeaves).subscribe({
      next: (response) => {this.pendingLeaves = response.object
      this.pendingLeavesSize = this.pendingLeaves.length},
      error: (error) => {
        console.error('Failed to fetch pending leaves:', error);
        this.helperService.showToast("Failed to load pending leaves.", Key.TOAST_STATUS_ERROR);
      }
    });
  }

  loadMorePendingLeaves(){
    this.sizePendingLeaves= this.sizePendingLeaves+5;
    this.getPendingLeaves();
  }

  pageApprovedRejected = 0;
  sizeApprovedRejected = 5;
  approvedRejectedLeavesSize!:number;
  getApprovedRejectedLeaveLogs() {
    this.dataService.getApprovedRejectedLeaveLogs(this.pageApprovedRejected, this.sizeApprovedRejected).subscribe({
      next: (response) => {this.approvedRejectedLeaves = response.object
      this.approvedRejectedLeavesSize = this.approvedRejectedLeaves.length},
      error: (error) => {
        console.error('Failed to fetch approved-rejected leave logs:', error);
        this.helperService.showToast("Failed to load approved/rejected leaves.", Key.TOAST_STATUS_ERROR);
      }
    });
  }

  loadMoreApprovedRejectedLogs(){
    this.sizeApprovedRejected= this.sizeApprovedRejected+5;
    this.getApprovedRejectedLeaveLogs();
  }
  @ViewChild("closeModal") closeModal!: ElementRef;
  approveOrDeny(requestId: number, requestedString: string) {
    debugger;
    this.dataService.approveOrRejectLeaveOfUser(requestId, requestedString).subscribe({
      next: (logs) => {
        console.log('success!');
        this.getFullLeaveLogs();
        this.getPendingLeaves();
        this.getApprovedRejectedLeaveLogs();
        this.closeModal.nativeElement.click();
        let message = requestedString === 'approved' ? "Leave approved successfully!" : "Leave rejected successfully!";
        this.helperService.showToast(message, Key.TOAST_STATUS_SUCCESS);
      },
      error: (error) => {
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
        "name": item.weekDay,
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
        "name": item.monthName,
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
}
