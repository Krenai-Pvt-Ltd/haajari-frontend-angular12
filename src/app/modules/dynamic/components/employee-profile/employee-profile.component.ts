import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import moment from 'moment';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DataService } from 'src/app/services/data.service';
import { UserLeaveRequest } from 'src/app/models/user-leave-request';
import { FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { AttendanceCheckTimeResponse, AttendanceTimeUpdateRequestDto, UserDto } from 'src/app/models/user-dto.model';
import { saveAs } from 'file-saver';
import { AngularFireStorage } from '@angular/fire/compat/storage';
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
import { StatutoryRequest } from 'src/app/models/statutory-request';
import { ESIContributionRate } from 'src/app/models/e-si-contribution-rate';
import { PFContributionRate } from 'src/app/models/p-f-contribution-rate';
import { StatutoryAttributeResponse } from 'src/app/models/statutory-attribute-response';
import { UserExperienceDetailRequest } from 'src/app/models/user-experience-detail-request';
import { EmployeeAdditionalDocument } from 'src/app/models/employee-additional-document';
import { OnboardingFormPreviewResponse } from 'src/app/models/onboarding-form-preview-response';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { UserExperience } from 'src/app/models/user-experience';
import { TotalExperiences } from 'src/app/models/total-experiences';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { EmployeeCompanyDocumentsRequest } from 'src/app/models/employee-company-documents-request';
import { SalaryTemplateComponentResponse } from 'src/app/models/salary-template-component-response';
import { AppraisalRequest } from 'src/app/models/appraisal-request';
import { BonusRequest } from 'src/app/models/bonus-request';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { EmployeePayslipResponse } from 'src/app/models/employee-payslip-response';
import { EmployeePayslipBreakupResponse } from 'src/app/models/employee-payslip-breakup-response';
import { EmployeePayslipDeductionResponse } from 'src/app/models/employee-payslip-deduction-response';
import { EmployeePayslipLogResponse } from 'src/app/employee-payslip-log-response';
import { LopReversalApplicationRequest } from 'src/app/models/lop-reversal-application-request';
import { OrganizationAssetResponse } from 'src/app/models/asset-category-respose';
import { EmployeeSuperCoinsResponse } from 'src/app/models/employee-super-coins-response';
import { DonateCoinsUserList, DonateSuperCoinsReasonResponse } from 'src/app/models/allocate-coins-role-wise-request';
import { OvertimeRequestDTO } from 'src/app/models/overtime-request-dto';
import { OvertimeRequestLogResponse } from 'src/app/models/overtime-request-log-response';
import { LopReversalApplicationResponse } from 'src/app/models/lop-reversal-application-response';
import { NzCalendarMode } from 'ng-zorro-antd/calendar';
import { AttendanceDetailDayWise } from 'src/app/models/attendance-detail-day-wise'
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { SalaryService } from 'src/app/services/salary.service';

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
  lopReversalApplicationRequestForm!: FormGroup;
  overtimeRequestForm!: FormGroup;
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  ROLE: any;
  UUID: any;
  hideDetailsFlag: boolean = false;
  adminRoleFlag: boolean = false;
  userRoleFlag: boolean = false;
  showPlaceholder: boolean = false;

  readonly key = Key;

  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
    private activateRoute: ActivatedRoute,
    public helperService: HelperService,
    private fb: FormBuilder,
    private firebaseStorage: AngularFireStorage,
    private router: Router,
    private roleService: RoleBasedAccessControlService,
    public location: Location,
    public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage,
    private sanitizer: DomSanitizer,
    private _salaryService : SalaryService
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
        userLeaveTemplateId:[''],
        halfDayLeave: [false],
        dayShift: [false],
        eveningShift: [false],
      });
    }

    this.donateCoinsForm = this.fb.group({
      userId: ['', Validators.required],
      coins: [null, [Validators.required, Validators.min(1)]],
      reason: [''],
      donationReason: ['']
    });


    Object.assign(this, { single: this.single });

    const currentDate = moment();
    this.startDate = currentDate.startOf('month').format('YYYY-MM-DD');
    this.endDate = currentDate.endOf('month').format('YYYY-MM-DD');
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

  @ViewChild("paySlipTab") paySlipTab !: ElementRef;
  goToPaySlipTab(){
    this.paySlipTab.nativeElement.click();
  }

  isSalaryPlaceholderFlag: boolean = false;
  // tokenUserRoleFlag:boolean=false;
  currentDate: Date = new Date();
  currentNewDate: any;
  async ngOnInit(): Promise<void> {
    this.activeTabs('attendance');
    window.scroll(0, 0);
    this.getExpenseType();
    this.getOrganizationRegistrationDateMethodCall();
    this.getOnboardingFormPreviewMethodCall();
    this.getAllTaxRegimeMethodCall();
    this.getStatutoryByOrganizationIdMethodCall();
    this.getSalaryConfigurationStepMethodCall();
    this.getSalaryTemplateComponentByUserUuidMethodCall();

    // this.getEmployeeCompanyDocumentsMethodCall();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
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
    // this.currentNewDate = moment(this.currentDate).format('yyyy-MM-DD');
    this.currentNewDate = moment(this.currentDate)
      .startOf('month')
      .format('YYYY-MM-DD');
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
this.endDateStr = firstDayOfMonth.endOf('month').format('YYYY-MM-DD');

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



    this.lopReversalApplicationRequestForm = this.fb.group({
      selectedDate: [null, Validators.required],
      daysCount: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      notes: [''],
      userUuid: ['']
    });
    this.getHrPolicy();


    // this.attendanceTimeUpdateForm = this.fb.group({
    //   requestType: [null, [Validators.required]],
    //   requestedDate: [null, [Validators.required]],
    //   attendanceId: [null, [Validators.required]],
    //   updatedTime: [null, [Validators.required]],
    //   managerId: [null, [Validators.required]],
    //   requestReason: [null, [Validators.required, Validators.maxLength(200)]]
    // });

    this.attendanceTimeUpdateForm = this.fb.group({
      updateGroup: this.fb.group({
        requestType: [null, Validators.required],
        requestedDate: [null, Validators.required],
        attendanceId: [null, Validators.required],
        updatedTime: [null, Validators.required]
      }),
      createGroup: this.fb.group({
        selectedDateAttendance: [null, Validators.required],
        inRequestTime: [null, Validators.required],
        outRequestTime: [null, Validators.required]
      }),
      managerId: [null, Validators.required],
      requestReason: [null, Validators.required]
    });

    this.donateCoinsForm = this.fb.group({
      userId: ['', Validators.required],
      coins: ['', [Validators.required, Validators.min(1)]],
      reason: [''],
      donationReason: ['']
    });
    this.getSuperCoinsResponseForEmployeeData();
    this.getUserListToDonateCoins();
    this.getDonateSuperCoinReasonData();

  }

  onError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = './assets/images/broken-image-icon.jpg';
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
      }
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
      }
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
      (error) => {}
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
  //
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
    if (!this.attendanceDetailModalToggle) {
      // Reset modal data
      const extendedProps = mouseEnterInfo.event._def.extendedProps;

      this.userAttendanceDetailDateWise = {
        checkInTime: extendedProps.checkInTime || '',
        checkOutTime: extendedProps.checkOutTime || '',
        breakCount: extendedProps.breakCount || '',
        breakDuration: extendedProps.breakDuration || '',
        totalWorkingHours: extendedProps.totalWorkingHours || '',
        createdDate: extendedProps.createdDate || '',
        status: extendedProps.status || '',
      };

      // Get the event element's position on the screen
      const rect = mouseEnterInfo.el.getBoundingClientRect();


      this.clientX = `${rect.left - 210}px`;
      this.clientY = `${rect.top - 70}px`;

      // Open modal
      this.attendanceDetailModalToggle = true;
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
    // Add a delay before closing the modal
    setTimeout(() => {
      const modalElement = this.closeAttendanceDetailModalButton.nativeElement;

      // Ensure the mouse is not hovering over the modal before closing it
      if (!modalElement.matches(':hover')) {
        this.closeAttendanceModal();
      }
    }, 0); // Delay of 300ms to reduce flickering
  }

  date = new Date();
  mode: NzCalendarMode = 'month';
  // getEventForDate(date: Date): any {
  //   return this.events.find(event => moment(event.date).isSame(moment(date), 'day'));
  // }




  panelChange(event: { date: Date; mode: 'month' | 'year' }): void {
    this.mode = event.mode; // Update mode
    // console.log('Panel change event:', event);

    // Check if the mode is 'month' and the month has changed
    const selectedDate = event.date;
    const currentMonth = this.date.getMonth();
    const currentYear = this.date.getFullYear();
    const newMonth = selectedDate.getMonth();
    const newYear = selectedDate.getFullYear();

    // Check if the month or year has changed
    if (newMonth !== currentMonth || newYear !== currentYear) {
      // Update the date to the new selected date
      this.date = selectedDate;

      // Call your method to handle data fetching based on the new month/year
      this.handleMonthChange(newMonth, newYear);
    }
  }


  disableDate = (current: Date): boolean => {
    // Disable dates before the user's joining date
    // console.log('Current:', current, 'Joining Date:', this.onboardingPreviewData.user.joiningDate);
    return current < this.joiningDate;
  };

  disablePreviousYears = (current: Date): boolean => {
    const currentYear = new Date().getFullYear();
    return current.getFullYear() < currentYear;
  };

  disablePreviousMonths = (current: Date): boolean => {
    return current && current < this.joiningDate;
  };

  selectChange(selectedDate: Date): void {
    // console.log('Selected date:', selectedDate);

    // Calculate the start and end dates for the month
    const startDateStr = moment(selectedDate).startOf('month').format('YYYY-MM-DD');
    const endDateStr = moment(selectedDate).endOf('month').format('YYYY-MM-DD');

    // Call the method to fetch user attendance data
    this.getUserAttendanceDataFromDate(startDateStr, endDateStr);
  }

  handleMonthChange(month: number, year: number): void {
    const startDate = moment().year(year).month(month).startOf('month');
    const endDate = moment(startDate).endOf('month');

    const startDateStr = startDate.format('YYYY-MM-DD');
    const endDateStr = endDate.format('YYYY-MM-DD');

    // console.log(`Start Date: ${startDateStr}, End Date: ${endDateStr}`);

    // Call your method to get user attendance data
    this.getUserAttendanceDataFromDate(startDateStr, endDateStr);
  }

  // });
  getUserAttendanceDataFromDate(sDate: string, eDate: string): void {
    debugger
    this.dataService
      .getUserAttendanceDetailsByDateDuration(this.userId, 'USER', sDate, eDate)
      .subscribe(
        (response: any) => {
          const attendances = response?.listOfObject || [];
          this.events = [];
          this.totalPresent = 0;
          this.totalAbsent = 0;
          console.log("🚀 ~ EmployeeProfileComponent ~ getUserAttendanceDataFromDate ~ attendances.length:", attendances.length)

          if (!attendances.length) {
            let currentDate = moment(sDate, 'YYYY-MM-DD');
            const endDate = moment(eDate, 'YYYY-MM-DD');

            while (currentDate.isSameOrBefore(endDate)) {
              this.events.push({
                title: 'A',
                date: currentDate.format('YYYY-MM-DD'),
                color: '#f8d7d7'
              });
              this.totalAbsent++;
              currentDate.add(1, 'days');
            }
          } else {
            this.attendances = attendances;
            this.attendanceDetailsResponse = attendances;
            this.attendanceDetailDayWise = response?.listOfObject || [];

            for (let attendance of attendances) {
              const title = this.getStatusTitle(attendance);
              const color = this.getStatusColor(attendance.status);

              if (['Present', 'Half Day', 'Late'].includes(attendance.status)) {
                this.totalPresent++;
              } else if (attendance.status === 'Absent') {
                this.totalAbsent++;
              }

              this.events.push({
                title,
                date: moment(attendance.createdDate).format('YYYY-MM-DD'),
                color,
                checkInTime: attendance.checkInTime,
                checkOutTime: attendance.checkOutTime,
                breakCount: attendance.breakCount,
                breakDuration: attendance.totalBreakHours,
                totalWorkingHours: attendance.totalWorkingHours,
                createdDate: attendance.createdDate,
                status: attendance.status,
              });
            }
          }

          this.updateCalendarOptions();

          if (this.prevDate) {
            //TODO : uncomment if required
            // const calendarApi = this.calendarComponent.getApi();
            // this.changeForwardButtonVisibilty(calendarApi);
          }

          this.count++;
        },
        (error: any) => {
          this.count++;
          console.error('Error fetching data:', error);
        }
      );
  }


  // Function to update calendar options
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
      if (status.includes('Leave')|| status.includes('Duty')) {
        return 'rgb(255, 255, 143)';
      }
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

  attendanceDetailDayWise: AttendanceDetailDayWise[] =[];


  // Function to get attendance details for a particular date
  getAttendance(date: Date): AttendanceDetailDayWise | undefined {
    const formattedDate = this.formatDate(date);
    return this.attendanceDetailDayWise.find(attendance => attendance.createdDate === formattedDate);
  }

  getEventForDate(date: Date): any {
    const formattedDate = this.formatDate(date);
    return this.events.find(event => event.date === formattedDate);
  }

  // Helper function to format date to match the event date format
  // formatDate(date: Date): string {
  //   const year = date.getFullYear();
  //   const month = ('0' + (date.getMonth() + 1)).slice(-2);
  //   const day = ('0' + date.getDate()).slice(-2);
  //   return `${year}-${month}-${day}`;
  // }

  // Function to get details for tooltip
  getDetails(attendance: AttendanceDetailDayWise): string {
    const createdDate = new Date(attendance.createdDate).toLocaleDateString();

    // Define details based on the attendance status
    let details = `Date: ${createdDate || 'N/A'}\n\n`;  // Double newline for spacing

    switch (attendance.status) {
        case 'Present':
        case 'Half Day':
            const checkInTime = new Date(attendance.checkInTime).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            const checkOutTime = new Date(attendance.checkOutTime).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            // Adding details with line breaks between each
            details += `Check-in: ${checkInTime || 'N/A'}\n`;
            details += `Check-out: ${checkOutTime || 'N/A'}\n`;
            details += `Total Hours: ${attendance.totalWorkingHours || 'N/A'}\n`;
            details += `Break Duration: ${attendance.breakDuration || 'N/A'}\n`;
            break;

        case 'Absent':
            details += `: Absent\n`;
            break;

        case 'Weekly Holiday':
            details += `: Weekly Holiday\n`;
            break;

        case 'Universal Holiday':
        case 'Custom Holiday':
            details += `: Holiday\n`;
            break;

        case 'On Leave':
            details += `: On Leave\n`;
            break;

        case 'Not Marked':
            details += `: Not Marked\n`;
            break;

        default:
            details += `: Unknown\n`;
            break;
    }

    return details;  // Each detail will be on a new line
}



   // Function to handle mode change (month/year change)
   onModeChange(mode: string) {
    // console.log('Calendar mode changed:', mode);
    // Handle actions here if necessary, such as re-fetching data based on mode
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

    const calendarApi = this.calendarComponent.getApi();

    calendarApi.next();
    this.changeForwardButtonVisibilty(calendarApi);

    let startDate = calendarApi.view.currentStart;
    let endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
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
      0
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

  @ViewChild('requestLeaveCloseModel') requestLeaveCloseModel!: ElementRef;
  @ViewChild('closeLopReversalRequestModal') closeLopReversalRequestModal!: ElementRef;


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
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  submitLeaveLoader: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  saveLeaveRequestUser() {


    if (this.userLeaveForm.invalid || this.isFileUploaded) {
      return;
    }

    this.userLeaveRequest.managerId = this.selectedManagerId;
    this.userLeaveRequest.dayShift = this.dayShiftToggle;
    this.userLeaveRequest.eveningShift = this.eveningShiftToggle;
    this.submitLeaveLoader = true;
    // this.userLeaveRequest.halfDayLeave = false;
    this.dataService
      .saveLeaveRequest(this.userId, this.userLeaveRequest, this.fileToUpload)
      .subscribe(
        (data) => {
          // console.log(data);
          // console.log(data.body);

          if(data.status){
            this.submitLeaveLoader = false;
          this.isLeavePlaceholder = false;
          this.isFileUploaded = false;
          this.fileToUpload = '';
          // this.selectedFile = null;
          this.fileInput.nativeElement.value = '';
          // this.getUserLeaveReq();

          setTimeout(() => {
            this.getUserLeaveReq();
          },100);

          this.resetUserLeave();
          this.formGroupDirective.resetForm();
          this.getUserLeaveLogByUuid();

          this.requestLeaveCloseModel.nativeElement.click();
          // location.reload();
          } else{
            this.submitLeaveLoader = false;
            this.isLeavePlaceholder = false;
            this.isFileUploaded = false;
            this.helperService.showToast(data.message, Key.TOAST_STATUS_ERROR);
          }


        },
        (error) => {
          this.submitLeaveLoader = false;
          // console.log(error.body);
        }
      );
  }

  lopReversalApplicationRequestButtonLoader : boolean = false;
  submitLopReversalApplicationRequest(){
    if (this.lopReversalApplicationRequestForm.valid) {
      this.lopReversalApplicationRequestButtonLoader = true;
      const request = new LopReversalApplicationRequest();
      request.startDate = this.startDate;
      request.endDate = this.endDate;
      request.daysCount = +this.lopReversalApplicationRequestForm.get('daysCount')?.value; // Cast the value to a number
      request.notes = this.lopReversalApplicationRequestForm.get('notes')?.value;
      request.userUuid = this.userId;

      this.dataService.registerLopReversalApplication(request).subscribe((response) => {
        if(response.message != null){
          this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
          this.closeLopReversalRequestModal.nativeElement.click();
          this.lopReversalApplicationRequestButtonLoader = false;
        }
      }, (error) => {
        this.lopReversalApplicationRequestButtonLoader = false;
        this.helperService.showToast('Error while registering the request!', Key.TOAST_STATUS_ERROR);
      })
    }
  }

  resetLopReversalApplicationRequestForm(){
    this.lopReversalApplicationRequestForm = this.fb.group({
      selectedDate: [null, Validators.required],
      daysCount: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      notes: [''],
      userUuid: ['']
    });
  }

  resetOvertimeRequestForm(){
    this.overtimeRequestForm = this.fb.group({
      startTime: [null, Validators.required],
      endTime: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      workingHour: [''],
      managerUuid: ['']
    });
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

  getUserLeaveReq1() {
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
      }
    );
  }

  getUserLeaveReq(){
    this.leaveCountPlaceholderFlag = false;
    this.dataService.getUserLeaveRequests(this.userId).subscribe(
      (res: any) => {
          this.userLeave = res.object;

          if(this.userLeave == null){
            this.userLeave = []
          }


      });
  }

  tempLeaveType: string =''
  onLeaveTypeChange(selectedLeave: any): void {
    debugger
    // if(selectedLeave == undefined){
      this.userLeaveRequest.userLeaveTemplateId = selectedLeave ;
    // console.log('userLeaveTemplate leaveType', this.userLeaveRequest)
  }

  selectedStatus!: string;
  selectStatusFlag: boolean = false;
  isLeaveErrorPlaceholder: boolean = false;
  getUserLeaveLogByUuid() {

    this.isLeaveShimmer = true;
    // this.selectStatusFlag=true;

    if (this.selectedStatus && this.selectedStatus != 'ALL') {
      // console.log('selectedStatus :' + this.selectedStatus);
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
          }
        );
    } else {
      // console.log('selectedStatus :' + this.selectedStatus);
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
        // console.log('manager :' + this.managers[2].id);
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

  // formatTime(date: Date) {
  //   const dateObject = new Date(date);
  //   const formattedTime = this.datePipe.transform(dateObject, 'hh:mm a');
  //   return formattedTime;
  // }

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
      }
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
        // console.log('experience length' + this.experienceEmployee.length);
        if (data == undefined || data == null || data.experiences?.length == 0) {
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
        } else {
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
  documentsEmployee: UserDocumentsAsList[] = [];
  highSchoolCertificate: string = '';
  degreeCert: string = '';
  intermediateCertificate: string = '';
  testimonialsString: string = '';
  aadhaarCardString: string = '';
  pancardString: string = '';
  // isDocumentsShimmer:boolean=false;
  getEmployeeDocumentsDetailsByUuid() {

    // this.isDocumentsShimmer=true;
    this.dataService.getEmployeeDocumentAsList(this.userId).subscribe(
      (data) => {
        this.documentsEmployee = data.listOfObject;
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
      }
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

    this.nextOpenDocName = docsName;
    this.downloadString = viewString;
    this.previewString =
      this.domSanitizer.bypassSecurityTrustResourceUrl(viewString);
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
      '/firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/'
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

  @ViewChild('openRejectModal') openRejectModal!: ElementRef;
  setReasonOfRejectionMethodCall() {

    this.dataService
      .setReasonOfRejection(this.userId, this.reasonOfRejectionProfile)
      .subscribe(
        (response: ReasonOfRejectionProfile) => {
          // console.log('Response:', response);
        },
        (error) => {
          // console.error('Error occurred:', error);
        }
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
        result += `${
          monthDiff === 1 ? monthDiff + ' month' : monthDiff + ' months'
        }`;
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
            Key.TOAST_STATUS_SUCCESS
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
        }
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


  // ####################--Shimmers for Logs in Attendance tab--#########################

  isShimmerForOvertimeLog = false;
  dataNotFoundPlaceholderForOvertimeLog = false;
  networkConnectionErrorPlaceHolderForOvertimeLog = false;
  preRuleForShimmersAndErrorPlaceholdersForOvertimeLogMethodCall() {
    this.isShimmerForOvertimeLog = true;
    this.dataNotFoundPlaceholderForOvertimeLog = false;
    this.networkConnectionErrorPlaceHolderForOvertimeLog = false;
  }

  isShimmerForLopReversalApplication = false;
  dataNotFoundPlaceholderForLopReversalApplication = false;
  networkConnectionErrorPlaceHolderForLopReversalApplication = false;
  preRuleForShimmersAndErrorPlaceholdersForLopReversalApplicationMethodCall() {
    this.isShimmerForLopReversalApplication = true;
    this.dataNotFoundPlaceholderForLopReversalApplication = false;
    this.networkConnectionErrorPlaceHolderForLopReversalApplication = false;
  }

  isShimmerForSalaryTemplate = false;
  dataNotFoundPlaceholderForSalaryTemplate = false;
  networkConnectionErrorPlaceHolderForSalaryTemplate = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateMethodCall() {
    this.isShimmerForSalaryTemplate = true;
    this.dataNotFoundPlaceholderForSalaryTemplate = false;
    this.networkConnectionErrorPlaceHolderForSalaryTemplate = false;
  }

  isShimmerForEmployeePayslipResponse = false;
  dataNotFoundPlaceholderForEmployeePayslipResponse = false;
  networkConnectionErrorPlaceHolderForEmployeePayslipResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipResponseMethodCall() {
    this.isShimmerForEmployeePayslipResponse = true;
    this.dataNotFoundPlaceholderForEmployeePayslipResponse = false;
    this.networkConnectionErrorPlaceHolderForEmployeePayslipResponse = false;
  }

  isShimmerForEmployeePayslipBreakupResponse = false;
  dataNotFoundPlaceholderForEmployeePayslipBreakupResponse = false;
  networkConnectionErrorPlaceHolderForEmployeePayslipBreakupResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipBreakupResponseMethodCall() {
    this.isShimmerForEmployeePayslipBreakupResponse = true;
    this.dataNotFoundPlaceholderForEmployeePayslipBreakupResponse = false;
    this.networkConnectionErrorPlaceHolderForEmployeePayslipBreakupResponse = false;
  }

  isShimmerForEmployeePayslipDeductionResponse = false;
  dataNotFoundPlaceholderForEmployeePayslipDeductionResponse = false;
  networkConnectionErrorPlaceHolderForEmployeePayslipDeductionResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipDeductionResponseMethodCall() {
    this.isShimmerForEmployeePayslipDeductionResponse = true;
    this.dataNotFoundPlaceholderForEmployeePayslipDeductionResponse = false;
    this.networkConnectionErrorPlaceHolderForEmployeePayslipDeductionResponse = false;
  }

  isShimmerForEmployeePayslipLogResponse = false;
  dataNotFoundPlaceholderForEmployeePayslipLogResponse = false;
  networkConnectionErrorPlaceHolderForEmployeePayslipLogResponse = false;
  preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipLogResponseMethodCall() {
    this.isShimmerForEmployeePayslipLogResponse = true;
    this.dataNotFoundPlaceholderForEmployeePayslipLogResponse = false;
    this.networkConnectionErrorPlaceHolderForEmployeePayslipLogResponse = false;
  }


  salaryTemplateComponentResponse: SalaryTemplateComponentResponse = new SalaryTemplateComponentResponse();
  getSalaryTemplateComponentByUserUuidMethodCall() {

    this.preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateMethodCall();
    this.dataService.getSalaryTemplateComponentByUserUuid().subscribe((response) => {

        if(this.helperService.isObjectNullOrUndefined(response)){
          this.dataNotFoundPlaceholderForSalaryTemplate = true;
        } else{
          this.salaryTemplateComponentResponse = response.object;
        }
        this.isShimmerForSalaryTemplate = false;
      },
      (error) => {
        this.networkConnectionErrorPlaceHolderForSalaryTemplate = true;
      }
    );
  }

  salaryConfigurationStepId: number = 0;
  getSalaryConfigurationStepMethodCall() {
    this.dataService.getSalaryConfigurationStep().subscribe(
      (response) => {
        this.salaryConfigurationStepId = response.count;
      },
      (error) => {}
    );
  }

  //Fetching the PF contribution rates
  pFContributionRateList: PFContributionRate[] = [];
  getPFContributionRateMethodCall() {
    this._salaryService.getPFContributionRate().subscribe(
      (response) => {
        if(response.status){
          this.pFContributionRateList = response.object;
          if(this.pFContributionRateList == null){
            this.pFContributionRateList = [];
          }
        }
      },
      (error) => {}
    );
  }

   //Fetching the ESI contribution rates
  eSIContributionRateList: ESIContributionRate[] = [];
  getESIContributionRateMethodCall() {
    this._salaryService.getESIContributionRate().subscribe(
      (response) => {
        if(response.status){
          this.eSIContributionRateList = response.object;
          if(this.eSIContributionRateList == null){
            this.eSIContributionRateList = [];
          }
        }
      },
      (error) => {}
    );
  }

  updateTaxRegimeByUserIdMethodCall(taxRegimeId: number) {
    this.dataService.updateTaxRegimeByUserId(taxRegimeId).subscribe(
      (response) => {
        if(response.status){
          this.getAllTaxRegimeMethodCall();
          this.helperService.showToast(response.message,Key.TOAST_STATUS_SUCCESS);
        }
      },
      (error) => {
        this.helperService.showToast('Error in updating tax regime!',Key.TOAST_STATUS_ERROR);
      }
    );
  }

  taxRegimeList: TaxRegime[] = [];
  getAllTaxRegimeMethodCall() {
    this._salaryService.getAllTaxRegime().subscribe((response) => {
        if(response.status){
          this.taxRegimeList = response.object;
          if(this.taxRegimeList == null){
            this.taxRegimeList =  [];
          }
        }
      },
      (error) => {}
    );
  }

  statutoryResponseList: StatutoryResponse[] = [];
  getStatutoryByOrganizationIdMethodCall() {

    this._salaryService.getStatutoryByOrganizationId().subscribe((response) => {
        if(response.status){

          this.statutoryResponseList = response.object;
          this.setStatutoryVariablesToFalse();
          // console.log(this.statutoryResponseList);
          this.clearInputValues();
        }
      },
      (error) => {}
    );
  }

  //Fetching statutory's attributes
  statutoryAttributeResponseList: StatutoryAttributeResponse[] = [];
  getStatutoryAttributeByStatutoryIdMethodCall(statutoryId: number) {
    return new Promise((resolve, reject) => {
      this._salaryService
        .getStatutoryAttributeByStatutoryId(statutoryId)
        .subscribe(
          (response) => {
            this.statutoryAttributeResponseList = response.object;
            // console.log(response);
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  async clickSwitch(statutoryResponse: StatutoryResponse) {
    if (!statutoryResponse.loading) {
      statutoryResponse.loading = true;
    }

    await this.getStatutoryAttributeByStatutoryIdMethodCall(
      statutoryResponse.id
    );

    this.statutoryRequest.id = statutoryResponse.id;
    this.statutoryRequest.name = statutoryResponse.name;
    this.statutoryRequest.switchValue = !statutoryResponse.switchValue;
    this.statutoryRequest.statutoryAttributeRequestList =
      this.statutoryAttributeResponseList;

    // console.log(this.statutoryAttributeResponseList);

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
          Key.TOAST_STATUS_SUCCESS
        );
        this.getStatutoryByOrganizationIdMethodCall();
      },
      (error) => {
        this.helperService.showToast(
          error.error.message,
          Key.TOAST_STATUS_ERROR
        );
        this.getStatutoryByOrganizationIdMethodCall();
      }
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
        }
      );
  }

  goToManageStatutory() {
    this.salaryConfigurationStepId = this.MANAGE_STATUTORY;
    const configureSalarySettingDiv = document.getElementById('configure-salary-setting') as HTMLInputElement | null;
    const manageStatutoryDiv = document.getElementById('manage-statutory') as HTMLInputElement | null;

    if (configureSalarySettingDiv) {
      configureSalarySettingDiv.style.display = 'none';

      if (manageStatutoryDiv) {
        manageStatutoryDiv.style.display = 'block';
      }
    }
  }

  goToPaySlip(){
    this.salaryConfigurationStepId = this.PAY_SLIP;
    const paySlipDiv = document.getElementById('pay_slip') as HTMLInputElement | null;
    const manageStatutoryDiv = document.getElementById('manage-statutory') as HTMLInputElement | null;

    if(manageStatutoryDiv){
      manageStatutoryDiv.style.display = 'none';

      if(paySlipDiv){
        paySlipDiv.style.display = 'block';
      }
    }
  }


  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  // startDate: string = '';
  // endDate: string = '';

  startDate: any;
  endDate: any;

  onMonthChange(month: any): void {
    // console.log(month);
    this.selectedDate =   new Date(this.selectedYear, month, 1),
    // month;
    this.getFirstAndLastDateOfMonth(this.selectedDate);

    this.financeSectionMethodCall();

  }

  getFirstAndLastDateOfMonth(selectedDate: Date) {

    this.startDate = this.helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    this.endDate = this.helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    );

    this.getUserAttendanceDataFromDate(this.startDate, this.endDate);
  }
  disableMonths = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const organizationRegistrationYear = new Date(
      this.organizationRegistrationDate
    ).getFullYear();
    const organizationRegistrationMonth = new Date(
      this.organizationRegistrationDate
    ).getMonth();

    // Disable if the month is before the organization registration month
    if (
      dateYear < organizationRegistrationYear || (dateYear === organizationRegistrationYear && dateMonth < organizationRegistrationMonth)
    ) {
      return true;
    }

    // Disable if the month is after the current month
    if (
      dateYear > currentYear || (dateYear === currentYear && dateMonth > currentMonth)
    ) {
      return true;
    }

    // Enable the month if it's from January 2023 to the current month
    return false;
  };

  disableMonthsForLopReversal = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const organizationRegistrationYear = new Date(
      this.organizationRegistrationDate
    ).getFullYear();
    const organizationRegistrationMonth = new Date(
      this.organizationRegistrationDate
    ).getMonth();

    // Disable if the month is before the organization registration month
    if (
      (dateYear < organizationRegistrationYear) || (dateYear === organizationRegistrationYear && dateMonth < organizationRegistrationMonth) || (dateYear > currentYear) || (dateMonth != currentMonth - 1)
    ) {
      return true;
    }

    return false;
  };

  organizationRegistrationDate: string = '';
  getOrganizationRegistrationDateMethodCall() {

    this.dataService.getOrganizationRegistrationDate().subscribe(
      (response) => {
        this.organizationRegistrationDate = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }




  // Finance Section APIs
  showFinanceData : boolean = false;
  financeSectionMethodCall(){
    this.getEmployeePayslipResponseByUserUuidMethodCall();
    this.getEmployeePayslipBreakupResponseByUserUuidMethodCall();
    this.getEmployeePayslipDeductionResponseByUserUuidMethodCall();
    this.getEmployeePayslipLogResponseByUserUuidMethodCall();
  }

  employeePayslipResponse : EmployeePayslipResponse = new EmployeePayslipResponse();
  getEmployeePayslipResponseByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipResponseMethodCall();
    this.dataService.getEmployeePayslipResponseByUserUuid(this.userId, this.startDate, this.endDate).subscribe((response) => {
      if(this.helperService.isObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForEmployeePayslipResponse = true;
        this.employeePayslipResponse = new EmployeePayslipResponse();
        this.payrollChartDataNotFoundMehthodCall();
      } else{
        this.employeePayslipResponse = response.object;
        this.payrollChartMehthodCall();
      }
      this.isShimmerForEmployeePayslipResponse = false;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForEmployeePayslipResponse = true;
      this.isShimmerForEmployeePayslipResponse = false;
    })
  }


  employeePayslipBreakupResponseList : EmployeePayslipBreakupResponse[] = [];
  getEmployeePayslipBreakupResponseByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipBreakupResponseMethodCall();
    this.dataService.getEmployeePayslipBreakupResponseByUserUuid(this.userId, this.startDate, this.endDate).subscribe((response) => {
      if(response.object == null || response.object.length == 0){
        this.dataNotFoundPlaceholderForEmployeePayslipBreakupResponse = true;
        this.employeePayslipBreakupResponseList = [];
      } else{
        this.employeePayslipBreakupResponseList = response.object;
      }

      this.isShimmerForEmployeePayslipBreakupResponse = true;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForEmployeePayslipBreakupResponse = true;
      this.isShimmerForEmployeePayslipBreakupResponse = true;
    })
  }

  employeePayslipDeductionResponse : EmployeePayslipDeductionResponse = new EmployeePayslipDeductionResponse();
  getEmployeePayslipDeductionResponseByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipDeductionResponseMethodCall();
    this.dataService.getEmployeePayslipDeductionResponseByUserUuid(this.userId, this.startDate, this.endDate).subscribe((response) => {
      if(this.helperService.isObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForEmployeePayslipDeductionResponse = true;
      } else{
        this.employeePayslipDeductionResponse = response.object;
      }

      this.isShimmerForEmployeePayslipDeductionResponse = true;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForEmployeePayslipDeductionResponse = true;
      this.isShimmerForEmployeePayslipDeductionResponse = true;
    })
  }

  employeePayslipLogResponseList : EmployeePayslipLogResponse[] = [];
  getEmployeePayslipLogResponseByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForEmployeePayslipLogResponseMethodCall();
    this.dataService.getEmployeePayslipLogResponseByUserUuid(this.userId, this.startDate, this.endDate).subscribe((response) => {
      if(this.helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForEmployeePayslipLogResponse = true;
        this.employeePayslipLogResponseList = [];
      } else{
        this.employeePayslipLogResponseList = response.listOfObject;
        // console.log( this.employeePayslipLogResponseList);

      }
      this.isShimmerForEmployeePayslipLogResponse = false;
    }, (error) => {
      this.isShimmerForEmployeePayslipLogResponse = false;
      this.networkConnectionErrorPlaceHolderForEmployeePayslipLogResponse = true;
    })
  }

  downloadPaySlip(url: string, name: string){
    this.helperService.downloadPdf(url, name);
  }

  // #################-- Payroll chart code --###########################

  view: [number, number] = [375, 375]; // explicitly define as tuple
  // options
  showLegend: boolean = false;
  showLabels: boolean = true;
  explodeSlices: boolean = false;
  doughnut: boolean = true;
  gradient: boolean = true;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#6666f3', '#FE3636', '#02E59C', '#888']
  };

  // chart data
  single = [
    {
      name: 'Net Pay',
      value: 0
    },
    {
      name: 'Deduction',
      value: 0
    },
    {
      name: 'Gross Pay',
      value: 0
    },
    {
      name: 'Not Found',
      value: 0
    }
  ];

  onSelect(event: any) {
    console.log(event);
  }

  payrollChartMehthodCall(){
    this.single = [
      {
        name: 'Net Pay',
        value: this.employeePayslipResponse.netPay
      },
      {
        name: 'Deduction',
        value: this.employeePayslipResponse.deduction
      },
      {
        name: 'Gross Pay',
        value: this.employeePayslipResponse.grossPay
      }
    ];
  }

  payrollChartDataNotFoundMehthodCall(){
    this.single = [
      {
        name: 'Net Pay',
        value: 0
      },
      {
        name: 'Deduction',
        value: 0
      },
      {
        name: 'Gross Pay',
        value: 0
      },
      {
        name: 'No data found!',
        value: 0.1
      }
    ];
  }


  // getCenterLabel(): string {
  //   const totalValue = this.single.reduce((sum, item) => sum + item.value, 0);
  //   return totalValue.toString();
  // }

  // ===================================================

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
  employeeCompanyDocuments: EmployeeCompanyDocumentsRequest[] = [];

  routeToUserDetails(routePath: string) {
    let navExtra: NavigationExtras = {
      queryParams: {
        userUuid: new URLSearchParams(window.location.search).get('userId'),
        adminUuid: this.UUID,
      },
    };
    this.router.navigate([routePath], navExtra);
  }

  isSameOrAfterDate(date1: Date, date2: Date): boolean {
    const onlyDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const onlyDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return onlyDate1 >= onlyDate2;
  }
  

  joiningDate!: Date;
  getOnboardingFormPreviewMethodCall() {
    const userUuid = new URLSearchParams(window.location.search).get('userId') || '';
    if (userUuid) {
      this.dataService.getOnboardingFormPreview(userUuid).subscribe(
        (preview) => {
          // console.log(preview);
          this.onboardingPreviewData = preview;
          this.joiningDate = new Date(this.onboardingPreviewData.user.joiningDate);
          this.yearList = this.generateYearList();
          if (preview.companyLogo) {
            this.companyLogoUrl = preview.companyLogo;
          }
          this.isLoading = false;
          this.handleOnboardingStatus(
            preview.user.employeeOnboardingStatus.response
          );

          if (preview.employeeCompanyDocuments) {
            this.onboardingPreviewData.employeeCompanyDocuments =
              preview.employeeCompanyDocuments;
            // console.log(
            //   'testtttt' + this.onboardingPreviewData.employeeCompanyDocuments
            // );
          }

          // if (preview.employeeAdditionalDocument && preview.employeeAdditionalDocument.length > 0) {
          this.employeeAdditionalDocument = preview.employeeAdditionalDocuments;
          // console.log(this.employeeAdditionalDocument);
          // } else {
          //   console.log("eroor ")
          //     // Handle the case where employeeAdditionalDocument is undefined, null, or empty
          //     this.employeeAdditionalDocument = [];
          // }

          if (preview?.userDocuments.secondarySchoolCertificate) {
            this.isSchoolDocument = false;
          }
          if (preview?.userDocuments.highSchoolCertificate) {
            this.isHighSchoolDocument = false;
          }
          if (preview?.userExperience) {
            this.userExperienceArray = preview.userExperience;
          }
          if (preview?.fresher == true) {
            this.isFresher = true;
          }
          if (preview?.userEmergencyContacts) {
            this.userEmergencyContactArray = preview.userEmergencyContacts;
          } else {
            console.log('No guarantor information available.');
            this.userEmergencyContactArray = [];
          }
          if (preview?.userDocuments != null) {
            this.secondarySchoolCertificateFileName = this.getFilenameFromUrl(
              preview.userDocuments.secondarySchoolCertificate
            );
            this.highSchoolCertificateFileName1 = this.getFilenameFromUrl(
              preview?.userDocuments.highSchoolCertificate
            );
            this.highestQualificationDegreeFileName1 = this.getFilenameFromUrl(
              preview?.userDocuments.highestQualificationDegree
            );
            this.testimonialReccomendationFileName1 = this.getFilenameFromUrl(
              preview?.userDocuments.testimonialReccomendation
            );
            this.aadhaarCardFileName = this.getFilenameFromUrl(
              preview?.userDocuments.aadhaarCard
            );
            this.pancardFileName = this.getFilenameFromUrl(
              preview?.userDocuments.pancard
            );
          }
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          this.userEmergencyContactArray = [];
        }
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
      case 'REQUESTED':
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
      (error) => {}
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
      }
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
  activeHomeTabFlag: boolean = false;
  activeAttendanceTabFlag: boolean = false;
  activeFinancesTabFlag: boolean = false;
  activeDocumentsTabFlag: boolean = false;
  activeAssetsTabFlag: boolean = false;
  activeProfileTabFlag: boolean = false;
  activeExpenseTabFlag: boolean = false;

  activeTabs(activeTabString: string) {
    if (activeTabString === 'home') {
      this.activeHomeTabFlag = true;
      this.activeAttendanceTabFlag = false;
      this.activeFinancesTabFlag = false;
      this.activeDocumentsTabFlag = false;
      this.activeAssetsTabFlag = false;
      this.activeProfileTabFlag = false;
      this.activeExpenseTabFlag = false;
    } else if (activeTabString === 'attendance') {
      this.activeHomeTabFlag = false;
      this.activeAttendanceTabFlag = true;
      this.activeFinancesTabFlag = false;
      this.activeDocumentsTabFlag = false;
      this.activeAssetsTabFlag = false;
      this.activeProfileTabFlag = false;
      this.activeExpenseTabFlag = false;
    } else if (activeTabString === 'finances') {
      this.activeHomeTabFlag = false;
      this.activeAttendanceTabFlag = false;
      this.activeFinancesTabFlag = true;
      this.activeDocumentsTabFlag = false;
      this.activeAssetsTabFlag = false;
      this.activeProfileTabFlag = false;
      this.activeExpenseTabFlag = false;
    }else if (activeTabString === 'assets') {
      this.activeHomeTabFlag = false;
      this.activeAttendanceTabFlag = false;
      this.activeFinancesTabFlag = false;
      this.activeDocumentsTabFlag = false;
      this.activeAssetsTabFlag = true;
      this.activeProfileTabFlag = false;
      this.activeExpenseTabFlag = false;
    } else if (activeTabString === 'documents') {
      this.activeHomeTabFlag = false;
      this.activeAttendanceTabFlag = false;
      this.activeFinancesTabFlag = false;
      this.activeDocumentsTabFlag = true;
      this.activeAssetsTabFlag = false;
      this.activeProfileTabFlag = false;
      this.activeExpenseTabFlag = false;
    } else if (activeTabString === 'profile') {
      this.activeHomeTabFlag = false;
      this.activeAttendanceTabFlag = false;
      this.activeFinancesTabFlag = false;
      this.activeDocumentsTabFlag = false;
      this.activeAssetsTabFlag = false;
      this.activeExpenseTabFlag = false;
      this.activeProfileTabFlag = true;
    }else if(activeTabString === 'expense'){
      this.activeHomeTabFlag = false;
      this.activeAttendanceTabFlag = false;
      this.activeFinancesTabFlag = false;
      this.activeDocumentsTabFlag = false;
      this.activeAssetsTabFlag = false;
      this.activeProfileTabFlag = false;
      this.activeExpenseTabFlag = true;
    }
  }

  private fileTypeToIcon: { [key: string]: string } = {
    '.pdf': 'lar la-file-pdf text-danger',
    '.jpg': 'lar la-file-image text-success',
    '.jpeg': 'lar la-file-image text-success',
    '.png': 'lar la-file-image text-success',
    '.zip': 'lar la-file-archive text-warning',
  };

  getFileTypeIcon(fileUrl: string): string {
    // Log the file URL to inspect its format
    // console.log('File URL:', fileUrl);

    // Extract the file extension, ensuring you consider URLs with parameters or fragments
    const url = new URL(fileUrl, window.location.origin); // This normalizes the URL
    const fileName = url.pathname.split('/').pop(); // Get the last segment in the path
    const extension = `.${fileName?.split('.').pop()?.toLowerCase()}`;

    // Log the detected extension
    // console.log('Detected extension:', extension);

    // Return the corresponding icon class or a default value
    return this.fileTypeToIcon[extension] || 'lar la-file text-secondary';
  }

  documentName: string = '';

  addNewDocument() {

    this.addMoreDocModalButton.nativeElement.click();
    if (!this.onboardingPreviewData.employeeCompanyDocuments) {
      this.onboardingPreviewData.employeeCompanyDocuments = [];
    }

    // Find the maximum ID in the current document list
    const maxId = this.onboardingPreviewData.employeeCompanyDocuments.reduce(
      (max, doc) => (doc.id > max ? doc.id : max),
      0
    );

    // Create a new document object with a unique ID
    const newDocument: EmployeeCompanyDocumentsRequest = {
      id: maxId + 1, // Increment the maximum ID by 1
      name: this.documentName,
      url: '',
      fileName: '',
      // Include other required properties of EmployeeAdditionalDocument, if any
    };

    this.onboardingPreviewData.employeeCompanyDocuments.push(newDocument);

    this.isAddMore = false; // Hide the add more section if needed

    // Delay needed to ensure DOM has finished updating
    setTimeout(() => {
      const fileInput = document.getElementById(
        `additionalDocumentFile${newDocument.id}`
      );
      if (fileInput) fileInput.click(); // Open the file dialog automatically
    }, 100);
  }

  @ViewChild('addMoreDocModalButton') addMoreDocModalButton!: ElementRef;
  isAddMore: boolean = false;
  addMore() {
    this.isAddMore = true;
    this.addMoreDocModalButton.nativeElement.click();
  }

  isInvalidFileType = false;
  isValidFileType(file: File): boolean {
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileType = file.type.split('/').pop(); // Get the file extension from the MIME type

    if (fileType && validExtensions.includes(fileType.toLowerCase())) {
      this.isInvalidFileType = true;
      return true;
    }
    // console.log(this.isInvalidFileType);
    this.isInvalidFileType = false;
    return false;
  }

  onAdditionalFileSelected(event: Event, index: number): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files ? fileInput.files[0] : null;

    if (file && this.isValidFileType(file)) {
      // Check if the file is valid before proceeding
      // If the file type is valid, proceed with the upload
      this.uploadAdditionalFile(file, index);
    } else {
      fileInput.value = '';
      // Optionally handle the case when the file is invalid
      // For example, you could alert the user or log an error
      console.error(
        'Invalid file type. Please select a JPG, JPEG, or PNG file.'
      );
    }
  }

  uploadAdditionalFile(file: File, index: number): void {
    const filePath = `employeeCompanyDocs/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    // Handle the file upload task
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            // Update the URL in the corresponding document
            this.onboardingPreviewData.employeeCompanyDocuments[index].url =
              url;
            this.assignAdditionalDocumentUrl(index, url);
            this.documentName = '';
            // If you have additional steps to perform after setting the URL, do them here
          });
        })
      )
      .subscribe();
  }

  assignAdditionalDocumentUrl(index: number, url: string): void {

    if (!this.employeeCompanyDocuments) {
      this.onboardingPreviewData.employeeCompanyDocuments = [];
    }

    if (!this.employeeCompanyDocuments[index]) {
      this.onboardingPreviewData.employeeCompanyDocuments[index] =
        new EmployeeAdditionalDocument();
    }

    this.onboardingPreviewData.employeeCompanyDocuments[index].url = url;
    this.onboardingPreviewData.employeeCompanyDocuments[index].fileName =
      this.getFilenameFromUrl(url);
    this.onboardingPreviewData.employeeCompanyDocuments[index].name =
      this.documentName;
    this.setEmployeeCompanyDocumentsMethodCall();
  }

  // deleteDocument(index: number): void {
  //   if (index > -1) {
  //     this.onboardingPreviewData.employeeCompanyDocuments.splice(index, 1);
  //     this.deleteCompanyDocByIdMethodCall(index);
  //   }
  // }

  setEmployeeCompanyDocumentsMethodCall(): void {

    if (this.onboardingPreviewData.employeeCompanyDocuments == null) {
      this.onboardingPreviewData.employeeCompanyDocuments = [];
    }
    const userUuid =
      new URLSearchParams(window.location.search).get('userId') || '';

    this.dataService
      .setEmployeeCompanyDocuments(userUuid, this.onboardingPreviewData)

      .subscribe(
        (response) => {
          this.helperService.showToast(
            'Document Uploaded Successfuly',
            Key.TOAST_STATUS_SUCCESS
          );
          this.toggle = false;
        },
        (error) => {
          console.error('Error occurred:', error);
          this.toggle = false;
        }
      );

    if (!userUuid) {
      console.error('User UUID is missing.');
      return;
    }
  }

  empDocs: any = [];
  // getEmployeeCompanyDocumentsMethodCall() {
  //   debugger
  //   const userUuid = new URLSearchParams(window.location.search).get('userId');

  //   if (userUuid) {
  //     this.dataService.getEmployeeCompanyDocuments(userUuid).subscribe(
  //       (response: UserDocumentsDetailsRequest) => {
  //        if(response.employeeCompanyDocuments != null) {

  //         this.onboardingPreviewData.employeeCompanyDocuments = response.employeeCompanyDocuments;
  //         this.employeeCompanyDocuments = response.employeeCompanyDocuments
  //         console.log("docs..." +  this.empDocs.length)
  //        }
  //       },
  //       (error: any) => {
  //         console.error('Error fetching user details:', error);
  //       }
  //     );
  //   } else {
  //     console.error('User UUID not found.');
  //   }

  // }

  deleteCompanyDocByIdMethodCall(id: number) {
     // Correct placement of the semicolon
    const userUuid = new URLSearchParams(window.location.search).get('userId');
    if (userUuid) {
      this.dataService.deleteEmployeeCompanyDocById(id, userUuid).subscribe(
        (response) => {
          this.documentName = '';
          // Find the index of the document to be deleted from the array
          const index =
            this.onboardingPreviewData.employeeCompanyDocuments.findIndex(
              (doc) => doc.id === id
            );
          if (index > -1) {
            this.onboardingPreviewData.employeeCompanyDocuments.splice(
              index,
              1
            );
            this.helperService.showToast(
              'Document Deleted Successfully',
              Key.TOAST_STATUS_SUCCESS
            );
          } else {
            console.error('Document Not Found.');
          }
        },
        (error: any) => {
          this.helperService.showToast(error, Key.TOAST_STATUS_ERROR);
          console.error('Error deleting document:', error);
        }
      );
    }
  }
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  fileToUpload: string = '';
  isSelecetdFileUploadedToFirebase: boolean = false;
  isFileUploaded = false;

  // Function to check if the selected file is an image
  isImageNew(file: File): boolean {
    return file.type.startsWith('image');
  }

  // Function to check if the selected file is a PDF
  isPdf(file: File): boolean {
    return file.type === 'application/pdf';
  }

  // Function to set the preview URL for images
  setImgPreviewUrl(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Function to set the preview URL for PDFs
  setPdfPreviewUrl(file: File): void {
    const objectUrl = URL.createObjectURL(file);
    this.pdfPreviewUrl =
      this.domSanitizer.bypassSecurityTrustResourceUrl(objectUrl);
  }

  fileName: any;
  onFileSelected(event: Event): void {

    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.isFileUploaded = true;
      this.selectedFile = fileList[0];

      const file = fileList[0];

      this.fileName = file.name;

      if (this.isImageNew(this.selectedFile)) {
        this.setImgPreviewUrl(this.selectedFile);
      } else if (this.isPdf(this.selectedFile)) {
        this.setPdfPreviewUrl(this.selectedFile);
      }

      this.uploadFile(this.selectedFile); // Upload file to Firebase
    } else {
      this.isFileUploaded = false;
    }
  }

  // Function to upload file to Firebase
  uploadFile(file: File): void {
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .toPromise()
      .then(() => {
        console.log('Upload completed');
        fileRef
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            // console.log('File URL:', url);
            this.fileToUpload = url;
            this.expenseTypeReq.url = url;
            // console.log('file url : ' + this.fileToUpload);
            this.isFileUploaded = false;
          })
          .catch((error) => {
            this.isFileUploaded = false;
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        this.isFileUploaded = false;
        console.error('Error in upload snapshotChanges:', error);
      });
  }

  downloadFile(link: string) {}

  @ViewChild('appraisalRequestModalButton') appraisalRequestModalButton !: ElementRef
  openAppraisalRequestModal(){
    this.getEmployeeCtcMethodCall();
  }

  appraisalRequest: AppraisalRequest = {
    effectiveDate: '',
    userUuid: '',
    previousCtc: 0,
    updatedCtc: 0,
    checked: false,
    position:''
  };

  getEmployeeCtcMethodCall() {
    this.dataService.getEmployeeSalary(this.userId).subscribe(
      (data: AppraisalRequest) => {
        this.appraisalRequest = data;

        this.appraisalRequestModalButton.nativeElement.click();
      },
      (error) => {
        console.error('Error fetching employee CTC:', error);

      }
    );
  }
  submitAppraisalRequest() {
    this.appraisalRequest.userUuid = this.userId;
    this.dataService.saveAppraisalRequest(this.appraisalRequest).subscribe(
      (response) => {
        this.helperService.showToast("Appraisal request submitted successfully", Key.TOAST_STATUS_SUCCESS);
        this.appraisalRequestModalButton.nativeElement.click();
      },
      (error) => {
        console.error('Error submitting appraisal request:', error);
        this.helperService.showToast("Error submitting appraisal request!", Key.TOAST_STATUS_ERROR);

      }
    );
  }

  openBonusRequestModal(){
    this.bonusRequest.amount = 0;
    this.bonusRequest.comment='';
    this.bonusRequestModalButton.nativeElement.click();
  }

  @ViewChild("bonusRequestModalButton") bonusRequestModalButton !: ElementRef;

  bonusRequest: BonusRequest = {
    userUuid:'',
    amount: 0,
    comment: ""
  };

  isFormInvalid: boolean = false;
@ViewChild ('bonusForm') bonusForm !: NgForm
checkFormValidation(){
if(this.bonusForm.invalid){
this.isFormInvalid = true;
return
} else {
  this.isFormInvalid = false;
}
}


  submitBonus() {
    if(this.isFormInvalid==true){
      return
    } else{
    this._salaryService.registerBonus(this.bonusRequest).subscribe((response) => {
        if(response.status){
          this.helperService.showToast("Bonus applied successfully", Key.TOAST_STATUS_SUCCESS);
          this.bonusRequestModalButton.nativeElement.click();
        }else{
          this.helperService.showToast("Error submitting bonus request", Key.TOAST_STATUS_ERROR);
        }
      },
      (error) => {
      
      }
    );
  }}

  //  new

  search: string = '';
  pageNumber: number = 1;
  itemPerPage: number = 6;
  assetData: OrganizationAssetResponse[] = [];
  totalCount: number = 0;
  crossFlag: boolean = false;
  getAssetData(): void {
    this.dataService.getAssetForUser(this.userId, this.search, this.pageNumber, this.itemPerPage)
      .subscribe(
        (response) => {
          this.assetData = response.object;
          this.totalCount = response.totalItems;
        },
        (error) => {
          console.error('Error fetching asset data:', error);
        }
      );
  }

  searchAssets(): void {
    this.crossFlag = this.search.length > 0;
    this.pageNumber = 1;
    this.getAssetData();
  }

  clearSearch(): void {
    this.crossFlag = false;
    this.search = '';
    this.pageNumber = 1;
    this.getAssetData();
  }

  changePage(page: number | string): void {
    if (typeof page === 'string') {
      if (page === 'prev' && this.pageNumber > 1) {
        this.pageNumber--;
      } else if (page === 'next' && this.pageNumber < Math.ceil(this.totalCount / this.itemPerPage)) {
        this.pageNumber++;
      }
    } else {
      this.pageNumber = page;
    }
    this.getAssetData();
  }

  totalPages(): number {
    return Math.ceil(this.totalCount / this.itemPerPage);
  }

  get startIndex(): number {
    return Math.min((this.pageNumber - 1) * this.itemPerPage + 1, this.totalCount);
  }

  get endIndex(): number {
    return Math.min(this.pageNumber * this.itemPerPage, this.totalCount);
  }

  get pages(): number[] {
    const totalPages = Math.ceil(this.totalCount / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  //  asset logs

  isAssetErrorPlaceholder: boolean = false;
  userAssetLog: any;
  isAssetShimmer: boolean = false;
  isAssetPlaceholder: boolean = false;
  searchAssetLogs: string = '';
  pageNumberAsset: number = 1;
  itemPerPageAsset: number = 8;

  getAssetLogsForUserByUuid(): void {
    this.isAssetShimmer = true;
    this.dataService.getAssetLogsForUser(this.userId, this.searchAssetLogs)
      .subscribe(
        (response) => {
          this.userAssetLog = response.listOfObject;
          this.isAssetShimmer = false;
          if(response.listOfObject==null || this.userAssetLog.length == 0) {
          this.isAssetPlaceholder = true;
          }
        },
        (error) => {
          this.isAssetErrorPlaceholder = true;
          this.isAssetShimmer = false;
        }
      );
  }


  // hr policy


  fileUrl!: string;
  docsUploadedDate: any;
  getHrPolicy(): void {
    this.dataService.getOrganizationHrPolicies().subscribe(response => {
      this.fileUrl = response.object.hrPolicyDoc;
      this.docsUploadedDate = response.object.docsUploadedDate;
      // console.log('policy retrieved successfully', response.object);
    }, (error) => {
      console.log(error);
    });
  }

  previewStringDoc: SafeResourceUrl | null = null;
  isPDFDoc: boolean = false;
  isImageDoc: boolean = false;

  @ViewChild('openDocModalButton') openDocModalButton!: ElementRef;
  getFileName(url: string): string {
    return url.split('/').pop() || 'Hr Policy Doc';
  }

  private updateFileTypeDoc(url: string) {
    const extension = url.split('?')[0].split('.').pop()?.toLowerCase();
    // this.isImage2 = ['png', 'jpg', 'jpeg', 'gif'].includes(extension!);
    // this.isPDF = extension === 'pdf';
  }

  openViewModalDoc(url: string): void {
    debugger
    // const fileExtension = url.split('.').pop()?.toLowerCase();
    const fileExtension = url.split('?')[0].split('.').pop()?.toLowerCase();
    // this.isPDF = fileExtension === 'pdf';
    if (fileExtension === 'doc' || fileExtension === 'docx') {
      // this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(`https://docs.google.com/gview?url=${url}&embedded=true`);
      this.previewStringDoc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`);
    } else {
      this.previewStringDoc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    this.openDocModalButton.nativeElement.click();
  }

  downloadFileDoc(url: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = this.getFileName(url);
    link.click();
  }



  //  attendance update fucnionality
  attendanceCheckTimeResponse : AttendanceCheckTimeResponse[] = [];
  getAttendanceChecktimeListDate(): void {
    const formattedDate = this.datePipe.transform(this.requestedDate, 'yyyy-MM-dd');
    this.dataService.getAttendanceChecktimeList(this.userId, formattedDate, this.statusString).subscribe(response => {
      this.attendanceCheckTimeResponse = response.listOfObject;
      // console.log('checktime retrieved successfully', response.listOfObject);
    }, (error) => {
      console.log(error);
    });
  }

  attendanceTimeUpdateForm!: FormGroup;
  requestedDate!: Date;
  statusString!: string;
  attendanceRequestType: string= 'UPDATE';
  selectedDateAttendance!: Date;
  choosenDateString!: string;

  attendanceUpdateRequestLoader : boolean = false;
  submitForm(): void {
    if (this.checkHoliday || this.checkAttendance) {
      return;
     }
      const formValue = this.attendanceTimeUpdateForm.value;
      let attendanceTimeUpdateRequest: AttendanceTimeUpdateRequestDto = {
        managerId: formValue.managerId,
        requestReason: formValue.requestReason
      };

      if (this.attendanceRequestType == 'UPDATE') {
        attendanceTimeUpdateRequest = {
          ...attendanceTimeUpdateRequest,
          attendanceId: formValue.updateGroup.attendanceId,
          updatedTime: formValue.updateGroup.updatedTime,
        };
      } else if (this.attendanceRequestType == 'CREATE') {
        attendanceTimeUpdateRequest = {
          ...attendanceTimeUpdateRequest,
          selectedDateAttendance: formValue.createGroup.selectedDateAttendance,
          inRequestTime: formValue.createGroup.inRequestTime,
          outRequestTime: formValue.createGroup.outRequestTime
        };
      }

      this.attendanceUpdateRequestLoader = true;
      attendanceTimeUpdateRequest.userUuid = this.userId;
      attendanceTimeUpdateRequest.requestType = this.attendanceRequestType;
      attendanceTimeUpdateRequest.choosenDateString = this.choosenDateString;
      this.dataService.sendAttendanceTimeUpdateRequest(attendanceTimeUpdateRequest).subscribe(
        (response) => {
          // console.log('Request sent successfully', response);
          this.attendanceUpdateRequestLoader = false;
          console.log("retrive", response, response.status);
          if(response.status === true) {
          this.resetForm();
          document.getElementById('attendanceUpdateModal')?.click();
          this.attendanceRequestType = 'UPDATE';
          // this.getAttendanceRequestLogData();
          this.helperService.showToast('Request Sent Successfully.', Key.TOAST_STATUS_SUCCESS);
          } else if(response.status === false) {
            // this.resetForm();
            // document.getElementById('attendanceUpdateModal')?.click();
            // this.getAttendanceRequestLogData();
            this.helperService.showToast('Request already registered!', Key.TOAST_STATUS_ERROR);
            }
        },
        (error) => {
          this.attendanceUpdateRequestLoader = false;
          console.error('Error sending request:', error);
        }
      );
    // }
  }


  // submitForm(): void {
  //   debugger
  //   if (this.attendanceTimeUpdateForm.valid) {
  //     const attendanceTimeUpdateRequest: AttendanceTimeUpdateRequestDto = this.attendanceTimeUpdateForm.value;
  //     this.dataService.sendAttendanceTimeUpdateRequest(this.userId, this.attendanceTimeUpdateForm.value, this.attendanceRequestType).subscribe(
  //       (response) => {
  //         console.log('Request sent successfully', response);
  //         this.resetForm();
  //         document.getElementById('attendanceUpdateModal')?.click();
  //         this.getAttendanceRequestLogData();
  //       },
  //       (error) => {
  //         console.error('Error sending request:', error);
  //       }
  //     );
  //   }
  // }

  // onDateChange(date: Date | null): void {
  //   if (date) {
  //     this.requestedDate = date;
  //     this.statusString = this.attendanceTimeUpdateForm.get('requestType')?.value || '';
  //     this.getAttendanceChecktimeListDate();
  //   }
  // }

  onDateChange(date: Date | null): void {
    if (date && this.attendanceRequestType === 'UPDATE') {
      this.requestedDate = date;
      this.choosenDateString = this.helperService.formatDateToYYYYMMDD(date);
      this.statusString = this.attendanceTimeUpdateForm.get('updateGroup.requestType')?.value || '';
      this.getAttendanceChecktimeListDate();
    }
  }

  onDateChangeForCreateAttendance(date: Date | null): void {
    if (date && this.attendanceRequestType === 'CREATE') {
      this.selectedDateAttendance = date;
      this.choosenDateString = this.helperService.formatDateToYYYYMMDD(date);
      console.log(" this.choosenDateString",  this.choosenDateString);
      this.statusString = this.attendanceTimeUpdateForm.get('createGroup.requestType')?.value || '';
      this.getHolidayForOrganization(this.selectedDateAttendance);
      this.getAttendanceExistanceStatus(this.selectedDateAttendance);
    }
  }

  // isAttendanceFormValid(): boolean {
  //   if (this.attendanceRequestType === 'UPDATE') {
  //     return this.attendanceTimeUpdateForm.get('updateGroup')?.valid && this.attendanceTimeUpdateForm.get('managerId')?.valid && this.attendanceTimeUpdateForm.get('requestReason')?.valid;
  //   } else if (this.attendanceRequestType === 'CREATE') {
  //     return this.attendanceTimeUpdateForm.get('createGroup')?.valid && this.attendanceTimeUpdateForm.get('managerId')?.valid && this.attendanceTimeUpdateForm.get('requestReason')?.valid;
  //   }
  //   return false;
  // }

  isAttendanceFormValid(): boolean {

    if(this.checkHoliday === true || this.checkAttendance === true) {
      return false;
    }
    if (this.attendanceRequestType === 'UPDATE') {
      const updateGroup = this.attendanceTimeUpdateForm.get('updateGroup');
      const managerId = this.attendanceTimeUpdateForm.get('managerId');
      const requestReason = this.attendanceTimeUpdateForm.get('requestReason');

      return (updateGroup ? updateGroup.valid : false) &&
             (managerId ? managerId.valid : false) &&
             (requestReason ? requestReason.valid : false);
    } else if (this.attendanceRequestType === 'CREATE') {
      const createGroup = this.attendanceTimeUpdateForm.get('createGroup');
      const managerId = this.attendanceTimeUpdateForm.get('managerId');
      const requestReason = this.attendanceTimeUpdateForm.get('requestReason');

      return (createGroup ? createGroup.valid : false) &&
             (managerId ? managerId.valid : false) &&
             (requestReason ? requestReason.valid : false);
    }
    return false;
  }


  onAttendanceRequestTypeChange(): void {
    this.resetFormFields();
    this.checkHoliday = false;
    this.checkAttendance = false;
  }

  private resetFormFields(): void {
    if (this.attendanceRequestType === 'UPDATE') {
      this.attendanceTimeUpdateForm.get('updateGroup')?.reset();
    } else if (this.attendanceRequestType === 'CREATE') {
      this.attendanceTimeUpdateForm.get('createGroup')?.reset();
    }
    // Optionally reset common fields if needed
    this.attendanceTimeUpdateForm.get('managerId')?.reset();
    this.attendanceTimeUpdateForm.get('requestReason')?.reset();
  }




  resetForm(): void {
    this.attendanceTimeUpdateForm.reset();
  }


disabledDate = (current: Date): boolean => {
  return moment(current).isAfter(moment(), 'day');
}

// attendanceRequestLog: any[] = [];
// pageNumberAttendanceLogs: number = 1;
// itemPerPageAttendanceLogs: number = 5;
// fullAttendanceLogCount:number = 0;
//   getAttendanceRequestLogData(): void {
//     debugger
//     this.dataService.getAttendanceRequestLog(this.userId, this.pageNumberAttendanceLogs, this.itemPerPageAttendanceLogs).subscribe(response => {
//       this.attendanceRequestLog = response.object;
//       this.fullAttendanceLogCount = response.totalItems;
//       console.log('logs retrieved successfully', response.listOfObject);
//     }, (error) => {
//       console.log(error);
//     });
//   }

attendanceRequestLog: any[] = [];

pageNumberAttendanceLogs: number = 1;
itemPerPageAttendanceLogs: number = 5;
fullAttendanceLogCount: number = 0;
isFullLogLoader: boolean = false;
debounceTimer: any;

isShimmerForAttendanceUpdateRequestLog: boolean = false;
dataNotFoundForAttendanceUpdateRequestLog: boolean = false;
networkConnectionErrorForAttendanceUpdateRequestLog: boolean = false;

preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdateRequestLogMethodCall() {
  this.isShimmerForAttendanceUpdateRequestLog = true;
  this.dataNotFoundForAttendanceUpdateRequestLog = false;
  this.networkConnectionErrorForAttendanceUpdateRequestLog = false;
}
getAttendanceRequestLogData() {
  this.attendanceRequestLog = [];
  this.preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdateRequestLogMethodCall();
  return new Promise((resolve, reject) => {
    this.isFullLogLoader = true;
    // if (this.debounceTimer) {
    //   clearTimeout(this.debounceTimer);
    // }
    // this.debounceTimer = setTimeout(() => {

  // this.attendanceRequestLog = [];
  this.dataService.getAttendanceRequestLog(this.userId, this.pageNumberAttendanceLogs, this.itemPerPageAttendanceLogs, '').subscribe(response => {
    if(this.helperService.isObjectNullOrUndefined(response)){
      this.dataNotFoundForAttendanceUpdateRequestLog = true;
    } else{
      this.attendanceRequestLog = [...this.attendanceRequestLog, ...response.object];
      this.fullAttendanceLogCount = response.totalItems;
    }
    this.isFullLogLoader = false;
    this.isShimmerForAttendanceUpdateRequestLog = false;
  }, (error) => {
    this.networkConnectionErrorForAttendanceUpdateRequestLog = true;
    this.isShimmerForAttendanceUpdateRequestLog = false;
    this.isFullLogLoader = false;
  });
// }, debounceTime);
});
}
initialLoadDone: boolean = false;
@ViewChild('logContainer') logContainer!: ElementRef<HTMLDivElement>;
scrollDownRecentActivity(event: any) {
  debugger
  if (!this.initialLoadDone) return;

  if(this.fullAttendanceLogCount < ((this.pageNumberAttendanceLogs - 1) * this.itemPerPageAttendanceLogs)) {
    return;
  }
  const target = event.target as HTMLElement;
  const atBottom =
    target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

  if (atBottom) {
    this.pageNumberAttendanceLogs++;
    this.getAttendanceRequestLogData();
  }
}

loadMoreLogs(): void {
  this.initialLoadDone = true;
  this.pageNumberAttendanceLogs++;
  // this.attendanceRequestLog = [];
  this.getAttendanceRequestLogData();
  // setTimeout(() => {
  //   this.scrollToBottom();
  // }, 500);
}

closeAttendanceFunc() {
  this.attendanceRequestLog = [];
  this.pageNumberAttendanceLogs = 1;
}


  //  super coins func

  employeeSuperCoinsResponse: EmployeeSuperCoinsResponse = {
    totalSuperCoins: 0,
    totalDonatedCoins: 0,
    totalGainedCoins: 0,
    currentMonthTotalCoins: 0
  };
  getSuperCoinsResponseForEmployeeData() {
    // console.log('this.userId' + this.userId);
    this.dataService.getSuperCoinsResponseForEmployee(this.userId).subscribe(response => {
        // console.log("success");
        this.employeeSuperCoinsResponse = response.object;
    }, (error) => {
      console.log(error);
    });
  }

  donateCoinsUserList: DonateCoinsUserList[] = [];

  getUserListToDonateCoins(): void {
    debugger
    this.dataService.getUserListToDonateCoins(this.userId).subscribe(data => {
      this.donateCoinsUserList = data.listOfObject;
      // console.log('this.donateCoinsUserList',this.donateCoinsUserList);
    },
    error => {
      console.error("Error fetching roles", error);
    });
  }

  donateSuperCoinReasonList: DonateSuperCoinsReasonResponse[] = [];
  getDonateSuperCoinReasonData(): void {
    this.dataService.getDonateSuperCoinReason().subscribe(data => {
      this.donateSuperCoinReasonList = data.listOfObject;
    },
    error => {
      console.error("Error fetching roles", error);
    });
  }

  donateCoinsForm!: FormGroup;
  isReasonTyped: boolean = false;
  isReason: number = 0;
  toggleReason(isTyped: boolean): void {
    this.isReasonTyped = isTyped;
    if (this.donateCoinsForm) {
      if (isTyped) {
        // this.donateCoinsForm.get('reason')?.reset();
        this.isReasonTyped = true;
      } else {
        // this.donateCoinsForm.get('donationReason')?.reset();
        this.isReasonTyped = false;
      }
    }
  }






  // Requesting for overtime
  dateRange : Date[] = [];
  // Validation error message
  validationError: string | null = null;
  selectTimeForOvertimeRequest(dates: Array<Date | null> | Date | Date[] | null): void {
    this.validationError = null; // Reset validation error message

    if (Array.isArray(dates) && dates.length === 2) {
      const startTime = dates[0] ? new Date(dates[0]) : null;
      const endTime = dates[1] ? new Date(dates[1]) : null;

      if (startTime && endTime) {
        // Check if end time is before start time
        if (endTime < startTime) {
          this.validationError = 'End time cannot be earlier than start time.';
          this.overtimeRequestDTO.workingHour = null;
          return; // Exit early if the validation fails
        }

        // Calculate the time difference
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationInHours = durationMs / (1000 * 60 * 60); // Convert milliseconds to hours

        // Check if the duration exceeds 23 hours 59 minutes
        if (durationInHours > 23.9833) { // 23.9833 hours is 23 hours 59 minutes
          this.validationError = 'The duration cannot exceed 23 hours, 59 minutes.';
          this.overtimeRequestDTO.workingHour = null;
        } else {
          // Valid duration
          const formattedDuration = this.helperService.durationBetweenTwoDatesInHHmmssFormat(endTime, startTime);
          this.overtimeRequestDTO.startTime = startTime;
          this.overtimeRequestDTO.endTime = endTime;
          this.overtimeRequestDTO.workingHour = formattedDuration;
        }
      }
    } else if (dates === null) {
      // Handle null case (clearing the date range)
      this.overtimeRequestDTO.startTime = null;
      this.overtimeRequestDTO.endTime = null;
      this.overtimeRequestDTO.workingHour = '';
    }
  }



  // // Disable inappropriate dates based on the start date
  // disabledDateForOvertimeRequest = (current: Date): boolean => {
  //   if (this.dateRange && this.dateRange[0]) {
  //     const nextValidDate = new Date(this.dateRange[0]); // Clone the start date
  //     nextValidDate.setDate(nextValidDate.getDate() + 1); // Set the next valid date to the day after the start date

  //     return current && current < nextValidDate; // Compare both as Date objects
  //   }
  //   return false; // No date is disabled if no start date is selected
  // };


  overtimeRequestLoader : boolean = false;
  overtimeRequestDTO : OvertimeRequestDTO = new OvertimeRequestDTO();
  registerOvertimeRequestMethodCall(){
    this.overtimeRequestLoader = true;
    this.dataService.registerOvertimeRequest(this.overtimeRequestDTO).subscribe((response) => {
      this.overtimeRequestLoader = false;
      this.clearOvertimeRequestModal();
      this.closeOvertimeRequestModal.nativeElement.click();
      this.helperService.showToast('Overtime request submitted successfully.', Key.TOAST_STATUS_SUCCESS);
      this.getOvertimeRequestLogResponseByUserUuidMethodCall();
    }, (error) => {
      this.overtimeRequestLoader = false;
      this.helperService.showToast('Error while submitting the request!', Key.TOAST_STATUS_ERROR);
    })

  }


  @ViewChild("closeOvertimeRequestModal") closeOvertimeRequestModal !: ElementRef;
  clearOvertimeRequestModal(){
    this.overtimeRequestDTO = new OvertimeRequestDTO();
    this.overtimeRequestDTO.startTime = null;
    this.overtimeRequestDTO.endTime = null;
    this.dateRange = [];
  }


  LEAVE_LOG_TOGGLE : boolean = false;
  OVERTIME_LOG_TOGGLE : boolean = false;
  LOP_REVERSAL_LOG_TOGGLE : boolean = false;

  LEAVE_LOG = Key.LEAVE_LOG;
  OVERTIME_LOG = Key.OVERTIME_LOG;
  LOP_REVERSAL_LOG = Key.LOP_REVERSAL_LOG;
  ATTENDANCE_UPDATE_REQUEST_LOG = Key.ATTENDANCE_UPDATE_REQUEST_LOG;

  ACTIVE_LOG_TAB = Key.LEAVE_LOG;

  changeLogTabInAttendanceTab(tabId : number){
    this.ACTIVE_LOG_TAB = tabId;
  }

  overtimeRequestLogResponseList : OvertimeRequestLogResponse[] = [];
  getOvertimeRequestLogResponseByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForOvertimeLogMethodCall();
    this.dataService.getOvertimeRequestLogResponseByUserUuid(this.userId, '').subscribe((response) => {
      if(this.helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForOvertimeLog = true;
      } else{
        this.overtimeRequestLogResponseList = response.listOfObject;
      }

      this.isShimmerForOvertimeLog = false;
    }, (error) => {
      this.isShimmerForOvertimeLog = false;
      this.networkConnectionErrorPlaceHolderForOvertimeLog = true;
    })
  }


  lopReversalApplicationResponseList : LopReversalApplicationResponse[] = [];
  getLopReversalApplicationLogResponseListByUserUuidMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForLopReversalApplicationMethodCall();
    this.dataService.getLopReversalApplicationResponseListByUserUuid(this.userId).subscribe((response) => {
      if(this.helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForLopReversalApplication = true;
      } else{
        this.lopReversalApplicationResponseList = response.listOfObject;
      }
      this.isShimmerForLopReversalApplication = false;
    }, (error) => {
      this.isShimmerForLopReversalApplication = false;
      this.networkConnectionErrorPlaceHolderForLopReversalApplication = true;
    })
  }

  checkHoliday:boolean = false;

 getHolidayForOrganization(selectedDate:any){
    debugger
    this.checkHoliday = false;
    this.dataService.getHolidayForOrganization(this.helperService.formatDateToYYYYMMDD(selectedDate))
    .subscribe(
      (response) => {
        this.checkHoliday = response.object;
        console.log(response);
        console.error("Response", response.object);
      },
      (error) =>{
        console.error('Error details:', error);
      }
  )
  }

  checkAttendance:boolean = false;
  getAttendanceExistanceStatus(selectedDate:any){
    debugger
    this.checkAttendance = false;
    this.dataService.getAttendanceExistanceStatus(this.userId, this.helperService.formatDateToYYYYMMDD(selectedDate))
    .subscribe(
      (response) => {
        this.checkAttendance = response.object;
        console.log(response);
        console.error("Response", response.object);
      },
      (error) =>{
        console.error('Error details:', error);
      }
  )
  }








  // regDate = new Date('2023-01-01'); // Example registration date
  selectedYear = this.date.getFullYear();
  selectedMonth = this.date.getMonth() + 1;

  // Generate a list of years (from registration year to current year)
  yearList :number[]= [];

  // List of months
  monthList = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];



  // Disable months earlier than registration date if the selected year matches the registration year
  disableMonth = (month: number): boolean => {
    if (this.selectedYear === this.joiningDate.getFullYear()) {
      return month < (this.joiningDate.getMonth() + 1); // disable months before regDate in the registration year
    }
    return false;
  };

  // Handle year change
  onYearChange(year: number) {
    this.selectedYear = year;
    this.updateCalendarDate();
  }



  // Update the calendar date based on the selected month and year
  updateCalendarDate() {
    // console.log("this.selectedYear",this.selectedYear)
    this.date = new Date(this.selectedYear, this.selectedMonth - 1, 1);
  }

  // Generate year list from registration year to the current year
  generateYearList(): number[] {
    if(!this.joiningDate){
      this.joiningDate = new Date(this.onboardingPreviewData.user.joiningDate);
    }
    const startYear = this.joiningDate.getFullYear();
    const currentYear = new Date().getFullYear();
    const years = [];
    // console.log(startYear)
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    // console.log("years ",years)
    return years;
  }

  /** Create and View Expense start */

  expenseList: any[] = new Array();
  loading: boolean = false;
  statusIds: number[] = new Array()
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  // expSelected:any;
   getExpenses() {
    debugger
    this.loading = true;
    this.expenseList = []
    // this.ROLE = await this.rbacService.getRole();

    if(this.expenseSelectedDate == null){
      this.startDate = '';
      this.endDate = '';
    }

    this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate, this.statusIds, this.userId).subscribe((res: any) => {
      if (res.status) {
        this.expenseList = res.object
        this.loading = false
      }else{
        this.expenseList = []
        this.loading = false
      }
    })
  }

  expenseSelectedDate: Date | null = null;
  onExpenseMonthChange(month: Date): void {
    this.expenseSelectedDate = month;

    if(this.expenseSelectedDate){
        // Calculate the start of the month (first day of the month) and set time to start of the day
      const startOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth(), 1);

      // Calculate the end of the month (last day of the month) and set time to end of the day
      const endOfMonth = new Date(this.expenseSelectedDate.getFullYear(), this.expenseSelectedDate.getMonth() + 1, 0);

      this.startDate = startOfMonth.toDateString() + " 00:00:00"; // Date object
      this.endDate = endOfMonth.toDateString() + " 23:59:59"; // Date object
    }
    this.getExpenses();
  }


  /** Expense start **/

  expenseTypeList: any[] = new Array();
  expenseTypeReq: ExpenseType = new ExpenseType();
  expenseTypeId: number = 0;
  getExpenseTypeId(id: any) {
    this.expenseTypeReq.expenseTypeId = id
  }

  getExpenseType() {

    this.expenseTypeReq = new ExpenseType();
    this.expenseTypeId = 0

    this.expenseTypeList = []
    this.dataService.getExpenseType().subscribe((res: any) => {

      if (res.status) {
        this.expenseTypeList = res.object;
      }

    }, error => {
      console.log('something went wrong')
    })
  }

  // Watch for changes in the expense date for the custom date range
  isExpenseDateSelected: boolean = true;
  isCustomDateRange: boolean = false;
  selectExpenseDate(startDate: Date) {
    if (this.isCustomDateRange && startDate) {
      this.expenseTypeReq.expenseDate = this.helperService.formatDateToYYYYMMDD(startDate);
    }
  }

  validatePolicyToggle: boolean = false;
  limitAmount: any;
  checkExpensePolicy(form: NgForm) {
    debugger
    this.dataService.checkExpensePolicy(this.expenseTypeReq.expenseTypeId, this.expenseTypeReq.amount).subscribe((res: any) => {
      this.limitAmount = res.object;

      if (this.limitAmount > 0) {
        this.validatePolicyToggle = true;
      } else {
        this.createExpense(form);
      }
    })
  }

  setValidateToggle() {
    this.validatePolicyToggle = false;
  }

  managerId: number = 0
  getManagerId(id: any) {
    this.expenseTypeReq.managerId = id
  }

  @ViewChild('closeExpenseButton') closeExpenseButton!: ElementRef
  createToggle: boolean = false;
  createExpense(form: NgForm) {
    debugger
    this.createToggle = true;

    this.dataService.createExpense(this.expenseTypeReq).subscribe((res: any) => {
      if (res.status) {
        this.expenseTypeReq = new ExpenseType();
        this.expenseTypeId = 0;
        this.managerId = 0
        this.expenseTypeReq.id = 0;
        this.validatePolicyToggle = false;
        form.resetForm();
        this.getExpenses();
        this.createToggle = false;
        this.closeExpenseButton.nativeElement.click()
        this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
      }
    })

    // console.log('createExpense Req: ', this.expenseTypeReq)
    // this.expenseTypeReq = new ExpenseType();

    // this.expenseTypeId = 0;
    // this.validatePolicyToggle = false;
    // this.managerId = 0
    // this.createToggle = false;
    // form.resetForm();
    // this.getExpenses();

    // this.closeExpenseButton.nativeElement.click()
    console.log('Created Successfully')
  }

  async updateExpense(expense: any) {
    await this.getExpenseType();

    // setTimeout(() =>{
    //   this.fetchManagerNames()
    // })

    // this.getManagerId(expense.managerId)

    this.expenseTypeReq.id = expense.id
    this.expenseTypeReq.amount = expense.amount
    this.expenseTypeReq.expenseDate = expense.expenseDate
    this.expenseTypeReq.expenseTypeId = expense.expenseTypeId
    this.expenseTypeReq.notes = expense.notes
    this.expenseTypeReq.url = expense.slipUrl
    this.expenseTypeReq.managerId = expense.managerId
    this.expenseTypeId = expense.expenseTypeId
    this.managerId = expense.managerId



  }

  clearExpenseForm(form: NgForm) {
    this.expenseTypeReq = new ExpenseType();
    this.expenseTypeId = 0;
    this.validatePolicyToggle = false;
    form.resetForm();
  }

  deleteImage() {
    this.expenseTypeReq.url = ''
  }

  expenseId: number = 0;
  getExpenseId(id: number) {
    this.expenseId = id;
    console.log('id: ', this.expenseId)
  }

  deleteToggle: boolean = false
  @ViewChild('closeButtonDeleteExpense') closeButtonDeleteExpense!: ElementRef
  deleteExpense() {

    this.dataService.deleteExpense(this.expenseId).subscribe((res: any) => {
      if (res.status) {
        this.closeButtonDeleteExpense.nativeElement.click()
        this.getExpenses();
        this.helperService.showToast(
          'Expense deleted successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      }
    })
  }

  // Function to disable future dates
  disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    // Disable dates after today
    return current && current >= today;
  };

  userExpense: any;
  getExpense(expense: any) {
    this.userExpense = expense
  }

  isCheckboxChecked: boolean = false
  partialAmount: string = '';
  onCheckboxChange(checked: boolean): void {
    this.isCheckboxChecked = checked;
    if (!checked) {
      this.partialAmount = '';
    }
  }

  clearApproveModal() {
    this.isCheckboxChecked = false;
    this.partialAmount = '';
  }

  approveToggle: boolean = false;
  @ViewChild('closeApproveModal') closeApproveModal!: ElementRef
  approveOrDeny(id: number, status: string) {
    console.log(id, status)
    this.isCheckboxChecked = false;
    this.partialAmount = '';
    this.closeApproveModal.nativeElement.click()
  }



  /** Company Expense end **/

  /** Create and view expense end */

}



