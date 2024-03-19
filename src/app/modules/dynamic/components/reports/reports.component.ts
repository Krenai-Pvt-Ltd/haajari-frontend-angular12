import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Key } from 'src/app/constant/key';
import { AttendanceReportLogs } from 'src/app/models/AttendanceReportLogs';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {


  userUuid:string='';
  isModalVisible: boolean = false;
  isLoading: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  organizationOnboardingDate:Date=new Date('YYYY-MM-dd');

  constructor(private dataService: DataService, private helperService: HelperService,  private datePipe: DatePipe, private rbacService: RoleBasedAccessControlService) { }

  async ngOnInit(): Promise<void> {
    this.getAttendanceReportLogs();
    this.userUuid = await this.rbacService.getUUID();
    this.getOrganizationOnboardingDateByUuid();
  }


  @ViewChild("dateRangeModalClose") dateRangeModalClose!:ElementRef;
  
  closeModal(): void {
    // this.isModalVisible = true;
    this.dateRangeModalClose.nativeElement.click();
  }
  

  getOrganizationOnboardingDateByUuid() {
    debugger
    this.dataService.getOrganizationOnboardingDate(this.userUuid).subscribe(
      (data) => {
        this.organizationOnboardingDate = new Date(data);
        console.log("getOrganizationOnboardingDateByUuid", this.getOrganizationOnboardingDateByUuid);
      },
      (error) => {
      }
    );
  }

  selectedMonth:any;

  // organizationOnboardingDate: Date = new Date('2023-11-01'); 

  disableBeforeOnboarding = (current: Date): boolean => {
    const onboardingMonth = new Date(this.organizationOnboardingDate.getFullYear(), this.organizationOnboardingDate.getMonth(), 1);
    const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1);
    const now = new Date();
    const currentEndOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    return currentMonth < onboardingMonth || currentEndOfMonth > new Date(now.getFullYear(), now.getMonth() + 1, 0);
  };

  handleOk(): void {
    if (this.selectedMonth) {
      const startOfMonth = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0); // Sets day as the last day of the month
  
      this.startDate = startOfMonth;
      this.endDate = endOfMonth;
  
      console.log('Start Date:', this.startDate);
      console.log('End Date:', this.endDate);

      this.isModalVisible = false;
    if (this.startDate && this.endDate) {
      this.isLoading = true;
      this.helperService.showToast("Please Wait! We're loading your Attendance Records.", Key.TOAST_STATUS_SUCCESS);
      let formattedStartDate = this.formatDate(this.startDate);
      let formattedEndDate = this.formatDate(this.endDate);
      this.generateAttendanceReport(formattedStartDate, formattedEndDate);
     
      this.closeModal();
    }
    this.selectedMonth="";
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

  generateAttendanceReport(startDate: string, endDate: string): void {
    this.dataService.generateAttendanceReport(startDate, endDate).subscribe({
      next: (response) => {
        console.log('Report Generation Successful', response);
        this.isLoading = false;
        this.getAttendanceReportLogs();
        this.helperService.showToast("Attendance Records Fetched Successfully!", Key.TOAST_STATUS_SUCCESS);

      },
      error: (error) => {
        console.error('Error generating report', error);
        this.isLoading = false;
      }
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

  attendanceReportLogs: AttendanceReportLogs[] = [];
  isAttendanceLogsPlaceholder:boolean=false;
  getAttendanceReportLogs(): void {
    this.dataService.getAttendanceReportLogs().subscribe({
      next: (response) => {
        console.log('userUuid', this.userUuid);
        console.log('Logs Generation Successful', response);
        this.attendanceReportLogs = response.listOfObject;
        if(this.attendanceReportLogs.length===0){
        this.isAttendanceLogsPlaceholder=true;
        }else{
          this.isAttendanceLogsPlaceholder=false;
        }
      },
      error: (error) => {
        this.isAttendanceLogsPlaceholder=false;
        console.error('Error generating report', error);
      }
    });
  }

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

  formatDateIn(newdate:any) {
    const date = new Date(newdate);
    const formattedDate = this.datePipe.transform(date, 'dd MMMM, yyyy');
    return formattedDate;
  }


  
}
