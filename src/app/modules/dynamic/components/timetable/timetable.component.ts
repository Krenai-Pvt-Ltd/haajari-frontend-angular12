import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import dayjs from 'dayjs';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { HelperService } from 'src/app/services/helper.service';
import { AdditionalNotes } from 'src/app/models/additional-notes';
import { AttendanceDetailsResponse } from 'src/app/models/attendance-details-response';
import { AttendanceLogResponse } from 'src/app/models/attendance-log-response';
import { Key } from 'src/app/constant/key';
import { NavigationExtras, Router } from '@angular/router';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { AttendanceDetailsCountResponse } from 'src/app/models/attendance-details-count-response';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import saveAs from 'file-saver';
import { DatePipe } from '@angular/common';
import { OvertimeRequestLogResponse } from 'src/app/models/overtime-request-log-response';
import { OvertimeResponseDTO } from 'src/app/models/overtime-response-dto';
import { AttendanceTimeUpdateResponse } from 'src/app/models/attendance-time-update-response';
import { constant } from 'src/app/constant/constant';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Routes } from 'src/app/constant/Routes';
import { StatusKeys } from 'src/app/constant/StatusKeys';


@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css'],
})
export class TimetableComponent implements OnInit {
  alwaysShowCalendars: boolean | undefined;
  model: any;
  flag!: boolean;
  role: any;
  userUuid: any;
  orgRefId: any;
  showFilter: boolean = false;
  ROLE = this.rbacService.getRole();
  loginDetails = this.helperService.getDecodedValueFromToken();
  TODAY = new Date();
  selectedDate: Date = new Date();
  size: 'large' | 'small' | 'default' = 'small';
  organizationRegistrationDate: string = '';
  selected: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};
  logInUserUuid: string = '';
  dateRangeInputValue: string = '';
  totalAttendance: number = 0;
  attendanceArrayDate: any = [];

  attendanceDataByDate: Record<string, AttendenceDto> = {};
  attendanceDataByDateKey: any = [];
  attendanceDataByDateValue: AttendenceDto[] = [];
  inputDate = '';
  filterCriteria = 'ALL';
  halfDayUsers: number = 0;

  itemPerPage: number = 8;
  pageNumber: number = 1;
  searchText: string = '';
  searchBy: string = '';
  total: number = 0;

  lastPageNumber = 0;

  isShimer: boolean = false;
  errorToggleTimetable: boolean = false;
  placeholder: boolean = false;

  isShimmerForAttendanceDetailsResponse: boolean = false;
  dataNotFoundForAttendanceDetailsResponse: boolean = false;
  networkConnectionErrorForAttendanceDetailsResponse: boolean = false;
  attendanceDetailsResponseList: AttendanceDetailsResponse[] = [];
  debounceTimer: any;

  additionalNotes: AdditionalNotes = new AdditionalNotes();
  additionalNotesUserUuid!: string;
  activeUsersCount: number = 0;

  attendanceDetailsCountResponse: AttendanceDetailsCountResponse =
    new AttendanceDetailsCountResponse();
  attendanceLogShimmerFlag: boolean = false;
  dataNotFoundFlagForAttendanceLog: boolean = false;
  networkConnectionErrorFlagForAttendanceLog: boolean = false;
  attendanceLogResponseList: AttendanceLogResponse[] = [];
  userUuidToViewLogs: string = '';
  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  url: string = '';
  imageDownUrl: string = '';
  previewString: SafeResourceUrl | null = null;
  isPDF: boolean = false;
  isImage: boolean = false;
  dailyReportLog: string = '';
  rotateToggle: boolean = false;
  checkHoliday: boolean = false;
  showPlaceholder: boolean = false;

  attendanceFullRequestLog: any[] = [];
  pageNumberFullAttendanceRequest: number = 1;
  itemPerPageFullAttendanceRequest: number = 5;
  totalAttendanceRequestCount: number = 0;
  isRequestLoader: boolean = false;
  fullAttendanceRequestSearchString: string = '';
  isShimmerForAttendanceUpdateRequestLogResponse: boolean = false;
  dataNotFoundForAttendanceUpdateRequestLogResponse: boolean = false;
  networkConnectionErrorForAttendanceUpdateRequestLogResponse: boolean = false;
  initialLoadDoneforFullLogs: boolean = false;
  attendanceRequests: AttendanceTimeUpdateResponse[] = [];
  pageNumberAttendanceRequest: number = 1;
  itemPerPageAttendanceRequest: number = 4;
  fullAttendanceRequestCount: number = 0;
  isFullRequestLoader: boolean = false;
  attendanceRequestSearchString: string = '';
  isShimmerForAttendanceUpdatePendingRequestResponse: boolean = false;
  dataNotFoundForAttendanceUpdatePendingRequestResponse: boolean = false;
  networkConnectionErrorForAttendanceUpdatePendingRequestResponse: boolean =
    false;
  attendanceRequestCount: number = 0;
  isShimmerForAttendanceUpdateRequestResponse: boolean = false;
  dataNotFoundForAttendanceUpdateRequestResponse: boolean = false;
  networkConnectionErrorForAttendanceUpdateRequestResponse: boolean = false;
  initialLoadDone: boolean = false;

  PRESENT = Key.PRESENT;
  ABSENT = Key.ABSENT;
  UNMARKED = Key.UNMARKED;
  WEEKEND = Key.WEEKEND;
  HOLIDAY = Key.HOLIDAY;
  ADMIN = Key.ADMIN;
  MANAGER = Key.MANAGER;
  USER = Key.USER;
  // Tab in Attedance section
  ATTENDANCE_TAB = Key.ATTENDANCE_TAB;
  OVERTIME_TAB = Key.OVERTIME_TAB;
  ATTENDANCE_UPDATE_REQUEST_TAB = Key.ATTENDANCE_UPDATE_REQUEST_TAB;
  ATTENDANCE_UPDATE_REQUEST_TAB_NEW = Key.ATTENDANCE_UPDATE_REQUEST_TAB_NEW;
  ACTIVE_TAB = Key.ATTENDANCE_TAB;
  readonly key = Key;
  readonly Constant = constant;
  readonly Routes = Routes;
  readonly StatusKeys =StatusKeys;
  readonly filterCriteriaList: string[] = [
    'ALL',
    'PRESENT',
    'ABSENT',
    'HALFDAY',
    'LEAVE',
  ];

  @ViewChild('addNotesModalClose') addNotesModalClose!: ElementRef;
  @ViewChild('openDocModalButton') openDocModalButton!: ElementRef;
  @ViewChild('viewlog') viewlog!: ElementRef;
  @ViewChild('attendanceLogModal') attendanceLogModal!: ElementRef;
  @ViewChild('logContainerforFullLogs')
  logContainerforFullLogs!: ElementRef<HTMLDivElement>;
  @ViewChild('logContainer') logContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private dataService: DataService,
    public helperService: HelperService,
    private router: Router,
    public rbacService: RoleBasedAccessControlService,
    private firebaseStorage: AngularFireStorage,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe
  ) // private headerComponent: HeaderComponent
  {
    this.searchTextMissedPunchSubject
      .pipe(debounceTime(this.DEBOUNCE_TIME), distinctUntilChanged())
      .subscribe((searchText) => {
        this.searchTextMissedPunch = searchText;
        this.currentPageMissedPunch = 1; // Reset to first page on search
        this.fetchMissedPunchRequests();
      });

    // Debounce for System Outage search
    this.searchTextSystemOutageSubject
      .pipe(debounceTime(this.DEBOUNCE_TIME), distinctUntilChanged())
      .subscribe((searchText) => {
        this.searchTextSystemOutage = searchText;
        this.currentPageSystemOutage = 1; // Reset to first page on search
        this.fetchSystemOutageRequests();
      });
  }

  async ngOnInit(): Promise<void> {
    this.sampleFileUrl = 'assets/samples/Attendance_Upload.xlsx';
    window.scroll(0, 0);
    this.sampleFileUrl = 'assets/samples/Attendance_Upload.xlsx';
    this.getRequestCountByOrganizationUuid();
    this.getOrganizationRegistrationDateMethodCall();
    this.inputDate = this.getCurrentDate();
    this.assignRole();
    const today = dayjs();
    const oneWeekAgo = today.subtract(1, 'week');
    this.selected = {
      startDate: oneWeekAgo,
      endDate: today,
    };

    this.updateDateRangeInputValue();
    this.getFirstAndLastDateOfMonth(this.selectedDate);
    this.getAttendanceDetailsCountMethodCall();
    this.getAttendanceDetailsReportByDateMethodCall();
    this.getActiveUsersCountMethodCall();
    this.getHolidayForOrganization();
    this.fetchAttendanceRequests();
    this.fetchMissedPunchRequests();
    this.findPendingRequests();
    this.getAllUsers();
    this.logInUserUuid = await this.rbacService.getUUID();
  }

  assignRole() {
    this.role = this.rbacService.getRole();
    this.userUuid = this.rbacService.getUUID();
    this.orgRefId = this.rbacService.getOrgRefUUID();
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.getAttendanceDetailsCountMethodCall();
    this.getAttendanceDetailsReportByDateMethodCall();
    this.getHolidayForOrganization();
  }

  disableDates = (current: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const registrationDate = new Date(this.organizationRegistrationDate);

    registrationDate.setHours(0, 0, 0, 0);

    return (
      current.getTime() >= today.getTime() + 24 * 60 * 60 * 1000 ||
      current.getTime() < registrationDate.getTime()
    );
  };

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

  // ###############################################################################

  selectPreviousDay() {
    this.isShimer = true;

    let currentDate = new Date(this.selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);

    if (currentDate < new Date(this.organizationRegistrationDate)) {
      return;
    }

    this.selectedDate = new Date(currentDate);

    this.attendanceDetailsResponseList = [];
    this.total = 0;

    this.getAttendanceDetailsReportByDateMethodCall();
    this.getAttendanceDetailsCountMethodCall();
  }

  selectNextDay() {
    this.isShimer = true;

    const currentDateObject = this.selectedDate;
    const tomorrow = new Date(currentDateObject);
    tomorrow.setDate(currentDateObject.getDate() + 1);

    if (tomorrow >= new Date()) {
      return;
    }

    this.attendanceDetailsResponseList = [];
    this.total = 0;

    this.selectedDate = tomorrow;
    this.getAttendanceDetailsReportByDateMethodCall();
    this.getAttendanceDetailsCountMethodCall();
  }

  selectPreviousMonth() {
    const currentDate = new Date(this.selectedDate);
    currentDate.setMonth(currentDate.getMonth() - 1);

    if (currentDate < new Date(this.organizationRegistrationDate)) {
      return;
    }

    this.selectedDate = currentDate;
    this.onMonthChange(currentDate);
  }

  selectNextMonth() {
    const currentDate = new Date(this.selectedDate);
    currentDate.setMonth(currentDate.getMonth() + 1);

    if (currentDate >= new Date()) {
      return;
    }

    this.selectedDate = currentDate;
    this.onMonthChange(currentDate);
  }

  getCurrentDate() {
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = (todayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = todayDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  checkingUserRoleMethod(): boolean {
    this.dataService.checkingUserRole().subscribe(
      (data) => {
        this.flag = data;
      },
      (error) => {}
    );

    return this.flag;
  }

  updateDateRangeInputValue(): void {
    if (this.selected) {
      this.dateRangeInputValue = `${this.selected.startDate.format(
        'DD-MM-YYYY'
      )} - ${this.selected.endDate.format('DD-MM-YYYY')}`;
    } else {
      this.dateRangeInputValue = '';
    }
  }

  preRuleForShimmersAndOtherConditionsMethodCall() {
    this.isShimmerForAttendanceDetailsResponse = true;
    this.dataNotFoundForAttendanceDetailsResponse = false;
    this.networkConnectionErrorForAttendanceDetailsResponse = false;
  }

  getAttendanceDetailsReportByDateMethodCall(debounceTime: number = 300) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndOtherConditionsMethodCall();
      this.dataService
        .getAttendanceDetailsReportByDate(
          this.helperService.formatDateToYYYYMMDD(this.selectedDate),
          this.pageNumber,
          this.itemPerPage,
          this.searchText,
          'name',
          '',
          '',
          this.filterCriteria
        )
        .subscribe(
          (response) => {
            debugger;
            this.attendanceDetailsResponseList = response.listOfObject;
            // console.log(this.attendanceDetailsResponseList);
            this.total = response.totalItems;
            this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            this.isShimmerForAttendanceDetailsResponse = false;

            if (
              this.attendanceDetailsResponseList === undefined ||
              this.attendanceDetailsResponseList === null ||
              this.attendanceDetailsResponseList.length === 0
            ) {
              this.dataNotFoundForAttendanceDetailsResponse = true;
            }
          },
          (error) => {
            console.log(error);
            this.networkConnectionErrorForAttendanceDetailsResponse = true;
          }
        );
    }, debounceTime);
  }

  showUp = false;
  toggleChevron(show: boolean) {
    this.showUp = show;
  }

  getAttendanceDetailsBreakTimingsReportByDateByUserMethodCall(
    attendanceDetailsResponse: AttendanceDetailsResponse
  ) {
    if (
      attendanceDetailsResponse.breakTimingsList == undefined ||
      attendanceDetailsResponse.breakTimingsList == null ||
      attendanceDetailsResponse.breakTimingsList.length == 0
    ) {
      debugger;
      this.dataService
        .getAttendanceDetailsBreakTimingsReportByDateByUser(
          attendanceDetailsResponse.uuid,
          this.helperService.formatDateToYYYYMMDD(this.selectedDate)
        )
        .subscribe(
          (response) => {
            attendanceDetailsResponse.breakTimingsList = response.listOfObject;
            this.toggleChevron(false);
          },
          (error) => {
            console.log(error);
          }
        );
    } else {
    }
  }

  getAttendanceDetailsCountMethodCall() {
    this.dataService
      .getAttendanceDetailsCount(
        this.helperService.formatDateToYYYYMMDD(this.selectedDate)
      )
      .subscribe(
        (response) => {
          this.attendanceDetailsCountResponse = response.object;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  selectFilterCriteria(filterCriteria: string) {
    this.filterCriteria = filterCriteria;
  }

  resetFilterCriteria(filterCriteria: string) {
    this.filterCriteria = filterCriteria;
    this.showFilter = false;
    this.applyFilterCriteria();
  }

  applyFilterCriteria() {
    this.attendanceDataByDateKey = [];
    this.attendanceDataByDateValue = [];
    this.total = 0;
    this.resetCriteriaFilter();
    this.selectedDate = new Date();
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.getAttendanceDetailsReportByDateMethodCall();
  }

  getActiveUsersCountMethodCall() {
    this.dataService.getActiveUsersCount().subscribe(
      (data) => {
        this.activeUsersCount = data;
      },
      (error) => {}
    );
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

  // ####################Add Notes#####################

  addNotesModel(uuid: string) {
    this.additionalNotes = new AdditionalNotes();
    this.additionalNotesUserUuid = uuid;
  }

  addAdditionalNotesMethodCall() {
    this.additionalNotes.createdDate = this.inputDate;
    this.dataService
      .addAdditionalNotes(this.additionalNotes, this.additionalNotesUserUuid)
      .subscribe(
        (data) => {
          // console.log(data);
          this.addNotesModalClose.nativeElement.click();
          this.helperService.showToast(
            'Notes Added Successfully',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          // console.log(error);
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  // #########Searching#################
  resetCriteriaFilter() {
    this.itemPerPage = 8;
    this.pageNumber = 1;
  }
  searchUsers(event: Event) {
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

    this.attendanceDataByDateKey = [];
    this.attendanceDataByDateValue = [];
    this.total = 0;
    this.isShimer = true;

    this.resetCriteriaFilter();
    this.getAttendanceDetailsReportByDateMethodCall();
  }

  clearSearchText() {
    this.searchText = '';
    this.getAttendanceDetailsReportByDateMethodCall();
  }

  // ##### Pagination ############
  changePage(page: number | string) {
    this.attendanceDataByDateKey = [];
    this.attendanceDataByDateValue = [];
    this.isShimer = true;

    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getAttendanceDetailsReportByDateMethodCall();
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.total / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.itemPerPage);
  }
  getStartIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }
  getEndIndex(): number {
    const endIndex = this.pageNumber * this.itemPerPage;
    return endIndex > this.total ? this.total : endIndex;
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    this.getAttendanceDetailsReportByDateMethodCall();
  }

  // ############View Logs#################

  preRuleForShimmersAndErrorPlaceholdersMethodCall() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  viewLogs(uuid: string) {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.attendanceLogResponseList = [];
    this.userUuidToViewLogs = uuid;
    this.getAttendanceLogsMethodCall();
  }

  getAttendanceLogsMethodCall() {
    this.dataService
      .getAttendanceLogs(
        this.userUuidToViewLogs,
        this.helperService.formatDateToYYYYMMDD(this.selectedDate)
      )
      .subscribe(
        (response) => {
          debugger;
          this.attendanceLogResponseList = response;

          // console.log(response);
          if (
            response === undefined ||
            response === null ||
            response.length === 0
          ) {
            this.dataNotFoundPlaceholder = true;
          }
        },
        (error) => {
          // console.log(error);
          this.networkConnectionErrorPlaceHolder = true;
        }
      );
  }

  // route to user's profile
  routeToUserProfile(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    const url = this.router
      .createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra)
      .toString();
    window.open(url, '_blank');
    return;
  }

  @ViewChild('attendancewithlocationssButton')
  attendancewithlocationssButton!: ElementRef;
  lat: number = 0;
  lng: number = 0;
  zoom: number = 15;

  openAddressModal(lat: string, long: string) {
    this.lat = +lat;
    this.lng = +long;
    this.attendancewithlocationssButton.nativeElement.click();
  }

  openSelfieModal(url: string) {
    this.url = url;
    this.imageDownUrl = url;
    this.updateFileType(url);
    this.viewlog.nativeElement.click();
    this.openDocModalButton.nativeElement.click();
  }

  getFileName(url: string): string {
    return url.split('/').pop() || 'Attendance Selfie';
  }

  private updateFileType(url: string) {
    const extension = url.split('?')[0].split('.').pop()?.toLowerCase();
    this.isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(extension!);
    this.isPDF = extension === 'pdf';
    if (this.isPDF) {
      this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://docs.google.com/gview?url=${encodeURIComponent(
          url
        )}&embedded=true`
      );
    } else {
      this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  openViewModal(url: string): void {
    this.url = url;
    this.updateFileType(url);
    this.viewlog.nativeElement.click();
    this.openDocModalButton.nativeElement.click();
  }

  downloadFile(imageUrl: any) {
    if (!imageUrl) {
      return;
    }

    var blob = null;
    var splittedUrl = imageUrl.split(
      '/firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/'
    );

    if (splittedUrl.length < 2) {
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
          saveAs(blob, 'Selfie');
        };
        xhr.open('GET', url);
        xhr.send();
      })
      .catch((error: any) => {
        // Handle any errors
      });
  }

  reOpenLogsModal() {
    this.viewLogs(this.userUuidToViewLogs);
    this.viewlog.nativeElement.click();
  }

  downloadAttedanceReport(date: Date) {
    let dateString: string | null = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.rotateToggle = true;
    if (dateString !== null) {
      this.dataService.getAtendanceDailyReport(dateString, null).subscribe(
        (response) => {
          this.dailyReportLog = response.message;
          const downloadLink = document.createElement('a');
          downloadLink.href = response.message;
          downloadLink.download = 'attendance.xlsx';
          downloadLink.click();
          this.rotateToggle = false;
        },
        (error) => {
          this.rotateToggle = false;
        }
      );
    }
  }

  // ############################################

  getHolidayForOrganization() {
    this.dataService
      .getHolidayForOrganization(
        this.helperService.formatDateToYYYYMMDD(this.selectedDate)
      )
      .subscribe(
        (response) => {
          this.checkHoliday = response.object;
          if (this.checkHoliday == true) {
            this.showPlaceholder = true;
          } else if (this.checkHoliday == false) {
            this.showPlaceholder = false;
          }
        },
        (error) => {
          console.error('Error details:', error);
        }
      );
  }

  preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdateRequestLogResponseMethodCall() {
    this.isShimmerForAttendanceUpdateRequestLogResponse = true;
    this.dataNotFoundForAttendanceUpdateRequestLogResponse = false;
    this.networkConnectionErrorForAttendanceUpdateRequestLogResponse = false;
  }
  getFullAttendanceRequestLogData() {
    this.attendanceFullRequestLog = [];
    this.preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdateRequestLogResponseMethodCall();
    return new Promise((resolve, reject) => {
      this.isRequestLoader = true;
      this.dataService
        .getFullAttendanceRequestLog(
          this.pageNumberFullAttendanceRequest,
          this.itemPerPageFullAttendanceRequest,
          this.fullAttendanceRequestSearchString
        )
        .subscribe(
          (response) => {
            if (this.helperService.isObjectNullOrUndefined(response)) {
              this.dataNotFoundForAttendanceUpdateRequestLogResponse = true;
            } else {
              this.attendanceFullRequestLog = [
                ...this.attendanceFullRequestLog,
                ...response.object,
              ];
              this.totalAttendanceRequestCount = response.totalItems;
              this.isRequestLoader = false;
            }
            this.isShimmerForAttendanceUpdateRequestLogResponse = false;
          },
          (error) => {
            this.networkConnectionErrorForAttendanceUpdateRequestLogResponse =
              true;
            this.isShimmerForAttendanceUpdateRequestLogResponse = false;
            this.isRequestLoader = false;
          }
        );
    });
  }
  scrollDownRecentActivityforFullLogs(event: any) {
    debugger;
    if (!this.initialLoadDoneforFullLogs) return;

    if (
      this.totalAttendanceRequestCount <
      (this.pageNumberFullAttendanceRequest - 1) *
        this.itemPerPageFullAttendanceRequest
    ) {
      return;
    }
    const target = event.target as HTMLElement;
    const atBottom =
      target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

    if (atBottom) {
      this.pageNumberFullAttendanceRequest++;
      this.getFullAttendanceRequestLogData();
    }
  }

  loadMoreLogs(): void {
    this.initialLoadDoneforFullLogs = true;
    this.pageNumberFullAttendanceRequest++;
    // this.attendanceRequestLog = [];
    this.getFullAttendanceRequestLogData();
  }

  onSearchChangeOfFullAttendanceLogs(searchValue: string): void {
    this.fullAttendanceRequestSearchString = searchValue;
    this.pageNumberFullAttendanceRequest = 1;
    this.attendanceFullRequestLog = [];
    this.getFullAttendanceRequestLogData();
  }

  openLogs() {
    this.pageNumberFullAttendanceRequest = 1;
    this.totalAttendanceRequestCount = 0;
    this.attendanceFullRequestLog = [];
    this.fullAttendanceRequestSearchString = '';
    this.getFullAttendanceRequestLogData();
  }

  clearSearchUsersOfFullLogs() {
    this.pageNumberFullAttendanceRequest = 1;
    this.totalAttendanceRequestCount = 0;
    this.attendanceFullRequestLog = [];
    this.fullAttendanceRequestSearchString = '';
    this.getFullAttendanceRequestLogData();
  }

  preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdatePendingRequestResponseMethodCall() {
    this.isShimmerForAttendanceUpdatePendingRequestResponse = true;
    this.dataNotFoundForAttendanceUpdatePendingRequestResponse = false;
    this.networkConnectionErrorForAttendanceUpdatePendingRequestResponse =
      false;
  }
  getAttendanceRequestsData() {
    this.preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdatePendingRequestResponseMethodCall();
    return new Promise((resolve, reject) => {
      this.isFullRequestLoader = true;
      this.dataService
        .getAttendanceRequests(
          this.pageNumberAttendanceRequest,
          this.itemPerPageAttendanceRequest,
          this.attendanceRequestSearchString,
          this.startDate,
          this.endDate
        )
        .subscribe(
          (response) => {
            if (this.helperService.isObjectNullOrUndefined(response)) {
              this.dataNotFoundForAttendanceUpdatePendingRequestResponse = true;
            } else {
              if (this.pageNumberAttendanceRequest == 1) {
                this.attendanceRequests = [];
              }
              // Append new data to the existing list
              this.attendanceRequests = [
                ...this.attendanceRequests,
                ...response.object,
              ];
              this.fullAttendanceRequestCount = response.totalItems;
              this.isFullRequestLoader = false;
            }
            this.getRequestCountByOrganizationUuid();
            this.isShimmerForAttendanceUpdatePendingRequestResponse = false;
            this.initialLoadDone = true; // Mark initial load as done after first fetch
          },
          (error) => {
            this.isFullRequestLoader = false;
            this.isShimmerForAttendanceUpdatePendingRequestResponse = false;
            this.networkConnectionErrorForAttendanceUpdatePendingRequestResponse =
              true;
            reject(error);
          }
        );
    });
  }

  openAttendanceRequests() {
    this.pageNumberAttendanceRequest = 1;
    this.attendanceRequests = [];
    this.fullAttendanceRequestCount = 0;
    this.attendanceRequestSearchString = '';
    this.initialLoadDone = false; // Reset initial load flag
    this.getAttendanceRequestsData();
  }

  getAttendanceRequestsDataCount(): void {
    debugger;
    this.dataService
      .getAttendanceRequestCount(this.startDate, this.endDate)
      .subscribe(
        (response: any) => {
          this.attendanceRequestCount = response.object;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdateRequestResponseMethodCall() {
    this.isShimmerForAttendanceUpdateRequestResponse = true;
    this.dataNotFoundForAttendanceUpdateRequestResponse = false;
    this.networkConnectionErrorForAttendanceUpdateRequestResponse = false;
  }
  attendanceRequestsHistory: AttendanceTimeUpdateResponse[] = [];
  getAttendanceRequestsHistoryData() {
    this.attendanceRequestsHistory = [];
    this.preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdateRequestResponseMethodCall();
    return new Promise((resolve, reject) => {
      this.dataService
        .getAttendanceRequestsHistory(
          this.pageNumberAttendanceRequest,
          this.itemPerPageAttendanceRequest,
          this.attendanceRequestSearchString,
          this.startDate,
          this.endDate
        )
        .subscribe(
          (response) => {
            if (this.helperService.isObjectNullOrUndefined(response)) {
              this.dataNotFoundForAttendanceUpdateRequestResponse = true;
            } else {
              this.attendanceRequestsHistory = [
                ...this.attendanceRequestsHistory,
                ...response.object,
              ];
              console.log(
                'requests retrieved successfully',
                response.listOfObject
              );
            }
            this.isShimmerForAttendanceUpdateRequestResponse = false;
          },
          (error) => {
            this.networkConnectionErrorForAttendanceUpdateRequestResponse =
              true;
            this.isShimmerForAttendanceUpdateRequestResponse = false;
          }
        );
    });
  }

  scrollDownRecentActivity(event: any) {
    if (!this.initialLoadDone) return; // Skip initial load

    // Check if we've already loaded all data
    if (this.attendanceRequests.length >= this.fullAttendanceRequestCount) {
      return;
    }

    const target = event.target as HTMLElement;
    const atBottom =
      target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

    if (atBottom && !this.isFullRequestLoader) {
      this.pageNumberAttendanceRequest++;
      this.getAttendanceRequestsData();
    }
  }

  loadMoreAttendanceRequestLogs(): void {
    this.initialLoadDone = true;
    this.pageNumberAttendanceRequest++;
    this.getAttendanceRequestsData();
  }

  onSearchChange(searchValue: string): void {
    this.attendanceRequestSearchString = searchValue;
    this.pageNumberAttendanceRequest = 1;
    this.attendanceRequests = [];
    this.getAttendanceRequestsData();
  }

  clearSearchUsersOfRequestLogs() {
    debugger;
    this.pageNumberAttendanceRequest = 1;
    this.fullAttendanceRequestCount = 0;
    this.attendanceRequests = [];
    this.attendanceRequestSearchString = '';
    this.getAttendanceRequestsData();
  }

  clearAttendanceRequestLogs() {
    this.attendanceRequests = [];
    this.pageNumberAttendanceRequest = 1;
    this.attendanceRequestSearchString = '';
    this.attendanceFullRequestLog = [];
    this.pageNumberFullAttendanceRequest = 1;
    this.fullAttendanceRequestSearchString = '';
    this.fullAttendanceRequestCount = 0;
    this.totalAttendanceRequestCount = 0;
  }

  approveOrReject(id: number, reqString: string) {
    if (reqString == 'APPROVED') {
      this.attendanceUpdateRequestApproveLoader = true;
    } else if (reqString == 'REJECTED') {
      this.attendanceUpdateRequestRejectLoader = true;
    }
    this.dataService.approveOrRejectAttendanceRequest(id, reqString).subscribe(
      (response) => {
        this.attendanceUpdateRequestApproveLoader = false;
        this.attendanceUpdateRequestRejectLoader = false;
        if (response.status) {
          this.helperService.showToast(
            'Request ' + reqString + ' Successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        }

        this.applyFilters();

        this.totalAttendanceRequestCount = 0;
        this.attendanceRequestSearchString = '';
        this.pageNumberAttendanceRequest = 1;
        this.attendanceRequests = [];
        this.getAttendanceRequestsData();
        this.getAttendanceRequestsDataCount();
        this.pageNumberFullAttendanceRequest = 1;
        this.fullAttendanceRequestCount = 0;
        this.attendanceFullRequestLog = [];
        this.fullAttendanceRequestSearchString = '';
        this.getFullAttendanceRequestLogData();
        this.closeAttendanceUpdateRequestActionModal.nativeElement.click();
      },
      (error) => {
        this.attendanceUpdateRequestApproveLoader = false;
        this.attendanceUpdateRequestRejectLoader = false;
        console.log(error);
        this.helperService.showToast(
          'Error while processing the request!',
          Key.TOAST_STATUS_ERROR
        );
      }
    );
  }

  changeTab(tabId: number) {
    this.ACTIVE_TAB = tabId;

    if (
      tabId == this.OVERTIME_TAB ||
      tabId == this.ATTENDANCE_UPDATE_REQUEST_TAB
    ) {
      this.onMonthChange(new Date());
    }
    if (tabId === this.ATTENDANCE_UPDATE_REQUEST_TAB) {
      this.onMonthChange(new Date());
      this.openAttendanceRequests(); // Load initial data
    }
  }

  startDate: string = '';
  endDate: string = '';
  onMonthChange(month: Date): void {
    console.log('Month is getting selected');
    this.selectedDate = month;
    this.openAttendanceRequests();
    this.getFirstAndLastDateOfMonth(this.selectedDate);

    if (this.ACTIVE_TAB == this.OVERTIME_TAB) {
      this.getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
      this.getOvertimeRequestResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
      this.getOvertimePendingRequestResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
      // this.getTeamNames();
    }

    if (this.ACTIVE_TAB == this.ATTENDANCE_UPDATE_REQUEST_TAB) {
      this.getAttendanceRequestsData();
      this.getAttendanceRequestsHistoryData();
      this.getFullAttendanceRequestLogData();
      this.getAttendanceRequestsDataCount();
    }
  }

  getFirstAndLastDateOfMonth(selectedDate: Date) {
    this.startDate = this.helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
    this.endDate = this.helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    );
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

  // ####################--Overtime tab response list--######################

  // Tab in Overtime tab section
  OVERTIME_PENDING_REQUEST_TAB = Key.OVERTIME_PENDING_REQUEST_TAB;
  OVERTIME_HISTORY_TAB = Key.OVERTIME_HISTORY_TAB;

  ACTIVE_TAB_IN_OVERTIME_TAB = Key.OVERTIME_PENDING_REQUEST_TAB;
  changeLogTabInOvertimeTab(tabId: number) {
    this.ACTIVE_TAB_IN_OVERTIME_TAB = tabId;
  }

  isShimmerForOvertimeRequestLogResponse: boolean = false;
  dataNotFoundForOvertimeRequestLogResponse: boolean = false;
  networkConnectionErrorForOvertimeRequestLogResponse: boolean = false;

  preRuleForShimmersAndErrorPlaceholdersForOvertimeRequestLogResponseMethodCall() {
    this.isShimmerForOvertimeRequestLogResponse = true;
    this.dataNotFoundForOvertimeRequestLogResponse = false;
    this.networkConnectionErrorForOvertimeRequestLogResponse = false;
  }

  isShimmerForOvertimeRequestResponse: boolean = false;
  dataNotFoundForOvertimeRequestResponse: boolean = false;
  networkConnectionErrorForOvertimeRequestResponse: boolean = false;

  preRuleForShimmersAndErrorPlaceholdersForOvertimeRequestResponseMethodCall() {
    this.isShimmerForOvertimeRequestResponse = true;
    this.dataNotFoundForOvertimeRequestResponse = false;
    this.networkConnectionErrorForOvertimeRequestResponse = false;
  }

  isShimmerForOvertimePendingRequestResponse: boolean = false;
  dataNotFoundForOvertimePendingRequestResponse: boolean = false;
  networkConnectionErrorForOvertimePendingRequestResponse: boolean = false;

  preRuleForShimmersAndErrorPlaceholdersForOvertimePendingRequestResponseMethodCall() {
    this.isShimmerForOvertimePendingRequestResponse = true;
    this.dataNotFoundForOvertimePendingRequestResponse = false;
    this.networkConnectionErrorForOvertimePendingRequestResponse = false;
  }

  overtimeRequestLogResponseList: OvertimeRequestLogResponse[] = [];
  getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDateMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersForOvertimeRequestLogResponseMethodCall();
    this.dataService
      .getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDate(
        this.startDate,
        this.endDate,
        this.itemPerPage,
        this.pageNumber,
        this.searchText,
        this.searchBy
      )
      .subscribe(
        (response) => {
          if (this.helperService.isListOfObjectNullOrUndefined(response)) {
            this.dataNotFoundForOvertimeRequestLogResponse = true;
          } else {
            this.overtimeRequestLogResponseList = response.listOfObject;
          }

          this.isShimmerForOvertimeRequestLogResponse = false;
        },
        (error) => {
          this.isShimmerForOvertimeRequestLogResponse = false;
          this.networkConnectionErrorForOvertimeRequestLogResponse = true;
        }
      );
  }

  overtimeRequestResponseList: OvertimeResponseDTO[] = [];
  getOvertimeRequestResponseByOrganizationUuidAndStartDateAndEndDateMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersForOvertimeRequestResponseMethodCall();
    this.dataService
      .getOvertimeRequestResponseByOrganizationUuidAndStartDateAndEndDate(
        this.startDate,
        this.endDate
      )
      .subscribe(
        (response) => {
          if (this.helperService.isListOfObjectNullOrUndefined(response)) {
            this.dataNotFoundForOvertimeRequestResponse = true;
          } else {
            this.overtimeRequestResponseList = response.listOfObject;
          }

          this.isShimmerForOvertimeRequestResponse = false;
        },
        (error) => {
          this.isShimmerForOvertimeRequestResponse = false;
          this.networkConnectionErrorForOvertimeRequestResponse = true;
        }
      );
  }

  pendingRequestCount: number = 0;
  overtimePendingRequestResponseList: OvertimeResponseDTO[] = [];
  getOvertimePendingRequestResponseByOrganizationUuidAndStartDateAndEndDateMethodCall() {
    // this.pendingRequestCount
    this.preRuleForShimmersAndErrorPlaceholdersForOvertimePendingRequestResponseMethodCall();
    this.dataService
      .getOvertimePendingRequestResponseByOrganizationUuidAndStartDateAndEndDate(
        this.startDate,
        this.endDate
      )
      .subscribe(
        (response) => {
          if (this.helperService.isListOfObjectNullOrUndefined(response)) {
            this.dataNotFoundForOvertimePendingRequestResponse = true;
            this.pendingRequestCount = 0;
          } else {
            this.overtimePendingRequestResponseList = response.listOfObject;
            this.pendingRequestCount =
              this.overtimePendingRequestResponseList.length;
          }
          this.getRequestCountByOrganizationUuid();

          this.isShimmerForOvertimePendingRequestResponse = false;
        },
        (error) => {
          this.isShimmerForOvertimePendingRequestResponse = false;
          this.networkConnectionErrorForOvertimePendingRequestResponse = true;
        }
      );
  }

  overtimeRequestActionResponse: OvertimeResponseDTO =
    new OvertimeResponseDTO();
  getOvertimeRequestActionResponseMethodCall(
    overtimeResponseDTO: OvertimeResponseDTO
  ) {
    this.overtimeRequestActionResponse = overtimeResponseDTO;
    console.log(this.overtimeRequestActionResponse);
  }

  @ViewChild('closeOvertimeRequestActionModal')
  closeOvertimeRequestActionModal!: ElementRef;
  approveLoader: boolean = false;
  rejectLoader: boolean = false;
  approveOrRejectOvertimeRequestMethodCall(
    overtimeRequestId: number,
    requestTypeId: number
  ) {
    if (requestTypeId == this.key.APPROVED) {
      this.approveLoader = true;
    } else if (requestTypeId == this.key.REJECTED) {
      this.rejectLoader = true;
    }

    this.dataService
      .approveOrRejectOvertimeRequest(overtimeRequestId, requestTypeId)
      .subscribe(
        (response) => {
          this.approveLoader = false;
          this.rejectLoader = false;
          this.closeOvertimeRequestActionModal.nativeElement.click();
          this.helperService.showToast(
            response.message,
            Key.TOAST_STATUS_SUCCESS
          );
          this.getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
          this.getOvertimePendingRequestResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
        },
        (error) => {
          this.approveLoader = false;
          this.rejectLoader = false;
          this.helperService.showToast(
            'Error while approving the request!',
            Key.TOAST_STATUS_ERROR
          );
        }
      );
  }


  // ####################--Updation Request Tab code--######################
  // Tab in Updation request tab section
  ATTENDANCE_UPDATE_PENDING_REQUEST_TAB =
    Key.ATTENDANCE_UPDATE_PENDING_REQUEST_TAB;
  ATTENDANCE_UPDATE_REQUEST_HISTORY_TAB =
    Key.ATTENDANCE_UPDATE_REQUEST_HISTORY_TAB;

  ACTIVE_TAB_IN_ATTENDANCE_UPDATE_REQUEST_TAB =
    Key.ATTENDANCE_UPDATE_PENDING_REQUEST_TAB;
  changeLogTabInAttendanceUpdateRequestTab(tabId: number) {
    this.ACTIVE_TAB_IN_ATTENDANCE_UPDATE_REQUEST_TAB = tabId;
  }

  @ViewChild('closeAttendanceUpdateRequestActionModal')
  closeAttendanceUpdateRequestActionModal!: ElementRef;
  attendanceUpdateRequestActionResponse: AttendanceTimeUpdateResponse =
    new AttendanceTimeUpdateResponse();
  getAttendanceUpdateRequestActionResponseMethodCall(
    attendanceTimeUpdateResponse: AttendanceTimeUpdateResponse
  ) {
    this.attendanceUpdateRequestActionResponse = attendanceTimeUpdateResponse;
  }

  attendanceUpdateRequestApproveLoader: boolean = false;
  attendanceUpdateRequestRejectLoader: boolean = false;
  geocoder = new google.maps.Geocoder();
  getAddressFromCoords(lat: any, lng: any): string | undefined {
    return "Click 'View Location' , to view attendace location on map";
  }

  // new

  @ViewChild('attendanceUploadModal') attendanceUploadModal!: ElementRef;
  openAttendanceUploadModal() {
    this.attendanceUploadModal.nativeElement.click();
  }

  fileName: any;
  currentFileUpload: any;
  expectedColumns: string[] = [
    'Name*',
    'Phone*',
    'Email*',
    "Date* ('DD-MM-YYYY')",
    "In-Time* ('HH:MM:SS')",
    "Out-Time* ('HH:MM:SS')",
  ];
  correctColumnName: string[] = [
    'S. NO.*',
    'Name*',
    'Phone*',
    'Email*',
    "Date* ('DD-MM-YYYY')",
    "In-Time* ('HH:MM:SS')",
    "Out-Time* ('HH:MM:SS')",
    'Note',
  ];
  fileColumnName: string[] = [];
  isExcel: string = '';
  data: any[] = [];
  dataWithoutHeader: any = [];
  mismatches: string[] = [];
  invalidRows: boolean[] = []; // Track invalid rows
  invalidCells: boolean[][] = []; // Track invalid cells
  isinvalid: boolean = false;
  jsonData: any[] = [];
  validateMap: Map<string, string[]> = new Map();
  @ViewChild('attention') elementToScroll!: ElementRef;

  selectFile(event: any) {
    debugger;
    this.validateMap = new Map();
    try {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        this.currentFileUpload = file;
        this.fileName = file.name;

        if (!this.isExcelFile(file)) {
          this.isExcel = 'Invalid file type. Please upload an Excel file.';
          return;
        }

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const binaryStr = this.arrayBufferToString(arrayBuffer);
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            this.jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Reset data and error tracking
            this.data = [];
            this.invalidRows = [];
            this.invalidCells = [];
            this.validateMap.clear();

            const columnNames: string[] = this.jsonData[0] as string[];
            if (this.validateColumns(columnNames)) {
              this.data = this.jsonData
                .map((row: any[]) =>
                  row.map((cell: any, index: number) => {
                    if (
                      this.fileColumnName[index] === "date* ('dd-mm-yyyy')" &&
                      cell !== "date* ('dd-mm-yyyy')"
                    ) {
                      // Remove leading/trailing commas and quotes
                      cell = this.cleanCell(cell);

                      // Parse Excel date serial or formatted date string
                      if (typeof cell === 'number') {
                        return moment(XLSX.SSF.parse_date_code(cell)).format(
                          'DD-MM-YYYY'
                        );
                      }

                      const formattedCell = this.formatDate1(cell);
                      return formattedCell ? formattedCell : '';
                    } else if (
                      (this.fileColumnName[index] === "in-time* ('hh:mm:ss')" &&
                        cell !== "in-time* ('hh:mm:ss')") ||
                      (this.fileColumnName[index] ===
                        "out-time* ('hh:mm:ss')" &&
                        cell !== "out-time* ('hh:mm:ss')")
                    ) {
                      // Remove leading/trailing commas and quotes
                      cell = this.cleanCell(cell);

                      // Parse Excel time serial or formatted time string
                      if (typeof cell === 'number') {
                        return moment(XLSX.SSF.parse_date_code(cell)).format(
                          'HH:mm:ss'
                        );
                      }

                      const formattedTime = this.formatTime(cell);
                      return formattedTime ? formattedTime : '';
                    } else {
                      return cell ? cell.toString().trim() : '';
                    }
                  })
                )
                .filter((row: any[]) => row.some((cell: any) => cell !== ''));

              this.validateRows(this.data.slice(1));
              this.removeAllSingleEntries();
              this.validateMap.forEach((values, key) => {
                // this.mismatches.push(`Repeating values: "${key}" at row no. ${values}`);
                if (this.elementToScroll) {
                  this.elementToScroll!.nativeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }
              });
              this.totalPage = Math.ceil(this.data.length / this.pageSize);

              if (this.mismatches.length === 0) {
                this.isinvalid = false;
                this.uploadUserFile(file, this.fileName);
              } else {
                this.isinvalid = true;
              }
            } else {
              console.error('Invalid column names');
            }
          } catch (error) {
            console.error('Error processing file:', error);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  }

  // Helper method to clean cell values
  private cleanCell(cell: any): string {
    // Ensure the cell is a string, and remove leading/trailing commas or quotes
    return (
      cell
        ?.toString()
        .replace(/^[,']+|[,']+$/g, '')
        .trim() || ''
    );
  }

  // Helper methods for formatting date and time
  private formatDate1(cell: any): string | null {
    const acceptableFormats = [
      'MM-DD-YYYY',
      'MM/DD/YYYY',
      'YYYY-MM-DD',
      'DD-MM-YYYY',
      'DD/MM/YYYY',
    ];
    const formattedDate = moment(cell, acceptableFormats, true);
    return formattedDate.isValid() ? formattedDate.format('MM-DD-YYYY') : null;
  }

  private formatTime(cell: any): string | null {
    const acceptableFormats = ['HH:mm:ss', 'HH:mm'];
    const formattedTime = moment(cell, acceptableFormats, true);
    return formattedTime.isValid() ? formattedTime.format('HH:mm:ss') : null;
  }


  isExcelFile(file: File): boolean {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel',
    ];

    const allowedExtensions = ['xlsx', 'xls'];

    return (
      allowedMimeTypes.includes(file.type) &&
      allowedExtensions.includes(
        file.name.split('.').pop()?.toLowerCase() || ''
      )
    );
  }

  arrayBufferToString(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    let binaryStr = '';
    for (let i = 0; i < byteArray.length; i++) {
      binaryStr += String.fromCharCode(byteArray[i]);
    }
    return binaryStr;
  }

  validateColumns(columnNames: string[]): boolean {
    this.mismatches = []; // Reset mismatches

    // Step 2: Normalize both expected and actual column names for comparison
    const normalizedColumnNames = columnNames.map((col) =>
      col.trim().toLowerCase()
    );
    this.fileColumnName = normalizedColumnNames;
    const normalizedExpectedColumns = this.expectedColumns.map((col) =>
      col.trim().toLowerCase()
    );
    const normalizedCorrectColumns = this.correctColumnName.map((col) =>
      col.trim().toLowerCase()
    );

    // Step 3: Check that every expected column is present in actual column names
    for (const expectedColumn of normalizedExpectedColumns) {
      if (!normalizedColumnNames.includes(expectedColumn)) {
        console.error(`Missing column: "${expectedColumn}"`);
        this.mismatches.push(`Missing column: "${expectedColumn}"`);
      }
    }

    // Step 4: Check if there are extra or incorrect columns in actual column names
    for (const actualColumn of normalizedColumnNames) {
      if (
        !normalizedExpectedColumns.includes(actualColumn) &&
        !normalizedCorrectColumns.includes(actualColumn) &&
        actualColumn !== 'error' // Allow "error" as a valid column
      ) {
        console.error(`Unexpected or incorrect column: "${actualColumn}"`);
        this.mismatches.push(
          `Unexpected or incorrect column: "${actualColumn}"`
        );
      }
    }

    // Step 5: Log and return false if there are any mismatches
    if (this.mismatches.length > 0) {
      console.error('Column mismatches found:');
      this.mismatches.forEach((mismatch) => console.error(mismatch));
      return false;
    }

    return true;
  }


  readonly constants = constant;
  addToMap(key: string, value: string) {
    if (this.validateMap.has(key)) {
      console.log(key, value);
      // If key exists, add the new value to the existing array
      this.validateMap.get(key)?.push(value);
    } else {
      // If key does not exist, create a new array with the value
      this.validateMap.set(key, [value]);
    }
  }
  removeAllSingleEntries() {
    for (const [key, valuesArray] of this.validateMap) {
      if (valuesArray.length <= 1) {
        this.validateMap.delete(key);
      }
    }
  }

  validateRows(rows: any[]): void {
    console.log(
      '🚀 ~ EmployeeOnboardingDataComponent ~ validateRows ~ rows:',
      rows
    );
    this.invalidRows = new Array(rows.length).fill(false); // Reset invalid rows
    this.invalidCells = Array.from({ length: rows.length }, () =>
      new Array(this.expectedColumns.length).fill(false)
    ); // Reset invalid cells

    for (let i = 0; i < rows.length; i++) {
      let rowIsValid = true;
      for (let j = 0; j < this.fileColumnName.length; j++) {
        const cellValue = rows[i][j];
        if (
          !cellValue ||
          cellValue === null ||
          cellValue.toString().trim() === ''
        ) {
          rowIsValid = false;
          this.invalidRows[i] = true; // Mark the row as invalid
          this.invalidCells[i][j] = true; // Mark the cell as invalid
        }
        if (this.fileColumnName[j] === 'email*' && cellValue) {
          this.addToMap(cellValue.toString(), `${i + 1}`);
        }
        if (this.fileColumnName[j] === 'phone*' && cellValue) {
          const phoneNumber = cellValue.toString().trim();
          this.addToMap(cellValue.toString(), `${i + 1}`);
          if (!/^\d{10}$/.test(phoneNumber)) {
            rowIsValid = false;
            this.invalidRows[i] = true; // Mark the row as invalid
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }
        }

        if (this.fileColumnName[j] === 'date*' && cellValue) {
          // Replace slashes with hyphens
          const normalizedCell = cellValue
            .toString()
            .trim()
            .replace(/\//g, '-');

          // Check if the normalized cell matches the exact MM-DD-YYYY format
          const isExactFormat = /^\d{2}-\d{2}-\d{4}$/.test(normalizedCell);

          if (isExactFormat) {
            // Parse with strict format checking
            const formattedDate = moment(normalizedCell, 'DD-MM-YYYY', true);

            // Check if the date is valid
            if (formattedDate.isValid()) {
              const oneYearFromNow = moment().add(1, 'year');

              // Ensure the date is in the past or less than one year from today
              if (formattedDate.isAfter(oneYearFromNow)) {
                this.data[i + 1][j] = undefined;
                rowIsValid = false;
                this.invalidRows[i] = true; // Mark the row as invalid
                this.invalidCells[i][j] = true; // Mark the cell as invalid
              }
            } else {
              // If the date is not valid
              this.data[i + 1][j] = undefined;
              rowIsValid = false;
              this.invalidRows[i] = true; // Mark the row as invalid
              this.invalidCells[i][j] = true; // Mark the cell as invalid
            }
          } else {
            // If the format is not exactly MM-DD-YYYY
            this.data[i + 1][j] = undefined;
            rowIsValid = false;
            this.invalidRows[i] = true; // Mark the row as invalid
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }
        }

        if (
          !this.expectedColumns.some(
            (expectedColumn) =>
              expectedColumn.toLowerCase() ===
              this.fileColumnName[j].toLowerCase()
          )
        ) {
          this.invalidCells[i][j] = false;
        }
      }
    }
    debugger;
  }

  importToggle: boolean = false;
  isProgressToggle: boolean = false;
  isErrorToggle: boolean = false;
  errorMessage: string = '';
  phoneNumberNotFoundArray: any = [];
  emailNotFoundArray: any = [];
  onboardUserList: any = [];
  networkConnectionErrorPlaceholderModal: boolean = false;
  sampleFileUrl: string = '';
  pageSize: number = 10;
  totalPage: number = 0;

  formatAsCommaSeparated(items: string[]): string {
    return items.join(', ');
  }

  isShimmerModal: boolean = false;
  attendanceUploadCountForUser: number = 0;
  attendanceUploadFailedCountForUser: number = 0;
  uploadedExcelLink: string = '';
  uploadUserFile(file: any, fileName: string) {
    debugger;
    this.importToggle = true;
    this.isProgressToggle = true;
    this.isErrorToggle = false;
    this.errorMessage = '';
    this.attendanceUploadCountForUser = 0;
    // this.isShimmerModal = true;
    console.log('File:', file);
    this.dataService.createAttendanceEntry(file, fileName).subscribe(
      (response: any) => {
        if (response.status) {
          this.importToggle = false;
          this.isProgressToggle = false;
          this.isShimmerModal = false;

          this.attendanceUploadCountForUser =
            response.object.uploadedEntriesSize;
          this.uploadedExcelLink = response.object.excelUrl;
          this.phoneNumberNotFoundArray =
            response.object.phoneNumberNotRegistered;
          this.emailNotFoundArray = response.object.emailNotRegistered;
          this.networkConnectionErrorPlaceholderModal = false;
        } else {
          this.importToggle = true;
          this.isErrorToggle = true;
          this.isProgressToggle = false;
          this.isShimmerModal = false;
          this.errorMessage = response.message;
          this.uploadedExcelLink = response.object;
          this.attendanceUploadCountForUser = 0;
          this.attendanceUploadFailedCountForUser = 0;
          this.networkConnectionErrorPlaceholderModal = false;
        }
      },
      (error) => {
        this.importToggle = true;
        this.isErrorToggle = true;
        this.isProgressToggle = false;
        this.isShimmerModal = false;
        this.errorMessage = error.error.message;
        this.uploadedExcelLink = error.error.object;
        this.attendanceUploadCountForUser = 0;
        this.attendanceUploadFailedCountForUser = 0;
        // this.networkConnectionErrorPlaceholderModal = true;
      }
    );
  }

  resetModal() {
    this.attendanceUploadCountForUser = 0;
    this.attendanceUploadFailedCountForUser = 0;
    this.isProgressToggle = false;
    this.isShimmerModal = false;
    this.networkConnectionErrorPlaceholderModal = false;
    this.phoneNumberNotFoundArray = [];
    this.emailNotFoundArray = [];
  }

  overtimeCount: number = 0;
  attendanceUpdateCount: number = 0;
  /**
   * Fetches the request count by organization UUID and updates the component's state with the retrieved counts.
   *
   * This method calls the `getRequestCountByOrganizationUuid` method of the `dataService` to fetch the request counts.
   * On a successful response, it updates the `overtimeCount` and `attendanceUpdateCount` properties with the respective counts.
   * If an error occurs during the request, it logs the error to the console.
   *
   * @returns {void}
   */
  getRequestCountByOrganizationUuid() {
    this.dataService.getRequestCountByOrganizationUuid().subscribe(
      (response: any) => {
        this.overtimeCount = response.object.overtimeRequestCount;
        this.attendanceUpdateCount =
          response.object.attendanceUpdationRequestCount;
      },
      (error) => {
        console.error('Error fetching user count by status:', error);
      }
    );
  }

  changeShowFilter(flag: boolean) {
    this.showFilter = flag;
  }

  fetchAttendanceRequests(): void {
    this.dataService
      .getAttendanceRequestsNew('CREATE', '2024-03-01', '2024-03-30', 1, 10)
      .subscribe(
        (response) => {
          this.attendanceRequests = response.content;
        },
        (error) => {
          console.error('Error fetching attendance requests:', error);
        }
      );
  }

  showFilter1: boolean = false;
  currentTab: string = 'missedPunch'; // 'missedPunch' or 'systemOutage'
  selectedUserIds: number[] = [];
  selectedPunchType: string = ''; // 'Check-In', 'Check-Out', 'Both'
  startDate1: Date | null = null;
  endDate1: Date | null = null;
  selectedStatuses: string[] = [];
  selectedAttendanceStatus: string[] = [];
  searchTextMissedPunch: string = '';
  searchTextSystemOutage: string = '';

  // Data properties
  missedPunchRequests: any[] = [];
  systemOutageRequests: any[] = [];
  allUsers: any[] = [];
  isLoading: boolean = false;

  // Pagination properties
  currentPageMissedPunch: number = 1;
  pageSizeMissedPunch: number = 10;
  totalRecordsMissedPunch: number = 0;
  currentPageSystemOutage: number = 1;
  pageSizeSystemOutage: number = 10;
  totalRecordsSystemOutage: number = 0;

  private searchTextMissedPunchSubject = new Subject<string>();
  private searchTextSystemOutageSubject = new Subject<string>();
  private readonly DEBOUNCE_TIME = 300;

  // Status mapping for API
  statusMap: { [key: string]: number } = {
    Pending: 52,
    Approved: 50,
    Rejected: 51,
  };
  attendanceStatusMap: { [key: string]: number } = {
    in: 1,
    out: 2,
    break: 3,
    back: 4,
  };

  routeToUserDetails(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
  }

  // Fetch list of users for employee filter
  getAllUsers(): void {
    this.dataService.getOrganizationUserList().subscribe((response) => {
      this.allUsers = response.listOfObject; // Assumes { id: number, name: string }[]
    });
  }

  // Toggle filter dropdown and set current tab
  changeShowFilter1(show: boolean, tab: string): void {
    this.currentTab = tab;
    this.showFilter = show;
  }

  // Apply filters based on current tab
  applyFilters(): void {
    if (this.currentTab === 'missedPunch') {
      this.updateMissedPunchFilters();
      setTimeout(() => {
        this.fetchMissedPunchRequests();
      }, 10);
    } else {
      this.updateSystemOutageFilters();
      setTimeout(() => {
        this.fetchSystemOutageRequests();
      }, 10);
    }
    this.showFilter = false;
  }

  // Reset filters and refresh data
  resetFilters(): void {
    this.currentPageMissedPunch = 1;
    this.pageSizeMissedPunch = 10;
    this.totalRecordsMissedPunch = 0;
    this.currentPageSystemOutage = 1;
    this.pageSizeSystemOutage = 10;
    this.totalRecordsSystemOutage = 0;
    this.selectedUserIds = [];
    this.selectedPunchType = '';
    this.startDate1 = null;
    this.endDate1 = null;
    this.selectedStatuses = ['Pending'];
    this.selectedAttendanceStatus = [];
    this.searchTextMissedPunch = '';
    this.searchTextSystemOutage = '';
    this.activeMissedPunchFilters = [];
    this.activeSystemOutageFilters = [];
    setTimeout(()=>{
      this.applyFilters();
    }, 10);
  }

  onSearchTextMissedPunchChange(searchText: string): void {
    this.currentPageMissedPunch = 1;
    this.pageSizeMissedPunch = 10;
    this.searchTextMissedPunchSubject.next(searchText);
  }

  onSearchTextSystemOutageChange(searchText: string): void {
    this.currentPageSystemOutage = 1;
    this.pageSizeSystemOutage = 10;
    this.searchTextSystemOutageSubject.next(searchText);
  }

  // Fetch Missed Punch (CREATE) requests
  fetchMissedPunchRequests(): void {
    this.isLoading = true;

    const startDate = this.startDate1
      ? this.startDate1.toISOString().split('T')[0]
      : '';
    const endDate = this.endDate1
      ? this.endDate1.toISOString().split('T')[0]
      : '';
    const statuses = this.selectedStatuses.map(
      (status) => this.statusMap[status]
    );
    const attendanceStatuses = this.selectedAttendanceStatus.map(
      (status) => this.attendanceStatusMap[status]
    );
    const requestTypes = ['CREATE'];

    this.dataService
      .getAttendanceUpdateRequests(
        this.selectedUserIds,
        startDate,
        endDate,
        statuses,
        attendanceStatuses,
        requestTypes,
        this.currentPageMissedPunch - 1,
        this.pageSizeMissedPunch,
        this.searchTextMissedPunch
      )
      .subscribe(
        (response) => {
          this.missedPunchRequests = response.content.map((req: any) => ({
            ...req,
            isProcessing: false, // Initialize processing flag
          }));
          this.totalRecordsMissedPunch = response.totalElements;
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  totalPendingRequests: number = 0;
  findPendingRequests(): void {
    this.selectedStatuses = ['Pending'];
    const statuses = this.selectedStatuses.map(
      (status) => this.statusMap[status]
    );
    this.dataService
      .getAttendanceUpdateRequests(
        undefined,
        undefined,
        undefined,
        statuses,
        undefined,
        undefined,
        this.currentPageSystemOutage - 1,
        1,
        undefined
      )
      .subscribe(
        (response) => {
          this.totalPendingRequests = response.totalElements;
        },
        () => {}
      );
  }

  // Fetch System Outage (UPDATE) requests
  fetchSystemOutageRequests(): void {
    this.isLoading = true;
    const startDate = this.startDate1
      ? this.startDate1.toISOString().split('T')[0]
      : '';
    const endDate = this.endDate1
      ? this.endDate1.toISOString().split('T')[0]
      : '';
    const statuses = this.selectedStatuses.map(
      (status) => this.statusMap[status]
    );
    const attendanceStatuses = this.selectedAttendanceStatus.map(
      (status) => this.attendanceStatusMap[status]
    );
    const requestTypes = ['UPDATE'];
    this.dataService
      .getAttendanceUpdateRequests(
        this.selectedUserIds,
        startDate,
        endDate,
        statuses,
        attendanceStatuses,
        requestTypes,
        this.currentPageSystemOutage - 1,
        this.pageSizeSystemOutage,
        this.searchTextSystemOutage
      )
      .subscribe(
        (response) => {
          this.systemOutageRequests = response.content.map((req: any) => ({
            ...req,
            isProcessing: false, // Initialize processing flag
          }));
          this.totalRecordsSystemOutage = response.totalElements;
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  showAttendanceUpdate: boolean = false;
  attendanceUpdateData: any = {};

  viewRequest(request: any): void {
    this.showAttendanceUpdate = false;
    this.attendanceUpdateData = {};
    this.attendanceUpdateData.id = request.id;
    this.attendanceUpdateData.userType = 'ADMIN';
    this.attendanceUpdateData.isModal = 1;
    this.getAttendanceUpdateById(request.id);
  }
  onAttendanceUpdateClose() {
    this.showAttendanceUpdate = false;
    this.applyFilters();
  }

  getAttendanceUpdateById(id: number): void {
    this.dataService.getAttendanceRequestById(id).subscribe(
      (data) => {
        if (data.status) {
          this.attendanceUpdateData.attendanceRequest = data.object;
          setTimeout(() => {
            this.showAttendanceUpdate = true;
          }, 1);
        } else {
        }
      },
      (error) => {
        console.error('Error fetching attendance update:', error);
      }
    );
  }

  activeMissedPunchFilters: any[] = [];
  activeSystemOutageFilters: any[] = [];
  private updateMissedPunchFilters(): void {
    this.activeMissedPunchFilters = [];

    // Add individual user filters
    this.selectedUserIds.forEach((userId) => {
      const user = this.allUsers.find((u) => u.id === userId);
      if (user) {
        this.activeMissedPunchFilters.push({
          type: 'user',
          label: 'Employee',
          value: user.userName,
          userId: userId, // Include userId for specific removal
        });
      }
    });

    // Add date range filter
    if (this.startDate1 || this.endDate1) {
      const start = this.startDate1
        ? this.startDate1.toLocaleDateString()
        : '<-';
      const end = this.endDate1 ? this.endDate1.toLocaleDateString() : '->';
      this.activeMissedPunchFilters.push({
        type: 'dateRange',
        label: 'Date Range',
        value: `${start} to ${end}`,
      });
    }

    // Add status filter
    if (this.selectedStatuses.length) {
      this.selectedStatuses.forEach((status) => {
        this.activeMissedPunchFilters.push({
          type: 'status',
          label: 'Status',
          value: status,
        });
      });
    }

    // Add search filter
    if (this.searchTextMissedPunch) {
      this.activeMissedPunchFilters.push({
        type: 'search',
        label: 'Search',
        value: this.searchTextMissedPunch,
      });
    }
  }

  private updateSystemOutageFilters(): void {
    this.activeSystemOutageFilters = [];

    // Add individual user filters
    this.selectedUserIds.forEach((userId) => {
      const user = this.allUsers.find((u) => u.id === userId);
      if (user) {
        this.activeSystemOutageFilters.push({
          type: 'user',
          label: 'Employee',
          value: user.userName,
          userId: userId, // Include userId for specific removal
        });
      }
    });

    // Add date range filter
    if (this.startDate1 || this.endDate1) {
      const start = this.startDate1
        ? this.startDate1.toLocaleDateString()
        : 'N/A';
      const end = this.endDate1 ? this.endDate1.toLocaleDateString() : 'N/A';
      this.activeSystemOutageFilters.push({
        type: 'dateRange',
        label: 'Date Range',
        value: `${start} to ${end}`,
      });
    }

    // Add status filter
    if (this.selectedStatuses.length) {
      this.selectedStatuses.forEach((status) => {
        this.activeSystemOutageFilters.push({
          type: 'status',
          label: 'Status',
          value: status,
        });
      });
    }

    // Add attendance status filter
    if (this.selectedAttendanceStatus.length) {
      this.selectedAttendanceStatus.forEach((status) => {
        this.activeSystemOutageFilters.push({
          type: 'attendanceStatus',
          label: 'Attendance Status',
          value: status,
        });
      });
    }

    // Add search filter
    if (this.searchTextSystemOutage) {
      this.activeSystemOutageFilters.push({
        type: 'search',
        label: 'Search',
        value: this.searchTextSystemOutage,
      });
    }
  }

  removeFilter(filter: any, tab: string): void {
    if (filter.type === 'user' && filter.userId) {
      // Remove only the specific user
      this.selectedUserIds = this.selectedUserIds.filter(
        (id) => id !== filter.userId
      );
    } else {
      switch (filter.type) {
        case 'dateRange':
          this.startDate1 = null;
          this.endDate1 = null;
          break;
        case 'status':
          this.selectedStatuses = this.selectedStatuses.filter(
            (status) => status !== filter.value
          );
          break;
        case 'attendanceStatus':
          this.selectedAttendanceStatus = this.selectedAttendanceStatus.filter(
            (status) => status !== filter.value
          );
          break;
        case 'search':
          if (tab === 'missedPunch') this.searchTextMissedPunch = '';
          if (tab === 'systemOutage') this.searchTextSystemOutage = '';
          break;
      }
    }

    // Refresh data and filters based on the current tab
    if (tab === 'missedPunch') {
      this.fetchMissedPunchRequests();
      this.updateMissedPunchFilters();
    } else {
      this.fetchSystemOutageRequests();
      this.updateSystemOutageFilters();
    }
  }

  showAttendnaceUpdateActionButton(request:any): boolean { 
   return (request?.status?.id==52 && (request?.managerUuid==this.userUuid || this.rbacService.hasWriteAccess(this.Routes.TIMETABLE)))
  }
}
