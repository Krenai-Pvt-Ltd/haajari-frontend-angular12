import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { LeaveService } from 'src/app/services/leave.service';
import { finalize, tap } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { LeaveResponse, PendingLeaveResponse } from 'src/app/models/leave-responses.model';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import moment from 'moment';  // Import Moment.js
import { DatePipe } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexGrid,
  ApexFill,
  ApexMarkers,
  ApexTitleSubtitle,
  ChartComponent,
  ApexPlotOptions,
  ApexTheme,
  ApexStroke,
} from 'ng-apexcharts';


export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  theme: ApexTheme;
  stroke?: ApexStroke;
  grid?: ApexGrid;
};

export type ChartOptions1 = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  title: ApexTitleSubtitle;
};


@Component({
  selector: 'app-leave-managements',
  templateUrl: './leave-managements.component.html',
  styleUrls: ['./leave-managements.component.css']
})
export class LeaveManagementsComponent implements OnInit {

  constructor(private leaveService:LeaveService,private helperService: HelperService,  private dataService: DataService,   private rbacService: RoleBasedAccessControlService,private datePipe: DatePipe
  ,private cdr: ChangeDetectorRef) {

  }
  showFilter: boolean = false;
  logInUserUuid: string = '';

  async ngOnInit() {
    this.logInUserUuid = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    // this.filters.status = ['approved'];
    // this.applyFilters();
    this.getLeaves(false,false);
    this.selectedDate = new Date();
    this.getLeaveCategoryDetailsForLeaveTeamOverview();

    this.getOrganizationRegistrationDateMethodCall();
    this.calculateDateRange();
    this.setDefaultWeekTab();
    this.calculateDateRangeWeek();
    // this.updateWeekLabels();
    this.getDetailsForLeaveTeamOverview(this.tabName);
    this.getReportDetailsForLeaveTeamOverviewForHeatMap();
    this.getLeaveTopDefaulterUser();
  }


  tab: string = 'absent';
  switchTab(tab: string) {
    this.tab = tab

    switch (tab) {
      case 'absent':
        this.currentPageTeamOverView = 1;
        this.itemPerPageTeamOverview = 10;
        this.isLoaderLoading = false;
        this.isAllDataLoaded = false;
        this.leaveTeamOverviewResponse = [];
        this.tabName = this.ABSENT_TAB;
        this.getDetailsForLeaveTeamOverview(this.tabName);
        return;
      case 'leave':
        this.currentPageTeamOverView = 1;
        this.itemPerPageTeamOverview = 10;
        this.isLoaderLoading = false;
        this.isAllDataLoaded = false;
        this.leaveTeamOverviewResponse = [];
        this.tabName = this.ON_LEAVE_TAB;
        this.getDetailsForLeaveTeamOverview(this.tabName);
        return;
      case 'defaulter':
        this.currentPageTeamOverView = 1;
        this.itemPerPageTeamOverview = 10;
        this.isLoaderLoading = false;
        this.isAllDataLoaded = false;
        this.leaveTeamOverviewResponse = [];
        this.tabName = this.DEFAULTER_TAB;
        this.getDetailsForLeaveTeamOverview(this.tabName);
        return;
      case 'consistent':
        this.currentPageTeamOverView = 1;
        this.itemPerPageTeamOverview = 10;
        this.isLoaderLoading = false;
        this.isAllDataLoaded = false;
        this.leaveTeamOverviewResponse = [];
        this.tabName = this.CONSISTENT_TAB;
        this.getDetailsForLeaveTeamOverview(this.tabName);
        return;
      case 'department':
        this.currentPageTeamOverView = 1;
        this.itemPerPageTeamOverview = 10;
        this.isLoaderLoading = false;
        this.isAllDataLoaded = false;
        this.leaveTeamOverviewResponse = [];
        this.tabName = this.LEAVE_BY_DEPARTMENT_TAB;
        this.getDetailsForLeaveTeamOverview(this.tabName);
        return;
      default:
        return '';
    }

  }

  changeShowFilter(flag : boolean) {
    this.showFilter = flag;
  }


  /**
   * GET LEAVES START
   */
  APPROVED: string = 'approved';
  PENDING: string = 'pending';
  REJECTED: string = 'rejected';
  HISTORY: string = 'history';
  REQUESTED: string = 'requested';

  PRESENT = Key.PRESENT;
  ABSENT = Key.ABSENT;
  UNMARKED = Key.UNMARKED;
  WEEKEND = Key.WEEKEND;
  HOLIDAY = Key.HOLIDAY;
  LEAVE = Key.LEAVE;
  HALFDAY = Key.HALFDAY;

  ALL: string = 'all';
  isLoadingLeaves:boolean = false;
  itemPerPage: number = 10;
  currentPage:number = 1;
  searchTerm:string = '';
  leaves:any=[];
  totalItems:number = 0;
  statusMaster: string[] = [this.PENDING,this.APPROVED,this.REJECTED];
  // status= this.statusMaster;
  status:string[]= [];
  ROLE: string | null |any = '';
  isShimmer: boolean = false;

