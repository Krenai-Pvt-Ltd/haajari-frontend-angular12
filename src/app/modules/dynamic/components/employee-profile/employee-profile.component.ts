import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DataService } from 'src/app/services/data.service';
import { Subject } from 'rxjs';
import { UserLeaveRequest } from 'src/app/models/user-leave-request';
import { FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { UserDto } from 'src/app/models/user-dto.model';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import * as dayjs from 'dayjs';
import { AttendanceDetailsResponse } from 'src/app/models/attendance-detail-response';
import { UserAddressDetailsRequest } from 'src/app/models/user-address-details-request';
import { HelperService } from 'src/app/services/helper.service';
import { Key } from 'src/app/constant/key';
import { ReasonOfRejectionProfile } from 'src/app/models/reason-of-rejection-profile';
import { constant } from 'src/app/constant/constant';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css'],
})
export class EmployeeProfileComponent implements OnInit {

  reasonOfRejectionProfile: ReasonOfRejectionProfile = new ReasonOfRejectionProfile();
  userAddressDetailsRequest: UserAddressDetailsRequest = new UserAddressDetailsRequest();
  userLeaveForm!: FormGroup;
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  ROLE:any
  UUID:any;
  hideDetailsFlag:boolean=false;
  adminRoleFlag:boolean=false;
  userRoleFlag:boolean=false;
  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
    private activateRoute: ActivatedRoute,
    private helperService: HelperService,
    private fb: FormBuilder,
    private http: HttpClient,
    private firebaseStorage: AngularFireStorage,
    private router: Router,
    private roleService: RoleBasedAccessControlService,
    public location: Location

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

