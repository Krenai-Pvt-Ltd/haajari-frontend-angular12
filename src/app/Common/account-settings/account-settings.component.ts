
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  constructor(private dataService: DataService,
    public roleService: RoleBasedAccessControlService,
    private fb: FormBuilder,
    private afStorage: AngularFireStorage,
    private helperService: HelperService,
  ) {
    this.supportForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      description: ['', Validators.required],
      attachments: [null],
    });
  }

  UUID: string = '';
  ngOnInit(): void {
    this.UUID= this.roleService.getUuid();
    this.getEmployeeProfileData();
    this.loadNotificationSettings();
    this.fetchGuidelines();
    this.fetchHrPolicies();
  }

  tab: string = 'account';
  switchTab(tab: string) {
    this.tab = tab
  }


  employeeProfileResponseData: any;
  resignationDate: any;
  isLoading: boolean = false;
  getEmployeeProfileData() {
    this.isLoading = true;
    this.dataService.getEmployeeProfile(this.UUID).subscribe((response) => {
      this.employeeProfileResponseData = response.object;
      this.isLoading = false;
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





  uploadFile(file: File): void {
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
              .subscribe((x) => {
                // console.log(x);
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



  onFileSelect(event: any): void {
    if (event.target.files) {
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
          this.helperService.showToast('Save Successfully', Key.TOAST_STATUS_SUCCESS)
          this.supportForm.reset();
          this.attachedHnSFile=[];
          this.filesString='';
          this.isLoadingHnS = false;
        },
        error => {
          this.helperService.showToast('Error saving', Key.TOAST_STATUS_ERROR);
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
}