  //  getLeaves(resetSearch = false, applyDateRange = false){
  //     debugger
  //     if(resetSearch){
  //       this.resetSearch();
  //     }

  //     this.filters.leaveType = this.filters.leaveType.map((type: any) => typeof type === 'string' ? type : type.value);
  //     this.filters.status = this.filters.status.map((status: any) => typeof status === 'string' ? status : status.value);


  //     this.isLoadingLeaves = true;
  //     var uuid=null;
  //     var params= null;
  //     if(applyDateRange){
  //       params={ status: this.status ,itemPerPage: this.itemPerPage, currentPage: this.currentPage,search: this.searchTerm,
  //         startDate: moment(this.filters.fromDate).format(this.networkDateFormat),endDate: moment(this.filters.toDate).format(this.networkDateFormat),leaveType: this.filters.leaveType};

  //     }else{
  //       params={ status: this.filters.status ,itemPerPage: this.itemPerPage, currentPage: this.currentPage, search: this.searchTerm,
  //         leaveType:this.filters.leaveType};

  //     }


  //   this.leaveService
  //   .get(params)
  //   .pipe(
  //     tap((response:any) => {
  //       if (Array.isArray(response.object)) {
  //         // Store data for each tab
  //       this.leaves = response.object;
  //       this.totalItems = response.totalItems; // Update total count for the status
  //       } else{
  //         this.leaves = [];
  //         this.totalItems = 0;
  //       }

  //     }),
  //     finalize(() => {
  //       this.isLoadingLeaves = false;
  //     })
  //   )
  //   .subscribe({
  //     next: () => {
  //       // Subscription for side effects only
  //       // console.log('Pending leaves loaded successfully.');
  //     },
  //     error: (error) => {
  //       this.helperService.showToast(
  //         'Failed to load leaves.',
  //         Key.TOAST_STATUS_ERROR
  //       );
  //     },
  //   });

  //   }


  getLeaves(resetSearch = false, applyDateRange = false) {
    if (resetSearch) {
      this.resetSearch();
    }

    // this.filters.leaveType = this.filters.leaveType.map((type: any) => typeof type === 'string' ? type : type.value);
    // this.filters.status = this.filters.status.map((status: any) => typeof status === 'string' ? status : status.value);

    const params: any = {
      status: this.filters.status,
      leaveType: this.filters.leaveType,
      itemPerPage: this.itemPerPage,
      currentPage: this.currentPage,
      search: this.searchTerm || undefined
    };

    if (applyDateRange) {
      params.startDate = moment(this.filters.fromDate).format(this.networkDateFormat);
      params.endDate = moment(this.filters.toDate).format(this.networkDateFormat);
    }

    this.isLoadingLeaves = true;

    this.leaveService.get(params)
      .pipe(finalize(() => this.isLoadingLeaves = false))
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.object)) {
            this.leaves = response.object;
            this.totalItems = response.totalItems;
          } else {
            this.leaves = [];
            this.totalItems = 0;
          }
        },
        error: () => {
          this.helperService.showToast('Failed to load leaves.', Key.TOAST_STATUS_ERROR);
        },
      });
  }


    leave!: LeaveResponse;
    leaveData: any =  {
      leave: {}
    };
    isModalOpen: boolean = false;
    closeModalHandler(): void {
      this.leaveData = null;
      this.isModalOpen = false;
      this.getLeaves(true);
    }
      viewLeave(leave:any){
        this.isModalOpen = false;
        this.leave = leave;
        this.leaveData.leave = leave;
        setTimeout(() => {
        this.isModalOpen = true;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
        }, 10);
      }

      imageError: boolean = false;

handleImageError() {
  this.imageError = true;
}

openInNewTab(url: string) {
  window.open(url, '_blank');
}

onPageChange(page: number) {
  this.searchTerm = '';
  // this.currentPage = 1;
  this.currentPage = page;
  this.getLeaves();
}

resetSearch(){
  debugger
  this.searchTerm = '';
  this.currentPage = 1;
  this.leaves= [];
  // this.cdr.detectChanges();
}


searchTermChanged(event: any) {
  debugger
  this.currentPage = 1;
  this.searchTerm = event.target.value;
  this.searchTerm.trim().length === 0 ? this.resetSearch() :this.getLeaves();
}

searchLeaves() {
  this.resetValues();
  this.getLeaves();
}
resetValues(){
  // this.searchTerm = '';
  this.leaves=[];
  this.totalItems = 0;
  this.currentPage= 1;
}

/**
 * HANDLING FILTERS
 */
leaveTypes = ['Earned Leave', 'Sick Leave', 'Casual Leave']; // Example options

badgesList:[]=[];
filters:{
  fromDate: any|undefined;
  toDate: any|undefined;
  leaveType: string[];
  status: string[]
}  = {
  leaveType: [], // Default value
  status: [] // Default value
  ,
  fromDate: undefined,
  toDate: undefined
};