  goBack() {
    // this.router.navigate(['/employee-onboarding-data']);
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
  count: number = 0;

  ADMIN = Key.ADMIN;
  MANAGER = Key.MANAGER;
  USER = Key.USER;

  // tokenUserRoleFlag:boolean=false;
  currentDate: Date = new Date();
  currentNewDate: any;
  ngOnInit(): void {
    this.ROLE=this.roleService.getRole();
    this.UUID=this.roleService.getUUID();
    if(this.ROLE==this.ADMIN){
    this.adminRoleFlag=true;
    }
    // if(this.ROLE==this.USER){
    //   this.tokenUserRoleFlag==true;
    // }
    if(this.userId==this.UUID){
      this.userRoleFlag=true;
    }
    this.getRoleData();
    this.currentNewDate = moment(this.currentDate).format('yyyy-MM-DD');
    this.getUserAttendanceStatus();
    this.getOrganizationOnboardingDateByUuid();
    // let date = new Date();
    // let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    // let lastDayString = lastDay.toISOString().split('T')[0];
    // date.setDate(1);
    // let firstDayString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    // this.startDateStr = firstDayString;

    let firstDayOfMonth = moment().startOf('month');
    this.startDateStr = firstDayOfMonth.format('YYYY-MM-DD');
    // this.startDateStr = firstDayString;
    // console.log("startDateStr :" + this.startDateStr);
    this.endDateStr = moment(new Date()).format('YYYY-MM-DD')
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
  }


  getRoleData(){
    //  const managerDetails =localStorage.getItem('managerFunc');
    // if(managerDetails !== null){
    //   const managerFunc = JSON.parse(managerDetails);

    if((this.userId!=this.UUID) && (this.ROLE==this.MANAGER)){
      this.hideDetailsFlag=true;
    }else{
      this.hideDetailsFlag=false;
    }
      // if((this.userId==this.UUID) && (this.ROLE==this.MANAGER)){
      //   this.hideDetailsFlag=false;
      // }else if(this.ROLE==this.ADMIN){
      //   this.hideDetailsFlag=false;
      // }else if(this.ROLE==this.USER){
      //   this.hideDetailsFlag=false;
      // }else{
      //   this.hideDetailsFlag=true;
      // }

    // }
  }

  prevDate!: Date;

  getOrganizationOnboardingDateByUuid() {
    
    this.dataService.getOrganizationOnboardingDate(this.userId).subscribe(
      (data) => {
        this.prevDate = data;
        this.newDate = moment(data).format('YYYY-MM-DD');
        this.count++;
        // this.getUserAttendanceDataFromDate();
        // this.goBackward();
      },
      (error) => {
        this.count++;
      }
    );
  }


  user: any = {};
  isImage:boolean=false;

  getUserByUuid() {
    this.dataService.getUserByUuid(this.userId).subscribe(
      (data) => {
        this.user = data;

        if(constant.EMPTY_STRINGS.includes(this.user.image)){
          this.isImage=false;
        }else{
          this.isImage=true;
        }
       
        this.count++;

      },
      (error) => {
        this.isImage=false;
        this.count++;
      }
    );
  }

  toggle = false;
  approvedToggle=false;
  @ViewChild("closeRejectModalButton") closeRejectModalButton!:ElementRef;
  updateStatusUserByUuid(type: string) {
    if(type=="REJECTED")
    this.toggle = true;
    if(type=="APPROVED"){
    this.approvedToggle=true;
    }
    this.setReasonOfRejectionMethodCall();
    this.dataService.updateStatusUser(this.userId, type).subscribe(
      (data) => {
        // console.log('status updated:' + type);
        this.sendStatusResponseMailToUser(this.userId, type);
        // this.toggle = false

        // location.reload();
        // location.reload();
      },
      (error) => {
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
  //       }
  //     );
  // }


  // #######################

  attendanceDetailsResponse: AttendanceDetailsResponse[] = [];
  // var calendar = new Calendar(calendarEl, {

  @ViewChild('openEventsModal') openEventsModal!: ElementRef;
  userAttendanceDetailDateWise:{checkInTime:string,checkOutTime:string, totalWorkingHours:string, breakCount:string, breakDuration:string, createdDate:string}={checkInTime:"",checkOutTime:"", totalWorkingHours:"", breakCount:"", breakDuration:"", createdDate:""};
  attendanceDetailModalToggle:boolean=false;
  clientX:string="0px";
  clientY:string="0px";
  openModal(mouseEnterInfo: any): void {
    debugger
    if(!this.attendanceDetailModalToggle){
    // console.log("events : ", mouseEnterInfo.event);
    this.userAttendanceDetailDateWise.checkInTime="";
    this.userAttendanceDetailDateWise.checkOutTime="";
    this.userAttendanceDetailDateWise.breakCount="";
    this.userAttendanceDetailDateWise.breakDuration="";
    this.userAttendanceDetailDateWise.totalWorkingHours="";
    this.userAttendanceDetailDateWise.createdDate="";
    this.userAttendanceDetailDateWise.checkInTime=mouseEnterInfo.event._def.extendedProps.checkInTime;
    this.userAttendanceDetailDateWise.checkOutTime=mouseEnterInfo.event._def.extendedProps.checkOutTime;
    this.userAttendanceDetailDateWise.breakCount=mouseEnterInfo.event._def.extendedProps.breakCount;
    this.userAttendanceDetailDateWise.breakDuration=mouseEnterInfo.event._def.extendedProps.breakDuration;
    this.userAttendanceDetailDateWise.totalWorkingHours=mouseEnterInfo.event._def.extendedProps.totalWorkingHours;
    this.userAttendanceDetailDateWise.createdDate=mouseEnterInfo.event._def.extendedProps.createdDate;
    // console.log("totalworkinghour :" + this.userAttendanceDetailDateWise.totalWorkingHours);
    var rect = mouseEnterInfo.el.getBoundingClientRect();
    this.clientX=(rect.left)+"px";
    this.clientY=(rect.top)+"px";
    // console.log("mouse location:", mouseEnterInfo.jsEvent.clientX, mouseEnterInfo.jsEvent.clientY);
    this.openEventsModal.nativeElement.click();
  }
  }
  
  closeAttendanceModal() { 
    this.attendanceDetailModalToggle=false;
    this.closeAttendanceDetailModalButton.nativeElement.click();
  }


 
  // eventMouseEnter(mouseEnterInfo: any): void {
  //   const event = mouseEnterInfo.event;
  //   const date = mouseEnterInfo.date;
  //   this.openModal(mouseEnterInfo);
  // }
@ViewChild("closeAttendanceDetailModalButton") closeAttendanceDetailModalButton!:ElementRef;
  mouseLeaveInfo(mouseEnterInfo: any): void {
    debugger
    this.closeAttendanceModal();
  }
   
  

  
  // });
  getUserAttendanceDataFromDate(sDate: string, eDate: string): void {

    debugger
    this.dataService
      .getUserAttendanceDetailsByDateDuration(
        this.userId,
        'USER',
        sDate,
        eDate
      )
      .subscribe(
        (response: any) => {
          response = response.listOfObject;
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
                eventClick: this.openModal.bind(this),
                eventMouseEnter: this.openModal.bind(this),
                eventMouseLeave:this.mouseLeaveInfo.bind(this)
                // eventClick: function(mouseEnterInfo) {
                //   alert('Event: ' + mouseEnterInfo.event.title);
                //   mouseEnterInfo.el.style.borderColor = 'red';
                // }
              };
            }
          } else {
            // this.attendanceDetails = Object.values(response);
            // this.attendances = this.attendanceDetails[0];
            // this.attendanceDetailsResponse = this.attendanceDetails[0];

            this.attendances = response;
            this.attendanceDetailsResponse = response;


            // console.log('Attendance Details:', this.attendances);
            // console.log(
            //   'Attendance Details length:',
            //   this.attendanceDetails[0].length
            // );
            for (let i = 0; i < this.attendances.length; i++) {

              const date = moment(this.attendances[i].createdDate).format('YYYY-MM-DD');
              let title = '';
             
              if((date == moment(new Date()).format('YYYY-MM-DD')) && (this.attendances[i].checkInTime==null)){
                title == '-';
              } else {
              title = this.attendances[i].checkInTime != null ? 'P' : 'A';
              if (title == 'P') {
                this.totalPresent++;
              } else if (title == 'A') {
                this.totalAbsent++;
              } 
            }
             
              var checkInTime = this.attendances[i].checkInTime;
              var checkOutTime = this.attendances[i].checkOutTime;
              var breakCount = this.attendances[i].breakCount;
              var breakDuration = this.attendances[i].totalBreakHours;
              var totalWorkingHours = this.attendances[i].totalWorkingHours;
              var createdDate = this.attendances[i].createdDate
              var color = title == 'P' ? '#e0ffe0' : title == 'A' ? '#f8d7d7' : '';
              var tempEvent2: { title: string, date: string, color: string, checkInTime:any, checkOutTime:any, breakCount:any, breakDuration:any, totalWorkingHours:any, createdDate:any} = { title: title, date: date, color: color,checkInTime:checkInTime, checkOutTime:checkOutTime, breakCount:breakCount, breakDuration:breakDuration, totalWorkingHours:totalWorkingHours, createdDate:createdDate };
              this.events.push(tempEvent2);

              
              if (i == this.attendances.length - 1) {
                this.calendarOptions = {
                  plugins: [dayGridPlugin],
                  initialView: 'dayGridMonth',
                  weekends: true,
                  events: this.events,
                  eventClick: this.openModal.bind(this),
                  eventMouseEnter: this.openModal.bind(this),
                  eventMouseLeave:this.mouseLeaveInfo.bind(this)
                  // eventClick: function(mouseEnterInfo) {
                  //   alert('Event: ' + mouseEnterInfo.event.title);
                  // }
                };
              }
              
            }
          }

          var flag = false;
          if (!flag) {
            var date = new Date(this.prevDate);
            const calendarApi = this.calendarComponent.getApi();
            this.changeForwardButtonVisibilty(calendarApi);
            flag = true;
          }
          this.count++;

        },
        (error: any) => {
          this.count++;
          // console.error('Error fetching data:', error);
        }
      );
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: [this.events],
    eventClick: this.openModal.bind(this),
    eventMouseEnter: this.openModal.bind(this),
    eventMouseLeave:this.mouseLeaveInfo.bind(this)

  };

  forwordFlag: boolean = false;

  goforward() {
    debugger
    const calendarApi = this.calendarComponent.getApi();

    calendarApi.next();
    this.changeForwardButtonVisibilty(calendarApi);

    let startDate = calendarApi.view.currentStart;
    let endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    this.startDateStr = moment(startDate).format('YYYY-MM-DD');
    if (endDate.getMonth() == new Date().getMonth()) {
      this.endDateStr = moment(new Date()).format('YYYY-MM-DD')
    } else {
      this.endDateStr = moment(endDate).format('YYYY-MM-DD');
    }
    this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);

   
  }

