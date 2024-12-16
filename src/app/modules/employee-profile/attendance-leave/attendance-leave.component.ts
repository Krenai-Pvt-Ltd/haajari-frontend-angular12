import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserDto } from 'src/app/models/user-dto.model';
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
// import { Timeline } from 'vis-timeline'
import { Timeline,DataSet, TimelineItem } from 'vis-timeline/standalone';

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
contentTemplate: string ='You are on the Notice Period, so that you can not apply leave';

  constructor(private dataService: DataService, private activateRoute: ActivatedRoute,
    private fb: FormBuilder, public helperService: HelperService, public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage, private modalService: NgbModal,
    private rbacService: RoleBasedAccessControlService,
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
    // this.getFirstAndLastDateOfMonth(this.selectedDate);

   }

  ngOnInit(): void {
    this.userLeaveForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      leaveType: [null, Validators.required],
      selectedUser: [null, Validators.required],
      note: [null, Validators.required],
    });
    this.getAttendanceRequests();
    this.fetchManagerNames();
    this.getUserLeaveReq();
    this.loadLeaveLogs();
    this.getOrganizationRegistrationDateMethodCall();

    this.selectedDate = new Date();
    this.updateThirtyDaysLabel();
    this.updateWeekLabels();
    // Set the default selected tab to the current week
    this.setDefaultWeekTab();
    this.calculateDateRange();
    this.getEmployeeProfileAttendanceDetailsData();
    this.currentUserUuid = this.rbacService.getUuid();

    this.calculateDateRange();
    this.getAttendanceRequests();


    this.checkUserLeaveTaken();
  }
  get canSubmit() {
    return this.userLeaveForm?.valid;
  }


  // ngAfterViewInit(): void {
  //   // this.getWorkedHourForEachDayOfAWeek();
  //   this.updateWeekLabels();
  //   this.calculateDateRange();
  // }




  isUserLeaveTaken: number = 0;
  checkUserLeaveTaken(){
    this.dataService.getUserLeaveTaken().subscribe((res: any) => {
      if(res.status){
        this.isUserLeaveTaken = res.object
      }else{
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
    this.userLeaveRequest.managerId=value;
    this.selectedUser = value;
    console.log('Selected User:', this.selectedUser);
  }
  note: string= '';

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
  totalPages=0;
  isLoading=true;
  loadLeaveLogsOld(): void {
    const leaveType = this.selectedLeaveType === 'All' ? undefined : this.selectedLeaveType;
    const status = this.selectedStatus === 'All' ? undefined : this.selectedStatus;

    this.isLoading=true;
    this.dataService
      .getUserLeaveLogFilter(this.userId, this.currentPage, this.pageSize, leaveType, status, this.searchQuery)
      .subscribe((response) => {
        this.userLeaveLog = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading=false;
      });
  }

  loadLeaveLogs(): void {
    const leaveType = this.selectedLeaveType === 'All' ? undefined : this.selectedLeaveType;
    const status = this.selectedStatus === 'All' ? undefined : this.selectedStatus;

    this.isLoading=true;
    this.dataService
      .getUserLeaveLogFilter(this.userId, this.currentPage, this.pageSize, leaveType, status, this.searchQuery)
      .subscribe((response) => {
        this.userLeaveLog = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading=false;
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
  isLoadingLeaveForm: boolean= false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('cancelBtn') cancelBtn!: ElementRef;
  saveLeaveRequestUser() {
    debugger
    this.isLoadingLeaveForm=true;
    this.userLeaveRequest.halfDayLeave = this.isHalfLeaveSelected;
    // this.userLeaveRequest.halfDayLeave = false;
    this.userLeaveRequest.leaveType=this.userLeaveRequest.userLeaveTemplateId.toString();
    this.dataService
      .saveLeaveRequest(this.userId, this.userLeaveRequest, this.fileToUpload)
      .subscribe(
        (data) => {
          // console.log(data);
          // console.log(data.body);

          if(data.status){
            this.submitLeaveLoader = false;
          this.isLeavePlaceholder = false;
          this.isFileUploaded = false;
          this.fileToUpload = '';
          // this.selectedFile = null;
          this.fileInput.nativeElement.value = '';
          // this.getUserLeaveReq();

          setTimeout(() => {
            this.getUserLeaveReq();
          },100);

          this.resetUserLeave();
          this.formGroupDirective.resetForm();
          this.uploadedFiles=[];
          this.loadLeaveLogs();
          this.cancelBtn.nativeElement.click();
          this.helperService.showToast('Leave Requested successfully', Key.TOAST_STATUS_SUCCESS);
          // location.reload();
          } else{
            this.submitLeaveLoader = false;
            this.isLeavePlaceholder = false;
            this.isFileUploaded = false;
            this.helperService.showToast(data.message, Key.TOAST_STATUS_ERROR);
          }
          this.isLoadingLeaveForm=false;

        },
        (error) => {
          this.submitLeaveLoader = false;
          this.isLoadingLeaveForm=false;
          // console.log(error.body);
        }
      );
  }
  resetUserLeave() {
    this.userLeaveRequest.startDate ='';
    this.userLeaveRequest.endDate = '';
    this.userLeaveRequest.halfDayLeave = false;
    this.userLeaveRequest.dayShift = false;
    this.userLeaveRequest.eveningShift = false;
    this.isHalfLeaveSelected=false;
    this.userLeaveRequest.leaveType = '';
    this.userLeaveRequest.managerId = 0;
    this.userLeaveRequest.optNotes = '';
    this.selectedManagerId = 0;
    this.uploadedFiles=[];
  }


  getUserLeaveReq(){
    this.leaveCountPlaceholderFlag = false;
    this.dataService.getUserLeaveRequests(this.userId).subscribe(
      (res: any) => {
          this.userLeave = res.object;
          console.log(this.userLeave);
          if(this.userLeave == null){
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

  onDelete(id:number) {
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
   @ViewChild('deletModalButton') deletModalButton!:ElementRef;
  openDeleteConfirmation(itemId: number): void {
    this.itemIdToDelete = itemId;
    // this.modalService.open(this.deleteConfirmation, { centered: true });
    this.deletModalButton.nativeElement.click();
  }

  isDeleting: boolean = false;

   @ViewChild('deleCloseButton') deleCloseButton!:ElementRef;
  confirmDelete(modal: NgbModalRef): void {
    this.isDeleting = true;
    if (this.itemIdToDelete !== null) {
      this.onDelete(this.itemIdToDelete);
    }
     this.deleCloseButton.nativeElement.click();

    // modal.close();
  }

  // Handle edit action
  @ViewChild('leaveApplyButton') leaveApplyButton!:ElementRef;
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

  applyNewLeaveReq(){
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



  onMonthChange(month: Date): void {
   
    this.selectedDate = month;
    this.presentWeek = false;
    // this.resetData();
    this.isShimmer = true;
    this.updateThirtyDaysLabel();
    this.updateWeekLabels();
    this.selectedTab = 'Week 1'; // Reset to default
    this.calculateDateRange();
    this.getEmployeeProfileAttendanceDetailsData();
    // this.getWorkedHourForEachDayOfAWeek();
  }

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
    const weeks = Math.ceil(lastDay / 7);

    this.weekLabels = Array.from({ length: weeks }, (_, i) => `Week ${i + 1}`);
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
    if(tab == '30 DAYS') {
      this.searchString = 'ALL';
    }else {
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

  attendanceDetails: EmployeeProfileAttendanceResponse[] = [];
  totalAttendanceDetails: TotalEmployeeProfileAttendanceResponse = new TotalEmployeeProfileAttendanceResponse();
  isShimmer : boolean = false;
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
    const organizationRegistrationYear = new Date(
      this.organizationRegistrationDate
    ).getFullYear();
    const organizationRegistrationMonth = new Date(
      this.organizationRegistrationDate
    ).getMonth();

    // Disable if the month is before the organization registration month
    if (
      dateYear < organizationRegistrationYear ||
      (dateYear === organizationRegistrationYear &&
        dateMonth < organizationRegistrationMonth)
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
  const organizationRegistrationDate = new Date(this.organizationRegistrationDate);
  return (
    this.selectedDate.getFullYear() === organizationRegistrationDate.getFullYear() &&
    this.selectedDate.getMonth() === organizationRegistrationDate.getMonth()
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

presentWeek : boolean = false;
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






timeline: Timeline | undefined;
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
  getAttendanceRequests(): void {
    debugger;
    this.dataService.getUserAttendanceRequests(this.userId, '2024-12-01', this.page, this.requestSize).subscribe(
      (response) => {
        this.staticData = response.content;
        console.log('kkkkkkkk', response);
        this.getTimelineData();
        this.getTimelineGroups();
        this.getOptions();
        this.timeline = new Timeline(this.timelineContainer?.nativeElement, this.data, this.options);
        this.timeline.setGroups(this.groups);
        this.timeline.setItems(this.data);

      },
       (err) => {
        console.error('kkkkkkkk', err);
      }
    );
  }


  getTimelineGroups() {
    // Create groups dynamically from static data
    this.groups = new DataSet(
      this.staticData.map((group) => ({
        id: group.groupId,
        content: group.date,
      }))
    );
  }

  getTimelineData() {
    // Combine all items from the static data into a single array
    const allItems = this.staticData
    .map((group) =>
      group.items.map((item) => ({
        ...item,
        group: group.groupId,
      }))
    )
    .reduce((acc, items) => acc.concat(items), []);


    this.data = new DataSet(allItems);
  }

  getOptions() {
    let currentDate = new Date();
    let startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0); // Set the start time to 00:00

    let endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999); // Set the end time to 23:59:59

    this.options = {
      stack: false,
      editable: false,
      margin: {
        item: 10,
        axis: 5,
      },
      orientation: 'top',
      zoomable: false,

      showCurrentTime: false,
      format: {
        minorLabels: {
          hour: 'HH:00',
        },
        majorLabels: {
          day: 'DD/MM/YYYY',
        },
      },
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap',
        template: (item: TimelineItem) => {
          const startTime = new Date(item.start).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const endTime = item.end
            ? new Date(item.end).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : null;
          return `
            <div>
              <strong>${item.content}</strong><br />
              Start: ${startTime}<br />
              ${endTime ? `End: ${endTime}` : ''}
            </div>
          `;
        },
      },
    };
  }
// new

@ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
private chart!: Chart;

searchString = 'WEEK';
endDateStr : string = '';
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
  }else {
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
  const ctx = this.chartCanvas.nativeElement.getContext('2d');

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


}
