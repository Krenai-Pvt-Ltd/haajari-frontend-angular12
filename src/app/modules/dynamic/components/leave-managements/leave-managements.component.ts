import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { LeaveService } from 'src/app/services/leave.service';
import { finalize, tap } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { LeaveResponse, PendingLeaveResponse } from 'src/app/models/leave-responses.model';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import moment from 'moment';  // Import Moment.js
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-leave-managements',
  templateUrl: './leave-managements.component.html',
  styleUrls: ['./leave-managements.component.css']
})
export class LeaveManagementsComponent implements OnInit {

  constructor(private leaveService:LeaveService,private helperService: HelperService,    private rbacService: RoleBasedAccessControlService,private datePipe: DatePipe
  ,private cdr: ChangeDetectorRef) { }
  showFilter: boolean = false;
  logInUserUuid: string = '';

  async ngOnInit() {
    this.logInUserUuid = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    this.getLeaves(false,false);
  }


  tab: string = 'absent';
  switchTab(tab: string) {
    this.tab = tab
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
  
    this.filters.leaveType = this.filters.leaveType.map((type: any) => typeof type === 'string' ? type : type.value);
    this.filters.status = this.filters.status.map((status: any) => typeof status === 'string' ? status : status.value);
  
    const params: any = {
      status: this.filters.status.length ? this.filters.status.join(',') : undefined,      // Convert to comma-separated string
      leaveType: this.filters.leaveType.length ? this.filters.leaveType.join(',') : undefined, // Convert to comma-separated string
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
      viewLeave(leave:any){
        this.leave = leave;
      
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
// resetFilters() {
//   this.filters= {
//     fromDate: undefined,
//     toDate: undefined,
//     leaveType: [],
//     status: []
//   };
//   this.changeShowFilter(false);
//   this.appliedFilters = [];
// }
// appliedFilters: { key: string; value: string|null|undefined }[] = [];

displayDateFormat: string = 'DD-MM-YYYY'; // Date format for date picker
networkDateFormat: string = "yyyy-MM-DD HH:mm:ss";
// applyFilters() {
//   this.appliedFilters = [];


//   if (this.filters.leaveType) {
//     // this.appliedFilters.push({ key: 'Leave Type', value: this.filters.leaveType });
//   }
//   if (this.filters.status) {
//     // this.appliedFilters.push({ key: 'status', value: this.filters.status });
//     if(this.filters.status.length === 0){
//       this.status = this.statusMaster;
//     }else{
//       this.status =this.filters.status;
//     }
//   }
//   if(this.filters.fromDate && this.filters.toDate){ 
    
//     var fromDate= moment(this.filters.fromDate).format(this.displayDateFormat);
//     var toDate= moment(this.filters.toDate).format(this.displayDateFormat);
   
//     var value= fromDate +" to "+ toDate;
//     this.appliedFilters.push({ key: 'Date', value: value});
//   }

//   this.changeShowFilter(false);
//   this.getLeaves(false);
// }
// Disable dates greater than 'fromDate' for the 'toDate' field
disabledDateTo = (current: Date): boolean => {
  return current && this.filters.fromDate && current <= this.filters.fromDate;
};

// Disable dates earlier than 'toDate' for the 'fromDate' field (if needed)
disabledDateFrom = (current: Date): boolean => {
  return current && this.filters.toDate && current >= this.filters.toDate;
};
// removeFilter(filterKey: string) {
//   this.appliedFilters = this.appliedFilters.filter(f => f.key !== filterKey);
//   (this.filters as any)[filterKey] = '';
// }


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
  this.getLeaves(); // Fetch data with applied filters
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





}
