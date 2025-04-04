import { constant } from 'src/app/constant/constant';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, ChangeDetectorRef } from '@angular/core';
import {  NgForm } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { BehaviorSubject, Subject } from 'rxjs';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { EmployeeOnboardingDataDto } from 'src/app/models/employee-onboarding-data-dto';
import { OrganizationShift } from 'src/app/models/shift-type';
import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { UserReq } from 'src/app/models/userReq';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';
import moment from 'moment';
import { LeaveSettingComponent } from 'src/app/modules/setting/components/leave-setting/leave-setting.component';
import { AttendanceSettingComponent } from 'src/app/modules/setting/components/attendance-setting/attendance-setting.component';
import { TeamComponent } from '../team/team.component';
import { UserResignation } from 'src/app/models/UserResignation';
import { OnboardUser } from 'src/app/models/OnboardUser';
import { debounceTime } from 'rxjs/operators';
import { ModalService } from 'src/app/services/modal.service';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexLegend,
  ApexPlotOptions,
  ApexGrid,
} from "ng-apexcharts";
import { Routes } from 'src/app/constant/Routes';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from '@angular/fire/compat/database';

export interface Team {
  label: string;
  value: string;
}
export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
  legends:ApexLegend
};


@Component({
  selector: 'app-employee-onboarding-data',
  templateUrl: './employee-onboarding-data.component.html',
  styleUrls: ['./employee-onboarding-data.component.css'],
})
export class EmployeeOnboardingDataComponent implements OnInit {

  verificationCount: any = {};
  // public chartOptions: ChartOptions = {
  //   series: [],
  //   chart: {
  //     type: "donut" as ChartType,
  //     width: 280,
  //   },
  //   labels: [],
  //   responsive: [
  //     {
  //       breakpoint: 480,
  //       options: {
  //         chart: {
  //           width: 100
  //         },
  //         legend: {
  //           position: "bottom"
  //         }
  //       }
  //     }
  //   ]
  // };

  // @ViewChild("chart") chart!: ChartComponent;

  public chartOptions: Partial<ChartOptions> | any = {
    series: [0, 0, 0, 0, 0],
    chart: {
      width: "100%",
      type: "donut"
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        expandOnClick: false,
        offsetY: 0, // Prevents segments from expanding
        donut: {
          labels: {
            show: false // Hide labels inside the donut
          },
          innerWidth: "90%",
          outerWidth: "32%"
        }
      }
    },
    // Hide data labels
    dataLabels: {
      enabled: false
    },
    // Hide grid lines (optional)
    grid: {
      show: false,
      padding: {
        bottom: -80
      },
      stroke: {
        width: 2, // Adjust this value as needed
        colors: "#000"
      }
    },
    // Hide the legend
    legend: {
      show: false
    },
    // Hide tooltip (optional)
    tooltip: {
      enabled: true
    }
  };

  @ViewChild('inviteModal') inviteModal!: ElementRef;
  @ViewChild('closeInviteModal') closeInviteModal!: ElementRef;
  @ViewChild('personalInformationForm') personalInformationForm!: NgForm;
  userPersonalInformationRequest: UserPersonalInformationRequest =
    new UserPersonalInformationRequest();

  @ViewChild('importModalOpen') importModalOpen!: ElementRef;

    readonly Routes = Routes;
    readonly Constants = constant;
  constructor(
    private dataService: DataService,
    private _onboardingService: OrganizationOnboardingService,
    private db: AngularFireDatabase,
    private router: Router,
    private helperService: HelperService,
    private ngbModal: NgbModal,
    private _subscriptionService:SubscriptionPlanService,
     public rbacService: RoleBasedAccessControlService,
     private cdr: ChangeDetectorRef,

  ) {}
  // users: EmployeeOnboardingDataDto[] = [];
  users: EmployeeOnboardingDataDto[] = new Array();
  filteredUsers: Users[] = [];
  itemPerPage: number = 12;
  pageNumber: number = 1;
  total!: number;
  rowNumber: number = 1;
  sampleFileUrl: string = '';
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  userList: UserReq[] = new Array();
  showFilter: boolean = false;

  currentPage: number = 1;
  pageSize: number = 7; // Adjust based on your requirements
  totalPage: number = 0;

  onPageChange(page: number) {
    this.bulkShift=null;
    this.bulkLeave=[];
    this.bulkTeam=[];
    this.selectAllCurrentPage=false;
    this.currentPage = page;
  }
  get paginatedData() {
    let start = (this.currentPage - 1) * this.pageSize;
    start=start+1;
    return this.data.slice(start, start + this.pageSize);
  }

  pendingResponse = 'PENDING';
  approvedResponse = 'APPROVED';
  rejectedResponse = 'REJECTED';
  requestedResponse = 'REQUESTED';
  newUserResponse = 'NEW_USER';

  searchCriteria: string = '';

  searchOptions: string[] = ['PENDING', 'APPROVED', 'REJECTED'];

  routeToUserDetails(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
  }


  routeToAddUserInShift() {
    window.open(this.router.serializeUrl(this.router.createUrlTree([Key.ATTENDANCE_SETTING_ROUTE])), '_blank');
  }

  routeToAddUserInLeavePolicy() {
    this.router.navigate([Key.LEAVE_SETTING_ROUTE]);

  }

  searchChange$ = new BehaviorSubject('');
  optionList: string[] = [];
  selectedUser?: string;
  isLoading = false;

  ngOnInit(): void {
    window.scroll(0, 0);
    this.sampleFileUrl ="assets/samples/HajiriBulkSheet.xlsx"
    this.getUsersCountByStatus();
    this.getEmployeesOnboardingStatus();
    this.getUsersByFiltersFunction();
    this.getTeamNames();
    this.getLeaveNames();
    this.getUser();
    this.selectMethod('mannual');
    this.getShiftData();
    this.getOnboardingVia();
    this.getUploadStatusFromFirebase(this.rbacService.getOrgRefUUID());
    this.dataService.onNotification().subscribe(() => {
      this.getShiftData();
    });

    firebase.initializeApp(environment.firebase);
    const storedDownloadUrl = localStorage.getItem('downloadUrl');

    if (storedDownloadUrl) {
      this.downloadingFlag = true;
      this.downloadFileFromUrl(storedDownloadUrl);
    }
    this._subscriptionService.isSubscriptionPlanExpired();

    this.searchSubject.pipe(debounceTime(1000)).subscribe((resignationSearch) => {
          this.loadResignations();
        });
  }


  isUserShimer: boolean = true;
  placeholder: boolean = false;
  errorToggleTop: boolean = false;
  isMainPlaceholder: boolean = false;
  debounceTimer: any;
  isResignationUser: number = 0;
  selectedFilters: string[] = []; // Stores selected filters

  statusOptionsNew: string[] = ['APPROVED', 'PENDING', 'REJECTED', 'REQUESTED'];
  accessibilityOptions: string[] = ['ACTIVE', 'INACTIVE'];

  selectedStatusFilters: string[] = ['ALL']; // All selected by default
  selectedAccessibilityFilters: string[] = ['ACTIVE']; // All selected by default

  // Toggle status filters
  toggleStatus(status: string) {
    debugger
    if (status === 'ALL') {
      this.selectedStatusFilters = this.selectedStatusFilters.includes('ALL') ? [] : ['ALL', ...this.statusOptionsNew];
    } else {
      this.selectedStatusFilters = this.selectedStatusFilters.filter(s => s !== 'ALL');

      if (this.selectedStatusFilters.includes(status)) {
        this.selectedStatusFilters = this.selectedStatusFilters.filter(s => s !== status);
      } else {
        this.selectedStatusFilters.push(status);
        this.selectedAccessibilityFilters.push(status);
      }

      if (this.statusOptionsNew.every(s => this.selectedStatusFilters.includes(s))) {
        this.selectedStatusFilters = ['ALL', ...this.statusOptionsNew];
      }
    }
  }

  toggleStatusFilter(status: string) {
    this.selectedStatusFilters = [];
    this.pageNumber = 1;
    this.selectedAccessibilityFilters = ['ACTIVE'];
    this.toggleStatus(status);
    this.getUsersByFiltersFunction();
  }

  // Toggle accessibility filters
  toggleAccessibility(accessibility: string) {
    if (accessibility === 'ALL') {
      this.selectedAccessibilityFilters = this.selectedAccessibilityFilters.includes('ALL') ? [] : ['ALL', ...this.accessibilityOptions];
    } else {
      this.selectedAccessibilityFilters = this.selectedAccessibilityFilters.filter(a => a !== 'ALL');
      if (this.selectedAccessibilityFilters.includes(accessibility)) {
        this.selectedAccessibilityFilters = this.selectedAccessibilityFilters.filter(a => a !== accessibility);
      } else {
        this.selectedAccessibilityFilters.push(accessibility);
      }
      if (this.accessibilityOptions.every(a => this.selectedAccessibilityFilters.includes(a))) {
        this.selectedAccessibilityFilters = ['ALL', ...this.accessibilityOptions];
      }
    }
  }


removeFilter(filter: string) {
  debugger;
  this.appliedFilters = this.appliedFilters.filter(f => f !== filter);

  // Extract raw value from "Status: Approved" → "Approved"
  const filterValue = filter.split(": ")[1];

  // Remove from Status Filters
  if (this.selectedStatusFilters.includes(filterValue)) {
    this.selectedStatusFilters = this.selectedStatusFilters.filter(s => s !== filterValue);
  }

  // Remove from Accessibility Filters
  if (this.selectedAccessibilityFilters.includes(filterValue)) {
    this.selectedAccessibilityFilters = this.selectedAccessibilityFilters.filter(a => a !== filterValue);
  }

  // Reset to 'ALL' if no filters remain
  if (this.selectedStatusFilters.length === 0) {
    this.selectedStatusFilters = ['ALL'];
  }
  if (this.selectedAccessibilityFilters.length === 0) {
    this.selectedAccessibilityFilters = ['ALL'];
  }

  // Fetch users again with updated filters
  this.getUsersByFiltersFunction();
}



getCombinedFilters(): string[] {
  const rawFilters = [...this.selectedStatusFilters, ...this.selectedAccessibilityFilters]
    .filter(f => f !== 'ALL'); // Remove 'ALL'

  const uniqueFilters = Array.from(new Set(rawFilters)); // Remove duplicates

  return uniqueFilters.map(f => {
    if (this.selectedStatusFilters.includes(f)) {
      return `Status: ${f}`;
    } else {
      return `Accessibility: ${f}`;
    }
  });
}



