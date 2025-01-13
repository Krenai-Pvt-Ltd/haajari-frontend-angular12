import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {FormGroup} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Key } from 'src/app/constant/key';
import {PendingLeaveResponse,} from 'src/app/models/leave-responses.model';
import { UserDto } from 'src/app/models/user-dto.model';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { saveAs } from 'file-saver';
import { LeaveService } from 'src/app/services/leave.service';
import { finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css'],
})
export class LeaveManagementComponent implements OnInit {
  specificLeaveRequest!: PendingLeaveResponse;
  selectedTeamName: string = '';
  page = 0;
  size = 10;
  userLeaveForm!: FormGroup;
  initialLoadDone = false;
  @ViewChild('logContainer') logContainer!: ElementRef<HTMLDivElement>;
  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private firebaseStorage: AngularFireStorage,
    private rbacService: RoleBasedAccessControlService,
    public domSanitizer: DomSanitizer,
    private leaveService:LeaveService
  ) {}

  

  onError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = './assets/images/broken-image-icon.jpg';
  }

  logInUserUuid: string = '';
  ROLE: string | null |any = '';
  currentNewDate: any;
  currentDate: Date = new Date();

  async ngOnInit(): Promise<void> {
    window.scroll(0, 0);
    this.logInUserUuid = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    this.getLeaves(this.currentTab);
    this.getLeaves(this.ALL);
    this.getWeeklyChartData();
    this.getMonthlyChartData();
    this.getTotalConsumedLeaves();
    if (this.ROLE !== 'USER') {
      this.getTeamNames();
    }

    //TODO: uncomment
    this.getUserLeaveReq();
  }





  totalCountOfPendingCounts: number = 0;
  getTotalCountOfPendingLeaves() {
    this.dataService.getTotalCountsOfPendingLeaves().subscribe({
      next: (response) => {
        this.totalCountOfPendingCounts = response.object;
      },
      error: (error) => {
        // console.log(error);
      },
    });
  }


  

  @ViewChild('closeModal') closeModal!: ElementRef;
  approvedLoader: boolean = false;
  rejecetdLoader: boolean = false;

  rejectLeaveModalClose(){
    this.rejectLeaveToggle = false;
    this.rejectionReason = ''
  }

  rejectLeaveToggle: boolean = false;
  rejectLeave(){
    this.rejectLeaveToggle = !this.rejectLeaveToggle;

  }

  rejectionReason: string =''
  approveOrDeny(requestId: number, requestedString: string) {
    if (requestedString === 'approved') {
      this.approvedLoader = true;
    } else if (requestedString === 'rejected') {
      this.rejecetdLoader = true;
    }

    this.page = 0;
    this.selectedTeamName = '';

    this.dataService
      .approveOrRejectLeaveOfUser(requestId, requestedString, this.rejectionReason)
      .subscribe({
        next: (logs) => {
          // Turn off loaders
          this.approvedLoader = false;
          this.rejecetdLoader = false;
          this.rejectLeaveToggle = false;
          this.rejectionReason = ''

          // Fetch all necessary updated data
          this.fetchAllData();

          // Close modal
          this.closeModal.nativeElement.click();

          // Show toast message
          let message =
            requestedString === 'approved'
              ? 'Leave approved successfully!'
              : 'Leave rejected successfully!';
          this.helperService.showToast(message, Key.TOAST_STATUS_SUCCESS);
          this.getTotalCountOfPendingLeaves();
        },
        error: (error) => {
          console.error('There was an error!', error);
          this.approvedLoader = false;
          this.rejecetdLoader = false;
          this.helperService.showToast(
            'Error processing leave request!',
            Key.TOAST_STATUS_ERROR
          );
        },
      });
  }

  fetchAllData() {
    this.getTotalConsumedLeaves();
    this.getMonthlyChartData();
    this.getWeeklyChartData();
  }

  // approveOrDeny(requestId: number, requestedString: string) {
  //   debugger;

  //   if(requestedString === 'approved'){
  //     this.approvedLoader = true;
  //   }else if(requestedString === 'rejected'){
  //     this.rejecetdLoader = true;
  //   }

  //   this.page = 0;
  //   this.pagePendingLeaves = 0;
  //   this.pageApprovedRejected = 0;
  //   this.searchString = '';
  //   this.selectedTeamName = '';

  //   this.dataService.approveOrRejectLeaveOfUser(requestId, requestedString).subscribe({
  //     next: (logs) => {
  //       console.log('success!');
  //       this.approvedLoader = false;
  //       this.rejecetdLoader = false;
  //       this.getApprovedRejectedLeaveLogs();
  //       this.getFullLeaveLogs();
  //       this.getPendingLeaves();
  //       this.getTotalConsumedLeaves();
  //       this.getMonthlyChartData();
  //       this.getWeeklyChartData();
  //       this.closeModal.nativeElement.click();
  //       let message = requestedString === 'approved' ? "Leave approved successfully!" : "Leave rejected successfully!";
  //       this.helperService.showToast(message, Key.TOAST_STATUS_SUCCESS);
  //     },
  //     error: (error) => {
  //       this.approvedLoader = false;
  //       this.rejecetdLoader = false;
  //       console.error('There was an error!', error);
  //       this.helperService.showToast("Error processing leave request!", Key.TOAST_STATUS_ERROR);
  //     }
  //   });
  // }

  getPendingLeave(leaveId: number, leaveType: string) {
    this.dataService
      .getRequestedUserLeaveByLeaveIdAndLeaveType(leaveId, leaveType)
      .subscribe({
        next: (response) => (this.specificLeaveRequest = response.object),
        error: (error) => {
          console.error('Failed to fetch pending leave:', error);
          this.helperService.showToast(
            'Failed to load this pending leave.',
            Key.TOAST_STATUS_ERROR
          );
        },
      });
  }

  getPendingLeave1(leaveId: number, leaveType: string) {
    this.dataService
      .getRequestedUserLeaveByLeaveIdAndLeaveType(leaveId, leaveType).subscribe((res: any)  => {
        if(res.status){
          this.specificLeaveRequest = res.object;
        }
      })
  }

  teamNameList: UserTeamDetailsReflection[] = [];

  teamId: number = 0;
  getTeamNames() {
    debugger;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.teamNameList = response.object;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
      },
    });
  }

  sliceWord(word: string): string {
    return word.slice(0, 3);
  }

  weeklyChartData: any[] = [];
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal, // Correct type for the group property
    domain: ['#FFE082', '#80CBC4', '#FFCCBC'], // Gold, Green, Red
  };
  gradient: boolean = false;
  view: [number, number] = [300, 250];
  weeklyPlaceholderFlag: boolean = true;
  getWeeklyChartData() {
    this.dataService.getWeeklyLeaveSummary().subscribe((data) => {
      this.weeklyChartData = data.map((item) => ({
        name: this.sliceWord(item.weekDay),
        series: [
          { name: 'Pending', value: item.pending || 0 },
          { name: 'Approved', value: item.approved || 0 },
          { name: 'Rejected', value: item.rejected || 0 },
        ],
      }));
    });
  }

  monthlyChartData: any[] = [];
  count: number = 0;
  monthlyPlaceholderFlag: boolean = true;
  getMonthlyChartData() {
    this.dataService.getMonthlyLeaveSummary().subscribe((data) => {
      this.monthlyChartData = data.map((item) => ({
        name: this.sliceWord(item.monthName),
        series: [
          { name: 'Pending', value: item.pending || 0 },
          { name: 'Approved', value: item.approved || 0 },
          { name: 'Rejected', value: item.rejected || 0 },
        ],
        // this.count++;
      }));
    });
  }

  consumedLeaveData: any[] = [];
  views: [number, number] = [300, 200];

  showXAxis = true;
  showYAxis = true;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Count';
  showYAxisLabel = true;
  yAxisLabel = 'Type';

  colorSchemeConsumed: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#B3E5FC', '#E8F5E9'],
  };

  consumedLeaveArray: any[] = [];
  dataReady: boolean = false;
  consumedLeavesPlaceholderFlag: boolean = true;
  getTotalConsumedLeaves() {
    this.dataService.getConsumedLeaves().subscribe((data) => {
      this.consumedLeaveArray = data;
      this.consumedLeaveData = data.map((item) => ({
        name: this.getLeaveInitials(item.leaveType),
        series: [
          { name: 'Used', value: item.consumedCount || 0 },
          { name: 'Remaining', value: item.remainingCount || 0 },
        ],
      }));
      this.dataReady = true;
    });
  }

  getLeaveInitials(leaveType: string): string {
    const words = leaveType.split(' ');
    if (words.length >= 2) {
      return words[0].charAt(0) + words[1].charAt(0);
    }
    return leaveType;
  }

  managers: UserDto[] = [];
  selectedManagerId!: number;

  fetchManagerNames() {
    this.dataService.getEmployeeManagerDetailsLeaveManagemnt().subscribe(
      (data: UserDto[]) => {
        this.managers = data;
      },
      (error) => {}
    );
  }

  userLeave: any = [];
  leaveCountPlaceholderFlag: boolean = false;

  getUserLeaveReq() {
    this.leaveCountPlaceholderFlag = false;
    this.dataService.getUserLeaveRequestsForLeaveManagement().subscribe(
      (data) => {
        if (
          data.body != undefined ||
          data.body != null ||
          data.body.length != 0
        ) {
          this.userLeave = data.body;
        } else {
          this.leaveCountPlaceholderFlag = true;
          return;
        }
      },
      (error) => {}
    );
  }

  
  downloadSingleImage(imageUrl: any) {
    if (!imageUrl) {
      return;
    }

    var blob = null;
    var splittedUrl = imageUrl.split(
      '/firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/'
    );

    if (splittedUrl.length < 2) {
      return;
    }

    splittedUrl = splittedUrl[1].split('?alt');
    splittedUrl = splittedUrl[0].replace('https://', '');
    splittedUrl = decodeURIComponent(splittedUrl);

    this.firebaseStorage.storage
      .ref(splittedUrl)
      .getDownloadURL()
      .then((url: any) => {
        // This can be downloaded directly:
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          blob = xhr.response;
          saveAs(blob, 'Docs');
        };
        xhr.open('GET', url);
        xhr.send();
      })
      .catch((error: any) => {
        // Handle any errors
      });
  }

  routeToUserProfile(uuid: string) {
    this.helperService.routeToUserProfile(uuid);
  }
  routeToUserProfileAfterClosePending(uuid: string) {
    this.closeModal.nativeElement.click();
    this.helperService.routeToUserProfile(uuid);
  }

  /****************************************************************************************************************************************************************
   *  GET LEAVES UPDATED METHODS START
   ****************************************************************************************************************************************************************/
  // Store leaves for each tab
  leaves:any = { pending: [], history: [], all: [] };  
  // Track the total number of items for each tab
  totalItems:any = { pending: 0, history: 0, all: 0 };  
  // Track current page number for each tab
  pageNumber:any  = { pending: 1, history: 1, all: 1 };
  // Loading state for each tab
  isLoadingLeaves:any  = { pending: false, history: false, all: false };
  itemPerPage: number = 5;
  APPROVED: string = 'approved';
  PENDING: string = 'pending';
  REJECTED: string = 'rejected';
  HISTORY: string = 'history';
  REQUESTED: string = 'requested';
  ALL: string = 'all';
  // status:string[]= [this.PENDING];
  currentTab =this.PENDING; 
  // Search term for filtering
  searchTerm = ''; 

  // Method to call when switching tabs
  onTabChange(tab: string,isLoadMore = false) {
    debugger
    this.currentTab = tab;
    this.setStatus(tab);
    if ((this.leaves[tab] && !this.leaves[tab].length) || isLoadMore) {
      this.getLeaves(tab); // Only load data if not already loaded
    }
  }
  
  setStatus(tab:string):string[] {
    var status:string[] = [];
    switch (tab) {

      case this.PENDING:{
        status = [this.PENDING];
        break;
      }
      case this.HISTORY:{ 
        status = [this.APPROVED,this.REJECTED];
        break;
      }
      case this.ALL:{
        status= [this.PENDING,this.APPROVED,this.REJECTED,this.REQUESTED];
        break;
      }
    }
    return status;
  }

  getLeaves(tab: string,resetSearch = false) {
    debugger
    if(resetSearch){
      this.resetSearch();
    }
    var status = this.setStatus(tab);
    this.isLoadingLeaves[tab] = true;
  this.leaveService
  .get({ status: status ,itemPerPage: this.itemPerPage, currentPage: this.pageNumber[this.currentTab],search: this.searchTerm })
  .pipe(
    tap((response) => {
      if (Array.isArray(response.object)) {
        // Store data for each tab
      this.leaves[tab] = [...this.leaves[tab], ...response.object];
      this.totalItems[tab] = response.totalItems; // Update total count for the status
      } 
      
    }),
    finalize(() => {
      this.isLoadingLeaves[tab] = false;
    })
  )
  .subscribe({
    next: () => {
      // Subscription for side effects only
      console.log('Pending leaves loaded successfully.');
    },
    error: (error) => {
      console.log("🚀 ~ LeaveManagementComponent ~ getLeaves ~ error:", error)
      this.helperService.showToast(
        'Failed to load pending leaves.',
        Key.TOAST_STATUS_ERROR
      );
    },
  });
    
  }


  loadMoreLeaves(tab: string) {
    this.currentTab=tab;
    this.isLoadingLeaves[tab] = true;
    this.pageNumber[tab]++;
    this.onTabChange(tab,true);
  }
  resetSearch(){
    this.searchTerm = ''; // Reset search term if flag is set
    this.pageNumber[this.ALL] = 1; // Reset page number for the active tab
    this.leaves[this.ALL] = [];
  }

  searchLeaves(tab: string) {
    this.currentTab=tab;
    this.leaves[tab]=[]; 
    this.getLeaves(tab);
  }
}


