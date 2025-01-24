import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserResignation } from 'src/app/models/UserResignation';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-exit-modal',
  template: './exit-modal.component.html',
  styleUrls: ['./exit-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExitModalComponent { 

  userId: any;
  ROLE: any;
  constructor(private dataService: DataService, private modalService: NgbModal,
     private fb: FormBuilder, public helperService: HelperService, private activateRoute: ActivatedRoute,
      private roleService: RoleBasedAccessControlService, private afStorage: AngularFireStorage,){

      if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
        this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
      }
  }

  ngOnInit(): void{
    this.ROLE = this.roleService.getRole();
    this.getNoticePeriodDuration();
  }

  userResignationReq: UserResignation = new UserResignation();

  clearFormData(form: NgForm) {
      this.clearForm();
      form.resetForm();
    }
  
    recommendDay: string = '';
    discussionType: string = '';
    clearForm() {
      this.recommendDay = ''
      this.discussionType = ''
      this.userResignationReq.uuid = ''
      this.userResignationReq.reason = ''
      this.userResignationReq.comment = ''
      this.userResignationReq.isManagerDiscussion = 0
      this.userResignationReq.isRecommendLastDay = 0
      this.userResignationReq.createdBy = ''
      this.userResignationReq.url = ''
      this.userResignationReq = new UserResignation();
    }


    @ViewChild('closeResignationButton') closeResignationButton!: ElementRef
      resignationToggle: boolean = false;
    submitResignation(form: NgForm) {

      this.resignationToggle = true;
      this.userResignationReq.createdBy = this.ROLE
      this.userResignationReq.uuid = this.userId
      // console.log('request form : ',this.userResignationReq)
      this.dataService.submitResignation(this.userResignationReq).subscribe((res: any) => {
        if (res.status) {
          this.resignationToggle = false
          // this.resignationViewModal = true;
          this.helperService.resignationSubmitted.next(true);
          this.closeResignationButton.nativeElement.click()
          this.clearForm();
          form.resetForm();
        }
      })
    }

  selectRecommendDay(value: string): void {

    this.userResignationReq.userLastWorkingDay = ''

    this.userResignationReq.isRecommendLastDay = value == 'Other' ? 1 : 0

    if (this.userResignationReq.isRecommendLastDay == 0) {
      this.userResignationReq.lastWorkingDay = ''
      this.calculateLasWorkingDay();
    }

  }

  calculateLasWorkingDay() {
    const today = new Date();
    // const maxDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date

    // this.lastWorkingDay = maxDate;
    // this.userResignationReq.lastWorkingDay = maxDate
    this.userResignationReq.userLastWorkingDay = this.helperService.formatDateToYYYYMMDD(maxDate);
    // console.log("Max Date: ", this.lastWorkingDay);
  }

  noticePeriodDuration: number = 0;
  getNoticePeriodDuration() {
    this.dataService.getNoticePeriodDuration(this.userId).subscribe((res: any) => {
      if (res.status) {
        this.noticePeriodDuration = res.object
        console.log('Duration: ', this.noticePeriodDuration)
      }
    })
  }

  isFileSelected = false;
  imagePreviewUrl: any = null;
  selectedFile: any;
  isUploading: boolean = false;
  fileName: any;
  currentDate: any
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      this.fileName = file.name;
      this.currentDate = new Date()
      // Check if the file type is valid
      if (this.isValidFileType(file)) {
        this.selectedFile = file;
        this.isUploading = true;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the loaded image as the preview
          this.imagePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(file);

        this.uploadFile(file);

        console.log('url is', this.userResignationReq.url)

      } else {
        element.value = '';
        this.userResignationReq.url = '';
        // Handle invalid file type here (e.g., show an error message)
        console.error(
          'Invalid file type. Please select a jpg, jpeg, or png file.'
        );
      }
    } else {
      this.isFileSelected = false;
    }
  }

  // Helper function to check if the file type is valid
  isInvalidFileType = false;
  isValidFileType(file: File): boolean {
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const fileType = file.type.split('/').pop(); // Get the file extension from the MIME type

    if (fileType && validExtensions.includes(fileType.toLowerCase())) {
      this.isInvalidFileType = false;
      return true;
    }
    // console.log(this.isInvalidFileType);
    this.isInvalidFileType = true;
    return false;
  }


  uploadFile(file: File): void {
    debugger;
    const filePath = `resignation/${new Date().getTime()}_${file.name}`;
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
            console.log('File URL:', url);
            this.isUploading = false;
            this.userResignationReq.url = url;
          })
          .catch((error) => {
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        console.error('Error in upload snapshotChanges:', error);
      });

    console.log('upload url is: ', this.userResignationReq.url)
  }

  deleteImage() {
    this.userResignationReq.url = ''
  }

}
