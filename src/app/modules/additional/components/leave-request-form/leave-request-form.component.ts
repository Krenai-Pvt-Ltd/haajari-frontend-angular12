import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import moment from 'moment';
import { UserDto } from 'src/app/models/user-dto.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-leave-request-form',
  templateUrl: './leave-request-form.component.html',
  styleUrls: ['./leave-request-form.component.css'],
})
export class LeaveRequestFormComponent implements OnInit {
  userLeaveForm: FormGroup;
  submitLeaveLoader: boolean = false;
  userUuid!: string;
  // currentNewDate = new Date().toISOString().split('T')[0];
  currentDate: Date = new Date();
  currentNewDate = moment(this.currentDate)
    .startOf('month')
    .format('YYYY-MM-DD');
  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage
  ) {
    this.userLeaveForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: [''],
      leaveType: ['', Validators.required],
      managerId: ['', Validators.required],
      optNotes: ['', Validators.required],
      userLeaveTemplateId:[''],
      halfDayLeave: [false],
      dayShift: [false],
      eveningShift: [false],
    });
  }

  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get(
      'userUuid'
    );
    this.userUuid = userUuidParam?.toString() ?? '';
    this.getUserLeaveReq();

    this.fetchManagerNames();
    // this.getUserLeaveReq();
  }
  @ViewChild('fileInput') fileInput!: ElementRef;
  saveLeaveRequestForWhatsappUser() {
    if (this.userLeaveForm.invalid) {
      return;
    }
    this.submitLeaveLoader = true;
    this.dataService
      .saveLeaveRequestFromWhatsapp(
        this.userUuid,
        this.userLeaveForm.value,
        this.fileToUpload
      )
      .subscribe({
        next: () => {
          this.submitLeaveLoader = false;
          this.userLeaveForm.reset();
          this.fileToUpload = '';
          // this.selectedFile = null;
          this.fileInput.nativeElement.value = '';
          // window.location.href =
          //   'https://api.whatsapp.com/send/?phone=918700822872&type=phone_number&app_absent=0';
        },
        error: (error) => {
          this.submitLeaveLoader = false;
          console.error(error);
        },
      });
  }

  managers: UserDto[] = [];
  selectedManagerId!: number;

  fetchManagerNames() {
    this.dataService
      .getEmployeeManagerDetailsViaWhatsapp(this.userUuid)
      .subscribe(
        (data: UserDto[]) => {
          this.managers = data;
        },
        (error) => {}
      );
  }

  // userLeave: any = [];
  userLeave: any[] = new Array();
  getUserLeaveReq1() {
    this.dataService.getUserLeaveRequests(this.userUuid).subscribe(
      (data) => {
        if (
          data.body != undefined ||
          data.body != null ||
          data.body.length != 0
        ) {
          this.userLeave = data.body;
        }
      },
      (error) => {}
    );
  }

  leaveLoading: boolean = false;
  getUserLeaveReq(){
    debugger
    this.leaveLoading = true;
    this.userLeave = [];
    // this.leaveCountPlaceholderFlag = false;
    this.dataService.getUserLeaveRequests(this.userUuid).subscribe(
      (res: any) => {
          this.userLeave = res.object;
          // if(res.status){
          //   this.userLeave = res.object;
          // }else if(res.status == 'false'){
          //   this.userLeave = [];
          // }

          if(this.userLeave == null){
            this.userLeave = []
          }

          this.leaveLoading = false;
      });
  }

  tempLeaveType: string =''
  onLeaveTypeChange(selectedLeave: any): void {
    debugger
      // this.userLeaveRequest.userLeaveTemplateId = selectedLeave ;
    // console.log('userLeaveTemplate leaveType', this.userLeaveRequest)

    this.userLeaveForm.patchValue({
      userLeaveTemplateId: selectedLeave,
    });

    console.log('userLeaveForm form ', this.userLeaveForm)
  }

  halfLeaveShiftToggle() {
    this.userLeaveForm.patchValue({
      halfDayLeave: !this.userLeaveForm.value.halfDayLeave,
    });
  }

  // halfDayLeaveShiftToggle: boolean = false;

  // halfLeaveShiftToggle() {
  //   this.halfDayLeaveShiftToggle = this.halfDayLeaveShiftToggle == true ? false : true;
  // }

  onShiftChange(shiftType: 'day' | 'evening') {
    // Update the form control values based on the shift type
    this.userLeaveForm.patchValue({
      halfDayLeave: true, // Ensure half-day leave is selected
      dayShift: shiftType === 'day', // True if day shift is selected, false otherwise
      eveningShift: shiftType === 'evening', // True if evening shift is selected, false otherwise
    });
  }

  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  fileToUpload: string = '';
  isSelecetdFileUploadedToFirebase: boolean = false;

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
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];

      if (this.isImageNew(this.selectedFile)) {
        this.setImgPreviewUrl(this.selectedFile);
      } else if (this.isPdf(this.selectedFile)) {
        this.setPdfPreviewUrl(this.selectedFile);
      }

      this.uploadFile(this.selectedFile); // Upload file to Firebase
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
        // console.log('Upload completed');
        fileRef
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            // console.log('File URL:', url);
            this.fileToUpload = url;
            // console.log('file url : ' + this.fileToUpload);
          })
          .catch((error) => {
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        console.error('Error in upload snapshotChanges:', error);
      });
  }

  goToWhatsappOnCancel() {
    window.location.href =
      'https://api.whatsapp.com/send/?phone=918700822872&type=phone_number&app_absent=0';
  }
}
