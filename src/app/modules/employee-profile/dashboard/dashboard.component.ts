import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Key } from 'src/app/constant/key';
import { UserResignation } from 'src/app/models/UserResignation';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { constant } from 'src/app/constant/constant';
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
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { OvertimeRequestLogResponse } from 'src/app/models/overtime-request-log-response';
import { NzCalendarComponent } from 'ng-zorro-antd/calendar';
import { ModalService } from 'src/app/services/modal.service';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexMarkers, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';


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

  requestModal: boolean = false;
  usersWithUpcomingBirthdays: any;

  resignationSubmittedSubscriber: any;
  resignationSubmittedToggle: boolean = false;
  constructor(private roleService: RoleBasedAccessControlService,
    private _notificationService: UserNotificationService,
    private modalService: ModalService,
    private dataService: DataService,
    public helperService: HelperService,
    private employeeProfileComponent: EmployeeProfileComponent) {
    this.resignationSubmittedSubscriber = this.helperService.resignationSubmitted.subscribe((value) => {
      if (value) {
        this.resignationSubmittedToggle = true;
        this.getUserResignationInfo();
      } else {
        this.resignationSubmittedToggle = false;
      }
    });
  }

  shouldShowResignationRow(): boolean {
    return (
      this.resignationSubmittedToggle ||
      (!this.hideResignationModal &&
        this.userResignationInfo &&
        (this.ROLE === 'ADMIN' || this.ROLE === 'USER') &&
        this.userResignationInfo?.status?.id === 13)
    );
  }

  ngOnDestroy() {
    this.resignationSubmittedSubscriber.complete();
    // this.stopCarousel();
  }

