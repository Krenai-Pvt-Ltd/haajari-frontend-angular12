import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import * as dayjs from 'dayjs';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { HelperService } from 'src/app/services/helper.service';
import { AdditionalNotes } from 'src/app/models/additional-notes';
import { AttendanceDetailsResponse } from 'src/app/models/attendance-details-response';
import { AttendanceLogResponse } from 'src/app/models/attendance-log-response';
import { Key } from 'src/app/constant/key';
import { BreakTimings } from 'src/app/models/break-timings';
import { NavigationExtras, Router } from '@angular/router';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { AttendanceDetailsCountResponse } from 'src/app/models/attendance-details-count-response';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import * as saveAs from 'file-saver';
import { DatePipe } from '@angular/common';

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
    private helperService: HelperService,
    private router: Router,
    private rbacService: RoleBasedAccessControlService,
    private cdr: ChangeDetectorRef,
    private firebaseStorage: AngularFireStorage,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe
  ) {}

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
    console.log(today);
    console.log(current);
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

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selected: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};

  ngOnInit(): void {
    window.scroll(0, 0);
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
    // this.getDataFromDate();
    this.getAttendanceDetailsCountMethodCall();
    this.getAttendanceDetailsReportByDateMethodCall();
    this.getActiveUsersCountMethodCall();
    this.getHolidayForOrganization();
  }

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
  total: number = 0;

  lastPageNumber = 0;

  isShimer: boolean = false;
  errorToggleTimetable: boolean = false;
  placeholder: boolean = false;

  isShimmerForAttendanceDetailsResponse: boolean = false;
  dataNotFoundForAttendanceDetailsResponse: boolean = false;
  networkConnectionErrorForAttendanceDetailsResposne: boolean = false;

  preRuleForShimmersAndOtherConditionsMethodCall() {
    this.isShimmerForAttendanceDetailsResponse = true;
    this.dataNotFoundForAttendanceDetailsResponse = false;
    this.networkConnectionErrorForAttendanceDetailsResposne = false;
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
            console.log(this.attendanceDetailsResponseList);
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
            this.networkConnectionErrorForAttendanceDetailsResposne = true;
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
    this.router.navigate(['/employee-profile'], navExtra);
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


  

  dailyReportLog : string = '';
  rotateToggle: boolean = false;
  downloadAttedanceReport(date: Date) {
    
    let dateString:string | null  = this.datePipe.transform(date, 'yyyy-MM-dd');
    this .rotateToggle = true;
    if(dateString!==null) {
    this.dataService
      .getAtendanceDailyReport(
        dateString
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

 checkHoliday:boolean = false;
 showPlaceholder:boolean = false;

 getHolidayForOrganization(){
   
    this.dataService.getHolidayForOrganization(this.helperService.formatDateToYYYYMMDD(this.selectedDate))
    .subscribe(
      (response) => {
        this.checkHoliday = response.object;
        console.log(response);
        console.error("Response", response.object);

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

  
}
