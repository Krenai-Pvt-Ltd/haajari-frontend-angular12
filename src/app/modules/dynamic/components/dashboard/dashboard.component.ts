import { Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import * as dayjs from 'dayjs';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { DatePipe } from '@angular/common';
import { AttendanceWithLatePerformerResponseDto, AttendanceWithTopPerformerResponseDto } from 'src/app/models/Attendance.model';
import { HelperService } from 'src/app/services/helper.service';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private dataService : DataService, private router : Router, private datePipe : DatePipe, private helperService : HelperService) { }


  itemPerPage : number = 5;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;
  searchText : string = '';


  currentDayEmployeesData : any = [];
  // selected: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};
  attendanceArrayDate: any = [];
  project : boolean = false;

  loginDetails = this.helperService.getDecodedValueFromToken();
   role:string = this.loginDetails.role;
   userUuid: string = this.loginDetails.uuid;
   orgRefId:string = this.loginDetails.orgRefId;

  startDateStr: string = '';
  endDateStr: string = '';
  month: string = '';

  ngOnInit(): void {
    // this.checkAccessToken();
   
    // const today = dayjs();
    // const firstDayOfMonth = today.startOf('month');
    // const lastDayOfMonth = today.endOf('month');

    // this.selected = {
    //   startDate: firstDayOfMonth,
    //   endDate: lastDayOfMonth
    // };
    const currentDate = moment();
    this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD');
    this.endDateStr = currentDate.endOf('month').format('YYYY-MM-DD');

    // Set the default selected month
    this.month = currentDate.format('MMMM');
    
    this.getCurrentDayEmployeesData();
    this.getAttendanceTopPerformerDetails();
    this.getAttendanceLatePerformerDetails();
    this.getDataFromDate();
    this.getTodaysLiveLeaveCount();
  }

  selectMonth(selectedMonth: string): void {
    this.month = selectedMonth;
    const selectedDate = moment().month(selectedMonth).startOf('month');
    this.startDateStr = selectedDate.format('YYYY-MM-DD');
    this.endDateStr = selectedDate.endOf('month').format('YYYY-MM-DD');
    
    // Fetch data using the selected start and end dates
    this.getAttendanceTopPerformerDetails();
    // this.getAttendanceLatePerformerDetails();
    this.getDataFromDate();
  }
  

  // checkAccessToken(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if (!loginDetails) {
  //     this.router.navigate(['/dynamic/login']);
  //   }
  // }


  getCurrentDayEmployeesData(){
    this.dataService.getTodayEmployeesData().subscribe((data) => {
      this.currentDayEmployeesData=data;
      debugger
      console.log(this.currentDayEmployeesData);
    }, (error) => {
      console.log(error);
    })
  }

  leaveCount!: number;

  getTodaysLiveLeaveCount(){
  this.dataService.getTodaysLeaveCount().subscribe((data) => {
    this.leaveCount=data;
    console.log(this.leaveCount);
  }, (error) => {
    console.log(error);
  })
}

