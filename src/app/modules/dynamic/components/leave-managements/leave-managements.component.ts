import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { LeaveService } from 'src/app/services/leave.service';
import { finalize, tap } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { LeaveResponse, PendingLeaveResponse } from 'src/app/models/leave-responses.model';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import moment from 'moment';  // Import Moment.js

@Component({
  selector: 'app-leave-managements',
  templateUrl: './leave-managements.component.html',
  styleUrls: ['./leave-managements.component.css']
})
export class LeaveManagementsComponent implements OnInit {

  constructor(private leaveService:LeaveService,private helperService: HelperService,    private rbacService: RoleBasedAccessControlService
  ) { }
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

  showCalender:boolean = false;
  openCloseMonthCalender(){
    this.showCalender = !this.showCalender;
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
  ALL: string = 'all';
  isLoadingLeaves:boolean = false;
  itemPerPage: number = 10;
  currentPage:number = 1;
  searchTerm:string = '';
  leaves:any=[];
  totalItems:number = 0;
  statusMaster: string[] = ['ALL',this.PENDING,this.APPROVED,this.REJECTED,this.REQUESTED];
  status= this.statusMaster;
  ROLE: string | null |any = '';

   getLeaves(resetSearch = false,applyDateRange = false){ 
      debugger
      if(resetSearch){
        this.resetSearch();
      }
    
      this.isLoadingLeaves = true;
      var uuid=null;
      var params= null;
      if(applyDateRange){
        params={ status: this.status ,itemPerPage: this.itemPerPage, currentPage: this.currentPage,search: this.searchTerm,
          startDate: moment(this.filters.fromDate).format(this.networkDateFormat),endDate: moment(this.filters.toDate).format(this.networkDateFormat),leaveType: this.filters.leaveType};
           
      }else{
        params={ status: this.status ,itemPerPage: this.itemPerPage, currentPage: this.currentPage,search: this.searchTerm,
          leaveType: this.filters.leaveType};
         
      }
  
     
    this.leaveService
    .get(params)
    .pipe(
      tap((response:any) => {
        if (Array.isArray(response.object)) {
          // Store data for each tab
        this.leaves = response.object;
        this.totalItems = response.totalItems; // Update total count for the status
        } else{
          this.leaves = [];
          this.totalItems = 0;
        }
        
      }),
      finalize(() => {
        this.isLoadingLeaves = false;
      })
    )
    .subscribe({
      next: () => {
        // Subscription for side effects only
        // console.log('Pending leaves loaded successfully.');
      },
      error: (error) => {
        this.helperService.showToast(
          'Failed to load leaves.',
          Key.TOAST_STATUS_ERROR
        );
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
  this.currentPage = page;
  this.getLeaves();
}

resetSearch(){
  this.searchTerm = ''; // Reset search term if flag is set
  this.currentPage = 1; 
  this.leaves= [];
}
searchLeaves() {
  this.resetValues();
  this.getLeaves();
}
resetValues(){
  this.leaves=[]; 
  this.totalItems = 0;
  this.currentPage= 1;
}

searchTermChanged(event: any) {
  this.searchTerm = event.target.value;
  this.searchTerm.trim().length === 0 ? this.resetSearch() :this.getLeaves();
}

/**
 * HANDLING FILTERS
 */
leaveTypes = ['ALL','Earned Leave', 'Sick Leave', 'Casual Leave']; // Example options

  badgesList:[]=[];
filters:{
  fromDate: any|undefined;
  toDate: any|undefined;
  leaveType: string;
  status: string
}  = {
  leaveType: 'All', // Default value
  status: 'All' // Default value
  ,
  fromDate: undefined,
  toDate: undefined
};
resetFilters() {
  this.filters= {
    fromDate: undefined,
    toDate: undefined,
    leaveType: 'All',
    status: 'All'
  };
  this.changeShowFilter(false);
  this.appliedFilters = [];
}
appliedFilters: { key: string; value: string|null|undefined }[] = [];

displayDateFormat: string = 'DD-MM-YYYY'; // Date format for date picker
networkDateFormat: string = "yyyy-MM-DD HH:mm:ss";
applyFilters() {
  this.appliedFilters = [];


  if (this.filters.leaveType) {
    this.appliedFilters.push({ key: 'Leave Type', value: this.filters.leaveType });
  }
  if (this.filters.status) {
    this.appliedFilters.push({ key: 'status', value: this.filters.status });
    if(this.filters.status==='ALL'){
      this.status = this.statusMaster;;
    }else{
      this.status =[ this.filters.status];
    }
  }
  if(this.filters.fromDate && this.filters.toDate){ 
    
    var fromDate= moment(this.filters.fromDate).format(this.displayDateFormat);
    var toDate= moment(this.filters.toDate).format(this.displayDateFormat);
   
    var value= fromDate +" to "+ toDate;
    this.appliedFilters.push({ key: 'Date', value: value});
  }

  this.changeShowFilter(false);
  this.getLeaves(false);
}
// Disable dates greater than 'fromDate' for the 'toDate' field
disabledDateTo = (current: Date): boolean => {
  return current && this.filters.fromDate && current <= this.filters.fromDate;
};

// Disable dates earlier than 'toDate' for the 'fromDate' field (if needed)
disabledDateFrom = (current: Date): boolean => {
  return current && this.filters.toDate && current >= this.filters.toDate;
};
removeFilter(filterKey: string) {
  this.appliedFilters = this.appliedFilters.filter(f => f.key !== filterKey);
  (this.filters as any)[filterKey] = '';
}

}
