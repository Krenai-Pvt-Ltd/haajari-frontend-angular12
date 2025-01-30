
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { EmployeeAdditionalDocument } from 'src/app/models/EmployeeAdditionalDocument';
import { UserPasswordRequest } from 'src/app/models/user-password-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit {

  supportForm: FormGroup;
  userId: any;
  constructor(private dataService: DataService,
    public roleService: RoleBasedAccessControlService,
    private fb: FormBuilder,
    private afStorage: AngularFireStorage,
    private helperService: HelperService,
    private sanitizer: DomSanitizer,
    private activateRoute: ActivatedRoute
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
    this.supportForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      description: ['', Validators.required],
      attachments: [null],
    });
  }

  UUID: string = '';
  userInfo:any;
  ngOnInit(): void {
    this.UUID= this.roleService.getUuid();
    this.userInfo= this.roleService.userInfo;

    this.notificationTypes();
    this.setFormData();
    this.supportForm.get('email')?.disable();
    this.supportForm.get('phone')?.disable();
    this.getEmployeeProfileData();
    this.loadNotificationSettings();
    this.fetchGuidelines();
    this.fetchHrPolicies();
  }
  setFormData(): void {
    this.supportForm.patchValue({
      email: this.userInfo.email,
      phone: this.dataService.employeeData?.phoneNumber,
    });
  }

  tab: string = 'account';
  switchTab(tab: string) {
    this.tab = tab
  }

  enableEmail(): void {
    this.supportForm.get('email')?.enable();
  }
  enablePhoneNumber(): void {
    this.supportForm.get('phone')?.enable();
  }

  isEmailEditable: boolean = false;
  isPhoneEditable: boolean = false;

  employeeProfileResponseData: any;
  resignationDate: any;
  isLoading: boolean = false;
  getEmployeeProfileData() {
    this.isLoading = true;
    this.dataService.getEmployeeProfile(this.UUID).subscribe((response) => {
      this.employeeProfileResponseData = response.object;
      this.isLoading = false;
      this.isUploading = false;
  }, (error) => {
      console.log(error);
     this.isLoading = false;
    })
  }

  guidelines:any;
  fetchGuidelines(): void {
    this.dataService.getUserGuidelines().subscribe({
      next: (data) => {
        this.guidelines = data;
        console.log('Guidelines:', data);
      },
      error: (err) => {
        console.error('Error fetching guidelines:', err);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
     this.uploadFile(file);
    }
  }

  errorMessage: string = '';
  userPasswordRequest: UserPasswordRequest = new UserPasswordRequest();
  currentPassword: string = '';
  confirmPassword: string = '';
  onSubmit() {

    if(this.userPasswordRequest.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.helperService.showToast('Passwords do not match.', Key.TOAST_STATUS_ERROR);
      return;
    }
    this.userPasswordRequest.currentPassword = this.currentPassword;
    this.dataService.updateUserProfilePassword(this.userPasswordRequest).subscribe({
      next: (response) => {

        if (response.message === 'Current password is incorrect.') {
          this.errorMessage = response.message;
          this.helperService.showToast('Current password is incorrect.', Key.TOAST_STATUS_ERROR);
        } else {
          this.errorMessage = '';
          this.userPasswordRequest = new UserPasswordRequest();
          this.helperService.showToast('Password updated successfully', Key.TOAST_STATUS_SUCCESS);
        }
      },
      error: (error) => {

        this.errorMessage = 'An error occurred. Please try again.';
      },
    });
  }




  isUploading: boolean = false;
  uploadFile(file: File): void {
    this.isUploading = true;
    debugger;
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
            this.dataService
              .updateProfilePic(url)
              .subscribe(() => {
                this.helperService.showToast('Profile picture updated successfully', Key.TOAST_STATUS_SUCCESS);
                this.getEmployeeProfileData();
              });
          })
          .catch((error) => {
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        console.error('Error in upload snapshotChanges:', error);
      });
  }


  notification:any;
  updateLanguage(language:string): void {
    this.dataService.updateLanguageSetting(language).subscribe({
      next: (response) => {
        this.notification=response;
        this.helperService.showToast("Language updated Successfully",Key.TOAST_STATUS_SUCCESS);
      },
      error: (error) => {
        this.helperService.showToast("Error in updating Language", Key.TOAST_STATUS_ERROR);
      },
    });
  }

  updateNotificationSetting(isEnabled: boolean,via:string): void {
    if(!isEnabled){
      this.updateNotificationVia('OFF');
    }else{
      this.updateNotificationVia(via)
    }
  }
  isButtonLoading: boolean = false;
  updateNotificationVia(via:string): void {
    this.isButtonLoading = true;
    this.dataService.updateNotificationViaSetting(via).subscribe({
      next: (response) => {
        this.isButtonLoading = false;
        this.notification=response;
        this.helperService.showToast("Notification updated Successfully",Key.TOAST_STATUS_SUCCESS);
      },
      error: (error) => {
        this.isButtonLoading = false;
        this.helperService.showToast("Error in updating Notification", Key.TOAST_STATUS_ERROR);
      },
    });
  }

  allowNumbersOnly(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }


  loadNotificationSettings(): void {
    this.dataService.getNotificationSetting().subscribe({
      next: (data) => {
        console.log('Notification settings:', data);
        this.notification = data;
      },
      error: (err) => {
        console.error('Error fetching notification settings:', err);
      },
    });
  }

  formatTime(breakTime: string): string {
    const [hours, minutes] = breakTime.split(':');

    let result = '';
    if (+hours > 0) {
      result += `${hours} hour${+hours > 1 ? 's' : ''} `;
    }
    if (+minutes > 0) {
      result += `${minutes} min${+minutes > 1 ? 's' : ''}`;
    }

    return result.trim();
  }

  hrPolicyDocuments: EmployeeAdditionalDocument[] = [];
  fetchHrPolicies(){
    this.dataService.getHrPolicies()
          .subscribe(
            (data) => {
              this.hrPolicyDocuments = data;
            },
            (error) => {
              console.error('Error fetching documents:', error);
            }
          );
  }

  isYouTubeUrl(url: string): boolean {
    const youtubePatterns = [
        /^https:\/\/(www\.)?youtube\.com\/embed\//, // Embedded YouTube link
        /^https:\/\/(www\.)?youtube\.com\/watch\?/,  // Regular YouTube watch link
        /^https:\/\/youtu\.be\//                     // Shortened YouTube link
    ];
    return youtubePatterns.some((pattern) => pattern.test(url));
  }


  fileCheck:boolean = false;
  onFileSelect(event: any): void {
    const files = Array.from(event.target.files);
    const maxFileCount = 5-this.attachedHnSFile.length;
    // Check the file count
    if (files.length > maxFileCount) {
      this.fileCheck = true;
      return;
    }
    if (event.target.files) {
      this.fileCheck = false;
      Array.from(event.target.files).forEach((file) => {
        if (file instanceof File) {
          this.uploadFileHnS(file);
        }
      });
    }
  }

  removeFile(index: number): void {
    this.attachedHnSFile.splice(index, 1);
    this.filesString = this.attachedHnSFile.join(',');
    this.supportForm.get('attachments')?.setValue(this.filesString);
  }



  isLoadingHnS: boolean = false;
  onSubmitHnS(): void {
    if (this.supportForm.valid) {
      // const formData = new FormData();
      var body :{}={'email':this.supportForm.get('email')?.value, 'phone':this.supportForm.get('phone')?.value, 'description':this.supportForm.get('description')?.value, 'attachments':this.filesString}

      this.isLoadingHnS = true;
      this.dataService.createHelpRequest(body ).subscribe(
        response => {
          this.helperService.showToast('Your query has been successfully submitted. Our team will get back to you as soon as possible.', Key.TOAST_STATUS_SUCCESS)
          this.supportForm.reset();
          this.attachedHnSFile=[];
          this.filesString='';
          this.setFormData();
          this.isLoadingHnS = false;
        },
        error => {
          this.helperService.showToast('Unable to raise query at this moment please try again later', Key.TOAST_STATUS_ERROR);
          this.isLoadingHnS = false;
        }
      );

    }
  }
  attachedHnSFile: string[]=[];
  filesString: string='';
  isFileUploading: boolean=false;
  uploadFileHnS(file: File): void {
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
    this.isFileUploading=true;

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          this.isFileUploading=false;
          this.attachedHnSFile.push(url);
          this.filesString = this.attachedHnSFile.join(',');
          this.supportForm.get('attachments')?.setValue(this.filesString);
        });
      })
    ).subscribe();
  }


  previewString: SafeResourceUrl | null = null;
  setPreviewString(url:string):void {
    console.log(url);
    this.previewString = this.sanitizer.bypassSecurityTrustResourceUrl(url);;
  }
  downloadFile(fileUrl: string) {
    if (!fileUrl) {
      return;
    }

    fetch(fileUrl)
    .then(response => response.blob()) // Convert the image to a Blob
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'downloaded-file.jpg';
      link.download = fileName;  // This triggers the download

      link.style.display = 'none';  // Hide the link
      document.body.appendChild(link); // Append the link to the body
      link.click(); // Trigger the download
      document.body.removeChild(link); // Remove the link from the DOM
      URL.revokeObjectURL(blobUrl); // Release the object URL
    })
    .catch(error => {
      console.error('Error downloading file:', error);
    });
  }

  isUpdateTimeValid(): boolean {
    const currentDate = new Date();
    return this.guidelines?.newAttendanceRule?.updateTime >= currentDate;
  }


