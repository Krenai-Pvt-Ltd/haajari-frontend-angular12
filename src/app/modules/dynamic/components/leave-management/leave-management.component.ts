import { Component, OnInit } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { UserLeaveDetailsWrapper } from 'src/app/models/UserLeaveDetailsWrapper';
import { TotalRequestedLeavesReflection } from 'src/app/models/totalRequestedLeaveReflection';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

interface UserLeaveLogs {
  [uuid: string]: TotalRequestedLeavesReflection[];
}

@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css']
})
export class LeaveManagementComponent implements OnInit {

  userLeaveLogs: UserLeaveLogs = {};
  currentlyOpenUserUuid: string | null = null;

  constructor(private dataService: DataService, private rbacService: RoleBasedAccessControlService, private helperService: HelperService) { }

  logInUserUuid: string = '';
  ROLE: string | null = '';

  async ngOnInit(): Promise<void> {
    this.logInUserUuid = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    this.getEmployeesLeaveDetails();
  }


  searchString: string = '';
  searchStatus: string = '';
  pageNumber: number = 1;
  itemPerPage: number = 5;
  total: number = 0;
  totalPages: number = 0;
  isShimmer: boolean = false;


  userLeaveDetailResponse!: UserLeaveDetailsWrapper[];
  getEmployeesLeaveDetails() {
    this.dataService.getLeavesDetailsOfEmployees(this.searchString, this.searchStatus, this.pageNumber, this.itemPerPage).subscribe((data) => {
      this.userLeaveDetailResponse = data.userLeaveDetails;
      this.total = data.totalCount;
      this.totalPages = Math.ceil(this.total / this.itemPerPage);
      this.isShimmer = false;
      console.log(this.userLeaveDetailResponse);
    },
      (error) => {
        console.error('There was an error!', error);
      }
    );
  }

  resetfilterLeaves() {
    this.itemPerPage = 5;
    this.pageNumber = 1;
  }
  filterLeaves(searchString: string) {
    if (this.searchString) {
      this.resetfilterLeaves();
      this.getEmployeesLeaveDetails();
    } else {
      this.searchString = '';
      this.getEmployeesLeaveDetails();
    }
  }


  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: any): void {
    if (page === 'prev') {
      this.pageNumber = Math.max(1, this.pageNumber - 1);
    } else if (page === 'next') {
      this.pageNumber = Math.min(this.totalPages, this.pageNumber + 1);
    } else {
      this.pageNumber = page;
    }
    this.getEmployeesLeaveDetails();
  }

  getStartIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.itemPerPage - 1, this.total);
  }


  leavesLogs: TotalRequestedLeavesReflection[] = [];
  currentUserId: string | null = null;

  // getRequestedLeaveLogs(userUuid:string) {
  //   debugger
  //   this.currentUserId = userUuid;
  //   this.dataService.getRequestedLeaveDetailsForUser(userUuid).subscribe((data) => {
  //       this.leavesLogs = data;
  //       console.log(this.leavesLogs);
  //     },
  //     (error) => {
  //       console.error('There was an error!', error);
  //     }
  //   );
  // }

  getRequestedLeaveLogs(userUuid: string): void {
    if (!this.userLeaveLogs[userUuid]) {
      this.dataService.getRequestedLeaveDetailsForUser(userUuid).subscribe(logs => {
        this.userLeaveLogs[userUuid] = logs;
        this.currentlyOpenUserUuid = userUuid;
      });
    } else {
      this.currentlyOpenUserUuid = this.currentlyOpenUserUuid === userUuid ? null : userUuid;
    }
  }

  // isRequestedLeaveManagerFlag: boolean=false;

  // getManager(userUuid:string){
  //   if(this.logInUserUuid==userUuid){
  //     this.isRequestedLeaveManagerFlag=true;
  //   }else{
  //     this.isRequestedLeaveManagerFlag=false;
  //   }
  // }

  approveOrDeny(requestId: number, requestedString: string) {
    debugger
    this.dataService.approveOrRejectLeave(requestId, requestedString, this.logInUserUuid).subscribe(logs => {
      console.log('success!');
      this.getEmployeesLeaveDetails();
      if (requestedString == 'approved') {
        this.helperService.showToast("Leave approved successfully!", Key.TOAST_STATUS_SUCCESS);
      } else if (requestedString == 'rejected') {
        this.helperService.showToast("Leave rejected successfully!", Key.TOAST_STATUS_SUCCESS);
      }
    }, (error) => {
      console.error('There was an error!', error);
      this.helperService.showToast("Error!", Key.TOAST_STATUS_ERROR);
    });
  }

}
