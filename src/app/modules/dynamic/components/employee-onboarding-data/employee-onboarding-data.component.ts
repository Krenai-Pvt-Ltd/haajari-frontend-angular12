import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {  NgForm } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { BehaviorSubject } from 'rxjs';
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

export interface Team {
  label: string;
  value: string;
}

@Component({
  selector: 'app-employee-onboarding-data',
  templateUrl: './employee-onboarding-data.component.html',
  styleUrls: ['./employee-onboarding-data.component.css'],
})
export class EmployeeOnboardingDataComponent implements OnInit {
  @ViewChild('inviteModal') inviteModal!: ElementRef;
  @ViewChild('closeInviteModal') closeInviteModal!: ElementRef;
  @ViewChild('personalInformationForm') personalInformationForm!: NgForm;
  userPersonalInformationRequest: UserPersonalInformationRequest =
    new UserPersonalInformationRequest();

    @ViewChild('importModalOpen') importModalOpen!: ElementRef;
  constructor(
    private dataService: DataService,
    private activateRoute: ActivatedRoute,
    private _onboardingService: OrganizationOnboardingService,
    private router: Router,
    private helperService: HelperService,
    private modalService: NgbModal,
    private http: HttpClient,
    private _subscriptionService:SubscriptionPlanService
  ) {}
  users: EmployeeOnboardingDataDto[] = [];
  filteredUsers: Users[] = [];
  itemPerPage: number = 12;
  pageNumber: number = 1;
  total!: number;
  rowNumber: number = 1;
  sampleFileUrl: string = '';
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  userList: UserReq[] = new Array();

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
    this.router.navigate(['/employee-profile'], navExtra);
  }

  randomUserUrl = 'http://localhost:8080/api/v2/users/fetch-team-list-user';
  searchChange$ = new BehaviorSubject('');
  optionList: string[] = [];
  selectedUser?: string;
  isLoading = false;

  // onSearch(value: string): void {
  //   this.isLoading = true;
  //   this.searchChange$.next(value);
  // }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.sampleFileUrl =
      'https://firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/Hajiri%2FSample%2FEmployee_Details_Sample%2Femployee_details_sample.xlsx?alt=media';
    // this.isUserShimer=true;
    this.getEmployeesOnboardingStatus();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
    // this.getEmpLastApprovedAndLastRejecetdStatus();
    this.getUsersByFiltersFunction();
    this.getTeamNames();
    this.getLeaveNames();
    this.getUser();
    this.selectMethod('mannual');
    this.getShiftData();
    this.getOnboardingVia();
    this.selectStatus('ACTIVE');

    const storedDownloadUrl = localStorage.getItem('downloadUrl');

    if (storedDownloadUrl) {
      this.downloadingFlag = true;
      this.downloadFileFromUrl(storedDownloadUrl);
    }

    // const getRandomNameList = (): Observable<string[]> =>
    //   this.http.get<string[]>(`${this.randomUserUrl}`).pipe(
    //     catchError(() => of([])),
    //     map((res: string[]) => res.map((team) => team)) // Adjust the mapping here
    //   );

    // const optionList$: Observable<string[]> = this.searchChange$
    //   .asObservable()
    //   .pipe(debounceTime(500))
    //   .pipe(switchMap(getRandomNameList));

    // optionList$.subscribe((data) => {
    //   this.optionList = data;
    //   this.isLoading = false;
    // });
    this._subscriptionService.isSubscriptionPlanExpired();
  }

  isUserShimer: boolean = true;
  placeholder: boolean = false;
  errorToggleTop: boolean = false;
  isMainPlaceholder: boolean = false;
  // selectSearchCriteria(option: string) {
  //   this.searchCriteria = option;
  // }
  debounceTimer: any;
  getUsersByFiltersFunction(debounceTime: number = 300) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.isUserShimer = true;
    this.debounceTimer = setTimeout(() => {
      this.dataService
        .getUsersByFilterForEmpOnboarding(
          this.itemPerPage,
          this.pageNumber,
          'asc',
          'id',
          this.searchText,
          this.searchCriteria

        )
        .subscribe(
          (response: any) => {
            this.users = response.users;
            this.total = response.count;

            if(this.searchText == '' && response.count <1) {
              this.isMainPlaceholder = true;
            }else {
              this.isMainPlaceholder = false;
            }
            if (this.users == null) {
              this.users = [];
            }
            if (this.users.length == 0) {
              this.placeholder = true;
              // this.errorToggleTop = false;
              // this.searchUserPlaceholderFlag=true;
            } else {
            }

            this.isUserShimer = false;
          },
          (error) => {
            this.isUserShimer = false;
            this.errorToggleTop = true;
            // const res = document.getElementById(
            //   'error-page'
            // ) as HTMLElement | null;

            // if (res) {
            //   res.style.display = 'block';
            // }
          }
        );
    }, debounceTime);
  }

  text = '';
  changeStatus(presenceStatus: Boolean, uuid: string) {
    debugger;
    this.dataService.changeStatusById(presenceStatus, uuid).subscribe(
      (data) => {
        // location.reload();
        this.getUsersByFiltersFunction();
        // this.helperService.showToast("User disabled");
      },
      (error) => {
        this.getUsersByFiltersFunction();
        // location.reload();
      }
    );
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    this.getUsersByFiltersFunction();
  }

  selectedStatus: string | null = null;

  selectStatus(status: string) {
    if (status == 'ALL') {
      this.selectedStatus = 'All';
      this.searchUsers('any');
    } else {
      this.selectedStatus = status;
      this.searchUsers(status);
    }
    this.search = ''; // Clear the search box text
    this.crossFlag = false;
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
    // this.searchUserPlaceholderFlag=true;
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

    // if ((this.searchText === '' )||(this.searchText=="APPROVED") || (this.searchText=="PENDING" ) ||(this.searchText =="REJECTED")) {
    //   this.crossFlag = false;
    // }
  }

  // reloadPage() {
  //   location.reload();
  // }

  reloadPage() {
    this.search = '';
    this.searchText = '';
    this.searchCriteria = '';
    this.pageNumber = 1;
    this.itemPerPage = 12;
    this.getUsersByFiltersFunction();
    this.crossFlag = false;
    // location.reload();
  }

  // searchUsers(searchString:string) {
  //   this.crossFlag = true;
  //   if(searchString=='A'){
  //   this.searchText= "APPROVED"
  //   this.searchCriteria = "employeeOnboardingStatus"
  //   this.getUsersByFiltersFunction();
  // }else if(searchString=='P'){
  //   this.searchText= "PENDING"
  //   this.searchCriteria = "employeeOnboardingStatus"
  //   this.getUsersByFiltersFunction();
  // }else if(searchString=='R'){
  //   this.searchText= "REJECTED"
  //   this.searchCriteria = "employeeOnboardingStatus"
  //   this.getUsersByFiltersFunction();
  // }if(searchString=='any'){
  //   this.searchText= this.search
  //   this.searchCriteria = '';
  //   this.getUsersByFiltersFunction();
  // }
  //   // this.getUsersByFiltersFunction();
  //   if (this.searchText == '') {
  //     this.crossFlag = false;
  //   }
  // }

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

  verificationCount: any = {};

  getEmployeesOnboardingStatus() {
    debugger;
    this.dataService.getEmployeesStatus().subscribe(
      (data) => {
        this.verificationCount = data;
      },
      (error) => {}
    );
  }

  employeeStatus: any = {};

  // lastApproved: User[] = [];
  // lastRejected: User[] = [];

  isPendingShimmer: Boolean = false;
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
    // this.isPendingShimmer=true;
    debugger;
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

        // this.networkConnectionErrorPlaceHolder=false;
        // if(this.employeeStatus!=null){
        //  this.lastApproved= this.employeeStatus.lastApprovedUser;
        //  this.lastRejected= this.employeeStatus.lastRejectedUser;
        // }
        // console.log(this.lastApproved);
        // console.log(this.lastRejected);
      },
      (error) => {
        this.isPendingShimmer = false;
        this.networkConnectionErrorPlaceHolder = true;
      }
    );
  }

  // Define a new flag
  emailAlreadyExists = false;
  toggle = false;
  setEmployeePersonalDetailsMethodCall() {
    // Reset the flag
    this.emailAlreadyExists = false;

    this.toggle = true;
    const userUuid = '';
    this.dataService
      .setEmployeePersonalDetails(
        this.userPersonalInformationRequest,
        userUuid,
        this.selectedTeamIds,
        this.selectedShift,
        this.selectedLeaveIds
      )
      .subscribe(
        (response: UserPersonalInformationRequest) => {
          this.toggle = false;

          // Check if the response indicates the email already exists
          if (response.statusResponse === 'existed') {
            this.emailAlreadyExists = true; // Set the flag to display the error message
            this.toggle = false;
          } else {
            this.clearForm();
            this.closeModal();
          }
          this.selectedTeamIds = [];
          this.selectedLeaveIds = [];
          this.selectedTeams = [];
          this.selectedShift = 0;
          this.getUsersByFiltersFunction();
          this.helperService.showToast(
            'Email sent successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          console.error(error);
          this.toggle = false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  shiftList: { value: number, label: string }[] = [];
  selectedShift: number = 0;
  selectedLeave: number = 0;
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

  // loadingDeleteUser: { [key: string]: boolean } = {};
  // disableUserLoader(user: any): boolean {
  //   return this.loadingDeleteUser[user.id] || false;
  // }

  sendingMailLoaderForUser(user: any): boolean {
    return this.loadingStatus[user.email] || false;
  }

  // sendingMailLoader = false;
  loadingStatus: { [key: string]: boolean } = {};

  // requestFlag:boolean=false;
  sendMailToEmployees(user: any) {
    // this.sendingMailLoader = true;
    debugger;
    const userEmail = user.email;
    this.loadingStatus[userEmail] = true;
    this.dataService
      .sendMailToEmployeesToCompleteOnboarding(userEmail)
      .subscribe(
        (response) => {
          // this.requestFlag=true;
          this.getUsersByFiltersFunction();
          this.getEmpLastApprovedAndLastRejecetdStatus();
          this.getEmployeesOnboardingStatus();
          // location.reload();
          // this.sendingMailLoader=false;
          this.loadingStatus[userEmail] = false;

          this.helperService.showToast(
            'Email sent successfully!',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          // console.error(error);
          // location.reload();
          this.loadingStatus[userEmail] = false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  // Reset the model
  resetForm() {
    if (this.personalInformationForm) {
      this.personalInformationForm.reset();
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

  // deleteConfirmationModalRef!: NgbModalRef;

  @ViewChild('deleteConfirmationModal') deleteConfirmationModal: any;

  openDeleteConfirmationModal(userId: number) {
    this.currentUserId = userId;
    // this.deleteConfirmationModalRef = this.modalService.open(this.deleteConfirmationModal);
  }

  deleteUser() {
    if (this.currentUserId !== null) {
      this.disableUser(this.currentUserId);
      // this.modalService.dismissAll();
      this.currentUserId = null;
    }
  }

  closeDeleteModal() {
    this.deleteConfirmationModal.nativeElement.click();
  }

  // dismissModal() {
  //   this.modalService.dismissAll();
  // }

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
  // onTeamSelectionChange(selectedTeams: string[]): void {
  //   this.selectedTeamIds = selectedTeams.map((id) => parseInt(id, 10));
  //   console.log('Selected team IDs:', this.selectedTeams);
  // }

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



  fileName: any;
  currentFileUpload: any;


  expectedColumns: string[] = ['S. NO.*', 'Name*', 'Phone*', 'Email*', 'Shift*', 'LeaveNames'];
  isExcel: string = '';
  data: any[] = [];
  mismatches: string[] = [];
  invalidRows: boolean[] = []; // Track invalid rows
  invalidCells: boolean[][] = []; // Track invalid cells

  selectFile(event: any) {
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
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const binaryStr = this.arrayBufferToString(arrayBuffer);
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Reset data and error tracking
        this.data = [];
        this.invalidRows = [];
        this.invalidCells = [];

        const columnNames: string[] = jsonData[0] as string[];

        if (this.validateColumns(columnNames)) {
          // Always process the rows, regardless of validity
          this.data = jsonData.filter((row: any[]) =>
            row.some((cell: any) => cell !== undefined && cell !== null && cell.toString().trim() !== '')
          );

          // Validate all rows and keep track of invalid entries
          this.validateRows(this.data);
          if(this.areAllFalse()){
            this.uploadUserFile(file, this.fileName);
          }


        } else {
          console.error('Invalid column names');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  areAllFalse(): boolean {
    return this.invalidCells.reduce((acc, row) => acc.concat(row), []).every(value => value === false);
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
    this.mismatches = []; // Reset mismatches
    if (columnNames.length !== this.expectedColumns.length) {
      console.error(`Column length mismatch: expected ${this.expectedColumns.length}, but got ${columnNames.length}`);
    }

    for (let i = 0; i < Math.max(this.expectedColumns.length, columnNames.length); i++) {
      const expectedColumn = this.expectedColumns[i]?.trim() || 'undefined';
      const actualColumn = columnNames[i]?.trim() || 'undefined';

      if (actualColumn !== expectedColumn) {
        this.mismatches.push(`Column ${i + 1}: expected "${expectedColumn}", but got "${actualColumn}"`);
      }
    }

    if (this.mismatches.length > 0) {
      console.error('Column mismatches found:');
      this.mismatches.forEach(mismatch => console.error(mismatch));
      return false;
    }
    return true;
  }

  validateRows(rows: any[]): void {
    this.invalidRows = new Array(rows.length).fill(false); // Reset invalid rows
    this.invalidCells = Array.from({ length: rows.length }, () => new Array(this.expectedColumns.length).fill(false)); // Reset invalid cells

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let rowIsValid = true;

      for (let j = 1; j < this.expectedColumns.length-1; j++) {
        const cellValue = row[j];
        if (cellValue === undefined || cellValue === null || cellValue.toString().trim() === '') {
          rowIsValid = false;
          this.invalidRows[i] = true; // Mark the row as invalid
          this.invalidCells[i][j] = true; // Mark the cell as invalid
        }
      }
    }
  }

  onMultiSelectChange(event: any, rowIndex: number, colIndex: number) {
    const selectedOptions = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.data[rowIndex][colIndex] = selectedOptions.join(', ');
  }

  saveFile() {
    const stringifiedData = this.data.map((row: any[]) =>
      row.map(cell => cell !== null && cell !== undefined ? String(cell) : '')
    );
    const ws = XLSX.utils.aoa_to_sheet(stringifiedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'edited_file.xlsx');

    const file = new File([blob], 'edited_file.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

  // Create a fake event to pass to selectFile
  const event = new Event('change');
  Object.defineProperty(event, 'target', { writable: false, value: { files: dataTransfer.files } });
  this.selectFile(event);
  }



  importToggle: boolean = false;
  isProgressToggle: boolean = false;
  isErrorToggle: boolean = false;
  errorMessage: string = '';

  alreadyUsedPhoneNumberArray: any = [];
  alreadyUsedEmailArray: any = [];
  uploadUserFile(file: any, fileName: string) {
    debugger;
    this.importToggle = true;
    this.isProgressToggle = true;
    this.isErrorToggle = false;
    this.errorMessage = '';
    this._onboardingService.userImport(file, fileName).subscribe(
      (response: any) => {
        if (response.status) {
          this.importToggle = false;
          this.isProgressToggle = false;
          this.getReport();
          this.getUser();
          // console.log(this.onboardUserList.length);
          this.alreadyUsedPhoneNumberArray = response.arrayOfString;
          this.alreadyUsedEmailArray = response.arrayOfString2;
        } else {
          this.importToggle = true;
          this.isErrorToggle = true;
          this.isProgressToggle = false;
          this.errorMessage = response.message;
        }

        // this.importToggle = false;
      },
      (error) => {
        this.importToggle = true;
        this.isErrorToggle = true;
        this.isProgressToggle = false;
        this.errorMessage = error.error.message;
      }
    );
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

  onboardUserList: any[] = new Array();
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

  formatAsCommaSeparated(items: string[]): string {
    return items.join(', ');
  }


  deleteNewUser(id: number) {
    this._onboardingService.deleteOnboardUser(id).subscribe(
      (response: any) => {
        if (response.status) {
          this.getUser();
        }
      },
      (error) => {}
    );
  }



  isEmailExist: boolean = false;
  checkEmailExistance(index: number, email: string, uuid: string) {
    debugger;
    // this.userList[index].isEmailExist = false;
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
          // console.log(response);
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
  sendEmailToUsers() {
    this.sendMailExcelUserFlag = true;
    this.emails = this.onboardUserList.map(user => user.email).filter(email => email);
    // console.log(this.emails);

    this.dataService
        .sendEmails(this.emails)
        .subscribe((response: any) => {
          console.log("Mail sent successfully");
          this.sendMailExcelUserFlag = false;
          this.closeButtonExcelModal.nativeElement.click();
          this.getUsersByFiltersFunction();
          this.getUser();
          this.helperService.showToast(
            'Mail sent Successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          this.sendMailExcelUserFlag = false;
        }
      );
  }

  restrictToDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.value = input.value.replace(/[^0-9]/g, '');
    }
  }

  // shiftList: OrganizationShift[] = [];
  // getShiftData(){
  //   this.dataService.getShifts().subscribe((response) => {
  //     this.organizationShift = response.listOfObject;
  //   }, (error) => {

  //   })
  // }

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
            // console.log("success");
            this.reloadPage();
            this.helperService.showToast("Slack User Id Fetched Successfully!", Key.TOAST_STATUS_SUCCESS);
          }else{
            this.isSlackUserFlag = false;
            // console.log("success");
            this.reloadPage();
            this.helperService.showToast("Sync failed: Please ensure the user exists in your Slack workspace!", Key.TOAST_STATUS_ERROR);
          }
        },
        (error) => {
          this.helperService.showToast("Sync failed: Please ensure the user exists in your Slack workspace!", Key.TOAST_STATUS_ERROR);
          this.isSlackUserFlag = false;
          // console.log("error");
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
    // console.log("================validate======",modal);
    if(this._subscriptionService.isDuesInvoice){
      this.duesWarning.nativeElement.click();
    }else{
      if(modal == 'add'){
        this.addEmployee.nativeElement.click();
      }else{
        this.bulkUpload.nativeElement.click();
      }
    }
  }

}
