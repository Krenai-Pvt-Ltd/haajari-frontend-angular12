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
import {ApexAxisChartSeries, ApexChart,ApexXAxis,ApexYAxis,ApexDataLabels,ApexTooltip,ApexGrid,ApexFill,ApexMarkers,ApexTitleSubtitle,ChartComponent,ApexPlotOptions,ApexTheme,ApexStroke, ApexLegend,} from 'ng-apexcharts';


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
  legend?: ApexLegend
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
  stroke?: ApexStroke;
  grid?: ApexGrid;
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
  /**
   * VARIABLE DECLARATION STARTS
   */
  showFilter: boolean = false;
  logInUserUuid: string = '';
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
  status:string[]= [];
  ROLE: string | null |any = '';
  isShimmer: boolean = false;
  rejectionReason: string = '';
  isLoading: boolean = false;
  rejectionReasonFlag: boolean = false;
  showCalender:boolean = false;
  expandedStates: boolean[] = [];
  expandedIndex: number | null = null;

size: 'large' | 'small' | 'default' = 'small';
selectedDate: Date = new Date();
startDate: string = '';
endDate: string = '';
selectedTab: string = 'Week 1';
weekLabels: string[] = [];

startDateWeek: string = '';
endDateWeek: string = '';
ABSENT_TAB = Key.ABSENT_TAB;
ON_LEAVE_TAB = Key.ON_LEAVE_TAB;
DEFAULTER_TAB = Key.DEFAULTER_TAB;
CONSISTENT_TAB = Key.CONSISTENT_TAB;
LEAVE_BY_DEPARTMENT_TAB = Key.LEAVE_BY_DEPARTMENT_TAB;

tabName : string = Key.ABSENT_TAB;
itemPerPageTeamOverview : number = 10;
currentPageTeamOverView : number = 1;
leaveTeamOverviewResponse: any[] = [];
leaveTeamOverviewResponseTotalCount: number = 0;
isLoaderLoading: boolean = false;
isAllDataLoaded: boolean = false;
dayWiseLeaveStatus: any[]=[];
dayWiseLeaveStatusLoader: boolean = false;
organizationRegistrationDate: string = '';
  /**
   * VARIABLE DECLARATION END
   */
  /**
   * VIEW CHILD REEFENCES START
   */
  @ViewChild("closebutton") closebutton!:ElementRef;
