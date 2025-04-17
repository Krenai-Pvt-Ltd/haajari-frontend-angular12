import { DatePipe, KeyValue } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Key } from 'src/app/constant/key';
import { AttendanceReportLogs } from 'src/app/models/AttendanceReportLogs';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  userUuid: string = '';
  isModalVisible: boolean = false;
  isLoading: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  organizationOnboardingDate: Date = new Date('YYYY-MM-dd');

  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private datePipe: DatePipe,
    private rbacService: RoleBasedAccessControlService
  ) {}

  async ngOnInit(): Promise<void> {
    window.scroll(0, 0);
    this.getFullReportLogs();
    this.userUuid = await this.rbacService.getUUID();
    this.getOrganizationOnboardingDateByUuid();
    this.getUsersByFilterMethodCall();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
  }

  @ViewChild('dateRangeModalClose') dateRangeModalClose!: ElementRef;

  closeModal(): void {
    // this.isModalVisible = true;
    this.dateRangeModalClose.nativeElement.click();
  }

  getOrganizationOnboardingDateByUuid() {
    debugger;
    this.dataService.getOrganizationOnboardingDate(this.userUuid).subscribe(
      (data) => {
        this.organizationOnboardingDate = new Date(data);
        // console.log(
        //   'getOrganizationOnboardingDateByUuid',
        //   this.getOrganizationOnboardingDateByUuid
        // );
      },
      (error) => {}
    );
  }

  selectedMonth: any;

  // organizationOnboardingDate: Date = new Date('2023-11-01');

  // disableBeforeOnboarding = (current: Date): boolean => {
  //   const onboardingMonth = new Date(
  //     this.organizationOnboardingDate.getFullYear(),
  //     this.organizationOnboardingDate.getMonth(),
  //     1
  //   );
  //   const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1);
  //   const now = new Date();
  //   const currentEndOfMonth = new Date(
  //     current.getFullYear(),
  //     current.getMonth() + 1,
  //     0
  //   );
  //   return (
  //     currentMonth < onboardingMonth ||
  //     currentEndOfMonth > new Date(now.getFullYear(), now.getMonth() + 1, 0)
  //   );
  // };

  disableBeforeOnboarding = (current: Date): boolean => {
    const onboardingDate = this.organizationOnboardingDate;
    const now = new Date();

    return current < onboardingDate || current > now;
  };


  disableBeforeOnboardingForSalary = (current: Date): boolean => {
    const onboardingYear = this.organizationOnboardingDate.getFullYear();
    const onboardingMonth = this.organizationOnboardingDate.getMonth();

    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth();

    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();

    return (
      currentYear < onboardingYear ||
      (currentYear === onboardingYear && currentMonth < onboardingMonth) ||
      currentYear > nowYear ||
      (currentYear === nowYear && currentMonth >= nowMonth)
    );
  };

  // handleOkOfAttendanceSummary(): void {
  //   if (this.selectedMonth) {
  //     const startOfMonth = new Date(
  //       this.selectedMonth.getFullYear(),
  //       this.selectedMonth.getMonth(),
  //       1
  //     );
  //     const endOfMonth = new Date(
  //       this.selectedMonth.getFullYear(),
  //       this.selectedMonth.getMonth() + 1,
  //       0
  //     ); // Sets day as the last day of the month

  //     this.startDate = startOfMonth;
  //     this.endDate = endOfMonth;

  //     // console.log('Start Date:', this.startDate);
  //     // console.log('End Date:', this.endDate);

  //     this.isModalVisible = false;
  //     if (this.startDate && this.endDate) {
  //       this.isLoading = true;
  //       this.helperService.showToast(
  //         "Please Wait! We're loading your Attendance Records.",
  //         Key.TOAST_STATUS_SUCCESS
  //       );
  //       let formattedStartDate = this.formatDate(this.startDate);
  //       let formattedEndDate = this.formatDate(this.endDate);
  //       this.generateAttendanceSummary(formattedStartDate, formattedEndDate);

  //       this.closeModal();
  //     }
  //     this.selectedMonth = '';
  //   }
  // }

  selectedDateRange: Date[] = []; // To hold the selected date range
// startDate: Date | null = null; // Start date
// endDate: Date | null = null;  // End date

