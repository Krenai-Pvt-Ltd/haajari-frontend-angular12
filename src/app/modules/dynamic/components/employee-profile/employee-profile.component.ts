import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import * as moment from 'moment';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DataService } from 'src/app/services/data.service';
import { Subject } from 'rxjs';
import { UserLeaveRequest } from 'src/app/models/user-leave-request';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
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
import { UserDocumentsAsList } from 'src/app/models/UserDocumentsMain';
import { TaxRegime } from 'src/app/models/tax-regime';
import { StatutoryResponse } from 'src/app/models/statutory-response';
import { Statutory } from 'src/app/models/statutory';
import { StatutoryRequest } from 'src/app/models/statutory-request';
import { StatutoryAttribute } from 'src/app/models/statutory-attribute';
import { ESIContributionRate } from 'src/app/models/e-si-contribution-rate';
import { PFContributionRate } from 'src/app/models/p-f-contribution-rate';
import { StatutoryAttributeResponse } from 'src/app/models/statutory-attribute-response';
import { UserExperienceDetailRequest } from 'src/app/models/user-experience-detail-request';
import { EmployeeExperienceComponent } from 'src/app/modules/employee-onboarding/employee-experience/employee-experience.component';
import { EmployeeAdditionalDocument } from 'src/app/models/employee-additional-document';
import { OnboardingFormPreviewResponse } from 'src/app/models/onboarding-form-preview-response';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { UserExperience } from 'src/app/models/user-experience';
import { TotalExperiences } from 'src/app/models/total-experiences';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css'],
})
export class EmployeeProfileComponent implements OnInit {
  reasonOfRejectionProfile: ReasonOfRejectionProfile =
    new ReasonOfRejectionProfile();
  userAddressDetailsRequest: UserAddressDetailsRequest =
    new UserAddressDetailsRequest();
  userExperienceDetailRequest: UserExperienceDetailRequest =
    new UserExperienceDetailRequest();
  userLeaveForm!: FormGroup;
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  ROLE: any;
  UUID: any;
  hideDetailsFlag: boolean = false;
  adminRoleFlag: boolean = false;
  userRoleFlag: boolean = false;
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
    public location: Location,
    public sanitize: DomSanitizer,
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }

    {
      this.userLeaveForm = this.fb.group({
        startDate: ['', Validators.required],
        endDate: [''],
        leaveType: ['', Validators.required],
        managerId: ['', Validators.required],
        optNotes: ['', Validators.required],
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
    return this.userLeaveForm.get('startDate');
  }
  get EndDate() {
    return this.userLeaveForm.get('endDate');
  }
  get LeaveType() {
    return this.userLeaveForm.get('leaveType');
  }
  get ManagerId() {
    return this.userLeaveForm.get('managerId');
  }
  get OptNotes() {
    return this.userLeaveForm.get('optNotes');
  }

  events: any[] = [];

  viewDate: Date = new Date();
  selected: { startDate: moment.Moment; endDate: moment.Moment } = {
    startDate: moment(this.viewDate).startOf('month'),
    endDate: moment(this.viewDate).endOf('month'),
  };

  userId: any;
  newDate: string = '';
  count: number = 0;

  ADMIN = Key.ADMIN;
  MANAGER = Key.MANAGER;
  USER = Key.USER;

  isSalaryPlaceholderFlag: boolean = false;
  // tokenUserRoleFlag:boolean=false;
  currentDate: Date = new Date();
  currentNewDate: any;
  async ngOnInit(): Promise<void> {
    this.getOnboardingFormPreviewMethodCall();
    this.getAllTaxRegimeMethodCall();
    this.getStatutoryByOrganizationIdMethodCall();
    this.getSalaryConfigurationStepMethodCall();

    this.ROLE = await this.roleService.getRole();
    this.UUID = await this.roleService.getUuid();

    if (this.ROLE == this.ADMIN) {
      this.adminRoleFlag = true;
    }
    // if(this.ROLE==this.USER){
    //   this.tokenUserRoleFlag==true;
    // }
    if (this.userId == this.UUID) {
      this.userRoleFlag = true;
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
    this.endDateStr = moment(new Date()).format('YYYY-MM-DD');
    this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);
    this.fetchManagerNames();
    this.getUserByUuid();
    this.getManagerBoolean();
    this.getEmployeeAdressDetailsByUuid();
    this.getEmployeeExperiencesDetailsByUuid();
    this.getEmployeeAcademicDetailsByUuid();
    this.getEmployeeContactsDetailsByUuid();
    this.getEmployeeBankDetailsByUuid();
    this.getEmployeeDocumentsDetailsByUuid();
    this.getUserLeaveReq();
    this.getUserLeaveLogByUuid();
    this.getTotalExperiences();
  }

  getRoleData() {
    //  const managerDetails =localStorage.getItem('managerFunc');
    // if(managerDetails !== null){
    //   const managerFunc = JSON.parse(managerDetails);

    if (this.userId != this.UUID && this.ROLE == this.MANAGER) {
      this.hideDetailsFlag = true;
    } else {
      this.hideDetailsFlag = false;
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
      },
    );
  }

  user: any = {};
  isImage: boolean = false;

  getUserByUuid() {
    this.dataService.getUserByUuid(this.userId).subscribe(
      (data) => {
        this.user = data;

        if (constant.EMPTY_STRINGS.includes(this.user.image)) {
          this.isImage = false;
        } else {
          this.isImage = true;
        }

        this.count++;
      },
      (error) => {
        this.isImage = false;
        this.count++;
      },
    );
  }

  toggle = false;
  approvedToggle = false;
  @ViewChild('closeRejectModalButton') closeRejectModalButton!: ElementRef;
  updateStatusUserByUuid(type: string) {
    if (type == 'REJECTED') {
      this.toggle = true;
      this.setReasonOfRejectionMethodCall();
      if (this.requestForMoreDocs == true) {
        type = 'REQUESTED';
        this.approvedToggle = false;

        // this.toggle = false;
      }
    } else if (type == 'APPROVED') {
      this.approvedToggle = true;
    }

    this.dataService.updateStatusUser(this.userId, type).subscribe(
      (data) => {
        this.closeRejectModalButton.nativeElement.click();
        // console.log('status updated:' + type);
        this.sendStatusResponseMailToUser(this.userId, type);
        this.reasonOfRejectionProfile = new ReasonOfRejectionProfile();
        this.toggle = false;

        // location.reload();
        // location.reload();
      },
      (error) => {},
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
  userAttendanceDetailDateWise: {
    checkInTime: string;
    checkOutTime: string;
    totalWorkingHours: string;
    breakCount: string;
    breakDuration: string;
    createdDate: string;
    status: string;
  } = {
    checkInTime: '',
    checkOutTime: '',
    totalWorkingHours: '',
    breakCount: '',
    breakDuration: '',
    createdDate: '',
    status: '',
  };
  attendanceDetailModalToggle: boolean = false;
  clientX: string = '0px';
  clientY: string = '0px';
  openModal(mouseEnterInfo: any): void {
    debugger;
    if (!this.attendanceDetailModalToggle) {
      // console.log("events : ", mouseEnterInfo.event);
      this.userAttendanceDetailDateWise.checkInTime = '';
      this.userAttendanceDetailDateWise.checkOutTime = '';
      this.userAttendanceDetailDateWise.breakCount = '';
      this.userAttendanceDetailDateWise.breakDuration = '';
      this.userAttendanceDetailDateWise.totalWorkingHours = '';
      this.userAttendanceDetailDateWise.createdDate = '';
      this.userAttendanceDetailDateWise.status = '';
      this.userAttendanceDetailDateWise.checkInTime =
        mouseEnterInfo.event._def.extendedProps.checkInTime;
      this.userAttendanceDetailDateWise.checkOutTime =
        mouseEnterInfo.event._def.extendedProps.checkOutTime;
      this.userAttendanceDetailDateWise.breakCount =
        mouseEnterInfo.event._def.extendedProps.breakCount;
      this.userAttendanceDetailDateWise.breakDuration =
        mouseEnterInfo.event._def.extendedProps.breakDuration;
      this.userAttendanceDetailDateWise.totalWorkingHours =
        mouseEnterInfo.event._def.extendedProps.totalWorkingHours;
      this.userAttendanceDetailDateWise.createdDate =
        mouseEnterInfo.event._def.extendedProps.createdDate;
      this.userAttendanceDetailDateWise.status =
        mouseEnterInfo.event._def.extendedProps.status;
      // console.log("totalworkinghour :" + this.userAttendanceDetailDateWise.totalWorkingHours);
      var rect = mouseEnterInfo.el.getBoundingClientRect();
      this.clientX = rect.left - 210 + 'px';
      this.clientY = rect.top - 100 + 'px';
      console.log(
        'mouse location:',
        mouseEnterInfo.jsEvent.clientX,
        mouseEnterInfo.jsEvent.clientY,
      );
      this.openEventsModal.nativeElement.click();
    }
  }

  closeAttendanceModal() {
    this.attendanceDetailModalToggle = false;
    this.closeAttendanceDetailModalButton.nativeElement.click();
  }

  // eventMouseEnter(mouseEnterInfo: any): void {
  //   const event = mouseEnterInfo.event;
  //   const date = mouseEnterInfo.date;
  //   this.openModal(mouseEnterInfo);
  // }
  @ViewChild('closeAttendanceDetailModalButton')
  closeAttendanceDetailModalButton!: ElementRef;
  mouseLeaveInfo(mouseEnterInfo: any): void {
    debugger;
    this.closeAttendanceModal();
  }

  // });
  getUserAttendanceDataFromDate(sDate: string, eDate: string): void {
    debugger;
    this.dataService
      .getUserAttendanceDetailsByDateDuration(this.userId, 'USER', sDate, eDate)
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
              var tempEvent: { title: string; date: string; color: string } = {
                title: title,
                date: date,
                color: color,
              };
              this.events.push(tempEvent);

              currentDate.add(1, 'days');

              this.calendarOptions = {
                plugins: [dayGridPlugin],
                initialView: 'dayGridMonth',
                weekends: true,
                events: this.events,
                eventClick: this.openModal.bind(this),
                eventMouseEnter: this.openModal.bind(this),
                eventMouseLeave: this.mouseLeaveInfo.bind(this),
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
              const attendance = this.attendances[i];
              let title = this.getStatusTitle(attendance);
              let color = this.getStatusColor(attendance.status);
              if (
                attendance.status == 'Present' ||
                attendance.status == 'Half Day' ||
                attendance.status == 'Late'
              ) {
                this.totalPresent++;
              } else if (attendance.status == 'Absent') {
                this.totalAbsent++;
              }
              const date = moment(this.attendances[i].createdDate).format(
                'YYYY-MM-DD',
              );

              var tempEvent2 = {
                title: title,
                date: date,
                color: color,
                checkInTime: attendance.checkInTime,
                checkOutTime: attendance.checkOutTime,
                breakCount: attendance.breakCount,
                breakDuration: attendance.totalBreakHours,
                totalWorkingHours: attendance.totalWorkingHours,
                createdDate: attendance.createdDate,
                status: attendance.status,
              };
              this.events.push(tempEvent2);
            }
          }

          this.updateCalendarOptions();
          //   let title = '';

          //   if((date == moment(new Date()).format('YYYY-MM-DD')) && (this.attendances[i].checkInTime==null)){
          //     title == '-';
          //   } else {
          //   title = this.attendances[i].checkInTime != null ? 'P' : 'A';
          //   if (title == 'Present') {
          //     this.totalPresent++;
          //   } else if (title == 'Absent') {
          //     this.totalAbsent++;
          //   }
          // }

          //   var checkInTime = this.attendances[i].checkInTime;
          //   var checkOutTime = this.attendances[i].checkOutTime;
          //   var breakCount = this.attendances[i].breakCount;
          //   var breakDuration = this.attendances[i].totalBreakHours;
          //   var totalWorkingHours = this.attendances[i].totalWorkingHours;
          //   var createdDate = this.attendances[i].createdDate
          //   var color = title == 'Present' ? '#e0ffe0' : title == 'Absent' ? '#f8d7d7' : '';
          //   var tempEvent2: { title: string, date: string, color: string, checkInTime:any, checkOutTime:any, breakCount:any, breakDuration:any, totalWorkingHours:any, createdDate:any} = { title: title, date: date, color: color,checkInTime:checkInTime, checkOutTime:checkOutTime, breakCount:breakCount, breakDuration:breakDuration, totalWorkingHours:totalWorkingHours, createdDate:createdDate };
          //   this.events.push(tempEvent2);

          // if (i == this.attendances.length - 1) {
          //   this.calendarOptions = {
          //     plugins: [dayGridPlugin],
          //     initialView: 'dayGridMonth',
          //     weekends: true,
          //     events: this.events,
          //     eventClick: this.openModal.bind(this),
          //     eventMouseEnter: this.openModal.bind(this),
          //     eventMouseLeave:this.mouseLeaveInfo.bind(this)

          //   };
          // }

          //   }
          // }

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
        },
      );
  }

  updateCalendarOptions(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      weekends: true,
      events: this.events,
      eventClick: this.openModal.bind(this),
      eventMouseEnter: this.openModal.bind(this),
      eventMouseLeave: this.mouseLeaveInfo.bind(this),
    };
  }

  getStatusTitle(attendance: { status: string }): string {
    if (attendance.status === 'Present') {
      return 'P';
    } else if (attendance.status === 'Absent') {
      return 'A';
    } else if (attendance.status === 'Weekly Holiday') {
      return 'W';
    } else if (attendance.status === 'Universal Holiday') {
      return 'h';
    } else if (attendance.status === 'Custom Holiday') {
      return 'h';
    } else if (attendance.status === 'On Leave') {
      return 'L';
    } else if (attendance.status === 'Half Day') {
      return 'H';
    } else if (attendance.status === 'Late') {
      return 'l';
    } else if (attendance.status === 'Not Marked') {
      return '-';
    }
    return '';
  }

  getStatusColor(status: any): string {
    switch (status) {
      case 'Present':
        return '#e0ffe0';
      case 'Absent':
        return '#f8d7d7';
      case 'Weekly Holiday':
        return '#c6c6ff';
      case 'Universal Holiday':
        return '#f06d0640';
      case 'Custom Holiday':
        return '#f06d0640';
      case 'Half Day':
        return 'rgb(255, 213, 128)';
      case 'On Leave':
        return 'rgb(255, 255, 143)';
      case 'Late':
        return '#D3D3D3';
      case 'Not Marked':
        return '#cccccc';
      default:
        return '#ffffff';
    }
  }

  // getStatusColor(status: any): string {
  //   switch (status) {
  //     case 'Present':
  //       return '#e0ffe0';
  //     case 'Absent':
  //       return '#f8d7d7';
  //     case 'Weekly Holiday':
  //       return '#c6c6ff';
  //     case 'Universal Holiday':
  //       return '#f06d0640';
  //     case 'Custom Holiday':
  //       return '#f06d0640';
  //     case 'Half Day':
  //       return 'blue';
  //     case 'On Leave':
  //       return 'skyblue';
  //     case 'Not Marked':
  //       return '#cccccc';
  //     default:
  //       return '#ffffff';
  //   }
  // }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: [this.events],
    eventClick: this.openModal.bind(this),
    eventMouseEnter: this.openModal.bind(this),
    eventMouseLeave: this.mouseLeaveInfo.bind(this),
  };

  forwordFlag: boolean = false;

  goforward() {
    debugger;
    const calendarApi = this.calendarComponent.getApi();

    calendarApi.next();
    this.changeForwardButtonVisibilty(calendarApi);

    let startDate = calendarApi.view.currentStart;
    let endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    );

    this.startDateStr = moment(startDate).format('YYYY-MM-DD');
    if (endDate.getMonth() == new Date().getMonth()) {
      this.endDateStr = moment(new Date()).format('YYYY-MM-DD');
    } else {
      this.endDateStr = moment(endDate).format('YYYY-MM-DD');
    }
    this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);
  }

  changeForwardButtonVisibilty(calendarApi: any) {
    debugger;
    var enrolmentDate = new Date(this.prevDate);
    if (calendarApi?.getDate().getFullYear() != new Date().getFullYear()) {
      this.forwordFlag = true;
    } else if (
      calendarApi.getDate().getFullYear() == new Date().getFullYear()
    ) {
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
    debugger;
    const calendarApi = this.calendarComponent.getApi();
    var date = new Date(this.prevDate);
    var month = date.getMonth();
    // console.log("month" + month);

    calendarApi.prev();
    this.changeForwardButtonVisibilty(calendarApi);

    let startDate = calendarApi.view.currentStart;
    let endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    );

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
    let endDate = moment(new Date()).format('YYYY-MM-DD');

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
      new Set(attendances.map((a) => a.createdDate)),
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

  @ViewChild('requestLeaveCloseModel')
  requestLeaveCloseModel!: ElementRef;

  // @ViewChild('userLeaveForm') userLeaveForm: NgForm;

  resetUserLeave() {
    this.userLeaveRequest.startDate = new Date();
    this.userLeaveRequest.endDate = new Date();
    this.userLeaveRequest.halfDayLeave = false;
    this.userLeaveRequest.dayShift = false;
    this.userLeaveRequest.eveningShift = false;
    this.userLeaveRequest.leaveType = '';
    this.userLeaveRequest.managerId = 0;
    this.userLeaveRequest.optNotes = '';
    this.selectedManagerId = 0;
  }
  @ViewChild(FormGroupDirective)
  formGroupDirective!: FormGroupDirective;
  submitLeaveLoader: boolean = false;

  saveLeaveRequestUser() {
    debugger;
    this.userLeaveRequest.managerId = this.selectedManagerId;
    this.userLeaveRequest.dayShift = this.dayShiftToggle;
    this.userLeaveRequest.eveningShift = this.eveningShiftToggle;
    this.submitLeaveLoader = true;
    // this.userLeaveRequest.halfDayLeave = false;
    this.dataService
      .saveLeaveRequest(this.userId, this.userLeaveRequest)
      .subscribe(
        (data) => {
          // console.log(data);
          // console.log(data.body);
          this.submitLeaveLoader = false;
          this.isLeavePlaceholder = false;
          this.getUserLeaveReq();
          this.resetUserLeave();
          this.formGroupDirective.resetForm();
          this.getUserLeaveLogByUuid();
          this.requestLeaveCloseModel.nativeElement.click();
          // location.reload();
        },
        (error) => {
          this.submitLeaveLoader = false;
          // console.log(error.body);
        },
      );
  }

  dayShiftToggle: boolean = false;
  eveningShiftToggle: boolean = false;

  dayShiftToggleFun(shift: string) {
    if (shift == 'day') {
      this.dayShiftToggle = true;
      this.eveningShiftToggle = false;
    } else if (shift == 'evening') {
      this.eveningShiftToggle = true;
      this.dayShiftToggle == false;
    }
    // console.log("day" + this.dayShiftToggle + "evening" + this.eveningShiftToggle);
  }

  halfDayLeaveShiftToggle: boolean = false;

  halfLeaveShiftToggle() {
    this.halfDayLeaveShiftToggle =
      this.halfDayLeaveShiftToggle == true ? false : true;
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
        if (
          data.body != undefined ||
          data.body != null ||
          data.body.length != 0
        ) {
          this.userLeave = data.body;
        } else {
          this.leaveCountPlaceholderFlag = true;
          return;
        }
        this.count++;
      },
      (error) => {
        this.count++;
      },
    );
  }

  selectedStatus!: string;
  selectStatusFlag: boolean = false;
  isLeaveErrorPlaceholder: boolean = false;
  getUserLeaveLogByUuid() {
    debugger;
    this.isLeaveShimmer = true;
    // this.selectStatusFlag=true;

    if (this.selectedStatus && this.selectedStatus != 'ALL') {
      console.log('selectedStatus :' + this.selectedStatus);
      this.dataService
        .getUserLeaveLogByStatus(this.userId, this.selectedStatus)
        .subscribe(
          (data) => {
            this.userLeaveLog = data;
            this.isLeaveShimmer = false;
            this.isLeavePlaceholder = !data || data.length === 0;
            this.count++;
          },
          (error) => {
            this.isLeaveShimmer = false;
            this.count++;
          },
        );
    } else {
      console.log('selectedStatus :' + this.selectedStatus);
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
        },
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
        // console.log('manager :' + this.managers[2].id);
      },
      (error) => {
        this.count++;
      },
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
    return daysDifference + 1;
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
      },
    );
  }

  isFresher: boolean = false;
  experienceEmployee: any;
  isCompanyPlaceholder: boolean = false;
  getEmployeeExperiencesDetailsByUuid() {
    this.dataService.getEmployeeExperiencesDetails(this.userId).subscribe(
      (data: UserExperienceDetailRequest) => {
        this.experienceEmployee = data;

        if (this.experienceEmployee[0].fresher == true) {
          this.isFresher = this.experienceEmployee[0].fresher;
        }
        console.log('experience length' + this.experienceEmployee.length);
        if (data == undefined || data == null || data.experiences.length == 0) {
          this.isCompanyPlaceholder = true;
        }
        this.count++;
      },
      (error) => {
        this.count++;
        this.isCompanyPlaceholder = true;
      },
    );
  }

  academicEmployee: any;
  isAcademicPlaceholder: boolean = false;

  getEmployeeAcademicDetailsByUuid() {
    this.dataService.getEmployeeAcademicDetails(this.userId).subscribe(
      (data) => {
        if (data != null || data != undefined) {
          this.academicEmployee = data;
        } else {
          this.isAcademicPlaceholder = true;
        }
        this.count++;
      },
      (error) => {
        this.count++;
        this.isAcademicPlaceholder = true;
      },
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
      },
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
      },
    );
  }

  isDocsPlaceholder: boolean = false;
  documentsEmployee: UserDocumentsAsList[] = [];
  highSchoolCertificate: string = '';
  degreeCert: string = '';
  intermediateCertificate: string = '';
  testimonialsString: string = '';
  aadhaarCardString: string = '';
  pancardString: string = '';
  // isDocumentsShimmer:boolean=false;
  getEmployeeDocumentsDetailsByUuid() {
    debugger;
    // this.isDocumentsShimmer=true;
    this.dataService.getEmployeeDocumentAsList(this.userId).subscribe(
      (data) => {
        this.documentsEmployee = data;
        this.mapDocumentUrls();
        // if (data.userDocuments != null) {
        //   this.highSchoolCertificate = data.userDocuments.secondarySchoolCertificate;
        //   this.degreeCert = data.userDocuments.highestQualificationDegree;
        //   this.intermediateCertificate = data.userDocuments.highSchoolCertificate;
        //   this.testimonialsString = data.userDocuments.testimonialReccomendation;
        //   this.aadhaarCardString = data.userDocuments.aadhaarCard;
        //   this.pancardString = data.userDocuments.pancard;
        // }
        // this.isDocumentsShimmer=false;
        if (this.documentsEmployee.length == 0) {
          this.isDocsPlaceholder = true;
        }

        this.count++;
      },
      (error) => {
        this.count++;
        this.isDocsPlaceholder = true;
        // this.isDocumentsShimmer=false;
      },
    );
  }

  private mapDocumentUrls() {
    for (let doc of this.documentsEmployee) {
      switch (doc.documentName) {
        case 'highSchool':
          this.highSchoolCertificate = doc.documentUrl;
          break;
        case 'highestQualification':
          this.degreeCert = doc.documentUrl;
          break;
        case 'secondarySchool':
          this.intermediateCertificate = doc.documentUrl;
          break;
        case 'testimonial':
          this.testimonialsString = doc.documentUrl;
          break;
        case 'aadhaarCard':
          this.aadhaarCardString = doc.documentUrl;
          break;
        case 'pancard':
          this.pancardString = doc.documentUrl;
          break;
      }
    }
  }

  // #################################################################333333
  capitalizeFirstLetter(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return name;
  }

  selectStatus(status: string): void {
    if (status == '') {
      this.selectedStatus = 'ALL';
      this.isLeavePlaceholder = false;
      this.getUserLeaveLogByUuid();
    } else {
      this.selectedStatus = status;
      this.getUserLeaveLogByUuid();
    }
  }

  transform(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  previewString: SafeResourceUrl = '';
  downloadString!: string;
  nextOpenDocString!: string;
  nextOpenDocName!: string;
  hideNextButton: boolean = false;
  @ViewChild('openViewModal') openViewModal!: ElementRef;
  openPdfModel(viewString: string, docsName: string) {
    debugger;
    this.nextOpenDocName = docsName;
    this.downloadString = viewString;
    this.previewString =
      this.sanitize.bypassSecurityTrustResourceUrl(viewString);
    // if (viewString == "highSchool") {
    //   this.previewString = this.highSchoolCertificate;
    // } else if (viewString == "highestQualification") {
    //   this.previewString = this.degreeCert;
    // } else if (viewString == "secondarySchool") {
    //   this.previewString = this.intermediateCertificate;
    // } else if (viewString == "testimonial") {
    //   this.previewString = this.testimonialsString;
    // } else if (viewString == "aadhaarCard") {
    //   this.previewString = this.aadhaarCardString;
    // } else if (viewString == "pancard") {
    //   this.previewString = this.pancardString;
    // }
    this.updateFileType(viewString);

    switch (docsName) {
      case 'highSchool':
        // if (this.documentsEmployee.length == 4) {
        //   this.hideNextButton = true;
        // } else {
        //   this.hideNextButton = false;
        // }
        if (this.intermediateCertificate != '') {
          this.hideNextButton = false;
          this.nextOpenDocString = this.intermediateCertificate;
          this.nextOpenDocName = 'secondarySchool';
        } else {
          this.hideNextButton = true;
        }
        break;
      case 'highestQualification':
        // if (this.documentsEmployee.length == 3) {
        //   this.hideNextButton = true;
        // } else {
        //   this.hideNextButton = false;
        // }
        if (this.highSchoolCertificate != '') {
          this.hideNextButton = false;
          this.nextOpenDocString = this.highSchoolCertificate;
          this.nextOpenDocName = 'highSchool';
        } else {
          this.hideNextButton = true;
        }
        break;
      case 'secondarySchool':
        // if (this.documentsEmployee.length == 5) {
        //   this.hideNextButton = true;
        // } else {
        //   this.hideNextButton = false;
        // }
        if (this.testimonialsString != '') {
          this.hideNextButton = false;
          this.nextOpenDocString = this.testimonialsString;
          this.nextOpenDocName = 'testimonial';
        } else {
          this.hideNextButton = true;
        }
        break;
      case 'testimonial':
        // if (this.documentsEmployee.length == 6) {
        //   this.hideNextButton = true;
        // } else {
        //   this.hideNextButton = false;
        // }
        if (this.pancardString != '') {
          this.hideNextButton = false;
          this.nextOpenDocString = this.pancardString;
          this.nextOpenDocName = 'pancard';
        } else {
          this.hideNextButton = true;
        }
        break;
      case 'aadhaarCard':
        // if (this.documentsEmployee.length == 2) {
        //   this.hideNextButton = true;
        // } else {
        //   this.hideNextButton = false;
        // }
        if (this.degreeCert != '') {
          this.hideNextButton = false;
          this.nextOpenDocString = this.degreeCert;
          this.nextOpenDocName = 'highestQualification';
        } else {
          this.hideNextButton = true;
        }
        break;
      case 'pancard':
        // if (this.documentsEmployee.length == 1) {
        //   this.hideNextButton = true;
        // } else {
        //   this.hideNextButton = false;
        // }
        if (this.aadhaarCardString != '') {
          this.hideNextButton = false;
          this.nextOpenDocString = this.aadhaarCardString;
          this.nextOpenDocName = 'aadhaarCard';
        } else {
          this.hideNextButton = true;
        }
        break;
    }

    this.openViewModal.nativeElement.click();
  }

  isImage2: boolean = false;
  isPDF: boolean = false;

  private updateFileType(url: string) {
    const extension = url.split('?')[0].split('.').pop()?.toLowerCase();
    this.isImage2 = ['png', 'jpg', 'jpeg', 'gif'].includes(extension!);
    this.isPDF = extension === 'pdf';
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
    var splittedUrl = imageUrl.split(
      '/firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/',
    );

    if (splittedUrl.length < 2) {
      // console.error('Invalid image URL format');
      return;
    }

    splittedUrl = splittedUrl[1].split('?alt');
    splittedUrl = splittedUrl[0].replace('https://', '');
    splittedUrl = decodeURIComponent(splittedUrl);

    this.firebaseStorage.storage
      .ref(splittedUrl)
      .getDownloadURL()
      .then((url: any) => {
        // This can be downloaded directly:
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          blob = xhr.response;
          saveAs(blob, 'Docs');
        };
        xhr.open('GET', url);
        xhr.send();
      })
      .catch((error: any) => {
        // Handle any errors
      });
  }

  // ########################

  InOutLoader: boolean = false;

  checkinCheckout(command: string) {
    this.InOutLoader = true;
    this.dataService.checkinCheckoutInSlack(this.userId, command).subscribe(
      (data) => {
        this.InOutLoader = false;
        this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);
        this.getUserAttendanceStatus();
        this.helperService.showToast(data.message, Key.TOAST_STATUS_SUCCESS);
      },
      (error) => {
        this.InOutLoader = false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);

        // this.getUserAttendanceStatus();
        // if(command==="/inn"){
        // this.getUserAttendanceDataFromDate(this.startDateStr, this.endDateStr);
        // }
      },
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
      },
    );
  }

  @ViewChild('openRejectModal') openRejectModal!: ElementRef;
  setReasonOfRejectionMethodCall() {
    debugger;
    this.dataService
      .setReasonOfRejection(this.userId, this.reasonOfRejectionProfile)
      .subscribe(
        (response: ReasonOfRejectionProfile) => {
          // console.log('Response:', response);
        },
        (error) => {
          // console.error('Error occurred:', error);
        },
      );
  }

  formatDateIn(newdate: any) {
    const date = new Date(newdate);
    const formattedDate = this.datePipe.transform(date, 'dd MMMM, yyyy');
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

  calculateDateDifferenceDuration(endDate: any, startDate: any) {
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

  sendStatusResponseMailToUser(userUuid: string, requestString: string) {
    this.dataService
      .statusResponseMailToUser(userUuid, requestString)
      .subscribe(
        (data) => {
          //  console.log("mail send successfully");

          this.helperService.showToast(
            'Mail Sent Successfully',
            Key.TOAST_STATUS_SUCCESS,
          );
          this.getUserByUuid();
          //  this.closeRejectModalButton.nativeElement.click();

          if (requestString == 'APPROVED') {
            this.toggle = false;
          }
          if (requestString == 'REJECTED') {
            this.approvedToggle = false;
          }
        },
        (error) => {
          this.helperService.showToast(error.message, Key.TOAST_STATUS_SUCCESS);
        },
      );
  }

  requestForMoreDocs: boolean = false;
  requestUserForMoreDocs() {
    this.openRejectModal.nativeElement.click();
    this.requestForMoreDocs = true;
  }

  // #####################################################################
  //Code written by Shivendra

  clearInputValues() {
    this.statutoryAccountNumber = '';
  }

  isFormValid: boolean = false;
  @ViewChild('ePFForm') ePFForm!: NgForm;

  EPF_ID = Key.EPF_ID;
  ESI_ID = Key.ESI_ID;
  PROFESSIONAL_TAX_ID = Key.PROFESSIONAL_TAX_ID;

  CONFIGURE_SALARY_SETTING = Key.CONFIGURE_SALARY_SETTING;
  MANAGE_STATUTORY = Key.MANAGE_STATUTORY;
  PAY_SLIP = Key.PAY_SLIP;

  switchValueForPF = false;
  switchValueForESI = false;
  switchValueForProfessionalTax = false;
  setStatutoryVariablesToFalse() {
    this.switchValueForPF = false;
    this.switchValueForESI = false;
    this.switchValueForProfessionalTax = false;
  }

  salaryConfigurationStepId: number = 0;
  getSalaryConfigurationStepMethodCall() {
    this.dataService.getSalaryConfigurationStep().subscribe(
      (response) => {
        this.salaryConfigurationStepId = response.count;
      },
      (error) => {},
    );
  }

  //Fetching the PF contribution rates from the database
  pFContributionRateList: PFContributionRate[] = [];
  getPFContributionRateMethodCall() {
    this.dataService.getPFContributionRate().subscribe(
      (response) => {
        this.pFContributionRateList = response.listOfObject;
        console.log(response.listOfObject);
      },
      (error) => {},
    );
  }

  eSIContributionRateList: ESIContributionRate[] = [];
  getESIContributionRateMethodCall() {
    this.dataService.getESIContributionRate().subscribe(
      (response) => {
        this.eSIContributionRateList = response.listOfObject;
      },
      (error) => {},
    );
  }

  updateTaxRegimeByUserIdMethodCall(taxRegimeId: number) {
    this.dataService.updateTaxRegimeByUserId(taxRegimeId).subscribe(
      (response) => {
        this.helperService.showToast(
          response.message,
          Key.TOAST_STATUS_SUCCESS,
        );
        this.getAllTaxRegimeMethodCall();
      },
      (error) => {
        this.helperService.showToast(
          'Error in updating tax regime!',
          Key.TOAST_STATUS_ERROR,
        );
      },
    );
  }

  taxRegimeList: TaxRegime[] = [];
  getAllTaxRegimeMethodCall() {
    this.dataService.getAllTaxRegime().subscribe(
      (response) => {
        this.taxRegimeList = response.listOfObject;
      },
      (error) => {},
    );
  }

  statutoryResponseList: StatutoryResponse[] = [];
  getStatutoryByOrganizationIdMethodCall() {
    debugger;
    this.dataService.getStatutoryByOrganizationId().subscribe(
      (response) => {
        this.statutoryResponseList = response.listOfObject;
        this.setStatutoryVariablesToFalse();
        console.log(this.statutoryResponseList);
        this.clearInputValues();
      },
      (error) => {},
    );
  }

  //Fetching statutory's attributes
  statutoryAttributeResponseList: StatutoryAttributeResponse[] = [];
  getStatutoryAttributeByStatutoryIdMethodCall(statutoryId: number) {
    return new Promise((resolve, reject) => {
      this.dataService
        .getStatutoryAttributeByStatutoryId(statutoryId)
        .subscribe(
          (response) => {
            this.statutoryAttributeResponseList = response.listOfObject;
            console.log(response);
            resolve(response);
          },
          (error) => {
            reject(error);
          },
        );
    });
  }

  async clickSwitch(statutoryResponse: StatutoryResponse) {
    if (!statutoryResponse.loading) {
      statutoryResponse.loading = true;
    }

    await this.getStatutoryAttributeByStatutoryIdMethodCall(
      statutoryResponse.id,
    );

    this.statutoryRequest.id = statutoryResponse.id;
    this.statutoryRequest.name = statutoryResponse.name;
    this.statutoryRequest.switchValue = !statutoryResponse.switchValue;
    this.statutoryRequest.statutoryAttributeRequestList =
      this.statutoryAttributeResponseList;

    console.log(this.statutoryAttributeResponseList);

    if (statutoryResponse.switchValue === false) {
      if (statutoryResponse.id == this.EPF_ID) {
        this.switchValueForPF = true;
      } else if (statutoryResponse.id == this.ESI_ID) {
        this.switchValueForESI = true;
      } else if (statutoryResponse.id == this.PROFESSIONAL_TAX_ID) {
        this.switchValueForProfessionalTax = true;
      }
    } else {
      this.enableOrDisableStatutoryMethodCall();
    }
  }

  statutoryAccountNumber: string = '';
  statutoryRequest: StatutoryRequest = new StatutoryRequest();
  enableOrDisableStatutoryMethodCall() {
    this.statutoryRequest.statutoryAccountNumber = this.statutoryAccountNumber;
    this.dataService.enableOrDisableStatutory(this.statutoryRequest).subscribe(
      (response) => {
        this.setStatutoryVariablesToFalse();
        this.helperService.showToast(
          response.message,
          Key.TOAST_STATUS_SUCCESS,
        );
        this.getStatutoryByOrganizationIdMethodCall();
      },
      (error) => {
        this.helperService.showToast(
          error.error.message,
          Key.TOAST_STATUS_ERROR,
        );
        this.getStatutoryByOrganizationIdMethodCall();
      },
    );
  }

  BUTTON_LOADER = false;
  updateSalaryConfigurationStepMethodCall(salaryConfigurationStepId: number) {
    this.BUTTON_LOADER = true;
    this.dataService
      .updateSalaryConfigurationStep(salaryConfigurationStepId)
      .subscribe(
        (response) => {
          this.getSalaryConfigurationStepMethodCall();
          this.BUTTON_LOADER = false;
        },
        (error) => {
          this.BUTTON_LOADER = false;
        },
      );
  }

  goToManageStatutory() {
    this.salaryConfigurationStepId = this.MANAGE_STATUTORY;
    const configureSalarySettingDiv = document.getElementById(
      'configure-salary-setting',
    ) as HTMLInputElement | null;
    const manageStatutoryDiv = document.getElementById(
      'manage-statutory',
    ) as HTMLInputElement | null;

    if (configureSalarySettingDiv) {
      configureSalarySettingDiv.style.display = 'none';

      if (manageStatutoryDiv) {
        manageStatutoryDiv.style.display = 'block';
      }
    }
  }

  secondarySchoolCertificateFileName: string = '';
  highSchoolCertificateFileName1: string = '';
  highestQualificationDegreeFileName1: string = '';
  testimonialReccomendationFileName1: string = '';
  aadhaarCardFileName: string = '';
  pancardFileName: string = '';
  companyLogoUrl: string = '';

  isLoading: boolean = true;
  // isFresher: boolean = false;
  isSchoolDocument: boolean = true;
  isHighSchoolDocument: boolean = true;
  onboardingPreviewData: OnboardingFormPreviewResponse =
    new OnboardingFormPreviewResponse();
  userEmergencyContactArray: UserEmergencyContactDetailsRequest[] = [];
  userExperienceArray: UserExperience[] = [];
  employeeAdditionalDocument: EmployeeAdditionalDocument[] = [];

  routeToUserDetails(routePath: string) {
    let navExtra: NavigationExtras = {
      queryParams: {
        userUuid: new URLSearchParams(window.location.search).get('userId'),
      },
    };
    this.router.navigate([routePath], navExtra);
  }

  getOnboardingFormPreviewMethodCall() {
    debugger;
    const userUuid =
      new URLSearchParams(window.location.search).get('userId') || '';
    if (userUuid) {
      this.dataService.getOnboardingFormPreview(userUuid).subscribe(
        (preview) => {
          console.log(preview);
          this.onboardingPreviewData = preview;
          if (preview.companyLogo) {
            this.companyLogoUrl = preview.companyLogo;
          }
          this.isLoading = false;
          this.handleOnboardingStatus(
            preview.user.employeeOnboardingStatus.response,
          );

          // if (preview.employeeAdditionalDocument && preview.employeeAdditionalDocument.length > 0) {
          this.employeeAdditionalDocument = preview.employeeAdditionalDocuments;
          console.log(this.employeeAdditionalDocument);
          // } else {
          //   console.log("eroor ")
          //     // Handle the case where employeeAdditionalDocument is undefined, null, or empty
          //     this.employeeAdditionalDocument = [];
          // }

          if (preview.userDocuments.secondarySchoolCertificate) {
            this.isSchoolDocument = false;
          }
          if (preview.userDocuments.highSchoolCertificate) {
            this.isHighSchoolDocument = false;
          }
          if (preview.userExperience) {
            this.userExperienceArray = preview.userExperience;
          }
          if (preview.fresher == true) {
            this.isFresher = true;
          }
          if (preview.userEmergencyContacts) {
            this.userEmergencyContactArray = preview.userEmergencyContacts;
          } else {
            console.log('No guarantor information available.');
            this.userEmergencyContactArray = [];
          }
          if (preview.userDocuments != null) {
            this.secondarySchoolCertificateFileName = this.getFilenameFromUrl(
              preview.userDocuments.secondarySchoolCertificate,
            );
            this.highSchoolCertificateFileName1 = this.getFilenameFromUrl(
              preview.userDocuments.highSchoolCertificate,
            );
            this.highestQualificationDegreeFileName1 = this.getFilenameFromUrl(
              preview.userDocuments.highestQualificationDegree,
            );
            this.testimonialReccomendationFileName1 = this.getFilenameFromUrl(
              preview.userDocuments.testimonialReccomendation,
            );
            this.aadhaarCardFileName = this.getFilenameFromUrl(
              preview.userDocuments.aadhaarCard,
            );
            this.pancardFileName = this.getFilenameFromUrl(
              preview.userDocuments.pancard,
            );
          }
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          this.userEmergencyContactArray = [];
        },
      );
    } else {
      console.error('User UUID not found');
      this.userEmergencyContactArray = [];
    }
  }

  getFilenameFromUrl(url: string): string {
    if (!url) return '';

    const decodedUrl = decodeURIComponent(url);

    const parts = decodedUrl.split('/');

    const filenameWithQuery = parts.pop() || '';

    const filename = filenameWithQuery.split('?')[0];

    const cleanFilename = filename.replace(/^\d+_/, '');
    return cleanFilename;
  }

  allowEdit = false;
  handleOnboardingStatus(response: string) {
    // this.displaySuccessModal = true;
    switch (response) {
      case 'REJECTED':
        this.allowEdit = true;
        break;
      case 'APPROVED':
      case 'PENDING':
        this.allowEdit = false;
        break;
      default:
        // this.displaySuccessModal = false;
        break;
    }
  }

  isManagerBoolean: boolean = false;
  getManagerBoolean() {
    this.dataService.getManagerBoolean(this.userId).subscribe(
      (data) => {
        this.isManagerBoolean = data;
      },
      (error) => {},
    );
  }

  totalExperiencesResponse: TotalExperiences | null = null;
  getTotalExperiences() {
    this.dataService.getTotalExperiences(this.userId).subscribe(
      (data: TotalExperiences) => {
        this.totalExperiencesResponse = data;
      },
      (error) => {
        console.error('Failed to fetch experiences', error);
      },
    );
  }

  getYearsFromExperience(experienceString?: string) {
    if (!experienceString) return '0';
    const yearMatch = experienceString.match(/(\d+)\s+years/);
    return yearMatch ? yearMatch[1] : '0';
  }

  getMonthsFromExperience(experienceString?: string) {
    if (!experienceString) return '0';
    const monthMatch = experienceString.match(/(\d+)\s+months/);
    return monthMatch ? monthMatch[1] : '0';
  }
}
