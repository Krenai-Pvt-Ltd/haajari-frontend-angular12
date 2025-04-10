import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationExtras} from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { DatePipe } from '@angular/common';
import {
  AttendanceWithLatePerformerResponseDto,
  AttendanceWithTopPerformerResponseDto,
} from 'src/app/models/Attendance.model';
import { HelperService } from 'src/app/services/helper.service';
import moment from 'moment';
import { LateEmployeeAttendanceDetailsResponse } from 'src/app/models/late-employee-attendance-details-response';
import { AttendanceReportResponse } from 'src/app/models/attendance-report-response';
import { Key } from 'src/app/constant/key';
import { BestPerformerAttendanceDetailsResponse } from 'src/app/models/best-performer-attendance-details-response';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { AttendanceDetailsCountResponse } from 'src/app/models/attendance-details-count-response';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { AttendanceDetailsResponse } from 'src/app/models/attendance-details-response';
import { StartDateAndEndDate } from 'src/app/models/start-date-and-end-date';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';
import { AdminPersonalDetailResponse } from 'src/app/models/admin-personal-detail-response';
import { SubscriptionPlan } from 'src/app/models/SubscriptionPlan';
import { SubscriptionPlanReq } from 'src/app/models/SubscriptionPlanReq';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
declare var Razorpay: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private router: Router,
    private datePipe: DatePipe,
    private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService,
    private _subscriptionPlanService: SubscriptionPlanService,
    private roleBasedAccessControlService: RoleBasedAccessControlService
  ) {

    // console.log(this.roleBasedAccessControlService.isUserInfoInitialized,"--9999-----");

    const currentDate = moment();
    this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD');
    this.endDateStr = currentDate.endOf('month').format('YYYY-MM-DD');

    // Set the default selected month
    this.month = currentDate.format('MMMM');

    this.getFirstAndLastDateOfMonth(this.selectedDate);
    let token = localStorage.getItem('token')!;
    const helper = new JwtHelperService();
  }

  itemPerPage: number = 12;
  pageNumber: number = 1;
  firstPageNumber: number = 1;
  lastPageNumber: number = 0;
  total!: number;
  totalLateEmployees: number = 0;
  rowNumber: number = 1;
  searchText: string = '';
  searchBy: string = '';
  dataFetchingType: string = '';
  selectedSubscriptionId: number = 3;
  // selected: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};
  myAttendanceDataLength = 0;
  attendanceArrayDate: any = [];
  project: boolean = false;

  loginDetails = this.helperService.getDecodedValueFromToken();
  //  role:string = this.rbacService.getRole();
  //  userUuid: string = this.rbacService.getUUID();
  //  orgRefId:string = this.rbacService.getOrgRefUUID();

  startDateStr: string = '';
  endDateStr: string = '';
  month: string = '';
  inputDate: string = '';

  PRESENT = Key.PRESENT;
  ABSENT = Key.ABSENT;
  UNMARKED = Key.UNMARKED;
  WEEKEND = Key.WEEKEND;
  HOLIDAY = Key.HOLIDAY;
  LEAVE = Key.LEAVE;
  HALFDAY = Key.HALFDAY;

  readonly INITIAL_HOUR = Key.INITIAL_HOUR;
  readonly END_HOUR = Key.END_HOUR;

  async getRoleDetails() {
    this.ROLE = await this.rbacService.getRole();
  }

  ROLE: any;
  ADMIN = Key.ADMIN;
  MANAGER = Key.MANAGER;
  USER = Key.USER;

  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';
  startDateAndEndDate : StartDateAndEndDate = new StartDateAndEndDate();



  onError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = './assets/images/broken-image-icon.jpg';
  }


  onMonthChange(month: Date): void {
    // console.log('Month is getting selected');
    this.selectedDate = month;
    this.getFirstAndLastDateOfMonth(this.selectedDate);
    this.isAllCollapsed = true;
    // console.log(this.startDate, this.endDate);
    this.getAttendanceReportByDateDurationMethodCall();
  }

  getFirstAndLastDateOfMonth(selectedDate: Date) {

    this.startDate = this.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    this.endDate = this.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    );
  }

  // calculation till current date
  // getFirstAndLastDateOfMonth(selectedDate: Date) {
  //   const currentDate = new Date();
  //   const isCurrentMonth =
  //     selectedDate.getFullYear() === currentDate.getFullYear() &&
  //     selectedDate.getMonth() === currentDate.getMonth();

  //   this.startDate = this.formatDateToYYYYMMDD(
  //     new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  //   );

  //   // If the selected date is in the current month, use the current date as the end date
  //   if (isCurrentMonth) {
  //     this.endDate = this.formatDateToYYYYMMDD(currentDate);
  //   } else {
  //     this.endDate = this.formatDateToYYYYMMDD(
  //       new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
  //     );
  //   }
  // }

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
      dateYear < organizationRegistrationYear ||
      (dateYear === organizationRegistrationYear &&
        dateMonth < organizationRegistrationMonth)
    ) {
      return true;
    }

    // Disable if the month is after the current month
    if (
      dateYear > currentYear ||
      (dateYear === currentYear && dateMonth > currentMonth)
    ) {
      return true;
    }

    // Enable the month if it's from January 2023 to the current month
    return false;
  };

  organizationRegistrationDate: string = '';
  getOrganizationRegistrationDateMethodCall() {
    debugger;
    this.dataService.getOrganizationRegistrationDate().subscribe(
      (response) => {
        this.organizationRegistrationDate = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ngOnInit(): void {
    this.orgUuid = this.roleBasedAccessControlService.getOrgRefUUID();
    this.getActiveUserCount();
    this.selecrPlanType('annual');
    this.getAdminPersonalDetailMethodCall();
    this.getTeamNames();
    window.scroll(0, 0);
    this.getOrganizationRegistrationDateMethodCall();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
    // this.checkAccessToken();

    // const today = dayjs();
    // const firstDayOfMonth = today.startOf('month');
    // const lastDayOfMonth = today.endOf('month');

    // this.selected = {
    //   startDate: firstDayOfMonth,
    //   endDate: lastDayOfMonth
    // };

    // console.log(this.helperService.getModulesWithSubModules());

    // this.getModulesWithTheirSubModulesMethodCall();

    // this.decodedAccessToken = this.rbacService.getModules();
    debugger;
    this.getRoleDetails();
    this.getAttendanceDetailsCountMethodCall();
    this.getAttendanceReportByDateDurationMethodCall();
    this.getLateEmployeeAttendanceDetailsMethodCall();

    // this.getAttendanceTopPerformerDetails();
    // this.getAttendanceLatePerformerDetails();
    this.getBestPerformerAttendanceDetailsMethodCall();

    // this.getDataFromDate();
    // this.getTodaysLiveLeaveCount();

    this.inputDate = this.getCurrentDate();
    this.getWeeklyChartData();
    this.getMonthlyChartData();
    this.getLateUsers();
    // this.getAttendanceDetailsReportByDateMethodCall();
    this.getHolidayForOrganization();
    // this.getAllSubscription();
    this.getPurchasedStatus();
  }

  // ngAfterViewInit(): void {
  //   this.modalService.open(this.billingAndSubscriptionModal, { backdrop: 'static', keyboard: false });
  // }

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;

  decodedAccessToken: any;

  preRuleForShimmersAndErrorPlaceholdersMethodCall() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  isShimmerForAttendanceData = false;
  dataNotFoundPlaceholderForAttendanceData = false;
  networkConnectionErrorPlaceHolderForAttendanceData = false;

  preRuleForShimmersAndErrorPlaceholdersForAttendanceDataMethodCall() {
    this.isShimmerForAttendanceData = true;
    this.dataNotFoundPlaceholderForAttendanceData = false;
    this.networkConnectionErrorPlaceHolderForAttendanceData = false;
  }

  isShimmerForBestPerfomer = false;
  dataNotFoundPlaceholderForBestPerfomer = false;
  networkConnectionErrorPlaceHolderForBestPerformer = false;

  preRuleForShimmersAndErrorPlaceholdersForBestPerformerMethodCall() {
    this.isShimmerForBestPerfomer = true;
    this.dataNotFoundPlaceholderForBestPerfomer = false;
    this.networkConnectionErrorPlaceHolderForBestPerformer = false;
  }

  // selectMonth(selectedMonth: string): void {
  //   this.month = selectedMonth;
  //   const selectedDate = moment().month(selectedMonth).startOf('month');
  //   this.startDateStr = selectedDate.format('YYYY-MM-DD');
  //   this.endDateStr = selectedDate.endOf('month').format('YYYY-MM-DD');

  //   // Fetch data using the selected start and end dates
  //   this.getAttendanceTopPerformerDetails();
  //   // this.getAttendanceLatePerformerDetails();
  //   // this.getDataFromDate();
  //   this.getAttendanceReportByDateDurationMethodCall();
  // }

  // checkAccessToken(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if (!loginDetails) {
  //     this.router.navigate(['/dynamic/login']);
  //   }
  // }

  isAttendanceShimer: boolean = false;
  errorToggleMain: boolean = false;

  @ViewChild('attendanceMasterRollReport')
  attendanceMasterRollReport!: ElementRef;

  getDataFromDate(): Promise<any> {
    return new Promise((resolve, reject) => {
      debugger;
      this.myAttendanceData = {};
      this.myAttendanceDataLength = 0;

      this.preRuleForShimmersAndErrorPlaceholdersForAttendanceDataMethodCall();

      this.dataService
        .getAttendanceDetailsByDateDuration(
          this.startDateStr,
          this.endDateStr,
          this.pageNumber,
          this.itemPerPage,
          this.searchText,
          this.searchBy
        )
        .subscribe(
          (response: any) => {
            debugger;
            if (
              response.mapOfObject === undefined ||
              response.mapOfObject === null
            ) {
              this.dataNotFoundPlaceholderForAttendanceData = true;
              resolve(true);
            } else {
              // Processing the response
              this.myAttendanceData = response.mapOfObject;
              this.myAttendanceDataLength = Object.keys(
                this.myAttendanceData
              ).length;

              if (this.myAttendanceDataLength === 0) {
                this.dataNotFoundPlaceholderForAttendanceData = true;
              }

              this.total = response.totalItems;
              this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);

              debugger;
              // console.log(this.myAttendanceData);
              this.isAttendanceShimer = false;

              // Additional processing if needed

              // Resolve the promise when data is successfully processed
              resolve(true);
            }
          },
          (error: any) => {
            this.networkConnectionErrorPlaceHolderForAttendanceData = true;
            console.error('Error fetching data:', error);
            resolve(true);
          }
        );
    });
  }

  // #########Searching#################
  resetCriteriaFilter() {
    this.itemPerPage = 12;
    this.pageNumber = 1;
  }
  searchUsers(event: Event) {
    this.attendanceMasterRollReport.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
    if (event instanceof KeyboardEvent) {
      const ignoreKeys = [
        'Shift',
        'Control',
        'Alt',
        'Meta',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Escape',
      ];

      const isCmdA =
        (event.key === 'a' || event.key === 'A') &&
        (event.metaKey || event.ctrlKey);
      if (ignoreKeys.includes(event.key) || isCmdA) {
        return;
      }
    }

    this.myAttendanceData = {};
    this.total = 0;
    this.isShimer = true;
    this.databaseHelper.currentPage = 1;
    this.resetCriteriaFilter();
    // this.getDataFromDate();
    this.getAttendanceReportByDateDurationMethodCall();
  }

  clearSearchText() {
    this.searchText = '';
    // this.getDataFromDate();
    this.getAttendanceReportByDateDurationMethodCall();
  }

  // ##### Pagination ############
  async changePage(page: number | string) {
    debugger;
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    await this.getAttendanceReportByDateDurationMethodCall();

    // this.isAllCollapsed = !this.isAllCollapsed;
    if (!this.isAllCollapsed) {
      setTimeout(() => {
        this.toggleAllCollapse(true);
      }, 10);
    }
  }

    //Pagination
    databaseHelper: DatabaseHelper = new DatabaseHelper();
    // totalItems: number = 0;
    pageChanged(page: any) {
      if (page != this.databaseHelper.currentPage) {
        this.databaseHelper.currentPage = page;
        this.getAttendanceReportByDateDurationMethodCall();
      }
    }

    getStartIndex(): number {
      return (this.databaseHelper.currentPage - 1) * this.databaseHelper.itemPerPage + 1;
    }
    getEndIndex(): number {
      const endIndex = this.databaseHelper.currentPage * this.databaseHelper.itemPerPage;
      return endIndex > this.total ? this.total : endIndex;
    }

  getPages(): number[] {
    const totalPages = Math.ceil(this.total / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.itemPerPage);
  }
  // getStartIndex(): number {
  //   return (this.pageNumber - 1) * this.itemPerPage + 1;
  // }
  // getEndIndex(): number {
  //   const endIndex = this.pageNumber * this.itemPerPage;
  //   return endIndex > this.total ? this.total : endIndex;
  // }

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

  attendanceString: string = '';
  today: Date = new Date();
  convertStringToDate(attendance: AttendenceDto) {
    if (attendance.converterDate == undefined) {
      attendance.converterDate = new Date(attendance.createdDate);
    }
    return attendance.converterDate;
  }

  getFirstName(fullName: string): string {
    const names = fullName.split(' ');
    return names.length > 0 ? names[0] : '';
  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ####################Expand - Collapse All Functionalities################################

  isAllCollapsed = true;

  toggleAllCollapse(toggle: boolean) {
    debugger;
    this.isAllCollapsed = !toggle;

    let elements = document.querySelectorAll('.bi-chevron-right');
    elements.forEach((element) => {
      if (this.isAllCollapsed && !element.classList.contains('collapsed')) {
        (element as HTMLElement).click();
      } else if (
        !this.isAllCollapsed &&
        element.classList.contains('collapsed')
      ) {
        (element as HTMLElement).click();
      }
    });
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

  flag!: boolean;

  checkingUserRoleMethod(): boolean {
    this.dataService.checkingUserRole().subscribe(
      (data) => {
        this.flag = data;
        // console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
    // console.log(this.flag);

    return this.flag;
  }

  calculateTotalDuration(attendances: AttendenceDto[]): number {
    return attendances.reduce((totalDuration, attendance) => {
      if (attendance.duration) {
        const durationParts = attendance.duration
          .split(' ')
          .filter((part) => !isNaN(Number(part)));
        const durationInSeconds = durationParts.reduce(
          (acc, part) => acc + Number(part),
          0
        );
        return totalDuration + durationInSeconds;
      }
      return totalDuration;
    }, 0);
  }

  responseDto: AttendanceWithTopPerformerResponseDto = {
    attendanceTopPerformers: [],
    // attendanceLatePerformers: []
  };

  responseData: AttendanceWithLatePerformerResponseDto = {
    // attendanceTopPerformers: [],
    attendanceLatePerformers: [],
  };

  // responseDto!: AttendanceWithTopPerformerResponseDto;

  isShimer: boolean = false;
  isLateShimmer: boolean = false;
  errorToggleTop: boolean = false;
  errorToggleLate: boolean = false;
  getAttendanceTopPerformerDetails() {
    this.preRuleForShimmersAndErrorPlaceholdersForBestPerformerMethodCall();
    debugger;
    this.dataService
      .getAttendanceTopPerformers(this.startDateStr, this.endDateStr)
      .subscribe(
        (data) => {
          // console.log(data);
          this.responseDto = data;

          if (
            data.attendanceTopPerformers.length === 0 ||
            data === undefined ||
            data === null
          ) {
            this.dataNotFoundPlaceholderForBestPerfomer = true;
          }
          // if(data.attendanceLatePerformers){
          //   this.isLateShimmer=false;
          // }
          // console.log(this.responseDto);
        },
        (error) => {
          // console.error(error);
          this.isShimer = false;
          this.networkConnectionErrorPlaceHolderForBestPerformer = true;
        }
      );
  }

  getAttendanceLatePerformerDetails() {
    this.isLateShimmer = true;
    debugger;
    this.dataService
      .getAttendanceLatePerformers('2023-12-04', '2023-12-04')
      .subscribe(
        (data) => {
          // console.log(data);
          this.responseData = data;

          if (data.attendanceLatePerformers) {
            this.isLateShimmer = false;
          }
          // console.log(this.responseDto);
        },
        (error) => {
          this.isLateShimmer = false;
          this.errorToggleLate = true;
          console.error(error);
        }
      );
  }

  // #########################################################

  bestPerformerAttendanceDetailsResponseList: BestPerformerAttendanceDetailsResponse[] =
    [];

  getBestPerformerAttendanceDetailsMethodCall() {
    debugger;
    this.preRuleForShimmersAndErrorPlaceholdersForBestPerformerMethodCall();
    this.dataService
      .getBestPerformerAttendanceDetails(this.startDateStr, this.endDateStr)
      .subscribe(
        (response) => {
          this.bestPerformerAttendanceDetailsResponseList = response;

          if (
            response === undefined ||
            response === null ||
            response.length === 0
          ) {
            this.dataNotFoundPlaceholderForBestPerfomer = true;
          }
        },
        (error) => {
          console.log(error);
          this.networkConnectionErrorPlaceHolderForBestPerformer = true;
        }
      );
  }

  lateEmployeeAttendanceDetailsResponseList: LateEmployeeAttendanceDetailsResponse[] =
    [];
  viewAll: string = Key.VIEW_ALL;
  viewLess: string = Key.VIEW_LESS;
  lateEmployeeDataLoaderButton: boolean = false;

  viewAllLateEmployeeAttendanceDetails(view: any) {
    this.lateEmployeeDataLoaderButton = true;
    this.dataFetchingType = view;
    this.getLateEmployeeAttendanceDetailsMethodCall();
  }

  getLateEmployeeAttendanceDetailsMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.dataService
      .getLateEmployeeAttendanceDetails(this.getCurrentDate(), this.dataFetchingType)
      .subscribe(
        (response) => {
          this.lateEmployeeAttendanceDetailsResponseList =
            response.listOfObject;
          this.totalLateEmployees = response.totalItems;

          if (
            response === undefined ||
            response === null ||
            response.listOfObject.length === 0
          ) {
            this.dataNotFoundPlaceholder = true;
          }
          this.lateEmployeeDataLoaderButton = false;
        },
        (error) => {
          console.log(error);
          this.networkConnectionErrorPlaceHolder = true;
          this.lateEmployeeDataLoaderButton = false;
        }
      );
  }

  visibleManagersCount: number = 1;

  showAllManagers(length: number) {
    this.visibleManagersCount = length;
  }

  hideSomeManagers() {
    this.visibleManagersCount = 1;
  }

  // ######################################################################

  attendanceReportResponseList: AttendanceReportResponse[] = [];
  debounceTimer: any;
  getAttendanceReportByDateDurationMethodCall(debounceTime: number = 300) {
    debugger
    return new Promise((resolve, reject) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.attendanceReportResponseList = [];
        this.preRuleForShimmersAndErrorPlaceholdersForAttendanceDataMethodCall();

        // this.dataService.getAttendanceReportByDateDuration(this.startDate,this.endDate,this.pageNumber,this.itemPerPage,this.searchText,this.searchBy,this.selectedTeamId)
        this.dataService.getAttendanceReportByDateDuration(this.startDate, this.endDate, this.databaseHelper.currentPage ,this.databaseHelper.itemPerPage,
          this.searchText, this.searchBy, this.selectedTeamId)
          .toPromise()
          .then((response) => {
            if (
              response === null ||
              response === undefined ||
              response.object === undefined ||
              response.object === null ||
              response.object.length === 0
            ) {
              this.dataNotFoundPlaceholderForAttendanceData = true;
              reject('Data not found.');
              return;
            }

            this.attendanceReportResponseList = response.object;
            this.total = response.totalItems;
            setTimeout(() => {
            this.toggleAllCollapse(!this.isAllCollapsed);
            }, 10);
            this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            resolve(response);
          })
          .catch((error) => {
            this.networkConnectionErrorPlaceHolderForAttendanceData = true;
            reject(error);
          });
      }, debounceTime);
    });
  }

  expandedStates: boolean[] = [];
  toggleCollapse(index: number): void {
    this.expandedStates[index] = !this.expandedStates[index];
  }

  downloadingFlag: boolean = false;
  downloadAttendanceDataInExcelFormatMethodCall() {
    debugger
    this.downloadingFlag = true;
    this.dataService
      .downloadAttendanceDataInExcelFormat(this.startDate, this.endDate)
      .subscribe(
        (response) => {
          // console.log(response);

          const downloadLink = document.createElement('a');
          // downloadLink.href = response.message;
          downloadLink.href = response.object;
          downloadLink.download = 'attendance.xlsx';
          downloadLink.click();
          this.downloadingFlag = false;
        },
        (error) => {
          console.log(error);
          this.downloadingFlag = false;
        }
      );
  }

  getCurrentDate() {
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = (todayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = todayDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  attendanceDetailsCountResponse: AttendanceDetailsCountResponse =
    new AttendanceDetailsCountResponse();
  getAttendanceDetailsCountMethodCall() {
    this.dataService.getAttendanceDetailsCount(this.getCurrentDate()).subscribe(
      (response) => {
        debugger;
        this.attendanceDetailsCountResponse = response.object;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  sliceWord(word: string): string {
    return word.slice(0, 3);
  }

  weeklyChartData: any[] = [];
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal, // Correct type for the group property
    domain: ['#FFE082', '#80CBC4', '#FFCCBC'], // Gold, Green, Red
  };
  gradient: boolean = false;
  // view: [number, number] = [300, 150];
  view1: [number, number] = [300, 200];
  weeklyPlaceholderFlag: boolean = true;
  getWeeklyChartData() {
    this.dataService.getWeeklyLeaveSummary().subscribe((data) => {
      // if (data.length > 0) {
      //   this.weeklyPlaceholderFlag = true;
      // } else {
      //   this.weeklyPlaceholderFlag = false;
      // }
      this.weeklyChartData = data.map((item) => ({
        name: this.sliceWord(item.weekDay),
        series: [
          { name: 'Pending', value: item.pending || 0 },
          { name: 'Approved', value: item.approved || 0 },
          { name: 'Rejected', value: item.rejected || 0 },
        ],
      }));
    });
  }

  monthlyChartData: any[] = [];
  view2: [number, number] = [300, 200];
  count: number = 0;
  monthlyPlaceholderFlag: boolean = true;
  getMonthlyChartData() {
    this.dataService.getMonthlyLeaveSummary().subscribe((data) => {
      // if (data.length > 0) {
      //   this.monthlyPlaceholderFlag = true;
      // } else {
      //   this.monthlyPlaceholderFlag = false;
      // }
      // console.log('length' + data.length);
      this.monthlyChartData = data.map((item) => ({
        name: this.sliceWord(item.monthName),
        series: [
          { name: 'Pending', value: item.pending || 0 },
          { name: 'Approved', value: item.approved || 0 },
          { name: 'Rejected', value: item.rejected || 0 },
        ],
        // this.count++;
      }));
    });
  }

  teamNameList: UserTeamDetailsReflection[] = [];

  teamId: number = 0;
  getTeamNames() {
    debugger;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.teamNameList = response.object;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
      },
    });
  }

  selectedTeamName: string = 'All';
  selectedTeamId: number = 0;
  selectTeam(teamId: number) {
    debugger;
    if (teamId === 0) {
      this.selectedTeamName = 'All';
      this.selectedTeamId = 0;
    } else {
      const selectedTeam = this.teamNameList.find(
        (team) => team.teamId === teamId
      );
      this.selectedTeamName = selectedTeam ? selectedTeam.teamName : 'All';
      this.selectedTeamId = teamId;
    }
    // this.page = 0;
    this.itemPerPage = 12;
    // this.fullLeaveLogs = [];
    // this.selectedTeamName = teamName;

    this.getAttendanceReportByDateDurationMethodCall();
  }

  //  modals

  attendanceDetailsResponseList: AttendanceDetailsResponse[] = [];
  totalItems: number = 0;
  pageNumberNew: number = 1;
  itemsPerPage: number = 12;
  search: string = '';
  searchByNew: string = 'name';
  sort: string = 'asc';
  sortBy: string = 'name';
  filterCriteria: string = 'PRESENT';
  lastPageNumberNew: number = 1;

  resetPresentModal() {
    this.search = '';
    this.attendanceDetailsResponseList = [];
  }

  hideSearchBar: boolean = false;
  isLoaderLoading: boolean = false;
  getAttendanceDetailsReportByDateMethodCall(filterCriteria: string) {
    this.filterCriteria = filterCriteria;
    this.isLoaderLoading = true;
    this.dataService
      .getAttendanceDetailsReportByDateForDashboard(
        this.helperService.formatDateToYYYYMMDD(this.selectedDate),
        this.pageNumberNew,
        this.itemsPerPage,
        this.search,
        this.searchByNew,
        '',
        '',
        this.filterCriteria
      )
      .subscribe(
        (response) => {
          // debugger;
          this.isLoaderLoading = false;
          this.attendanceDetailsResponseList = response.listOfObject;
          // console.log(this.attendanceDetailsResponseList);
          this.totalItems = response.totalItems;
          this.lastPageNumberNew = Math.ceil(this.totalItems / this.itemPerPage);
          console.log("lastPageNumberNew" + this.lastPageNumberNew );

          if (
           (this.attendanceDetailsResponseList === undefined ||
            this.attendanceDetailsResponseList === null ||
            this.attendanceDetailsResponseList.length === 0 ) && this.search ==''
          ) {
              this.hideSearchBar = true;
          }else {
            this.hideSearchBar = false;
          }


        },
        (error) => {
          this.isLoaderLoading = false;
          console.log(error);
        }
      );
  }

  changePageNew(page: any): void {
    if (page === 'prev') {
      if (this.pageNumberNew > 1) this.pageNumberNew--;
    } else if (page === 'next') {
      if (this.pageNumberNew < this.lastPageNumberNew) this.pageNumberNew++;
    } else {
      this.pageNumberNew = page;
    }
    this.getAttendanceDetailsReportByDateMethodCall(this.filterCriteria);
  }

  getStartIndexNew(): number {
    return (this.pageNumberNew - 1) * this.itemsPerPage + 1;
  }

  getEndIndexNew(): number {
    const endIndex = this.pageNumberNew * this.itemsPerPage;
    return endIndex > this.totalItems ? this.totalItems : endIndex;
  }

  // getPagesNew(): number[] {
  //   const pages = [];
  //   for (let i = 1; i <= this.lastPageNumberNew; i++) {
  //     pages.push(i);
  //   }
  //   return pages;
  // }

 // Generate page numbers, with '...' for skipped pages
getPagesNew(): (number | string)[] {
  const pages: (number | string)[] = [];
  const totalPages = this.lastPageNumberNew;

  if (totalPages <= 2) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const startPage = Math.max(1, this.pageNumberNew - 2);
    const endPage = Math.min(totalPages, this.pageNumberNew + 2);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
  }

  return pages;
}


  // onSearchChange(): void {
  //   this.pageNumberNew = 1;
  //   this.getAttendanceDetailsReportByDateMethodCall();
  // }

  // onSearchByChange(searchBy: string): void {
  //   this.searchByNew = searchBy;
  //   this.getAttendanceDetailsReportByDateMethodCall();
  // }
  crossFlag: boolean = false;
  onSearchChange(): void {
    this.crossFlag = this.search.length > 0;
    this.pageNumberNew = 1;
    this.getAttendanceDetailsReportByDateMethodCall(this.filterCriteria);
  }

  onSearchByChange(searchBy: string): void {
    this.searchByNew = searchBy;
    this.getAttendanceDetailsReportByDateMethodCall(this.filterCriteria);
  }

  searchUsersNew(searchType: string): void {
    this.onSearchChange();
  }

  reloadPage(): void {
    this.search = '';
    this.crossFlag = false;
    this.getAttendanceDetailsReportByDateMethodCall(this.filterCriteria);
  }

  // break users

  breakUsers: any[] = [];
  totalCountBreak: number = 0;
  searchTermBreak: string = '';
  pageNumberBreak: number = 1;
  itemsPerPageBreak: number = 10;
  currentPageBreak: number = 1;
  totalPagesBreak: number = 0;
  hideSearchBreak: boolean = false;
  isBreakLoaderLoading: boolean = false;

  getBreakUsers(): void {
    this.isBreakLoaderLoading = true;
     this.dataService
      .getBreakUsers(this.searchTermBreak, this.pageNumberBreak, this.itemsPerPageBreak)
      .subscribe(
        (response) => {
          this.isBreakLoaderLoading = false;
        this.breakUsers = response.listOfObject;

        if(this.searchTermBreak == '' && this.breakUsers.length == 0) {
          this.hideSearchBreak = true;
        }else {
          this.hideSearchBreak = false;
        }
        this.totalCountBreak = response.totalItems;
        this.calculatePagination();

        },
        (error) => {
          this.isBreakLoaderLoading = false;
          console.log(error);
        }
     );

  }

  getAbsentAndNotMarkedUsers(searchTerm : string, count: number){
    if(count == 0){
      this.attendanceDetailsResponseList = [];
      this.hideSearchBar = true;
      this.absentFlag = false;
      this.filterCriteria = searchTerm;
      // return;
    } else{
      this.getAttendanceDetailsReportByDateMethodCall(searchTerm);
    }
  }

  calculatePagination(): void {
    this.totalPagesBreak = Math.ceil(this.totalCountBreak / this.itemsPerPageBreak);
    this.currentPageBreak = this.pageNumberBreak;
  }

  changePageBreak(page: number | string): void {
    if (typeof page === 'string') {
      if (page === 'prev' && this.pageNumberBreak > 1) {
        this.pageNumberBreak--;
      } else if (page === 'next' && this.pageNumberBreak < this.totalPagesBreak) {
        this.pageNumberBreak++;
      }
    } else {
      this.pageNumberBreak = page;
    }
    this.getBreakUsers();
  }

  crossFlagBreak: boolean = false;
  searchBreak(): void {
    this.crossFlagBreak = this.searchTermBreak.length > 0;
    this.pageNumberBreak = 1;
    this.getBreakUsers();
  }

  reloadPageBreak(): void {
    this.crossFlagBreak = false;
    this.searchTermBreak = '';
    this.pageNumberBreak = 1;
    this.getBreakUsers();
  }

  get startIndexBreak(): number {
    return (this.pageNumberBreak - 1) * this.itemsPerPageBreak + 1;
  }

  get endIndexBreak(): number {
    return Math.min(this.pageNumberBreak * this.itemsPerPageBreak, this.totalCountBreak);
  }

  // get pagesBreak(): number[] {
  //   const pages: number[] = [];
  //   for (let i = 1; i <= this.totalPagesBreak; i++) {
  //     pages.push(i);
  //   }
  //   return pages;
  // }

  get pagesBreak(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPagesBreak;

    if (totalPages <= 2) {

      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.pageNumberBreak - 2);
      const endPage = Math.min(totalPages, this.pageNumberBreak + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }


  //  late empl


   lateUsers: any[] = [];
  totalCountLate: number = 0;
  searchTermLate: string = '';
  pageNumberLate: number = 1;
  itemsPerPageLate: number = 10;
  currentPageLate: number = 1;
  totalPagesLate: number = 0;
  hideSearchLate: boolean = false;
  isLateLoaderLoading: boolean = false;

  getLateUsers(): void {
    this.isLateLoaderLoading = true;
    this.dataService.getLateEmployeeDashboardDetails(this.getCurrentDate(), this.viewAll, this.searchTermLate, this.pageNumberLate, this.itemsPerPageLate).subscribe(
      response => {
        this.isLateLoaderLoading = false;
        this.lateUsers = response.listOfObject;

        if(this.searchTermLate == '' && this.lateUsers.length == 0) {
          this.hideSearchLate = true;
        }else {
          this.hideSearchLate = false;
        }
        this.totalCountLate = response.totalItems;
        this.calculatePaginationLate();
      },
      error => {
        this.isLateLoaderLoading = false;
        console.error('Error fetching late users:', error);
      }
    );
  }

  calculatePaginationLate(): void {
    this.totalPagesLate = Math.ceil(this.totalCountLate / this.itemsPerPageLate);
    this.currentPageLate = this.pageNumberLate;
  }

  changePageLate(page: number | string): void {
    if (typeof page === 'string') {
      if (page === 'prev' && this.pageNumberLate > 1) {
        this.pageNumberLate--;
      } else if (page === 'next' && this.pageNumberLate < this.totalPagesLate) {
        this.pageNumberLate++;
      }
    } else {
      this.pageNumberLate = page;
    }
    this.getLateUsers();
  }

  searchLate(): void {
    this.pageNumberLate = 1; // Reset to page 1 when searching
    this.getLateUsers();
  }

  reloadPageLate(): void {
    this.searchTermLate = '';
    this.pageNumberLate = 1;
    this.getLateUsers();
  }

  get startIndexLate(): number {
    return (this.pageNumberLate - 1) * this.itemsPerPageLate + 1;
  }

  get endIndexLate(): number {
    return Math.min(this.pageNumberLate * this.itemsPerPageLate, this.totalCountLate);
  }

  // get pagesLate(): number[] {
  //   const pages: number[] = [];
  //   for (let i = 1; i <= this.totalPagesLate; i++) {
  //     pages.push(i);
  //   }
  //   return pages;
  // }

  getPagesLate(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPagesLate;

    if (totalPages <= 2) {

      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPageLate - 2);
      const endPage = Math.min(totalPages, this.currentPageLate + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }



  //  leave users

  leaveUsers: any[] = [];
  totalCountLeave: number = 0;
  searchTermLeave: string = '';
  pageNumberLeave: number = 1;
  itemsPerPageLeave: number = 8;
  currentPageLeave: number = 1;
  totalPagesLeave: number = 0;
  hideSearchLeave: boolean = false;
  isLeaveLoaderLoading: boolean = false;

  getLeaveUsers(): void {
    this.isLeaveLoaderLoading = true;
     this.dataService
      .getLeaveUsers(this.searchTermLeave, this.pageNumberLeave, this.itemsPerPageLeave)
      .subscribe(
        (response) => {
          this.isLeaveLoaderLoading = false;
        this.leaveUsers = response.listOfObject;
        if(this.searchTermLeave == '' && this.leaveUsers.length == 0) {
          this.hideSearchLeave = true;
        }else {
          this.hideSearchLeave = false;
        }
        this.totalCountLeave = response.totalItems;
        this.calculatePaginationLeave();
        },
        (error) => {
          this.isLeaveLoaderLoading = false;
          console.log(error);
        }
     );

  }

  calculatePaginationLeave(): void {
    this.totalPagesLeave = Math.ceil(this.totalCountLeave / this.itemsPerPageLeave);
    this.currentPageLeave = this.pageNumberLeave;
  }

  changePageLeave(page: number | string): void {
    if (typeof page === 'string') {
      if (page === 'prev' && this.pageNumberLeave > 1) {
        this.pageNumberLeave--;
      } else if (page === 'next' && this.pageNumberLeave < this.totalPagesLeave) {
        this.pageNumberLeave++;
      }
    } else {
      this.pageNumberLeave = page;
    }
    this.getLeaveUsers();
  }

  crossFlagLeave: boolean = false;
  searchLeave(): void {
     this.crossFlagLeave = this.searchTermLeave.length > 0;
    this.pageNumberLeave = 1;
    this.getLeaveUsers();
  }

  reloadPageLeave(): void {
    this.crossFlagLeave = false;
    this.searchTermLeave = '';
    this.pageNumberLeave = 1;
    this.getLeaveUsers();
  }

  get startIndexLeave(): number {
    return (this.pageNumberLeave - 1) * this.itemsPerPageLeave + 1;
  }

  get endIndexLeave(): number {
    return Math.min(this.pageNumberLeave * this.itemsPerPageLeave, this.totalCountLeave);
  }

  // get pagesLeave(): number[] {
  //   const pages: number[] = [];
  //   for (let i = 1; i <= this.totalPagesLeave; i++) {
  //     pages.push(i);
  //   }
  //   return pages;
  // }

  getPagesLeave(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPagesLeave;

    if (totalPages <= 2) {

      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPageLeave - 2);
      const endPage = Math.min(totalPages, this.currentPageLeave + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }



  // tooltip attendance data

  userAttendanceDetailDateWise:any;

  // @ViewChild("openEventsModal") openEventsModal!:ElementRef;
  loadingFlag:boolean = false;
  currentDateString : string = '';
  fetchAttendanceDetails(userEmail: string, dateString:string) {
    debugger
    this.loadingFlag = true;
    this.currentDateString = dateString;
    this.userAttendanceDetailDateWise = [];
    this.dataService.getAttendanceDetailsForUserByDate(userEmail, dateString)
      .subscribe(
        (response) => {
          if(this.currentDateString == dateString) {
           this.userAttendanceDetailDateWise = response.object;
           this.loadingFlag = false;
          }else {
             this.loadingFlag = false;
          }

        },
        (error) => {
          console.error('Error fetching attendance details:', error);
          // Handle error state
          this.loadingFlag = false;
        }
      );
  }

  absentFlag:boolean = false;
  getAbsentFlag(str: string, count:number) {

    // hideSearchBar
      if((str === 'ABSENT') ) {
        this.absentFlag = true;
      }else  if((str === 'Not Marked')) {
        this.absentFlag = false;
      }
  }




  subscriptionList: any[] = new Array();
  loading: boolean = false;
  // getAllSubscription() {
  //   debugger;
  //   this.loading = true;
  //   this._subscriptionPlanService
  //     .getAllSubscriptionPlan()
  //     .subscribe((response) => {
  //       if (response.status) {
  //         this.subscriptionList = response.object;
  //         this.loading = false;
  //       }
  //       this.loading = false;
  //     });
  // }

  selectSubscription(subscriptionId: number) {
    this.selectedSubscriptionId = subscriptionId;
  }

  isPurchased: boolean = false;
  @ViewChild('billingModal') billingModal!: ElementRef;
  getPurchasedStatus() {
    debugger
    // this._subscriptionPlanService.getPurchasedStatus().subscribe((response) => {
    //   this.isPurchased = response;
      // this.router.navigate(['/to-do-step-dashboard']);
      // if(this.isPurchased) {
      //   this.router.navigate(['/to-do-step-dashboard']);
      // }else {
      //   this.router.navigate(['/to-do-step-dashboard']);
      // }
      this.isOrgOnboarTodayData();
      // if (this.isPurchased == true) {
      //   this.router.navigate(['/to-do-step-dashboard']);
      //   // this.router.navigate(['/dashboard']);
      // } else {
      //   // this.BILLING_AND_SUBSCRIPTION_MODAL_TOGGLE = true
      //   // this.billingModal.nativeElement.click();
      //   if (this.ROLE=="ADMIN") {
      //     this.router.navigate(['/billing-and-subscription']);
      //   }


      // }
    // });
  }

  isToDoStepsCompleted!: number;
  isToDoStepsCompletedData(isOrgOnboardToday : number) {
    debugger
    this.dataService.isToDoStepsCompleted().subscribe(
      (response) => {
        this.isToDoStepsCompleted = response.object;

        if(this.isOrgOnboardToday == 1 && this.isToDoStepsCompleted == 1) {
          this.hideOrganizationInitialToDoStepBar();
        }
        // if(this.isToDoStepsCompleted == 0 && isOrgOnboardToday == 1) {
        //   this.router.navigate(['/to-do-step-dashboard']);
        // }else {
        //   this.router.navigate(['/dashboard']);
        // }
        console.log("isToDoStepsCompletedFlag :", this.isToDoStepsCompleted);

      },
      (error) => {
        console.log('error');
      }
    );
  }

  isOrgOnboardToday: number = 0;
  isOrgOnboarTodayData() {
    debugger
    this.dataService.isOrgOnboarToday().subscribe(
      (response) => {
        this.isOrgOnboardToday = response.object;

        // if(this.isOrgOnboardToday == 0) {
        //   this.router.navigate(['/to-do-step-dashboard']);
        // }else {
        //   this.router.navigate(['/dashboard']);
        // }
        this.isToDoStepsCompletedData(this.isOrgOnboardToday);
        if(this.isOrgOnboardToday == 0) {
            this.hideOrganizationInitialToDoStepBar();
        }
        console.log("isToDoStepsCompletedFlag :", this.isToDoStepsCompleted);

      },
      (error) => {
        console.log('error');
      }
    );
  }

  hideOrganizationInitialToDoStepBar() {
    debugger
    this.dataService.hideOrganizationInitialToDoStepBar().subscribe(
      (response) => {
        console.log("hide");
        // this.getOrganizationInitialToDoStepBar();
        // location.reload();
      },
      (error) => {
        console.log('error');
      }
    );
  }



  routeToBillingPaymentPage(plandId : any) {
this.BILLING_AND_SUBSCRIPTION_MODAL_TOGGLE = false
// this.getSubscriptionPlanDetails(plandId);
  }


  toggleBack() {
    this.BILLING_AND_SUBSCRIPTION_MODAL_TOGGLE = true;
  }





  subscriptionPlan: SubscriptionPlan = new SubscriptionPlan();
  sbscriptionPlanReq: SubscriptionPlanReq = new SubscriptionPlanReq();
  activeUserCount: number = 0;
  taxAmount: number = 0;
  totalAmount: number = 0;
  monthlyAmount: number = 0;
  annualAmount: number = 0;
  orgUuid: string = '';
  name!: string;
  email!: string;
  phoneNumber!: string;
  BILLING_AND_SUBSCRIPTION_MODAL_TOGGLE !: boolean ;


  getAdminPersonalDetailMethodCall() {
    this.dataService.getAdminPersonalDetail().subscribe((response: AdminPersonalDetailResponse) => {
      this.name = response.name;
      this.email = response.email;
      this.phoneNumber = response.phoneNumber;
    }, error => {
      console.error('Error fetching admin details', error);
    });
  }


  totalEmployee: number = 0;
  getActiveUserCount() {
    debugger;
    this._subscriptionPlanService.getActiveUserCount().subscribe((response) => {
      if (response.status) {
        this.sbscriptionPlanReq.noOfEmployee = response.totalItems;
      }
    });
  }

  getCalcu(value: any) {
    this.sbscriptionPlanReq.amount = 0;
    this.taxAmount = 0;
    this.monthlyAmount = value * this.subscriptionPlan?.amount;
    this.annualAmount =
      this.monthlyAmount * 12 - (this.monthlyAmount * 12 * 20) / 100;
    this.selecrPlanType('annual');
    // this.couponCode = '';
    // this.getCouponInput();
  }

  processingPayment: boolean = false;
  verifiedCoupon !: string;
  readonly razorKey = Key.razorKey;
  hajiri_logo: string = '../../../../../assets/images/hajiri-icon.png';

  openRazorPay(): void {
    debugger;
    // var response ={'razorpay_payment_id':"BY_PASS"};
    //this.payDues(response);
    //return;
    // this.orderId = this._data.cart.id + '';
    //  console.log(this.invoice.payableAmount);

    this.processingPayment = false;

    var options = {
      key: this.razorKey,
      amount: Math.round(this.totalAmount) * 100,
      name: 'Hajiri',
      description: 'Test Transaction',
      image: this.hajiri_logo,
      handler: this.checkout.bind(this),
      modal: {
        confirm_close: true,
        // "ondismiss": this.markPaymentFailed.bind(this)
      },
      "prefill": {
        "name": this.name,
        "email": this.email,
        "contact":this.phoneNumber
      },
      notes: {
        couponCode: this.verifiedCoupon,
        orgUuid: this.orgUuid,
        type: 'subscription order',
        planType: this.sbscriptionPlanReq.planType,
        orderFrom: 'Hajiri',
        subscriptionPlanId: this.subscriptionPlan.id,
        noOfEmployee: this.sbscriptionPlanReq.noOfEmployee,
      },
      "theme": {
        "color": "#6666f3"
      }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  }

  isPaymentDone: boolean = false;
  checkout(value: any) {
    // console.log('transaction id', value);
    // this.isPaymentDone = true;
    window.location.reload();
  }

  isPlanPurchased: boolean = false;


  paymentMethod: string = '';
  selectPaymentMethod(value: any) {
    this.paymentMethod = value;
  }

  proceedToPay() {
    if (this.paymentMethod == 'razorpay') {
      this.openRazorPay();
    }
  }


  // ############################################

 checkHoliday:boolean = false;
 showPlaceholder:boolean = false;

 getHolidayForOrganization(){
    debugger
    this.dataService.getHolidayForOrganization(this.helperService.formatDateToYYYYMMDD(this.selectedDate))
    .subscribe(
      (response) => {
        this.checkHoliday = response.object;
        // console.log(response);
        // console.error("Response", response.object);

        if (this.checkHoliday == true) {
          this.showPlaceholder = true;
        } else if (this.checkHoliday == false){
          this.showPlaceholder = false;
        }

      },
      (error) =>{
        console.error('Error details:', error);
      }
  )
  }

  routeToUserProfile(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };

    // this.router.navigate(['/employee'], navExtra);
    // this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], navExtra);
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
    return;
  }

  couponCode: string = '';
  coupon: any;
  message: string = '';
  isCouponVerify: boolean = false;
  tempTotalAmount: number = 0;
  couponDiscount: number = 0;

  getCouponInput() {
    this.message = '';
    if (this.isCouponVerify) {
      this.totalAmount = this.tempTotalAmount;
    }
    this.isCouponVerify = false;
    this.couponDiscount = 0;
  }

  originalAmount: number = 0;

  applyCoupon() {
      this._subscriptionPlanService
          .verifyCoupon(this.couponCode, this.originalAmount)
          .subscribe((response) => {
              if (response.status) {
                this.message = '';
                this.verifiedCoupon = response.object.couponCode;
                  this.coupon = response.object;
                  this.tempTotalAmount = this.originalAmount;
                  this.couponDiscount = this.originalAmount - response.totalItems;
                  this.sbscriptionPlanReq.amount = response.totalItems;
                  this.isCouponVerify = true;
                  this.calculateTotalAmount();
              } else {
                  this.message = 'Invalid coupon code';
              }
          });
  }

  selecrPlanType(value: string) {
      this.sbscriptionPlanReq.planType = value;
      this.originalAmount = this.sbscriptionPlanReq.noOfEmployee * this.subscriptionPlan?.amount;
      this.sbscriptionPlanReq.amount = this.originalAmount;
      if (this.sbscriptionPlanReq.planType == 'annual') {
          this.originalAmount = this.sbscriptionPlanReq.noOfEmployee *
              this.subscriptionPlan?.amount * 12 - (this.sbscriptionPlanReq.noOfEmployee *
              this.subscriptionPlan?.amount * 20 * 12) / 100;
          this.sbscriptionPlanReq.amount = this.originalAmount;
      }
      if (this.isCouponVerify) {
          this.applyCoupon();
      } else {
          this.calculateTotalAmount();
      }
  }

  calculateTotalAmount() {
      this.taxAmount = (this.sbscriptionPlanReq.amount * 18) / 100;
      this.totalAmount = this.sbscriptionPlanReq.amount + this.taxAmount;
  }

  // getSubscriptionPlanDetails(id: any) {

  //     this._subscriptionPlanService
  //         .getSubscriptionPlan(id)
  //         .subscribe((response) => {
  //             if (response.status) {
  //                 this.subscriptionPlan = response.object;
  //                 this.originalAmount = this.sbscriptionPlanReq.noOfEmployee *
  //                     this.subscriptionPlan.amount * 12 - (this.sbscriptionPlanReq.noOfEmployee *
  //                     this.subscriptionPlan.amount * 20 * 12) / 100;
  //                 this.sbscriptionPlanReq.amount = this.originalAmount;
  //                 this.calculateTotalAmount();
  //             }
  //         });
  // }

  @ViewChild('presentModal') presentModal!: ElementRef;
  routeToAttendanceSetting() {

    this.presentModal.nativeElement.click();
    this.router.navigate(['/setting/attendance-setting']);
  }

  // to do step completion


}



