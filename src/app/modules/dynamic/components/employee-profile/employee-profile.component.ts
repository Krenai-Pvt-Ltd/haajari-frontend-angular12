import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DataService } from 'src/app/services/data.service';
import { Subject } from 'rxjs';
import { UserLeaveRequest } from 'src/app/models/user-leave-request';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css'],
})
export class EmployeeProfileComponent implements OnInit {
  userLeaveForm!: FormGroup;
  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,

  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }

    {
      this.userLeaveForm = this.fb.group({
        startDate: ["", Validators.required],
        endDate: [""],
        leaveType: ["", Validators.required],
        managerId: ["", Validators.required],
        optNotes: [""],
      }); }

  }

  get StartDate() {
    return this.userLeaveForm.get("startDate")
  }
  get EndDate() {
    return this.userLeaveForm.get("endDate")
  }
  get LeaveType() {
    return this.userLeaveForm.get("leaveType")
  }
  get ManagerId() {
    return this.userLeaveForm.get("managerId")
  }
  get OptNotes() {
    return this.userLeaveForm.get("optNotes")
  }

  events: any[] = [];

  viewDate: Date = new Date();
  selected: { startDate: moment.Moment; endDate: moment.Moment } = {
    startDate: moment(this.viewDate).startOf('month'),
    endDate: moment(this.viewDate).endOf('month'),
  };

  userId: any;
   newDate:string=''
  ngOnInit(): void {
    this.getOrganizationOnboardingDateByUuid();
    // const currentDate = moment();
    // this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD');
    // this.endDateStr = currentDate.endOf('month').format('YYYY-MM-DD');
    // this.startDateStr = this.newDate;
    this.endDateStr = moment(new Date()).format('YYYY-MM-DD')
    // this.month = currentDate.format('MMMM');
    // this.getUserAttendanceDataFromDate();
    this.getUserByUuid();
    this.getEmployeeAdressDetailsByUuid();
    this. getEmployeeExperiencesDetailsByUuid();
    this. getEmployeeAcademicDetailsByUuid();
    this.getEmployeeContactsDetailsByUuid();
    this.getEmployeeBankDetailsByUuid();
    this. getUserLeaveReq();
    this. getUserLeaveLogByUuid();
  }

  prevDate!:Date;

  getOrganizationOnboardingDateByUuid() {
    debugger
    this.dataService.getOrganizationOnboardingDate(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.prevDate=data;
        this.newDate = moment(data).format('YYYY-MM-DD');
        this.getUserAttendanceDataFromDate();
        this.goBackward();
      },
      (error) => {
        console.log(error);
      }
    );
  }


  user: any = {};

  getUserByUuid() {
    this.dataService.getUserByUuid(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.user = data;
        console.log(this.user.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  updateStatusUserByUuid(type: string) {
    
    this.dataService.updateStatusUser(this.userId, type).subscribe(
      (data) => {
        console.log('status updated:' + type);
        location.reload();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  myAttendanceData: Record<string, AttendenceDto[]> = {};
  attendanceArrayDate: any = [];

  startDateStr: string = '';
  endDateStr: string = '';

  titleString: string = '';
  attendanceDetails: any;
  attendances: any = [];
  eventsFlag:boolean=false;
 
  getUserAttendanceDataFromDate(): void {
    debugger;
    this.dataService
      .getUserAttendanceDetailsByDateDuration(
        this.userId,
        'USER',
        this.newDate,
        this.endDateStr
      )
      .subscribe(
        (response) => {
          this.events = [];

          this.attendanceDetails = Object.values(response);
          this.attendances = this.attendanceDetails[0];
          console.log('Attendance Details:', this.attendances);
          console.log(
            'Attendance Details length:',
            this.attendanceDetails[0].length
          );

          for (let i = 0; i < this.attendances.length; i++) {
            const title = this.attendances[i].checkInTime != null ? 'Present' : 'Absent';
            const date = moment(this.attendances[i].createdDate).format('YYYY-MM-DD');
            var color = title=='Present'?'#e0ffe0':title=='Absent'?'#f8d7d7':'';
            var tempEvent:{title:string,date:string,color:string}={title:title,date:date,color:color};
            this.events.push(tempEvent);
            if(i==this.attendances.length-1){
              // this.eventsFlag=true;
              this.calendarOptions = {
                plugins: [dayGridPlugin],
                initialView: 'dayGridMonth',
                weekends: true,
                events: this.events,  
              };
            }
          }

          console.log(this.events);
        
        },
        (error: any) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: [this.events],
    
  };

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  goforward() {
    const calendarApi = this.calendarComponent.getApi();
    if(calendarApi.getDate().getMonth()<new Date().getMonth())
    calendarApi.next();
  }

  goBackward(){
    const calendarApi = this.calendarComponent.getApi();
    var date = new Date(this.prevDate);
    var month = date.getMonth();
    if (
      calendarApi.getDate().getMonth() > month
    )   
     calendarApi.prev();
  }
  
//   calendarOptions: CalendarOptions = {
//     plugins: [dayGridPlugin],calendarOptions
//     initialView: 'dayGridMonth',
//     weekends: false,
//     events: [
//       // { title: 'Present', date: '2023-12-01' },
//       // { title: 'Absent', date: '2023-12-05' },
//       // { title: 'Present', date: '2023-12-15' }, 
//     ]
//   };
  
// ############################################################################333333


  today: Date = new Date();
  convertStringToDate(attendance: AttendenceDto) {
    if (attendance.converterDate == undefined) {
      attendance.converterDate = new Date(attendance.createdDay);
    }
    return attendance.converterDate;
  }

  dateInMonthList(attendances: AttendenceDto[]): string[] {
    const uniqueDays = Array.from(
      new Set(attendances.map((a) => a.createdDay))
    );
    return uniqueDays;
  }

  getDayFromDate(inputDate: string) {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    return day;
  }

  getDayNameFromDate(dateString: string): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'EEEE');
  }

  // dayClicked(day: CalendarMonthViewDay): void {
  //   console.log('Day clicked', day);
  // }



  // ******************************************************************
  userLeaveRequest: UserLeaveRequest = new UserLeaveRequest();

  
  @ViewChild("requestLeaveCloseModel")
  requestLeaveCloseModel!: ElementRef;

  
  resetUserLeave(){
    this.userLeaveRequest.startDate=new Date();
    this.userLeaveRequest.endDate=new Date();
    this.userLeaveRequest.leaveType="";
    this.userLeaveRequest.managerId=0;
    this.userLeaveRequest.optNotes="";
    
  }

  saveLeaveRequestUser(){
    this.dataService.saveLeaveRequest(this.userId, this.userLeaveRequest)
    .subscribe(data => {
     
      console.log(data);
      console.log(data.body);
      this. getUserLeaveLogByUuid() ;
      this. getUserLeaveReq();
      this.resetUserLeave();
      this.requestLeaveCloseModel.nativeElement.click();
    }, (error)=>{
      console.log(error.body);
    })
  }

  
  userLeave:any=[];

  getUserLeaveReq() {
    this.dataService.getUserLeaveRequests(this.userId).subscribe(
      (data) => {
       this.userLeave=data.body;
       console.log(this.userLeave);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  
  userLeaveLog: any;


  getUserLeaveLogByUuid() {
    this.dataService.getUserLeaveLog(this.userId).subscribe(
      (data) => {
       this.userLeaveLog=data;
       console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
  }


  calculateDateDifference(endDate: string, startDate: string): number {
    const end = new Date(endDate);
    const start = new Date(startDate);
    const timeDifference = end.getTime() - start.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return daysDifference;
  }
  

  // #################################################################33


  addressEmployee:any;
  getEmployeeAdressDetailsByUuid() {
    this.dataService.getEmployeeAdressDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.addressEmployee = data;
        console.log(this.addressEmployee.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  

  experienceEmployee:any;
  getEmployeeExperiencesDetailsByUuid() {
    this.dataService.getEmployeeExperiencesDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.experienceEmployee = data;
        console.log(this.experienceEmployee.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }


  academicEmployee:any;
  getEmployeeAcademicDetailsByUuid() {
    this.dataService.getEmployeeAcademicDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.academicEmployee = data;
        console.log(this.academicEmployee.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  

  contactsEmployee:any;
  getEmployeeContactsDetailsByUuid() {
    this.dataService.getEmployeeContactsDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.contactsEmployee = data;
        console.log(this.contactsEmployee.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  


  bankDetailsEmployee:any;
  getEmployeeBankDetailsByUuid() {
    this.dataService.getEmployeeBankDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.bankDetailsEmployee = data;
        console.log(this.bankDetailsEmployee.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // #################################################################333333
  capitalizeFirstLetter(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return name; 
  }

}
