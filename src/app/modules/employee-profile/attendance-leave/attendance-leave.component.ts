import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AttendanceCheckTimeResponse, AttendanceTimeUpdateRequestDto, UserDto } from 'src/app/models/user-dto.model';
import { UserLeaveRequest } from 'src/app/models/user-leave-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { Key } from 'src/app/constant/key';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { EmployeeProfileAttendanceResponse, TotalEmployeeProfileAttendanceResponse } from 'src/app/models/employee-profile-attendance_response';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { AttendanceRequest } from 'src/app/models/AttendanceRequest';
import { constant } from 'src/app/constant/constant';
// import { Timeline } from 'vis-timeline'
// import { Timeline,DataSet, TimelineItem } from 'vis-timeline/standalone';
// import {ChartComponent,ApexAxisChartSeries,ApexChart,ApexXAxis,ApexTitleSubtitle} from "ng-apexcharts";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import { AttendanceLogResponse } from 'src/app/models/attendance-log-response';
import saveAs from 'file-saver';
import { BreakTimings } from 'src/app/models/break-timings';



Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);


@Component({
  selector: 'app-attendance-leave',
  templateUrl: './attendance-leave.component.html',
  styleUrls: ['./attendance-leave.component.css']
})
export class AttendanceLeaveComponent implements OnInit {

 


  userLeaveForm!: FormGroup;
  userId: any;
  count: number = 0;
  currentUserUuid: any
  userLeaveRequest: UserLeaveRequest = new UserLeaveRequest();
  modal: any;
  UUID: string = '';
  ROLE: string = '';
  readonly Constant = constant;
  contentTemplate: string = 'You are on the Notice Period, so that you can not apply leave';

  constructor(public dataService: DataService, private activateRoute: ActivatedRoute, private datePipe: DatePipe, private firebaseStorage: AngularFireStorage, private sanitizer: DomSanitizer,
    private fb: FormBuilder, public helperService: HelperService, public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage, private modalService: NgbModal,
    public roleService: RoleBasedAccessControlService,
  ) {
    this.getUuid();
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
    // if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
    //   this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    // }
    // this.UUID = await this.roleService.getUuid();
    // this.getFirstAndLastDateOfMonth(this.selectedDate);
    this.attendanceTimeUpdateForm = this.fb.group({
      requestedDate: [null, Validators.required],
      attendanceRequestType: ['UPDATE', Validators.required], // Default to 'UPDATE'
      updateGroup: this.fb.group({
        requestType: [null, Validators.required],
        attendanceId: [null, Validators.required],
        updatedTime: [null, Validators.required],
      }),
      createGroup: this.fb.group({
        inRequestTime: [null, Validators.required],
        outRequestTime: [null, Validators.required],
      }),
      managerId: [null, Validators.required],
      requestReason: ['', [Validators.required, Validators.maxLength(255)]],
    });

  }
  public async getUuid() {
    this.UUID = await this.roleService.getUuid();
   
    // this.currentUserUuid = await this.roleService.getUuid();
  }