appliedFilters: string[] = []



  // Fetch Users Based on Filters
  getUsersByFiltersFunction(debounceTime: number = 300) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.changeShowFilter(false);
    this.isUserShimer = true;

    this.debounceTimer = setTimeout(() => {

      this.appliedFilters = this.getCombinedFilters(); // Show "Status: Approved" in UI

      // Send only raw filter values (without "Status:" and "Accessibility:") to backend
      const rawFilters = [
        ...this.selectedStatusFilters.filter(f => f !== 'ALL'),
        ...this.selectedAccessibilityFilters.filter(f => f !== 'ALL'),
      ];


      this.dataService
        .getUsersByFilterForEmpOnboardingNew(
          this.itemPerPage,
          this.pageNumber,
          'asc',
          'id',
          this.searchText,
          this.searchCriteria,
          this.isResignationUser,
          rawFilters

        )
        .subscribe(
          (response: any) => {
            this.users = response.users;
            this.total = response.count;
            this.isMainPlaceholder = this.searchText == '' && response.count < 1 && this.getCombinedFilters().length === 0;
            this.users = this.users ?? [];
            this.placeholder = this.users.length === 0;
            this.isUserShimer = false;
            this.getUsersCountByStatus();
          },
          (error) => {
            this.isUserShimer = false;
            this.errorToggleTop = true;
            this.users = [];
          }
        );
    }, debounceTime);
  }

  // Reset Filters and Reload Data
  resetFilters() {
    this.selectedStatusFilters = ['ALL']; // Reset status filters
    this.selectedAccessibilityFilters = ['ACTIVE']; // Reset accessibility filters
    this.appliedFilters = [];
    this.getUsersByFiltersFunction();
  }




  onboardUserTeam : any[] = [];


  getTeamNamesNew(teamList: any[]): void {
    if (teamList?.length > 1) {
      this.onboardUserTeam = teamList.slice(1);
    } else {
      this.onboardUserTeam = [];
    }
  }


  usersPage: any | null = null;
  //search: string = '';
  statuses: string[] = [];
  pageable = { page: 1, size: 10, sort: '' };
  loadUsers(): void {
    this.dataService
      .getUsersByOrganizationUuid(
        this.search,
        this.statuses,
        this.pageable
      )
      .subscribe(
        (data) => {
          this.usersPage = data;
        },
        (error) => {
          console.error('Error fetching users:', error);
        }
      );
  }
  onSort(sortField: string): void {
    // Toggle sorting order if the same field is clicked again
    if (this.pageable.sort && this.pageable.sort.startsWith(sortField)) {
      const currentOrder = this.pageable.sort.endsWith('asc') ? 'desc' : 'asc';
      this.pageable.sort = `${sortField},${currentOrder}`;
    } else {
      // Default to ascending order for a new field
      this.pageable.sort = `${sortField},asc`;
    }

    this.pageable.page = 0; // Reset to the first page when sorting
    this.loadUsers();
  }

  resignationRequest(){
    this.users = [];
    this.isResignationUser = 1

    this.search = ''; // Clear the search box text
    this.crossFlag = false;
    this.searchText = ''
    this.searchCriteria = ''

    this.getUsersByFiltersFunction();
  }

  currentResignationID: number = 0;
  deleteResignation(id: number): void {
      this.disableUserLoader = true;
      this.dataService.deleteUserResignation(id).subscribe({
        next: (response) => {
          this.disableUserLoader = false;
          if(response.status){
            this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
          }else{
            this.helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
          }
          this.closeUserDeleteModal.nativeElement.click();
          this.loadResignations();
        },
        error: (error) => {
          this.disableUserLoader = false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        },
      });
    }

    resignations: any[] = [];
    page: number = 1;
    size: number = 10;
    status: string[] | null = ['13'];
    actualStatus: string[] = ['13'];
    resignationSearch: string | null = '';
    totalRequests: number = 0;
    isResignationLoading: boolean = false;
    statusLabel:string='PENDING';
    private searchSubject: Subject<string> = new Subject<string>();
    statusOptions = [
      { value: '', label: 'All' },
      { value: '42', label: 'NOTICE PERIOD' },
      { value: '13', label: 'PENDING' },
      { value: '47', label: 'REVOKED' }
    ];
    loadResignations(): void {
      this.isResignationLoading=true;
      this.dataService
        .getUserResignations(this.selectedStatuses, this.resignationSearch, this.page, this.size)
        .subscribe({
          next: (data) => {
            this.isResignationLoading=false;
            this.resignations = data.content;
            this.totalRequests =data.totalElements;
            this.actualStatus = this.selectedStatuses;
          },
          error: (err) => {
            this.isResignationLoading=false;
            console.error('Error fetching resignations', err);
          },
        });
    }

    selectedStatuses: string[] = ['13'];
    onStatusChange(statusValue: string, event: Event): void {
      const isChecked = (event.target as HTMLInputElement).checked;

      console.log('Status value:', statusValue, isChecked);
      console.log('Selected statuses:', this.selectedStatuses);
      if (statusValue === '' && isChecked) {
        // If "All" is selected, clear other selections
        this.selectedStatuses = [];
      } else if (isChecked) {
        // Remove "All" if it exists and add new status
        this.selectedStatuses = this.selectedStatuses.filter(s => s !== '');
        this.selectedStatuses.push(statusValue);
      } else {
        // Remove the unchecked status
        this.selectedStatuses = this.selectedStatuses.filter(s => s !== statusValue);
      }

    }

    // Update status label (optional, can be removed if not needed elsewhere)
    updateStatusLabel(): void {
      if (this.selectedStatuses.length === 0 || this.selectedStatuses.includes('')) {
        this.statusLabel = 'All';
      } else {
        this.statusLabel = ''; // We'll rely on pills instead
      }
    }

    // Reset filters
    resetFilter(): void {
      this.selectedStatuses = [];
      this.statusLabel = 'All';
      this.resignationSearch = '';
      this.loadResignations();
      this.showFilter = false;
    }

    // Apply filters
    applyFilters(): void {
      this.loadResignations();
      this.showFilter = false;
    }
    // Remove single status filter
  removeStatus(status: string): void {
    this.selectedStatuses = this.selectedStatuses.filter(s => s !== status);
    this.actualStatus = this.actualStatus.filter(s => s !== status);
    setTimeout(() => {
    this.updateStatusLabel();
    this.loadResignations();
    }, 10);
  }

  // Get label for a status value
  getStatusLabel(value: string): string {
    return this.statusOptions.find(opt => opt.value === value)?.label || '';
  }
    onResignationSearch(): void {
      if(this.resignationSearch!=null){
        this.searchSubject.next(this.resignationSearch);
      }
    }

    changeResignationPage(page: number): void {
      this.page = page;
      this.loadResignations();
    }
    selectResignationStatus(statuses: string[] | 'ALL', label: string) {
      if (statuses === 'ALL') {
          this.status = null;  // Changed to null instead of empty string
      } else {
          this.status = statuses;
      }
      this.statusLabel = label;
      this.loadResignations();
  }



  allEmployeeRequest(){
    this.users = [];
    this.isResignationUser = 0
    this.getUsersByFiltersFunction();
  }


  onTableDataChange(event: any) {
    this.pageNumber = event;
    this.getUsersByFiltersFunction();
  }

  selectedStatus: string | null = null;

  selectStatus(status: string) {

    this.users = [];
    this.isResignationUser = 0
    this.search = '';
    this.crossFlag = false;
    this.resetFilters();

  }

  searchText: string = '';
  search: string = '';
  crossFlag: boolean = false;
  searchUserPlaceholderFlag: boolean = false;

  resetCriteriaFilter() {
    this.itemPerPage = 12;
    this.pageNumber = 1;
  }

  searchUsers(searchString: string) {
    this.crossFlag = true;
    if (searchString === 'any') {
      this.searchText = this.search;
      this.searchCriteria = '';
    } else {
      this.searchText = searchString;
      this.searchCriteria = 'employeeOnboardingStatus';
    }

    this.resetCriteriaFilter();
    this.getUsersByFiltersFunction();
    if (this.searchText === '') {
      this.crossFlag = false;
    }
  }


  reloadPage() {
    this.search = '';
    this.searchText = '';
    this.searchCriteria = '';
    this.pageNumber = 1;
    this.itemPerPage = 12;
    this.getUsersByFiltersFunction();
    this.crossFlag = false;
  }


  showProjectOfOnboardingSection: boolean = false;

  changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getUsersByFiltersFunction();
  }

  onOnboardingPageChange(page: number): void {
    this.pageNumber = page;
    this.getUsersByFiltersFunction();
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

  // verificationCount: any = {};

  getEmployeesOnboardingStatus() {
    debugger;
    this.dataService.getEmployeesStatus().subscribe(
      (data) => {
        this.verificationCount = data;
        this.updateChartOptions();
      },
      (error) => {}
    );
  }

  updateChartOptions() {
    this.chartOptions.series = [
      this.verificationCount.approvedEmployees || 0,
      this.verificationCount.pendingEmployees || 0,
      this.verificationCount.rejectedEmployees || 0,
      this.verificationCount.requestedCount || 0
    ];

    this.chartOptions.labels = [
      "Approved",
      "Pending",
      "Rejected",
      "Requested"
    ];
  }

  employeeStatus: any = {};

  isPendingShimmer: boolean = false;
  networkConnectionErrorPlaceHolder: boolean = false;
  dataNotFoundPlaceHolderForLastApproved = false;
  dataNotFoundPlaceHolderForLastRejected = false;
  dataNotFoundPlaceHolderForLast3PendingUsers = false;

  preMethodCallForShimmersAndOtherConditions() {
    this.isPendingShimmer = true;
    this.networkConnectionErrorPlaceHolder = false;
  }

  getEmpLastApprovedAndLastRejecetdStatus() {
    this.preMethodCallForShimmersAndOtherConditions();
    this.dataService.getLastApprovedAndLastRejecetd().subscribe(
      (data) => {
        this.employeeStatus = data;
        this.isPendingShimmer = false;

        if (
          data.lastApprovedUser === undefined ||
          data.lastApprovedUser === null
        ) {
          this.dataNotFoundPlaceHolderForLastApproved = true;
        }

        if (
          data.lastRejectedUser === undefined ||
          data.lastRejectedUser === null
        ) {
          this.dataNotFoundPlaceHolderForLastRejected = true;
        }

        if (data.last3PendingUsers.length == 0) {
          this.dataNotFoundPlaceHolderForLast3PendingUsers = true;
        }
      },
      (error) => {
        this.isPendingShimmer = false;
        this.networkConnectionErrorPlaceHolder = true;
      }
    );
  }

  // Define a new flag
  emailAlreadyExists = false;
  toggle1 = false;
  toggle2 = false;
  setEmployeePersonalDetailsMethodCall(invite: boolean) {
    // Reset the flag
    debugger
    if(!invite) {
      this.toggle1 = true;
    }else {
      this.toggle2 = true;
    }
    this.emailAlreadyExists = false;

    const userUuid = '';
    this.dataService
      .setEmployeePersonalDetails(
        this.userPersonalInformationRequest,
        userUuid,
        this.selectedTeamIds,
        this.selectedShift,
        this.selectedLeaveIds,
        invite
      )
      .subscribe(
        (response: UserPersonalInformationRequest) => {
          this.toggle1 = false;
          this.toggle2 = false;

          // Check if the response indicates the email already exists
          if (response.statusResponse === 'existed') {
            this.emailAlreadyExists = true; // Set the flag to display the error message
            this.toggle1 = false;
            this.toggle2 = false;
          } else {
            this.clearForm();
            this.closeModal();
          }
          this.selectedTeamIds = [];
          this.selectedLeaveIds = [];
          this.selectedTeams = [];
          this.selectedShift = null;
          this.getUsersByFiltersFunction();

          if(invite) {
            this.helperService.showToast(
              'Member added and invited successfully.',
              Key.TOAST_STATUS_SUCCESS
            );
        } else {
          this.helperService.showToast(
            'Member added successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        }
        },
        (error) => {
          console.error(error);
          this.toggle1 = false;
          this.toggle2 = false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }


  positionFilteredOptions: string[] = [];
  onChange(value: string): void {
    if (value) {
      this.positionFilteredOptions = this.jobTitles.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    }
  }
  preventLeadingWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
    }
  }

  shiftList: { value: number, label: string }[] = [];
  selectedShift: number | null = null;
  selectedLeave: number | null = null;
  isLoadingShifts = false;
  getShiftData() {
    this.isLoadingShifts = true;
    this.dataService.getShifts().subscribe(
      (response) => {
        // console.log('Shift data response:', response);
        if (response && response.listOfObject) {
          this.shiftList = response.listOfObject.map((shift: OrganizationShift) => ({
            value: shift.shiftId,
            label: shift.shiftName
          }));
        } else {
          console.warn('No shift data found in the response.');
        }
        this.isLoadingShifts = false;
        if (this.shiftList.length == 1) {
          this.selectedShift = this.shiftList[0].value;

        }
      },
      (error) => {
        console.error('Error fetching shift data:', error);
        this.isLoadingShifts = false;
      }
    );
  }


  clearForm() {
    this.userPersonalInformationRequest = new UserPersonalInformationRequest();
    this.emailAlreadyExists = false;
    this.isEmailExist = false;
    this.isNumberExist = false;
    // this.personalInformationForm.reset();
  }

  closeModal() {
    this.closeInviteModal.nativeElement.click();
  }
  sendingMailLoaderForUser(user: any): boolean {
    return this.loadingStatus[user.email] || false;
  }

  // sendingMailLoader = false;
  loadingStatus: { [key: string]: boolean } = {};

  sendMailToEmployees(user: any) {
    // this.sendingMailLoader = true;
    debugger;
    const userEmail = user.email;
    this.loadingStatus[userEmail] = true;
    this.dataService
      .sendMailToEmployeesToCompleteOnboarding(userEmail)
      .subscribe(
        (response) => {
          this.getUsersByFiltersFunction();
          this.getEmpLastApprovedAndLastRejecetdStatus();
          this.getEmployeesOnboardingStatus();
          this.loadingStatus[userEmail] = false;

          this.helperService.showToast(
            'Email sent successfully!',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          this.loadingStatus[userEmail] = false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  // Reset the model
  resetForm() {
    this.isNumberExist = false;
    this.isEmailExist = false;
    if (this.personalInformationForm) {
      this.personalInformationForm.reset();
      this.personalInformationForm.untouched;
    }
  }

  @ViewChild('closeUserDeleteModal') closeUserDeleteModal!: ElementRef;
  disableUserLoader: boolean = false;
  disableUser(userId: number) {
    this.disableUserLoader = true;
    debugger;
    this.dataService.disableUserFromDashboard(userId).subscribe(
      (data) => {
        if (this.users.length == 1) {
          this.pageNumber = this.pageNumber - 1;
        }
        this.disableUserLoader = false;
        // this.deleteOrDisableString = '';
        this.getEmployeesOnboardingStatus();
        this.getUsersByFiltersFunction();
        this.getEmpLastApprovedAndLastRejecetdStatus();
        this.closeUserDeleteModal.nativeElement.click();
        this.helperService.showToast(
          'User Removed Successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.disableUserLoader = false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  currentUserId: number | null = null;
  currentUserPresenceStatus: boolean= false;
  currentUserUuid: string = '';
  deleteOrDisableUserString: string = '';

  @ViewChild('deleteConfirmationModalButton') deleteConfirmationModal: any;

  openDeleteConfirmationModal(userId: number, presenceStatus: boolean, uuid: string, stringStr: string) {
    debugger;
    if( !this.rbacService.hasWriteAccess(Routes.EMPLOYEEONBOARDING)){
      this.helperService.showPrivilegeErrorToast();
      return;
    }

    this.deleteConfirmationModal.nativeElement.click();
    this.currentUserId = userId;
    this.currentUserPresenceStatus = presenceStatus;
    this.currentUserUuid = uuid;
    this.deleteOrDisableUserString = stringStr;
  }


  deleteOrDisable() {
    if(this.deleteOrDisableUserString === constant.DELETE) {
      if (this.currentUserId !== null) {
       this.deleteUser();
      }
    }else if (this.deleteOrDisableUserString === constant.DISABLE){
      if(this.currentUserUuid != '') {
        const statusToSend = !this.currentUserPresenceStatus;
        this.changeStatusActive(statusToSend, this.currentUserUuid);
        this.closeUserDeleteModal.nativeElement.click();
       }
    }
  }
  deleteUser() {
    if (this.currentUserId !== null) {
      this.disableUser(this.currentUserId);
      this.currentUserId = null;
    }
  }

  closeDeleteModal() {
    this.deleteConfirmationModal.nativeElement.click();
  }


  text = '';

  changeStatusActive(status: boolean, userUuid: string) {
   if( !this.rbacService.hasWriteAccess(Routes.EMPLOYEEONBOARDING)){
      this.helperService.showPrivilegeErrorToast();
      return;
    }
    this.disableUserLoader = true;
    this.dataService.changeStatusById(status, userUuid).subscribe(
      (data) => {
        this.disableUserLoader = false;
        this.getUsersByFiltersFunction();
        this.currentUserPresenceStatus = false;
        this.currentUserUuid = '';
        this.helperService.showToast("User disabled succefully", Key.TOAST_STATUS_SUCCESS);
      },
      (error) => {
        this.disableUserLoader = false;
        this.getUsersByFiltersFunction();
      }
    );
  }


  isShowPendingVerificationTab: boolean = false;

  selectedTeams: Team[] = [];
  selectedLeaves: Team[] = [];
  teamNameList: Team[] = [];
  leaveNameList: Team[] =[];
  originalLeaveNameList: Team[]=[];
  originalTeamNameList: Team[] = [];
  isLoadingTeams = false;
  isLoadingLeave = false;

  getTeamNames() {
    this.isLoadingTeams = true;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.originalTeamNameList = response.object.map((team: any) => ({
          label: team.teamName,
          value: team.teamId.toString(),
        }));
        this.isLoadingTeams = false;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
        this.isLoadingTeams = false;
      },
    });
  }

  getLeaveNames() {
    this.isLoadingLeave = true;
    this.dataService.getAllLeaveTemplate(1, 100).subscribe({
      next: (response: any) => {
        this.originalLeaveNameList = response.object.map((leave: any) => ({
          label: leave.templateName,
          value: leave.id.toString(),
        }));
        this.isLoadingLeave = false;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
        this.isLoadingLeave = false;
      },
    });
  }

  selectedTeamIds: number[] = [];
  selectedLeaveIds: number[] = [];

  onTeamSelectionChange(selectedTeams: string[]): void {
    this.selectedTeamIds = selectedTeams.map((id) => parseInt(id, 10));
    // console.log('Selected teams:', this.selectedTeams);
  }

  onLeaveSelectionChange(selectedLeave: string[]): void {
    this.selectedLeaveIds = selectedLeave.map((id) => parseInt(id, 10));
  }

  onSearch(value: string): void {
    this.isLoadingTeams = true;
    if (!value) {
      this.teamNameList = this.originalTeamNameList; // Keep a copy of the original full list
    } else {
      setTimeout(() => {
        this.teamNameList = this.originalTeamNameList.filter((team) =>
        team.label.toLowerCase().includes(value.toLowerCase())
      );
      }, 1000);
    }
    this.isLoadingTeams = false;
  }

  onSearchLeave(value: string): void {
    this.isLoadingLeave = true;
    if (!value) {
      this.leaveNameList = this.originalLeaveNameList;
    } else {
      setTimeout(() => {
        this.leaveNameList = this.originalLeaveNameList.filter((leave) =>
        leave.label.toLowerCase().includes(value.toLowerCase())
        );
      }, 1000);
  }
  this.isLoadingLeave = false;
  }

  resetUploadExcelForm(): void {
    this.fileColumnName = [];
    this.isExcel = '';
    this.data = [];
    this.dataWithoutHeader = [];
    this.mismatches = [];
    this.invalidRows = [];
    this.invalidCells = [];
    this.isinvalid = false;
    this.jsonData = [];
    this.validateMap.clear();
    this.fileName = null;
    this.currentFileUpload = null;
    this.firstUpload=true;
    this.currentFileUpload = null;
      this.fileName = null;
  }

  fileName: any;
  currentFileUpload: any;


  expectedColumns: string[] = ['Name*', 'Phone*', 'Email*', 'Shift*', 'JoiningDate*', 'Gender*'];
  correctColumnName: string[] = ['S. NO.*', 'Name*', 'Phone*', 'Email*', 'Shift*', 'JoiningDate*', 'Gender*', 'leavenames', 'ctc', 'emptype', 'empId', 'branch', 'department', 'position', 'nationality' , 'grade', 'team', 'dob', 'fathername', 'maritalstatus', 'address', 'city', 'state', 'country', 'pincode', 'panno', 'aadharno', 'drivinglicence', 'emergencyname', 'emergencyphone', 'emergencyrelation', 'accountholdername', 'bankname', 'accountnumber', 'ifsccode', 'uan', 'esi number'];
  fileColumnName:string[] = [];
  genders: string[] = ['Male', 'Female'];
  isExcel: string = '';
  data: any[] = [];
   dataWithoutHeader:any=[];
  mismatches: string[] = [];
  invalidRows: boolean[] = []; // Track invalid rows
  invalidCells: boolean[][] = []; // Track invalid cells
  isinvalid: boolean=false;
  jsonData:any[]=[];
  validateMap: Map<string, string[]> = new Map();
  @ViewChild('attention') elementToScroll!: ElementRef;

  selectFile(event: any) {
    this.validateMap= new Map();
    debugger
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.currentFileUpload = file;
      this.fileName = file.name;

      if (!this.isExcelFile(file)) {
        this.isExcel = 'Invalid file type. Please upload an Excel file.';
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const binaryStr = this.arrayBufferToString(arrayBuffer);
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        this.jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Reset data and error tracking
        this.data = [];
        this.invalidRows = [];
        this.invalidCells = [];
        this.validateMap.clear;

        const columnNames: string[] = this.jsonData[0] as string[];
        if (this.validateColumns(columnNames)) {
              this.data = this.jsonData.map((row: any[]) => {
                // Ensure the 5th column is an array of strings, other columns are treated as strings
                return row.map((cell: any, index: number) => {
                  if( this.data.length==0){
                    return cell ? cell.toString().trim() : '';
                  }else{
                  if (this.fileColumnName[index] === 'leavenames') {
                    return cell ? cell.toString().split(',').map((str: string) => str.trim()) : [];
                  }else if (this.fileColumnName[index] === 'joiningdate*' && cell !== 'joiningdate*') {
                    // Use regex to check if cell matches exact MM-DD-YYYY format (reject formats like MM/DD/YYYY)
                    const isExactFormat = /^\d{2}-\d{2}-\d{4}$/.test(cell);
                    // if (cell.includes('/')) {
                    //   return undefined;
                    // }
                    cell=cell.replace(/\//g, '-');

                    if (isExactFormat) {
                        // Parse with strict format checking
                        const formattedDate = moment(cell, ['DD-MM-YYYY', 'DD/MM/YYYY'], true);

                        // Check if the date is valid and within the next year
                        if (formattedDate.isValid()) {
                            const oneYearFromNow = moment().add(1, 'year');
                            // Ensure date is within the next year
                            if (formattedDate.isBefore(oneYearFromNow)) {
                                return formattedDate.format('MM-DD-YYYY');
                            }
                        }
                    }
                    // Return empty string if the format, validity, or date range check fails
                    return "";
                  }
                   else {
                    // Convert other cells to string and trim whitespace
                    return cell ? cell.toString().trim() : '';
                  }
                }

                });
              }).filter((row: any[]) =>
                        // Filter out empty rows
                  row.some((cell: any) => cell !== '')
                );




          // Validate all rows and keep track of invalid entries- send daya for validatio after emoving heder row
          this.validateRows(this.data.slice(1));
          this.removeAllSingleEntries();
          this.validateMap.forEach((values, key) => {
            console.log(`Key: ${key}`);

            this.mismatches.push('<br />');
            // Add repeated mismatch message
            this.mismatches.push(`<b>${key}</b> at row no.`);

            // Scroll into view if element exists
            if (this.elementToScroll) {
              this.elementToScroll!.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // Split values into chunks of 50 and add line breaks
            const chunkSize = 50;
            for (let i = 0; i < values.length; i += chunkSize) {
              const chunk = values.slice(i, i + chunkSize);
              this.mismatches.push(`${chunk.join(', ')}`);
            }
          });
          this.totalPage = Math.ceil(this.data.length / this.pageSize);

          console.log(this.areAllFalse());
          console.log(this.mismatches);
          if(this.areAllFalse() && this.mismatches.length===0){
            this.isinvalid=false;
            this.uploadUserFile(file, this.fileName);
          }else{
            this.isinvalid=true;
          }


        } else {
          console.error('Invalid column names');
        }
      };
    }
  }
  firstUpload:boolean=true;
  areAllFalse(): boolean {
    try{

    
    if(this.firstUpload===true){
      this.firstUpload=false;
      return false;
    }
    return true;
    // console.log("🚀 ~ EmployeeOnboardingDataComponent ~ areAllFalse ~ this.invalidCells:", this.invalidCells)
    // return this.invalidCells
    // .reduce((acc, row, rowIndex) => {
    //   return acc.concat(row.filter((_, colIndex) => this.expectedColumns[colIndex] !== "LeaveNames"));
    // }, [])
    // .every((value:any) => value === false || value === null || value === undefined || value === "" || value === 0);
      // .every(value => value === false);
    }catch(error){
      console.log("🚀 ~ EmployeeOnboardingDataComponent ~ areAllFalse ~ error:", error)
      return false;
    }
  }

  arrayBufferToString(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    let binaryStr = '';
    for (let i = 0; i < byteArray.length; i++) {
      binaryStr += String.fromCharCode(byteArray[i]);
    }
    return binaryStr;
  }

  isExcelFile(file: File): boolean {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel'
    ];

    const allowedExtensions = ['xlsx', 'xls'];

    return allowedMimeTypes.includes(file.type) && allowedExtensions.includes(file.name.split('.').pop()?.toLowerCase() || '');
  }

  validateColumns(columnNames: string[]): boolean {
    debugger
    this.mismatches = []; // Reset mismatches

    // Step 2: Normalize both expected and actual column names for comparison
    const normalizedColumnNames = columnNames.map(col => col.trim().toLowerCase());
    this.fileColumnName=normalizedColumnNames;
    const normalizedExpectedColumns = this.expectedColumns.map(col => col.trim().toLowerCase());
    const normalizedCorrectColumns = this.correctColumnName.map(col => col.trim().toLowerCase());

    // Step 3: Check that every expected column is present in actual column names
    for (const expectedColumn of normalizedExpectedColumns) {
      if (!normalizedColumnNames.includes(expectedColumn)) {
        console.error(`Missing column: "${expectedColumn}"`);
        this.mismatches.push(`Missing column: "${expectedColumn}"`);
      }
    }

    // Step 4: Check if there are extra or incorrect columns in actual column names
    for (const actualColumn of normalizedColumnNames) {
      if (!normalizedExpectedColumns.includes(actualColumn) && !normalizedCorrectColumns.includes(actualColumn)) {
          console.error(`Unexpected or incorrect column: "${actualColumn}"`);
          this.mismatches.push(`Unexpected or incorrect column: "${actualColumn}"`);
      }
  }

    // Step 4: Log and return false if there are any mismatches
    if (this.mismatches.length > 0) {
      console.error('Column mismatches found:');
      this.mismatches.forEach(mismatch => console.error(mismatch));
      return false;
    }

    return true;
  }
  readonly constants = constant;
  addToMap(key: string, value: string) {
    if (this.validateMap.has(key)) {
      console.log(key,value);
      // If key exists, add the new value to the existing array
      this.validateMap.get(key)?.push(value);
    } else {
      // If key does not exist, create a new array with the value
      this.validateMap.set(key, [value]);
    }
  }
  removeAllSingleEntries() {
    for (const [key, valuesArray] of this.validateMap) {
      if (valuesArray.length <= 1 && key.includes('Repeated')) {
        this.validateMap.delete(key);
      }
    }
  }

  validateRows(rows: any[]): void {
    this.invalidRows = new Array(rows.length).fill(false); // Reset invalid rows
    this.invalidCells = Array.from({ length: rows.length }, () => new Array(this.expectedColumns.length).fill(false)); // Reset invalid cells

    for (let i = 0; i < rows.length; i++) {
      let rowIsValid = true;
      let hasEmptyRow =false;
      for (let j = 0; j < this.fileColumnName.length; j++) {

        const cellValue = rows[i][j];
        if (!cellValue || cellValue === null || cellValue.toString().trim() === '') {
          rowIsValid = false;
          this.invalidRows[i] = true; // Mark the row as invalid
          this.invalidCells[i][j] = true; // Mark the cell as invalid
          if(!hasEmptyRow){
            // this.addToMap('Empty Fields',`${i+1}`);
            // hasEmptyRow=true;
          }

        }
        if (this.fileColumnName[j] === 'email*' && cellValue) {
          const email = cellValue.toString().trim();
          this.addToMap('Repeated Email: ' + email, `${i + 1}`);
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.addToMap('Invalid Email: ',`${i+1}`);
            rowIsValid = false;
            this.invalidRows[i] = true; // Mark the row as invalid
            this.invalidCells[i][j] = true; // Mark the cell as invalid
          }
        } else if (this.fileColumnName[j] === 'email*') {
          this.addToMap('Empty Email: ', `${i + 1}`);
        }
        if (this.fileColumnName[j] === 'phone*' && cellValue) {
          const phoneNumber = cellValue.toString().trim();
          this.addToMap('Repeated Phone: '+ cellValue.toString(),`${i+1}`);
          if (!/^\d{10}$/.test(phoneNumber)) {
            rowIsValid = false;
            this.invalidRows[i] = true; // Mark the row as invalid
            this.invalidCells[i][j] = true; // Mark the cell as invalid
            this.addToMap('Invalid Phone: ',`${i+1}`);
          }
        }else if(this.fileColumnName[j] === 'phone*'){
          this.addToMap('Empty Phone: ',`${i+1}`);
        }
        if (this.fileColumnName[j] === 'esi number' && cellValue) {
          debugger
          const esi = cellValue.toString().trim();
          this.addToMap('Repeated ESI: '+cellValue.toString(),`${i+1}`);
          if (!/^\d{17}$/.test(esi) && esi.length > 0) {
            rowIsValid = false;
            this.invalidRows[i] = true; // Mark the row as invalid
            this.invalidCells[i][j] = true; // Mark the cell as invalid
            this.addToMap('Invalid ESI: ',`${i+1}`);
          }
        }
        if (this.fileColumnName[j] === 'uan' && cellValue) {
          const uan = cellValue.toString().trim();
          this.addToMap('Repeated UAN: '+cellValue.toString(),`${i+1}`);
          if (!/^\d{12}$/.test(uan) && uan.length>0) {
            rowIsValid = false;
            this.invalidRows[i] = true; // Mark the row as invalid
            this.invalidCells[i][j] = true; // Mark the cell as invalid
            this.addToMap('Invalid UAN: ',`${i+1}`);
          }
        }

        if (this.fileColumnName[j] === 'shift*' ) {
          var shiftExists=false;
          if(cellValue){
            const shiftName = cellValue.toString().trim();
            shiftExists = this.shiftList.some(shift => shift.label === shiftName);
          }
          if (!shiftExists || !cellValue) {
              this.addToMap('Invalid Shift: ',`${i+1}`);
              rowIsValid = false;
              this.invalidRows[i] = true;
              this.invalidCells[i][j] = true;
              this.data[i+1][j] = '';
          }
        }

        if (this.fileColumnName[j] === 'gender*' ) {
          var genderExists=false;
          if(cellValue){
            const gender = cellValue.toString().trim();
            genderExists = this.genders.some(g =>g === gender);
          }
          if (!genderExists || !cellValue) {
              this.addToMap('Invalid gender: ',`${i+1}`);
              rowIsValid = false;
              this.invalidRows[i] = true;
              this.invalidCells[i][j] = true;
              this.data[i+1][j] = '';
          }
        }

        if (this.fileColumnName[j] === 'leavenames' || this.fileColumnName[j] === 'team') {
          if (this.constants.EMPTY_STRINGS.includes(cellValue)) {
            this.data[i + 1][j] = [];
          }
          else {
            console.log(cellValue)
            const selectedData: string[] = cellValue.split(',').map((team: string) => team.trim());
            this.data[i + 1][j] = selectedData;
          }
        } else if (this.fileColumnName[j] === 'leavenames') {
          this.addToMap('Empty Leave Names: ', `${i + 1}`);
        }
        if (this.fileColumnName[j] === 'joiningdate*') {
          if (!cellValue || cellValue.trim() === '') {
            this.addToMap('Empty Joining Date: ', `${i + 1}`);
            rowIsValid = false;
            this.invalidRows[i] = true;
            this.invalidCells[i][j] = true;
          } else {
            let parsedDate;

            // Debug: Log the raw cellValue and its type
            console.log(`Raw cellValue for joiningdate* at row ${i + 1}, col ${j}:`, cellValue, `Type: ${typeof cellValue}`);

            // Check if cellValue is a string that looks like an Excel serial number
            if (typeof cellValue === 'string' && /^\d+$/.test(cellValue) && parseInt(cellValue) > 1) {
              const serialNumber = parseInt(cellValue);
              const excelEpoch = new Date(1899, 11, 30); // Dec 31, 1899
              const jsDate = new Date(excelEpoch.getTime() + serialNumber * 24 * 60 * 60 * 1000);
              parsedDate = moment(jsDate);
              console.log(`Converted serial ${cellValue} to date:`, parsedDate.format('DD-MM-YYYY'));
            } else {
              // Try parsing as a date string
              parsedDate = moment(cellValue, ['DD-MM-YYYY', 'DD/MM/YYYY'], true);
            }

            if (parsedDate && parsedDate.isValid()) {
              const oneYearFromNow = moment().add(1, 'year');
              if (parsedDate.isBefore(oneYearFromNow)) {
                this.data[i + 1][j] = parsedDate.format('DD-MM-YYYY');
                console.log(`Formatted date for storage:`, this.data[i + 1][j]);
              } else {
                this.addToMap('Invalid Joining Date (date after one year): ', `${i + 1}`);
                rowIsValid = false;
                this.invalidRows[i] = true;
                this.invalidCells[i][j] = true;
              }
            } else {
              this.addToMap('Invalid Joining Date format: ', `${i + 1}`);
              rowIsValid = false;
              this.invalidRows[i] = true;
              this.invalidCells[i][j] = true;
            }
          }
        }

        // Similar logic for 'dob'
        if (this.fileColumnName[j] === 'dob') {
          if (cellValue && cellValue.trim() !== '') {
            let parsedDate;

            // Debug: Log the raw cellValue and its type
            console.log(`Raw cellValue for dob at row ${i + 1}, col ${j}:`, cellValue, `Type: ${typeof cellValue}`);

            // Check if cellValue is a string that looks like an Excel serial number
            if (typeof cellValue === 'string' && /^\d+$/.test(cellValue) && parseInt(cellValue) > 1) {
              const serialNumber = parseInt(cellValue);
              const excelEpoch = new Date(1899, 11, 30);
              const jsDate = new Date(excelEpoch.getTime() + serialNumber * 24 * 60 * 60 * 1000);
              parsedDate = moment(jsDate);
              console.log(`Converted serial ${cellValue} to date:`, parsedDate.format('DD/MM/YYYY'));
            } else {
              parsedDate = moment(cellValue, ['DD-MM-YYYY', 'DD/MM/YYYY'], true);
            }

            if (parsedDate && parsedDate.isValid()) {
              if (parsedDate.isBefore(moment())) {
                this.data[i + 1][j] = parsedDate.format('DD-MM-YYYY');
                console.log(`Formatted date for storage:`, this.data[i + 1][j]);
              } else {
                this.addToMap('Invalid DOB (future date): ', `${i + 1}`);
                rowIsValid = false;
                this.invalidRows[i] = true;
                this.invalidCells[i][j] = true;
              }
            } else {
              this.addToMap('Invalid DOB format: ', `${i + 1}`);
              rowIsValid = false;
              this.invalidRows[i] = true;
              this.invalidCells[i][j] = true;
            }
          }
        }

        if (!this.expectedColumns.some(expectedColumn => expectedColumn.toLowerCase() === this.fileColumnName[j].toLowerCase())) {
          if(!(this.fileColumnName[j].toLowerCase()=='esi number' || this.fileColumnName[j].toLowerCase()== 'uan') || !cellValue){
            this.invalidCells[i][j] = false;
          }

        }
      }
    }
    debugger

  }

  getSelectedTeams(teamsString: string): string[] {
    // Split the comma-separated string into an array
    return teamsString ? teamsString.split(',').map(team => team.trim()) : [];
  }

  onMultiSelectChange(selectedOptions: any[], rowIndex: number, colIndex: number) {
    debugger
    //rowIndex+1 represents data without header
    this.data[rowIndex+1][colIndex] = selectedOptions;
    this.onValueChange(rowIndex,colIndex);
  }

  saveFile() {
    debugger
    const stringifiedData = this.data.map((row: any[]) =>
      row.map(cell => cell !== null && cell !== undefined ? String(cell) : '')
    );
    const ws = XLSX.utils.aoa_to_sheet(stringifiedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'edited_file.xlsx');
    this.validateMap.clear;

    const file = new File([blob], 'edited_file.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

  // Create a fake event to pass to selectFile
  const event = new Event('change');
  Object.defineProperty(event, 'target', { writable: false, value: { files: dataTransfer.files } });
  this.selectFile(event);
  }

  onValueChange(i: number, j: number) {
    if (this.invalidCells[i][j]) {
      this.invalidCells[i][j] = false;
    }
  }

  onDateChange(event: Date, rowIndex: number, columnIndex: number) {
    // Format the selected date to 'MMM dd yyyy'
    const formattedDate =moment(event).format('DD-MM-YYYY');

    //  this.datePipe.transform(event, 'MMM dd yyyy');

    // Assign the formatted date back to your data array
    //rowIndex+1 represents data without header
     this.data[rowIndex+1][columnIndex] = formattedDate;
    this.onValueChange(rowIndex,columnIndex);
  }
  parseDate(dateString: string): any {
    if (!dateString || dateString.trim() === '') return null;

    const parsedDate = moment(dateString, ['DD-MM-YYYY', 'DD/MM/YYYY'], true);
    return parsedDate.format('MM-DD-YYYY');
  }

  onTeamSelectionChanges(selectedTeams: any[], rowIndex: number, columnIndex: number) {
    //rowIndex+1 represents data without header
    this.data[rowIndex+1][columnIndex] = selectedTeams;
  }

  openAddLeaveModal(): void {
    const modalRef = this.ngbModal.open(LeaveSettingComponent, {
      size: 'xl',
      backdrop: true,
      windowClass: 'custom-modal-width'
    });

    // Optional: Handle modal close result
    modalRef.result.then(
      (result) => {
        console.log('Modal closed with:', result);
        // Refresh the list or handle result
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }

  openAddShiftModal(): void {
    const modalRef = this.ngbModal.open(AttendanceSettingComponent, {
      size: 'xl', // Adjust size as needed
      backdrop: true, // Allows closing the modal on outside click
      keyboard: true // Allows closing the modal with the Esc key
    });

    modalRef.result.then(
      (result) => {
        console.log('Modal closed with:', result);
        // Refresh the shift list or handle result
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }
  openAddTeamModal(): void {
    const modalRef = this.ngbModal.open(TeamComponent, {
      size: 'xl', // Adjust size as needed
      backdrop: true, // Allows closing the modal on outside click
      keyboard: true // Allows closing the modal with the Esc key
    });

    modalRef.result.then(
      (result) => {
        console.log('Modal closed with:', result);
        // Refresh the team list or handle result
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }




  selectAllCurrentPage = false;
  selectAllPages = false;

  // allData: any[] = []; // Data across all pages

  bulkShift: string | null = null;
  bulkLeave: string[] = [];
  bulkTeam: string[] = [];

  // Mock data for demonstration

  toggleSelectAllCurrentPage() {

     this.paginatedData.forEach((row, index) => {
      // if (index + this.currentPage-1 !== 0 ) {
        row.selected = this.selectAllCurrentPage;
      // }
    });
    this.updateAllDataForCurrentPage();
  }
  toggleSelectAllPage() {
    this.data.forEach(row => row.selected = this.selectAllPages);
    this.updateAllDataForAllPages();
  }


  toggleSelectAllPages() {
    this.selectAllPages = !this.selectAllPages;
    this.data.forEach(row => row.selected = this.selectAllPages);
    this.syncPaginatedDataSelection();
  }

  updateAllDataForCurrentPage() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedData.forEach((row, index) => {
      this.data[startIndex + index].selected = row.selected;
    });
  }

  updateAllDataForAllPages() {
    // Loop through all pages
    for (let page = 1; page <= this.totalPage; page++) {
      const startIndex = (page - 1) * this.pageSize;

      // Get the paginated data for the current page
      const currentPageData = this.paginatedDataForPage(page);

      // Update the selected property for each row on the current page
      currentPageData.forEach((row, index) => {
        this.data[startIndex + index].selected = row.selected;
      });
    }
  }

  // Helper function to get the paginated data for a specific page
  paginatedDataForPage(page: number) {
    const startIndex = (page - 1) * this.pageSize;
    return this.paginatedData.slice(startIndex, startIndex + this.pageSize);
  }

  syncPaginatedDataSelection() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
  this.paginatedData.forEach((row, index) => {
    row.selected = this.data[startIndex + index]?.selected ?? false;
  });
  }


  applyBulkChange(type: string, value: any) {
    const targetData = this.selectAllPages ? this.data.slice(1) : this.paginatedData;
    console.log("🚀 ~ EmployeeOnboardingDataComponent ~ applyBulkChange ~ targetData:", targetData)
    var rowIndex=0;
    targetData.forEach(row => {
      // && row[1].toLowerCase()!=this.fileColumnName[1].toLowerCase()
      if (row.selected ) {
        const columnIndex = this.fileColumnName.findIndex(col => col.includes(type));
        if (columnIndex !== -1) {
          const cellValue = row[columnIndex]?.toString().toLowerCase();
          if (cellValue !== "leavenames" && cellValue !== "team") {
            if (type === "leavenames" || type === "team") {
            debugger
            if (!Array.isArray(row[columnIndex])) {
              row[columnIndex] = row[columnIndex] ? [row[columnIndex]] : [];
            }
            let temp = new Set<any>();
            row[columnIndex].forEach((item:any) => temp.add(item))
            value.forEach((item:any) => temp.add(item))

            row[columnIndex]=[];
            row[columnIndex]=Array.from(temp)
            } else {
              row[columnIndex] = value;
              this.invalidCells[rowIndex][columnIndex] = false;
            }
          }
        }
      }
      rowIndex++;

    });
console.log(this.data);
  }
  isAnyRowSelected(): boolean {
    return this.data.some(row => row.selected === true);
  }



  importToggle: boolean = false;
  isProgressToggle: boolean = false;
  isErrorToggle: boolean = false;
  errorMessage: string = '';

  alreadyUsedPhoneNumberArray: any = [];
  alreadyUsedEmailArray: any = [];
  uploadedCount:any = 0;
  uploadUserFile(file: any, fileName: string) {
    debugger;
    this.importToggle = true;
    this.isProgressToggle = true;
    this.isErrorToggle = false;
    this.errorMessage = '';
    var uuid=this.rbacService.getOrgRefUUID();
    setTimeout(() => {
    this.getUploadStatusFromFirebase(uuid);
    }
    , 2000);
    this._onboardingService.userImport(file, fileName, uuid).subscribe(
      (response: any) => {
        if (response.status) {
          this.importToggle = false;
          this.isProgressToggle = false;
          this.getReport();
          this.getUser();
          this.alreadyUsedPhoneNumberArray = response.arrayOfString;
          this.alreadyUsedEmailArray = response.arrayOfString2;
        } else {
          this.importToggle = true;
          this.isErrorToggle = true;
          this.isProgressToggle = false;
          this.errorMessage = response.message;
        }
      },
      (error) => {
        this.importToggle = true;
        this.isErrorToggle = true;
        this.isProgressToggle = false;
        this.errorMessage = error.error.message;
      }
    );
  }

  isUploading: boolean = false;
  getUploadStatusFromFirebase(uuid: any) {
    this.db.object('bulk_upload/user_' + uuid).valueChanges()
      .subscribe(res => {
         console.log(res);
        var respObject: { status: any, count: any } = { status: "", count: 0 };
        if (res != undefined && res != null) {
          console.log(res);
          //@ts-ignore
          if(res.status=='InProcess'){
            this.isUploading = true;
          }
          //@ts-ignore
          if(res.status=='Completed' && this.isUploading){
            this.getReport();
            this.getUser();
            this.isUploading = false;
          }
          //@ts-ignore
          this.uploadedCount = res.count;

        }

      });
  }

  importLoading: boolean = false;
  importReport: any[] = new Array();
  totalItems: number = 0;

  uploadDate: Date = new Date();

  getReport() {
    debugger;
    this.importReport = [];
    this.importLoading = true;
    this.databaseHelper.itemPerPage = 5;
    this.databaseHelper.sortBy = 'createdDate';
    this.databaseHelper.sortOrder = 'Desc';
    this._onboardingService.getReport(this.databaseHelper).subscribe(
      (response: any) => {
        if (response.status) {
          this.importReport = response.object;
          this.totalItems = response.totalItems;
        }
        this.importLoading = false;
      },
      (error) => {
        this.importLoading = false;
      }
    );
  }

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceholder = false;

  preRuleForShimmersAndErrorPlaceholdersMethodCall() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceholder = false;
  }

  // onboardUserList: any[] = new Array();
  onboardUserList: OnboardUser[] = [];

  loading: boolean = false;
  getUser() {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
    this.loading = true;
    this._onboardingService.getOnboardUserForEmpOnboardingData().subscribe(
      (response: any) => {
        if (response.status) {
          this.onboardUserList = response.object;
        } else {
          this.onboardUserList = [];
          this.dataNotFoundPlaceholder = true;
        }
        this.loading = false;
        this.isShimmer = false;
      },
      (error) => {
        this.loading = false;
        this.networkConnectionErrorPlaceholder = true;
        this.isShimmer = false;
      }
    );
  }

  updateNotification(onboardUser: any) {
    const payload = {
      id: onboardUser.id,
      emailNotificationEnabled: onboardUser.emailNotificationEnabled,
      whatsappNotificationEnabled: onboardUser.whatsappNotificationEnabled,
    };
  }


  formatAsCommaSeparated(items: string[]): string {
    return items.join(', ');
  }


  deleteNewUser(id: number) {
    this._onboardingService.deleteOnboardUser(id).subscribe(
      (response: any) => {
        if (response.status) {
          this.getUsersByFiltersFunction();
          this.getUser();
        }
      },
      (error) => {}
    );
  }



  isEmailExist: boolean = false;
  checkEmailExistance(index: number, email: string, uuid: string) {
    if (email != null && email.length > 5) {
      this._onboardingService
        .checkEmployeeEmailExist(email, uuid)
        .subscribe((response: any) => {
          if (index >= 0) {
            this.userList[index].isEmailExist = response;
          }
          this.isEmailExist = response;
        });
    }
  }

  requestedData: any[] = [];
  isRequestedDataLoading: boolean = false;
  userId: string = '';
  editedName: string = '';
  editedDate: Date = new Date();
  profilePic: string = '';
  disabledStates: boolean[] = [];
  approveStates: string[]=[];
  rejectedReason: string = '';
  @ViewChildren('collapsibleDiv') collapsibleDivs!: QueryList<ElementRef>;

  isProfileReqModalOpen: boolean = false;
  requestModalData: any = {};
  onProfileComponentClose() {
    this.isProfileReqModalOpen = false;
    this.closeReqDataModal.nativeElement.click();
    this.fetchPendingRequests();
    this.getUsersCountByStatus();
  }
  onProfileUpdateModalOpen(uuid:any) {
    this.requestModalData = {
      uuid: uuid,
    };
    this.isProfileReqModalOpen = true;

  }
  getRequestedData(uuid: string) {
    debugger;
    this.isRequestedDataLoading = true;
    this.dataService.getDataComparison(uuid).subscribe(
      (response: any) => {
        this.isRequestedDataLoading = false;
        this.userId = uuid;
          this.requestedData = response.editedDataDtoList.map((item: { key: string; }) => ({
            ...item,
            name: this.convertKeyToName(item.key)
          }));
          this.editedName= response.name;
          this.editedDate= response.createdDate;
          this.profilePic= response.profilePic;
          this.approveStates=[];
          this.remainingField=1;
          this.isModalOpen = new Array(this.requestedData.length).fill(false);
          if(!this.requestedData ||this.requestedData.length==0){
            this.helperService.showToast('No data found', Key.TOAST_STATUS_ERROR);
            this.closeReqDataModal.nativeElement.click();
            this.selectStatus('EDITPROFILE');
          }


      },
      (error) => {
        this.isRequestedDataLoading = false;
      }
    );
  }

  convertKeyToName(key: string): string {
    // Convert the key by splitting on uppercase letters and joining with spaces
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')  // Adds a space before uppercase letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalizes the first letter
  }

  @ViewChild('closeReqDataModal') closeReqDataModal!: ElementRef;
  approveLoading: boolean = false;
  approveRequestedData(): void {
    this.approveLoading = true;
    this.dataService.saveRequestedData(this.userId).subscribe({
      next: (response) => {
        this.approveLoading = false;
        console.log('Response:', response);
        if (response.success) {
          this.helperService.showToast('Data saved successfully', Key.TOAST_STATUS_SUCCESS);
          this.closeReqDataModal.nativeElement.click();
          this.fetchPendingRequests();
          this.selectStatus('EDITPROFILE');

        } else {
          this.helperService.showToast('Failed to save data', Key.TOAST_STATUS_ERROR);
        }
      },
      error: (error) => {
        this.approveLoading = false;
        console.error('Error:', error);
        this.helperService.showToast('An error occurred while saving data', Key.TOAST_STATUS_ERROR);
      },
    });
  }

  rejectLoading: boolean = false;
  isRejectModalOpen: boolean = false;
  rejectData(): void {
    if(! this.isRejectModalOpen){
      this.isRejectModalOpen = true;
      return;
    }

    this.rejectLoading = true;
    this.dataService.rejectRequestedData(this.userId,this.rejectedReason).subscribe(
      (response) => {
        this.rejectLoading = false;
        if (response.success) {
          this.helperService.showToast('Request rejected successfully', Key.TOAST_STATUS_SUCCESS);
          this.closeReqDataModal.nativeElement.click();
          this.fetchPendingRequests();
          this.selectStatus('EDITPROFILE');
        } else {
          this.helperService.showToast('Failed to reject request', Key.TOAST_STATUS_ERROR);
        }
      },
      (error) => {
        this.rejectLoading = false;
        console.error('API Error:', error);
      }
    );
  }

  @ViewChild('divElement', { static: false }) divElement!: ElementRef;

  fieldLoading: boolean = false;
  remainingField: number=1;
  removeField(key: string, value: any, index: number) {
    this.fieldLoading = true;
    this.dataService.removeKeyValuePair(key,this.userId, value).subscribe({
      next: (response) => {
        this.fieldLoading = false;
        console.log('Response:', response);
        if (response.success) {
          this.helperService.showToast('Data Rejected successfully', Key.TOAST_STATUS_SUCCESS);
          this.remainingField=response.message;
          this.fetchPendingRequests();

          this.disabledStates[index] = true;
          this.approveStates[index] = 'Rejected';
          this.divElement.nativeElement.click();
          const divToClick = document.getElementById('collapsibleDiv-' + index);
          if (divToClick) {
            divToClick.click();
          }

        } else {
          this.helperService.showToast('Failed to remove the field', Key.TOAST_STATUS_ERROR);
        }
      },
      error: (err) => {
        this.fieldLoading = false;
        console.error('Error:', err);
        alert('An error occurred while removing the field.');
      }
    });
  }
  approveField(key: string, value: any, index: number) {
    this.fieldLoading = true;
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    this.dataService.approveKeyValuePair(key, this.userId, stringValue).subscribe({
      next: (response) => {
        this.fieldLoading = false;
        console.log('Response:', response);
        if (response.success) {
          this.disabledStates[index] = true;
          this.approveStates[index] = 'Approved';
          this.remainingField=response.message;
            this.fetchPendingRequests();

          const divToClick = document.getElementById('collapsibleDiv-' + index);
          if (divToClick) {
            divToClick.click();
          }
          this.helperService.showToast('Field approve successfully', Key.TOAST_STATUS_SUCCESS);

        } else {
          this.helperService.showToast('Failed to approve the field', Key.TOAST_STATUS_ERROR);
        }
      },
      error: (err) => {
        this.fieldLoading = false;
        console.error('Error:', err);
        alert('An error occurred while removing the field.');
      }
    });
  }

  closeDataRequestModal() {
    this.requestedData = [];
    this.userId = '';
    this.fieldLoading = false;
    this.isRequestedDataLoading = false;
    this.disabledStates = [];
    this.approveStates = [];
    this.isRejectModalOpen = false;
    this.rejectedReason = '';
  }

  isNumberExist: boolean = false;
  checkNumberExistance(index: number, number: string, uuid: string) {
    if (number.trim() === '') {
      if (index >= 0) {
        this.userList[index].isPhoneExist = false;
      }
      this.isNumberExist = false;
      console.log('Phone number is empty, skipping API call.');
    } else {
      this._onboardingService
        .checkEmployeeNumberExist(number, uuid)
        .subscribe((response: any) => {
          if (index >= 0) {
            this.userList[index].isPhoneExist = response;
          }
          this.isNumberExist = response;
        });
    }
  }

  user: UserReq = new UserReq();

  @ViewChild('userEditModal') userEditModal!: ElementRef;
  openUserEditModal(user: any) {
    this.isEmailExist = false;
    this.isNumberExist = false;
    this.user = JSON.parse(JSON.stringify(user));
    this.userEditModal.nativeElement.click();
  }

  selectedMethod: string = 'mannual';
  selectMethod(method: string) {
    if (method == 'excel') {
      this.selectedMethod = '';
      this.getReport();
      this.importModalOpen.nativeElement.click();
    } else {
      this.selectedMethod = method;
      this.userList = [];
      this.user = new UserReq();
      this.userList.push(this.user);
    }
  }

  emails: string[] = [];
  sendMailExcelUserFlag:boolean = false;
  @ViewChild("closeButtonExcelModal") closeButtonExcelModal!:ElementRef;
  sendEmailToUsers(sendMail:boolean) {
    this.sendMailExcelUserFlag = true;
    this.emails = this.onboardUserList.map(user => user.email).filter(email => email);
    // console.log(this.emails);

    this.dataService
        .sendEmails(this.emails,sendMail)
        .subscribe((response: any) => {
          console.log("Mail sent successfully");
          this.sendMailExcelUserFlag = false;
          this.closeButtonExcelModal.nativeElement.click();
          this.getUsersByFiltersFunction();
          this.getUser();
          const toastMessage = sendMail ? 'Mail sent Successfully.' : 'Operation completed without sending mail.';
          this.helperService.showToast(toastMessage, Key.TOAST_STATUS_SUCCESS);
        },
        (error) => {
          this.sendMailExcelUserFlag = false;
        }
      );
  }

  restrictToDigits(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }


  checkPhoneExistance(number: string) {
    if (number != '' && number.length >= 10) {
      this._onboardingService.checkEmployeeNumberExistBefore(number).subscribe(
        (response: any) => {
          this.isNumberExist = response;
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  checkEmailExistanceBefore(email: string) {
    // Basic email pattern check to ensure email has '@' and '.'
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && emailPattern.test(email)) {
      this._onboardingService.checkEmployeeEmailExistBefore(email).subscribe(
        (response: any) => {
          this.isEmailExist = response;
          if (response == false) {

          } else {

          }
        },
        (error) => {
          console.error('Error checking email existence', error);
        }
      );
    } else {
      // Handle invalid email format case if needed
      console.warn('Invalid email format');
    }
  }

  isSlackUserFlag:boolean=false;
  saveSlackUserIdViaEmailData(email : string) {
    this.isSlackUserFlag = true;
    this.dataService
        .saveSlackUserIdViaEmail(email)
        .subscribe((response: any) => {

          if(response.status === true) {
            this.isSlackUserFlag = false;
            this.reloadPage();
            this.helperService.showToast("Slack User Id Fetched Successfully!", Key.TOAST_STATUS_SUCCESS);
          }else{
            this.isSlackUserFlag = false;
            this.reloadPage();
            this.helperService.showToast("Sync failed: Please ensure the user exists in your Slack workspace!", Key.TOAST_STATUS_ERROR);
          }
        },
        (error) => {
          this.helperService.showToast("Sync failed: Please ensure the user exists in your Slack workspace!", Key.TOAST_STATUS_ERROR);
          this.isSlackUserFlag = false;
        }
      );
  }

  onboardingVia : string = '';
  getOnboardingVia() {
    debugger;
    this.dataService.getOrganizationDetails().subscribe(
      (data) => {
        this.onboardingVia = data.organization.onboardingVia;
      },
      (error) => {
        console.log(error);
      }
    );
  }


  downloadingFlag: boolean = false;
  downloadUserDataInExcelFormatMethodCall() {
    this.downloadingFlag = true;
    this.dataService
      .downloadUserDataInExcelFormat()
      .subscribe(
        (response) => {
          const downloadUrl = response.message;
      localStorage.setItem('downloadUrl', downloadUrl);
      this.downloadFileFromUrl(downloadUrl);
        },
        (error) => {
          console.log(error);
          this.downloadingFlag = false;
        }
      );
  }
  downloadFileFromUrl(downloadUrl: string) {
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = 'attendance.xlsx';
    downloadLink.click();
    this.downloadingFlag = false;
    localStorage.removeItem('downloadUrl');
  }




@ViewChild('addEmployeeModalButton') addEmployee!:ElementRef;
@ViewChild('sampleFileModalButton') bulkUpload!:ElementRef;
@ViewChild('duesWarningModalButton') duesWarning!:ElementRef;
  validateDuesInvoice(modal:any){
      if(modal == 'add'){
        this.addEmployee.nativeElement.click();
      }else{
        this.bulkUpload.nativeElement.click();
      }
  }



  // User Resignation start

  existExitPolicy: boolean = false;
  checkUserExist(){
    this.existExitPolicy = false
    this.dataService.checkUserExist(this.userUuid).subscribe((res: any) =>{
      if(res.status && res.object == 1){
        this.existExitPolicy = true;
      }
    })
  }

  @ViewChild('closeResignationButton') closeResignationButton!: ElementRef
  userResignationReq: UserResignation = new UserResignation();
  resignationToggle: boolean = false;
  submitResignation(form: NgForm){

    this.resignationToggle = true;
    this.userResignationReq.createdBy = 'ADMIN'
    this.userResignationReq.uuid = this.userUuid
    this.userResignationReq.userExitTypeId = this.userExitTypeId

    this.dataService.submitResignation(this.userResignationReq).subscribe((res: any) => {
        if(res.status){
          this.resignationToggle =false
          this.userResignationReq.userExitTypeId = 0
          this.userExitTypeId = 0
          this.getUsersByFiltersFunction();
          this.closeResignationButton.nativeElement.click()
          this.clearResignationForm();
          form.resetForm();
        }
    })

  }

  userExitTypeList: any[] = []
  userExitTypeId: number = 0
  getUserExitType() {
    this.userExitTypeList = []
    this.dataService.getUserExitPolicyType().subscribe((res: any) => {

      if (res.status) {
        this.userExitTypeList = res.object;
      }

    }, error => {
      console.log('something went wrong')
    })
  }


  selectUserExitType(expense: any) {
    console.log('expense: ', expense)
    // this.expenseTypeName = expense.name
    this.userExitTypeId = expense
    console.log('jhgf',this.userExitTypeId)
  }

  clearResignationForm(){
    this.recommendDay = ''
    this.userResignationReq.uuid =''
    this.userResignationReq.reason = ''
    this.userResignationReq.comment = ''
    this.userResignationReq.isManagerDiscussion = 0
    this.userResignationReq.isRecommendLastDay = 0
    this.userResignationReq.createdBy = ''
    this.userResignationReq.url = ''
    this.userResignationReq = new UserResignation();
  }

  closeResignationModal(form: NgForm){
    form.resetForm();
    this.clearResignationForm();
  }

  recommendDay: string = ''; // Default selected value
  selectRecommendDay(value: string): void {

    this.userResignationReq.lastWorkingDay = ''

    this.userResignationReq.isRecommendLastDay = value == 'Other' ? 1 : 0

    if(this.userResignationReq.isRecommendLastDay == 0){
      this.userResignationReq.lastWorkingDay = ''
      this.calculateLasWorkingDay();
    }

  }

   // Function to disable future dates
   disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date

    // Disable dates from today to maxDate (inclusive)
    return current < today || current > maxDate;
  };

  calculateLasWorkingDay(){
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date
    this.userResignationReq.lastWorkingDay = this.helperService.formatDateToYYYYMMDD(maxDate);
    // console.log("Max Date: ", this.lastWorkingDay);
  }

  selectLastWorkingDay(startDate: Date) {
    debugger
    if (this.userResignationReq.isRecommendLastDay == 0 && startDate) {
      this.userResignationReq.lastWorkingDay = this.helperService.formatDateToYYYYMMDD(startDate);
    }
  }

  noticePeriodDuration: number = 0;
  getNoticePeriodDuration(){
    this.dataService.getNoticePeriodDuration(this.userUuid).subscribe((res: any) => {
      if(res.status){
        this.noticePeriodDuration = res.object
        console.log('Duration: ',this.noticePeriodDuration)
      }
    })
  }

  userUuid: string = ''

  getUserUuid(uuid: string){
    this.userResignationReq = new UserResignation();
    this.userResignationReq.userExitTypeId = 0
    this.userExitTypeId = 0

    this.userUuid = uuid;

    this.getUserExitType()
    this.getNoticePeriodDuration();
  }
  exitData: any;
  showExitModal:boolean=false;
  onInitiateExitClick(uuid:string) {
    console.log('Initiate Exit Clicked');
    this.exitData = {};
      this.exitData.uuid = uuid;
      this.exitData.userType = 'ADMIN';
      this.exitData.isModal = 0;
      this.showExitModal=true;
    // this.modalService.openInitiateExitModal(uuid, 'ADMIN').then(
    //   (result) => {
    //     this.loadResignations();
    //     this.getUsersCountByStatus();
    //   },
    //   (reason) => {
    //     this.loadResignations();
    //     this.getUsersCountByStatus();
    //   }
    // );
  }


  // User Resignation end

  pendingRequests:any;
  currentPage1: number = 1;
  pageSize1: number = 12;
  totalItems1: number = 0;
  isEditDataLoading:boolean=false;
  fetchPendingRequests(): void {
    this.isEditDataLoading=true;
    this.dataService.getPendingRequests(this.currentPage1, this.pageSize1).subscribe(response => {
      this.isEditDataLoading=false;
      this.pendingRequests = response.content;  // Adjust based on the response structure
      this.totalItems1 = response.totalElements;  // Adjust based on the response structure
    }
  );
  }

  isModalOpen: boolean[] = [];
  toggleModal(index: number): void {
    this.isModalOpen[index] = !this.isModalOpen[index];
  }
  // Method to change page
  changePage1(page: number): void {
    this.currentPage1 = page;
    this.fetchPendingRequests();
  }

  counTDataInString(jsonString:string):number{
    const jsonObject = JSON.parse(jsonString);
    return this.countDataFields(jsonObject);
  }

  countDataFields(obj: any): number {
    let count = 0;

    // Loop through the object's properties
    for (let key in obj) {
      // Skip 'id' fields
      if (key === 'id') {
        continue;
      }

      // If the property is an object, recursively count its fields
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // If it's an array, loop through each object inside
        if (Array.isArray(obj[key])) {
          for (let item of obj[key]) {
            count += this.countDataFields(item); // Recursively count fields inside the object
          }
        } else {
          count += this.countDataFields(obj[key]); // Recursively count fields inside the object
        }
      } else {
        count += 1; // It's a data field (not 'id' or an object)
      }
    }

    return count;
  }


  jobTitles: string[] = [
    'Accountant',
    'Accounting Manager',
    'Administrative Assistant',
    'AI Developer (Artificial Intelligence)',
    'Angular Developer',
    'AR/VR Developer (Augmented Reality / Virtual Reality)',
    'Assembly Line Worker',
    'Automation Test Engineer',
    'Back-End Developer',
    'Bioinformatics Developer',
    'Blockchain Developer',
    'Brand Manager',
    'Business Analyst',
    'Business Development Executive',
    'Business Development Manager',
    'Buyer',
    'Call Center Agent',
    'Cash Manager',
    'Chief Financial Officer (CFO)',
    'Civil Engineer',
    'Cloud Developer (AWS Developer, Azure Developer, etc.)',
    'Communications Director',
    'Communications Specialist',
    'Compliance Analyst',
    'Compliance Officer',
    'Content Writer',
    'Corporate Lawyer',
    'Corporate Social Responsibility Manager',
    'Corporate Trainer',
    'Creative Director',
    'Customer Service Manager',
    'Customer Service Representative',
    'Database Administrator',
    'Database Developer',
    'Data Warehouse Developer',
    'Desktop Application Developer',
    'DevOps Developer',
    'Digital Marketing Specialist',
    'Distribution Manager',
    'Electrical Engineer',
    'Embedded Systems Developer',
    'EHS Manager',
    'Engineering Manager',
    'Environmental Analyst',
    'Environmental Engineer',
    'Event Coordinator',
    'Executive Assistant',
    'Facilities Manager',
    'Finance Manager',
    'Financial Analyst',
    'Front-End Developer',
    'Full Stack Developer',
    'Game Developer',
    'General Counsel',
    'Go Developer',
    'Graphic Designer',
    'Green Program Manager',
    'Health and Safety Officer',
    'Help Desk Technician',
    'Helpdesk Technician',
    'HR Generalist',
    'HR Manager',
    'HTML/CSS Developer',
    'Human Resources',
    'Information Technology (IT)',
    'Investment Analyst',
    'Inventory Manager',
    'Inventory Specialist',
    'IT Manager',
    'Java Developer',
    'JavaScript Developer',
    'Junior Software Developer',
    'Lead Developer / Technical Lead',
    'Learning and Development Specialist',
    'Legal Assistant',
    'Logistics Coordinator',
    'Logistics Manager',
    'Machine Learning Developer',
    'Maintenance Manager',
    'Maintenance Technician',
    'Manufacturing Engineer',
    'Market Research Analyst',
    'Marketing Manager',
    'Mechanical Engineer',
    'Media Relations Coordinator',
    'Mobile App Developer (Android Developer, iOS Developer)',
    'Network Engineer',
    'Node.js Developer',
    'Office Manager',
    'Operations Analyst',
    'Operations Manager',
    'Paralegal',
    'Payroll Clerk',
    'Payroll Specialist',
    'PHP Developer',
    'Plant Manager',
    'Plumber',
    'Product Designer',
    'Product Developer',
    'Product Manager',
    'Production Manager',
    'Production Planner',
    'Program Manager',
    'Project Coordinator',
    'Project Manager',
    'Public Relations Officer',
    'Procurement Manager',
    'Process Improvement Specialist',
    'Product Development',
    'Product Owner (in a software development context)',
    'Project Management',
    'Public Relations',
    'Purchasing Agent',
    'Python Developer',
    'QA Developer',
    'Quality Assurance Manager',
    'Quality Control Inspector',
    'Quality Control Technician',
    'Quality Inspector',
    'React Developer',
    'Receptionist',
    'Recruiter',
    'Regulatory Affairs Manager',
    'Research and Development (R&D)',
    'Research and Development Engineer',
    'Research Scientist',
    'Risk Analyst',
    'Risk Manager',
    'Robotics Developer',
    'Ruby Developer',
    'R&D Engineer',
    'R&D Manager',
    'Sales Manager',
    'Sales Representative',
    'Scrum Master',
    'Scala Developer',
    'Security Developer',
    'Senior Software Developer',
    'SEO Specialist',
    'Software Architect',
    'Software Development Manager',
    'Software Engineer',
    'Software Test Developer',
    'Software Tester',
    'Software Development',
    'Software Test Developer',
    'Software Tester',
    'Sourcing Manager',
    'Supply Chain Analyst',
    'Supply Chain Manager',
    'Sustainability Coordinator',
    'Sustainability Manager',
    'Systems Administrator',
    'Systems Software Developer',
    'Tax Specialist',
    'Training and Development Officer',
    'Training Manager',
    'Transportation Coordinator',
    'Treasury Analyst',
    'Treasurer',
    'UI (User Interface) Developer',
    'UX (User Experience) Developer',
    'Vue.js Developer',
    'Web Designer',
    'Web Developer',
    'Workplace Safety Officer',
  ];

  resignationCount: number = 0;
  editProfileCount: number = 0;
  resignationUsersImage: String[] = [];
  empProfileEditRequestUsersImage: string[] = [];
  getUsersCountByStatus() {
    this.dataService.getUsersCountByStatus().subscribe(
      (response: any) => {
        this.resignationCount = response.object.totalResignRequest;
        this.editProfileCount = response.object.totalProfileEditRequest;
        this.resignationUsersImage = response.object.resignationUsersImage;
        this.empProfileEditRequestUsersImage = response.object.empProfileEditRequestUsersImage;
      },
      (error) => {
        console.error('Error fetching user count by status:', error);
      }
    );
  }


  loadingFlag: boolean = false;
  enableEmailNotification: boolean = false;
  enableWhatsAppNotification: boolean = false;

  onNotificationChange(type: string) {
    this.enableWhatsAppNotification = type === 'whatsapp';
    this.enableEmailNotification = type === 'email';
  }

  // sendNotifications(): void {
  //   this.loadingFlag = true;
  //   const notifications = this.onboardUserList.map((user) => ({
  //     id: user.id,
  //     emailNotificationEnabled: user.emailNotificationEnabled,
  //     whatsappNotificationEnabled: user.whatsappNotificationEnabled,
  //   }));

  //   this.dataService.sendNotifications(notifications).subscribe({
  //     next: (response) => {
  //         this.closeButtonExcelModal.nativeElement.click();
  //         this.getUsersByFiltersFunction();
  //         this.getUser();
  //         this.helperService.showToast("Notifications sent Successfully.", Key.TOAST_STATUS_SUCCESS);
  //       // console.log('Notifications sent successfully:', response);
  //       this.loadingFlag = false;
  //     },
  //     error: (err) => {
  //       this.helperService.showToast("Error While Sending Notification", Key.TOAST_STATUS_ERROR);
  //       // console.error('Error sending notifications:', err);
  //       this.loadingFlag = false;
  //     },
  //   });
  // }

  sendNotifications(): void {
    // if (!this.enableEmailNotification && !this.enableWhatsAppNotification) {
    //   this.helperService.showToast(
    //     'Please select at least one notification type to proceed.',
    //     'error'
    //   );
    //   return;
    // }

    this.loadingFlag = true;

    // Filter users based on toggled notification preferences
    // const emailUsers = this.enableEmailNotification
    //   ? this.onboardUserList
    //     .filter((user) => user.emailNotificationEnabled && user.email)
    //     .map((user) => user.email)
    //   : [];

    // const whatsappUsers = this.enableWhatsAppNotification
    //   ? this.onboardUserList
    //     .filter((user) => user.whatsappNotificationEnabled && user.phone)
    //     .map((user) => user.phone)
    //   : [];
    const emailUsers:string[]=[]
    const whatsappUsers:string[] =this.onboardUserList.filter((user) =>user.phone).map((user) => user.phone)
    //     .map((user) => user.phone)
    //  this.enableWhatsAppNotification
    //   ? this.onboardUserList
    //     .filter((user) => user.whatsappNotificationEnabled && user.phone)
    //     .map((user) => user.phone)
    //   : [];

    // Prepare request payload
    const notificationRequest = {
      emailUsers,
      whatsappUsers,
    };

    this.dataService.sendNotifications(notificationRequest).subscribe({
      next: () => {
        this.helperService.showToast(
          'Notifications sent successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
        this.enableEmailNotification = false;
        this.enableWhatsAppNotification = false;
        this.closeButtonExcelModal.nativeElement.click();
        this.getUsersByFiltersFunction();
        this.getUser();
        this.loadingFlag = false;
      },
      error: () => {
        this.helperService.showToast(
          'Error while sending notifications.',
          Key.TOAST_STATUS_ERROR
        );
        this.loadingFlag = false;
      },
    });
  }
  @ViewChild('viewExitRequestDismiss') viewExitRequestDismiss!: ElementRef

  onExitComponentClose() {
      this.viewExitRequestDismiss.nativeElement.click()

  }
  closeNotificationModalFlag: boolean = false;

  closeNotificationModal() {
    this.closeNotificationModalFlag = true;
    this.closeButtonExcelModal.nativeElement.click();
    this.getUsersByFiltersFunction();
    this.getUser();
    this.closeNotificationModalFlag = false;
  }
  changeShowFilter(flag : boolean) {
    this.showFilter = flag;
  }


}