isAttendanceShimer: boolean=false;
errorToggleMain: boolean=false;

  getDataFromDate(): void {
    this.isAttendanceShimer=true;
      // const startDateStr: string = this.selected.startDate.startOf('day').format('YYYY-MM-DD');
      // const endDateStr: string = this.selected.endDate.endOf('day').format('YYYY-MM-DD');
      
      
      this.dataService.getAttendanceDetailsByDateDuration(this.startDateStr, this.endDateStr).subscribe(
        
        (response: any) => {
          
          debugger
          this.myAttendanceData = response;

          debugger
          console.log(this.myAttendanceData);
          this.isAttendanceShimer=false;
          if (this.myAttendanceData) {
            
            for (const key in this.myAttendanceData) {
              
              if (this.myAttendanceData.hasOwnProperty(key)) {
                const attendanceArray = this.myAttendanceData[key];

                this.attendanceArrayDate=attendanceArray;
                
                // for (const element of attendanceArray) {
                //   if (element.checkInTime !== null) {
                    
                //     this.totalll += 1;
                //   }
                // }

                
              }
            }
          }
          
        },
        (error: any) => {
          this.isAttendanceShimer=false;
          this.errorToggleMain=true;
          console.error('Error fetching data:', error);
        }
      );
    
  }


  extractFirstNameFromEmail(email: string): string {
    const pattern = /^(.+)@.+/;
    const matches = email.match(pattern);

    if (matches) {
        const namePart = matches[1];
        const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        return firstName;
    } 

    return email;
}
  dateInMonthList(attendances: AttendenceDto[]): string[] {
    const uniqueDays = Array.from(new Set(attendances.map(a => a.createdDay)));
    return uniqueDays;
  }
  
  getDayFromDate(inputDate : string){
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    return day;
  }

  getDayNameFromDate(dateString: string): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'EEEE');
  }

  attendanceString:string='';
  today:Date=new Date();
  convertStringToDate(attendance: AttendenceDto){
    if(attendance.converterDate==undefined){
      attendance.converterDate = new Date(attendance.createdDay)
    }
    return attendance.converterDate;
  }
  

  getFirstName(fullName: string): string {
    const names = fullName.split(' ');
    return names.length > 0 ? names[0] : '';
  }

  // getLoginDetailsRole(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if(loginDetails!==null){
  //     const loginData = JSON.parse(loginDetails);
  //     if(this.checkingUserRoleMethod() === true){
  //       return 'MANAGER';
  //     }
      
  //     return loginData.role;
  //   }
  // }

  // getLoginDetailsId(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if(loginDetails!==null){
  //     const loginData = JSON.parse(loginDetails);
  //     return loginData.id;
  //   }
  // }

  flag !: boolean;

  checkingUserRoleMethod(): boolean{ 
    this.dataService.checkingUserRole().subscribe((data) => {
      this.flag = data;
      console.log(data);
    }, (error) => {
      console.log(error);
    })
    console.log(this.flag);
    
    return this.flag;
  }


  calculateTotalDuration(attendances: AttendenceDto[]): number {
    return attendances.reduce((totalDuration, attendance) => {
      if (attendance.duration) {
        const durationParts = attendance.duration
          .split(" ")
          .filter((part) => !isNaN(Number(part)));
        const durationInSeconds = durationParts.reduce(
          (acc, part) => acc + Number(part),
          0
        );
        return totalDuration + durationInSeconds;
      }
      return totalDuration;
    }, 0);
  }

  responseDto: AttendanceWithTopPerformerResponseDto = {
    attendanceTopPerformers: [],
    // attendanceLatePerformers: []
  };

  responseData: AttendanceWithLatePerformerResponseDto = {
    // attendanceTopPerformers: [],
    attendanceLatePerformers: []
  };
  
  // responseDto!: AttendanceWithTopPerformerResponseDto;

  isShimer: boolean=false;
  isLateShimmer: boolean=false;
  errorToggleTop:boolean=false;
  errorToggleLate:boolean=false;
  getAttendanceTopPerformerDetails(){
    this.isShimer=true;
    // this.isLateShimmer=true;
    debugger
    this.dataService.getAttendanceTopPerformers(this.startDateStr, this.endDateStr).subscribe(
      (data) => {
        // console.log(data);
        this.responseDto = data;

        if(data.attendanceTopPerformers){
        this.isShimer=false;
        }
        // if(data.attendanceLatePerformers){
        //   this.isLateShimmer=false;
        // }
        console.log(this.responseDto); 
      },
      (error) => {
        // console.error(error);
        this.isShimer=false;
        this.errorToggleTop = true;
      }
    );
  }


  getAttendanceLatePerformerDetails(){
    this.isLateShimmer=true;
    debugger
    this.dataService.getAttendanceLatePerformers('2023-12-04', '2023-12-04').subscribe(
      (data) => {
        console.log(data);
        this.responseData = data;

        if(data.attendanceLatePerformers){
        this.isLateShimmer=false;
        }
        console.log(this.responseDto);
      },
      (error) => {
        this.isLateShimmer = false;
        this.errorToggleLate = true;
        console.error(error);
      }
    );
  }


   // ##### Pagination ############
   changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getDataFromDate();
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.total / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.itemPerPage);
  }
  getStartIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }
  getEndIndex(): number {
    const endIndex = this.pageNumber * this.itemPerPage;
    return endIndex > this.total ? this.total : endIndex;
  }

 
  
}