displayDateFormat: string = 'DD-MM-YYYY'; // Date format for date picker
networkDateFormat: string = "yyyy-MM-DD HH:mm:ss";

// Disable dates greater than 'fromDate' for the 'toDate' field
disabledDateTo = (current: Date): boolean => {
  return current && this.filters.fromDate && current <= this.filters.fromDate;
};

// Disable dates earlier than 'toDate' for the 'fromDate' field (if needed)
disabledDateFrom = (current: Date): boolean => {
  return current && this.filters.toDate && current >= this.filters.toDate;
};


appliedFilters: { key: string; value: string }[] = [];

applyFilters(): void {
  this.appliedFilters = [];

  // 🚀 Handle Leave Type - Add each selected type separately
  if (this.filters.leaveType.length) {
    const uniqueLeaveTypes = [...new Set(this.filters.leaveType)];
    uniqueLeaveTypes.forEach(type => {
      this.appliedFilters.push({ key: 'Leave Type', value: type });
    });
  }

  // 🚀 Handle Status - Add each selected status separately
  if (this.filters.status.length) {
    const uniqueStatuses = [...new Set(this.filters.status)];
    uniqueStatuses.forEach(status => {
      this.appliedFilters.push({ key: 'Status', value: status });
    });
  }

  // 📅 Handle Date Range - Added as a single filter
  if (this.filters.fromDate && this.filters.toDate) {
    const fromDate = moment(this.filters.fromDate).format(this.displayDateFormat);
    const toDate = moment(this.filters.toDate).format(this.displayDateFormat);
    this.appliedFilters.push({ key: 'Date', value: `${fromDate} to ${toDate}` });
  }

  this.changeShowFilter(false);
  this.currentPage = 1;
  this.getLeaves(false, true); // Fetch data with applied filters
}

resetFilters(): void {
  debugger
  this.filters = {
    fromDate: undefined,
    toDate: undefined,
    leaveType: [],
    status: [],
  };
  this.appliedFilters = [];
  this.changeShowFilter(false);
  this.currentPage = 1;
  this.getLeaves();
}
removeFilter(filter: { key: string; value: string }): void {
  // Remove the specific filter from the appliedFilters array
  this.appliedFilters = this.appliedFilters.filter(f => !(f.key === filter.key && f.value === filter.value));

  // Update corresponding filters based on key and value
  switch (filter.key) {
    case 'Leave Type':
      this.filters.leaveType = this.filters.leaveType.filter(type => type !== filter.value);
      break;

    case 'Status':
      this.filters.status = this.filters.status.filter(status => status !== filter.value);
      break;

    case 'Date':
      this.filters.fromDate = undefined;
      this.filters.toDate = undefined;
      break;
  }

  this.changeShowFilter(false);
  this.currentPage = 1;
  this.getLeaves(); // Refresh data after filter removal
}



// -- new start


@ViewChild("closebutton") closebutton!:ElementRef;
rejectionReason: string = '';
isLoading: boolean = false;
rejectionReasonFlag: boolean = false;
approveOrRejectLeave(leaveId: number, operationString: string) {
  debugger
  this.isLoading = true;
  this.leaveService.approveOrRejectLeaveOfUser(leaveId, operationString, this.rejectionReason).subscribe({
    next: (response: any) => {

      this.isLoading = false;
      this.rejectionReason = '';
      this.rejectionReasonFlag = false;
      this.getLeaves(true);
      this.closebutton.nativeElement.click();
      this.helperService.showToast(`Leave ${operationString} successfully.`, Key.TOAST_STATUS_SUCCESS);
    },
    error: (error) => {
      this.helperService.showToast('Error.', Key.TOAST_STATUS_ERROR);
      console.error('Failed to fetch approve/reject leaves:', error);
      this.isLoading = false;
    },
  });
}

approveOrRejectLeaveCall(leaveId: number, operationString: string) {
  debugger
   if(operationString === this.APPROVED) {
    this.rejectionReasonFlag = false;
    this.rejectionReason = '';
    this.approveOrRejectLeave(leaveId, operationString);
   }else if (operationString === this.REJECTED) {
    this.rejectionReasonFlag = true;
    // this.approveOrRejectLeave(leaveId, operationString);
   }
}

dayWiseLeaveStatus: any[]=[];
dayWiseLeaveStatusLoader: boolean = false;
getDayWiseLeaveStatus(leaveId: number) {
  debugger
  this.dayWiseLeaveStatusLoader = true;
  this.dayWiseLeaveStatus = [];
  this.leaveService.getDayWiseLeaveStatus(leaveId).subscribe({
    next: (response: any) => {
     this.dayWiseLeaveStatus = response.object;
     console.log(response);
     this.dayWiseLeaveStatusLoader = false;
    },
    error: (error) => {
      this.dayWiseLeaveStatusLoader = false;
      console.error('Failed to fetch approve/reject leaves:', error);
    },
  });
}


showCalender:boolean = false;
openCloseMonthCalender(){
  this.showCalender = !this.showCalender;
}


