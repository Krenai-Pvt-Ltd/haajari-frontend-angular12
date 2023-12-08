import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import * as dayjs from 'dayjs';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { HelperService } from 'src/app/services/helper.service';
// import { ChosenDate, TimePeriod } from 'ngx-daterangepicker-material/daterangepicker.component';


@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent implements OnInit {

  alwaysShowCalendars: boolean | undefined;
  model: any;
  constructor(private dataService: DataService, private helperService: HelperService) { 

  }

   loginDetails = this.helperService.getDecodedValueFromToken();
   role:string = this.loginDetails.role;
   userUuid: string = this.loginDetails.uuid;
   orgRefId:string = this.loginDetails.orgRefId;


  selected: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};

  ngOnInit(): void {
  
    this.inputDate = this.getCurrentDate();


    const today = dayjs();
    const oneWeekAgo = today.subtract(1, 'week');
    this.selected = {
      startDate: oneWeekAgo,
      endDate: today
    };


    this.updateDateRangeInputValue();
    this.getDataFromDate();
    this.getAttendanceDetailsByDateMethodCall();
    this.getActiveUsersCountMethodCall();
  }


  dateRangeInputValue: string = '';

  totalAttendance: number = 0;
  attendanceArrayDate: any = [];


  dateRangeFilter(event: any): void {
    if (event.startDate && event.endDate) {
      this.selected = {
        startDate: dayjs(event.startDate),
        endDate: dayjs(event.endDate)
      };
      this.getDataFromDate();
    } else {
      this.selected = null;
    }

    this.updateDateRangeInputValue();

    const res3 = document.getElementById("date-picker-wrapper") as HTMLElement | null;
    if(res3){
      res3.style.display="none";
    }

  }

  
  getDataFromDate(): void {
    if (this.selected) {
      const startDateStr: string = this.selected.startDate.startOf('day').format('YYYY-MM-DD');
      const endDateStr: string = this.selected.endDate.endOf('day').format('YYYY-MM-DD');
      debugger
      
      this.dataService.getAttendanceDetailsByDateDuration(startDateStr, endDateStr).subscribe(
        
        (response: any) => {
          
          this.myAttendanceData = response;
          console.log(this.myAttendanceData);
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
  }
  
  getCurrentDate(){
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = (todayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = todayDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  dateRangeButton(){
    const res = document.getElementById("date-picker-wrapper") as HTMLElement | null;
    if(res){
      res.style.display="block";
    }

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
  
  updateDateRangeInputValue(): void {
    if (this.selected) {
      this.dateRangeInputValue = `${this.selected.startDate.format('DD-MM-YYYY')} - ${this.selected.endDate.format('DD-MM-YYYY')}`;
    } else {
      this.dateRangeInputValue = '';
    }
  }



  // ###############################################################################

  selectPreviousDay() {
    debugger
    const currentDateObject = new Date(this.inputDate);
    currentDateObject.setDate(currentDateObject.getDate() - 1);
    this.inputDate = this.formatDate(currentDateObject);
    this.getAttendanceDetailsByDateMethodCall();
  }
  
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectNextDay() {
    const currentDateObject = new Date(this.inputDate);
    const tomorrow = new Date(currentDateObject);
    tomorrow.setDate(currentDateObject.getDate() + 1);

    if (tomorrow >= new Date()) {
      debugger
      return;
    }

    this.inputDate = this.formatDate(tomorrow);
    this.getAttendanceDetailsByDateMethodCall();
  }

  // formatDate(date: Date): string {
  //   const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  //   return date.toLocaleDateString('en-US', options);
  // }




  attendanceDataByDate: Record<string, AttendenceDto> = {};
  attendanceDataByDateKey : any = [];
  attendanceDataByDateValue : any = [];
  inputDate = '';
  halfDayUsers : number = 0;

  isShimer:boolean=false;
  errorToggleTimetable:boolean=false;
  placeholder:boolean=false;

  getAttendanceDetailsByDateMethodCall(){
      this.isShimer=true;
      this.dataService.getAttendanceDetailsByDate(this.inputDate).subscribe((data) => {
        this.attendanceDataByDateKey = Object.keys(data);
        this.attendanceDataByDateValue = Object.values(data);

        if(this.attendanceDataByDateKey!=null){
          this.placeholder=true;
        }else{
          this.placeholder=false;
        }

        this.attendanceDataByDate = data;
        this.isShimer=false;
        console.log(this.attendanceDataByDateKey);
        console.log(this.attendanceDataByDate);

        for(let i=0; i<this.attendanceDataByDateValue.length; i++){
          if(+(this.attendanceDataByDateValue[i].duration[0]) < 7){
            this.halfDayUsers++;
          }
        }

    }, (error) => {
      this.isShimer=false;
      this.placeholder=false;
      this.errorToggleTimetable=true;
      debugger
      console.log(error);
    })

  }


  activeUsersCount : number = 0;

  getActiveUsersCountMethodCall(){

    this.dataService.getActiveUsersCount().subscribe((data) => {
      console.log(data);
      this.activeUsersCount = data;
    }, (error) => {
      console.log(error);
    })
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


  // optionsDatePicker: any = {
  //   autoApply: true,
  //   alwaysShowCalendars: false,
  //   showCancel: false,
  //   showClearButton: false,
  //   linkedCalendars: false,
  //   singleDatePicker: false,
  //   showWeekNumbers: false,
  //   showISOWeekNumbers: false,
  //   customRangeDirection: false,
  //   lockStartDate: false,
  //   closeOnAutoApply: true
  // };

}

