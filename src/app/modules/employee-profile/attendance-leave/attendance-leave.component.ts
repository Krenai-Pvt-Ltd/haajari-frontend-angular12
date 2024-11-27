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

@Component({
  selector: 'app-attendance-leave',
  templateUrl: './attendance-leave.component.html',
  styleUrls: ['./attendance-leave.component.css']
})
export class AttendanceLeaveComponent implements OnInit {

  userLeaveForm!: FormGroup;
  userId: any;
  count: number = 0;
  userLeaveRequest: UserLeaveRequest = new UserLeaveRequest();
  constructor(private dataService: DataService, private activateRoute: ActivatedRoute,
    private fb: FormBuilder, public helperService: HelperService, public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage,
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
    // this.getFirstAndLastDateOfMonth(this.selectedDate);
    this.calculateDateRange();

   }

  ngOnInit(): void {
    this.userLeaveForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      leaveType: [null, Validators.required],
      selectedUser: [null, Validators.required],
      note: [null, Validators.required],
    });
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
  }
  get canSubmit() {
    return this.userLeaveForm.valid;
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


removeFile(): void {
    this.uploadedFiles = [];
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

  getUserLeaveLogByUuid() {
    this.isLeaveShimmer = true;
      this.dataService.getUserLeaveLog(this.userId).subscribe(
        (data) => {
          this.userLeaveLog = data;
          this.isLeaveShimmer = false;
          if (data == null || data.length == 0) {
            this.isLeavePlaceholder = true;
            this.selectStatusFlag = false;
          } else {
            this.selectStatusFlag = true;
          }
        },
        (error) => {
          this.isLeaveErrorPlaceholder = true;
          this.isLeaveShimmer = false;
        }
    );
  }


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









  managers: UserDto[] = [];
  selectedManagerId!: number;
  isFileUploaded = false;
  submitLeaveLoader: boolean = false;
  fileToUpload: string = '';
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('cancelBtn') cancelBtn!: ElementRef;
  saveLeaveRequestUser() {
    debugger
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
          this.getUserLeaveLogByUuid();
          this.uploadedFiles=[];

          this.cancelBtn.nativeElement.click();
          // location.reload();
          } else{
            this.submitLeaveLoader = false;
            this.isLeavePlaceholder = false;
            this.isFileUploaded = false;
            this.helperService.showToast(data.message, Key.TOAST_STATUS_ERROR);
          }


        },
        (error) => {
          this.submitLeaveLoader = false;
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

    const element = event.currentTarget as HTMLInputElement;
    if (element.files && element.files.length) {
      this.uploadedFiles = Array.from(element.files);
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
        alert('User log deleted successfully.');
        this.loadLeaveLogs();
      },
      error: (err) => console.error('Error deleting log:', err)
    });
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
  }

  setWeekRange(date: Date, weekNumber: number): void {
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
    this.selectedTab = tab;
    this.presentWeek = false;
    // this.resetData();
    this.isShimmer = true;
    this.calculateDateRange();
    this.getEmployeeProfileAttendanceDetailsData();
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


  convertToHourMinuteFormat(time: string): string {
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

  convertToHourMinuteFormatNegativeCase(time: string): string {
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

  checkTimeNegative(time: string): boolean {
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
    const previousMonth = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() - 1,
      1
    );
    this.onMonthChange(previousMonth);
  }
}

// Navigate to the next month
goToNextMonth(): void {
  if (!this.isNextDisabled()) {
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


  
  


}
