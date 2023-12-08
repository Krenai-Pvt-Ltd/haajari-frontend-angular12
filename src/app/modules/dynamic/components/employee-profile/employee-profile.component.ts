import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { User } from 'src/app/models/user';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {

  constructor(private dataService: DataService, private datePipe : DatePipe, private activateRoute : ActivatedRoute) {  if(this.activateRoute.snapshot.queryParamMap.has('userId')){
    this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
  };
}

userId: any;
  ngOnInit(): void {
    const currentDate = moment();
    this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD');
    this.endDateStr = currentDate.endOf('month').format('YYYY-MM-DD');
    this.month = currentDate.format('MMMM');
    this.getUserAttendanceDataFromDate()
    this.getUserByUuid();
  }


  
user:any={};

getUserByUuid(){
  debugger
  this.dataService.getUserByUuid(this.userId).subscribe(data =>{
    console.log(data);
    this.user = data;
    console.log(this.user);

  }, (error) => {
    console.log(error);
  })
}




updateStatusUserByUuid(userUuid:string, type:string){
  debugger
  this.dataService.updateStatusUser(userUuid, type).subscribe(data =>{
   console.log("status updated:" + type);

  }, (error) => {
    console.log(error);
  })
}

myAttendanceData: Record<string, AttendenceDto[]> = {};
attendanceArrayDate: any = [];


startDateStr: string = '';
endDateStr: string = '';
month: string = '';


selectMonth(selectedMonth: string): void {
  this.month = selectedMonth;
  const selectedDate = moment().month(selectedMonth).startOf('month');
  this.startDateStr = selectedDate.format('YYYY-MM-DD');
  this.endDateStr = selectedDate.endOf('month').format('YYYY-MM-DD');
  this.getUserAttendanceDataFromDate()
}


getUserAttendanceDataFromDate(): void {
    
    this.dataService.getUserAttendanceDetailsByDateDuration(this.userId, 'USER', this.startDateStr, this.endDateStr).subscribe(
      
      (response: any) => {
        
        debugger
        this.myAttendanceData = response;

        console.log("Attendance Data" + this.myAttendanceData);

        if (this.myAttendanceData) {
          
          for (const key in this.myAttendanceData) {
            
            if (this.myAttendanceData.hasOwnProperty(key)) {
              const attendanceArray = this.myAttendanceData[key];

              this.attendanceArrayDate=attendanceArray;
              
            }
          }
        }
        
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  
}

today:Date=new Date();
convertStringToDate(attendance: AttendenceDto){
  if(attendance.converterDate==undefined){
    attendance.converterDate = new Date(attendance.createdDay)
  }
  return attendance.converterDate;
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



}
