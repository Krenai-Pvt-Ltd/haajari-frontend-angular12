import {
  ChangeDetectorRef,
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

// import { ChosenDate, TimePeriod } from 'ngx-daterangepicker-material/daterangepicker.component';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css'],
})
export class TimetableComponent implements OnInit {
  alwaysShowCalendars: boolean | undefined;
  model: any;
  constructor(
    private dataService: DataService,
    public helperService: HelperService,
    private router: Router,
    private rbacService: RoleBasedAccessControlService,
    private firebaseStorage: AngularFireStorage,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    // private headerComponent: HeaderComponent
  ) { }

  async ngOnInit(): Promise<void> {
    this.sampleFileUrl ="assets/samples/Attendance_Upload.xlsx"
    window.scroll(0, 0);
    this.sampleFileUrl = "assets/samples/Attendance_Upload.xlsx"
    this.getRequestCountByOrganizationUuid()
    this.getOrganizationRegistrationDateMethodCall();
    this.inputDate = this.getCurrentDate();
    this.assignRole();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
    const today = dayjs();
    const oneWeekAgo = today.subtract(1, 'week');
    this.selected = {
      startDate: oneWeekAgo,
      endDate: today,
    };

    this.updateDateRangeInputValue();
    this.getFirstAndLastDateOfMonth(this.selectedDate);
    // this.getDataFromDate();
    this.getAttendanceDetailsCountMethodCall();
    this.getAttendanceDetailsReportByDateMethodCall();
    this.getActiveUsersCountMethodCall();
    this.getHolidayForOrganization();


    this.logInUserUuid = await this.rbacService.getUUID();
  }

  loginDetails = this.helperService.getDecodedValueFromToken();
  assignRole() {
    this.role = this.rbacService.getRole();
    this.userUuid = this.rbacService.getUUID();
    this.orgRefId = this.rbacService.getOrgRefUUID();
  }
  role: any;
  userUuid: any;
  orgRefId: any;

  PRESENT = Key.PRESENT;
  ABSENT = Key.ABSENT;
  UNMARKED = Key.UNMARKED;
  WEEKEND = Key.WEEKEND;
  HOLIDAY = Key.HOLIDAY;
  readonly Constant = constant;

  readonly key = Key;
  ROLE = this.rbacService.getRole();

  ADMIN = Key.ADMIN;
  MANAGER = Key.MANAGER;
  USER = Key.USER;