  async ngOnInit(): Promise<void> {
    // this.userLeaveForm = this.fb.group({
    //   startDate: [null, Validators.required],
    //   endDate: [null, Validators.required],
    //   leaveType: [null, Validators.required],
    //   selectedUser: [null, Validators.required],
    //   note: [null, Validators.required],
    // });
    this.ROLE = await this.roleService.getRole();
    
    this.userLeaveForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      leaveType: [null, Validators.required],
      isHalf: [false],
      selectedUser: [null], // Initially not required
      note: [null, Validators.required],
    });
    console.log('Role:', this.ROLE);
    if (this.ROLE !== 'ADMIN') {
      this.userLeaveForm.get('selectedUser')?.setValidators(Validators.required);
    } else {
      this.userLeaveForm.get('selectedUser')?.clearValidators();
    }
  
    // Update validity after changing validators
    this.userLeaveForm.get('selectedUser')?.updateValueAndValidity();
  
    // this.getAttendanceRequests();
    this.fetchAttendanceRequests();
    this.fetchManagerNames();
    this.getUserLeaveReq();
    this.loadLeaveLogs();
    // this.getOrganizationRegistrationDateMethodCall();
    this.getUserJoiningDate();
    this.getHoliday();

    this.selectedDate = new Date();
    this.updateThirtyDaysLabel();
    // this.updateWeekLabels();
    // // Set the default selected tab to the current week
    this.setDefaultWeekTab();
    this.calculateDateRange();
    this.getEmployeeProfileAttendanceDetailsData();
    this.currentUserUuid = this.roleService.getUuid();

    // this.calculateDateRange();
    // this.getAttendanceRequests();


    // this.attendanceTimeUpdateForm = this.fb.group({
    //   updateGroup: this.fb.group({
    //     requestType: [null, Validators.required],
    //     requestedDate: [null, Validators.required],
    //     attendanceId: [null, Validators.required],
    //     updatedTime: [null, Validators.required]
    //   }),
    //   createGroup: this.fb.group({
    //     selectedDateAttendance: [null, Validators.required],
    //     inRequestTime: [null, Validators.required],
    //     outRequestTime: [null, Validators.required]
    //   }),
    //   managerId: [null, Validators.required],
    //   requestReason: [null, Validators.required]
    // });



    this.checkUserLeaveTaken();
  }
  get canSubmit() {
    return this.userLeaveForm?.valid;
  }

  attendanceTypeFilter: any = ['CREATE', 'UPDATE'];
  attendanceStatusFilter: any = ['PENDING', 'APPROVED', 'REJECTED'];
  updateAttendanceTypeFilter(type: string) {
    this.attendanceType = type;
    this.fetchAttendanceRequests();
  }
  updateAttendanceStatusFilter(status: string) {
    this.attendanceStatus = status;
    this.fetchAttendanceRequests();
  }

  attendanceRequests: AttendanceRequest[] = [];
  currentAttendancePage: number = 1;
  pageAttendanceSize: number = 10;
  totalAttendanceElements: number = 0;
  attendanceStatus: string = 'All';
  isAttendanceLoading: boolean = false;
  attendanceType: string = 'CREATE';
  fetchAttendanceRequests(): void {
    this.isAttendanceLoading = true;
    this.dataService
      .getAttendanceUpdateFilteredRequests(
        this.userId,
        this.attendanceStatus,
        this.attendanceType,
        this.currentAttendancePage,
        this.pageAttendanceSize
      )
      .subscribe((response) => {

        this.attendanceRequests = response.content;
        this.totalAttendanceElements = response.totalElements;
        this.isAttendanceLoading = false;
      },
        (error) => {
          this.isAttendanceLoading = false;
        }
      );
  }
  onAttendancePageChange(page: number): void {
    this.currentAttendancePage = page;
    this.fetchAttendanceRequests();
  }

  onAttendanceFilterChange(): void {
    this.currentAttendancePage = 0; // Reset to first page when filters change
    this.fetchAttendanceRequests();
  }

  currentId: number=0;
  requestDeleteLoading: boolean=false;
  deleteAttendanceRequest(): void {
    this.requestDeleteLoading=true;
    this.dataService.deletePendingAttendance(this.currentId).subscribe(
      (response: any) => {
        this.requestDeleteLoading=false;
        this.helperService.showToast('Attendance request deleted successfully', Key.TOAST_STATUS_SUCCESS);
        const cancelButton = document.getElementById('cancelButton') as HTMLButtonElement;

        if (cancelButton) {
          cancelButton.click();
        }
        this.fetchAttendanceRequests();
      },
      (error) => {
        this.requestDeleteLoading=false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }


  isUserLeaveTaken: number = 1;
  checkUserLeaveTaken() {
    this.dataService.getUserLeaveTaken().subscribe((res: any) => {
      if (res.status) {
        this.isUserLeaveTaken = res.object
      } else {
        this.isUserLeaveTaken = 0
      }
    })
  }

  isHalfLeaveSelected: boolean = false;
  isFirstHalfSelected: boolean = false;
  isSecondHalfSelected: boolean = false;

  toggleHalfLeaveSelection(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isHalfLeaveSelected = checkbox.checked;
  }


  selectedLeaveType1: string | null = null;

  selectedUser: number | null = null;
  onUserChange(value: number): void {
    this.userLeaveRequest.managerId = value;
    this.selectedUser = value;
    console.log('Selected User:', this.selectedUser);
  }
  note: string = '';

  uploadedFiles: File[] = [];


  removeFile(index: number): void {
    if (index >= 0 && index < this.uploadedFiles.length) {
      this.uploadedFiles.splice(index, 1); // Removes the file at the specified index
    }
  }

  viewFile(file: File): void {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  }
  dayShiftToggleFun(shift: string) {
    debugger
    if (shift == 'day') {
      this.userLeaveRequest.dayShift = true;
      this.userLeaveRequest.eveningShift = false;
    } else if (shift == 'evening') {
      this.userLeaveRequest.dayShift = false;
      this.userLeaveRequest.eveningShift = true;
    }
  }



  userLeave: any = [];
  leaveCountPlaceholderFlag: boolean = false;


  userLeaveLog: any;
  isLeaveShimmer: boolean = false;
  isLeavePlaceholder: boolean = false;
  selectStatusFlag: boolean = false;
  isLeaveErrorPlaceholder: boolean = false;



  leaveTypes: string[] = ['All', 'Earned Leave', 'Casual Leave', 'Sick Leave', 'Leave without Pay'];
  statuses: string[] = ['All', 'Pending', 'Approved', 'Rejected'];
  selectedLeaveType = 'All';
  selectedStatus = 'All';
  searchQuery = '';
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  totalPages = 0;
  isLoading = true;
  loadLeaveLogsOld(): void {
    const leaveType = this.selectedLeaveType === 'All' ? undefined : this.selectedLeaveType;
    const status = this.selectedStatus === 'All' ? undefined : this.selectedStatus;

    this.isLoading = true;
    this.dataService
      .getUserLeaveLogFilter(this.userId, this.currentPage, this.pageSize, leaveType, status, this.searchQuery)
      .subscribe((response) => {
        this.userLeaveLog = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      });
  }

  loadLeaveLogs(): void {
    const leaveType = this.selectedLeaveType === 'All' ? undefined : this.selectedLeaveType;
    const status = this.selectedStatus === 'All' ? undefined : this.selectedStatus;

    this.isLoading = true;
    this.dataService
      .getUserLeaveLogFilter(this.userId, this.currentPage, this.pageSize, leaveType, status, this.searchQuery)
      .subscribe((response) => {
        this.userLeaveLog = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      });
  }


  updateLeaveType(type: string): void {
    this.selectedLeaveType = type;
    this.currentPage = 1;
    this.loadLeaveLogs();
  }

  updateStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadLeaveLogs();
  }

  updateSearch(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.loadLeaveLogs();
  }

  pageChanged(page: number): void {
    this.currentPage = page;
    this.loadLeaveLogs();
  }

  disableEndDate = (endDate: Date): boolean => {
    const startDate = this.userLeaveForm.get('startDate')?.value;
    if (startDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);
      return end < start; // Only disable dates before the start date
    }
    return false;
  };

  // Disable dates after the end date in the start date picker
  disableStartDate = (startDate: Date): boolean => {
    const endDate = this.userLeaveForm.get('endDate')?.value;
    if (endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);
      return start > end; // Only disable dates after the end date
    }
    return false;
  };






  managers: UserDto[] = [];
  selectedManagerId!: number;
  isFileUploaded = false;
  submitLeaveLoader: boolean = false;
  fileToUpload: string = '';
  isLoadingLeaveForm: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('cancelBtn') cancelBtn!: ElementRef;
  saveLeaveRequestUser() {
    debugger
    this.isLoadingLeaveForm = true;
    this.userLeaveRequest.halfDayLeave = this.isHalfLeaveSelected;
    // this.userLeaveRequest.halfDayLeave = false;
    this.userLeaveRequest.leaveType = this.userLeaveRequest.userLeaveTemplateId.toString();
    this.dataService
      .saveLeaveRequest(this.userId, this.userLeaveRequest, this.fileToUpload)
      .subscribe(
        (data) => {
          // console.log(data);
          // console.log(data.body);

          if (data.status) {
            this.submitLeaveLoader = false;
            this.isLeavePlaceholder = false;
            this.isFileUploaded = false;
            this.fileToUpload = '';
            // this.selectedFile = null;
            this.fileInput.nativeElement.value = '';
            // this.getUserLeaveReq();

            setTimeout(() => {
              this.getUserLeaveReq();
            }, 100);

            this.resetUserLeave();
            this.formGroupDirective.resetForm();
            this.uploadedFiles = [];
            this.loadLeaveLogs();
            this.cancelBtn.nativeElement.click();
            this.helperService.showToast('Leave Requested successfully', Key.TOAST_STATUS_SUCCESS);
            // location.reload();
          } else {
            this.submitLeaveLoader = false;
            this.isLeavePlaceholder = false;
            this.isFileUploaded = false;
            this.helperService.showToast(data.message, Key.TOAST_STATUS_ERROR);
          }
          this.isLoadingLeaveForm = false;

        },
        (error) => {
          this.submitLeaveLoader = false;
          this.isLoadingLeaveForm = false;
          // console.log(error.body);
        }
      );
  }
  resetUserLeave() {
   
    this.isHalfLeaveSelected = false;
   this.userLeaveRequest= new UserLeaveRequest();
    this.selectedManagerId = 0;
    this.uploadedFiles = [];
    this.submitLeaveLoader = false;
    this.userLeaveRequest.halfDayLeave=false;
    this.selectedUser=null;
  }


  getUserLeaveReq() {
    this.leaveCountPlaceholderFlag = false;
    this.dataService.getUserLeaveRequests(this.userId,0,0).subscribe(
      (res: any) => {
        this.userLeave = res.object;
        if (this.userLeave == null) {
          this.userLeave = []
        }


      });
  }




  halfDayLeaveShiftToggle: boolean = false;

  halfLeaveShiftToggle() {
    this.halfDayLeaveShiftToggle =
      this.halfDayLeaveShiftToggle == true ? false : true;
  }

  fileName: any;
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  isSelecetdFileUploadedToFirebase: boolean = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  expenseTypeReq: ExpenseType = new ExpenseType();
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    if (element.files && element.files.length) {
      this.uploadedFiles = [...this.uploadedFiles, ...Array.from(element.files)];
    }
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.isFileUploaded = true;
      this.selectedFile = fileList[0];

      const file = fileList[0];

      this.fileName = file.name;

      if (this.isImageNew(this.selectedFile)) {
        this.setImgPreviewUrl(this.selectedFile);
      } else if (this.isPdf(this.selectedFile)) {
        this.setPdfPreviewUrl(this.selectedFile);
      }

      this.uploadFile(this.selectedFile);
      this.fileInput.nativeElement.value = '';
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
            // console.log('File URL:', url);
            this.fileToUpload = url;
            this.expenseTypeReq.url = url;
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

  setPdfPreviewUrl(file: File): void {
    const objectUrl = URL.createObjectURL(file);
    this.pdfPreviewUrl =
      this.domSanitizer.bypassSecurityTrustResourceUrl(objectUrl);
  }

  fetchManagerNames() {
    this.dataService.getEmployeeManagerDetails(this.userId).subscribe(
      (data: UserDto[]) => {
        this.managers = data;
        this.count++;
      },
      (error) => {
        this.count++;
      }
    );
  }

  onDelete(id: number) {
    this.dataService.deleteUserLog(id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.helperService.showToast('Delete Successfully', Key.TOAST_STATUS_SUCCESS);
        this.loadLeaveLogs();
      },
      error: (err) => this.isDeleting = true
    });
  }

  @ViewChild('deleteConfirmation', { static: true }) deleteConfirmation: any;
  private itemIdToDelete: number | null = null;
  @ViewChild('deletModalButton') deletModalButton!: ElementRef;
  openDeleteConfirmation(itemId: number): void {
    this.itemIdToDelete = itemId;
    // this.modalService.open(this.deleteConfirmation, { centered: true });
    this.deletModalButton.nativeElement.click();
  }

  isDeleting: boolean = false;

  @ViewChild('deleCloseButton') deleCloseButton!: ElementRef;
  confirmDelete(modal: NgbModalRef): void {
    this.isDeleting = true;
    if (this.itemIdToDelete !== null) {
      this.onDelete(this.itemIdToDelete);
    }
    this.deleCloseButton.nativeElement.click();

    // modal.close();
  }

  // Handle edit action
  @ViewChild('leaveApplyButton') leaveApplyButton!: ElementRef;
  onEdit(item: any): void {
    // Populate form with selected item data
    this.userLeaveForm.patchValue({
      startDate: item.startDate,
      endDate: item.endDate,
      leaveType: item.leaveType,
      selectedUser: item.managerId,
      approvedBy: item.approvedBy,
      note: item.optNotes
    });
    this.userLeaveRequest.halfDayLeave = item.halfLeave;
    this.leaveApplyButton.nativeElement.click();
  }

  applyNewLeaveReq() {
    this.resetUserLeave();
    this.leaveApplyButton.nativeElement.click();
  }

  //  attendance tab code

  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';
  selectedTab: string = 'Week 1';
  thirtyDaysLabel: string = '';
  weekLabels: string[] = [];



  // onMonthChange(month: Date): void {

  //   this.selectedDate = month;
  //   this.presentWeek = false;
  //   // this.resetData();
  //   this.isShimmer = true;
  //   this.updateThirtyDaysLabel();
  //   this.updateWeekLabels();
  //   this.selectedTab = 'Week 1'; // Reset to default
  //   this.calculateDateRange();
  //   this.getEmployeeProfileAttendanceDetailsData();
  //   // this.getWorkedHourForEachDayOfAWeek();
  // }

  onMonthChange(month: Date): void {
    this.selectedDate = month;
    this.presentWeek = false;
    this.isShimmer = true;
    this.updateThirtyDaysLabel();
    this.updateWeekLabels();

    // Select the first week containing or after the joining date
    const joiningDate = new Date(this.userJoiningDate);

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
    this.getEmployeeProfileAttendanceDetailsData();
  }


  // onMonthChange(month: Date): void {
  //   this.selectedDate = month;
  //   this.presentWeek = false;
  //   this.isShimmer = true;
  //   this.updateThirtyDaysLabel();
  //   this.updateWeekLabels();

  //   // Select the week containing or after the joining date
  //   const joiningDate = new Date(this.userJoiningDate);

  //   let selectedIndex = 0; // Default to Week 1 if no match is found
  //   this.weekLabels.forEach((_, index) => {
  //     const weekStart = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), index * 7 + 1);
  //     const weekEnd = new Date(weekStart);
  //     weekEnd.setDate(weekStart.getDate() + 6);

  //     if (weekEnd >= joiningDate && joiningDate >= weekStart) {
  //       selectedIndex = index;
  //     }
  //   });

  //   this.selectedTab = this.weekLabels[selectedIndex]; // Select the matching week or default to Week 1
  //   console.log('Selected Tab:', this.selectedTab);
  //   this.calculateDateRange();
  //   this.getEmployeeProfileAttendanceDetailsData();
  // }



  updateThirtyDaysLabel(): void {
    const currentDate = new Date();
    const isCurrentMonth =
      this.selectedDate.getFullYear() === currentDate.getFullYear() &&
      this.selectedDate.getMonth() === currentDate.getMonth();

    if (isCurrentMonth) {
      // this.thirtyDaysLabel = `${currentDate.getDate()} Days`;
      this.thirtyDaysLabel = `All`;
    } else {
      const totalDays = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth() + 1,
        0
      ).getDate();
      // this.thirtyDaysLabel = `${totalDays} Days`;
      this.thirtyDaysLabel = `All`;
    }
  }

  // updateWeekLabels(): void {
  //   const currentDate = new Date();
  //   const daysInMonth = new Date(
  //     this.selectedDate.getFullYear(),
  //     this.selectedDate.getMonth() + 1,
  //     0
  //   ).getDate();
  //   const isCurrentMonth =
  //     this.selectedDate.getFullYear() === currentDate.getFullYear() &&
  //     this.selectedDate.getMonth() === currentDate.getMonth();

  //   const lastDay = isCurrentMonth ? currentDate.getDate() : daysInMonth;
  //   const weeks = Math.ceil(lastDay / 7);

  //   this.weekLabels = Array.from({ length: weeks }, (_, i) => `Week ${i + 1}`);
  // }

  updateWeekLabels(): void {
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
    const joiningDate = new Date(this.userJoiningDate);

    this.weekLabels = Array.from({ length: Math.ceil(lastDay / 7) }, (_, i) => {
      const weekStart = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), i * 7 + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Include only weeks where the end date is on or after the joining date
      return weekEnd >= joiningDate ? `Week ${i + 1}` : null;
    }).filter(week => week !== null) as string[];
  }


  calculateDateRange(): void {
    const currentDate = new Date();
    const isCurrentMonth =
      this.selectedDate.getFullYear() === currentDate.getFullYear() &&
      this.selectedDate.getMonth() === currentDate.getMonth();

    if (this.selectedTab === '30 DAYS') {
      this.startDate = this.formatDateToYYYYMMDD(
        new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1)
      );
      this.endDate = this.formatDateToYYYYMMDD(
        isCurrentMonth ? currentDate : new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0)
      );
    } else {
      const weekNumber = parseInt(this.selectedTab.replace('Week ', ''), 10);
      this.setWeekRange(this.selectedDate, weekNumber);
    }
    this.getWorkedHourForEachDayOfAWeek();
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

    this.startDate = this.formatDateToYYYYMMDD(weekStart);

    // Update end date logic
    if (weekEnd > lastDayOfMonth) {
      // If it's the last week of the month, adjust to the last day of the month
      this.endDate = this.formatDateToYYYYMMDD(
        currentDate >= weekStart && currentDate <= lastDayOfMonth
          ? currentDate // Use current date if within the selected week's range
          : lastDayOfMonth
      );
    } else if (currentDate >= weekStart && currentDate <= weekEnd) {
      // If the current week is the selected week, adjust to the current date
      this.endDate = this.formatDateToYYYYMMDD(currentDate);
    } else {
      this.endDate = this.formatDateToYYYYMMDD(weekEnd);
    }
  }

  // setWeekRange(date: Date, weekNumber: number): void {
  //   const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  //   const weekStart = new Date(
  //     startOfMonth.getFullYear(),
  //     startOfMonth.getMonth(),
  //     (weekNumber - 1) * 7 + 1
  //   );
  //   const weekEnd = new Date(
  //     weekStart.getFullYear(),
  //     weekStart.getMonth(),
  //     weekStart.getDate() + 6
  //   );

  //   this.startDate = this.formatDateToYYYYMMDD(weekStart);
  //   this.endDate = this.formatDateToYYYYMMDD(
  //     weekEnd > new Date(date.getFullYear(), date.getMonth() + 1, 0)
  //       ? new Date(date.getFullYear(), date.getMonth() + 1, 0)
  //       : weekEnd
  //     );
  // }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onTabChange(tab: string): void {
    debugger
    if (tab == '30 DAYS') {
      this.searchString = 'ALL';
    } else {
      this.searchString = 'WEEK';
    }
    this.selectedTab = tab;
    this.presentWeek = false;
    // this.resetData();
    this.isShimmer = true;
    this.calculateDateRange();
    this.getEmployeeProfileAttendanceDetailsData();
    // this.getWorkedHourForEachDayOfAWeek();
  }



  organizationRegistrationDate: string = '';
  getOrganizationRegistrationDateMethodCall() {
    debugger;
    this.dataService.getOrganizationRegistrationDate().subscribe(
      (response) => {
        this.organizationRegistrationDate = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  userJoiningDate: string = '';
  getUserJoiningDate() {
    debugger;
    this.dataService.getUserJoiningDate(this.userId).subscribe(
      (response) => {
        this.userJoiningDate = response;
        // this.updateThirtyDaysLabel();
        this.updateWeekLabels();
        // Set the default selected tab to the current week
        // this.setDefaultWeekTab();
        // this.calculateDateRange();
      },
      (error) => {
        console.log(error);
      }
    );
  }



  attendanceDetails: EmployeeProfileAttendanceResponse[] = [];
  totalAttendanceDetails: TotalEmployeeProfileAttendanceResponse = new TotalEmployeeProfileAttendanceResponse();
  isShimmer: boolean = false;
  getEmployeeProfileAttendanceDetailsData() {
    debugger;
    this.isShimmer = true;
    this.attendanceDetails = [];
    // this.totalAttendanceDetails = new TotalEmployeeProfileAttendanceResponse();
    this.dataService.getEmployeeProfileAttendanceDetails(this.userId, this.startDate, this.endDate).subscribe(
      (response) => {
        this.isShimmer = false;
        this.attendanceDetails = response.object.employeeProfileAttendanceResponseList;
        this.totalAttendanceDetails = response.object.totalEmployeeProfileAttendanceResponse
      },
      (error) => {
        this.isShimmer = false;
        console.log(error);
      }
    );
  }

  convertSecondsToHMS(seconds: number | null): string {
    if (seconds === null || seconds < 0) {
      return 'N/A'; // Return "N/A" for invalid or null values
    }
  
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
  
    return `${hrs}h ${mins}m`;
  }
  
  

  resetData() {
    this.attendanceDetails = [];
    this.totalAttendanceDetails = new TotalEmployeeProfileAttendanceResponse();
  }


  convertToHourMinuteFormat(time: string | null | undefined): string {

    if (!time) {
      return '0 mins'; // Default output if time is null or undefined
    }

    const isNegative = time.startsWith('-');
    const timeWithoutSign = isNegative ? time.substring(1) : time;

    // Split the time string into hours, minutes, and seconds
    const [hours, minutes, seconds] = timeWithoutSign.split(':').map((part) => parseInt(part, 10));

    // Build the result
    let result = '';
    if (hours !== 0) {
      result += `${isNegative ? '-' : ''}${Math.abs(hours)} hr${Math.abs(hours) !== 1 ? 's' : ''}`;
    }
    if (minutes !== 0 || result === '') { // Include minutes even if they are zero when there's no hour part
      result += `${result ? ', ' : isNegative ? '-' : ''}${Math.abs(minutes)} min${Math.abs(minutes) !== 1 ? 's' : ''}`;
    }

    return result;
  }

  convertToHourMinuteFormatNegativeCase(time: string | null | undefined): string {

    if (!time) {
      return '0 mins'; // Default output if time is null or undefined
    }

    const isNegative = time.startsWith('-');
    const timeWithoutSign = isNegative ? time.substring(1) : time;

    // Split the time string into hours, minutes, and seconds
    const [hours, minutes, seconds] = timeWithoutSign.split(':').map((part) => parseInt(part, 10));

    // Build the result
    let result = '';
    if (hours !== 0) {
      result += `${isNegative ? '-' : '+'}${Math.abs(hours)} hr${Math.abs(hours) !== 1 ? 's' : ''}`;
    }
    if (minutes !== 0 || result === '') { // Include minutes even if they are zero when there's no hour part
      result += `${result ? ', ' : isNegative ? '-' : ''}${Math.abs(minutes)} min${Math.abs(minutes) !== 1 ? 's' : ''}`;
    }

    return result;
  }

  checkTimeNegative(time: string | null | undefined): boolean {
    if (!time) {
      return false;
    }

    return time.startsWith('-');
  }

  disableMonths = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const userRegistrationYear = new Date(
      this.userJoiningDate
    ).getFullYear();
    const userRegistrationMonth = new Date(
      this.userJoiningDate
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

  // Navigate to the previous month
  goToPreviousMonth(): void {
    if (!this.isPreviousDisabled()) {
      this.searchString = 'WEEK';
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
      this.searchString = 'WEEK';
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
    const userRegistrationDate = new Date(this.userJoiningDate);
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


  isWeekBeforeJoiningDate(weekIndex: number): boolean {
    const joiningDate = new Date(this.userJoiningDate);
    const joiningWeek = Math.ceil(joiningDate.getDate() / 7);

    // Weeks before the joining week should be hidden
    return weekIndex + 1 < joiningWeek;
  }






  // timeline: Timeline | undefined;
  options: {} | undefined;
  data: any;
  groups: any;

  @ViewChild('timeline', { static: true }) timelineContainer: ElementRef | undefined;

  staticData = [
    {
      "groupId": 1,
      "date": "04-12-2024",
      "items": [
        {
          "id": 1,
          "start": "2024-12-04 21:33:21.775",
          "end": "2024-12-04 21:33:21.775",
          "content": "Request Check-In",
          "type": null,
          "className": null
        },
        {
          "id": 2,
          "start": "2024-12-04 02:33:26.791",
          "end": "2024-12-04 02:33:26.791",
          "content": "Request Check-Out",
          "type": null,
          "className": null
        }
      ]
    },
    {
      "groupId": 2,
      "date": "01-12-2024",
      "items": [
        {
          "id": 3,
          "start": "2024-13-01 19:37:04.863",
          "end": "2024-13-01 19:37:04.863",
          "content": "Request Check-In",
          "type": null,
          "className": null
        },
        {
          "id": 4,
          "start": "2024-13-01 01:37:07.777",
          "end": "2024-13-01 01:37:07.777",
          "content": "Request Check-Out",
          "type": null,
          "className": null
        }
      ]
    }
  ];

  page = 1;
  requestSize = 10;
  // getAttendanceRequests(): void {
  //   debugger;
  //   this.dataService.getUserAttendanceRequests(this.userId, '2024-12-01', this.page, this.requestSize).subscribe(
  //     (response) => {
  //       this.staticData = response.content;
  //       console.log('kkkkkkkk', response);
  //       this.getTimelineData();
  //       this.getTimelineGroups();
  //       this.getOptions();
  //       this.timeline = new Timeline(this.timelineContainer?.nativeElement, this.data, this.options);
  //       this.timeline.setGroups(this.groups);
  //       this.timeline.setItems(this.data);

  //     },
  //      (err) => {
  //       console.error('kkkkkkkk', err);
  //     }
  //   );
  // }


  // getTimelineGroups() {
  //   // Create groups dynamically from static data
  //   this.groups = new DataSet(
  //     this.staticData.map((group) => ({
  //       id: group.groupId,
  //       content: group.date,
  //     }))
  //   );
  // }

  // getTimelineData() {
  //   // Combine all items from the static data into a single array
  //   const allItems = this.staticData
  //   .map((group) =>
  //     group.items.map((item) => ({
  //       ...item,
  //       group: group.groupId,
  //     }))
  //   )
  //   .reduce((acc, items) => acc.concat(items), []);


  //   this.data = new DataSet(allItems);
  // }

  // getOptions() {
  //   let currentDate = new Date();
  //   let startDate = new Date(currentDate);
  //   startDate.setHours(0, 0, 0, 0); // Set the start time to 00:00

  //   let endDate = new Date(currentDate);
  //   endDate.setHours(23, 59, 59, 999); // Set the end time to 23:59:59

  //   this.options = {
  //     stack: false,
  //     editable: false,
  //     margin: {
  //       item: 10,
  //       axis: 5,
  //     },
  //     orientation: 'top',
  //     zoomable: false,

  //     showCurrentTime: false,
  //     format: {
  //       minorLabels: {
  //         hour: 'HH:00',
  //       },
  //       majorLabels: {
  //         day: 'DD/MM/YYYY',
  //       },
  //     },
  //     tooltip: {
  //       followMouse: true,
  //       overflowMethod: 'cap',
  //       template: (item: TimelineItem) => {
  //         const startTime = new Date(item.start).toLocaleTimeString([], {
  //           hour: '2-digit',
  //           minute: '2-digit',
  //         });
  //         const endTime = item.end
  //           ? new Date(item.end).toLocaleTimeString([], {
  //               hour: '2-digit',
  //               minute: '2-digit',
  //             })
  //           : null;
  //         return `
  //           <div>
  //             <strong>${item.content}</strong><br />
  //             Start: ${startTime}<br />
  //             ${endTime ? `End: ${endTime}` : ''}
  //           </div>
  //         `;
  //       },
  //     },
  //   };
  // }

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  // List of holiday dates
  // holidays: string[] = ['2024-12-25', '2024-12-31', '2025-01-01'];
  // isHoliday(date: Date): boolean {
  //   const formattedDate = this.formatDate(date);
  //   console.log(`Checking date: ${formattedDate} - Is holiday: ${this.holidays.includes(formattedDate)}`);
  //   return this.holidays.includes(formattedDate);
  // }

  // private formatDate(date: Date): string {
  //   const year = date.getFullYear();
  //   const month = ('0' + (date.getMonth() + 1)).slice(-2); // Month is 0-based
  //   const day = ('0' + date.getDate()).slice(-2);
  //   return `${year}-${month}-${day}`;
  // }

  // customDateRender = (current: Date): HTMLElement => {
  //   const div = document.createElement('div');
  //   div.classList.add('ant-picker-cell-inner');
  //   div.innerHTML = current.getDate().toString();

  //   if (this.isHoliday(current)) {
  //     div.classList.add('holiday-highlight');
  //   }
  //   return div;
  // };

  /* @Input() currentDate: Date = new Date();
 
   holidays: { [key: string]: string } = {
     '2024-12-25': 'Christmas Day',
     '2024-12-31': 'New Year\'s Eve',
     '2025-01-01': 'New Year\'s Day'
   };
 
   // Function to format the date to 'yyyy-MM-dd' for comparison with holidays
   private formatDate(date: Date): string {
     const year = date.getFullYear();
     const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
     const day = date.getDate().toString().padStart(2, '0');
     return `${year}-${month}-${day}`;
   }
 
   // Function to get the holiday name
   getHolidayName(): string {
     if (!this.currentDate) return '';
     const formattedDate = this.formatDate(this.currentDate);
     return this.holidays[formattedDate] || ''; // Return holiday name if found
   }
 
   // Function to check if the date is a holiday
   isHoliday(): boolean {
     if (!this.currentDate) return false;
     const formattedDate = this.formatDate(this.currentDate);
     return !!this.holidays[formattedDate]; // Returns true if holiday exists
   }*/

  holidays: { [key: string]: { title: string, description: string } } = {};
  holidayList: any;
  getHoliday() {
    this.dataService.getAllHoliday().subscribe((res: any) => {
      if (res.status) {
        this.holidayList = res.object;

        // Clear existing holidays data before populating new data
        this.holidays = {};

        // Convert holidayList into the holidays object with title and description
        this.holidayList.forEach((holiday: any) => {
          this.holidays[holiday.date] = {
            title: holiday.title,        // Store the title
            description: holiday.description  // Store the description
          };
        });

        console.log('Formatted holidays:', this.holidays);
      }
    });
  }

  // Function to disable holiday dates
  disableHolidayDate = (current: Date): boolean => {
    const formattedDate = this.formatDate2(current);
    return !!this.holidays[formattedDate];  // Return true if the date is a holiday
  }

  private formatDate2(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;

  }
  searchString = 'WEEK';
  endDateStr: string = '';
  isPlaceholder: boolean = false;
  getWorkedHourForEachDayOfAWeek() {
    debugger

    /// Get current date and convert to the same format as endDate
    const currentDate = new Date();
    const endDate = new Date(this.endDate); // Convert endDate to Date object
    const dayOfWeek = currentDate.getDay(); // Get the current day of the week (0 = Sunday, 6 = Saturday)

    // Get the last date of the current week (Saturday)
    const lastDayOfWeek = new Date(currentDate);
    lastDayOfWeek.setDate(currentDate.getDate() - dayOfWeek + 6); // Set to Saturday of the current week

    // Normalize currentDate and lastDayOfWeek to remove time component for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    lastDayOfWeek.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0); // Remove time component from endDate

    // If endDate lies within the current week, adjust it to the last day (Saturday)
    if (endDate >= currentDate && endDate <= lastDayOfWeek) {
      console.log('End date is within the current week');
      this.endDateStr = lastDayOfWeek.toISOString().split('T')[0]; // Format the date in YYYY-MM-DD format
    } else {
      this.endDateStr = this.endDate;
    }

    this.dataService.getWorkedHourForEachDayOfAWeek(this.userId, this.startDate, this.endDateStr, this.searchString).subscribe(
      (response: any) => {
        const labels = response.listOfObject.map((item: any) =>
          this.formatDate(item.workDate)
        );
        const data = response.listOfObject.map((item: any) =>
          this.formatToDecimalHours(item.totalWorkedHour)
        );

        console.log('response.listOfObject.length:', response.listOfObject.length);
        if (response.listOfObject.length == 0) {
          this.isPlaceholder = true;
        } else {
          this.isPlaceholder = false;
        }

        this.initializeChart(labels, data);
      },
      (error) => {
        console.error('Error fetching worked hours:', error);
      }
    );
  }

  formatToDecimalHours(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours + minutes / 60 + seconds / 3600;
  }

  // formatDate(date: string): string {
  //   const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
  //   return new Date(date).toLocaleDateString('en-US', options);
  // }

  formatDate(date: string): string {
    if (this.searchString === 'ALL') {
      return date;
    } else {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
      return new Date(date).toLocaleDateString('en-US', options);
    }
  }

  formatDecimalToTime(decimalHours: number): string {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}hrs`;
  }
  initializeChart(labels: string[], data: number[]) {
    const ctx = this.chartCanvas!.nativeElement.getContext('2d');

    if (ctx) {
      // Check if there's an existing chart and destroy it
      if (this.chart) {
        this.chart.destroy();
      }

      

      // Create the new chart
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Total Worked Hours',
              data: data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Worked Hours',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem: any) => {
                  const formattedTime = this.formatDecimalToTime(tooltipItem.raw);
                  return `${tooltipItem.label}: ${formattedTime}`;
                }
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: this.searchString === 'ALL' ? 'Weeks' : 'Days',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Worked Hours',
              },
              beginAtZero: true,
              ticks: {
                callback: (tickValue: string | number) => {
                  const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                  return this.formatDecimalToTime(value);
                },
                stepSize: 0.5,
              },
              type: 'linear',
            },
          },
        },
      });
    }
  }

  selectedRequest: string = '';

  onRequestChange(value: string) {
    if (value === 'Attendance update') {
      // Trigger the hidden button to open the modal
      const attendanceUpdateButton = document.getElementById('attendanceUpdate');
      if (attendanceUpdateButton) {
        attendanceUpdateButton.click();
      }
    }
  }

  //  attendance update 


  updateStatusString: string = 'In';
  //  attendance update fucnionality
  attendanceCheckTimeResponse: AttendanceCheckTimeResponse[] = [];
  getAttendanceChecktimeListDate(statusString: string): void {
    this.updateStatusString = statusString.charAt(0).toUpperCase() + statusString.slice(1).toLowerCase();
    const formattedDate = this.datePipe.transform(this.requestedDate, 'yyyy-MM-dd');
    // Reset attendanceId field when request type changes
    this.attendanceTimeUpdateForm.get('updateGroup.attendanceId')?.reset();
    this.dataService.getAttendanceChecktimeList(this.userId, formattedDate, statusString).subscribe(response => {
      this.attendanceCheckTimeResponse = response.listOfObject;
      // console.log('checktime retrieved successfully', response.listOfObject);
    }, (error) => {
      console.log(error);
    });
  }

  resetError() {
    if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
      this.checkAttendance = false;
    } else if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
      this.getAttendanceExistanceStatus(this.selectedDateAttendance);    
    }
    this.getHolidayForOrganization(this.selectedDateAttendance);
   
  }

  attendanceTimeUpdateForm!: FormGroup;
  requestedDate!: Date;
  statusString!: string;
  attendanceRequestType: string = 'UPDATE';
  selectedDateAttendance!: Date;
  choosenDateString!: string;

  @ViewChild('closeAttendanceUpdateModal') closeAttendanceUpdateModal!: ElementRef;

  attendanceUpdateRequestLoader: boolean = false;
  submitForm(): void {
    if (this.checkHoliday || this.checkAttendance) {
      return;
    }
    const formValue = this.attendanceTimeUpdateForm.value;
    let attendanceTimeUpdateRequest: AttendanceTimeUpdateRequestDto = {
      managerId: formValue.managerId,
      requestReason: formValue.requestReason
    };

    if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
      attendanceTimeUpdateRequest = {
        ...attendanceTimeUpdateRequest,
        attendanceId: formValue.updateGroup.attendanceId,
        updatedTime: formValue.updateGroup.updatedTime,
      };
    } else if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
      attendanceTimeUpdateRequest = {
        ...attendanceTimeUpdateRequest,
        selectedDateAttendance: formValue.createGroup.selectedDateAttendance,
        inRequestTime: formValue.createGroup.inRequestTime,
        outRequestTime: formValue.createGroup.outRequestTime
      };
    }

    this.attendanceUpdateRequestLoader = true;
    attendanceTimeUpdateRequest.userUuid = this.userId;
    attendanceTimeUpdateRequest.requestType = this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value;
    attendanceTimeUpdateRequest.choosenDateString = this.choosenDateString;
    this.dataService.sendAttendanceTimeUpdateRequest(attendanceTimeUpdateRequest).subscribe(
      (response) => {
        // console.log('Request sent successfully', response);
        this.attendanceUpdateRequestLoader = false;
        console.log("retrive", response, response.status);
        if (response.status === true) {
          this.resetForm();
          // document.getElementById('attendanceUpdateModal')?.click();
          this.closeAttendanceUpdateModal.nativeElement.click();
          // this.attendanceRequestType = 'UPDATE';
          this.attendanceTimeUpdateForm.get('attendanceRequestType')?.setValue('UPDATE');

          // this.getAttendanceRequestLogData();
          this.helperService.showToast('Request Sent Successfully.', Key.TOAST_STATUS_SUCCESS);
        } else if (response.status === false) {
          // this.resetForm();
          // document.getElementById('attendanceUpdateModal')?.click();
          // this.getAttendanceRequestLogData();
          this.helperService.showToast('Request already registered!', Key.TOAST_STATUS_ERROR);
        }
        this.selectedRequest = '';
        this.updateStatusString = 'In';
      },
      (error) => {
        this.attendanceUpdateRequestLoader = false;
        console.error('Error sending request:', error);
      }
    );
    // }
  }

  emptySelectRequest() {
    this.selectedRequest = '';
  }


  // submitForm(): void {
  //   debugger
  //   if (this.attendanceTimeUpdateForm.valid) {
  //     const attendanceTimeUpdateRequest: AttendanceTimeUpdateRequestDto = this.attendanceTimeUpdateForm.value;
  //     this.dataService.sendAttendanceTimeUpdateRequest(this.userId, this.attendanceTimeUpdateForm.value, this.attendanceRequestType).subscribe(
  //       (response) => {
  //         console.log('Request sent successfully', response);
  //         this.resetForm();
  //         document.getElementById('attendanceUpdateModal')?.click();
  //         this.getAttendanceRequestLogData();
  //       },
  //       (error) => {
  //         console.error('Error sending request:', error);
  //       }
  //     );
  //   }
  // }

  // onDateChange(date: Date | null): void {
  //   if (date) {
  //     this.requestedDate = date;
  //     this.statusString = this.attendanceTimeUpdateForm.get('requestType')?.value || '';
  //     this.getAttendanceChecktimeListDate();
  //   }
  // }

  onDateChange(date: Date | null): void {
    if (date && this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
      this.requestedDate = date;
      this.choosenDateString = this.helperService.formatDateToYYYYMMDD(date);
      this.statusString = this.attendanceTimeUpdateForm.get('updateGroup.requestType')?.value || '';
      this.getAttendanceChecktimeListDate(this.attendanceTimeUpdateForm.get('updateGroup.requestType')?.value);
    } else if (date && this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
      this.selectedDateAttendance = date;
      this.choosenDateString = this.helperService.formatDateToYYYYMMDD(date);
      console.log(" this.choosenDateString", this.choosenDateString);
      this.statusString = this.attendanceTimeUpdateForm.get('createGroup.requestType')?.value || '';
      this.getHolidayForOrganization(this.selectedDateAttendance);
      this.getAttendanceExistanceStatus(this.selectedDateAttendance);
    }
  }

  // onDateChangeForCreateAttendance(date: Date | null): void {
  //   if (date && this.attendanceRequestType === 'CREATE') {
  //     this.selectedDateAttendance = date;
  //     this.choosenDateString = this.helperService.formatDateToYYYYMMDD(date);
  //     console.log(" this.choosenDateString",  this.choosenDateString);
  //     this.statusString = this.attendanceTimeUpdateForm.get('createGroup.requestType')?.value || '';
  //     this.getHolidayForOrganization(this.selectedDateAttendance);
  //     this.getAttendanceExistanceStatus(this.selectedDateAttendance);
  //   }
  // }


  checkHoliday: boolean = false;

  getHolidayForOrganization(selectedDate: any) {
    debugger
    this.checkHoliday = false;
    this.dataService.getHolidayForOrganization(this.helperService.formatDateToYYYYMMDD(selectedDate))
      .subscribe(
        (response) => {
          this.checkHoliday = response.object;
          console.log(response);
          console.error("Response", response.object);
        },
        (error) => {
          console.error('Error details:', error);
        }
      )
  }


  checkAttendance: boolean = false;
  getAttendanceExistanceStatus(selectedDate: any) {
    debugger
    this.checkAttendance = false;
    this.dataService.getAttendanceExistanceStatus(this.userId, this.helperService.formatDateToYYYYMMDD(selectedDate))
      .subscribe(
        (response) => {
          this.checkAttendance = response.object;
          console.log(response);
          console.error("Response", response.object);
        },
        (error) => {
          console.error('Error details:', error);
        }
      )
  }

  // isAttendanceFormValid(): boolean {
  //   if (this.attendanceRequestType === 'UPDATE') {
  //     return this.attendanceTimeUpdateForm.get('updateGroup')?.valid && this.attendanceTimeUpdateForm.get('managerId')?.valid && this.attendanceTimeUpdateForm.get('requestReason')?.valid;
  //   } else if (this.attendanceRequestType === 'CREATE') {
  //     return this.attendanceTimeUpdateForm.get('createGroup')?.valid && this.attendanceTimeUpdateForm.get('managerId')?.valid && this.attendanceTimeUpdateForm.get('requestReason')?.valid;
  //   }
  //   return false;
  // }
  
  isAttendanceFormValid(): boolean {

    if (this.checkHoliday === true || this.checkAttendance === true) {
      return false;
    }
    if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
      const updateGroup = this.attendanceTimeUpdateForm.get('updateGroup');
      const managerId = this.attendanceTimeUpdateForm.get('managerId');
      const requestReason = this.attendanceTimeUpdateForm.get('requestReason');

      return (updateGroup ? updateGroup.valid : false) &&
        (managerId ? managerId.valid : false) &&
        (requestReason ? requestReason.valid : false);
    } else if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
      const createGroup = this.attendanceTimeUpdateForm.get('createGroup');
      const managerId = this.attendanceTimeUpdateForm.get('managerId');
      const requestReason = this.attendanceTimeUpdateForm.get('requestReason');

      return (createGroup ? createGroup.valid : false) &&
        (managerId ? managerId.valid : false) &&
        (requestReason ? requestReason.valid : false);
    }
    return false;
  }

  isAttendanceFormValid2(): boolean {
    return this.attendanceTimeUpdateForm.valid;
  }




  onAttendanceRequestTypeChange(): void {
    debugger
    console.log(`Selected Attendance Request Type: ${this.attendanceRequestType}`);
    this.resetFormFields();
    this.checkHoliday = false;
    this.checkAttendance = false;
  }

  private resetFormFields(): void {
    if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
      this.attendanceTimeUpdateForm.get('updateGroup')?.reset();
    } else if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
      this.attendanceTimeUpdateForm.get('createGroup')?.reset();
    }
    // Optionally reset common fields if needed
    this.attendanceTimeUpdateForm.get('managerId')?.reset();
    this.attendanceTimeUpdateForm.get('requestReason')?.reset();
    // this.attendanceTimeUpdateForm.get('attendanceRequestType')?.setValue('UPDATE');
  }




  resetForm(): void {
    this.attendanceTimeUpdateForm.reset();
  }


  disabledDate = (current: Date): boolean => {
    return moment(current).isAfter(moment(), 'day');
  }


  //  logs 

  viewLogs(selectedDate: string) {
    debugger
    console.log('Selected Date:', selectedDate);
    this.attendanceLogResponseList = [];
    this.getAttendanceLogsMethodCall(selectedDate);
  }


  attendanceLogShimmerFlag: boolean = false;
  dataNotFoundFlagForAttendanceLog: boolean = false;
  networkConnectionErrorFlagForAttendanceLog: boolean = false;
  attendanceLogResponseList: AttendanceLogResponse[] = [];
  isShimmerLogs: boolean = false;
  getAttendanceLogsMethodCall(selectedDate: string) {
    this.isShimmerLogs = true;
    this.dataService
      .getAttendanceLogs(
        this.userId,
        selectedDate
      )
      .subscribe(
        (response) => {
          debugger;
          this.attendanceLogResponseList = response;
          this.isShimmerLogs = false;
          // console.log(response);
          if (
            response === undefined ||
            response === null ||
            response.length === 0
          ) {
            this.dataNotFoundFlagForAttendanceLog = true;
          }
        },
        (error) => {
          // console.log(error);
          this.isShimmerLogs = false;
          this.networkConnectionErrorFlagForAttendanceLog = true;
        }
      );
  }


  @ViewChild('attendancewithlocationssButton')
  attendancewithlocationssButton!: ElementRef;
  lat: number = 0;
  lng: number = 0;
  zoom: number = 15;

  openAddressModal(lat: string, long: string) {
    this.lat = +lat;
    this.lng = +long;
    this.attendancewithlocationssButton.nativeElement.click();
  }



  url: string = '';
  imageDownUrl: string = '';
  openSelfieModal(url: string) {
    this.url = url;
    this.imageDownUrl = url;
    this.updateFileType(url);
    this.viewlog.nativeElement.click();
    this.openDocModalButton.nativeElement.click();
  }

  previewString: SafeResourceUrl | null = null;
  isPDF: boolean = false;
  isImage: boolean = false;

  @ViewChild('openDocModalButton') openDocModalButton!: ElementRef;
  getFileName(url: string): string {
    return url.split('/').pop() || 'Attendance Selfie';
  }

  private updateFileType(url: string) {
    const extension = url.split('?')[0].split('.').pop()?.toLowerCase();
    this.isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(extension!);
    this.isPDF = extension === 'pdf';
    if (this.isPDF) {
      this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`);
    } else {
      this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  openViewModal(url: string): void {
    this.url = url;
    this.updateFileType(url);
    this.viewlog.nativeElement.click();
    this.openDocModalButton.nativeElement.click();
  }

  // downloadFile(): void {
  //   const link = document.createElement('a');
  //   link.href = this.url;
  //   link.download = this.getFileName(this.url);
  //   link.click();
  // }


  downloadFile(imageUrl: any) {
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
          saveAs(blob, 'Selfie');
        };
        xhr.open('GET', url);
        xhr.send();
      })
      .catch((error: any) => {
        // Handle any errors
      });
  }


  @ViewChild('viewlog') viewlog!: ElementRef;
  @ViewChild('attendanceLogModal') attendanceLogModal!: ElementRef;
  reOpenLogsModal() {
    this.viewLogs(this.userId);
    this.viewlog.nativeElement.click();
  }

  getAddressFromCoords(lat: any, lng: any): string | undefined {
    // if(!this.Constant.EMPTY_STRINGS.includes(lat) && !this.Constant.EMPTY_STRINGS.includes(lng)){
    //   lat=Number(lat);
    //   lng=Number(lng)
    //   console.log("🚀 ~ getAddressFromCoords ~ lat:", lat,lng)
    //   // return "Click 'View Location' , to view attendace location on map";

    // this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    //   if (status === google.maps.GeocoderStatus.OK && results && results[0] ) {
    //     return results[0].formatted_address;
    //   } else {
    //     return "Click 'View Location' , to view attendace location on map";
    //   }
    // }).catch(error=>{
    //   return "Click 'View Location' , to view attendace location on map";
    // });
    // }else{
    //   return "Click 'View Location' , to view attendace location on map";

    // }
    return "Click 'View Location' , to view attendace location on map";
  }


  //  break timings 


   breakTimingsList : BreakTimings[] = [];
   getUserBreakTimingsReportByDate(date: string) {
      // this.toggleChevron(show);
      this.breakTimingsList = [];
      if (
        this.breakTimingsList == undefined ||
        this.breakTimingsList == null ||
        this.breakTimingsList.length == 0
      ) {
        debugger;
        this.dataService
          .getAttendanceDetailsBreakTimingsReportByDateByUser(
            this.userId,
            date
          )
          .subscribe(
            (response) => {
              // this.breakTimingsList = response.listOfObject;
              this.breakTimingsList = response.listOfObject;
              // console.log(this.breakTimingsList);
              // this.toggleChevron(false);
            },
            (error) => {
              console.log(error);
            }
          );
      } else {
      }
    }

}
