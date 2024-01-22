import { Component, ElementRef, Injectable, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, iif } from 'rxjs';
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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private dataService : DataService, private router : Router, private datePipe : DatePipe, private helperService : HelperService) {

    const currentDate = moment();
    this.startDateStr = currentDate.startOf('month').format('YYYY-MM-DD');
    this.endDateStr = currentDate.endOf('month').format('YYYY-MM-DD');

    // Set the default selected month
    this.month = currentDate.format('MMMM');
    
   }

  itemPerPage : number = 12;
  pageNumber : number = 1;
  lastPageNumber : number = 0;
  total !: number;
  totalLateEmployees : number = 0;
  rowNumber : number = 1;
  searchText : string = '';
  searchBy : string = '';
  dataFetchingType : string = '';

  currentDayEmployeesData : any = [];
  // selected: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs } | null = null;
  myAttendanceData: Record<string, AttendenceDto[]> = {};
  myAttendanceDataLength = 0;
  attendanceArrayDate: any = [];
  project : boolean = false;

  loginDetails = this.helperService.getDecodedValueFromToken();
   role:string = this.loginDetails.role;
   userUuid: string = this.loginDetails.uuid;
   orgRefId:string = this.loginDetails.orgRefId;

  startDateStr: string = '';
  endDateStr: string = '';
  month: string = '';


  ngOnInit(): void {
    // this.checkAccessToken();
   
    // const today = dayjs();
    // const firstDayOfMonth = today.startOf('month');
    // const lastDayOfMonth = today.endOf('month');

    // this.selected = {
    //   startDate: firstDayOfMonth,
    //   endDate: lastDayOfMonth
    // };

    this.getAttendanceReportByDateDurationMethodCall();

    this.getLateEmployeeAttendanceDetailsMethodCall();
    
    this.getCurrentDayEmployeesData();
    // this.getAttendanceTopPerformerDetails();
    // this.getAttendanceLatePerformerDetails();
    this.getBestPerformerAttendanceDetailsMethodCall();

    this.getDataFromDate();
    this.getTodaysLiveLeaveCount();
  }


  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;

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

  selectMonth(selectedMonth: string): void {
    this.month = selectedMonth;
    const selectedDate = moment().month(selectedMonth).startOf('month');
    this.startDateStr = selectedDate.format('YYYY-MM-DD');
    this.endDateStr = selectedDate.endOf('month').format('YYYY-MM-DD');
    
    // Fetch data using the selected start and end dates
    this.getAttendanceTopPerformerDetails();
    // this.getAttendanceLatePerformerDetails();
    this.getDataFromDate();
  }
  

  // checkAccessToken(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if (!loginDetails) {
  //     this.router.navigate(['/dynamic/login']);
  //   }
  // }


  getCurrentDayEmployeesData(){
    this.dataService.getTodayEmployeesData().subscribe((data) => {
      this.currentDayEmployeesData=data;
      debugger
      console.log(this.currentDayEmployeesData);
    }, (error) => {
      console.log(error);
    })
  }

  leaveCount!: number;

  getTodaysLiveLeaveCount(){
  this.dataService.getTodaysLeaveCount().subscribe((data) => {
    this.leaveCount=data;
    console.log(this.leaveCount);
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
    this.itemPerPage = 8;
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
    this.getDataFromDate();
}


  clearSearchText(){
    this.searchText = '';
    this.getDataFromDate();
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
    await this.getDataFromDate();

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
      this.bestPerformerAttendanceDetailsResponseList = response.listOfObject;

      if(response === undefined || response === null || response.listOfObject.length === 0){
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
      console.log(response);

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
  

    visibleManagersCount: number = 1; // Set this to the number of managers you want to show initially

    showAllManagers(length : number) {
        this.visibleManagersCount = length;
    }

    hideSomeManagers() {
        this.visibleManagersCount = 1; // Set this back to the number of managers you want to show by default
    }

  // ######################################################################

  attendanceReportResponseList : AttendanceReportResponse[] = [];
  getAttendanceReportByDateDurationMethodCall(){
    this.dataService.getAttendanceReportByDateDuration('2023-12-01','2023-12-31').subscribe((response) => {
      this.attendanceReportResponseList = response;
      console.log(response);
    }, (error) => {
      console.log(error);
    })
  }

  attendanceReportResponseListByUser : Date[] = [];
  getAttendanceReportByDateDurationByUserMethodCall(){
    this.dataService.getAttendanceReportByDateDurationByUser('2023-12-01','2023-12-31').subscribe((response) => {
      console.log(response);
    }, (error) => {
      console.log(error);
    })
  }

  downloadingFlag : boolean = false;
  downloadAttendanceDataInExcelFormatMethodCall(){
    
    this.downloadingFlag = true;
    this.dataService.downloadAttendanceDataInExcelFormat(this.startDateStr, this.endDateStr).subscribe((response) => {
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
  
}