import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { LeaveService } from 'src/app/services/leave.service';
import { finalize, tap } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { LeaveResponse, PendingLeaveResponse } from 'src/app/models/leave-responses.model';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

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
    this.getLeaves();
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
  status= [this.PENDING,this.APPROVED,this.REJECTED,this.REQUESTED];
  ROLE: string | null |any = '';

   getLeaves(resetSearch = false) {
      debugger
      // if(resetSearch){
      //   this.resetSearch();
      // }
    
      this.isLoadingLeaves = true;
      var uuid=null;
      var params= null;
      
  params={ status: this.status ,itemPerPage: this.itemPerPage, currentPage: this.currentPage,search: this.searchTerm };
     
     
    this.leaveService
    .get(params)
    .pipe(
      tap((response:any) => {
        if (Array.isArray(response.object)) {
          // Store data for each tab
        this.leaves = response.object;
        this.totalItems = response.totalItems; // Update total count for the status
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
}