readonly Constants =constant;
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

  userId: string = ''
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
    // this.teamMembers = [];

    this.fetchAttendanceSummary();
    // this.loadHolidays();
    this.getTeamsWithManagerInfo();
    this.getTotalTeamMembers();
    // this.startCarousel();
    this.getNoticePeriodDuration();
    const currentYear = new Date().getFullYear();
    this.loadYearHolidays(currentYear);

    // this.getAttendanceRequestLogData();
    // this.fetchAttendanceSummary();
    // this.getMailNotification(this.userId, 'mail');
  }



  ngAfterViewInit(): void {
    this.getWorkedHourForEachDayOfAWeek();
    this.getMailNotification(this.userId, 'mail');
    this.fetchAttendanceRequests();
  }





  getUsersWithUpcomingBirthdays(): void {
    const currentYear = new Date().getFullYear();
    this.dataService.getUsersWithUpcomingBirthdays().subscribe(
      (data) => {
        data.forEach((item: any) => {
          if (item.birthday) {
            const birthdayDate = new Date(item.birthday);
            birthdayDate.setFullYear(currentYear); // Set the year to current year
            item.birthday = birthdayDate.toISOString().split('T')[0]; // Update birthday to new date
          }
        });
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
  changeDateToCurrentYear(dateString: string): string {
    const inputDate = new Date(dateString);
    const today = new Date();
    const currentYear = today.getFullYear();

    inputDate.setFullYear(currentYear);

    if (
      inputDate.getMonth() < today.getMonth() ||
      (inputDate.getMonth() === today.getMonth() && inputDate.getDate() < today.getDate())
    ) {

      inputDate.setFullYear(currentYear + 1);
    }

    return inputDate.toISOString().split('T')[0];
  }


  ROLE: any;
  UUID: string = '';
  userRoleFlag: boolean = false;
  async getRole() {
    this.ROLE = await this.roleService.getRole();
    this.UUID = await this.roleService.getUuid();


    if (this.userId == this.UUID) {
      this.userRoleFlag = true;
    } else {
      this.userRoleFlag = false;
    }
  }

  userResignationInfo: any;
  discussionType: string = 'Yes'
  recommendDay: string = 'Complete'
  getUserResignationInfo() {
    this.userResignationInfo = []
    this.dataService.getUserResignationInfo(this.userId).subscribe((res: any) => {
      if (res.status) {
        this.userResignationInfo = res.object[0]

        if (this.userResignationInfo.isManagerDiscussion == 0) {
          this.discussionType = 'No'
        }

        if (this.userResignationInfo.isRecommendedLastDay == 1) {
          this.recommendDay = 'Other'
        }

        console.log('userResignationInfo dashboard : ', this.userResignationInfo)
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
      if (res.status) {
        this.closeApproveModal.nativeElement.click()
        this.approveToggle = false
        this.helperService.profileChangeStatus.next(true);
        this.helperService.showToast(
          res.message,
          Key.TOAST_STATUS_SUCCESS
        );
      } else {
        this.approveToggle = false;
      }
    })
  }

  // Function to disable future dates
  disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    // const maxDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date

    // this.lastWorkingDay = maxDate;
    // console.log("Max Date: ", this.lastWorkingDay);
    // Disable dates from today to maxDate (inclusive)
    return current < today || current > maxDate;
  };

  noticePeriodDuration: number = 0;
  getNoticePeriodDuration() {
    this.dataService.getNoticePeriodDuration(this.userId).subscribe((res: any) => {
      if (res.status) {
        this.noticePeriodDuration = res.object
      }
    })
  }

  selectRecommendDay(value: string): void {

    // this.userResignationInfo.userLastWorkingDay = ''

    this.userResignationInfo.isRecommendLastDay = value == 'Other' ? 1 : 0

    if (this.userResignationInfo.isRecommendLastDay == 0) {
      this.userResignationInfo.userLastWorkingDay = ''
      this.calculateLasWorkingDay();
    } else {
      this.userResignationInfo.userLastWorkingDay = this.userResignationInfo.userLastWorkingDay
    }
  }

  selectManagerDiscussion(value: string): void {
    this.userResignationInfo.isManagerDiscussion = value == 'Yes' ? 1 : 0
  }

  calculateLasWorkingDay() {
    const today = new Date();
    // const maxDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date

    // this.lastWorkingDay = maxDate;
    // this.userResignationReq.lastWorkingDay = maxDate
    this.userResignationInfo.userLastWorkingDay = this.helperService.formatDateToYYYYMMDD(maxDate);
    // console.log("Max Date: ", this.lastWorkingDay);
  }


  showRevokeDiv: boolean = false;
  revokeReason: string = ''
  revokeResignation(id: number) {

    if (!this.showRevokeDiv) {
      this.showRevokeDiv = true;
    } else {
      this.approveToggle = true;
      this.requestModal = true;
      // console.log('hitt')
      // this.approveToggle = false
      // this.closeApproveModal.nativeElement.click()
      this.dataService.revokeResignation(id, this.userResignationInfo.revokeReason).subscribe((res: any) => {
        if (res.status) {
          this.closeApproveModal.nativeElement.click()
          this.approveToggle = false
          // this.helperService.profileChangeStatus.next(true);
          this.helperService.showToast(
            res.message,
            Key.TOAST_STATUS_SUCCESS
          );
        } else {
          this.approveToggle = false;
        }
      })

    }

  }

  clearForm() {
    this.userResignationInfo = this.userResignationInfo;
    this.revokeReason = ''
    this.userResignationInfo.revokeReason = ''
    this.showRevokeDiv = false;
  }

  // @ViewChild('closeResignationButton') closeResignationButton!: ElementRef
  userResignationReq: UserResignation = new UserResignation();
  resignationToggle: boolean = false;
  submitResignation() {
    this.resignationToggle = true;
    this.userResignationReq = this.userResignationInfo
    this.dataService.submitResignation(this.userResignationReq).subscribe((res: any) => {
      if (res.status) {
        this.resignationToggle = false
        // this.helperService.resignationSubmitted.next(true);
        this.closeApproveModal.nativeElement.click()
        this.getUserResignationInfo()
        // this.clearForm();
      }
    })

    // console.log('reqs: ',this.userResignationReq)
  }

  userLeaveLog: any;
  selectedLeaveType = 'All';
  selectedStatus = 'Pending';
  searchQuery = '';
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  totalPages = 0;
  isLoading = true;
  loadLeaveLogs(): void {
    const leaveType = this.selectedLeaveType === 'All' ? undefined : this.selectedLeaveType;
    const status = this.selectedStatus === 'All' ? undefined : this.selectedStatus;

    this.isLoading = true;
    this.dataService
      .getUserLeaveLogFilter(this.userId, this.currentPage, this.pageSize, leaveType, status, this.searchQuery)
      .subscribe((response) => {
        this.userLeaveLog = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      });
  }



  isShimmerForOvertimeLog = false;
  dataNotFoundPlaceholderForOvertimeLog = false;
  overtimeRequestLogResponseList: OvertimeRequestLogResponse[] = [];
  getOvertimeRequestLogResponseByUserUuidMethodCall() {
    this.isShimmerForOvertimeLog = true;
    this.dataService.getOvertimeRequestLogResponseByUserUuid(this.userId, 'pending').subscribe((response) => {
      if (this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.dataNotFoundPlaceholderForOvertimeLog = true;
      } else {
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

      this.dataService.getAttendanceRequestLog(this.userId, this.pageNumberAttendanceLogs, this.itemPerPageAttendanceLogs, 'pending').subscribe(response => {
        if (this.helperService.isObjectNullOrUndefined(response)) {
          this.dataNotFoundForAttendanceUpdateRequestLog = true;
        } else {
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
  attendanceRequests: any = [];
  currentAttendancePage: number = 1;
  pageAttendanceSize: number = 10;
  totalAttendanceElements: number = 0;
  attendanceStatus: string = 'PENDING';
  isAttendanceLoading: boolean = false;
  attendanceType: string = '';
  fetchAttendanceRequests(): void {
    this.isAttendanceLoading = true;
    this.dataService
      .getAttendanceUpdateFilteredRequests(
        this.userId,
        this.attendanceStatus,
        this.attendanceType,
        this.currentAttendancePage,
        this.pageAttendanceSize
      )
      .subscribe((response) => {
        this.attendanceRequests = response.content;
        this.totalAttendanceElements = response.totalElements;
        this.isAttendanceLoading = false;
      },
        (error) => {
          this.isAttendanceLoading = false;
        }
      );
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
    if (index >= 3) {
      var mod = index % 3;
      return { [`birthday-box-${mod}`]: true };
    } else {
      return { [`birthday-box-${index}`]: true };
    }
  }


  startDate: string = '';
  endDate: string = '';


  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2 digits
    const day = date.getDate().toString().padStart(2, '0'); // Ensure 2 digits
    return `${year}-${month}-${day}`;
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

  // Fetch and initialize chart data
  public isPlaceholder: boolean = false;
  getWorkedHourForEachDayOfAWeek(): void {
    this.dataService.getWorkedHourForEachDayOfAWeek(this.userId, this.startDate, this.endDate, 'WEEK').subscribe(
      (response: any) => {
        const labels = response.listOfObject.map((item: any) => this.formatDate(item.workDate));
        const data = response.listOfObject.map((item: any) => this.formatToDecimalHours(item.totalWorkedHour));

        // Update chart series and x-axis categories
        this.series = [{
          name: 'Total Worked Hours',
          data: data
        }];
        this.xaxis = {
          ...this.xaxis,
          categories: labels
        };

        // Handle placeholder and initialization
        if (response.listOfObject.length === 0) {
          this.isPlaceholder = true;
          this.isChartInitialized = false;
        } else {
          this.isPlaceholder = false;
          this.isChartInitialized = true;
        }
      },
      (error) => {
        console.error('Error fetching worked hours:', error);
        this.isPlaceholder = true;
        this.isChartInitialized = false;
      }
    );
  }

  // Date range calculation
  calculateDateRange(): void {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0: Sunday, 1: Monday, etc.
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    this.startDate = this.formatDateToYYYYMMDD(startOfWeek);
    this.endDate = this.formatDateToYYYYMMDD(endOfWeek);
  }


  public series: ApexAxisChartSeries = [];
  public chart: ApexChart  = {
    type: "area",
    stacked: false,
    height: 200,
    background: "transparent",
    zoom: {
      enabled: false // 🔹 Disables zooming
    },
    toolbar: {
      show: false,
      tools: {
        zoomin: false,  // Keep zoom in enabled
        zoomout: false, // 🔹 Disable zoom out button
        pan: false,
        reset: false // Optionally disable reset zoom
      }
    },
  };
  public grid = {
    show: false // 🔹 Hide grid lines
  };
  public xaxis: ApexXAxis = {
    type: 'category',
    title: { text: 'Days of the Week' },
    categories: []
  };
  public yaxis: ApexYAxis = {  labels: { show: false } };

  public fill: ApexFill = { type: "gradient", gradient: { shadeIntensity: 10, inverseColors: false, opacityFrom: 0.5, opacityTo: 0, stops: [0, 90, 100] } };
  public dataLabels: ApexDataLabels = { enabled: false }; // No data labels in original
  public markers: ApexMarkers = { size: 0 }; // Hide markers for a clean line
  public tooltip: ApexTooltip = {
    y: {
      formatter: (val: number) => this.formatDecimalToTime(val) // HH:MM format in tooltips
    }
  };
  public isChartInitialized: boolean = false;

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

  isYearlyHolidayLoading:boolean=false;
  loadYearHolidays(year: number): void {
    this.isYearlyHolidayLoading=true;
    this.dataService.getCurrentYearHolidays(year).subscribe({
      next: (data) => {
        this.holidayss = data;
        this.updateHolidayMaps();
        this.isYearlyHolidayLoading=false;
      },
      error: (error) => {
        console.error('Failed to fetch holidays', error);
        this.isYearlyHolidayLoading=false;
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
  clickViewAll() {
    debugger
    this.employeeProfileComponent.clickViewAll();
  }

  // currentDate = new Date();



  teamManagerInfo: any[] = [];
  getTeamsWithManagerInfo(): void {
    this.dataService.getTeamsWithManagerInfo(this.userId).subscribe({
      next: (response: any) => {
        this.isLoadingTeamManager = false;
        this.teamManagerInfo = response.listOfObject;
      },
      error: (error) => {
        this.isLoadingTeamManager = false;
        console.error('Failed to fetch holidays', error);
      },
    });
  }


  teamNameList: { teamId: number; teamName: string }[] = [];
  teamMembers: any[] = [];
  selectedTeamId: number = 0;
  selectedTeamName: string = 'All';
  isLoadingTeamMembers: boolean = true;
  isLoadingTeamManager: boolean=true;
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
        // this.isLoadingTeamMembers = true;
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
    if (!this.hasMoreData) {
      return;
    }

    this.isLoadingTeamMembers = true;
    this.dataService.findTeamsMembersInfoByUserUuid(this.userId, this.teamName, this.itemsPerPage, this.pageNumber)
      .subscribe(
        (data: any) => {
          if (data.listOfObject.length < this.itemsPerPage) {
            this.hasMoreData = false;
          }
          this.teamMembers = [...this.teamMembers, ...data.listOfObject];
          // this.teamMembers = data.listOfObject;
          this.isLoadingTeamMembers = false;
          this.pageNumber++;
        },
        (error) => {
          console.error('Error fetching team members:', error);
          this.isLoadingTeamMembers = false;
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
  count: number = 0;
  getTotalTeamMembers(): void {

    this.dataService.getTotalTeamMembers(this.userId)
      .subscribe(
        (data: any) => {

          this.images = data.object;
          this.count = data.totalItems;
        },
        (error) => {
          console.error('Error fetching team members:', error);
        }
      );
  }




// Holiday data
holidayss = [
  {
    name: "New Year",
    id: 72,
    date: "2025-01-01",
    holidayType: "Custom",
    logo: null,
  }
];

onYearChange(event: any): void {

  const selectedYear = event.getFullYear();
  const prevYear = this.currentDate.getFullYear();
  if(selectedYear !== prevYear) {
    this.loadYearHolidays(selectedYear);
  }
  this.currentDate=event;

}


// Transform the holiday data into a map for both date and month views
listDataMap: { [key: string]: { type: string; content: string }[] } = this.holidayss.reduce((map, holiday) => {
  const dateKey = this.formatDateToLocal(new Date(holiday.date)); // Use the helper to format the date
  if (!map[dateKey]) {
    map[dateKey] = [];
  }
  map[dateKey].push({ type: 'success', content: holiday.name });
  return map;
}, {} as { [key: string]: { type: string; content: string }[] });

// Month data: counts holidays per month
monthDataMap: { [key: number]: number } = this.holidayss.reduce((map, holiday) => {
  const month = new Date(holiday.date).getMonth(); // Get month index (0-based)
  map[month] = (map[month] || 0) + 1;
  return map;
}, {} as { [key: number]: number });

// Helper to get events for a specific date
getHolidayEvents(date: Date): { type: string; content: string }[] {
  // Format the date to 'YYYY-MM-DD' using the local timezone
  const dateKey = this.formatDateToLocal(date);
  return this.listDataMap[dateKey] || [];
}

// Helper function to format the date to 'YYYY-MM-DD' without timezone issues
formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');  // Ensure two-digit month
  const day = String(date.getDate()).padStart(2, '0');         // Ensure two-digit day
  return `${year}-${month}-${day}`;
}

// Helper to get the number of holidays for a specific month
getMonthHolidayCount(date: Date): number {
  const month = date.getMonth(); // Get month index (0-based)
  return this.monthDataMap[month] || 0;
}
updateHolidayMaps(): void {
  // Recalculate listDataMap for date view
  this.listDataMap = this.holidayss.reduce((map, holiday) => {
    const dateKey = new Date(holiday.date).toISOString().split('T')[0]; // 'YYYY-MM-DD'
    if (!map[dateKey]) {
      map[dateKey] = [];
    }
    map[dateKey].push({ type: 'success', content: holiday.name });
    return map;
  }, {} as { [key: string]: { type: string; content: string }[] });

  // Recalculate monthDataMap for month view
  this.monthDataMap = this.holidayss.reduce((map, holiday) => {
    const month = new Date(holiday.date).getMonth(); // 0-based month index
    map[month] = (map[month] || 0) + 1;
    return map;
  }, {} as { [key: number]: number });
}

isHoliday(date: Date): boolean {
  return this.holidayss.some(holiday => this.isSameDate(holiday.date, date));
}
isSameDate(date1: string | Date, date2: Date): boolean {
  // Ensure both inputs are Date objects
  const parsedDate1 = typeof date1 === 'string' ? new Date(date1) : date1;

  return (
    parsedDate1.getFullYear() === date2.getFullYear() &&
    parsedDate1.getMonth() === date2.getMonth() &&
    parsedDate1.getDate() === date2.getDate()
  );
}

get currentMonthYear(): string {
  return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

navigateMonth(direction: 'prev' | 'next'): void {
  const currentYear = this.currentDate.getFullYear();
  const currentMonth = this.currentDate.getMonth();

  // Calculate the new date
  const newDate = new Date(this.currentDate.getFullYear(), currentMonth + (direction === 'next' ? 1 : -1), 1);

  // Check if the year changes
  if (newDate.getFullYear() !== currentYear) {
    this.onYearChange(newDate);
  }

  // Update the current date
  this.currentDate = newDate;
}

onInitiateExitClick() {
  this.modalService.openInitiateExitModal(this.userId, this.ROLE).then(
    (result) => {
      this.getUserResignationInfo();
      this.getNoticePeriodDuration();
    },
    (reason) => {
      this.getUserResignationInfo();
      this.getNoticePeriodDuration();
    }
  );
}


}
