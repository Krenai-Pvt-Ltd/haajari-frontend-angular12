import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { OvertimeRequestLogResponse } from 'src/app/models/overtime-request-log-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  requestModal: boolean = false;
  usersWithUpcomingBirthdays: any;

  resignationSubmittedSubscriber: any;
  resignationSubmittedToggle: boolean = false;
  constructor(private roleService: RoleBasedAccessControlService, private dataService: DataService, public helperService: HelperService) {
    this.resignationSubmittedSubscriber =  this.helperService.resignationSubmitted.subscribe((value)=>{
      if(value){
        this.resignationSubmittedToggle = true;
        this.getUserResignationInfo();
      }else{
        this.resignationSubmittedToggle = false;
      }
    });
  }

  ngOnDestroy(){
    this.resignationSubmittedSubscriber.complete();
  }

  userId: string =''
  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userId = userUuidParam?.toString() ?? ''

    this.getRole();
    this.getUserResignationInfo();
    this.getUsersWithUpcomingBirthdays();
    this.getNewUsersJoinies();
    this.getUsersUpcomingWorkAnniversaries();
    this.getAttendanceRequestLogData();
    this.fetchAttendanceSummary();

  }





getUsersWithUpcomingBirthdays(): void {
  this.dataService.getUsersWithUpcomingBirthdays().subscribe(
    (data) => {
      this.usersWithUpcomingBirthdays = data;
    },
    (error) => {
      console.error('Error fetching upcoming birthdays:', error);
    }
  );
}
anniversaries: any;
getUsersUpcomingWorkAnniversaries(): void {
  this.dataService.getRecentlyWorkAnniversary().subscribe(
    (data) => {
      this.anniversaries = data;
    },
    (error) => {
      console.error('Error fetching upcoming anniversary:', error);
    }
  );
}
newJoiners: any;
getNewUsersJoinies(): void {
  this.dataService.getRecentlyJoinedUsers().subscribe(
    (data) => {
      this.newJoiners = data;
    },
    (error) => {
      console.error('Error fetching upcoming birthdays:', error);
    }
  );
}

isToday(birthday: string): boolean {
  const today = new Date();
  const birthdayDate = new Date(birthday);
  return today.getDate() === birthdayDate.getDate() && today.getMonth() === birthdayDate.getMonth();
}
getWeekDayOfBirthday(birthday: string): string {
  const currentYear = new Date().getFullYear();
  const [month, day] = birthday.split('-'); // Assuming 'MM-dd' format in the backend
  const birthdayDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
  // Get the weekday name (e.g., "Monday", "Tuesday", etc.)
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekdays[birthdayDate.getDay()];
}
  ROLE: any;
  async getRole(){
    this.ROLE = await this.roleService.getRole();
  }

  userResignationInfo: any;
  discussionType: string = 'Yes'
  recommendDay: string = 'Complete'
  getUserResignationInfo(){
    this.userResignationInfo = []
    this.dataService.getUserResignationInfo(this.userId).subscribe((res: any) => {
      if(res.status){
        this.userResignationInfo = res.object[0]

        if(this.userResignationInfo.isManagerDiscussion == 0){
          this.discussionType = 'No'
        }

        if(this.userResignationInfo.isRecommendedLastDay == 1){
          this.recommendDay = 'Other'
        }

        console.log('userResignationInfo dashboard : ',this.userResignationInfo)
      }
    })
  }

  @ViewChild('closeApproveModal') closeApproveModal!: ElementRef
  approveToggle: boolean = false
  hideResignationModal: boolean = false;
  approveOrDenyResignation(id: number) {

    debugger
    this.approveToggle = true;
    this.hideResignationModal = true;
    this.dataService.updateResignation(id).subscribe((res: any) => {
      if(res.status){
        this.closeApproveModal.nativeElement.click()
        this.approveToggle = false
        this.helperService.profileChangeStatus.next(true);
        this.helperService.showToast(
          res.message,
          Key.TOAST_STATUS_SUCCESS
        );
      }else{
        this.approveToggle = false;
      }
    })

  }

  userLeaveLog: any;
  selectedLeaveType = 'All';
  selectedStatus = 'Pending';
  searchQuery = '';
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  totalPages=0;
  isLoading=true;
  loadLeaveLogs(): void {
    const leaveType = this.selectedLeaveType === 'All' ? undefined : this.selectedLeaveType;
    const status = this.selectedStatus === 'All' ? undefined : this.selectedStatus;

    this.isLoading=true;
    this.dataService
      .getUserLeaveLogFilter(this.userId, this.currentPage, this.pageSize, leaveType, status, this.searchQuery)
      .subscribe((response) => {
        this.userLeaveLog = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading=false;
      });
  }



  isShimmerForOvertimeLog = false;
  dataNotFoundPlaceholderForOvertimeLog = false;
  overtimeRequestLogResponseList : OvertimeRequestLogResponse[] = [];
  getOvertimeRequestLogResponseByUserUuidMethodCall(){
    this.isShimmerForOvertimeLog=true;
    this.dataService.getOvertimeRequestLogResponseByUserUuid(this.userId,'pending').subscribe((response) => {
      if(this.helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForOvertimeLog = true;
      } else{
        this.overtimeRequestLogResponseList = response.listOfObject;
      }

      this.isShimmerForOvertimeLog = false;
    }, (error) => {
      this.isShimmerForOvertimeLog = false;
    })
  }

  attendanceRequestLog: any[] = [];

pageNumberAttendanceLogs: number = 1;
itemPerPageAttendanceLogs: number = 5;
fullAttendanceLogCount: number = 0;
isFullLogLoader: boolean = false;
debounceTimer: any;

isShimmerForAttendanceUpdateRequestLog: boolean = false;
dataNotFoundForAttendanceUpdateRequestLog: boolean = false;
networkConnectionErrorForAttendanceUpdateRequestLog: boolean = false;

getAttendanceRequestLogData() {
  this.attendanceRequestLog = [];
  return new Promise((resolve, reject) => {
    this.isFullLogLoader = true;

  this.dataService.getAttendanceRequestLog(this.userId, this.pageNumberAttendanceLogs, this.itemPerPageAttendanceLogs,'pending').subscribe(response => {
    if(this.helperService.isObjectNullOrUndefined(response)){
      this.dataNotFoundForAttendanceUpdateRequestLog = true;
    } else{
      this.attendanceRequestLog = response.object;
      this.fullAttendanceLogCount = response.totalItems;
    }
    this.isFullLogLoader = false;
    this.isShimmerForAttendanceUpdateRequestLog = false;
  }, (error) => {
    this.networkConnectionErrorForAttendanceUpdateRequestLog = true;
    this.isShimmerForAttendanceUpdateRequestLog = false;
    this.isFullLogLoader = false;
  });
});
}

attendanceSummary: any;
fetchAttendanceSummary(): void {
  this.dataService.getAttendanceSummary(this.userId).subscribe({
    next: (response) => {
      this.attendanceSummary = response;
      console.log('Attendance Summary:', this.attendanceSummary);
    },
    error: (error) => {
      console.error('Error fetching attendance summary:', error);
    },
  });
}

}
