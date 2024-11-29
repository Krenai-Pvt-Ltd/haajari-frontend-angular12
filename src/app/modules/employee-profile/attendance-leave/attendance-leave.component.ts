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
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

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

  constructor(private dataService: DataService, private activateRoute: ActivatedRoute,
    private fb: FormBuilder, public helperService: HelperService, public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage, private modalService: NgbModal,
    private rbacService: RoleBasedAccessControlService,
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }


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
    this.currentUserUuid = this.rbacService.getUuid();
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
}
