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


   }

  ngOnInit(): void {
    this.userLeaveForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      leaveType: ['', Validators.required],
      managerId: ['', Validators.required],
      optNotes: ['', Validators.required],
      halfDayLeave: [false],
      dayShift: [false],
      eveningShift: [false],
    });
    this.fetchManagerNames();
    this.getUserLeaveReq();
    this.loadLeaveLogs();
  }


  isHalfLeaveSelected: boolean = false;

  toggleHalfLeaveSelection(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isHalfLeaveSelected = checkbox.checked;
  }

  startDate: Date | null = null;
  endDate: Date | null = null;

  onStartDateChange(date: Date): void {
    this.startDate = date;
    console.log('Start Date:', this.startDate);
  }

  onEndDateChange(date: Date): void {
    this.endDate = date;
    console.log('End Date:', this.endDate);
  }

  leaveTypes1: { value: string; label: string }[] = [
    { value: 'Attendance update', label: 'Attendance update' },
    { value: 'Overtime', label: 'Overtime' },
    { value: 'Lop reversal', label: 'Lop reversal' },
  ];
  selectedLeaveType1: string | null = null;

  onLeaveTypeChange1(value: string): void {
    this.selectedLeaveType1 = value;
    console.log('Selected Leave Type:', this.selectedLeaveType1);
  }

  selectedUser: string | null = null;
  onUserChange(value: string): void {
    this.selectedUser = value;
    console.log('Selected User:', this.selectedUser);
  }
  note: string = '';

  uploadedFile: File | null = null;


removeFile(): void {
    this.uploadedFile = null;
}

viewFile(file: File): void {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
}



  userLeave: any = [];
  leaveCountPlaceholderFlag: boolean = false;
  getUserLeaveReq1() {
    this.leaveCountPlaceholderFlag = false;
    this.dataService.getUserLeaveRequests(this.userId).subscribe(
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
        this.count++;
      },
      (error) => {
        this.count++;
      }
    );
  }


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



  managers: UserDto[] = [];
  selectedManagerId!: number;
  isFileUploaded = false;
  dayShiftToggle: boolean = false;
  eveningShiftToggle: boolean = false;
  submitLeaveLoader: boolean = false;
  fileToUpload: string = '';
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('requestLeaveCloseModel') requestLeaveCloseModel!: ElementRef;
  saveLeaveRequestUser() {

    if (this.userLeaveForm.invalid || this.isFileUploaded) {
      return;
    }

    this.userLeaveRequest.managerId = this.selectedManagerId;
    this.userLeaveRequest.dayShift = this.dayShiftToggle;
    this.userLeaveRequest.eveningShift = this.eveningShiftToggle;
    this.submitLeaveLoader = true;
    // this.userLeaveRequest.halfDayLeave = false;
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

          this.requestLeaveCloseModel.nativeElement.click();
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

  onLeaveTypeChange(selectedLeave: any): void {
    debugger
    // if(selectedLeave == undefined){
      this.userLeaveRequest.userLeaveTemplateId = selectedLeave ;
    // console.log('userLeaveTemplate leaveType', this.userLeaveRequest)
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

  fileName: any;
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  isSelecetdFileUploadedToFirebase: boolean = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  expenseTypeReq: ExpenseType = new ExpenseType();
  onFileSelected(event: Event): void {

    const element = event.currentTarget as HTMLInputElement;
    if (element.files && element.files.length) {
      this.uploadedFile = element.files[0];
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
  onEdit() {
    console.log('Edit button clicked');
    // Add logic to open a modal
    // Example: this.modalService.open(EditModalComponent);
  }
}