  changeForwardButtonVisibilty(calendarApi: any) {
    debugger
    var enrolmentDate = new Date(this.prevDate);
    if (calendarApi?.getDate().getFullYear() != new Date().getFullYear()) {
      this.forwordFlag = true;
    } else if (calendarApi.getDate().getFullYear() == new Date().getFullYear()) {
      if (calendarApi.getDate().getMonth() == new Date().getMonth()) {
        this.forwordFlag = false;
      } else {
        this.forwordFlag = true;
      }
    }

    if (calendarApi?.getDate().getFullYear() == enrolmentDate.getFullYear()) {
      if (calendarApi?.getDate().getMonth() == enrolmentDate.getMonth()) {
        this.backwardFlag = false;
      } else {
        this.backwardFlag = true;
      }
    } else {
      this.backwardFlag = true;
    }

  }

  backwardFlag: boolean = true;
  goBackward() {
    debugger
    const calendarApi = this.calendarComponent.getApi();
    var date = new Date(this.prevDate);
    var month = date.getMonth();
    // console.log("month" + month);

    calendarApi.prev();
    this.changeForwardButtonVisibilty(calendarApi);

    let startDate = calendarApi.view.currentStart;
    let endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    if (startDate.getMonth() == new Date(this.newDate).getMonth()) {
      this.startDateStr = this.newDate;
    } else {
      this.startDateStr = moment(startDate).format('YYYY-MM-DD');
    }
    this.endDateStr = moment(endDate).format('YYYY-MM-DD');
    this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);

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

