import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AttendanceReportLogs } from 'src/app/models/AttendanceReportLogs';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {


  isModalVisible: boolean = false;
  isLoading: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(private dataService: DataService,  private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.getAttendanceReportLogs();
  }


  @ViewChild("dateRangeModalClose") dateRangeModalClose!:ElementRef;
  
  closeModal(): void {
    // this.isModalVisible = true;
    this.dateRangeModalClose.nativeElement.click();
  }

  handleOk(): void {
    this.isModalVisible = false;
    if (this.startDate && this.endDate) {
      debugger
      this.isLoading = true;
      let formattedStartDate = this.formatDate(this.startDate);
      let formattedEndDate = this.formatDate(this.endDate);
      this.generateAttendanceReport(formattedStartDate, formattedEndDate);
      this.closeModal();
    }
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  generateAttendanceReport(startDate: string, endDate: string): void {
    this.dataService.generateAttendanceReport(startDate, endDate).subscribe({
      next: (response) => {
        console.log('Report Generation Successful', response);
        this.isLoading = false;
        this.getAttendanceReportLogs();
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

  getAttendanceReportLogs(): void {
    this.dataService.getAttendanceReportLogs().subscribe({
      next: (response) => {
        console.log('Logs Generation Successful', response);
        this.attendanceReportLogs = response.listOfObject;
      },
      error: (error) => {
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