handleOkOfAttendanceSummary(): void {
  if (this.selectedDateRange && this.selectedDateRange.length === 2) {
    const [startOfRange, endOfRange] = this.selectedDateRange;

    this.startDate = new Date(startOfRange);
    this.endDate = new Date(endOfRange);

    this.isModalVisible = false;

    if (this.startDate && this.endDate) {
      this.isLoading = true;
      this.helperService.showToast(
        "Please Wait! We're loading your Attendance Records.",
        Key.TOAST_STATUS_SUCCESS
      );

      const formattedStartDate = this.formatDate(this.startDate);
      const formattedEndDate = this.formatDate(this.endDate);
      this.generateAttendanceSummary(formattedStartDate, formattedEndDate);

      this.closeModal();
    }

    // Clear the selected range after processing
    this.selectedDateRange = [];
  }
}


  // handleOk(): void {
  //   this.isModalVisible = false;
  //   if (this.startDate && this.endDate) {
  //     debugger
  //     this.isLoading = true;
  //     let formattedStartDate = this.formatDate(this.startDate);
  //     let formattedEndDate = this.formatDate(this.endDate);
  //     this.generateAttendanceReport(formattedStartDate, formattedEndDate);
  //     this.closeModal();
  //   }
  // }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  generateAttendanceSummary(startDate: string, endDate: string): void {
    this.dataService.generateAttendanceSummary(startDate, endDate, this.selectedUserIds).subscribe({
      next: (response) => {
        // console.log('Report Generation Successful', response);
        this.isLoading = false;
        this.getFullReportLogs();
        this.selectedUserIds = [];
        this.isSelectAllUsers = true;
        this.helperService.showToast(
          'Attendance Records Fetched Successfully!',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      error: (error) => {
        console.error('Error generating report', error);
        this.isLoading = false;
      },
    });
  }

  private formatDate(date: Date): string {
    if (!date) {
      return '';
    }
    // Create a new Date object to avoid mutating the original date
    let adjustedDate = new Date(date);

    // Adjust the date to the start of the day in the local timezone
    adjustedDate.setHours(0, 0, 0, 0);

    // Calculate the timezone offset in minutes and adjust the date accordingly
    const offset = adjustedDate.getTimezoneOffset();
    adjustedDate = new Date(adjustedDate.getTime() - offset * 60 * 1000);

    // Format the adjusted date to 'yyyy-MM-dd'
    return this.datePipe.transform(adjustedDate, 'yyyy-MM-dd', 'UTC') || '';
  }

  // private formatDate(date: Date): string {
  //   return this.datePipe.transform(date, 'yyyy-MM-dd', 'UTC') ?? '';
  // }

  // private formatDate(date: Date): string {
  //   return date.toISOString().split('T')[0];
  // }

  // attendanceReportLogs: AttendanceReportLogs[] = [];
  // isAttendanceLogsPlaceholder:boolean=false;
  // getAttendanceReportLogs(): void {
  //   this.dataService.getAttendanceReportLogs().subscribe({
  //     next: (response) => {
  //       console.log('userUuid', this.userUuid);
  //       console.log('Logs Generation Successful', response);
  //       this.attendanceReportLogs = response.listOfObject;
  //       if(this.attendanceReportLogs.length===0){
  //       this.isAttendanceLogsPlaceholder=true;
  //       }else{
  //         this.isAttendanceLogsPlaceholder=false;
  //       }
  //     },
  //     error: (error) => {
  //       this.isAttendanceLogsPlaceholder=false;
  //       console.error('Error generating report', error);
  //     }
  //   });
  // }

  groupedLogs: { [date: string]: any[] } = {}; // Use a more specific type if possible
  isAttendanceLogsPlaceholder: boolean = true;
  getFullReportLogs(): void {
    this.dataService.getAllReportLogs().subscribe({
      next: (response) => {
        this.groupedLogs = response;
        this.isAttendanceLogsPlaceholder =
          Object.keys(this.groupedLogs).length === 0;
      },
      error: (error) => {
        console.error('Error generating report', error);
        this.isAttendanceLogsPlaceholder = true;
      },
    });
  }
  sortDatesDescending = (
    a: { key: string | number | Date },
    b: { key: string | number | Date }
  ) => {
    return +new Date(b.key) - +new Date(a.key);
  };

  // groupLogsByDate(logs: AttendanceReportLogs[]): void {
  //   logs.forEach(log => {
  //     const dateStr = new Date(log.createdDate).toLocaleDateString(); // Adjust based on your date format
  //     if (!this.groupedLogs[dateStr]) {
  //       this.groupedLogs[dateStr] = [];
  //     }
  //     this.groupedLogs[dateStr].push(log);
  //   });
  // }

  // keepOriginalOrder = (a: KeyValue<string, AttendanceReportLogs[]>, b: KeyValue<string, AttendanceReportLogs[]>): number => {
  //   return 0;
  // }

  formatDate2(date: Date) {
    const dateObject = new Date(date);
    const formattedDate = this.datePipe.transform(dateObject, 'yyyy-MM-dd');
    return formattedDate;
  }

  formatTime(date: Date) {
    const dateObject = new Date(date);
    const formattedTime = this.datePipe.transform(dateObject, 'hh:mm a');
    return formattedTime;
  }

  formatDateIn(newdate: any) {
    const date = new Date(newdate);
    const formattedDate = this.datePipe.transform(date, 'dd MMMM, yyyy');
    return formattedDate;
  }

  isLoading2: boolean = false;

  handleOkOfAttendanceReport(): void {
    if (this.selectedDateRange && this.selectedDateRange.length === 2) {
      const [startOfRange, endOfRange] = this.selectedDateRange;

      this.startDate = new Date(startOfRange);
      this.endDate = new Date(endOfRange);

      if (this.startDate && this.endDate) {
        this.isLoading2 = true;
        this.helperService.showToast(
          "Please Wait! We're loading your Attendance Records.",
          Key.TOAST_STATUS_SUCCESS
        );

        const formattedStartDate = this.formatDate(this.startDate);
        const formattedEndDate = this.formatDate(this.endDate);
        this.generateAttendanceReport(formattedStartDate, formattedEndDate);

        this.closeModal2();
      }

      // Clear the selected range after processing
      this.selectedDateRange = [];
    }
  }


  // handleOkOfAttendanceReport(): void {
  //   if (this.selectedMonth) {
  //     const startOfMonth = new Date(
  //       this.selectedMonth.getFullYear(),
  //       this.selectedMonth.getMonth(),
  //       1
  //     );
  //     const endOfMonth = new Date(
  //       this.selectedMonth.getFullYear(),
  //       this.selectedMonth.getMonth() + 1,
  //       0
  //     ); // Sets day as the last day of the month

  //     this.startDate = startOfMonth;
  //     this.endDate = endOfMonth;

  //     // console.log('Start Date:', this.startDate);
  //     // console.log('End Date:', this.endDate);

  //     // this.isModalVisible = false;
  //     if (this.startDate && this.endDate) {
  //       this.isLoading2 = true;
  //       this.helperService.showToast(
  //         "Please Wait! We're loading your Attendance Records.",
  //         Key.TOAST_STATUS_SUCCESS
  //       );
  //       let formattedStartDate = this.formatDate(this.startDate);
  //       let formattedEndDate = this.formatDate(this.endDate);
  //       this.generateAttendanceReport(formattedStartDate, formattedEndDate);

  //       this.closeModal2();
  //     }
  //     this.selectedMonth = '';
  //   }
  // }

  generateAttendanceReport(startDate: string, endDate: string): void {
    this.dataService.generateAttendanceReport(startDate, endDate, this.selectedUserIds).subscribe({
      next: (response) => {
        // console.log('Report Generation Successful', response);
        this.isLoading2 = false;
        this.getFullReportLogs();
        this.selectedUserIds = [];
        this.isSelectAllUsers2 = true;
        this.helperService.showToast(
          'Attendance Records Fetched Successfully!',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      error: (error) => {
        console.error('Error generating report', error);
        this.isLoading2 = false;
      },
    });
  }

  @ViewChild('closeDateRangeModal2') closeDateRangeModal2!: ElementRef;

  closeModal2(): void {
    this.closeDateRangeModal2.nativeElement.click();
  }

  isLoading3: boolean = false;

  handleOkOfSalaryReport(): void {
    if (this.selectedMonth) {
      const startOfMonth = new Date(
        this.selectedMonth.getFullYear(),
        this.selectedMonth.getMonth(),
        1
      );
      const endOfMonth = new Date(
        this.selectedMonth.getFullYear(),
        this.selectedMonth.getMonth() + 1,
        0
      );

      this.startDate = startOfMonth;
      this.endDate = endOfMonth;

      // console.log('Start Date:', this.startDate);
      // console.log('End Date:', this.endDate);

      // this.isModalVisible = false;
      if (this.startDate && this.endDate) {
        this.isLoading3 = true;
        this.helperService.showToast(
          'Please wait, salary report is getting downloded...',
          Key.TOAST_STATUS_SUCCESS
        );
        let formattedStartDate = this.formatDate(this.startDate);
        let formattedEndDate = this.formatDate(this.endDate);
        this.generateSalaryReport(formattedStartDate, formattedEndDate);

        this.closeModal3();
      }
      this.selectedMonth = '';
    }
  }

  generateSalaryReport(startDate: string, endDate: string): void {
    this.dataService.generateSalaryReport(startDate, endDate).subscribe({
      next: (response) => {
        console.log('Report Generation Successful', response);
        this.isLoading3 = false;
        this.getFullReportLogs();
        this.helperService.showToast(
          'Salary Records Fetched Successfully!',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      error: (error) => {
        console.error('Error generating report', error);
        this.isLoading3 = false;
      },
    });
  }

  @ViewChild('closeDateRangeModal3') closeDateRangeModal3!: ElementRef;

  closeModal3(): void {
    this.closeDateRangeModal3.nativeElement.click();
  }


  dailyReportLog : string = '';
  isLoading4: boolean = false;
  selectedMonthOfDailyReport : any

  downloadAttedanceReport() {
    this.closeModal4();
    let dateString:string | null  = this.datePipe.transform(this.selectedMonthOfDailyReport, 'yyyy-MM-dd');
    this.isLoading4 = true;
    if(dateString!==null) {
    this.dataService
      .getAtendanceDailyReport(
        dateString, this.selectedUserIds
      )
      .subscribe(
        (response) => {
         this.dailyReportLog = response.message;
         this.getFullReportLogs();
         this.helperService.showToast(
          'Daily Attendance Report Logs Fetched Successfully!',
          Key.TOAST_STATUS_SUCCESS
        );
        this.selectedUserIds = [];
        this.isSelectAllUsers3 = true;

        //  const downloadLink = document.createElement('a');
        //   downloadLink.href = response.message;
        //   downloadLink.download = 'attendance.xlsx';
        //   downloadLink.click();

          this.isLoading4 = false;
        },
        (error) => {
          this.isLoading4 = false;
          this.helperService.showToast(
            'Error In Fetching Daily Attendance Report Logs!',
            Key.TOAST_STATUS_SUCCESS
          );
        }
      );
    }
  }

  @ViewChild('closeDateRangeModal4') closeDateRangeModal4!: ElementRef;

  closeModal4(): void {
    this.closeDateRangeModal4.nativeElement.click();
  }

  disableBeforeOnboardingForDailyReport = (current: Date): boolean => {
    const onboardingDate = this.organizationOnboardingDate;
    const now = new Date();

    // Disable dates before the organization onboarding date
    const isBeforeOnboarding = current < onboardingDate;

    // Disable dates after the current date
    const isAfterCurrentDate = current > now;

    return isBeforeOnboarding || isAfterCurrentDate;
  };

  users : User[] = [];
  selectedUserIds: number[] = [];
  userOptions: { label: string; value: number }[] = [];
  isSelectAllUsers: boolean = true; // Default to Select All Users
  isSelectAllUsers2: boolean = true; // Default to Select All Users
  isSelectAllUsers3: boolean = true; // Default to Select All Users
  getUsersByFilterMethodCall() {
    this.dataService
      .getUsersByFilter(0, 1, 'asc', 'id', '', 'name',0)
      .subscribe((data) => {
        this.users = data.users;
        // this.total = data.count;

          // Map users to userOptions for ngZorro multi-select
          this.userOptions = data.users.map((user: any) => ({
            label: `${user.name} (${user.email || 'N/A'})`,
            value: user.id
          }));

        // console.log(this.users, this.total);
      });
  }
  selectedUser: any;

  selectUser(user: any) {
    this.selectedUser = user;
  }

  onToggleSelectAllUsers(value: boolean): void {
    this.isSelectAllUsers = value;

    // Reset selected users if toggled to "Select All Users"
    if (value) {
      this.selectedUserIds = [];
    }
  }

  onToggleSelectAllUsers2(value: boolean): void {
    this.isSelectAllUsers2 = value;

    // Reset selected users if toggled to "Select All Users"
    if (value) {
      this.selectedUserIds = [];
    }
  }


  onToggleSelectAllUsers3(value: boolean): void {
    this.isSelectAllUsers3 = value;

    // Reset selected users if toggled to "Select All Users"
    if (value) {
      this.selectedUserIds = [];
    }
  }

  


  onUsersChange(selectedIds: number[]) {
    this.selectedUserIds = selectedIds; // Update selected user IDs
    console.log(this.selectedUserIds); // Debug: Check selected user IDs
  }

  // handleOkOfAttendanceSummary() {
  //   // Use the selectedUserIds array as needed
  //   console.log('Generating report for users:', this.selectedUserIds);
  // }



  @ViewChild('dateRangeModalClose5') dateRangeModalClose5!: ElementRef;
  attendenceFilter : string = '';
  dateRangeError: string = '';
  attendanceFilterError: string = '';
  isLoading5 : boolean = false;
  attendenceReportSummary(): void {
      this.dateRangeError = '';
      this.attendanceFilterError = '';

      let hasError = false;

      // Validate Date Range
      if (!this.selectedDateRange || this.selectedDateRange.length !== 2) {
        this.dateRangeError = 'Please select a valid date range.';
        hasError = true;
      }

      // Validate Attendance Filter
      if (!this.attendenceFilter || this.attendenceFilter.trim() === '') {
        this.attendanceFilterError = 'Please select an attendance type.';
        hasError = true;
      }

      if (hasError) {
        return;
      }

      const [startOfRange, endOfRange] = this.selectedDateRange;
      this.startDate = new Date(startOfRange);
      this.endDate = new Date(endOfRange);

      const formattedStartDate = this.formatDate(this.startDate);
      const formattedEndDate = this.formatDate(this.endDate);

      this.isLoading5 = true;
      this.generateAttendanceSummaryReport(formattedStartDate, formattedEndDate);
      this.dateRangeModalClose5.nativeElement.click();
      this.selectedDateRange = [];
  }



  generateAttendanceSummaryReport(startDate: string, endDate: string): void {
    this.dataService.getAttendenceSummeryReportByFilter(startDate, endDate,this.attendenceFilter, this.selectedUserIds,).subscribe((res: any) => {
      if(res.status){
        console.log("Attendance Record Fetched Successfully...");
        this.isLoading5 = false;
        this.getFullReportLogs();
        this.selectedUserIds = [];
        this.isSelectAllUsers = true;
        this.attendenceFilter = '';
        this.helperService.showToast(
          'Attendance Records Fetched Successfully!',
          Key.TOAST_STATUS_SUCCESS
        );
      }else{
        console.error('Error generating report', res.object);
        this.isLoading5 = false;
        this.attendenceFilter = '';
        this.selectedUserIds = [];
      }
    });
  }

  LeaveSummary(filter : string){
    if(filter === 'LEAVE'){
      this.leaveFilter = filter;
    }else if(filter === 'WFH'){
      this.leaveFilter = filter;
    }else{
      this.leaveFilter = filter;
    }
    this.generateLeaveSummaryReport();
  }

  
  @ViewChild('dateRangeModalClose6') dateRangeModalClose6!: ElementRef;
  leaveLoading : boolean = false;
  wfhLoading : boolean = false;
  outdutyLoading : boolean = false;
  leaveFilter : string = '';
  leaveFilterError : string = '';
  generateLeaveSummaryReport(): void {
    if(this.leaveFilter === 'LEAVE'){
      this.leaveLoading = true;
    }else if(this.leaveFilter === 'WFH'){
      this.wfhLoading = true;
    }else if(this.leaveFilter === 'OUTDUTY'){
      this.outdutyLoading = true;
    }
    this.dateRangeModalClose6.nativeElement.click();
    this.dataService.getLeaveSummeryReport(this.leaveFilter, this.selectedUserIds).subscribe((res: any) => {
      if(res.status){
        console.log("Leave Record Fetched Successfully...");
        this.resetloading();
        this.getFullReportLogs();
        this.selectedUserIds = [];
        this.isSelectAllUsers = true;
        this.leaveFilter = '';
        this.helperService.showToast('Leave Records Fetched Successfully!',Key.TOAST_STATUS_SUCCESS);
      }else{
        console.error('Error generating report', res.object);
        this.resetloading();
        this.leaveFilter = '';
        this.selectedUserIds = [];
        this.helperService.showToast('Error generating Leave Records!',Key.TOAST_STATUS_ERROR);
      }
    });
  }

  resetloading(){
    this.leaveLoading = false;
    this.wfhLoading = false;
    this.outdutyLoading = false;
  }


  @ViewChild('dateRangeModalClose7') dateRangeModalClose7!: ElementRef;
  isLoading7 : boolean = false;
  generateSanctionLeaveSummaryReport(): void {
    if (!this.selectedDateRange || this.selectedDateRange.length !== 2) {
      this.dateRangeError = 'Please select a valid date range.';
      return;
    }
    const [startOfRange, endOfRange] = this.selectedDateRange;
    this.startDate = new Date(startOfRange);
    this.endDate = new Date(endOfRange);

    const formattedStartDate = this.formatDate(this.startDate);
    const formattedEndDate = this.formatDate(this.endDate);
    this.isLoading7 = true;
    this.dateRangeModalClose7.nativeElement.click();
    this.dataService.getSanctionLeaveSummeryReport(formattedStartDate, formattedEndDate,this.selectedUserIds).subscribe((res: any) => {
      if(res.status){
        console.log("Sanction Leave Record Fetched Successfully...");
        this.isLoading7 = false;
        this.getFullReportLogs();
        this.selectedUserIds = [];
        this.isSelectAllUsers = true;
        this.selectedDateRange = [];
        this.helperService.showToast('Sanction Leave Records Fetched Successfully!',Key.TOAST_STATUS_SUCCESS);
      }else{
        console.error('Error generating report', res.object);
        this.isLoading7 = false;
        this.selectedDateRange = [];
        this.selectedUserIds = [];
        this.helperService.showToast('Error generating Sanction Leave Records!',Key.TOAST_STATUS_ERROR);
      }
    });
  }



  isLoading8 : boolean = false;
  assetTypeFilter : string = '';
  assetStatusFilter : string = '';
  typrError : string = '';
  statusError : string = '';
  @ViewChild('dateRangeModalClose8') dateRangeModalClose8!: ElementRef;
  generateAssetRequestReport(): void {
    
    let hasError = false;

      if (!this.assetTypeFilter || this.assetTypeFilter.trim() === '') {
        this.typrError = 'Please select request type.';
        hasError = true;
      }

      if (!this.assetStatusFilter || this.assetStatusFilter.trim() === '') {
        this.statusError = 'Please select an request status.';
        hasError = true;
      }

      if (hasError) {
        return;
      }
    this.dateRangeModalClose8.nativeElement.click();
    this.isLoading8 = true;
    this.dataService.getAssetRequestReport(this.assetTypeFilter,this.assetStatusFilter).subscribe((res: any) => {
      if(res.status){
        console.log("Asset Request Summary Fetched Successfully...");
        this.isLoading8 = false;
        this.assetTypeFilter = '';
        this.assetStatusFilter = '';
        this.getFullReportLogs();
        this.helperService.showToast('Asset Request Summary Fetched Successfully!',Key.TOAST_STATUS_SUCCESS);
      }else{
        console.error('Error generating Asset Request Summary ', res.object);
        this.isLoading8 = false;
        this.assetTypeFilter = '';
        this.assetStatusFilter = '';
        this.helperService.showToast('Error generating Asset Request Summary!',Key.TOAST_STATUS_ERROR);
      }
    });
  }

  isLoading9 : boolean = false;
  generateAssetSummaryReport(): void {
    this.isLoading9 = true;
    this.dataService.getAssetSummaryReport().subscribe((res: any) => {
      if(res.status){
        console.log("Asset Summary Fetched Successfully...");
        this.isLoading9 = false;
        this.getFullReportLogs();
        this.helperService.showToast('Asset Summary Fetched Successfully!',Key.TOAST_STATUS_SUCCESS);
      }else{
        console.error('Error generating Asset Summary ', res.object);
        this.isLoading9 = false;
      }
    });
  }



}
