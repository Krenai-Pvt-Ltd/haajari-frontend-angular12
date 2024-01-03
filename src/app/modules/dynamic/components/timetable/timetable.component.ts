import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import * as dayjs from 'dayjs';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { HelperService } from 'src/app/services/helper.service';
import { AdditionalNotes } from 'src/app/models/additional-notes';
import { AttendanceDetailsResponse } from 'src/app/models/attendance-details-response';
import { AttendanceLogResponse } from 'src/app/models/attendance-log-response';
// import { ChosenDate, TimePeriod } from 'ngx-daterangepicker-material/daterangepicker.component';


@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent implements OnInit {

  alwaysShowCalendars: boolean | undefined;
  model: any;
  constructor(private dataService: DataService, private helperService: HelperService) { 

  }

   loginDetails = this.helperService.getDecodedValueFromToken();
   role:string = this.loginDetails.role;
   userUuid: string = this.loginDetails.uuid;
   orgRefId:string = this.loginDetails.orgRefId;


  selected: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};

  ngOnInit(): void {  
    this.inputDate = this.getCurrentDate();


    const today = dayjs();
    const oneWeekAgo = today.subtract(1, 'week');
    this.selected = {
      startDate: oneWeekAgo,
      endDate: today
    };


    this.updateDateRangeInputValue();
    this.getDataFromDate();
    this.getAttendanceDetailsReportByDateMethodCall();
    this.getActiveUsersCountMethodCall();
  }


  dateRangeInputValue: string = '';

  totalAttendance: number = 0;
  attendanceArrayDate: any = [];


  dateRangeFilter(event: any): void {
    if (event.startDate && event.endDate) {
      this.selected = {
        startDate: dayjs(event.startDate),
        endDate: dayjs(event.endDate)
      };
      this.getDataFromDate();
    } else {
      this.selected = null;
    }

    this.updateDateRangeInputValue();

    const res3 = document.getElementById("date-picker-wrapper") as HTMLElement | null;
    if(res3){
      res3.style.display="none";
    }

  }

  
  getDataFromDate(): void {
    if (this.selected) {
      const startDateStr: string = this.selected.startDate.startOf('day').format('YYYY-MM-DD');
      const endDateStr: string = this.selected.endDate.endOf('day').format('YYYY-MM-DD');
      debugger
      
      this.dataService.getAttendanceDetailsByDateDuration(startDateStr, endDateStr).subscribe(
        
        (response: any) => {
          
          this.myAttendanceData = response;
          console.log(this.myAttendanceData);
          if (this.myAttendanceData) {
            
            for (const key in this.myAttendanceData) {
              
              if (this.myAttendanceData.hasOwnProperty(key)) {
                const attendanceArray = this.myAttendanceData[key];

                this.attendanceArrayDate=attendanceArray;
              
              }
            }
          }
        },
        (error: any) => {
          console.error('Error fetching data:', error);
        }
      );
    }
  }
  
  getCurrentDate(){
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = (todayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = todayDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  dateRangeButton(){
    const res = document.getElementById("date-picker-wrapper") as HTMLElement | null;
    if(res){
      res.style.display="block";
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


  flag !: boolean;

  checkingUserRoleMethod(): boolean{ 
    this.dataService.checkingUserRole().subscribe((data) => {
      this.flag = data;
      console.log(data);
    }, (error) => {
      console.log(error);
    })
    console.log(this.flag);
    
    return this.flag;
  }
  
  updateDateRangeInputValue(): void {
    if (this.selected) {
      this.dateRangeInputValue = `${this.selected.startDate.format('DD-MM-YYYY')} - ${this.selected.endDate.format('DD-MM-YYYY')}`;
    } else {
      this.dateRangeInputValue = '';
    }
  }



  // ###############################################################################

  selectPreviousDay() {
    debugger

    this.attendanceDataByDateKey = [];
    this.attendanceDataByDateValue = [];
    this.total = 0;
    this.isShimer = true;

    const currentDateObject = new Date(this.inputDate);
    currentDateObject.setDate(currentDateObject.getDate() - 1);
    this.inputDate = this.formatDate(currentDateObject);
    this.getAttendanceDetailsReportByDateMethodCall();
  }
  
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectNextDay() {

    this.attendanceDataByDateKey = [];
    this.attendanceDataByDateValue = [];
    this.total = 0;
    this.isShimer = true;

    const currentDateObject = new Date(this.inputDate);
    const tomorrow = new Date(currentDateObject);
    tomorrow.setDate(currentDateObject.getDate() + 1);

    if (tomorrow >= new Date()) {
      debugger
      return;
    }

    this.inputDate = this.formatDate(tomorrow);
    this.getAttendanceDetailsReportByDateMethodCall();
  }

  // formatDate(date: Date): string {
  //   const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  //   return date.toLocaleDateString('en-US', options);
  // }




  attendanceDataByDate: Record<string, AttendenceDto> = {};
  attendanceDataByDateKey : any = [];
  attendanceDataByDateValue : AttendenceDto[] = [];
  inputDate = '';
  filterCriteria = 'ALL';
  halfDayUsers : number = 0;

  itemPerPage : number = 8;
  pageNumber : number = 1;
  searchText : string = '';
  total : number = 0;

  isShimer:boolean=false;
  errorToggleTimetable:boolean=false;
  placeholder:boolean=false;

  getAttendanceDetailsReportByDateMethodCall(){
      this.isShimer=true;
      this.errorToggleTimetable=false;
      this.placeholder=false;
      this.dataService.getAttendanceDetailsReportByDate(this.inputDate, this.pageNumber, this.itemPerPage, this.searchText, 'name', '','', this.filterCriteria).subscribe((response) => {
        debugger
        const data = response.mapOfObject;

        if(data == null){
          this.placeholder = true;
          this.attendanceDataByDateKey = [];
          this.isShimer=false;
          return;
        }
        this.total = response.totalItems;
        this.attendanceDataByDateKey = Object.keys(data);
        this.attendanceDataByDateValue = Object.values(data);

        if(this.attendanceDataByDateKey!=null){
          this.placeholder=true;
        }else{
          this.placeholder=false;
        }

        this.attendanceDataByDate = data;
        this.isShimer=false;
        console.log(this.attendanceDataByDateKey);
        console.log(this.attendanceDataByDate);

        // for(let i=0; i<this.attendanceDataByDateValue.length; i++){
        //   if(+(this.attendanceDataByDateValue[i].duration[0]) < 7){
        //     this.halfDayUsers++;
        //   }
        // }

    }, (error) => {
      this.isShimer=false;
      this.placeholder=false;
      this.errorToggleTimetable=true;
      debugger
      console.log(error);
    })

  }

  filterCriteriaList : string[] = ['ALL', 'PRESENT', 'ABSENT', 'HALFDAY'];

  selectFilterCriteria(filterCriteria : string){
    this.filterCriteria = filterCriteria;

    this.attendanceDataByDateKey = [];
    this.attendanceDataByDateValue = [];
    this.total = 0;
    this.isShimer = true;

    this.getAttendanceDetailsReportByDateMethodCall();
  }

  activeUsersCount : number = 0;

  getActiveUsersCountMethodCall(){

    this.dataService.getActiveUsersCount().subscribe((data) => {
      console.log(data);
      this.activeUsersCount = data;
    }, (error) => {
      console.log(error);
    })
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

  addNotesModel(){
    this.additionalNotes = new AdditionalNotes();
  }

  additionalNotes : AdditionalNotes = new AdditionalNotes();
  additionalNotesUserEmail !: string;

  @ViewChild('addNotesModalClose') addNotesModalClose !: ElementRef; 

  addAdditionalNotesMethodCall(){
    this.additionalNotes.createdDate = this.inputDate;
    this.dataService.addAdditionalNotes(this.additionalNotes, this.additionalNotesUserEmail).subscribe((data) => {
      console.log(data);
      this.addNotesModalClose.nativeElement.click();
    }, (error) => {
      console.log(error);
    })
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
  resetCriteriaFilter(){
    this.itemPerPage = 8;
    this.pageNumber = 1;
  }
  searchUsers(){
    this.attendanceDataByDateKey = [];
    this.attendanceDataByDateValue = [];
    this.total = 0;
    this.isShimer = true;

    this.resetCriteriaFilter();
    this.getAttendanceDetailsReportByDateMethodCall();
  }

  clearSearchText(){
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

  onTableDataChange(event : any)
  {
    this.pageNumber=event;
    this.getAttendanceDetailsReportByDateMethodCall();
  }


  // ############View Logs#################

  viewLogsAttendanceDataEmail : string = '';
  viewLogsAttendanceDataValue : AttendenceDto = new AttendenceDto();
  viewLogs(key : string, value: AttendenceDto){
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall()
    this.attendanceLogResponseList = [];
    this.viewLogsAttendanceDataEmail = key;
    this.viewLogsAttendanceDataValue = value;
    this.getAttendanceLogsMethodCall();
  }


  preRuleForShimmersAndErrorPlaceholdersMethodCall(){
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  attendanceLogShimmerFlag:boolean=false;
  dataNotFoundFlagForAttendanceLog:boolean=false;
  networkConnectionErrorFlagForAttendanceLog:boolean=false;
  attendanceLogResponseList : AttendanceLogResponse[] = [];
  getAttendanceLogsMethodCall(){
    this.dataService.getAttendanceLogs(this.viewLogsAttendanceDataEmail, this.inputDate).subscribe((response) => {
      this.attendanceLogResponseList = response;
      console.log(response);
      if(response === undefined || response === null || response.length === 0){
        this.dataNotFoundPlaceholder = true;
      }
    }, (error) => {
      console.log(error);
      this.networkConnectionErrorPlaceHolder = true;
    })
  }
}


