import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import * as dayjs from 'dayjs';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { ChosenDate, TimePeriod } from 'ngx-daterangepicker-material/daterangepicker.component';
import jwt_decode from "jwt-decode";


@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent implements OnInit {
datesUpdated($event: TimePeriod) {
throw new Error('Method not implemented.');
}
openDatepicker() {
throw new Error('Method not implemented.');
}
alwaysShowCalendars: boolean | undefined;
model: any;
  constructor(private dataService: DataService) { }

  selected: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};

  ngOnInit(): void {
    this.getDataFromDate();
    this.checkingUserRoleMethod();
  }


  totalAttendance: number = 0;
  attendanceArrayDate: any = [];


  dateRangeFilter(event: ChosenDate): void {
    if (event.startDate && event.endDate) {
      // Use dayjs for date conversion
      this.selected = {
        startDate: dayjs(event.startDate),
        endDate: dayjs(event.endDate)
      };
      this.getDataFromDate();
    } else {
      this.selected = null;
    }

    const res3 = document.getElementById("date-picker-wrapper") as HTMLElement | null;
    if(res3){
      res3.style.display="none";
    }

    const res2 = document.getElementById("date-picker-button") as HTMLElement | null;
    if(res2){
      res2.style.display="block";
    }

  }

  
  getDataFromDate(): void {
    if (this.selected) {
      const startDateStr: string = this.selected.startDate.startOf('day').format('YYYY-MM-DD');
      const endDateStr: string = this.selected.endDate.endOf('day').format('YYYY-MM-DD');
      
      
      this.dataService.getDurationDetails(this.getLoginDetailsId(), this.getLoginDetailsRole(), startDateStr, endDateStr).subscribe(
        
        (response: any) => {
          
          debugger
          this.myAttendanceData = response;
          console.log(this.myAttendanceData);
          if (this.myAttendanceData) {
            debugger
            for (const key in this.myAttendanceData) {
      
              debugger
              if (this.myAttendanceData.hasOwnProperty(key)) {
                const attendanceArray = this.myAttendanceData[key];

                debugger
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
          console.error('Error fetching data:', error);
        }
      );
    }
  }
  

  dateRangeButton(){
    const res = document.getElementById("date-picker-wrapper") as HTMLElement | null;
    if(res){
      res.style.display="block";
    }

    const res2 = document.getElementById("date-picker-button") as HTMLElement | null;
    if(res2){
      res2.style.display="none";
    }

  }



  getLoginDetailsRole(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      if(this.checkingUserRoleMethod() === true){
        return 'MANAGER';
      }
      return loginData.role;
    }
  }

  getLoginDetailsId(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      return loginData.id;
    }
  }


  flag !: boolean;

  checkingUserRoleMethod(): boolean{ 
    this.dataService.checkingUserRole(this.getLoginDetailsId()).subscribe((data) => {
      this.flag = data;
    })
    return this.flag;
  }
  
}

