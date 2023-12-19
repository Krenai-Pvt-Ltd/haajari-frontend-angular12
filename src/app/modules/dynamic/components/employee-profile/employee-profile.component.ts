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
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { UserDto } from 'src/app/models/user-dto.model';

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
    this.fetchManagerNames();
    this.getUserByUuid();
    this.getEmployeeAdressDetailsByUuid();
    this. getEmployeeExperiencesDetailsByUuid();
    this. getEmployeeAcademicDetailsByUuid();
    this.getEmployeeContactsDetailsByUuid();
    this.getEmployeeBankDetailsByUuid();
    this.getEmployeeDocumentsDetailsByUuid();
    this. getUserLeaveReq();
    this. getUserLeaveLogByUuid();
    // this.goforward();
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
        // this.goBackward();
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
  // isCalendarFlag:boolean=false;
 
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

          // if(response==null){
          //   this.isCalendarErrorFlag=true;
          // }

          this.attendanceDetails = Object.values(response);
          this.attendances = this.attendanceDetails[0];
          console.log('Attendance Details:', this.attendances);
          console.log(
            'Attendance Details length:',
            this.attendanceDetails[0].length
          );

          for (let i = 0; i < this.attendances.length; i++) {
            const title = this.attendances[i].checkInTime != null ? 'P' : 'A';
            const date = moment(this.attendances[i].createdDate).format('YYYY-MM-DD');
            var color = title=='P'?'#e0ffe0':title=='A'?'#f8d7d7':'';
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
          // var date = new Date(this.endDateStr);
          // var month = date.getMonth();
          // if(new)

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

  forwordFlag:boolean=false;

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  goforward() {
    debugger
    const calendarApi = this.calendarComponent.getApi();
    if(calendarApi.getDate().getMonth()<new Date().getMonth()-1){
    calendarApi.next();
    this.forwordFlag=true;
    this.backwardFlag=true;
 
    }else{
      calendarApi.next();
      this.forwordFlag=false;
    }

    // if(calendarApi.getDate().getMonth()==new Date().getMonth()){
    //  this.forwordFlag=false;
    //  this.backwardFlag=true;
    // 
  }
  backwardFlag:boolean=true;
  goBackward(){
    debugger
    const calendarApi = this.calendarComponent.getApi();
    var date = new Date(this.prevDate);
    var month = date.getMonth();
    if (calendarApi.getDate().getMonth() > month+1)   {
     calendarApi.prev();
     this.backwardFlag=true;
     this.forwordFlag=true;
    }else{
      calendarApi.prev();
      this.backwardFlag=false;
    }
    

    //  if(calendarApi.getDate().getMonth() == month){
    //   this.backwardFlag=false;
    //   this.forwordFlag=true;
    //  }else{
    //   this.backwardFlag=true;
    //   this.forwordFlag=false;
    //  }
  }

  goToday() {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.today();
    // If the current month is the same as today's month, disable the forward button
    this.forwordFlag = calendarApi.getDate().getMonth() < new Date().getMonth();
    // The backward button is always enabled when we go to today
    this.backwardFlag = true;
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

  // @ViewChild('userLeaveForm') userLeaveForm: NgForm;

  
  resetUserLeave(){
    this.userLeaveRequest.startDate=new Date();
    this.userLeaveRequest.endDate=new Date();
    this.userLeaveRequest.leaveType="";
    this.userLeaveRequest.managerId=0;
    this.userLeaveRequest.optNotes="";
    this.selectedManagerId = 0;
    
  }

  saveLeaveRequestUser(){
    this.userLeaveRequest.managerId = this.selectedManagerId;
    this.dataService.saveLeaveRequest(this.userId, this.userLeaveRequest)
    .subscribe(data => {
     
      console.log(data);
      console.log(data.body);
      this.getUserLeaveLogByUuid() ;
      this.getUserLeaveReq();
      this.resetUserLeave();
      this.requestLeaveCloseModel.nativeElement.click();
      location.reload();
    }, (error)=>{
      console.log(error.body);
    })
  }

  pendingFlag:boolean=true;

  getIsPendingLeave(leaveType:string){
    debugger
    this.userLeaveRequest.uuid = this.userId;
    this.userLeaveRequest.leaveType= leaveType;
    this.dataService.getPendingLeaveFlag(this.userLeaveRequest).subscribe(data =>{
       this.pendingFlag=data;
    },(error)=>{
      console.log(error);
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

  

selectedStatus!: string;
selectStatusFlag:boolean=false;
isLeaveErrorPlaceholder:boolean=false;
getUserLeaveLogByUuid() {
  this.isLeaveShimmer = true;
  // this.selectStatusFlag=true;
   
  if (this.selectedStatus) {
    this.dataService.getUserLeaveLogByStatus(this.userId, this.selectedStatus).subscribe(
      (data) => {
        this.userLeaveLog = data;
        this.isLeaveShimmer = false;
        this.isLeavePlaceholder = !data || data.length === 0;
        console.log(data);
      },
      (error) => {
        this.isLeaveShimmer = false;
        console.log(error);
      }
    );
  } else {

    this.dataService.getUserLeaveLog(this.userId).subscribe(
      (data) => {
        this.userLeaveLog = data;
        this.isLeaveShimmer = false;
        if(data==null || data.length==0){
          this.isLeavePlaceholder=true;
          this.selectStatusFlag=false;
        }else{
          this.selectStatusFlag=true;
        }
        // this.isLeavePlaceholder = !data || data.length === 0;
        console.log(data);
      },
      (error) => {
        this.isLeaveErrorPlaceholder=true;
        this.isLeaveShimmer = false;
        console.log(error);
      }
    );
  }
}

  
  userLeaveLog: any;

  isLeaveShimmer:boolean=false;
  isLeavePlaceholder:boolean=false;

  // getUserLeaveLogByUuid() {
  //   this.isLeaveShimmer=true;
  //   this.dataService.getUserLeaveLog(this.userId).subscribe(
  //     (data) => {
  //      this.userLeaveLog=data;
  //      this.isLeaveShimmer=false;
  //      if(data==null || data.length==0){
  //       this.isLeavePlaceholder=true;
  //      }
  //      console.log(data);
  //     },
  //     (error) => {
  //       this.isLeaveShimmer=false;
  //       // this.isLeavePlaceholder=true;
  //       console.log(error);
  //     }
  //   );
  // }

  // managerNames: string[] = [];
  managers: UserDto[] = [];
  selectedManagerId!: number;

  fetchManagerNames() {
    debugger
    this.dataService.getEmployeeManagerDetails(this.userId).subscribe(
      (data: UserDto[]) => {
        this.managers = data;
        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

   formatDate(date:Date) {
    const dateObject = new Date(date);
    const formattedDate = this.datePipe.transform(dateObject, 'yyyy-MM-dd');
    return formattedDate;
  }

 formatTime(date:Date) {
    const dateObject = new Date(date);
    const formattedTime = this.datePipe.transform(dateObject, 'hh:mm a');
    return formattedTime;
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
  // isAddressShimmer:boolean=false;
  isAddressPlaceholder:boolean=false;
  getEmployeeAdressDetailsByUuid() {
    // this.isAddressShimmer=true;
    debugger
    this.dataService.getEmployeeAdressDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.addressEmployee = data;
        // this.isAddressShimmer=false;
        if(data==null || data.length==0){
          this.isAddressPlaceholder=true;
        }
        console.log(this.addressEmployee.data);
      },
      (error) => {
        this.isAddressPlaceholder=true;
        // this.isAddressShimmer=false;
        console.log(error);
      }
    );
  }

  

  experienceEmployee:any;
  isCompanyPlaceholder:boolean=false;
  getEmployeeExperiencesDetailsByUuid() {
    this.dataService.getEmployeeExperiencesDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.experienceEmployee = data;
        if(data==null || data.length==0){
          this.isCompanyPlaceholder=true;
        }
        console.log(this.experienceEmployee.data);
      },
      (error) => {
        this.isCompanyPlaceholder=true;
        console.log(error);
      }
    );
  }


  academicEmployee:any;
  isAcademicPlaceholder:boolean=false;

  getEmployeeAcademicDetailsByUuid() {
    this.dataService.getEmployeeAcademicDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.academicEmployee = data;
        if(data==null || data.length==0){
          this.isAcademicPlaceholder=true;
        }
        console.log(this.academicEmployee.data);
      },
      (error) => {
        this.isAcademicPlaceholder=true;
        console.log(error);
      }
    );
  }

  

  contactsEmployee:any;
  isContactPlaceholder:boolean=false;
  getEmployeeContactsDetailsByUuid() {
    this.dataService.getEmployeeContactsDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.contactsEmployee = data;
        if(data==null || data.length==0){
          this.isContactPlaceholder=true;
        }
        console.log(this.contactsEmployee.data);
      },
      (error) => {
        this.isContactPlaceholder=true;
        console.log(error);
      }
    );
  }

  


  bankDetailsEmployee:any;
  isBankShimmer:boolean=false;
  getEmployeeBankDetailsByUuid() {
    this.isBankShimmer=true;
    this.dataService.getEmployeeBankDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.bankDetailsEmployee = data;
        
          this.isBankShimmer=false;
        
        console.log(this.bankDetailsEmployee.data);
      },
      (error) => {
        this.isBankShimmer=false;
        console.log(error);
      }
    );
  }

  
  documentsEmployee:any;
  // isDocumentsShimmer:boolean=false;
  getEmployeeDocumentsDetailsByUuid() {
    // this.isDocumentsShimmer=true;
    this.dataService.getEmployeeDocumentsDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.documentsEmployee = data;
        
          // this.isDocumentsShimmer=false;
        
        console.log(this.bankDetailsEmployee.data);
      },
      (error) => {
        // this.isDocumentsShimmer=false;
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

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.getUserLeaveLogByUuid();
}

}
