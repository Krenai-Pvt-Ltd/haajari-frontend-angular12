
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Key } from 'src/app/constant/key';
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

  constructor(private dataService: DataService,
    public roleService: RoleBasedAccessControlService,
    private afStorage: AngularFireStorage,
    private helperService: HelperService,
  ) { }

  UUID: string = '';
  ngOnInit(): void {
    this.UUID= this.roleService.getUuid();
    this.getEmployeeProfileData();
    this.loadNotificationSettings();
    this.fetchGuidelines();
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
  updateNotificationVia(via:string): void {
    this.dataService.updateNotificationViaSetting(via).subscribe({
      next: (response) => {
        this.notification=response;
        this.helperService.showToast("Notification updated Successfully",Key.TOAST_STATUS_SUCCESS);
      },
      error: (error) => {
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
}
