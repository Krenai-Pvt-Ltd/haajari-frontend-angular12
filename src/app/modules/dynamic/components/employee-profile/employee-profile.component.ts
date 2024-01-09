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
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import * as dayjs from 'dayjs';
import { AttendanceDetailsResponse } from 'src/app/models/attendance-detail-response';
import { UserAddressDetailsRequest } from 'src/app/models/user-address-details-request';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css'],
})
export class EmployeeProfileComponent implements OnInit {
  userAddressDetailsRequest: UserAddressDetailsRequest = new UserAddressDetailsRequest();
  userLeaveForm!: FormGroup;
  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private firebaseStorage: AngularFireStorage

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
        halfDayLeave: [false],
        dayShift: [false],
        eveningShift: [false],
      });
    }

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
  newDate: string = ''
  ngOnInit(): void {
    this.getUserAttendanceStatus();
    this.getOrganizationOnboardingDateByUuid();

    // const today = dayjs();
    // const firstDayOfMonth = today.startOf('month');
    // const lastDayOfMonth = today.endOf('month');
    // this.firstDay = firstDayOfMonth.toString();
    // this.lastDay = lastDayOfMonth.toString();
    let date = new Date();

    // let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let lastDayString = lastDay.toISOString().split('T')[0];
    date.setDate(1);
    let firstDayString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    // this.getTotalPresentAbsentMonthwise();
    // const currentDate = moment();
    // this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD');
    // this.endDateStr = currentDate.endOf('month').format('YYYY-MM-DD');
    // this.startDateStr = this.newDate;
    this.startDateStr = firstDayString;
    this.endDateStr = moment(new Date()).format('YYYY-MM-DD')
    // this.month = currentDate.format('MMMM');
    // this.getUserAttendanceDataFromDate();
    this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);
    this.fetchManagerNames();
    this.getUserByUuid();
    this.getEmployeeAdressDetailsByUuid();
    this.getEmployeeExperiencesDetailsByUuid();
    this.getEmployeeAcademicDetailsByUuid();
    this.getEmployeeContactsDetailsByUuid();
    this.getEmployeeBankDetailsByUuid();
    this.getEmployeeDocumentsDetailsByUuid();
    this.getUserLeaveReq();
    this.getUserLeaveLogByUuid();
    // this.goforward();
  }

  prevDate!: Date;

  getOrganizationOnboardingDateByUuid() {
    debugger
    this.dataService.getOrganizationOnboardingDate(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.prevDate = data;
        this.newDate = moment(data).format('YYYY-MM-DD');
        // this.getUserAttendanceDataFromDate();
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
  eventsFlag: boolean = false;
  // isCalendarFlag:boolean=false;

  // #####################

  totalPresent: number = 0;
  totalAbsent: number = 0;

  firstDay: string = '';
  lastDay: string = '';

  // totalPresentAbsentOnBack(){

  //   this.firstDay = 

  // }


  // getTotalPresentAbsentMonthwise(): void {
  //   debugger;
  //   this.dataService
  //     .getUserAttendanceDetailsByDateDuration(
  //       this.userId,
  //       'USER',
  //       this.firstDay,
  //       this.lastDay
  //     )
  //     .subscribe(
  //       (response) => {
  //         this.attendanceDetails = Object.values(response);
  //         this.attendances = this.attendanceDetails[0];
  //         console.log('Attendance Details:', this.attendances);
  //         console.log(
  //           'Attendance Details length:',
  //           this.attendanceDetails[0].length
  //         );

  //         for (let i = 0; i < this.attendances.length; i++) {
  //           const title = this.attendances[i].checkInTime != null ? 'P' : 'A';
  //           if(title == 'P'){
  //             this.totalPresent++;
  //           }else if(title == 'A'){
  //             this.totalAbsent++;
  //           }
  //         }

  //       },
  //       (error: any) => {
  //         console.error('Error fetching data:', error);
  //       }
  //     );
  // }


  // #######################

  attendanceDetailsResponse: AttendanceDetailsResponse[] = [];

  getUserAttendanceDataFromDate(sDate: string, eDate: string): void {

    debugger;
    this.dataService
      .getUserAttendanceDetailsByDateDuration(
        this.userId,
        'USER',
        sDate,
        eDate
      )
      .subscribe(
        (response: any) => {
          response = response.mapOfObject;
          this.events = [];
          this.totalPresent = 0;
          this.totalAbsent = 0;

          if (response == null) {
            let currentDate = moment(sDate);
            const endDate = moment(eDate);

            while (currentDate.isSameOrBefore(endDate)) {
              const title = 'A';
              const date = currentDate.format('YYYY-MM-DD');
              var color = '#f8d7d7';
              this.totalAbsent++;
              var tempEvent: { title: string, date: string, color: string } = { title: title, date: date, color: color };
              this.events.push(tempEvent);

              currentDate.add(1, 'days');

              this.calendarOptions = {
                plugins: [dayGridPlugin],
                initialView: 'dayGridMonth',
                weekends: true,
                events: this.events,
              };
            }
          } else {
            this.attendanceDetails = Object.values(response);
            this.attendances = this.attendanceDetails[0];
            this.attendanceDetailsResponse = this.attendanceDetails[0];

            console.log('Attendance Details:', this.attendances);
            console.log(
              'Attendance Details length:',
              this.attendanceDetails[0].length
            );
            for (let i = 0; i < this.attendances.length; i++) {
              const title = this.attendances[i].checkInTime != null ? 'P' : 'A';
              if (title == 'P') {
                this.totalPresent++;
              } else if (title == 'A') {
                this.totalAbsent++;
              }
              const date = moment(this.attendances[i].createdDate).format('YYYY-MM-DD');
              var color = title == 'P' ? '#e0ffe0' : title == 'A' ? '#f8d7d7' : '';
              var tempEvent: { title: string, date: string, color: string } = { title: title, date: date, color: color };
              this.events.push(tempEvent);

              if (i == this.attendances.length - 1) {
                this.calendarOptions = {
                  plugins: [dayGridPlugin],
                  initialView: 'dayGridMonth',
                  weekends: true,
                  events: this.events,
                };
              }
            }
          }




          // for (let i = 0; i < this.attendances.length; i++) {
          //   const title = this.attendances[i].checkInTime != null ? 'P' : 'A';
          //   if(title == 'P'){
          //     this.totalPresent++;
          //   }else if(title == 'A'){
          //     this.totalAbsent++;
          //   }
          //   const date = moment(this.attendances[i].createdDate).format('YYYY-MM-DD');
          //   var color = title=='P'?'#e0ffe0':title=='A'?'#f8d7d7':'';
          //   var tempEvent:{title:string,date:string,color:string}={title:title,date:date,color:color};
          //   this.events.push(tempEvent);
          //   if(i==this.attendances.length-1){
          //     // this.eventsFlag=true;
          //     this.calendarOptions = {
          //       plugins: [dayGridPlugin],
          //       initialView: 'dayGridMonth',
          //       weekends: true,
          //       events: this.events,  
          //     };
          //   }
          // }

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

  forwordFlag: boolean = false;

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  goforward() {
    debugger
    const calendarApi = this.calendarComponent.getApi();

    (console.log(calendarApi.getDate().getMonth()));

    if(calendarApi.getDate().getMonth() == 11 && new Date().getMonth()==0){
      calendarApi.next();
      this.forwordFlag = false;
    }
    // if((calendarApi.getDate().getMonth() == 11) && (calendarApi.getDate().getMonth() == ) (calendarApi.getDate().getMonth()) > new Date().getMonth()){
    //   calendarApi.next();
    //   this.forwordFlag = false;
    // }
    else{
      if ((calendarApi.getDate().getFullYear() < new Date().getFullYear()) || (calendarApi.getDate().getMonth() < new Date().getMonth() - 1)){
        calendarApi.next();
        this.forwordFlag = true;
        this.backwardFlag = true;

      } else {
        calendarApi.next();
        this.forwordFlag = false;
      }
    }

    // if(calendarApi.getDate().getFullYear() > new Date().getFullYear()){
    //   this.forwordFlag = false;
    // } else if( calendarApi.getDate().getFullYear() <= new Date().getFullYear() && calendarApi.getDate().getMonth() > new Date().getMonth()){
    //   this.forwordFlag = false;
    // }else{
    //       calendarApi.next();
    //           this.forwordFlag = true;
    // }

    

    let startDate = calendarApi.view.currentStart;
    let endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);


    this.startDateStr = moment(startDate).format('YYYY-MM-DD');
    if (endDate.getMonth() == new Date().getMonth()) {
      this.endDateStr = moment(new Date()).format('YYYY-MM-DD')
    } else {
      this.endDateStr = moment(endDate).format('YYYY-MM-DD');
    }
    this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);


    // this.firstDay = 

    // let firstD = new Date(calendarApi.getDate().getFullYear(), calendarApi.getDate().getMonth()+1, 1);
    // firstD.setDate(1); 
    // let lastD = new Date(calendarApi.getDate().getFullYear(), calendarApi.getDate().getMonth()+1, 0);
    // lastD.setMonth(lastD.getMonth() + 1);
    // lastD.setDate(0);
    // let firstDString = firstD.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    // let lastDString = lastD.toISOString().split('T')[0];   

    // this.startDateStr = firstDString;
    // if(firstD.getMonth()==new Date().getMonth()){
    //   this.endDateStr = moment(new Date()).format('YYYY-MM-DD')
    // }else{
    //    this.endDateStr = lastDString;
    // }
    // this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);

    // if(calendarApi.getDate().getMonth()==new Date().getMonth()){
    //  this.forwordFlag=false;
    //  this.backwardFlag=true;
    // 
  }
  backwardFlag: boolean = true;
  goBackward() {
    debugger
    const calendarApi = this.calendarComponent.getApi();
    var date = new Date(this.prevDate);
    var month = date.getMonth();
    if ((calendarApi.getDate().getFullYear() > date.getFullYear()) ||  (calendarApi.getDate().getMonth() > month + 1)) {
      calendarApi.prev();
      this.backwardFlag = true;
      this.forwordFlag = true;
    } else {
      calendarApi.prev();
      this.backwardFlag = false;
    }

    let startDate = calendarApi.view.currentStart;
    let endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    if (startDate.getMonth() == new Date(this.newDate).getMonth()) {
      this.startDateStr = this.newDate;
    } else {
      this.startDateStr = moment(startDate).format('YYYY-MM-DD');
    }
    this.endDateStr = moment(endDate).format('YYYY-MM-DD');
    this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);



    // let firstD = new Date(calendarApi.getDate().getFullYear(), calendarApi.getDate().getMonth()+1, 1);
    // firstD.setDate(1); 
    // let lastD = new Date(calendarApi.getDate().getFullYear(), calendarApi.getDate().getMonth()+1, 0);
    // lastD.setMonth(lastD.getMonth() + 1);
    // lastD.setDate(0);
    // let firstDString = firstD.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    // let lastDString = lastD.toISOString().split('T')[0];   

    // if(lastD.getMonth()== new Date(this.newDate).getMonth()){
    //   this.startDateStr = this.newDate;
    // }else{
    // this.startDateStr = firstDString;
    // }
    // this.endDateStr = lastDString;
    // this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);


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
    this.forwordFlag = calendarApi.getDate().getMonth() < new Date().getMonth();
    this.backwardFlag = true;

    let startDate = calendarApi.view.currentStart;
    let endDate = moment(new Date()).format('YYYY-MM-DD')


    this.startDateStr = moment(startDate).format('YYYY-MM-DD');
    this.endDateStr = endDate;
    this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);



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


  resetUserLeave() {
    this.userLeaveRequest.startDate = new Date();
    this.userLeaveRequest.endDate = new Date();
    this.userLeaveRequest.halfDayLeave = false;
    this.userLeaveRequest.dayShift = false;
    this.userLeaveRequest.eveningShift = false;
    this.userLeaveRequest.leaveType = "";
    this.userLeaveRequest.managerId = 0;
    this.userLeaveRequest.optNotes = "";
    this.selectedManagerId = 0;

  }

  saveLeaveRequestUser() {
    this.userLeaveRequest.managerId = this.selectedManagerId;
    this.userLeaveRequest.dayShift = this.dayShiftToggle;
    this.userLeaveRequest.eveningShift = this.eveningShiftToggle;
    // this.userLeaveRequest.halfDayLeave = false;
    this.dataService.saveLeaveRequest(this.userId, this.userLeaveRequest)
      .subscribe(data => {

        console.log(data);
        console.log(data.body);
        this.getUserLeaveLogByUuid();
        this.getUserLeaveReq();
        this.resetUserLeave();
        this.requestLeaveCloseModel.nativeElement.click();
        location.reload();
      }, (error) => {
        console.log(error.body);
      })
  }

  dayShiftToggle: boolean = false;
  eveningShiftToggle: boolean = false;

  dayShiftToggleFun(shift: string) {
    debugger

    if (shift == 'day') {
      this.dayShiftToggle = true;
      this.eveningShiftToggle = false;

    } else if (shift == 'evening') {
      this.eveningShiftToggle = true;
      this.dayShiftToggle == false
    }
    console.log("day" + this.dayShiftToggle + "evening" + this.eveningShiftToggle);
  }


  halfDayLeaveShiftToggle: boolean = false;

  halfLeaveShiftToggle() {
    this.halfDayLeaveShiftToggle = this.halfDayLeaveShiftToggle == true ? false : true;
  }

  pendingFlag: boolean = true;

  getIsPendingLeave(leaveType: string) {
    debugger
    this.userLeaveRequest.uuid = this.userId;
    // this.userLeaveRequest.leaveType= leaveType;
    this.dataService.getPendingLeaveFlag(this.userLeaveRequest).subscribe(data => {
      this.pendingFlag = data;
    }, (error) => {
      console.log(error);
    })
  }


  userLeave: any = [];

  getUserLeaveReq() {
    this.dataService.getUserLeaveRequests(this.userId).subscribe(
      (data) => {
        this.userLeave = data.body;
        console.log(this.userLeave);
      },
      (error) => {
        console.log(error);
      }
    );
  }



  selectedStatus!: string;
  selectStatusFlag: boolean = false;
  isLeaveErrorPlaceholder: boolean = false;
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
          if (data == null || data.length == 0) {
            this.isLeavePlaceholder = true;
            this.selectStatusFlag = false;
          } else {
            this.selectStatusFlag = true;
          }
          // this.isLeavePlaceholder = !data || data.length === 0;
          console.log(data);
        },
        (error) => {
          this.isLeaveErrorPlaceholder = true;
          this.isLeaveShimmer = false;
          console.log(error);
        }
      );
    }
  }


  userLeaveLog: any;

  isLeaveShimmer: boolean = false;
  isLeavePlaceholder: boolean = false;

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

  formatDate(date: Date) {
    const dateObject = new Date(date);
    const formattedDate = this.datePipe.transform(dateObject, 'yyyy-MM-dd');
    return formattedDate;
  }

  formatTime(date: Date) {
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


  addressEmployee: any[] = [];
  // isAddressShimmer:boolean=false;
  isAddressPlaceholder: boolean = false;
  getEmployeeAdressDetailsByUuid() {
    // this.isAddressShimmer=true;
    debugger
    this.dataService.getNewUserAddressDetails(this.userId).subscribe(
      (data: UserAddressDetailsRequest) => {
        console.log(data);
        this.userAddressDetailsRequest = data;
        console.log(data.userAddressRequest);
        this.addressEmployee = data.userAddressRequest;
        // this.isAddressShimmer=false;
        if (data == null || data.userAddressRequest.length == 0) {
          this.isAddressPlaceholder = true;
        }
        // console.log(this.addressEmployee.data);
      },
      (error) => {
        this.isAddressPlaceholder = true;
        // this.isAddressShimmer=false;
        console.log(error);
      }
    );
  }



  experienceEmployee: any;
  isCompanyPlaceholder: boolean = false;
  getEmployeeExperiencesDetailsByUuid() {
    this.dataService.getEmployeeExperiencesDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.experienceEmployee = data;
        if (data == null || data.length == 0) {
          this.isCompanyPlaceholder = true;
        }
        console.log(this.experienceEmployee.data);
      },
      (error) => {
        this.isCompanyPlaceholder = true;
        console.log(error);
      }
    );
  }


  academicEmployee: any;
  isAcademicPlaceholder: boolean = false;

  getEmployeeAcademicDetailsByUuid() {
    this.dataService.getEmployeeAcademicDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.academicEmployee = data;
        if (data == null || data.length == 0) {
          this.isAcademicPlaceholder = true;
        }
        console.log(this.academicEmployee.data);
      },
      (error) => {
        this.isAcademicPlaceholder = true;
        console.log(error);
      }
    );
  }



  contactsEmployee: any;
  isContactPlaceholder: boolean = false;
  getEmployeeContactsDetailsByUuid() {
    debugger
    this.dataService.getEmployeeContactsDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.contactsEmployee = data;
        if (data == null || data.length == 0) {
          this.isContactPlaceholder = true;
        }
        console.log(this.contactsEmployee.data);
      },
      (error) => {
        this.isContactPlaceholder = true;
        console.log(error);
      }
    );
  }




  bankDetailsEmployee: any;
  isBankShimmer: boolean = false;
  getEmployeeBankDetailsByUuid() {
    this.isBankShimmer = true;
    this.dataService.getEmployeeBankDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.bankDetailsEmployee = data;

        this.isBankShimmer = false;

        console.log(this.bankDetailsEmployee.data);
      },
      (error) => {
        this.isBankShimmer = false;
        console.log(error);
      }
    );
  }

  isDocsPlaceholder: boolean = false;
  documentsEmployee: any;
  highSchoolCertificate: string = '';
  degreeCert: string = '';
  intermediateCertificate: string = '';
  testimonialsString: string = '';
  // isDocumentsShimmer:boolean=false;
  getEmployeeDocumentsDetailsByUuid() {
    // this.isDocumentsShimmer=true;
    debugger
    this.dataService.getEmployeeDocumentsDetails(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.documentsEmployee = data.userDocuments;
        this.highSchoolCertificate = data.userDocuments.highSchoolCertificate;
        this.degreeCert = data.userDocuments.highestQualificationDegree;
        this.intermediateCertificate = data.userDocuments.secondarySchoolCertificate;
        this.testimonialsString = data.userDocuments.testimonialReccomendation;
        // this.isDocumentsShimmer=false;
        if (this.highSchoolCertificate == null || data.length == 0) {
          this.isDocsPlaceholder = true;
        }

        console.log(this.bankDetailsEmployee.data);
        console.log('hsdhjklkjhgf' + this.highSchoolCertificate);
      },
      (error) => {
        this.isDocsPlaceholder = true;
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

  previewString: string = ''
  @ViewChild('openViewModal') openViewModal !: ElementRef;
  openPdfModel(viewString: string) {
    if (viewString == "highschool") {
      this.previewString = this.highSchoolCertificate;
    } else if (viewString == "degree") {
      this.previewString = this.degreeCert;
    } else if (viewString == "secondaryschool") {
      this.previewString = this.intermediateCertificate;
    } else if (viewString == "testimonial") {
      this.previewString = this.testimonialsString;
    }
    debugger
    this.openViewModal.nativeElement.click();
  }


  // downloadSingleImage(imageUrl: any){
  //   debugger
  //    var blob =null;
  //    var splittedUrl=imageUrl.split("/firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/");
  //    splittedUrl=splittedUrl[1].split("?alt");
  //    splittedUrl=splittedUrl[0].replace("https://","");
  //    splittedUrl=decodeURIComponent(splittedUrl);
  //   this.firebaseStorage.storage.ref(splittedUrl).getDownloadURL().then((url:any) => {
  //     // This can be downloaded directly:
  //     var xhr = new XMLHttpRequest();
  //     xhr.responseType = 'blob';
  //     xhr.onload = (event) => {
  //        blob = xhr.response;
  //       console.log(blob);
  //       saveAs(blob, "Docs");

  //     };
  //     xhr.open('GET', url);
  //     xhr.send();
  //   })
  //   .catch((error: any) => {
  //     console.log(error);
  //     // Handle any errors
  //   });
  // }

  downloadSingleImage(imageUrl: any) {
    if (!imageUrl) {
      console.error('Image URL is undefined or null');
      return;
    }

    var blob = null;
    var splittedUrl = imageUrl.split("/firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/");

    if (splittedUrl.length < 2) {
      console.error('Invalid image URL format');
      return;
    }

    splittedUrl = splittedUrl[1].split("?alt");
    splittedUrl = splittedUrl[0].replace("https://", "");
    splittedUrl = decodeURIComponent(splittedUrl);

    this.firebaseStorage.storage.ref(splittedUrl).getDownloadURL().then((url: any) => {
      // This can be downloaded directly:
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        blob = xhr.response;
        console.log(blob);
        saveAs(blob, "Docs");
      };
      xhr.open('GET', url);
      xhr.send();
    })
      .catch((error: any) => {
        console.error(error);
        // Handle any errors
      });
  }

  // ########################

  

  checkinCheckout(command:string) {
    this.dataService.checkinCheckoutInSlack(this.userId, command).subscribe(
      (data) => {
        console.log(data);
        this.getUserAttendanceStatus() ;
      },
      (error) => {
        console.log(error);
        this.getUserAttendanceStatus() ;

      }
    );
  }

  status: string='';

  getUserAttendanceStatus() {
    debugger
    this.dataService.checkinCheckoutStatus(this.userId).subscribe(
      (data) => {
        console.log(data);
        this.status = data.result;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  


}