/**
   * VIEW CHILD REEFENCES START
   */
  async ngOnInit() {
    this.logInUserUuid = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    this.filters.status = ['pending'];
    this.applyFilters();
    // this.getLeaves(false,false);
    this.selectedDate = new Date();

    this.getOrganizationRegistrationDateMethodCall();
    this.calculateDateRange();
    this.setDefaultWeekTab();
    this.calculateDateRangeWeek();
    this.getDetailsForLeaveTeamOverview(this.tabName);
    this.getReportDetailsForLeaveTeamOverviewForHeatMap();
    this.getLeaveTopDefaulterUser();
    this.getLeaveCategoryDetailsForLeaveTeamOverview();

    this.resetTabData();
    this.fetchMaxLeavesUsers();
    this.fetchMinLeavesUsers();
    this.fetchUsersOnLeave();
  }


  pageNumberConsistent: number = 1;
  pageNumberDefaulter: number = 1;
  pageNumberOnLeave: number = 1;
  itemOnPage: number = 10;
  totalMaxLeaves: number = 0;
  totalMinLeaves: number = 0;
  totalUsersOnLeave: number = 0;
  maxLeavesUsers: any[] = [];
  minLeavesUsers: any[] = [];
  usersOnLeave: any[] = [];

  throttle =100;
  scrollDistance = 1;
  scrollUpDistance = 1;


  mostDefaulter: any={}
  fetchMaxLeavesUsers(): void {
    this.isLoaderLoading = true;
    this.leaveService.getUsersWithMaximumLeaves(this.pageNumberDefaulter, this.itemOnPage).subscribe(
      response => {
        this.isLoaderLoading = false;
        if (response.status) {
          this.maxLeavesUsers = [...this.maxLeavesUsers, ...response.object];
          this.totalMaxLeaves = response.totalItems;
          if(this.maxLeavesUsers.length > 0 ) {
            this.mostDefaulter = JSON.parse(JSON.stringify(this.maxLeavesUsers[0]));
          }
          this.pageNumberDefaulter++;
          if (this.maxLeavesUsers.length >= this.totalMaxLeaves) {
            this.isAllDataLoaded = true;
          }
        }
      },
      err => {
        this.isLoaderLoading = false;
      }
    );
  }

  fetchMinLeavesUsers(): void {
    this.isLoaderLoading = true;
    this.leaveService.getUsersWithMinimumLeaves(this.pageNumberConsistent, this.itemOnPage).subscribe(
      response => {
        this.isLoaderLoading = false;
        if (response.status) {
          this.minLeavesUsers = [...this.minLeavesUsers, ...response.object];
          this.totalMinLeaves = response.totalItems;
          this.pageNumberConsistent++;
          if (this.minLeavesUsers.length >= this.totalMinLeaves) {
            this.isAllDataLoaded = true;
          }
        }
      },
      err => {
        this.isLoaderLoading = false;
      }
    );
  }

  fetchUsersOnLeave(): void {
    this.isLoaderLoading = true;
    this.leaveService.getUsersOnLeaveInRange(this.startDate, this.endDate).subscribe(
      response => {
        this.isLoaderLoading = false;
        if (response.status) {
          this.usersOnLeave = [...this.usersOnLeave, ...response.object];
          this.totalUsersOnLeave = response.totalItems;
          this.pageNumberOnLeave++;
          if (this.usersOnLeave.length >= this.totalUsersOnLeave) {
            this.isAllDataLoaded = true;
          }
        }
      },
      err => {
        this.isLoaderLoading = false;
      }
    );
  }



  onScrollConsistent(): void {
    console.log('onScrollConsistent triggered');

    if (this.minLeavesUsers.length < this.totalMinLeaves && !this.isLoaderLoading) {
      this.fetchMinLeavesUsers();
    }
  }

  onScrollUsersOnLeave(){

    if (this.usersOnLeave.length < this.totalUsersOnLeave && !this.isLoaderLoading) {
      this.fetchUsersOnLeave();
    }
  }

  onScrollDefaulter(): void {
    console.log('onScrollConsistent triggered');

    if (this.maxLeavesUsers.length < this.totalMaxLeaves && !this.isLoaderLoading) {
      this.fetchMinLeavesUsers();
    }
  }





  tab: string = 'absent';
  switchTab(tab: string) {
    this.tab = tab;
    this.resetTabData();

    switch (tab) {
      case 'absent':
        this.selectTab(this.ABSENT_TAB);
        this.getDetailsForLeaveTeamOverview(this.tabName);
        break;
      case 'leave':
        this.selectTab(this.ON_LEAVE_TAB);
        this.fetchUsersOnLeave();
        break;
      case 'defaulter':
        this.selectTab(this.DEFAULTER_TAB);
        this.fetchMaxLeavesUsers();
        break;
      case 'consistent':
        this.selectTab(this.CONSISTENT_TAB);
        this.fetchMinLeavesUsers();
        break;
      case 'department':
        this.selectTab(this.LEAVE_BY_DEPARTMENT_TAB);
        this.getDetailsForLeaveTeamOverview(this.tabName);
        break;
    }
  }

  selectTab(tabName: string) {
    this.currentPageTeamOverView = 1;
    this.itemPerPageTeamOverview = 10;
    this.isLoaderLoading = false;
    this.isAllDataLoaded = false;
    this.leaveTeamOverviewResponse = [];
    this.tabName = tabName;
  }

  resetTabData(): void {
    this.pageNumberOnLeave = 1;
    this.pageNumberDefaulter = 1;
    this.pageNumberConsistent = 1;
    this.usersOnLeave = [];
    this.maxLeavesUsers = [];
    this.minLeavesUsers = [];
    this.totalUsersOnLeave = 0;
    this.totalMaxLeaves = 0;
    this.totalMinLeaves = 0;
    this.isAllDataLoaded = false;
  }
  changeShowFilter(flag : boolean) {
    this.showFilter = flag;
  }


  /**
   * GET LEAVES START
   */


  pendingLeaveCount: number = 0;
  isFirstLoad: boolean = true;

  getLeaves(resetSearch = false, applyDateRange = false) {
    if (resetSearch) {
      this.resetSearch();
    }

    const params: any = {
      status: this.filters.status,
      leaveType: this.filters.leaveType,
      itemPerPage: this.itemPerPage,
      currentPage: this.currentPage,
      search: this.searchTerm || undefined
    };

    if (applyDateRange) {

      params.startDate = moment(this.filters.fromDate).format(this.displayDateFormatNew);
      params.endDate = moment(this.filters.toDate).format(this.displayDateFormatNew);
      // params.startDate = moment(this.filters.fromDate).format(this.networkDateFormat);
      // params.endDate = moment(this.filters.toDate).format(this.networkDateFormat);
    }

    this.isLoadingLeaves = true;

    this.leaveService.get(params)
      .pipe(finalize(() => this.isLoadingLeaves = false))
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.object)) {
            this.leaves = response.object;
            this.totalItems = response.totalItems;
            // console.log("execute" + this.filters.status.length);
            if (this.filters.status.length == 1 && this.filters.status.includes('pending')) {
              // console.log("execute" + this.filters.status);
              this.pendingLeaveCount = response.totalItems;
            }

            // this.isFirstLoad = false;
            // this.isPendingChange = false;


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
    closeModalHandler(event:any): void {
      console.log("event" + event);
      this.leaveData = null;
      this.isModalOpen = false;
      this.applyFilters();
      if(event!=null) {
        this.userLeaveQuota = event;
        this.openLeaveQuotaModal();
      }
      // this.getLeaves(true);
    }

      viewLeave(leave:any){
        console.log("leave" , leave);
        if (!leave) {
          console.log("Leave data is undefined or null.");
          return;
        }
        this.isModalOpen = false;
        this.leave = leave;
        this.leaveData = {
          leave: {}
        };
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


  if(this.filters.fromDate && this.filters.toDate) {
    this.getLeaves(false, true); // Fetch data with applied filters
    } else {
      this.getLeaves(false, false);
    }

  // if(this.filters.fromDate && this.filters.toDate) {
  //   this.getLeaves(false, true); // Fetch data with applied filters
  //   } else {
  //     this.getLeaves(false, false);
  //   }
  // this.getLeaves();
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
  // this.searchTerm.trim().length === 0 ? this.resetSearch() :this.getLeaves();
  this.searchTerm.trim().length === 0 ? this.resetSearch() :this.applyFilters();

}

searchLeaves() {
  this.resetValues();
  // this.getLeaves();
  this.applyFilters()
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
leaveTypes = ['Earned Leave', 'Sick Leave', 'Casual Leave', 'Leave Without Pay']; // Example options

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
displayDateFormatNew: string = 'YYYY-MM-DD';
networkDateFormat: string = "yyyy-MM-DD HH:mm:ss";

// Disable dates greater than 'fromDate' for the 'toDate' field
disabledDateTo = (current: Date): boolean => {
  return current && this.filters.fromDate && current <= this.filters.fromDate;
};

// Disable dates earlier than 'toDate' for the 'fromDate' field (if needed)
disabledDateFrom = (current: Date): boolean => {
  return current && this.filters.toDate && current >= this.filters.toDate;
};



resetFiltersSearch() {
  if(this.filters.fromDate && this.filters.toDate) {
    this.getLeaves(true, true); // Fetch data with applied filters
    } else {
      this.getLeaves(true, false);
    }
}


appliedFilters: { key: string; value: string }[] = [];

applyFilters(): void {
  this.appliedFilters = [];

  // Handle Leave Type - Add each selected type separately
  if (this.filters.leaveType.length) {
    const uniqueLeaveTypes = [...new Set(this.filters.leaveType)];
    uniqueLeaveTypes.forEach(type => {
      this.appliedFilters.push({ key: 'Leave Type', value: type });
    });
  }

  // Handle Status - Add each selected status separately
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

  if(this.filters.fromDate && this.filters.toDate) {
  this.getLeaves(false, true); // Fetch data with applied filters
  } else {
    this.getLeaves(false, false);
  }
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
  this.applyFilters();
  // this.getLeaves();
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
  this.applyFilters();
  // this.getLeaves(); // Refresh data after filter removal
}


isPendingChange: boolean = false;
LEAVE_QUOTA_EXCEEDED = Key.LEAVE_QUOTA_EXCEEDED;

// Component properties
showLeaveQuotaModal: boolean = false;
userLeaveQuota: any = null;

// -- new start
approveOrRejectLeave(leaveId: number, operationString: string) {
  debugger
  this.isLoading = true;
  this.leaveService.approveOrRejectLeaveOfUser(leaveId, operationString, this.rejectionReason).subscribe({
    next: (response: any) => {

      this.isLoading = false;
      this.rejectionReason = '';
      this.rejectionReasonFlag = false;
      this.isPendingChange = true;
      this.applyFilters();
      // this.getLeaves(true);
      if (this.closebutton) {
        this.closebutton.nativeElement.click();
      } else {
        console.log('Close button reference not found.');
      }

      if (response.message === 'approved' || response.message === 'rejected') {
        this.helperService.showToast(`Leave ${operationString} successfully.`, Key.TOAST_STATUS_SUCCESS);
      } else if (response.message === this.LEAVE_QUOTA_EXCEEDED) {
        this.helperService.showToast('Leave quota exceeded.', Key.TOAST_STATUS_ERROR);
        this.fetchUserLeaveQuota(leaveId); // Fetch and open leave quota modal
      } else {
        this.helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
      }
      // if(response.status) {
      // this.helperService.showToast(`Leave ${operationString} successfully.`, Key.TOAST_STATUS_SUCCESS);
      // }else {
      //   this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
      // }
    },
    error: (error) => {
      this.isPendingChange = false;
      this.helperService.showToast('Error.', Key.TOAST_STATUS_ERROR);
      console.error('Failed to fetch approve/reject leaves:', error);
      this.isLoading = false;
    },
  });
}



// Fetch user leave quota details
fetchUserLeaveQuota(leaveId: number) {
  this.leaveService.getUserLeaveQuota(leaveId).subscribe({
    next: (quota: any) => {
      this.userLeaveQuota = quota.object; // Assign quota details
      this.openLeaveQuotaModal(); // Show the modal
    },
    error: (err) => {
      console.error('Failed to fetch user leave quota:', err);
      this.helperService.showToast('Failed to load leave quota.', Key.TOAST_STATUS_ERROR);
    }
  });
}

// Open modal
openLeaveQuotaModal() {
  this.showLeaveQuotaModal = true;
}

// Close modal
closeLeaveQuotaModal() {
  this.showLeaveQuotaModal = false;
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



openCloseMonthCalender(){
  this.showCalender = !this.showCalender;
}



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


onScroll(event: any): void {
  const target = event.target;
  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10 && !this.isLoaderLoading && !this.isAllDataLoaded) {
    switch (this.tab) {
      case 'absent':
        this.currentPageTeamOverView++;
        this.getDetailsForLeaveTeamOverview(this.tabName);
        break;
      case 'leave':
        if (this.usersOnLeave.length < this.totalUsersOnLeave) {
          this.fetchUsersOnLeave();
        }
        break;
      case 'defaulter':
        if (this.maxLeavesUsers.length < this.totalMaxLeaves) {
          this.fetchMaxLeavesUsers();
        }
        break;
      case 'consistent':
        if (this.minLeavesUsers.length < this.totalMinLeaves) {
          this.fetchMinLeavesUsers();
        }
        break;
    }
  }
}
//  new


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
  this.getLeaveCategoryDetailsForLeaveTeamOverview();

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

  public grid: ApexGrid = { show: false, padding: { top: 0, right: 0, bottom: 0, left: 0 } };
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
    extendedMaxDate.setDate(extendedMaxDate.getDate() + 1);
    // extendedMaxDate.setDate(extendedMaxDate.getDate()); // Extend by 2 days for better visualization

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
  // topTwoLeaveDays: { date: string; count: number }[] = [];

  getReportDetailsForLeaveTeamOverviewForHeatMap(): void {
    this.leaveService.getReportDetailsForLeaveTeamOverview(this.startDate, this.endDate).subscribe({
      next: (response: any) => {
        const approvedLeaveCounts = response.object?.approvedLeaveCounts ?? [];
        this.initChartDataHeatMap(approvedLeaveCounts);
      },
      error: (err) => console.error('Error fetching leave data', err),
    });
  }


  topTwoLeaveDays: { date: string; count: number }[] = [];
topTwoLeaveDaysFormatted: string = '';

initChartDataHeatMap(approvedLeaveCounts: any[]): void {
  const dateMap = new Map<string, number>();
  approvedLeaveCounts.forEach(item => dateMap.set(item.date, item.totalCount));

  // Extract top two dates with most approved leaves
  const sortedDates = approvedLeaveCounts
    .filter(item => item.totalCount > 0)
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 2);

    this.topTwoLeaveDays = sortedDates;

    // Get the weekday names for the top two leave days
    const dayNames = sortedDates.map(day =>
      new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })
    );

    // Check if both days are the same; if yes, display one, otherwise join them
    this.topTwoLeaveDaysFormatted = dayNames.length === 1
      ? dayNames[0]
      : dayNames[0] === dayNames[1]
        ? dayNames[0]
        : dayNames.join(' & ');


  // Continue with heatmap chart setup...
  const seriesData: any[] = [];
  let currentDate = new Date(this.startDate);
  let weekIndex = 1;
  const end = new Date(this.endDate);

  while (currentDate <= end) {
    const weekStart = new Date(currentDate);
    const potentialWeekEnd = new Date(currentDate);
    potentialWeekEnd.setDate(weekStart.getDate() + 6);

    const weekEnd = potentialWeekEnd > end ? end : potentialWeekEnd;
    const weekData: any[] = [];

    for (let date = new Date(weekStart); date <= weekEnd; date.setDate(date.getDate() + 1)) {
      const formattedDate = date.toISOString().split('T')[0];
      const count = dateMap.get(formattedDate) ?? 0;
      weekData.push({ x: "Total Approved", y: count });
    }

    seriesData.push({
      name: `Week ${weekIndex}`,
      data: weekData,
    });

    weekIndex++;
    currentDate.setDate(weekEnd.getDate() + 1);
  }

  this.chartOptions = {
    series: seriesData,
    chart: { height: 350, type: 'heatmap', toolbar: { show: false } },
    stroke: { width: 1.5, colors: ['#ffffff'] },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.8,
        radius: 6,
        enableShades: true,
        colorScale: {
          min: 0,
          max: 365,
          ranges: [
            { from: 0, to: 0, color: "#f7fafa", name: "Very Low" },
            { from: 1, to: 4, color: "#9ccabe", name: "Low" },
            { from: 4, to: 8, color: "#478e7d", name: "Medium" },
            { from: 8, to: 100, color: "#185143", name: "High" }
          ]
        }
      },
    },
    dataLabels: { enabled: false },
    xaxis: { type: 'category', labels: { show: false } },
    yaxis: { title: { text: 'Weeks of the Month' } },
    grid: { padding: { left: 10, right: 10, top: 10, bottom: 10 } },
    tooltip: {
      y: { formatter: (val) => `${val} Leave(s)` },
      x: { formatter: (val) => `${val}` },
    },
    theme: { mode: 'light' },
    legend: { show: false },
  };
}


  // initChartDataHeatMap(approvedLeaveCounts: any[]): void {
  //   const dateMap = new Map<string, number>();
  //   approvedLeaveCounts.forEach(item => dateMap.set(item.date, item.totalCount));

  //   const start = new Date(this.startDate);
  //   const end = new Date(this.endDate);

  //   const seriesData: any[] = [];
  //   let currentDate = new Date(start);
  //   let weekIndex = 1;

  //   while (currentDate <= end) {
  //     const weekStart = new Date(currentDate);
  //     const potentialWeekEnd = new Date(currentDate);
  //     potentialWeekEnd.setDate(weekStart.getDate() + 6);  // Each week covers 7 days

  //     const weekEnd = potentialWeekEnd > end ? end : potentialWeekEnd;  // Handle last week ending

  //     const weekData: any[] = [];
  //     for (let date = new Date(weekStart); date <= weekEnd; date.setDate(date.getDate() + 1)) {
  //       const formattedDate = date.toISOString().split('T')[0];
  //       const count = dateMap.get(formattedDate) ?? 0;
  //       // weekData.push({ x: formattedDate, y: count });
  //       weekData.push({ x: "Total Approved", y: count });
  //     }

  //     // seriesData.push({
  //     //   name: `Week ${weekIndex} (${this.formatDateToDDMMM(weekStart)} - ${this.formatDateToDDMMM(weekEnd)})`,
  //     //   data: weekData,
  //     // });
  //     seriesData.push({
  //       name: `Week ${weekIndex}`,
  //       data: weekData,
  //     });


  //     weekIndex++;
  //     currentDate.setDate(weekEnd.getDate() + 1);  // Move to the next week's start
  //   }


  //   this.chartOptions = {
  //     series: seriesData,
  //     chart: { height: 350,
  //       type: 'heatmap',
  //       toolbar: {
  //       show: false,
  //       tools: { zoomin: false, zoomout: false, pan: false, reset: false },
  //     }
  //   },
  //     stroke: {
  //           width: 1.5,
  //           colors: ['#ffffff'],
  //     },
  //     plotOptions: {
  //       heatmap: {
  //         shadeIntensity: 0.8,
  //         radius: 6,
  //         useFillColorAsStroke: false,
  //         enableShades: true, // Enables automatic gradient
  //         colorScale: {
  //           min: 0,
  //           max: 365,
  //           ranges: [
  //             { from: 0, to: 5, color: "#D6EAF8", name: "Very Low" },
  //             { from: 6, to: 20, color: "#AED6F1", name: "Low" },
  //             { from: 21, to: 50, color: "#5DADE2", name: "Medium" },
  //             { from: 51, to: 100, color: "#2E86C1", name: "High" }
  //           ]
  //         }
  //       },
  //     },
  //     dataLabels: { enabled: false },
  //     xaxis: { type: 'category', labels: { show: false } },
  //     yaxis: { title: { text: 'Weeks of the Month' } },
  //     grid: {
  //           padding: { left: 10, right: 10, top: 10, bottom: 10 },
  //     },
  //     tooltip: {
  //       y: { formatter: (val) => `${val} Leave(s)` },
  //       x: { formatter: (val) => `${val}` },
  //     },
  //     theme: { mode: 'light' },
  //     legend: { show: false },

  //   };


  // }



  formatDateToDDMMM(date: Date): string {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  }



//  leave category details code
  leaveCategoryDetails: any;
  leaveCategoryDetailsLoader: boolean = false;
  getLeaveCategoryDetailsForLeaveTeamOverview(): void {
    this.leaveCategoryDetailsLoader = true;
    this.leaveService.getLeaveCategoryDetailsForLeaveTeamOverview(this.startDate, this.endDate).subscribe({
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
        height: 500, // ✅ Increased chart height
        toolbar: {
          show: false, // ✅ Removed hamburger menu (toolbar)
        },
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
        axisBorder: { show: false }, // ✅ Remove x-axis border
        axisTicks: { show: false },  // ✅ Remove x-axis ticks
        labels: { show: true },
      },
      yaxis: {
        title: { text: 'Teams' },
        axisBorder: { show: false }, // ✅ Remove y-axis border
        axisTicks: { show: false },  // ✅ Remove y-axis ticks
        labels: { show: true },
      },
      grid: {
        show: false, // ✅ Removed grid lines
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



routeToUserProfile(uuid: string) {
  this.helperService.routeToUserProfile(uuid);
}







}