  TODAY = new Date();
  selectedDate: Date = new Date();
  size: 'large' | 'small' | 'default' = 'small';

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.getAttendanceDetailsCountMethodCall();
    this.getAttendanceDetailsReportByDateMethodCall();
    this.getHolidayForOrganization();
  }

  disableDates = (current: Date): boolean => {
    const today = new Date();
    // console.log(today);
    // console.log(current);
    today.setHours(0, 0, 0, 0);

    const registrationDate = new Date(this.organizationRegistrationDate);

    registrationDate.setHours(0, 0, 0, 0);

    return (
      current.getTime() >= today.getTime() + 24 * 60 * 60 * 1000 ||
      current.getTime() < registrationDate.getTime()
    );
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


  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selected: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};
  logInUserUuid: string = '';

  dateRangeInputValue: string = '';

  totalAttendance: number = 0;
  attendanceArrayDate: any = [];

  dateRangeFilter(event: any): void {
    if (event.startDate && event.endDate) {
      this.selected = {
        startDate: dayjs(event.startDate),
        endDate: dayjs(event.endDate),
      };
      // this.getDataFromDate();
    } else {
      this.selected = null;
    }

    this.updateDateRangeInputValue();

    const res3 = document.getElementById(
      'date-picker-wrapper'
    ) as HTMLElement | null;
    if (res3) {
      res3.style.display = 'none';
    }
  }

  // getDataFromDate(): void {
  //   if (this.selected) {
  //     const startDateStr: string = this.selected.startDate.startOf('day').format('YYYY-MM-DD');
  //     const endDateStr: string = this.selected.endDate.endOf('day').format('YYYY-MM-DD');
  //     debugger

  //     this.dataService.getAttendanceDetailsByDateDuration(startDateStr, endDateStr).subscribe(

  //       (response: any) => {

  //         this.myAttendanceData = response;
  //         console.log(this.myAttendanceData);
  //         if (this.myAttendanceData) {

  //           for (const key in this.myAttendanceData) {

  //             if (this.myAttendanceData.hasOwnProperty(key)) {
  //               const attendanceArray = this.myAttendanceData[key];

  //               this.attendanceArrayDate=attendanceArray;

  //             }
  //           }
  //         }
  //       },
  //       (error: any) => {
  //         console.error('Error fetching data:', error);
  //       }
  //     );
  //   }
  // }

  getCurrentDate() {
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = (todayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = todayDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  dateRangeButton() {
    const res = document.getElementById(
      'date-picker-wrapper'
    ) as HTMLElement | null;
    if (res) {
      res.style.display = 'block';
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

  flag!: boolean;

  checkingUserRoleMethod(): boolean {
    this.dataService.checkingUserRole().subscribe(
      (data) => {
        this.flag = data;
        // console.log(data);
      },
      (error) => {
        // console.log(error);
      }
    );
    // console.log(this.flag);

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

  // formatDate(date: Date): string {
  //   const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  //   return date.toLocaleDateString('en-US', options);
  // }

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

  preRuleForShimmersAndOtherConditionsMethodCall() {
    this.isShimmerForAttendanceDetailsResponse = true;
    this.dataNotFoundForAttendanceDetailsResponse = false;
    this.networkConnectionErrorForAttendanceDetailsResponse = false;
  }

  attendanceDetailsResponseList: AttendanceDetailsResponse[] = [];
  debounceTimer: any;
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

  // breakTimingsList : BreakTimings[] = [];
  getAttendanceDetailsBreakTimingsReportByDateByUserMethodCall(
    attendanceDetailsResponse: AttendanceDetailsResponse
  ) {
    // this.toggleChevron(show);
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
            // this.breakTimingsList = response.listOfObject;
            attendanceDetailsResponse.breakTimingsList = response.listOfObject;
            // console.log(this.breakTimingsList);
            this.toggleChevron(false);
          },
          (error) => {
            console.log(error);
          }
        );
    } else {
      // this.breakTimingsList = attendanceDetailsResponse.breakTimingsList;
    }
  }

  attendanceDetailsCountResponse: AttendanceDetailsCountResponse =
    new AttendanceDetailsCountResponse();
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

  readonly filterCriteriaList: string[] = [
    'ALL',
    'PRESENT',
    'ABSENT',
    'HALFDAY',
    'LEAVE',
  ];

  selectFilterCriteria(filterCriteria: string) {
    this.filterCriteria = filterCriteria;

    this.attendanceDataByDateKey = [];
    this.attendanceDataByDateValue = [];
    this.total = 0;
    this.resetCriteriaFilter();
    this.selectedDate = new Date();
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.getAttendanceDetailsReportByDateMethodCall();
  }

  activeUsersCount: number = 0;

  getActiveUsersCountMethodCall() {
    this.dataService.getActiveUsersCount().subscribe(
      (data) => {
        // console.log(data);
        this.activeUsersCount = data;
      },
      (error) => {
        // console.log(error);
      }
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

  additionalNotes: AdditionalNotes = new AdditionalNotes();
  additionalNotesUserUuid!: string;

  @ViewChild('addNotesModalClose') addNotesModalClose!: ElementRef;

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

  // --------------------------------------------------------

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

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholdersMethodCall() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  userUuidToViewLogs: string = '';
  viewLogs(uuid: string) {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.attendanceLogResponseList = [];
    this.userUuidToViewLogs = uuid;
    this.getAttendanceLogsMethodCall();
  }

  attendanceLogShimmerFlag: boolean = false;
  dataNotFoundFlagForAttendanceLog: boolean = false;
  networkConnectionErrorFlagForAttendanceLog: boolean = false;
  attendanceLogResponseList: AttendanceLogResponse[] = [];
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

  // ####################Scroll Into View#################################

  // scrollIntoView() {
  // const element = document.getElementById("attendanceDataTopbar");

  //     if(element!== null && element!== undefined){
  //       element.scrollIntoView();
  //       element.scrollIntoView(false);
  //       element.scrollIntoView({ block: "end" });
  //       element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  //     }
  // }

  // route to user's profile
  routeToUserProfile(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    // this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], navExtra);
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
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


  // openAttendanceLog() {
  //   this.attendanceLogModal.nativeElement.click();
  // }

  url: string = '';
  imageDownUrl: string = '';
  openSelfieModal(url: string) {
    this.url = url;
    this.imageDownUrl = url;
    this.updateFileType(url);
    this.viewlog.nativeElement.click();
    this.openDocModalButton.nativeElement.click();
  }

  previewString: SafeResourceUrl | null = null;
  isPDF: boolean = false;
  isImage: boolean = false;

  @ViewChild('openDocModalButton') openDocModalButton!: ElementRef;
  getFileName(url: string): string {
    return url.split('/').pop() || 'Attendance Selfie';
  }

  private updateFileType(url: string) {
    const extension = url.split('?')[0].split('.').pop()?.toLowerCase();
    this.isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(extension!);
    this.isPDF = extension === 'pdf';
    if (this.isPDF) {
      this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`);
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

  // downloadFile(): void {
  //   const link = document.createElement('a');
  //   link.href = this.url;
  //   link.download = this.getFileName(this.url);
  //   link.click();
  // }


  downloadFile(imageUrl: any) {
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
          saveAs(blob, 'Selfie');
        };
        xhr.open('GET', url);
        xhr.send();
      })
      .catch((error: any) => {
        // Handle any errors
      });
  }

  @ViewChild('viewlog') viewlog!: ElementRef;
  @ViewChild('attendanceLogModal') attendanceLogModal!: ElementRef;
  reOpenLogsModal() {
    this.viewLogs(this.userUuidToViewLogs);
    this.viewlog.nativeElement.click();
  }


  // reOpenLogsModal(): void {
  //   const closeButtons = document.querySelectorAll('.btn-close');
  //   closeButtons.forEach(button => {
  //     button.addEventListener('click', () => {
  //       setTimeout(() => {
  //         this.attendanceLogModal.nativeElement.click();
  //       }, 500); // Delay to allow modal to fully close
  //     });
  //   });
  // }




  dailyReportLog: string = '';
  rotateToggle: boolean = false;
  downloadAttedanceReport(date: Date) {

    let dateString: string | null = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.rotateToggle = true;
    if (dateString !== null) {
      this.dataService
        .getAtendanceDailyReport(
          dateString, null
        )
        .subscribe(
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

  checkHoliday: boolean = false;
  showPlaceholder: boolean = false;

  getHolidayForOrganization() {

    this.dataService.getHolidayForOrganization(this.helperService.formatDateToYYYYMMDD(this.selectedDate))
      .subscribe(
        (response) => {
          this.checkHoliday = response.object;
          // console.log(response);
          // console.error("Response", response.object);

          if (this.checkHoliday == true) {
            this.showPlaceholder = true;
          } else if (this.checkHoliday == false) {
            this.showPlaceholder = false;
          }

        },
        (error) => {
          console.error('Error details:', error);
        }
      )
  }
  attendanceFullRequestLog: any[] = [];
  pageNumberFullAttendanceRequest: number = 1;
  itemPerPageFullAttendanceRequest: number = 5;
  totalAttendanceRequestCount: number = 0;
  isRequestLoader: boolean = false;
  fullAttendanceRequestSearchString: string = '';

  isShimmerForAttendanceUpdateRequestLogResponse: boolean = false;
  dataNotFoundForAttendanceUpdateRequestLogResponse: boolean = false;
  networkConnectionErrorForAttendanceUpdateRequestLogResponse: boolean = false;

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
      // if (this.debounceTimer) {
      //   clearTimeout(this.debounceTimer);
      // }
      // this.debounceTimer = setTimeout(() => {
      this.dataService.getFullAttendanceRequestLog(this.pageNumberFullAttendanceRequest, this.itemPerPageFullAttendanceRequest, this.fullAttendanceRequestSearchString).subscribe(response => {
        if (this.helperService.isObjectNullOrUndefined(response)) {
          this.dataNotFoundForAttendanceUpdateRequestLogResponse = true;
        } else {
          // this.attendanceFullRequestLog = response.listOfObject;
          this.attendanceFullRequestLog = [...this.attendanceFullRequestLog, ...response.object];
          this.totalAttendanceRequestCount = response.totalItems;
          this.isRequestLoader = false;
        }
        this.isShimmerForAttendanceUpdateRequestLogResponse = false;
      }, (error) => {
        this.networkConnectionErrorForAttendanceUpdateRequestLogResponse = true;
        this.isShimmerForAttendanceUpdateRequestLogResponse = false;
        this.isRequestLoader = false;
      });
      //  }, debounceTime);
    });
  }

  initialLoadDoneforFullLogs: boolean = false;
  @ViewChild('logContainerforFullLogs') logContainerforFullLogs!: ElementRef<HTMLDivElement>;
  scrollDownRecentActivityforFullLogs(event: any) {
    debugger
    if (!this.initialLoadDoneforFullLogs) return;

    if (this.totalAttendanceRequestCount < ((this.pageNumberFullAttendanceRequest - 1) * this.itemPerPageFullAttendanceRequest)) {
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

  attendanceRequests: AttendanceTimeUpdateResponse[] = [];
  pageNumberAttendanceRequest: number = 1;
  itemPerPageAttendanceRequest: number = 5;
  fullAttendanceRequestCount: number = 0;
  isFullRequestLoader: boolean = false;
  attendanceRequestSearchString: string = '';




  isShimmerForAttendanceUpdatePendingRequestResponse: boolean = false;
  dataNotFoundForAttendanceUpdatePendingRequestResponse: boolean = false;
  networkConnectionErrorForAttendanceUpdatePendingRequestResponse: boolean = false;

  preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdatePendingRequestResponseMethodCall() {
    this.isShimmerForAttendanceUpdatePendingRequestResponse = true;
    this.dataNotFoundForAttendanceUpdatePendingRequestResponse = false;
    this.networkConnectionErrorForAttendanceUpdatePendingRequestResponse = false;
  }
  getAttendanceRequestsData() {
    this.attendanceRequests = [];
    this.preRuleForShimmersAndErrorPlaceholdersForAttendanceUpdatePendingRequestResponseMethodCall();
    return new Promise((resolve, reject) => {
      this.isFullRequestLoader = true;
      // if (this.debounceTimer) {
      //   clearTimeout(this.debounceTimer);
      // }
      // this.debounceTimer = setTimeout(() => {
      this.dataService.getAttendanceRequests(this.pageNumberAttendanceRequest, this.itemPerPageAttendanceRequest, this.attendanceRequestSearchString, this.startDate, this.endDate).subscribe(response => {
        if (this.helperService.isObjectNullOrUndefined(response)) {
          this.dataNotFoundForAttendanceUpdatePendingRequestResponse = true;
        } else {
          // this.attendanceRequests = response.listOfObject;
          this.attendanceRequests = [...this.attendanceRequests, ...response.object];
          this.fullAttendanceRequestCount = response.totalItems;
          this.isFullRequestLoader = false;
        }
        this.getRequestCountByOrganizationUuid();
        this.isShimmerForAttendanceUpdatePendingRequestResponse = false;
      }, (error) => {
        this.isFullRequestLoader = false;
        this.isShimmerForAttendanceUpdatePendingRequestResponse = false;
        this.networkConnectionErrorForAttendanceUpdatePendingRequestResponse = true;
      });
      // }, debounceTime);
    });
  }

  attendanceRequestCount: number = 0;
  getAttendanceRequestsDataCount(): void {
    debugger
    this.dataService.getAttendanceRequestCount(this.startDate, this.endDate).subscribe(
      (response: any) => {
        this.attendanceRequestCount = response.object;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  isShimmerForAttendanceUpdateRequestResponse: boolean = false;
  dataNotFoundForAttendanceUpdateRequestResponse: boolean = false;
  networkConnectionErrorForAttendanceUpdateRequestResponse: boolean = false;

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
      // this.isFullRequestLoader = true;
      // if (this.debounceTimer) {
      //   clearTimeout(this.debounceTimer);
      // }
      // this.debounceTimer = setTimeout(() => {
      this.dataService.getAttendanceRequestsHistory(this.pageNumberAttendanceRequest, this.itemPerPageAttendanceRequest, this.attendanceRequestSearchString, this.startDate, this.endDate).subscribe(response => {
        if (this.helperService.isObjectNullOrUndefined(response)) {
          this.dataNotFoundForAttendanceUpdateRequestResponse = true;
        } else {
          // this.attendanceRequests = response.listOfObject;
          this.attendanceRequestsHistory = [...this.attendanceRequestsHistory, ...response.object];
          // this.fullAttendanceRequestCount = response.totalItems;
          // this.isFullRequestLoader = false;
          console.log('requests retrieved successfully', response.listOfObject);
        }
        this.isShimmerForAttendanceUpdateRequestResponse = false;
      }, (error) => {
        // this.isFullRequestLoader = false;
        this.networkConnectionErrorForAttendanceUpdateRequestResponse = true;
        this.isShimmerForAttendanceUpdateRequestResponse = false;
      });
      // }, debounceTime);
    });
  }

  // approveOrRequest(id:number, reqString: string) {
  initialLoadDone: boolean = false;
  @ViewChild('logContainer') logContainer!: ElementRef<HTMLDivElement>;
  scrollDownRecentActivity(event: any) {
    debugger
    if (!this.initialLoadDone) return;

    if (this.fullAttendanceRequestCount < ((this.pageNumberAttendanceRequest - 1) * this.itemPerPageAttendanceRequest)) {
      return;
    }
    const target = event.target as HTMLElement;
    const atBottom =
      target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

    if (atBottom) {
      this.pageNumberAttendanceRequest++;
      this.getAttendanceRequestsData();
    }
  }


  loadMoreAttendanceRequestLogs(): void {
    this.initialLoadDone = true;
    this.pageNumberAttendanceRequest++;
    // this.attendanceRequestLog = [];
    this.getAttendanceRequestsData();
  }

  onSearchChange(searchValue: string): void {
    this.attendanceRequestSearchString = searchValue;
    this.pageNumberAttendanceRequest = 1;
    this.attendanceRequests = [];
    this.getAttendanceRequestsData();
  }

  clearSearchUsersOfRequestLogs() {
    debugger
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
    if (reqString == 'APPROVE') {
      this.attendanceUpdateRequestApproveLoader = true;
    } else if (reqString == 'REJECT') {
      this.attendanceUpdateRequestRejectLoader = true;
    }
    this.dataService.approveOrRejectAttendanceRequest(id, reqString).subscribe(response => {
      this.attendanceUpdateRequestApproveLoader = false;
      this.attendanceUpdateRequestRejectLoader = false;
      // console.log('requests retrieved successfully', response.listOfObject);
      if (response.message == 'APPROVE') {
        this.helperService.showToast(
          'Request Approved Successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      } else if (response.message == 'REJECT') {
        this.helperService.showToast(
          'Request Rejected Successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      }

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
    }, (error) => {
      this.attendanceUpdateRequestApproveLoader = false;
      this.attendanceUpdateRequestRejectLoader = false;
      console.log(error);
      this.helperService.showToast(
        'Error while processing the request!',
        Key.TOAST_STATUS_ERROR
      );
    });
  }

  // Tab in Attedance section
  ATTENDANCE_TAB = Key.ATTENDANCE_TAB;
  OVERTIME_TAB = Key.OVERTIME_TAB;
  ATTENDANCE_UPDATE_REQUEST_TAB = Key.ATTENDANCE_UPDATE_REQUEST_TAB;

  ACTIVE_TAB = Key.ATTENDANCE_TAB;
  changeTab(tabId: number) {
    this.ACTIVE_TAB = tabId;

    if (tabId == this.OVERTIME_TAB || tabId == this.ATTENDANCE_UPDATE_REQUEST_TAB) {
      this.onMonthChange(new Date());
    }
  }

  startDate: string = '';
  endDate: string = '';
  onMonthChange(month: Date): void {
    console.log('Month is getting selected');
    this.selectedDate = month;
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
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    this.endDate = this.helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
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
    this.dataService.getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDate(this.startDate, this.endDate, this.itemPerPage, this.pageNumber, this.searchText, this.searchBy).subscribe((response) => {
      if (this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.dataNotFoundForOvertimeRequestLogResponse = true;
      } else {
        this.overtimeRequestLogResponseList = response.listOfObject;
      }

      this.isShimmerForOvertimeRequestLogResponse = false;
    }, (error) => {
      this.isShimmerForOvertimeRequestLogResponse = false;
      this.networkConnectionErrorForOvertimeRequestLogResponse = true;
    })
  }

  overtimeRequestResponseList: OvertimeResponseDTO[] = [];
  getOvertimeRequestResponseByOrganizationUuidAndStartDateAndEndDateMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersForOvertimeRequestResponseMethodCall();
    this.dataService.getOvertimeRequestResponseByOrganizationUuidAndStartDateAndEndDate(this.startDate, this.endDate).subscribe((response) => {
      if (this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.dataNotFoundForOvertimeRequestResponse = true;
      } else {
        this.overtimeRequestResponseList = response.listOfObject;
      }

      this.isShimmerForOvertimeRequestResponse = false;
    }, (error) => {
      this.isShimmerForOvertimeRequestResponse = false;
      this.networkConnectionErrorForOvertimeRequestResponse = true;
    })
  }

  pendingRequestCount: number = 0;
  overtimePendingRequestResponseList: OvertimeResponseDTO[] = [];
  getOvertimePendingRequestResponseByOrganizationUuidAndStartDateAndEndDateMethodCall() {
    // this.pendingRequestCount
    this.preRuleForShimmersAndErrorPlaceholdersForOvertimePendingRequestResponseMethodCall();
    this.dataService.getOvertimePendingRequestResponseByOrganizationUuidAndStartDateAndEndDate(this.startDate, this.endDate).subscribe((response) => {
      if (this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.dataNotFoundForOvertimePendingRequestResponse = true;
        this.pendingRequestCount = 0;
      } else {
        this.overtimePendingRequestResponseList = response.listOfObject;
        this.pendingRequestCount = this.overtimePendingRequestResponseList.length;
      }
      this.getRequestCountByOrganizationUuid();

      this.isShimmerForOvertimePendingRequestResponse = false;
    }, (error) => {
      this.isShimmerForOvertimePendingRequestResponse = false;
      this.networkConnectionErrorForOvertimePendingRequestResponse = true;
    })
  }


  overtimeRequestActionResponse: OvertimeResponseDTO = new OvertimeResponseDTO();
  getOvertimeRequestActionResponseMethodCall(overtimeResponseDTO: OvertimeResponseDTO) {
    this.overtimeRequestActionResponse = overtimeResponseDTO;
    console.log(this.overtimeRequestActionResponse);
  }


  @ViewChild("closeOvertimeRequestActionModal") closeOvertimeRequestActionModal !: ElementRef;
  approveLoader: boolean = false;
  rejectLoader: boolean = false;
  approveOrRejectOvertimeRequestMethodCall(overtimeRequestId: number, requestTypeId: number) {
    if (requestTypeId == this.key.APPROVED) {
      this.approveLoader = true;
    } else if (requestTypeId == this.key.REJECTED) {
      this.rejectLoader = true;
    }

    this.dataService.approveOrRejectOvertimeRequest(overtimeRequestId, requestTypeId).subscribe((response) => {
      this.approveLoader = false;
      this.rejectLoader = false;
      this.closeOvertimeRequestActionModal.nativeElement.click();
      this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
      this.getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
      this.getOvertimePendingRequestResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
    }, (error) => {
      this.approveLoader = false;
      this.rejectLoader = false;
      this.helperService.showToast("Error while approving the request!", Key.TOAST_STATUS_ERROR);
    })
  }


  //Search in overtime logs
  // teamNameList: UserTeamDetailsReflection[] = [];

  // teamId: number = 0;
  // getTeamNames() {
  //   debugger;
  //   this.dataService.getAllTeamNames().subscribe({
  //     next: (response: any) => {
  //       this.teamNameList = response.object;
  //     },
  //     error: (error) => {
  //       console.error('Failed to fetch team names:', error);
  //     },
  //   });
  // }

  // selectedTeamName : string = '';
  // selectTeam(teamName: string) {
  //   this.pageNumber = 1;
  //   this.itemPerPage = 8;
  //   this.overtimePendingRequestResponseList = [];
  //   this.selectedTeamName = teamName;
  //   this.getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
  // }

  // searchOvertimeRequestLogResponse() {
  //   this.pageNumber = 1;
  //   this.itemPerPage = 8;
  //   this.overtimePendingRequestResponseList = [];
  //   this.getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
  // }

  // clearSearchUsers() {
  //   this.pageNumber = 0;
  //   this.itemPerPage = 8;
  //   this.overtimePendingRequestResponseList = [];
  //   this.searchText = '';
  //   this.searchBy = '';
  //   this.getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDateMethodCall();
  // }



  // ####################--Updation Request Tab code--######################
  // Tab in Updation request tab section
  ATTENDANCE_UPDATE_PENDING_REQUEST_TAB = Key.ATTENDANCE_UPDATE_PENDING_REQUEST_TAB;
  ATTENDANCE_UPDATE_REQUEST_HISTORY_TAB = Key.ATTENDANCE_UPDATE_REQUEST_HISTORY_TAB;

  ACTIVE_TAB_IN_ATTENDANCE_UPDATE_REQUEST_TAB = Key.ATTENDANCE_UPDATE_PENDING_REQUEST_TAB;
  changeLogTabInAttendanceUpdateRequestTab(tabId: number) {
    this.ACTIVE_TAB_IN_ATTENDANCE_UPDATE_REQUEST_TAB = tabId;
  }

  @ViewChild("closeAttendanceUpdateRequestActionModal") closeAttendanceUpdateRequestActionModal !: ElementRef;
  attendanceUpdateRequestActionResponse: AttendanceTimeUpdateResponse = new AttendanceTimeUpdateResponse();
  getAttendanceUpdateRequestActionResponseMethodCall(attendanceTimeUpdateResponse: AttendanceTimeUpdateResponse) {
    this.attendanceUpdateRequestActionResponse = attendanceTimeUpdateResponse;
  }

  attendanceUpdateRequestApproveLoader: boolean = false;
  attendanceUpdateRequestRejectLoader: boolean = false;
  geocoder = new google.maps.Geocoder();
  getAddressFromCoords(lat: any, lng: any): string | undefined {
    // if(!this.Constant.EMPTY_STRINGS.includes(lat) && !this.Constant.EMPTY_STRINGS.includes(lng)){
    //   lat=Number(lat);
    //   lng=Number(lng)
    //   console.log("🚀 ~ getAddressFromCoords ~ lat:", lat,lng)
    //   // return "Click 'View Location' , to view attendace location on map";

    // this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    //   if (status === google.maps.GeocoderStatus.OK && results && results[0] ) {
    //     return results[0].formatted_address;
    //   } else {
    //     return "Click 'View Location' , to view attendace location on map";
    //   }
    // }).catch(error=>{
    //   return "Click 'View Location' , to view attendace location on map";
    // });
    // }else{
    //   return "Click 'View Location' , to view attendace location on map";

    // }
    return "Click 'View Location' , to view attendace location on map";
  }


  // new

  @ViewChild('attendanceUploadModal') attendanceUploadModal!: ElementRef;
  openAttendanceUploadModal() {
    // console.log("================validate======",modal);
    this.attendanceUploadModal.nativeElement.click();
  }


  fileName: any;
  currentFileUpload: any;
  // expectedColumns: string[] = ['Name*', 'Phone*', 'Email*', 'Date*', 'In-Time*', 'Out-Time*'];
  // correctColumnName: string[] = ['S. NO.*', 'Name*', 'Phone*', 'Email*', 'Date*', 'In-Time*', 'Out-Time*', 'Note'];
  expectedColumns: string[] = ['Name*', 'Phone*', 'Email*', "Date* ('MM-DD-YYYY')", "In-Time* ('HH:MM:SS')", "Out-Time* ('HH:MM:SS')"];
  correctColumnName: string[] = ['S. NO.*', 'Name*', 'Phone*', 'Email*', "Date* ('MM-DD-YYYY')", "In-Time* ('HH:MM:SS')", "Out-Time* ('HH:MM:SS')", 'Note'];
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
              this.data = this.jsonData.map((row: any[]) =>
                row.map((cell: any, index: number) => {
                  if (this.fileColumnName[index] === "date* ('mm-dd-yyyy')" && cell !== "date* ('mm-dd-yyyy')") {
                    // Remove leading/trailing commas and quotes
                    cell = this.cleanCell(cell);

                    // Parse Excel date serial or formatted date string
                    if (typeof cell === 'number') {
                      return moment(XLSX.SSF.parse_date_code(cell)).format('MM-DD-YYYY');
                    }

                    const formattedCell = this.formatDate1(cell);
                    return formattedCell ? formattedCell : '';
                  } else if (
                    (this.fileColumnName[index] === "in-time* ('hh:mm:ss')" && cell !== "in-time* ('hh:mm:ss')") ||
                    (this.fileColumnName[index] === "out-time* ('hh:mm:ss')" && cell !== "out-time* ('hh:mm:ss')")
                  ) {
                    // Remove leading/trailing commas and quotes
                    cell = this.cleanCell(cell);

                    // Parse Excel time serial or formatted time string
                    if (typeof cell === 'number') {
                      return moment(XLSX.SSF.parse_date_code(cell)).format('HH:mm:ss');
                    }

                    const formattedTime = this.formatTime(cell);
                    return formattedTime ? formattedTime : '';
                  } else {
                    return cell ? cell.toString().trim() : '';
                  }
                })
              ).filter((row: any[]) =>
                row.some((cell: any) => cell !== '')
              );

              this.validateRows(this.data.slice(1));
              this.removeAllSingleEntries();
              this.validateMap.forEach((values, key) => {
                // this.mismatches.push(`Repeating values: "${key}" at row no. ${values}`);
                if (this.elementToScroll) {
                  this.elementToScroll!.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    return cell?.toString().replace(/^[,']+|[,']+$/g, '').trim() || '';
  }

  // Helper methods for formatting date and time
  private formatDate1(cell: any): string | null {
    const acceptableFormats = ['MM-DD-YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY'];
    const formattedDate = moment(cell, acceptableFormats, true);
    return formattedDate.isValid() ? formattedDate.format('MM-DD-YYYY') : null;
  }

  private formatTime(cell: any): string | null {
    const acceptableFormats = ['HH:mm:ss', 'HH:mm'];
    const formattedTime = moment(cell, acceptableFormats, true);
    return formattedTime.isValid() ? formattedTime.format('HH:mm:ss') : null;
  }


  // selectFile(event: any) {
  //   this.validateMap= new Map();
  //   debugger
  //   if (event.target.files && event.target.files.length > 0) {
  //     const file = event.target.files[0];
  //     this.currentFileUpload = file;
  //     this.fileName = file.name;

  //     if (!this.isExcelFile(file)) {
  //       this.isExcel = 'Invalid file type. Please upload an Excel file.';
  //       return;
  //     }

  //     const reader = new FileReader();
  //     reader.onload = (e: ProgressEvent<FileReader>) => {
  //       const arrayBuffer = e.target?.result as ArrayBuffer;
  //       const binaryStr = this.arrayBufferToString(arrayBuffer);
  //       const workbook = XLSX.read(binaryStr, { type: 'binary' });
  //       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  //       this.jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  //       // Reset data and error tracking
  //       this.data = [];
  //       this.invalidRows = [];
  //       this.invalidCells = [];
  //       this.validateMap.clear;

  //       const columnNames: string[] = this.jsonData[0] as string[];
  //       debugger
  //       console.log("3567876567" , this.validateColumns(columnNames));
  //       if (this.validateColumns(columnNames)) {
  //             this.data = this.jsonData.map((row: any[]) => {
  //               // Ensure the 5th column is an array of strings, other columns are treated as strings
  //               return row.map((cell: any, index: number) => {
  //                 if( this.data.length==0){
  //                   return cell ? cell.toString().trim() : '';
  //                 }else{
  //                   console.log("🚀 ~ returnrow.map ~ this.fileColumnName[index] === 'date*' :", this.fileColumnName[index] === 'date*' )

  //                if (this.fileColumnName[index] === 'date*' && cell !== 'date*') {
  //                   // // Use regex to check if cell matches exact MM-DD-YYYY format (reject formats like MM/DD/YYYY)
  //                   // const isExactFormat = /^\d{2}-\d{2}-\d{4}$/.test(cell);
  //                   // if (cell.includes('/')) {
  //                   //   return undefined;
  //                   // }
  //                   // cell=cell.replace(/\//g, '-');

  //                   // if (isExactFormat) {
  //                   //     // Parse with strict format checking
  //                   //     const formattedDate = moment(cell, 'MM-DD-YYYY', true);

  //                   //     // Check if the date is valid and within the next year
  //                   //     if (formattedDate.isValid()) {
  //                   //         const oneYearFromNow = moment().add(1, 'year');

  //                   //         // Ensure date is within the next year
  //                   //         if (formattedDate.isBefore(oneYearFromNow)) {
  //                   //             return formattedDate.format('MM-DD-YYYY');
  //                   //         }
  //                   //     }
  //                   // }
  //                   // // Return empty string if the format, validity, or date range check fails
  //                   // return "";
  //                   // List of acceptable input formats
  //                     const acceptableFormats = ['MM-DD-YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY'];

  //                     // Replace any slashes with dashes for consistency
  //                     cell = cell.replace(/\//g, '-');

  //                     // Check if the cell value matches any of the acceptable formats
  //                     const isExactFormat = acceptableFormats.some(format => moment(cell, format, true).isValid());

  //                     if (isExactFormat) {
  //                       // Parse the cell value using moment.js with the detected format
  //                       const formattedDate = moment(cell, acceptableFormats, true);

  //                       // Check if the date is valid and within the next year
  //                       if (formattedDate.isValid()) {
  //                         const oneYearFromNow = moment().add(1, 'year');

  //                         // Ensure the date is within the next year
  //                         if (formattedDate.isBefore(oneYearFromNow)) {
  //                           return formattedDate.format('MM-DD-YYYY'); // Convert to the required format
  //                         }
  //                       }
  //                     }

  //                     // Return an empty string if the format, validity, or date range check fails
  //                     return "";
  //                 } else if ((this.fileColumnName[index] === 'in-time*' && cell !== 'in-time*') || (this.fileColumnName[index] === 'out-time*' && cell !== 'out-time*')) {

  //                   // List of acceptable input formats for date and time
  //                     const acceptableFormats = [
  //                       'MM-DD-YYYY HH:mm:ss',
  //                       'MM/DD/YYYY HH:mm:ss',
  //                       'YYYY-MM-DD HH:mm:ss',
  //                       'DD-MM-YYYY HH:mm:ss',
  //                       'DD/MM/YYYY HH:mm:ss',
  //                       'MM-DD-YYYY HH:mm', // Handle cases without seconds
  //                       'MM/DD/YYYY HH:mm',
  //                       'YYYY-MM-DD HH:mm',
  //                       'DD-MM-YYYY HH:mm',
  //                       'DD/MM/YYYY HH:mm',
  //                       'HH:mm:ss',
  //                       'HH:mm',
  //                     ];

  //                     // Replace any slashes with dashes for consistency
  //                     cell = cell.replace(/\//g, '-');

  //                     // Check if the cell value matches any of the acceptable formats
  //                     const isExactFormat = acceptableFormats.some(format => moment(cell, format, true).isValid());

  //                     if (isExactFormat) {
  //                       // Parse the cell value using moment.js with the detected format
  //                       const formattedDateTime = moment(cell, acceptableFormats, true);

  //                       // Check if the date-time is valid and within the next year
  //                       if (formattedDateTime.isValid()) {
  //                         const oneYearFromNow = moment().add(1, 'year');

  //                         // Ensure the date-time is within the next year
  //                         if (formattedDateTime.isBefore(oneYearFromNow)) {
  //                           // return formattedDateTime.format('MM-DD-YYYY HH:mm:ss');
  //                           return formattedDateTime.format('HH:mm:ss');
  //                         }
  //                       }
  //                     }

  //                     // Return an empty string if the format, validity, or date range check fails
  //                     return "";
  //                 }
  //                  else {
  //                   // Convert other cells to string and trim whitespace
  //                   return cell ? cell.toString().trim() : '';
  //                 }
  //               }

  //               });
  //             }).filter((row: any[]) =>
  //                       // Filter out empty rows
  //                 row.some((cell: any) => cell !== '')
  //               );




  //         // Validate all rows and keep track of invalid entries- send daya for validatio after emoving heder row
  //         this.validateRows(this.data.slice(1));
  //         this.removeAllSingleEntries();
  //         this.validateMap.forEach((values, key) => {
  //           console.log(`Key: ${key}`);
  //           this.mismatches.push(`Repeating values: "${key}" at row no. ${values}`);
  //           if(this.elementToScroll){
  //           this.elementToScroll!.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //           console.log('Values:', values);
  //           }
  //         });
  //         this.totalPage = Math.ceil(this.data.length / this.pageSize);

  //         if(this.mismatches.length===0){
  //           this.isinvalid=false;
  //           this.uploadUserFile(file, this.fileName);
  //         }else{
  //           this.isinvalid=true;
  //         }


  //       } else {
  //         console.error('Invalid column names');
  //       }
  //     };
  //     reader.readAsArrayBuffer(file);
  //   }
  // }

  // firstUpload:boolean=true;
  // areAllFalse(): boolean {
  //   if(this.firstUpload===true){
  //     this.firstUpload=false;
  //     return false;
  //   }
  //   return this.invalidCells
  //     .reduce((acc, row, rowIndex) => {
  //       return acc.concat(row.filter((_, colIndex) => this.expectedColumns[colIndex] !== "LeaveNames"));
  //     }, [])
  //     .every(value => value === false);
  // }

  isExcelFile(file: File): boolean {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel'
    ];

    const allowedExtensions = ['xlsx', 'xls'];

    return allowedMimeTypes.includes(file.type) && allowedExtensions.includes(file.name.split('.').pop()?.toLowerCase() || '');
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
    const normalizedColumnNames = columnNames.map(col => col.trim().toLowerCase());
    this.fileColumnName = normalizedColumnNames;
    const normalizedExpectedColumns = this.expectedColumns.map(col => col.trim().toLowerCase());
    const normalizedCorrectColumns = this.correctColumnName.map(col => col.trim().toLowerCase());

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
        this.mismatches.push(`Unexpected or incorrect column: "${actualColumn}"`);
      }
    }

    // Step 5: Log and return false if there are any mismatches
    if (this.mismatches.length > 0) {
      console.error('Column mismatches found:');
      this.mismatches.forEach(mismatch => console.error(mismatch));
      return false;
    }

    return true;
  }


  // validateColumns(columnNames: string[]): boolean {
  //   this.mismatches = []; // Reset mismatches

  //   // Step 2: Normalize both expected and actual column names for comparison
  //   const normalizedColumnNames = columnNames.map(col => col.trim().toLowerCase());
  //   this.fileColumnName=normalizedColumnNames;
  //   const normalizedExpectedColumns = this.expectedColumns.map(col => col.trim().toLowerCase());
  //   const normalizedCorrectColumns = this.correctColumnName.map(col => col.trim().toLowerCase());

  //   // Step 3: Check that every expected column is present in actual column names
  //   for (const expectedColumn of normalizedExpectedColumns) {
  //     if (!normalizedColumnNames.includes(expectedColumn)) {
  //       console.error(`Missing column: "${expectedColumn}"`);
  //       this.mismatches.push(`Missing column: "${expectedColumn}"`);
  //     }
  //   }

  //   // Step 4: Check if there are extra or incorrect columns in actual column names
  //   for (const actualColumn of normalizedColumnNames) {
  //     if (!normalizedExpectedColumns.includes(actualColumn) && !normalizedCorrectColumns.includes(actualColumn)) {
  //         console.error(`Unexpected or incorrect column: "${actualColumn}"`);
  //         this.mismatches.push(`Unexpected or incorrect column: "${actualColumn}"`);
  //     }
  // }

  //   // Step 4: Log and return false if there are any mismatches
  //   if (this.mismatches.length > 0) {
  //     console.error('Column mismatches found:');
  //     this.mismatches.forEach(mismatch => console.error(mismatch));
  //     return false;
  //   }

  //   return true;
  // }
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
    console.log("🚀 ~ EmployeeOnboardingDataComponent ~ validateRows ~ rows:", rows)
    this.invalidRows = new Array(rows.length).fill(false); // Reset invalid rows
    this.invalidCells = Array.from({ length: rows.length }, () => new Array(this.expectedColumns.length).fill(false)); // Reset invalid cells

    for (let i = 0; i < rows.length; i++) {
      let rowIsValid = true;
      for (let j = 0; j < this.fileColumnName.length; j++) {

        const cellValue = rows[i][j];
        if (!cellValue || cellValue === null || cellValue.toString().trim() === '') {
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
          const normalizedCell = cellValue.toString().trim().replace(/\//g, '-');

          // Check if the normalized cell matches the exact MM-DD-YYYY format
          const isExactFormat = /^\d{2}-\d{2}-\d{4}$/.test(normalizedCell);

          if (isExactFormat) {
            // Parse with strict format checking
            const formattedDate = moment(normalizedCell, 'MM-DD-YYYY', true);

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



        if (!this.expectedColumns.some(expectedColumn => expectedColumn.toLowerCase() === this.fileColumnName[j].toLowerCase())) {
          this.invalidCells[i][j] = false;
        }
      }
    }
    debugger

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
          // this.attendanceUploadCountForUser = response.object.length;
          // this.attendanceUploadFailedCountForUser = response.object2.length;
          // this.getReport();
          // this.getUser();
          this.attendanceUploadCountForUser = response.object1;
          this.uploadedExcelLink = response.object2;
          this.phoneNumberNotFoundArray = response.arrayOfString;
          this.emailNotFoundArray = response.arrayOfString2;
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
        this.overtimeCount = response.object.count1;
        this.attendanceUpdateCount = response.object.count2;
      },
      (error) => {
        console.error('Error fetching user count by status:', error);
      }
    );
  }




}