expandedStates: boolean[] = [];
// toggleCollapse(index: number): void {
//   this.expandedStates[index] = !this.expandedStates[index];
// }


expandedIndex: number | null = null;

toggleCollapse(index: number): void {
  this.expandedIndex = this.expandedIndex === index ? null : index;
  this.expandedStates[index] = !this.expandedStates[index];
}

isExpanded(index: number): boolean {
  return this.expandedIndex === index;
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


//  tema overview



ABSENT_TAB = Key.ABSENT_TAB;
ON_LEAVE_TAB = Key.ON_LEAVE_TAB;
DEFAULTER_TAB = Key.DEFAULTER_TAB;
CONSISTENT_TAB = Key.CONSISTENT_TAB;
LEAVE_BY_DEPARTMENT_TAB = Key.LEAVE_BY_DEPARTMENT_TAB;

tabName : string = Key.ABSENT_TAB;
// tabName : string = Key.ON_LEAVE_TAB;
// startDateTeamOverview : string = '2025-02-01';
// endDateTeamOverview : string = '2025-02-28';
itemPerPageTeamOverview : number = 10;
currentPageTeamOverView : number = 1;
leaveTeamOverviewResponse: any[] = [];
leaveTeamOverviewResponseTotalCount: number = 0;
isLoaderLoading: boolean = false;
isAllDataLoaded: boolean = false;
// getDetailsForLeaveTeamOverview(tabName:string) {
//   debugger
//   this.leaveTeamOverviewResponse = [];
//   this.isLoaderLoading = true;
//   this.leaveService.getDetailsForLeaveTeamOverview(tabName, this.startDate, this.endDate, this.itemPerPageTeamOverview, this.currentPageTeamOverView).subscribe({
//     next: (response: any) => {
//      this.leaveTeamOverviewResponse = response.object;
//      this.isLoaderLoading = false;
//      console.log(response);

//     },
//     error: (error) => {
//       this.isLoaderLoading = false;
//       console.error('Failed to fetch', error);
//     },
//   });
// }

getDetailsForLeaveTeamOverview(tabName: string) {
  if (this.isLoaderLoading || this.isAllDataLoaded) return; // Prevent multiple calls

  this.isLoaderLoading = true;

  this.leaveService
    .getDetailsForLeaveTeamOverview(tabName, this.startDate, this.endDate, this.itemPerPageTeamOverview, this.currentPageTeamOverView)
    .subscribe({
      next: (response: any) => {
        const fetchedData = response.object.response || [];
        if (fetchedData.length > 0) {
          this.leaveTeamOverviewResponse = [...this.leaveTeamOverviewResponse, ...fetchedData];
          this.leaveTeamOverviewResponseTotalCount = response.object.total;
          if(this.tabName == this.LEAVE_BY_DEPARTMENT_TAB) {
            this.prepareChartData(fetchedData);
          }
        } else {
          this.isAllDataLoaded = true; // No more data
        }
        this.isLoaderLoading = false;
      },
      error: (error) => {
        console.error('Failed to fetch', error);
        this.isLoaderLoading = false;
      },
    });
}

onScroll(event: any) {
  const target = event.target;

  // Check if the user scrolled to the bottom
  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10 && !this.isLoaderLoading && !this.isAllDataLoaded) {
    this.currentPageTeamOverView++; // Increase page number for next set of data
    this.getDetailsForLeaveTeamOverview(this.tabName); // Load more data
  }
}

// leaveReportResponse: any;
// getReportDetailsForLeaveTeamOverview() {
//   debugger
//   this.isLoaderLoading = true;
//   this.leaveService.getReportDetailsForLeaveTeamOverview(this.startDate, this.endDate).subscribe({
//     next: (response: any) => {
//      this.leaveReportResponse = response.object;
//      console.log(response);

//     },
//     error: (error) => {
//       this.isLoaderLoading = false;
//     },
//   });
// }




//  new


size: 'large' | 'small' | 'default' = 'small';
selectedDate: Date = new Date();
startDate: string = '';
endDate: string = '';
selectedTab: string = 'Week 1';
weekLabels: string[] = [];

startDateWeek: string = '';
endDateWeek: string = '';


organizationRegistrationDate: string = '';
getOrganizationRegistrationDateMethodCall() {
  debugger;
  this.dataService.getOrganizationRegistrationDate().subscribe(
    (response: string) => {
      this.organizationRegistrationDate = response;
      console.log("fghjklkjhgf", this.organizationRegistrationDate);
      this.updateWeekLabels();
    },
    (error: any) => {
      console.log(error);
    }
  );
}