notifications: { [key: string]: any[] } | null = null;
notificationKeys: string[] = [];
shouldHideNotificationUpdateTab: boolean = false;

notificationTypes(): Promise<void> {
  return new Promise((resolve) => {
    this.dataService.notificationTypes(this.userId).subscribe(
      (response) => {
        // Assign the response object to the component
        this.notifications = response.object;

        // Extract keys for iteration
        this.notificationKeys = Object.keys(this.notifications ?? {}); 

        // Check if all notification keys have empty arrays
        this.shouldHideNotificationUpdateTab = this.notificationKeys.every(
          (key) => this.notifications?.[key]?.length === 0
        );

        resolve(); // Resolve after successful execution
      },
      (error) => {
        this.shouldHideNotificationUpdateTab = false;
        console.log('Error retrieving notification types:', error);
        resolve(); // Ensure resolve even on error
      }
    );
  });
}


isAttendanceType(type: string): boolean {
  const attendanceTypes = ['Check in', 'Check Out', 'Break', 'Back', 'Report'];
  return attendanceTypes.includes(type);
}

loadingToggles: { [key: string]: boolean } = {};

updateUserNotification(notificationId: number, statusValue: boolean): Promise<void> {
  const status = statusValue ? 'DISABLE' : 'ENABLE'; // Assign the correct status
  this.loadingToggles[notificationId] = true;
  return new Promise((resolve) => {
    this.dataService.updateUserNotification(notificationId, status).subscribe(
      () => {
        console.log("Updated successfully");
        this.loadingToggles[notificationId] = false;
        this.notificationTypes(); // Refresh notification types
        resolve(); // Resolve the promise after successful execution
      },
      (error) => {
        console.error("Error updating notification:", error);
        this.loadingToggles[notificationId] = false;
        resolve(); // Ensure resolve even on error to avoid unhandled promises
      }
    );
  });
}




}
