import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { OvertimeRequestLogResponse } from 'src/app/models/overtime-request-log-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Holiday } from 'src/app/models/Holiday';

import { UserNotificationService } from 'src/app/services/user-notification.service';
import { Notification } from 'src/app/models/Notification';
import { EmployeeProfileComponent } from '../employee-profile.component';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  requestModal: boolean = true;
  usersWithUpcomingBirthdays: any;

  resignationSubmittedSubscriber: any;
  resignationSubmittedToggle: boolean = false;
  constructor(private roleService: RoleBasedAccessControlService,
      private _notificationService: UserNotificationService,
     private dataService: DataService,
      public helperService: HelperService,
    private employeeProfileComponent: EmployeeProfileComponent) {
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
    // this.stopCarousel();
  }

 
  today = new Date();

  getOrdinalSuffix(day: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const ones = day % 10;
    const tens = Math.floor(day / 10) % 10;
    
    // Handle the special case for 11th, 12th, and 13th
    if (tens === 1) {
      return 'th';
    }
    
    return suffixes[ones] || 'th';
  }

  userId: string =''
  ngOnInit(): void {
    this.today = new Date();
    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userId = userUuidParam?.toString() ?? ''
    this.calculateDateRange();
    this.loadHolidays();
    this.getRole();
    this.getUserResignationInfo();
    this.getUsersWithUpcomingBirthdays();
    this.getNewUsersJoinies();
    this.getUsersUpcomingWorkAnniversaries();
    // this.getWorkedHourForEachDayOfAWeek();
    this.getAttendanceRequestLogData();
    this.getTeamNames();
    // this.loadMoreData();
    this.fetchAttendanceSummary();
    this.loadHolidays();
    this.getTeamsWithManagerInfo();
    this.getTotalTeamMembers();
    // this.startCarousel();


  }
  


  ngAfterViewInit(): void {
    this.getWorkedHourForEachDayOfAWeek();
    this.getMailNotification(this.userId, 'mail');
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


  getDynamicClass(index: number): object {
    if(index>=3){
      var mod = index % 3;
      return { [`birthday-box-${mod}`]: true };
    }else{
      return { [`birthday-box-${index}`]: true };
    }
  }


// new 

// @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
//   private chart!: Chart;

//   getWorkedHourForEachDayOfAWeek() {
//     this.dataService.getWorkedHourForEachDayOfAWeek(this.userId).subscribe(
//       (response: any) => {
//         const labels = response.listOfObject.map((item: any) =>
//           this.formatDate(item.workDate)
//         );
//         const data = response.listOfObject.map((item: any) =>
//           this.formatToDecimalHours(item.totalWorkedHour)
//         );

//         this.initializeChart(labels, data);
//       },
//       (error) => {
//         console.error('Error fetching worked hours:', error);
//       }
//     );
//   }

//   formatToDecimalHours(time: string): number {
//     const [hours, minutes, seconds] = time.split(':').map(Number);
//     return hours + minutes / 60 + seconds / 3600;
//   }

//   formatDate(date: string): string {
//     const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
//     return new Date(date).toLocaleDateString('en-US', options);
//   }

//   initializeChart(labels: string[], data: number[]) {
//     const ctx = this.chartCanvas.nativeElement.getContext('2d');

//     if (ctx) {
//       this.chart = new Chart(ctx, {
//         type: 'line',
//         data: {
//           labels: labels,
//           datasets: [
//             {
//               label: 'Total Worked Hours',
//               data: data,
//               borderColor: 'rgba(75, 192, 192, 1)',
//               backgroundColor: 'rgba(153, 102, 255, 0.2)', 
//             tension: 0.4, 
//             fill: true, 
//             },
//           ],
//         },
//         options: {
//           responsive: true,
//           plugins: {
//             legend: {
//               display: true,
//               position: 'top',
//             },
//             title: {
//               display: true,
//               text: 'Worked Hours for the Week',
//             },
//           },
//           scales: {
//             x: {
//               title: {
//                 display: true,
//                 text: 'Days of the Week',
//               },
//             },
//             y: {
//               title: {
//                 display: true,
//                 text: 'Hours Worked',
//               },
//               beginAtZero: true,
//             },
//           },
//         },
//       });
//     }
//   }

startDate: string = '';
endDate: string = '';

calculateDateRange(): void {
  const currentDate = new Date();
  const dayOfWeek = currentDate.getDay(); // 0: Sunday, 1: Monday, etc.

  // Calculate the start of the week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

  // Calculate the end of the week (Saturday)
  const endOfWeek = new Date(currentDate);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Add 6 days to the start of the week

  // Format both dates to 'YYYY-MM-DD' format
  this.startDate = this.formatDateToYYYYMMDD(startOfWeek);
  this.endDate = this.formatDateToYYYYMMDD(endOfWeek);
}


// calculateDateRange(): void {
//   const currentDate = new Date();
//   const dayOfWeek = currentDate.getDay(); // 0: Sunday, 1: Monday, etc.
  
//   // Adjust for the start of the week (assuming Sunday as the start of the week)
//   const startOfWeek = new Date(currentDate);
//   startOfWeek.setDate(currentDate.getDate() - dayOfWeek); // Move to previous Sunday

//   // Calculate the end of the week (today's date)
//   const endOfWeek = new Date(currentDate); // Use current date as end date

//   // Format both dates to 'YYYY-MM-DD' format
//   this.startDate = this.formatDateToYYYYMMDD(startOfWeek);
//   this.endDate = this.formatDateToYYYYMMDD(endOfWeek);
// }

formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2 digits
  const day = date.getDate().toString().padStart(2, '0'); // Ensure 2 digits
  return `${year}-${month}-${day}`;
}



@ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
private chart!: Chart;

getWorkedHourForEachDayOfAWeek() {
  this.dataService.getWorkedHourForEachDayOfAWeek(this.userId, this.startDate, this.endDate, 'WEEK').subscribe(
    (response: any) => {
      const labels = response.listOfObject.map((item: any) =>
        this.formatDate(item.workDate)
      );
      const data = response.listOfObject.map((item: any) =>
        this.formatToDecimalHours(item.totalWorkedHour)
      );

      this.initializeChart(labels, data);
    },
    (error) => {
      console.error('Error fetching worked hours:', error);
    }
  );
}

formatToDecimalHours(time: string): number {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours + minutes / 60 + seconds / 3600;
}

formatDate(date: string): string {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
  return new Date(date).toLocaleDateString('en-US', options);
}

formatDecimalToTime(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}hrs`;
}

initializeChart(labels: string[], data: number[]) {
  const ctx = this.chartCanvas.nativeElement.getContext('2d');

  if (ctx) {
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Worked Hours',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.4, 
            fill: true, 
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Worked Hours for the Week',
          },
          tooltip: {
            callbacks: {
              // Custom tooltip label callback
              label: (tooltipItem: any) => {
                // Convert the decimal hours to HH:MM format
                const formattedTime = this.formatDecimalToTime(tooltipItem.raw);
                return `${tooltipItem.label}: ${formattedTime}`;
              }
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Days of the Week',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Worked Hours',
            },
            beginAtZero: true,
            ticks: {
              // Adjust ticks for Y-axis to handle time correctly
              callback: (tickValue: string | number) => {
                const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                return this.formatDecimalToTime(value); 
              },
              stepSize: 0.5,  
            },
            type: 'linear', 
          },
        },
      },
    });
  }
}

// holidays

// holidays: Holiday[] = [];
// loadHolidays() {
//     this.dataService.getNextSixHolidays().subscribe({
//       next: (data: Holiday[]) => {
//         this.holidays = data; 
//       },
//       error: (error) => {
//         console.error('Failed to fetch holidays', error);
//       },
//     });
//   }


colors = ['color1', 'color2', 'color3', 'color4', 'color5', 'color6'];

  getHolidayBoxClass(index: number): string {
    return this.colors[index % this.colors.length];
  }


  // currentHolidayIndex = 0;
  // private intervalId!: ReturnType<typeof setInterval>;

  // startCarousel() {
  //   this.intervalId = setInterval(() => {
  //     this.currentHolidayIndex = (this.currentHolidayIndex + 1) % this.holidays.length;
  //   }, 2000); // Change slide every 2 seconds
  // }

  // stopCarousel() {
  //   if (this.intervalId) {
  //     clearInterval(this.intervalId);
  //   }
  // }
holidays: Holiday[] = [];
  currentHolidayIndex: number = 0; // Initially show the first holiday

  loadHolidays(): void {
    this.dataService.getNextSixHolidays().subscribe({
      next: (data: Holiday[]) => {
        this.holidays = data; 
        // Ensure currentHolidayIndex doesn't exceed array bounds
        if (this.holidays.length > 0) {
          this.currentHolidayIndex = 0; // Reset to show the first holiday in the list
        }
      },
      error: (error) => {
        console.error('Failed to fetch holidays', error);
      },
    });
  }

  showNextHoliday(): void {
    if (this.holidays.length > 0) {
      this.currentHolidayIndex = (this.currentHolidayIndex + 1) % this.holidays.length;
    }
  }

  showPreviousHoliday(): void {
    if (this.holidays.length > 0) {
      this.currentHolidayIndex = 
        (this.currentHolidayIndex - 1 + this.holidays.length) % this.holidays.length;
    }
  }



  mailList: Notification[] = new Array();
  totalMailNotification: number = 0;
  mailLoading: boolean = false;
  totalNewMailNotification: number = 0;
  notificationList: Notification[] = new Array();
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  getMailNotification(uuid: any, notificationType: string) {
    debugger;
    this.mailLoading = true;
    this.databaseHelper.itemPerPage = 1;
    this._notificationService
      .getMailNotification(uuid, this.databaseHelper, notificationType)
      .subscribe((response: any) => {
        if (response.status) {
          this.mailList = response.object;
          this.totalNewMailNotification =
            response.object[0].newNotificationCount;
          this.totalMailNotification = response.totalItems;
          this.mailLoading = false;
        }
        this.mailLoading = false;
      });
  }

  currentDate = new Date();
  clickViewAll(){
    debugger
    this.employeeProfileComponent.clickViewAll();
  }

  // currentDate = new Date();



  teamManagerInfo: any[] = [];
  getTeamsWithManagerInfo(): void {
    this.dataService.getTeamsWithManagerInfo(this.userId).subscribe({
      next: (response: any) => {
        this.teamManagerInfo = response.listOfObject; 
      },
      error: (error) => {
        console.error('Failed to fetch holidays', error);
      },
    });
  }


  teamNameList: { teamId: number; teamName: string }[] = [];
  teamMembers: any[] = [];
  selectedTeamId: number = 0;
  selectedTeamName: string = 'All';
  isLoadingNew: boolean = false;
  hasMoreData: boolean = true;
  pageNumber: number = 1;
  itemsPerPage: number = 10;
  teamName: string = '';



  getTeamNames(): void {
    this.dataService.getAllTeamsByUuid(this.userId).subscribe({
      next: (response: any) => {
        this.teamNameList = response.object;


    if (this.teamNameList.length > 0) {
      this.selectedTeamId = this.teamNameList[0].teamId;
      this.teamName = this.teamNameList[0].teamName;
    }
    this.loadMoreData();
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
      },
    });
  }

  onTeamChange(teamId: number): void {
    this.selectedTeamId = teamId;

    if (teamId === 0) {
      this.selectedTeamName = 'All';
      this.teamName = '';
    } else {
      const selectedTeam = this.teamNameList.find((team) => team.teamId === teamId);
      this.selectedTeamName = selectedTeam ? selectedTeam.teamName : 'All';
      this.teamName = this.selectedTeamName;
    }

    // Reset pagination and fetch data
    this.pageNumber = 1;
    this.hasMoreData = true;
    this.teamMembers = []; // Clear existing data
    this.loadMoreData(); // Fetch filtered data
  }


  loadMoreData(): void {
    if (this.isLoadingNew || !this.hasMoreData) {
      return;
    }

    this.isLoadingNew = true;
    this.dataService.findTeamsMembersInfoByUserUuid(this.userId, this.teamName, this.itemsPerPage, this.pageNumber)
      .subscribe(
        (data : any) => {
          if (data.listOfObject.length < this.itemsPerPage) {
            this.hasMoreData = false; 
          }
          this.teamMembers = [...this.teamMembers, ...data.listOfObject]; 
          this.isLoadingNew = false;
          this.pageNumber++;
        },
        (error) => {
          console.error('Error fetching team members:', error);
          this.isLoadingNew = false;
        }
      );
  }

  
  onScroll(event: any): void {
    const element = event.target;
  debugger
    // Check if user scrolled close to the bottom of the container
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
      this.loadMoreData();
    }
  }


  images: any[] = [];
  count : number = 0;
  getTotalTeamMembers(): void {
  
    this.dataService.getTotalTeamMembers(this.userId)
      .subscribe(
        (data : any) => {
         
          this.images = data.object;
          this.count = data.totalItems;
        },
        (error) => {
          console.error('Error fetching team members:', error);
        }
      );
  }
  

  
}
