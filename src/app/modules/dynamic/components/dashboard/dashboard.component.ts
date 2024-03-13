import { Component, ElementRef, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, iif } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import * as dayjs from 'dayjs';
import { AttendenceDto } from 'src/app/models/attendence-dto';
import { DatePipe } from '@angular/common';
import { AttendanceWithLatePerformerResponseDto, AttendanceWithTopPerformerResponseDto } from 'src/app/models/Attendance.model';
import { HelperService } from 'src/app/services/helper.service';
import * as moment from 'moment';
import { LateEmployeeAttendanceDetailsResponse } from 'src/app/models/late-employee-attendance-details-response';
import { AttendanceReportResponse } from 'src/app/models/attendance-report-response';
import { Key } from 'src/app/constant/key';
import { debounceTime } from 'rxjs/operators';
import { BestPerformerAttendanceDetailsResponse } from 'src/app/models/best-performer-attendance-details-response';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { DayWiseStatus } from 'src/app/models/day-wise-status';
import { AttendanceDetailsCountResponse } from 'src/app/models/attendance-details-count-response';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

  constructor(private dataService : DataService, private router : Router, private datePipe : DatePipe, private helperService : HelperService, private rbacService : RoleBasedAccessControlService) {

    const currentDate = moment();
    this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD');
    this.endDateStr = currentDate.endOf('month').format('YYYY-MM-DD');

    // Set the default selected month
    this.month = currentDate.format('MMMM');

    this.getFirstAndLastDateOfMonth(this.selectedDate);
    
   }

  itemPerPage : number = 12;
  pageNumber : number = 1;
  firstPageNumber : number = 1;
  lastPageNumber : number = 0;
  total !: number;
  totalLateEmployees : number = 0;
  rowNumber : number = 1;
  searchText : string = '';
  searchBy : string = '';
  dataFetchingType : string = '';

  // selected: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};
  myAttendanceDataLength = 0;
  attendanceArrayDate: any = [];
  project : boolean = false;

  loginDetails = this.helperService.getDecodedValueFromToken();
  //  role:string = this.rbacService.getRole();
  //  userUuid: string = this.rbacService.getUUID();
  //  orgRefId:string = this.rbacService.getOrgRefUUID();

  startDateStr: string = '';
  endDateStr: string = '';
  month: string = '';
  inputDate : string = '';

  PRESENT = Key.PRESENT;
  ABSENT = Key.ABSENT;
  UNMARKED = Key.UNMARKED;
  WEEKEND = Key.WEEKEND;
  HOLIDAY = Key.HOLIDAY;
  LEAVE = Key.LEAVE;
  HALFDAY = Key.HALFDAY;

  

  async getRoleDetails(){
    this.ROLE = await this.rbacService.getRole();
  }
  
  ROLE : any;
  ADMIN = Key.ADMIN;
  MANAGER = Key.MANAGER;
  USER = Key.USER;

  
  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  startDate : string = '';
  endDate : string = '';

  onMonthChange(month: Date): void {
    this.selectedDate = month;
    this.getFirstAndLastDateOfMonth(this.selectedDate);
    this.getAttendanceReportByDateDurationMethodCall();
  }

  getFirstAndLastDateOfMonth(selectedDate : Date){
    this.startDate = this.formatDateToYYYYMMDD(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    this.endDate = this.formatDateToYYYYMMDD(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));
  }

  disableMonths = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();

    if(date < new Date(this.organizationRegistrationDate)){
      return true;
    }
  
    // Disable if the month is after the current month
    if (dateYear > currentYear || (dateYear === currentYear && dateMonth > currentMonth)) {
      return true;
    }
  
    // Enable the month if it's from January 2023 to the current month
    return false;
  };
  
  organizationRegistrationDate : string = '';
  getOrganizationRegistrationDateMethodCall(){
    debugger
    this.dataService.getOrganizationRegistrationDate().subscribe((response) => {
      this.organizationRegistrationDate = response;
    }, ((error) =>{
      console.log(error);
    }))
  }
  
  

  

  ngOnInit(): void {
    this.getOrganizationRegistrationDateMethodCall();
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
    debugger
    this.getRoleDetails();
    this.getAttendanceDetailsCountMethodCall();
    this.getAttendanceReportByDateDurationMethodCall();

    this.getLateEmployeeAttendanceDetailsMethodCall();
    
    this.getCurrentDayEmployeesData();
    // this.getAttendanceTopPerformerDetails();
    // this.getAttendanceLatePerformerDetails();
    this.getBestPerformerAttendanceDetailsMethodCall();

    // this.getDataFromDate();
    // this.getTodaysLiveLeaveCount();


    this.inputDate = this.getCurrentDate();
  }


  


  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;

  decodedAccessToken : any;

  preRuleForShimmersAndErrorPlaceholdersMethodCall(){
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  isShimmerForAttendanceData = false;
  dataNotFoundPlaceholderForAttendanceData = false;
  networkConnectionErrorPlaceHolderForAttendanceData = false;

  preRuleForShimmersAndErrorPlaceholdersForAttendanceDataMethodCall(){
    this.isShimmerForAttendanceData = true;
    this.dataNotFoundPlaceholderForAttendanceData = false;
    this.networkConnectionErrorPlaceHolderForAttendanceData = false;
  }

  isShimmerForBestPerfomer = false;
  dataNotFoundPlaceholderForBestPerfomer = false;
  networkConnectionErrorPlaceHolderForBestPerformer = false;

  preRuleForShimmersAndErrorPlaceholdersForBestPerformerMethodCall(){
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


  currentDayEmployeesData : any = [];

  getCurrentDayEmployeesData(){
    this.dataService.getTodayEmployeesData().subscribe((data) => {
      this.currentDayEmployeesData=data;
      debugger
    }, (error) => {
      console.log(error);
    })
  }


isAttendanceShimer: boolean=false;
errorToggleMain: boolean=false;

@ViewChild('attendanceMasterRollReport') attendanceMasterRollReport !: ElementRef;

getDataFromDate(): Promise<any> {
  return new Promise((resolve, reject) => {
      debugger
      this.myAttendanceData = {};
      this.myAttendanceDataLength = 0;

      this.preRuleForShimmersAndErrorPlaceholdersForAttendanceDataMethodCall();

      this.dataService.getAttendanceDetailsByDateDuration(
          this.startDateStr, 
          this.endDateStr, 
          this.pageNumber, 
          this.itemPerPage, 
          this.searchText, 
          this.searchBy
      ).subscribe(
          (response: any) => {
              debugger
              if (response.mapOfObject === undefined || response.mapOfObject === null) {
                  this.dataNotFoundPlaceholderForAttendanceData = true;
                  resolve(true);
              } else {
                  // Processing the response
                  this.myAttendanceData = response.mapOfObject;
                  this.myAttendanceDataLength = Object.keys(this.myAttendanceData).length;

                  if (this.myAttendanceDataLength === 0) {
                      this.dataNotFoundPlaceholderForAttendanceData = true;
                  }

                  this.total = response.totalItems;
                  this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);

                  debugger
                  console.log(this.myAttendanceData);
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
  resetCriteriaFilter(){
    this.itemPerPage = 12;
    this.pageNumber = 1;
  }
  searchUsers(event: Event) {
    this.attendanceMasterRollReport.nativeElement.scrollIntoView({ behavior: 'smooth' });
    if (event instanceof KeyboardEvent) {
        const ignoreKeys = ['Shift', 'Control', 'Alt', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'];

        const isCmdA = (event.key === 'a' || event.key === 'A') && (event.metaKey || event.ctrlKey);
        if (ignoreKeys.includes(event.key) || isCmdA) {
            return;
        }
    }

    this.myAttendanceData = {};
    this.total = 0;
    this.isShimer = true;

    this.resetCriteriaFilter();
    // this.getDataFromDate();
    this.getAttendanceReportByDateDurationMethodCall();
}


  clearSearchText(){
    this.searchText = '';
    // this.getDataFromDate();
    this.getAttendanceReportByDateDurationMethodCall();
  }

  // ##### Pagination ############
  async changePage(page: number | string) {
    debugger
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    await this.getAttendanceReportByDateDurationMethodCall();

    // this.isAllCollapsed = !this.isAllCollapsed;
    if(!this.isAllCollapsed){
      setTimeout(() => {
        this.toggleAllCollapse(true);
      }, 10);
    }
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
    const uniqueDays = Array.from(new Set(attendances.map(a => a.createdDate)));
    return uniqueDays;
  }
  
  getDayFromDate(inputDate : string){
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    return day;
  }

  getDayNameFromDate(dateString: string): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'EEEE');
  }


  attendanceString:string='';
  today:Date=new Date();
  convertStringToDate(attendance: AttendenceDto){
    if(attendance.converterDate==undefined){
      attendance.converterDate = new Date(attendance.createdDate)
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

  toggleAllCollapse(toggle:boolean) {
    debugger
    this.isAllCollapsed = !toggle;

    let elements = document.querySelectorAll('.bi-chevron-right');
    elements.forEach((element) => {
      if (this.isAllCollapsed && !element.classList.contains('collapsed')) {
        (element as HTMLElement).click();
      } else if (!this.isAllCollapsed && element.classList.contains('collapsed')) {
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


  calculateTotalDuration(attendances: AttendenceDto[]): number {
    return attendances.reduce((totalDuration, attendance) => {
      if (attendance.duration) {
        const durationParts = attendance.duration
          .split(" ")
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
    attendanceLatePerformers: []
  };
  
  // responseDto!: AttendanceWithTopPerformerResponseDto;

  isShimer: boolean=false;
  isLateShimmer: boolean=false;
  errorToggleTop:boolean=false;
  errorToggleLate:boolean=false;
  getAttendanceTopPerformerDetails(){
    this.preRuleForShimmersAndErrorPlaceholdersForBestPerformerMethodCall();
    debugger
    this.dataService.getAttendanceTopPerformers(this.startDateStr, this.endDateStr).subscribe(
      (data) => {
        // console.log(data);
        this.responseDto = data;


        if(data.attendanceTopPerformers.length === 0 || data === undefined || data === null){
          this.dataNotFoundPlaceholderForBestPerfomer = true;
        }
        // if(data.attendanceLatePerformers){
        //   this.isLateShimmer=false;
        // }
        console.log(this.responseDto); 
      },
      (error) => {
        // console.error(error);
        this.isShimer=false;
        this.networkConnectionErrorPlaceHolderForBestPerformer = true;
      }
    );
  }


  getAttendanceLatePerformerDetails(){
    this.isLateShimmer=true;
    debugger
    this.dataService.getAttendanceLatePerformers('2023-12-04', '2023-12-04').subscribe(
      (data) => {
        console.log(data);
        this.responseData = data;

        if(data.attendanceLatePerformers){
        this.isLateShimmer=false;
        }
        console.log(this.responseDto);
      },
      (error) => {
        this.isLateShimmer = false;
        this.errorToggleLate = true;
        console.error(error);
      }
    );
  }


  // #########################################################

  bestPerformerAttendanceDetailsResponseList : BestPerformerAttendanceDetailsResponse[] = [];

  getBestPerformerAttendanceDetailsMethodCall(){
    debugger
    this.preRuleForShimmersAndErrorPlaceholdersForBestPerformerMethodCall();
    this.dataService.getBestPerformerAttendanceDetails(this.startDateStr, this.endDateStr).subscribe((response) => {
      this.bestPerformerAttendanceDetailsResponseList = response;

      if(response === undefined || response === null || response.length === 0){
        this.dataNotFoundPlaceholderForBestPerfomer = true;
      }
    }, (error) => {
      console.log(error);
      this.networkConnectionErrorPlaceHolderForBestPerformer = true;
    })
  }
   
 
  
  lateEmployeeAttendanceDetailsResponseList : LateEmployeeAttendanceDetailsResponse[] = [];
  viewAll : string = Key.VIEW_ALL;
  viewLess : string = Key.VIEW_LESS;
  lateEmployeeDataLoaderButton : boolean = false;

  viewAllLateEmployeeAttendanceDetails(view : any){
    this.lateEmployeeDataLoaderButton = true;
    this.dataFetchingType = view;
    this.getLateEmployeeAttendanceDetailsMethodCall();
  }

  getLateEmployeeAttendanceDetailsMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.dataService.getLateEmployeeAttendanceDetails(this.dataFetchingType).subscribe((response) => {
      this.lateEmployeeAttendanceDetailsResponseList = response.listOfObject;
      this.totalLateEmployees = response.totalItems;

      if(response === undefined || response === null || response.listOfObject.length === 0){
        this.dataNotFoundPlaceholder = true;
      }
      this.lateEmployeeDataLoaderButton = false;
    }, (error) => {
      console.log(error);
      this.networkConnectionErrorPlaceHolder = true;
      this.lateEmployeeDataLoaderButton = false;
    })
  }
  

    visibleManagersCount: number = 1;

    showAllManagers(length : number) {
        this.visibleManagersCount = length;
    }

    hideSomeManagers() {
        this.visibleManagersCount = 1;
    }

  // ######################################################################

  attendanceReportResponseList : AttendanceReportResponse[] = [];
  debounceTimer: any;
  getAttendanceReportByDateDurationMethodCall(debounceTime: number = 300) {
      return new Promise((resolve, reject) => {
          if (this.debounceTimer) {
              clearTimeout(this.debounceTimer);
          }

          this.debounceTimer = setTimeout(() => {
              this.attendanceReportResponseList = [];
              this.preRuleForShimmersAndErrorPlaceholdersForAttendanceDataMethodCall();

              this.dataService.getAttendanceReportByDateDuration(this.startDate, this.endDate, this.pageNumber, this.itemPerPage, this.searchText, this.searchBy).toPromise()
                  .then((response) => {

                      if (response === null || response === undefined || response.object === undefined || response.object === null || response.object.length === 0) {
                          this.dataNotFoundPlaceholderForAttendanceData = true;
                          reject('Data not found');
                          return;
                      }

                      this.attendanceReportResponseList = response.object;
                      this.total = response.totalItems;

                      this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
                      console.log(response);
                      resolve(response);
                  })
                  .catch((error) => {
                      console.log(error);
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

  // getAttendanceReportByDateDurationMethodCall(){
  //   this.attendanceReportResponseList = [];
  //   this.preRuleForShimmersAndErrorPlaceholdersForAttendanceDataMethodCall();
  //   this.dataService.getAttendanceReportByDateDuration('2024-01-01','2024-01-31').subscribe((response) => {

  //     if(response === null || response === undefined || response.object === undefined || response.object === null || response.object.length === 0){
  //       this.dataNotFoundPlaceholderForAttendanceData = true;
  //       return;
  //     }

  //     this.attendanceReportResponseList = response.object;
  //     this.total = response.totalItems;

  //     this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
  //     console.log(response);
      
  //   }, (error) => {
  //     console.log(error);
  //     this.networkConnectionErrorPlaceHolderForAttendanceData = true;
  //   })
  // }


  // dayWiseStatusList : DayWiseStatus[] = [];
  // getDayWiseStatusMethodCall(userUuid : string){
  //   this.dataService.getDayWiseStatus(userUuid,'2024-01-01','2024-01-31').subscribe((response) => {
  //     this.dayWiseStatusList = response.object;
  //   }, (error) => {
  //     console.log(error);
  //   })
  // }

  // attendanceReportResponseListByUser : Date[] = [];
  // getAttendanceReportByDateDurationByUserMethodCall(){
  //   this.dataService.getAttendanceReportByDateDurationByUser('2023-12-01','2023-12-31').subscribe((response) => {
  //     console.log(response);
  //   }, (error) => {
  //     console.log(error);
  //   })
  // }

  downloadingFlag : boolean = false;
  downloadAttendanceDataInExcelFormatMethodCall(){
    
    this.downloadingFlag = true;
    this.dataService.downloadAttendanceDataInExcelFormat(this.startDate, this.endDate).subscribe((response) => {
      console.log(response);

      const downloadLink = document.createElement("a");
      downloadLink.href = response.message;
      downloadLink.download = "attendance.xlsx";
      downloadLink.click();
      this.downloadingFlag = false;
    }, (error) => {
      console.log(error);
      this.downloadingFlag = false;
    })
  }

  getCurrentDate(){
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = (todayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = todayDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  attendanceDetailsCountResponse : AttendanceDetailsCountResponse = new AttendanceDetailsCountResponse();
  getAttendanceDetailsCountMethodCall(){
    this.dataService.getAttendanceDetailsCount(this.getCurrentDate()).subscribe((response) => {
      debugger
      this.attendanceDetailsCountResponse = response.object;
    }, (error) => {
      console.log(error);
    })
  }
  
}