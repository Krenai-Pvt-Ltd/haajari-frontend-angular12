import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { FullLeaveLogsResponse, PendingLeaveResponse, PendingLeavesResponse } from 'src/app/models/leave-responses.model';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

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


  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.getFullLeaveLogs();
    this.getPendingLeaves();
    this.getApprovedRejectedLeaveLogs();
  }

  debounceTimer: any;
  getFullLeaveLogs(debounceTime: number = 300) {
    debugger

    return new Promise((resolve, reject) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.dataService.getFullLeaveLogsRoleWise(this.searchString, '').subscribe({
          next: (response) => this.fullLeaveLogs = response.object,
          error: (error) => {
            console.error('Failed to fetch full leave logs:', error);
            this.helperService.showToast("Failed to load full leave logs.", Key.TOAST_STATUS_ERROR);
          }
        });
      }, debounceTime);
    });
  }

  searchLeaves() {
    this.getFullLeaveLogs();
  }

  clearSearchUsers(){
    this.searchString='';
    this.getFullLeaveLogs();
  
   }
  

  getPendingLeaves() {
    this.dataService.getPendingLeaves().subscribe({
      next: (response) => this.pendingLeaves = response.object,
      error: (error) => {
        console.error('Failed to fetch pending leaves:', error);
        this.helperService.showToast("Failed to load pending leaves.", Key.TOAST_STATUS_ERROR);
      }
    });
  }

  getApprovedRejectedLeaveLogs() {
    this.dataService.getApprovedRejectedLeaveLogs().subscribe({
      next: (response) => this.approvedRejectedLeaves = response.object,
      error: (error) => {
        console.error('Failed to fetch approved-rejected leave logs:', error);
        this.helperService.showToast("Failed to load approved/rejected leaves.", Key.TOAST_STATUS_ERROR);
      }
    });
  }

  approveOrDeny(requestId: number, requestedString: string) {
    debugger;
    this.dataService.approveOrRejectLeaveOfUser(requestId, requestedString).subscribe({
      next: (logs) => {
        console.log('success!');
        this.getFullLeaveLogs();
        this.getPendingLeaves();
        this.getApprovedRejectedLeaveLogs();
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
      next: (response) => this.specificLeaveRequest = response.object,
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
}
