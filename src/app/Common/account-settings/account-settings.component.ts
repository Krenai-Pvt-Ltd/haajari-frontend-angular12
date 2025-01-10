import { co } from '@fullcalendar/core/internal-common';
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
}
