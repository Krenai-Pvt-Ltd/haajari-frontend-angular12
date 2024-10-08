import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { NotificationVia } from 'src/app/models/notification-via';

import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css'],
})
export class AccountSettingsComponent implements OnInit, AfterViewInit {
  userPersonalInformationRequest: UserPersonalInformationRequest =
    new UserPersonalInformationRequest();
  notificationVia: NotificationVia = new NotificationVia();
  accountDetailsTab: string | null = null;
  securityTab: any;
  profilePreferencesTab: any;
  referralProgramTab: any;

  constructor(
    private _routeParam: ActivatedRoute,
    public _data: DataService,
    private cdr: ChangeDetectorRef,
    private rbacService: RoleBasedAccessControlService,
    private afStorage: AngularFireStorage,
    private helper: HelperService,
    private router: Router
  ) {
    debugger;
    if (this._routeParam.snapshot.queryParamMap.has('setting')) {
      this.accountDetailsTab =
        this._routeParam.snapshot.queryParamMap.get('setting');
    }
  }

  ngAfterViewChecked() {
    if (this._routeParam.snapshot.queryParamMap.has('setting')) {
      this.accountDetailsTab =
        this._routeParam.snapshot.queryParamMap.get('setting');
    }
    this.cdr.detectChanges();
  }

  ROLE: any;
  async ngOnInit(): Promise<void> {
    window.scroll(0, 0);
    this.ROLE = await this.rbacService.getRole();

    this.getUserAccountDetailsMethodCall();
    this.getOnboardingVia();
    this.getOrganizationIsInstalledFlag();
    this.getSlackAuthUrl();
    this.helper.saveOrgSecondaryToDoStepBarData(0);
  }

  @ViewChild('account') account!: ElementRef;
  @ViewChild('refer') refer!: ElementRef;
  @ViewChild('profilePreferencesSetting')
  profilePreferencesSetting!: ElementRef;
  @ViewChild('settingSecure') settingSecure!: ElementRef;
  tabName: string = '';

  openTabOnClick(str: string) {
    debugger;
    // if (this.accountDetailsTab == 'accountDetails') {
    //   // this.account.nativeElement.click();
    //   this.accountDetailsTab = 'accountDetails';
    // } else if (this.accountDetailsTab == 'security') {
    //   // this.settingSecure.nativeElement.click();
    //   this.accountDetailsTab = 'security';
    // } else if (this.accountDetailsTab == 'profilePreferences') {
    //   // this.profilePreferencesSetting.nativeElement.click();
    //   this.accountDetailsTab = 'profilePreferences';
    // } else if (this.accountDetailsTab == 'referralProgram') {
    //   // this.refer.nativeElement.click();
    //   this.accountDetailsTab = 'referralProgram';
    // }
  }

  ngAfterViewInit() {
    // if (this._data.activeTab) {
    //   this.refer.nativeElement.click();
    // } else {
    //   this.account.nativeElement.click();
    // }
    // this.openTabOnClick();
  }

  errorMessage: string = ''; // Property to store the error message
  @ViewChild('passwordUpdateModal') passwordUpdateModal!: ElementRef;
  onSubmit(formValue: any) {
    debugger;
    // console.log(formValue);
    this._data.updateUserProfilePassword(formValue).subscribe({
      next: (response) => {
        // Handle successful response here
        // Reset the error message if the update is successful
        if (response.message === 'Current password is incorrect.') {
          this.errorMessage = response.message;
        } else {
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
          this.errorMessage = '';
          this.passwordUpdateModal.nativeElement.click();
        }
      },
      error: (error) => {
        // Check if the error response matches the specific condition

        // Handle other errors or set a generic error message
        this.errorMessage = 'An error occurred. Please try again.';
      },
    });
  }

  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  showNewPassword = false;
  showCurrentPassword: boolean = false;

