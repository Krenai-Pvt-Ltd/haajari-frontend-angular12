import { Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import * as dayjs from 'dayjs';
import { AttendenceDto } from 'src/app/models/attendence-dto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private dataService : DataService, private router : Router) { }

  currentDayEmployeesData : any = [];
  selected: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};
  attendanceArrayDate: any = [];


  ngOnInit(): void {
    // this.checkAccessToken();
    const today = dayjs();
    const firstDayOfMonth = today.startOf('month');
    const lastDayOfMonth = today.endOf('month');

    this.selected = {
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth
    };
    
    this.getCurrentDayEmployeesData();
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
      console.log(this.currentDayEmployeesData);
    }, (error) => {
      console.log(error);
    })
  }


  getDataFromDate(): void {
    if (this.selected) {
      const startDateStr: string = this.selected.startDate.startOf('day').format('YYYY-MM-DD');
      const endDateStr: string = this.selected.endDate.endOf('day').format('YYYY-MM-DD');
      
      
      this.dataService.getDurationDetails(this.getLoginDetailsId(), this.getLoginDetailsRole(), startDateStr, endDateStr).subscribe(
        
        (response: any) => {
          
          this.myAttendanceData = response;
          console.log(this.myAttendanceData);
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
          console.error('Error fetching data:', error);
        }
      );
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
      console.log(data);
    }, (error) => {
      console.log(error);
    })
    console.log(this.flag);
    
    return this.flag;
  }
}