disableMonths = (date: Date): boolean => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const dateYear = date.getFullYear();
  const dateMonth = date.getMonth();
  const userRegistrationYear = new Date(
    this.organizationRegistrationDate
  ).getFullYear();
  const userRegistrationMonth = new Date(
    this.organizationRegistrationDate
  ).getMonth();

  // Disable if the month is before the organization registration month
  if (
    dateYear < userRegistrationYear ||
    (dateYear === userRegistrationYear &&
      dateMonth < userRegistrationMonth)
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


calculateDateRange(): void {
  const currentDate = new Date();
  const isCurrentMonth =
    this.selectedDate.getFullYear() === currentDate.getFullYear() &&
    this.selectedDate.getMonth() === currentDate.getMonth();
    this.startDate = this.formatDateToYYYYMMDD(
      new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1)
    );
    this.endDate = this.formatDateToYYYYMMDD(
      isCurrentMonth ? currentDate : new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0)
    );
}


formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

onMonthChange(month: Date): void {
  this.selectedDate = month;
  // this.updateThirtyDaysLabel();
  this.updateWeekLabels();

  // Select the first week containing or after the joining date
  const joiningDate = new Date(this.organizationRegistrationDate);

  const selectedIndex = this.weekLabels.findIndex((_, index) => {
    const weekStart = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), index * 7 + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Check if the joining date falls in the week
    return weekStart <= joiningDate && joiningDate <= weekEnd;
  });

  // Default to Week 1 if no valid week is found
  this.selectedTab = selectedIndex !== -1 ? this.weekLabels[selectedIndex] : this.weekLabels[0];
  console.log('Selected Tab:', this.selectedTab);

  this.calculateDateRange();
  this.calculateDateRangeWeek();
  // this.tab = 'absent';
  // this.tabName = this.ABSENT_TAB;
  this.getDetailsForLeaveTeamOverview(this.tabName);
  this.getReportDetailsForLeaveTeamOverviewForHeatMap();
  this.getLeaveTopDefaulterUser();
}


  // Navigate to the previous month
  goToPreviousMonth(): void {
    if (!this.isPreviousDisabled()) {
      const previousMonth = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth() - 1,
        1
      );
      this.onMonthChange(previousMonth);
    }
  }

  // Navigate to the next month
  nextMonthDisable: boolean = false;
  goToNextMonth(): void {
    if (!this.isNextDisabled()) {
      const nextMonth = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth() + 1,
        1
      );
      this.onMonthChange(nextMonth);
    }
  }

  // Disable previous button logic
  isPreviousDisabled(): boolean {
    const userRegistrationDate = new Date(this.organizationRegistrationDate);
    return (
      this.selectedDate.getFullYear() === userRegistrationDate.getFullYear() &&
      this.selectedDate.getMonth() === userRegistrationDate.getMonth()
    );
  }

  // Disable next button logic
  isNextDisabled(): boolean {
    const currentDate = new Date();
    return (
      this.selectedDate.getFullYear() === currentDate.getFullYear() &&
      this.selectedDate.getMonth() === currentDate.getMonth()
    );
  }


  presentWeek: boolean = false;
  setDefaultWeekTab(): void {
    debugger
    const currentDate = new Date();
    const isCurrentMonth =
      this.selectedDate.getFullYear() === currentDate.getFullYear() &&
      this.selectedDate.getMonth() === currentDate.getMonth();

    if (isCurrentMonth) {
      // Determine the current week of the month
      const currentDay = currentDate.getDate();
      const currentWeek = Math.ceil(currentDay / 7);

      // Set the selectedTab to the current week
      this.selectedTab = `Week ${currentWeek}`;
      this.presentWeek = true;
      // this.selectedTab = `Current Week`;
    } else {
      // Default to Week 1 for other months
      this.selectedTab = 'Week 1';
      this.presentWeek = false;
    }
  }


  onTabChange(tab: string): void {
    debugger
    this.selectedTab = tab;
    this.presentWeek = false;
    // this.resetData();
    this.isShimmer = true;
    this.calculateDateRangeWeek();

  }

  calculateDateRangeWeek(): void {
    debugger
    const currentDate = new Date();
    const isCurrentMonth =
      this.selectedDate.getFullYear() === currentDate.getFullYear() &&
      this.selectedDate.getMonth() === currentDate.getMonth();
      const weekNumber = parseInt(this.selectedTab.replace('Week ', ''), 10);
      this.setWeekRange(this.selectedDate, weekNumber);
      this.getReportDetailsForLeaveTeamOverview();
  }


  updateWeekLabels(): void {
    debugger
    const currentDate = new Date();
    const daysInMonth = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() + 1,
      0
    ).getDate();
    const isCurrentMonth =
      this.selectedDate.getFullYear() === currentDate.getFullYear() &&
      this.selectedDate.getMonth() === currentDate.getMonth();

    const lastDay = isCurrentMonth ? currentDate.getDate() : daysInMonth;
    const joiningDate = new Date(this.organizationRegistrationDate);

    this.weekLabels = Array.from({ length: Math.ceil(lastDay / 7) }, (_, i) => {
      const weekStart = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), i * 7 + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Include only weeks where the end date is on or after the joining date
      return weekEnd >= joiningDate ? `Week ${i + 1}` : null;
    }).filter(week => week !== null) as string[];

    console.log("&^%$#$%^&*(&^%$#@#$%^&*()*&^%$#@", this.weekLabels);
  }


  setWeekRange(date: Date, weekNumber: number): void {
    debugger
    const currentDate = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const weekStart = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth(),
      (weekNumber - 1) * 7 + 1
    );
    const weekEnd = new Date(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate() + 6
    );

    this.startDateWeek = this.formatDateToYYYYMMDD(weekStart);

    // Update end date logic
    if (weekEnd > lastDayOfMonth) {
      // If it's the last week of the month, adjust to the last day of the month
      this.endDateWeek = this.formatDateToYYYYMMDD(
        currentDate >= weekStart && currentDate <= lastDayOfMonth
          ? currentDate // Use current date if within the selected week's range
          : lastDayOfMonth
      );
    } 
    // else if (currentDate >= weekStart && currentDate <= weekEnd) {
    //   // If the current week is the selected week, adjust to the current date
    //   this.endDateWeek = this.formatDateToYYYYMMDD(currentDate);
    // }
     else {
      this.endDateWeek = this.formatDateToYYYYMMDD(weekEnd);
    }
  }


  //  report graphb code


  @ViewChild('chart') chart1: ChartComponent | undefined;

  public series: ApexAxisChartSeries = [];
  public chart: ApexChart = {
    type: 'area',
    stacked: false,
    height: 150,
    background: '#FFFFFF',
    zoom: { enabled: false },
    toolbar: {
      show: false,
      tools: { zoomin: false, zoomout: false, pan: false, reset: false },
    },
  };

  public xaxis: ApexXAxis = {
    type: 'datetime',
    labels: {
      format: 'dd MMM', // Show day and month (e.g., "23 Feb")
      rotate: -45,
      hideOverlappingLabels: false,
    },
    tickPlacement: 'on',
  };

  public yaxis: ApexYAxis = {
    title: { text: 'Approved Leaves' },
    labels: { show: false },
    min: 0,
  };

  public dataLabels: ApexDataLabels = { enabled: false };
  public tooltip: ApexTooltip = {
    x: { format: 'dd MMM yyyy' },
    y: {
      formatter: (value: number) => `${value} Leave${value !== 1 ? 's' : ''}`,
    },
  };

  public grid: ApexGrid = { show: false };
  public fill: ApexFill = {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0, stops: [0, 90, 100] },
  };

  public markers: ApexMarkers = { size: 5 };
  public title: ApexTitleSubtitle = {
    text: 'Daily Approved Leaves',
    align: 'left',
  };

  public isChartInitialized: boolean = false;
  public leaveReportResponse: any;

  getReportDetailsForLeaveTeamOverview(): void {
    this.leaveService.getReportDetailsForLeaveTeamOverview(this.startDateWeek, this.endDateWeek).subscribe({
      next: (response: any) => {
        this.leaveReportResponse = response.object;
        const approvedLeaveCounts = response.object?.approvedLeaveCounts ?? [];
        this.initChartData(approvedLeaveCounts);
      },
      error: (err) => console.error('Error fetching leave data', err),
    });
  }

  private initChartData(approvedLeaveCounts: { totalCount: number; date: string }[]): void {
    if (!approvedLeaveCounts.length) {
      console.warn('No approved leave data available.');
      return;
    }

    const dataPoints = approvedLeaveCounts.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.totalCount,
    }));

    const dates = approvedLeaveCounts.map(item => new Date(item.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const extendedMaxDate = new Date(maxDate);
    // extendedMaxDate.setDate(extendedMaxDate.getDate() + 1);
    extendedMaxDate.setDate(extendedMaxDate.getDate()); // Extend by 2 days for better visualization

    this.xaxis = { ...this.xaxis, min: minDate, max: extendedMaxDate.getTime() };

    this.series = [{ name: 'Approved Leaves', data: dataPoints }];

    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      this.isChartInitialized = true;
    }, 100);
  }


  //  new for heat map

  @ViewChild('chartHeatMap') chartHeatMap!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  leaveReportResponseHeatMap: any;

  getReportDetailsForLeaveTeamOverviewForHeatMap(): void {
    this.leaveService.getReportDetailsForLeaveTeamOverview(this.startDate, this.endDate).subscribe({
      next: (response: any) => {
        const approvedLeaveCounts = response.object?.approvedLeaveCounts ?? [];
        this.initChartDataHeatMap(approvedLeaveCounts);
      },
      error: (err) => console.error('Error fetching leave data', err),
    });
  }

  // initChartDataHeatMap(approvedLeaveCounts: any[]): void {
  //   const dateMap = new Map<string, number>();
  //   approvedLeaveCounts.forEach(item => dateMap.set(item.date, item.totalCount));

  //   const start = new Date(this.startDate);
  //   const end = new Date(this.endDate);

  //   const seriesData: any[] = [];
  //   let currentWeekStart = new Date(start);

  //   // Function to get the end of the current week (Sunday)
  //   const getWeekEndDate = (date: Date): Date => {
  //     const weekEnd = new Date(date);
  //     weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));
  //     return weekEnd > end ? new Date(end) : weekEnd;
  //   };

  //   let weekIndex = 1;
  //   while (currentWeekStart <= end) {
  //     const currentWeekEnd = getWeekEndDate(currentWeekStart);
  //     const weekData: any[] = [];

  //     for (let date = new Date(currentWeekStart); date <= currentWeekEnd; date.setDate(date.getDate() + 1)) {
  //       const formattedDate = date.toISOString().split('T')[0];
  //       const count = dateMap.get(formattedDate) ?? 0;

  //       // weekData.push({ x: formattedDate, y: count });
  //       weekData.push({ x: "Approved", y: count });
  //     }

  //     seriesData.push({ name: `Week ${weekIndex}`, data: weekData });
  //     weekIndex++;

  //     currentWeekStart.setDate(currentWeekEnd.getDate() + 1); // Move to next week's start
  //   }

  //   this.chartOptions = {
  //     series: seriesData,
  //     chart: {
  //       height: 350,
  //       type: 'heatmap',
  //     },
  //     plotOptions: {
  //       heatmap: {
  //         shadeIntensity: 0.5,
  //         radius: 4,
  //         useFillColorAsStroke: true,
  //         colorScale: {
  //           ranges: [
  //             { from: 0, to: 0, name: 'No Leaves', color: '#E0E0E0' },
  //             { from: 1, to: 2, name: 'Low', color: '#90CAF9' },
  //             { from: 3, to: 4, name: 'Medium', color: '#42A5F5' },
  //             { from: 5, to: 6, name: 'High', color: '#1E88E5' },
  //             { from: 7, to: 10, name: 'Very High', color: '#1565C0' },
  //           ],
  //         },
  //       },
  //     },
  //     dataLabels: { enabled: false },
  //     xaxis: { type: 'category', labels: { show: false } },
  //     yaxis: { title: { text: 'Weeks of the Month' } },
  //     tooltip: { y: { formatter: (val) => `${val} Leave(s)` } },
  //     theme: { mode: 'light' },
  //   };
  // }

  initChartDataHeatMap(approvedLeaveCounts: any[]): void {
    const dateMap = new Map<string, number>();
    approvedLeaveCounts.forEach(item => dateMap.set(item.date, item.totalCount));

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    const seriesData: any[] = [];
    let currentDate = new Date(start);
    let weekIndex = 1;

    while (currentDate <= end) {
      const weekStart = new Date(currentDate);
      const potentialWeekEnd = new Date(currentDate);
      potentialWeekEnd.setDate(weekStart.getDate() + 6);  // Each week covers 7 days

      const weekEnd = potentialWeekEnd > end ? end : potentialWeekEnd;  // Handle last week ending

      const weekData: any[] = [];
      for (let date = new Date(weekStart); date <= weekEnd; date.setDate(date.getDate() + 1)) {
        const formattedDate = date.toISOString().split('T')[0];
        const count = dateMap.get(formattedDate) ?? 0;
        // weekData.push({ x: formattedDate, y: count });
        weekData.push({ x: "Total Approved", y: count });
      }
  
      // seriesData.push({
      //   name: `Week ${weekIndex} (${this.formatDateToDDMMM(weekStart)} - ${this.formatDateToDDMMM(weekEnd)})`,
      //   data: weekData,
      // });
      seriesData.push({
        name: `Week ${weekIndex}`,
        data: weekData,
      });
      
  
      weekIndex++;
      currentDate.setDate(weekEnd.getDate() + 1);  // Move to the next week's start
    }
  
    this.chartOptions = {
      series: seriesData,
      chart: { height: 350, type: 'heatmap' },
      stroke: {  
            width: 2,
            colors: ['#ffffff'], 
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          radius: 6,
          useFillColorAsStroke: true,
            // distributed: true,
          colorScale: {
            ranges: [
              { from: 0, to: 0, name: 'No Leaves', color: '#E0E0E0' },
              { from: 1, to: 2, name: 'Low', color: '#90CAF9' },
              { from: 3, to: 4, name: 'Medium', color: '#42A5F5' },
              { from: 5, to: 6, name: 'High', color: '#1E88E5' },
              { from: 7, to: 10, name: 'Very High', color: '#1565C0' },
            ],
          },
        },
      },
      dataLabels: { enabled: false },
      xaxis: { type: 'category', labels: { show: false } },
      yaxis: { title: { text: 'Weeks of the Month' } },
      grid: { 
            padding: { left: 20, right: 20, top: 20, bottom: 20 },
      },
      tooltip: {
        y: { formatter: (val) => `${val} Leave(s)` },
        x: { formatter: (val) => `${val}` },
      },
      theme: { mode: 'light' },
    };
    // this.chartOptions = {
    //   series: seriesData,
    //   chart: { 
    //     height: 350, 
    //     type: 'heatmap',
    //     toolbar: { show: false },
    //   },
    //   stroke: {  // ✅ Moved to top-level (outside `chart`)
    //     width: 2,
    //     colors: ['#ffffff'],  // White borders around heatmap boxes
    //   },
    //   plotOptions: {
    //     heatmap: {
    //       shadeIntensity: 0.3,
    //       radius: 6, // Rounded box corners
    //       useFillColorAsStroke: true,
    //       distributed: true,
    //       colorScale: {
    //         ranges: [
    //           { from: 0, to: 0, name: 'No Leaves', color: '#E0E0E0' },
    //           { from: 1, to: 2, name: 'Low', color: '#90CAF9' },
    //           { from: 3, to: 4, name: 'Medium', color: '#42A5F5' },
    //           { from: 5, to: 6, name: 'High', color: '#1E88E5' },
    //           { from: 7, to: 10, name: 'Very High', color: '#1565C0' },
    //         ],
    //       },
    //     },
    //   },
    //   dataLabels: { enabled: false },
    //   xaxis: { 
    //     type: 'category', 
    //     labels: { show: false },
    //     axisBorder: { show: false },
    //     axisTicks: { show: false },
    //   },
    //   yaxis: { 
    //     title: { text: 'Weeks of the Month' },
    //     labels: { style: { fontSize: '12px' } },
    //   },
    //   grid: { 
    //     padding: { left: 10, right: 10, top: 10, bottom: 10 },
    //   },
    //   tooltip: {
    //     y: { formatter: (val) => `${val} Leave(s)` },
    //     x: { formatter: (val) => `${val}` },
    //   },
    //   theme: { mode: 'light' },
    // };
    
  }

  // formatDateToYYYYMMDD(date: Date): string {
  //   return date.toISOString().split('T')[0];
  // }

  formatDateToDDMMM(date: Date): string {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  }



