import { ChangeDetectorRef, Component,ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
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

  constructor(private dataService: DataService, private rbacService: RoleBasedAccessControlService,private cdr: ChangeDetectorRef, private helperService: HelperService, private renderer: Renderer2) { }

  logInUserUuid: string = '';
  ROLE: string | null = '';

  async ngOnInit(): Promise<void> {
    this.logInUserUuid = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    this.getEmployeesLeaveDetails();
    // this.userLeaveDetailResponse.forEach((_, index) => {
    //   this.shouldShowRightScroll[index] = true;
    //   this.shouldShowLeftScroll[index] = false;
    // });

  }

  ngAfterViewInit(): void {
    this.checkArrowsVisibility();
  }

  checkArrowsVisibility(): void {
    this.cdr.detectChanges();
    
    if((this.userLeaveDetailResponse!=undefined)){
    setTimeout(() => {
      this.userLeaveDetailResponse.forEach((_, index) => {
        this.checkInitialArrowVisibility(index);
      });
    });
    }
  }
  checkInitialArrowVisibility(index: number): void {
    const element = this.scrollContainers.toArray()[index]?.nativeElement;
    if (element) {
      this.shouldShowRightScroll[index] = element.scrollWidth > element.clientWidth;
      this.shouldShowLeftScroll[index] = false;
    }
  }
  


  searchString: string = '';
  searchStatus: string = '';
  pageNumber: number = 1;
  itemPerPage: number = 5;
  total: number = 0;
  totalPages: number = 0;
  isShimmer: boolean = false;


  isLeaveManagementShimmerFlag:boolean = false;
  isPlaceholderFlag:boolean=false;
  isErrorFlag:boolean=false;
  userLeaveDetailResponse!: UserLeaveDetailsWrapper[];
  getEmployeesLeaveDetails() {
    this.isLeaveManagementShimmerFlag=true;
    this.dataService.getLeavesDetailsOfEmployees(this.searchString, this.searchStatus, this.pageNumber, this.itemPerPage).subscribe((data) => {
      this.userLeaveDetailResponse = data.userLeaveDetails;
      this.total = data.totalCount;
      if(this.total==0){
        this.isPlaceholderFlag=true;
      }else{
        this.isPlaceholderFlag=false;
      }
      this.isLeaveManagementShimmerFlag=false;
      this.totalPages = Math.ceil(this.total / this.itemPerPage);
      this.isShimmer = false;
      console.log(this.userLeaveDetailResponse);
    },
      (error) => {
        this.isLeaveManagementShimmerFlag=false;
        this.isErrorFlag=true;
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
      this.isLeaveManagementShimmerFlag=true;
      this.resetfilterLeaves();
      this.getEmployeesLeaveDetails();

    }
  }

  emptySearch(){
    this.searchString = '';
    this.isPlaceholderFlag=false;
    this.isErrorFlag=false;
    this.isLeaveManagementShimmerFlag=true;
    this.getEmployeesLeaveDetails();
    this.resetfilterLeaves()
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

  @ViewChildren('scrollContainer') private scrollContainers!: QueryList<ElementRef>;
  shouldShowRightScroll: boolean[] = [];
  shouldShowLeftScroll: boolean[] = [];


  scrollRight(index: number): void {
    const element = this.scrollContainers.toArray()[index].nativeElement;
    element.scrollBy({ left: 200, behavior: 'smooth' }); // Adjust scroll amount as necessary
  }

  scrollLeft(index: number): void {
    const element = this.scrollContainers.toArray()[index].nativeElement;
    element.scrollBy({ left: -200, behavior: 'smooth' }); // Adjust scroll amount as necessary
  }

  checkScroll(event: any, index: number): void {
    const element = event.target;
    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    if (element.scrollLeft >= maxScrollLeft) {
      this.shouldShowRightScroll[index] = false;
    } else {
      this.shouldShowRightScroll[index] = true;
    }

    if (element.scrollLeft > 0) {
      this.shouldShowLeftScroll[index] = true;
    } else {
      this.shouldShowLeftScroll[index] = false;
    }
  }

}