  onCancel() {
    // Handle the cancel action, e.g., clear the form or navigate away
    this.errorMessage = '';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  isPlan1: boolean = false;
  isPlanActive: boolean = false;
  isSubscriptionPlanActive: boolean = false;
  subscriptionPlanId: number = 0;
  userEmail: String = '';
  isDisabled: boolean = false;
  getUserAccountDetailsMethodCall() {
    debugger;
    this._data.getUserAccountDetails().subscribe({
      next: (response: UserPersonalInformationRequest) => {
        this.userEmail = response.email; // Handle the response, e.g., store it for display
        this.userPersonalInformationRequest.image = response.image;
        this.isSubscriptionPlanActive = response.subscriptionPlan; // Handle the response, e.g., store it for display

        this.subscriptionPlanId = response.subscriptionPlanId;
        if (response.employeeAttendanceFlag) {
          this.employeeAttendanceFlag = true;
          if (response.employeeAttendanceForManagerType==1) {
            this.toggleOption1Flag= true;
            this.toggleOption2Flag= false;
          } else {
            this.toggleOption2Flag= true;
            this.toggleOption1Flag= false;
          }
        } else {
          this.employeeAttendanceFlag = false;
          this.toggleOption1Flag= false;
            this.toggleOption2Flag= false;
        }
        if (response.phoneNumber) {
          this.phoneNumber = response.phoneNumber;
        }
        if (response.languagePreferred == 2) {
         
          this.languagePreferredHindi = true;
        } else {
         
          this.languagePreferredEnglish = true;
        }
        if (response.notificationVia == 2) {
          this.notifications.slack = false;
          this.notifications.whatsapp = true;
        } else {
          this.notifications.slack = true;
          this.notifications.whatsapp = false;
        }
        if (response.notificationVia == null || response.slackUserId == null) {
          this.isDisabled = true;
        }
        if (
          this.isSubscriptionPlanActive == true &&
          this.subscriptionPlanId == 2
        ) {
          this.isPlanActive = true;
        } else if (
          this.isSubscriptionPlanActive == true &&
          this.subscriptionPlanId == 3
        ) {
          this.isPlanActive = true;
        } else if (
          this.isSubscriptionPlanActive == true &&
          this.subscriptionPlanId == 1
        ) {
          this.isPlan1 = true;
        }
      },
      error: (error) => {
        console.error('Error fetching user account details:', error); // Handle any errors
      },
    });
  }

  selectedFile: File | null = null;
  isFileSelected = false;
  imagePreviewUrl: any = null;
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      // Check if the file type is valid
      if (this.isValidFileType(file)) {
        this.selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the loaded image as the preview
          this.imagePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(file);

        this.uploadFile(file);
      } else {
        element.value = '';
        this.userPersonalInformationRequest.image = '';
        // Handle invalid file type here (e.g., show an error message)
        console.error(
          'Invalid file type. Please select a jpg, jpeg, or png file.'
        );
      }
    } else {
      this.isFileSelected = false;
    }
  }

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

            this.userPersonalInformationRequest.image = url;
            this._data
              .updateProfilePicture(this.userPersonalInformationRequest)
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

  // getUserSubscriptionPlanIdMethodCall(){
  //   debugger
  //   this._data.getUserSubscriptionPlanId().subscribe({
  //     next: (response: UserPersonalInformationRequest) => {
  //       this.isSubscriptionPlanActive = response.subscriptionPlan; // Handle the response, e.g., store it for display
  //       this.subscriptionPlanId =  response.subscriptionPlanId;
  //      if (this.isSubscriptionPlanActive== true && this.subscriptionPlanId==2){
  //         this.isPlanActive=true;
  //       } else if (this.isSubscriptionPlanActive== true && this.subscriptionPlanId==3){
  //         this.isPlanActive=true;
  //       } else if (this.isSubscriptionPlanActive== true && this.subscriptionPlanId==1){
  //         this.isPlan1=true;
  //       }
  //     },
  //     error: (error) => {
  //       console.error("Error fetching user Plan details:", error); // Handle any errors
  //     }
  //   });
  // }

  notifications = {
    whatsapp: false,
    slack: true, // Default to enabled if isPlanActive is true
  };


  onToggleChange(type: string) {
    if (type === 'slack') {
      if (this.notifications.slack) {
        // Slack is being enabled, disable WhatsApp
        this.notifications.whatsapp = false;
        this.notificationVia.id = 1;
      } else {
        // Slack is being disabled, ensure WhatsApp is enabled
        this.notifications.whatsapp = true;
        this.notificationVia.id = 2;
      }
    } else if (type === 'whatsapp') {
      if (this.notifications.whatsapp) {
        // WhatsApp is being enabled, disable Slack
        this.notifications.slack = false;
        this.notificationVia.id = 2;
      } else {
        // WhatsApp is being disabled, ensure Slack is enabled
        this.notifications.slack = true;
        this.notificationVia.id = 1;
      }
    }
    this.updateNotificationSettingMethodCall();
  }

  @ViewChild('otpModalButton') otpModalButton!: ElementRef;
  updateNotificationSettingMethodCall(): void {
    debugger;
    this._data.updateNotificationSetting(this.notificationVia).subscribe({
      next: (response: UserPersonalInformationRequest) => {
        // Handle successful update
        if (response.phoneNumber && response.notificationVia == 2) {
          this.helper.showToast(
            'Notification Setting Updated Successfully',
            Key.TOAST_STATUS_SUCCESS
          );

        } else if (
          response.phoneNumber == null &&
          this.notifications.whatsapp == true
        ) {
          this.notifications.whatsapp = false;
          this.notifications.slack = true;
          this.phoneNumber = '';
          this.otpModalButton.nativeElement.click();
          this.helper.showToast(
            'You need to add your Whatsapp number for notification',
            Key.TOAST_STATUS_ERROR
          );
        } else {
          this.helper.showToast(
            'Notification Setting Updated Successfully',
            Key.TOAST_STATUS_SUCCESS
          );
        }
      },
      error: (error) => {
        // Handle error
        console.error('Error updating notification settings', error);
      },
    });
  }

  otpSent: boolean = false;
  phoneNumber: string = '';
  sendOtptoSavePhoneNumberMethodCall(): void {
    debugger;
    this.toggle = true;
    this._data.sendOtptoSavePhoneNumber(this.phoneNumber).subscribe({
      next: (response: any) => {
        // Handle the response here, e.g., showing a success message
        if (response == true) {
          this.otpSent = true;
          this.toggle = false;
          this.otp = 0;
          this.helper.showToast(
            'OTP sent successfully',
            Key.TOAST_STATUS_SUCCESS
          );
          console.log('OTP sent successfully', response);
        } else {
          this.helper.showToast(
            'Invalid number or Whatsapp Account not found',
            Key.TOAST_STATUS_ERROR
          );
        }

        // You might want to navigate the user or enable further UI elements here
      },
      error: (error) => {
        // Handle any errors here, e.g., showing an error message
        this.helper.showToast(
          'Invalid number or Whatsapp Account not found',
          Key.TOAST_STATUS_ERROR
        );
        console.error('Error sending OTP', error);
      },
    });
  }

  // toggle: boolean = false;
  // otp: number = 0;
  // verifyOtpMethodCall(): void {
  //   this.toggle = true;
  //   this._data
  //     .verifyOtpForUpdatingPhoneNumber(this.phoneNumber, this.otp)
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response == true) {
  //           this.toggle = false;
  //           this.helper.showToast(
  //             'OTP verified successfully',
  //             Key.TOAST_STATUS_SUCCESS
  //           );
  //           this.otpModalButton.nativeElement.click();
  //           this.notifications.whatsapp = true;
  //           this.notifications.slack = false;
  //           console.log('OTP sent successfully', response);
  //         } else {
  //           this.helper.showToast(
  //             'Invalid number or Whatsapp Account not found',
  //             Key.TOAST_STATUS_ERROR
  //           );
  //         }
  //       },
  //       error: (error) => {
  //         // Handle any errors here, e.g., showing an error message
  //         this.helper.showToast('Invalid OTP', Key.TOAST_STATUS_ERROR);
  //         console.error('Error sending OTP', error);
  //       },
  //     });
  // }

  languagePreferred: number = 0;
  englishEnable: boolean = false;
  // hindiEnable: boolean = false;
  languagePreferredEnglish: boolean = false;
  languagePreferredHindi: boolean = false;
  updateLanguagePreferredForNotificationMethodCall(): void {

    // Call the API to update language preference
    this._data
      .updateLanguagePreferredForNotification(this.languagePreferred)
      .subscribe({
        next: (response: any) => {
          this.helper.showToast(
            'Language Updated Successfully',
            Key.TOAST_STATUS_SUCCESS
          );
        },
      });
  }

  onLanguageToggleChange(type: string) {
    if (type === 'english') {
      if (this.languagePreferredEnglish) {
        this.languagePreferredHindi = false;
        this.languagePreferred = 1;
      } else {
        this.languagePreferredHindi = true;
        this.languagePreferred = 2;
      }
    } else if (type === 'hindi') {
      if (this.languagePreferredHindi) {
        this.languagePreferredEnglish = false;
        this.languagePreferred = 2;
      } else {
        this.languagePreferredEnglish = true;
        this.languagePreferred = 1;
      }
    }
    this.updateLanguagePreferredForNotificationMethodCall();
  }


  updateNotificationSetting() {
    debugger
    this.toggleOption1Flag = true;
    this.updateAttendanceNotificationSettingForManagerMethodCall();
  }
  toggleOption1Flag: boolean = false;
  toggleOption2Flag: boolean = false;

  employeeAttendanceFlag: boolean = false;

  updateAttendanceNotificationSettingForManagerMethodCall(): void {
    debugger;
    let type = 0;
  
    if (this.employeeAttendanceFlag) {
      if (this.toggleOption1Flag) {
        type = 1; // Set type to 1 if the first toggle is selected
      } else if (this.toggleOption2Flag) {
        type = 2; // Set type to 2 if the second toggle is selected
      }
    }
  
    this._data
      .updateAttendanceNotificationSettingForManager(this.employeeAttendanceFlag, type)
      .subscribe({
        next: (response: any) => {
          this.helper.showToast(
            'Employee Attendance Notification Setting Updated Successfully.',
            Key.TOAST_STATUS_SUCCESS
            
          )
          if(!this.employeeAttendanceFlag){
            this.toggleOption1Flag = false;
            this.toggleOption2Flag = false;
          }
        },
        error: (error: any) => {
          // Handle any errors that occur during the API call
          this.employeeAttendanceFlag = false;
          this.helper.showToast(
            'An error occurred while updating the notification setting.',
            Key.TOAST_STATUS_ERROR
          );
        },
      });
  }
  
  toggleOption1Change(): void {
    if (this.toggleOption1Flag) {
      this.toggleOption2Flag = false;
    } else {
      this.toggleOption2Flag = true;
    }
    this.updateAttendanceNotificationSettingForManagerMethodCall();
  }
  
  toggleOption2Change(): void {
    if (this.toggleOption2Flag) {
      this.toggleOption1Flag = false;
    } else {
      this.toggleOption1Flag = true;
    }
    this.updateAttendanceNotificationSettingForManagerMethodCall();
  }
  


  //  new code

  toggle: boolean = false;
  otp: number = 0;
  otpConfig = {
    length: 6,
    allowNumbersOnly: true,
    inputStyles: {
      width: '50px',
      height: '50px',
    },
  };

  verifyOtpMethodCall(): void {
    this.toggle = true;
    this._data
      .verifyOtpForUpdatingPhoneNumber(this.phoneNumber, this.otp)
      .subscribe({
        next: (response: any) => {
          this.processResponse(response);
        },
        error: (error) => {
          this.handleError(error);
        },
      });
  }

  onOtpChange(otp: string): void {
    this.otp = +otp;
  }

  private processResponse(response: any): void {
    if (response == true) {
      this.toggle = false;
      this.helper.showToast(
        'OTP verified successfully',
        Key.TOAST_STATUS_SUCCESS
      );
      this.otpModalButton.nativeElement.click();
      this.notifications.whatsapp = true;
      this.notifications.slack = false;
      // console.log('OTP sent successfully', response);
    } else {
      this.helper.showToast(
        'Invalid number or WhatsApp account not found',
        Key.TOAST_STATUS_ERROR
      );
    }
  }

  private handleError(error: any): void {
    this.helper.showToast('Invalid OTP', Key.TOAST_STATUS_ERROR);
    console.error('Error sending OTP', error);
  }

  onboardingVia: string = '';
  getOnboardingVia() {
    debugger;
    this._data.getOrganizationDetails().subscribe(
      (data) => {
        this.onboardingVia = data.organization.onboardingVia;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  teamId: string = '';
  isInstalled: boolean = true;
  disableLoader: boolean = false;
  removeHajiriFromSlack(): void {
    this.disableLoader = true;
    this._data.disconnectOrganization().subscribe(
      (response) => {
        console.log('deactived successfully');
        this.isInstalled = response.message;
        this.disableLoader = false;
        this.closeDeleteModal();
        this.helper.showToast(
          'Removed Successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.disableLoader = false;
        console.log('error ');
      }
    );
  }

  getOrganizationIsInstalledFlag(): void {
    this._data.getOrgIsInstalledFlag().subscribe(
      (response) => {
        this.isInstalled = response.object;
      },
      (error) => {
        console.log('error ');
      }
    );
  }

  authUrl: string = '';

  getSlackAuthUrl(): void {
    debugger;
    this._data.getSlackAuthUrl().subscribe(
      (response: any) => {
        this.authUrl = response.message;
        // console.log('authUrl' + this.authUrl);
      },
      (error) => {
        console.error('Error fetching Slack auth URL', error);
      }
    );
  }

  reinstallHajiri(): void {
    this.router.navigate(['/auth/signup']);
    // if (this.authUrl) {
    //   window.location.href = this.authUrl;
    // } else {
    //   console.error('Auth URL is not set');
    // }
  }

  @ViewChild('closeUserDeleteModal') closeUserDeleteModal: any;

  closeDeleteModal() {
    this.closeUserDeleteModal.nativeElement.click();
  }
}