//  leave category details code
  leaveCategoryDetails: any;
  leaveCategoryDetailsLoader: boolean = false;
  getLeaveCategoryDetailsForLeaveTeamOverview(): void {
    this.leaveCategoryDetailsLoader = true;
    this.leaveService.getLeaveCategoryDetailsForLeaveTeamOverview().subscribe({
      next: (response: any) => {
       this.leaveCategoryDetails = response.object;
       this.leaveCategoryDetailsLoader = false;

      },
      error: (err) => {
        this.leaveCategoryDetailsLoader = false;
        console.error('Error fetching leave data', err)}
      ,
    });
  }


  //  chart for department


  @ViewChild('departmentChart') departmentChart!: ChartComponent;
  public chartOptions1!: Partial<ChartOptions1>;

  public bestTeam: string = '';
  public slowestTeam: string = '';

  prepareChartData(data: any[]) {
    if (!data || data.length === 0) return;

    const sortedData = [...data].sort((a, b) => b.totalApprovedLeaveCount - a.totalApprovedLeaveCount);
    this.bestTeam = sortedData[0]?.teamName || 'N/A';
    this.slowestTeam = sortedData[sortedData.length - 1]?.teamName || 'N/A';

    const maxCount = sortedData[0]?.totalApprovedLeaveCount || 1;
    const categories = sortedData.map((item) => item.teamName);
    const seriesData = sortedData.map((item) => Number(((item.totalApprovedLeaveCount / maxCount) * 100).toFixed(2)));

    this.chartOptions1 = {
      series: [
        {
          name: 'Leave Percentage',
          data: seriesData,
        },
      ],
      chart: {
        type: 'bar',
        height: 400,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            position: 'right',
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val}%`,
        style: {
          fontSize: '12px',
          colors: ['#333'],
        },
      },
      xaxis: {
        categories: categories,
        title: { text: 'Percentage (%)' },
      },
      yaxis: {
        title: { text: 'Teams' },
      },
      tooltip: {
        y: {
          formatter: (val) => `${val}%`,
        },
      },
      fill: {
        colors: ['#1E90FF'],
      },
      title: {
        text: 'Team Leave Performance',
        align: 'center',
        style: { fontSize: '16px', fontWeight: 'bold' },
      },
    };
  }




//  leave category details code
topDefaulterUser: any;
isDefaulterEmployeeLoading: boolean = false;
getLeaveTopDefaulterUser(): void {
  this.isDefaulterEmployeeLoading = true;
  this.leaveService.getLeaveTopDefaulterUser(this.startDate, this.endDate).subscribe({
    next: (response: any) => {
     this.topDefaulterUser = response.object;
     this.isDefaulterEmployeeLoading = false

    },
    error: (err) => {
      this.topDefaulterUser = null;
      this.isDefaulterEmployeeLoading = false;
      console.error('Error fetching leave data', err)},
  });
}


getLeaveClass(leaveCategoryName: string): string {
  const leaveClassMap: { [key: string]: string } = {
    'Casual Leave': 'casual-leave',
    'Earned Leave': 'earned-leave',
    'Sick Leave': 'sick-leave',
    'Maternity Leave': 'maternity-leave',
    'Paternity Leave': 'paternity-leave',
    'WFH': 'wfh-leave',
    'Week Off': 'week-off-leave'
  };

  return leaveClassMap[leaveCategoryName] || 'default-leave'; // fallback class
}

  
  
  
}