  // ############################################################################333333


  today: Date = new Date();
  convertStringToDate(attendance: AttendenceDto) {
    if (attendance.converterDate == undefined) {
      attendance.converterDate = new Date(attendance.createdDate);
    }
    return attendance.converterDate;
  }

  dateInMonthList(attendances: AttendenceDto[]): string[] {
    const uniqueDays = Array.from(
      new Set(attendances.map((a) => a.createdDate))
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
  @ViewChild(FormGroupDirective)
  formGroupDirective!: FormGroupDirective;
  submitLeaveLoader:boolean=false;

  saveLeaveRequestUser() {
    debugger
    this.userLeaveRequest.managerId = this.selectedManagerId;
    this.userLeaveRequest.dayShift = this.dayShiftToggle;
    this.userLeaveRequest.eveningShift = this.eveningShiftToggle;
    this.submitLeaveLoader=true;
    // this.userLeaveRequest.halfDayLeave = false;
    this.dataService.saveLeaveRequest(this.userId, this.userLeaveRequest)
      .subscribe(data => {

        // console.log(data);
        // console.log(data.body);
        this.submitLeaveLoader=false;
        this.isLeavePlaceholder=false;
        this.getUserLeaveReq();
        this.resetUserLeave();
        this.formGroupDirective.resetForm();
        this.getUserLeaveLogByUuid();
        this.requestLeaveCloseModel.nativeElement.click();
        // location.reload();
      }, (error) => {
        this.submitLeaveLoader=false;
        // console.log(error.body);
      })
  }

  dayShiftToggle: boolean = false;
  eveningShiftToggle: boolean = false;

  dayShiftToggleFun(shift: string) {

    if (shift == 'day') {
      this.dayShiftToggle = true;
      this.eveningShiftToggle = false;

    } else if (shift == 'evening') {
      this.eveningShiftToggle = true;
      this.dayShiftToggle == false
    }
    // console.log("day" + this.dayShiftToggle + "evening" + this.eveningShiftToggle);
  }


  halfDayLeaveShiftToggle: boolean = false;

  halfLeaveShiftToggle() {
    this.halfDayLeaveShiftToggle = this.halfDayLeaveShiftToggle == true ? false : true;
  }

  // pendingFlag: boolean = true;

  // getIsPendingLeave(leaveType: string) {
  //   debugger
  //   this.userLeaveRequest.uuid = this.userId;
  //   this.dataService.getPendingLeaveFlag(this.userLeaveRequest).subscribe(data => {
  //   }, (error) => {
  //     console.log(error);
  //   })
  // }
//   (ngModelChange)="getIsPendingLeave(userLeaveRequest.leaveType)"
//   <div class="text-danger" *ngIf="!pendingFlag">
//   You can not apply to this leave, for selected dates your leave qouta is exhausted.
// </div>
  userLeave: any = [];
  leaveCountPlaceholderFlag: boolean = false;

  getUserLeaveReq() {
    this.leaveCountPlaceholderFlag = false;
    this.dataService.getUserLeaveRequests(this.userId).subscribe(
      (data) => {
        if (data.body != undefined || data.body != null || data.body.length != 0) {
          this.userLeave = data.body;
        } else {
          this.leaveCountPlaceholderFlag = true;
          return;
        }
        this.count++;
      },
      (error) => {
        this.count++;
      }
    );
  }



  selectedStatus!: string;
  selectStatusFlag: boolean = false;
  isLeaveErrorPlaceholder: boolean = false;
  getUserLeaveLogByUuid() {
    debugger
    this.isLeaveShimmer = true;
    // this.selectStatusFlag=true;

    if (this.selectedStatus) {
      this.dataService.getUserLeaveLogByStatus(this.userId, this.selectedStatus).subscribe(
        (data) => {
          this.userLeaveLog = data;
          this.isLeaveShimmer = false;
          this.isLeavePlaceholder = !data || data.length === 0;
          this.count++;
        },
        (error) => {
          this.isLeaveShimmer = false;
          this.count++;
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
        },
        (error) => {
          this.isLeaveErrorPlaceholder = true;
          this.isLeaveShimmer = false;
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
  //     },
  //     (error) => {
  //       this.isLeaveShimmer=false;
  //       // this.isLeavePlaceholder=true;
  //     }
  //   );
  // }

  // managerNames: string[] = [];
  managers: UserDto[] = [];
  selectedManagerId!: number;

  fetchManagerNames() {
    this.dataService.getEmployeeManagerDetails(this.userId).subscribe(
      (data: UserDto[]) => {
        this.managers = data;
        this.count++;
      },
      (error) => {
        this.count++;
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
    this.dataService.getNewUserAddressDetails(this.userId).subscribe(
      (data: UserAddressDetailsRequest) => {

        if (data.userAddressRequest.length == 0) {
          this.isAddressPlaceholder = true;
          return;
        } else {
          this.addressEmployee = data.userAddressRequest;

        }


        this.count++;
        // this.isAddressShimmer=false;
        // (data == null || data.userAddressRequest.length == 0)
      },
      (error) => {
        this.count++;
        this.isAddressPlaceholder = true;
        // this.isAddressShimmer=false;
      }
    );
  }



  experienceEmployee: any;
  isCompanyPlaceholder: boolean = false;
  getEmployeeExperiencesDetailsByUuid() {
    this.dataService.getEmployeeExperiencesDetails(this.userId).subscribe(
      (data) => {
        this.experienceEmployee = data;
        if (data == null || data.length == 0) {
          this.isCompanyPlaceholder = true;
        }
        this.count++;
      },
      (error) => {
        this.count++;
        this.isCompanyPlaceholder = true;
      }
    );
  }


  academicEmployee: any;
  isAcademicPlaceholder: boolean = false;

  getEmployeeAcademicDetailsByUuid() {
    this.dataService.getEmployeeAcademicDetails(this.userId).subscribe(
      (data) => {
        if (data != null || data != undefined) {
          this.academicEmployee = data;

        }
        else {
          this.isAcademicPlaceholder = true;
        }
        this.count++;
      },
      (error) => {
        this.count++;
        this.isAcademicPlaceholder = true;
      }
    );
  }



  contactsEmployee: any;
  isContactPlaceholder: boolean = false;
  getEmployeeContactsDetailsByUuid() {
    
    this.dataService.getEmployeeContactsDetails(this.userId).subscribe(
      (data) => {
        this.contactsEmployee = data;
        if (data == null || data.length == 0) {
          this.isContactPlaceholder = true;
        }
        this.count++;
        
      },
      (error) => {
        this.count++;
        this.isContactPlaceholder = true;
      }
    );
  }




  bankDetailsEmployee: any;
  isBankShimmer: boolean = false;
  getEmployeeBankDetailsByUuid() {
    this.isBankShimmer = true;
    this.dataService.getEmployeeBankDetails(this.userId).subscribe(
      (data) => {
        this.bankDetailsEmployee = data;

        this.isBankShimmer = false;

        this.count++;
      },
      (error) => {
        this.count++;
        this.isBankShimmer = false;
      }
    );
  }

  isDocsPlaceholder: boolean = false;
  documentsEmployee: any;
  highSchoolCertificate: string = '';
  degreeCert: string = '';
  intermediateCertificate: string = '';
  testimonialsString: string = '';
  aadhaarCardString: string = '';
  pancardString: string = '';
  // isDocumentsShimmer:boolean=false;
  getEmployeeDocumentsDetailsByUuid() {
    // this.isDocumentsShimmer=true;
    this.dataService.getEmployeeDocumentsDetails(this.userId).subscribe(
      (data) => {
        this.documentsEmployee = data.userDocuments;
        if (data.userDocuments != null) {
          this.highSchoolCertificate = data.userDocuments.highSchoolCertificate;
          this.degreeCert = data.userDocuments.highestQualificationDegree;
          this.intermediateCertificate = data.userDocuments.secondarySchoolCertificate;
          this.testimonialsString = data.userDocuments.testimonialReccomendation;
          this.aadhaarCardString = data.userDocuments.aadhaarCard;
          this.pancardString = data.userDocuments.pancard;
        }
        // this.isDocumentsShimmer=false;
        else {
          this.isDocsPlaceholder = true;
        }

        this.count++;
      },
      (error) => {
        this.count++;
        this.isDocsPlaceholder = true;
        // this.isDocumentsShimmer=false;
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
  @ViewChild('openViewModal') openViewModal!: ElementRef;
  openPdfModel(viewString: string) {
    debugger
    if (viewString == "highschool") {
      this.previewString = this.highSchoolCertificate;
    } else if (viewString == "degree") {
      this.previewString = this.degreeCert;
    } else if (viewString == "secondaryschool") {
      this.previewString = this.intermediateCertificate;
    } else if (viewString == "testimonial") {
      this.previewString = this.testimonialsString;
    } else if (viewString == "aadhaarCard") {
      this.previewString = this.aadhaarCardString;
    } else if (viewString == "pancard") {
      this.previewString = this.pancardString;
    }

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
  //       saveAs(blob, "Docs");

  //     };
  //     xhr.open('GET', url);
  //     xhr.send();
  //   })
  //   .catch((error: any) => {
  //     // Handle any errors
  //   });
  // }

  downloadSingleImage(imageUrl: any) {
    if (!imageUrl) {
      // console.error('Image URL is undefined or null');
      return;
    }

    var blob = null;
    var splittedUrl = imageUrl.split("/firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/");

    if (splittedUrl.length < 2) {
      // console.error('Invalid image URL format');
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
        saveAs(blob, "Docs");
      };
      xhr.open('GET', url);
      xhr.send();
    })
      .catch((error: any) => {
        // Handle any errors
      });
  }

  // ########################

  InOutLoader:boolean=false;

  checkinCheckout(command: string) {
    this.InOutLoader=true;
    this.dataService.checkinCheckoutInSlack(this.userId, command).subscribe(
      (data) => {
        this.InOutLoader=false;
        this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);
        this.getUserAttendanceStatus();
        this.helperService.showToast(data.message, Key.TOAST_STATUS_SUCCESS);
      },
      (error) => {
        this.InOutLoader=false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);

        // this.getUserAttendanceStatus();
        // if(command==="/inn"){
        // this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);
        // }
      }
    );
  }

  status: string = '';

  getUserAttendanceStatus() {
    this.dataService.checkinCheckoutStatus(this.userId).subscribe(
      (data) => {
        this.status = data.result;
        this.count++;
      },
      (error) => {
        this.count++;
      }
    );
  }

  @ViewChild('openRejectModal') openRejectModal !: ElementRef;
  setReasonOfRejectionMethodCall(){
    debugger
    this.dataService.setReasonOfRejection(this.userId, this.reasonOfRejectionProfile)
    .subscribe(
      (response: ReasonOfRejectionProfile) => { 
        // console.log('Response:', response);
      
      },
      (error) => {
        // console.error('Error occurred:', error);
        
      }
    );
}

formatDateIn(newdate:any) {
  const date = new Date(newdate);
  const formattedDate = this.datePipe.transform(date, 'ddMMMM, yyyy');
  return formattedDate;
}

// calculateDateDifferenceDuration(endDate:any, startDate:any){
//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//     const millisecondsDifference = end.getTime() - start.getTime();
//     const yearsDifference = millisecondsDifference / (1000 * 60 * 60 * 24 * 365.25);
//     return Math.floor(yearsDifference);
//   }else{
//     return null;
//   }
// }


calculateDateDifferenceDuration(endDate:any, startDate:any) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    const yearDiff = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();

    let result = '';

    if (yearDiff > 0) {
      result += `${yearDiff} year${yearDiff === 1 ? '' : 's'}`;
    }

    if (monthDiff > 0) {
      if (yearDiff > 0) {
        result += ' ';
      }
      result += `${monthDiff === 1 ? monthDiff + ' month' : monthDiff + ' months'}`;
    }
    return result.trim() || 'N/A';
  } else {
    return null;
  }
}




sendStatusResponseMailToUser(userUuid:string, requestString:string) {
  this.dataService.statusResponseMailToUser(userUuid, requestString).subscribe(
    (data) => {
    //  console.log("mail send successfully");
    
     this.helperService.showToast("Mail Send Successfully", Key.TOAST_STATUS_SUCCESS);
     this.getUserByUuid();
     this.closeRejectModalButton.nativeElement.click();

     if(requestString=="APPROVED"){
     this.toggle = false;
     }
     if(requestString=="REJECTED"){
     this.approvedToggle=false;
     }
     
    },
    (error) => {
      this.helperService.showToast(error.message, Key.TOAST_STATUS_SUCCESS);
    }
  );
}

}
