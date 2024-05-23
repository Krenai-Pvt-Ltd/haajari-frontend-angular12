import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import { Key } from 'src/app/constant/key';
import {
  FullLeaveLogsResponse,
  PendingLeaveResponse,
  PendingLeavesResponse,
} from 'src/app/models/leave-responses.model';
import { UserDto } from 'src/app/models/user-dto.model';
import { UserLeaveRequest } from 'src/app/models/user-leave-request';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css'],
})
export class LeaveManagementComponent implements OnInit {
  // fullLeaveLogs!: FullLeaveLogsResponse[];
  fullLeaveLogs: any[] = [];
  pendingLeaves: any[] = [];
  approvedRejectedLeaves: any[] = [];
  // pendingLeaves!: PendingLeavesResponse[];
  // approvedRejectedLeaves!: PendingLeavesResponse[];
  specificLeaveRequest!: PendingLeaveResponse;
  searchString: string = '';
  selectedTeamName: string = '';
  page = 0;
  size = 10;
  userLeaveForm!: FormGroup;
  // hasMoreData = true;
  initialLoadDone = false;
  @ViewChild('logContainer') logContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private firebaseStorage: AngularFireStorage,
    private rbacService: RoleBasedAccessControlService,
    public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage
  ) {
    {
      this.userLeaveForm = this.fb.group({
        startDate: ['', Validators.required],
        endDate: [''],
        leaveType: ['', Validators.required],
        managerId: ['', Validators.required],
        optNotes: ['', Validators.required],
        halfDayLeave: [false],
        dayShift: [false],
        eveningShift: [false],
      });
    }
  }

  get StartDate() {
    return this.userLeaveForm.get('startDate');
  }
  get EndDate() {
    return this.userLeaveForm.get('endDate');
  }
  get LeaveType() {
    return this.userLeaveForm.get('leaveType');
  }
  get ManagerId() {
    return this.userLeaveForm.get('managerId');
  }
  get OptNotes() {
    return this.userLeaveForm.get('optNotes');
  }

  logInUserUuid: string = '';
  ROLE: string | null = '';
  currentNewDate: any;
  currentDate: Date = new Date();

  async ngOnInit(): Promise<void> {
    window.scroll(0, 0);
    this.logInUserUuid = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();

    this.getFullLeaveLogs();
    this.getPendingLeaves();
    this.getApprovedRejectedLeaveLogs();
    this.getWeeklyChartData();
    this.getMonthlyChartData();
    this.getTotalConsumedLeaves();
    if (this.ROLE !== 'USER') {
      this.getTeamNames();
    }

    this.fetchManagerNames();
    this.getUserLeaveReq();
    this.getTotalCountOfPendingLeaves();
    // this.currentNewDate = moment(this.currentDate).format('yyyy-MM-DD');
    this.currentNewDate = moment(this.currentDate)
      .startOf('month')
      .format('YYYY-MM-DD');
  }

  debounceTimer: any;
  fullLeaveLogSize!: number;
  isFullLeaveLoader: boolean = false;
  getFullLeaveLogs(debounceTime: number = 300) {
    return new Promise((resolve, reject) => {
      this.isFullLeaveLoader = true;
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.dataService
          .getFullLeaveLogsRoleWise(
            this.searchString,
            this.selectedTeamName,
            this.page,
            this.size
          )
          .subscribe({
            next: (response) => {
              if (Array.isArray(response.object)) {
                // Check if response.object is an array
                this.fullLeaveLogs = [
                  ...this.fullLeaveLogs,
                  ...response.object,
                ];
                // this.hasMoreData = response.object.length === this.size;
                this.fullLeaveLogSize = this.fullLeaveLogs.length;
                this.isFullLeaveLoader = false;
              } else {
                console.error('Expected an array but got:', response.object);
              }
            },
            error: (error) => {
              this.isFullLeaveLoader = false;
              console.error('Failed to fetch full leave logs:', error);
              this.helperService.showToast(
                'Failed to load full leave logs.',
                Key.TOAST_STATUS_ERROR
              );
            },
            // next: (response) => { this.fullLeaveLogs = response.object
            //   this.fullLeaveLogSize = this.fullLeaveLogs.length;
            // },
            // error: (error) => {
            //   console.error('Failed to fetch full leave logs:', error);
            //   this.helperService.showToast("Failed to load full leave logs.", Key.TOAST_STATUS_ERROR);
            // }
          });
      }, debounceTime);
    });
  }

  scrollDownRecentActivity(event: any) {
    if (!this.initialLoadDone) return;
    const target = event.target as HTMLElement;
    const atBottom =
      target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

    if (atBottom) {
      this.page++;
      this.getFullLeaveLogs();
    }
  }

  loadMoreLogs() {
    this.initialLoadDone = true;
    this.page++;
    // this.size += 10;
    this.getFullLeaveLogs();
    setTimeout(() => {
      this.scrollToBottom();
    }, 500);
  }

  scrollToBottom() {
    if (this.logContainer) {
      this.logContainer.nativeElement.scrollTop =
        this.logContainer.nativeElement.scrollHeight;
    }
  }

  searchLeaves() {
    this.page = 0;
    this.size = 10;
    this.fullLeaveLogs = [];
    this.getFullLeaveLogs();
  }

  selectTeam(teamName: string) {
    this.page = 0;
    this.size = 10;
    this.fullLeaveLogs = [];
    this.selectedTeamName = teamName;
    this.getFullLeaveLogs();
  }
  clearSearchUsers() {
    this.page = 0;
    this.size = 10;
    this.fullLeaveLogs = [];
    this.searchString = '';
    this.getFullLeaveLogs();
  }

  //  loadMoreLogs() {
  //   this.size= this.size+10;
  //   this.getFullLeaveLogs();
  // }
  pagePendingLeaves = 0;
  sizePendingLeaves = 5;
  pendingLeavesSize!: number;
  initialLoadDoneOfPendingLeaves: boolean = false;
  @ViewChild('logContainerOfPendingLeaves')
  logContainerOfPendingLeaves!: ElementRef<HTMLDivElement>;
  isPendingLoader: boolean = false;

  getPendingLeaves() {
    this.isPendingLoader = true;
    this.dataService
      .getPendingLeaves(this.pagePendingLeaves, this.sizePendingLeaves)
      .subscribe({
        next: (response) => {
          this.pendingLeaves = [...this.pendingLeaves, ...response.object];
          this.isPendingLoader = false;
          // this.pendingLeaves = response.object
          this.pendingLeavesSize = this.pendingLeaves.length;
        },
        error: (error) => {
          this.isPendingLoader = false;
          console.error('Failed to fetch pending leaves:', error);
          this.helperService.showToast(
            'Failed to load pending leaves.',
            Key.TOAST_STATUS_ERROR
          );
        },
      });
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

  scrollDownRecentActivityOfPendingLeaves(event: any) {
    if (!this.initialLoadDoneOfPendingLeaves) return;
    const target = event.target as HTMLElement;
    const atBottom =
      target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

    if (atBottom) {
      this.pagePendingLeaves++;
      this.getPendingLeaves();
    }
  }

  loadMorePendingLeaves() {
    this.initialLoadDoneOfPendingLeaves = true;
    this.pagePendingLeaves++;
    // this.sizePendingLeaves= this.sizePendingLeaves+5;
    this.getPendingLeaves();
    setTimeout(() => {
      this.scrollToBottomOfPendingLeaves();
    }, 500);
  }

  scrollToBottomOfPendingLeaves() {
    if (this.logContainerOfPendingLeaves) {
      this.logContainerOfPendingLeaves.nativeElement.scrollTop =
        this.logContainerOfPendingLeaves.nativeElement.scrollHeight;
    }
  }

  pageApprovedRejected = 0;
  sizeApprovedRejected = 5;
  approvedRejectedLeavesSize!: number;
  initialLoadDoneOfApprovedRejected: boolean = false;
  @ViewChild('logContainerOfApprovedRejected')
  logContainerOfApprovedRejected!: ElementRef<HTMLDivElement>;
  isApprovedRejectedLoader: boolean = false;

  getApprovedRejectedLeaveLogs() {
    this.isApprovedRejectedLoader = true;
    this.dataService
      .getApprovedRejectedLeaveLogs(
        this.pageApprovedRejected,
        this.sizeApprovedRejected
      )
      .subscribe({
        next: (response) => {
          this.isApprovedRejectedLoader = false;
          this.approvedRejectedLeaves = [
            ...this.approvedRejectedLeaves,
            ...response.object,
          ];
          // this.approvedRejectedLeaves = response.object
          this.approvedRejectedLeavesSize = this.approvedRejectedLeaves.length;
          // this.approvedRejectedLeavesSize = 0;
        },

        error: (error) => {
          this.isApprovedRejectedLoader = false;
          console.error('Failed to fetch approved-rejected leave logs:', error);
          this.helperService.showToast(
            'Failed to load approved/rejected leaves.',
            Key.TOAST_STATUS_ERROR
          );
        },
      });
  }

  scrollDownRecentActivityOfApprovedRejected(event: any) {
    if (!this.initialLoadDoneOfApprovedRejected) return;
    const target = event.target as HTMLElement;
    const atBottom =
      target.scrollHeight - (target.scrollTop + target.clientHeight) < 10;

    if (atBottom) {
      this.pageApprovedRejected++;
      this.getApprovedRejectedLeaveLogs();
    }
  }

  loadMoreApprovedRejectedLogs() {
    this.initialLoadDoneOfApprovedRejected = true;
    // this.sizeApprovedRejected= this.sizeApprovedRejected+5;
    this.pageApprovedRejected++;
    this.getApprovedRejectedLeaveLogs();
    setTimeout(() => {
      this.scrollToBottomOfApprovedRejected();
    }, 500);
  }

  scrollToBottomOfApprovedRejected() {
    if (this.logContainerOfApprovedRejected) {
      this.logContainerOfApprovedRejected.nativeElement.scrollTop =
        this.logContainerOfApprovedRejected.nativeElement.scrollHeight;
    }
  }

  @ViewChild('closeModal') closeModal!: ElementRef;
  approvedLoader: boolean = false;
  rejecetdLoader: boolean = false;

  approveOrDeny(requestId: number, requestedString: string) {
    if (requestedString === 'approved') {
      this.approvedLoader = true;
    } else if (requestedString === 'rejected') {
      this.rejecetdLoader = true;
    }

    // Reset page counters and filters before sending the request
    this.page = 0;
    this.pagePendingLeaves = 0;
    this.pageApprovedRejected = 0;
    this.searchString = '';
    this.selectedTeamName = '';
    this.fullLeaveLogs = [];
    this.approvedRejectedLeaves = [];
    this.pendingLeaves = [];
    // this.consumedLeaveArray = [];
    // this.monthlyChartData = [];
    // this.weeklyChartData = [];

    this.dataService
      .approveOrRejectLeaveOfUser(requestId, requestedString)
      .subscribe({
        next: (logs) => {
          // Turn off loaders
          this.approvedLoader = false;
          this.rejecetdLoader = false;

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
    this.getApprovedRejectedLeaveLogs();
    this.getFullLeaveLogs();
    this.getPendingLeaves();
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
        next: (response) => (this.specificLeaveRequest = response.object[0]),
        error: (error) => {
          console.error('Failed to fetch pending leave:', error);
          this.helperService.showToast(
            'Failed to load this pending leave.',
            Key.TOAST_STATUS_ERROR
          );
        },
      });
  }

  formatDateIn(newdate: any) {
    const date = new Date(newdate);
    const formattedDate = this.datePipe.transform(date, 'dd MMMM, yyyy');
    return formattedDate;
  }
  formatDate(date: Date) {
    const dateObject = new Date(date);
    const formattedDate = this.datePipe.transform(dateObject, 'yyyy-MM-dd');
    return formattedDate;
  }

  formatTime(date: Date) {
    const dateObject = new Date(date);
    const formattedTime = this.datePipe.transform(dateObject, 'hh:mm a');
    return formattedTime;
  }

  transform(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
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
  // view: [number, number] = [300, 150];
  view: [number, number] = [300, 250];
  weeklyPlaceholderFlag: boolean = true;
  getWeeklyChartData() {
    this.dataService.getWeeklyLeaveSummary().subscribe((data) => {
      // if (data.length > 0) {
      //   this.weeklyPlaceholderFlag = true;
      // } else {
      //   this.weeklyPlaceholderFlag = false;
      // }
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
      // if (data.length > 0) {
      //   this.monthlyPlaceholderFlag = true;
      // } else {
      //   this.monthlyPlaceholderFlag = false;
      // }
      console.log('length' + data.length);
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
      // if (data.length > 0) {
      //   this.consumedLeavesPlaceholderFlag = true;
      // } else {
      //   this.consumedLeavesPlaceholderFlag = false;
      // }
      this.consumedLeaveArray = data;
      this.consumedLeaveData = data.map((item) => ({
        name: this.getLeaveInitials(item.leaveType),
        series: [
          { name: 'Used', value: item.consumedCount || 0 },
          { name: 'Remaining', value: item.remainingCount || 0 },
        ],
      }));
      this.dataReady = true;
      console.log(this.consumedLeaveData);
    });
  }

  getLeaveInitials(leaveType: string): string {
    const words = leaveType.split(' ');
    if (words.length >= 2) {
      return words[0].charAt(0) + words[1].charAt(0);
    }
    return leaveType;
  }

  // ####   new modal code

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

  userLeaveRequest: UserLeaveRequest = new UserLeaveRequest();

  @ViewChild('requestLeaveCloseModel')
  requestLeaveCloseModel!: ElementRef;

  // @ViewChild('userLeaveForm') userLeaveForm: NgForm;

  resetUserLeave() {
    this.userLeaveRequest.startDate = new Date();
    this.userLeaveRequest.endDate = new Date();
    this.userLeaveRequest.halfDayLeave = false;
    this.userLeaveRequest.dayShift = false;
    this.userLeaveRequest.eveningShift = false;
    this.userLeaveRequest.leaveType = '';
    this.userLeaveRequest.managerId = 0;
    this.userLeaveRequest.optNotes = '';
    this.selectedManagerId = 0;
  }
  @ViewChild(FormGroupDirective)
  formGroupDirective!: FormGroupDirective;
  submitLeaveLoader: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  saveLeaveRequestUser() {
    if (this.userLeaveForm.invalid || this.isFileUploaded) {
      return;
    }

    debugger;
    this.userLeaveRequest.managerId = this.selectedManagerId;
    this.userLeaveRequest.dayShift = this.dayShiftToggle;
    this.userLeaveRequest.eveningShift = this.eveningShiftToggle;
    this.submitLeaveLoader = true;

    this.page = 0;
    this.pagePendingLeaves = 0;
    this.pageApprovedRejected = 0;
    this.searchString = '';
    this.selectedTeamName = '';
    this.fullLeaveLogs = [];
    this.approvedRejectedLeaves = [];
    this.pendingLeaves = [];

    this.dataService
      .saveLeaveRequestForLeaveManagement(
        this.userLeaveRequest,
        this.fileToUpload
      )
      .subscribe(
        (data) => {
          this.submitLeaveLoader = false;
          this.resetUserLeave();
          this.fetchAllData();
          this.fileToUpload = '';
          // this.selectedFile = null;
          this.fileInput.nativeElement.value = '';
          this.formGroupDirective.resetForm();
          this.requestLeaveCloseModel.nativeElement.click();
        },
        (error) => {
          this.submitLeaveLoader = false;
        }
      );
  }

  dayShiftToggle: boolean = false;
  eveningShiftToggle: boolean = false;

  dayShiftToggleFun(shift: string) {
    if (shift == 'day') {
      this.dayShiftToggle = true;
      this.eveningShiftToggle = false;
    } else if (shift == 'evening') {
      this.eveningShiftToggle = true;
      this.dayShiftToggle == false;
    }
    // console.log("day" + this.dayShiftToggle + "evening" + this.eveningShiftToggle);
  }

  halfDayLeaveShiftToggle: boolean = false;

  halfLeaveShiftToggle() {
    this.halfDayLeaveShiftToggle =
      this.halfDayLeaveShiftToggle == true ? false : true;
  }

  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  fileToUpload: string = '';
  isSelecetdFileUploadedToFirebase: boolean = false;
  isFileUploaded = false;

  // Function to check if the selected file is an image
  isImageNew(file: File): boolean {
    return file.type.startsWith('image');
  }

  // Function to check if the selected file is a PDF
  isPdf(file: File): boolean {
    return file.type === 'application/pdf';
  }

  // Function to set the preview URL for images
  setImgPreviewUrl(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Function to set the preview URL for PDFs
  setPdfPreviewUrl(file: File): void {
    const objectUrl = URL.createObjectURL(file);
    this.pdfPreviewUrl =
      this.domSanitizer.bypassSecurityTrustResourceUrl(objectUrl);
  }

  // Function to handle file selection
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.isFileUploaded = true;
      this.selectedFile = fileList[0];

      if (this.isImageNew(this.selectedFile)) {
        this.setImgPreviewUrl(this.selectedFile);
      } else if (this.isPdf(this.selectedFile)) {
        this.setPdfPreviewUrl(this.selectedFile);
      }

      this.uploadFile(this.selectedFile); // Upload file to Firebase
    } else {
      this.isFileUploaded = false;
    }
  }

  // Function to upload file to Firebase
  uploadFile(file: File): void {
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .toPromise()
      .then(() => {
        console.log('Upload completed');
        fileRef
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            console.log('File URL:', url);
            this.fileToUpload = url;
            // console.log('file url : ' + this.fileToUpload);
            this.isFileUploaded = false;
          })
          .catch((error) => {
            this.isFileUploaded = false;
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        this.isFileUploaded = false;
        console.error('Error in upload snapshotChanges:', error);
      });
  }

  downloadSingleImage(imageUrl: any) {
    if (!imageUrl) {
      // console.error('Image URL is undefined or null');
      return;
    }

    var blob = null;
    var splittedUrl = imageUrl.split(
      '/firebasestorage.googleapis.com/v0/b/haajiri.appspot.com/o/'
    );

    if (splittedUrl.length < 2) {
      // console.error('Invalid image URL format');
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
}
