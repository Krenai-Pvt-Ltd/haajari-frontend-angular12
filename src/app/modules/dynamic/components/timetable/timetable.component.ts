import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import * as dayjs from 'dayjs';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { ChosenDate, TimePeriod } from 'ngx-daterangepicker-material/daterangepicker.component';


@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent implements OnInit {
isNextDayDisabled() {
throw new Error('Method not implemented.');
}
openCalendar() {
throw new Error('Method not implemented.');
}
datesUpdated($event: TimePeriod) {
throw new Error('Method not implemented.');
}
openDatepicker() {
throw new Error('Method not implemented.');
}
alwaysShowCalendars: boolean | undefined;
model: any;
  constructor(private dataService: DataService) { 
    this.setCurrentDate();
  }

  selected: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};

  ngOnInit(): void {
    const today = dayjs();
    const oneWeekAgo = today.subtract(1, 'week');

    this.selected = {
      startDate: oneWeekAgo,
      endDate: today
    };
    this.updateDateRangeInputValue();
    this.getDataFromDate();
    //this.checkingUserRoleMethod();
  }


  dateRangeInputValue: string = '';

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

    this.updateDateRangeInputValue();

    const res3 = document.getElementById("date-picker-wrapper") as HTMLElement | null;
    if(res3){
      res3.style.display="none";
    }

    // const res2 = document.getElementById("date-picker-button") as HTMLElement | null;
    // if(res2){
    //   res2.style.display="block";
    // }

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

    // const res2 = document.getElementById("date-picker-button") as HTMLElement | null;
    // if(res2){
    //   res2.style.display="none";
    // }

  }



  getLoginDetailsRole(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      if(this.checkingUserRoleMethod() === true){
        debugger
        return 'MANAGER';
      }
      debugger
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
    debugger
    this.dataService.checkingUserRole(this.getLoginDetailsId()).subscribe((data) => {
      this.flag = data;
      debugger
      console.log(data);
    }, (error) => {
      debugger
      console.log(error);
    })

    debugger
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





  // ##########################################################################

  selectedDate: string = ''; // To store the selected date
  currentDate: string = ''; // To store the current date in the format 'DD MMM YYYY'

  setCurrentDate() {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    this.currentDate = today.toLocaleDateString('en-US', options);
    this.selectedDate = this.currentDate; // Set the selected date initially to today
  }

  onDateChange() {
    // Handle the date change logic here
    console.log('Selected date:', this.selectedDate);
  }

  selectPreviousDay() {
    const currentDateObject = new Date(this.selectedDate);
    currentDateObject.setDate(currentDateObject.getDate() - 1);
    this.selectedDate = this.formatDate(currentDateObject);
  }

  selectNextDay() {
    const currentDateObject = new Date(this.selectedDate);
    const tomorrow = new Date(currentDateObject);
    tomorrow.setDate(currentDateObject.getDate() + 1);

    // Disable the right arrow if the next day is equal to or greater than today
    if (tomorrow.toDateString() === new Date().toDateString()) {
      return;
    }

    this.selectedDate = this.formatDate(tomorrow);
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }


}

