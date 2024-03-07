import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute, Params } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { NotificationVia } from 'src/app/models/notification-via';

import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit, AfterViewInit {

  userPersonalInformationRequest: UserPersonalInformationRequest = new UserPersonalInformationRequest();
  notificationVia: NotificationVia = new NotificationVia();
  accountDetailsTab: string | null = null;
  securityTab: any;
  profilePreferencesTab: any;
  referralProgramTab: any;

  constructor(private _routeParam: ActivatedRoute,
    public _data: DataService,
    private cdr: ChangeDetectorRef, private afStorage: AngularFireStorage, private helper : HelperService) {
    debugger
    if (this._routeParam.snapshot.queryParamMap.has('setting')) {
      this.accountDetailsTab = this._routeParam.snapshot.queryParamMap.get('setting');
    }
  }

  ngAfterViewChecked(){
    if (this._routeParam.snapshot.queryParamMap.has('setting')) {
      this.accountDetailsTab = this._routeParam.snapshot.queryParamMap.get('setting');
    }
    this.cdr.detectChanges();
 }


  ngOnInit(): void {
    this.getUserAccountDetailsMethodCall();
   
  }


  @ViewChild('account') account!: ElementRef;
  @ViewChild('refer') refer!: ElementRef;
  @ViewChild('profilePreferencesSetting') profilePreferencesSetting!: ElementRef;
  @ViewChild('settingSecure') settingSecure!: ElementRef;
  tabName: string = '';
  openTabOnClick() {
    debugger
    // if (this.accountDetailsTab == 'accountDetails') {
    //   this.account.nativeElement.click();
    // } else if (this.accountDetailsTab == 'security') {
    //   this.settingSecure.nativeElement.click();
    // } else if (this.accountDetailsTab == 'profilePreferences') {
    //   this.profilePreferencesSetting.nativeElement.click();
    // } else if (this.accountDetailsTab == 'referralProgram') {
    //   this.refer.nativeElement.click();
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
@ViewChild('passwordUpdateModal') passwordUpdateModal !: ElementRef
  onSubmit(formValue: any) {
    debugger
    console.log(formValue);
    this._data.updateUserProfilePassword(formValue)
      .subscribe({
        next: (response) => {
          // Handle successful response here
          // Reset the error message if the update is successful
          if (response.message === "Current password is incorrect.") {
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
       
        }
      });
  }
  
  currentPassword: string ='';
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

  isPlan1: boolean =  false;  
  isPlanActive: boolean = false;
  isSubscriptionPlanActive: boolean = false;
  subscriptionPlanId: number = 0;
  userEmail: String = '';
isDisabled: boolean = false;
  getUserAccountDetailsMethodCall() {
    debugger
    this._data.getUserAccountDetails().subscribe({
      next: (response: UserPersonalInformationRequest) => {
        this.userEmail = response.email; // Handle the response, e.g., store it for display
        this.userPersonalInformationRequest.image =  response.image;
        this.isSubscriptionPlanActive = response.subscriptionPlan; // Handle the response, e.g., store it for display

        this.subscriptionPlanId =  response.subscriptionPlanId;
        if(response.phoneNumber){
          this.phoneNumber = response.phoneNumber;
        }
        if(response.notificationVia==2){
          this.notifications.slack=false
          this.notifications.whatsapp=true
        } else {
          this.notifications.slack=true
          this.notifications.whatsapp=false
        }
        if(response.notificationVia == null){
          this.isDisabled = true;
        }
       if (this.isSubscriptionPlanActive== true && this.subscriptionPlanId==2){
          this.isPlanActive=true;
        } else if (this.isSubscriptionPlanActive== true && this.subscriptionPlanId==3){
          this.isPlanActive=true;
        } else if (this.isSubscriptionPlanActive== true && this.subscriptionPlanId==1){
          this.isPlan1=true;
        }
      },
      error: (error) => {
        console.error("Error fetching user account details:", error); // Handle any errors
      }
    });
  }

  selectedFile: File | null = null;
  isFileSelected = false;
  imagePreviewUrl: any = null;
  onFileSelected(event: Event): void {
    debugger
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
        console.error('Invalid file type. Please select a jpg, jpeg, or png file.');
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
    console.log(this.isInvalidFileType);
    this.isInvalidFileType = true;
    return false;
  }

  uploadFile(file: File): void {
    debugger
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
  
    task.snapshotChanges().toPromise().then(() => {
      console.log("Upload completed");
      fileRef.getDownloadURL().toPromise().then(url => {
        console.log("File URL:", url);
        
        this.userPersonalInformationRequest.image = url;
        this._data.updateProfilePicture(this.userPersonalInformationRequest).subscribe((x)=>{
          console.log(x);
        });
      }).catch(error => {
        console.error("Failed to get download URL", error);
      });
    }).catch(error => {
      console.error("Error in upload snapshotChanges:", error);
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
      slack: true // Default to enabled if isPlanActive is true
    };
    toggleNotification(type: 'whatsapp' | 'slack') {
      if (type === 'whatsapp') {
        this.updateNotificationSettingMethodCall(type);
        // If WhatsApp is already true and clicked again, it will disable itself and enable Slack
        this.notifications.whatsapp = !this.notifications.whatsapp;
        this.notifications.slack = !this.notifications.whatsapp;
      } else {
        // If Slack is already true and clicked again, it will disable itself and enable WhatsApp
        this.notifications.slack = !this.notifications.slack;
        this.notifications.whatsapp = !this.notifications.slack;
        this.updateNotificationSettingMethodCall(type);
        
      }
    }


    @ViewChild('otpModalButton') otpModalButton!: ElementRef
    updateNotificationSettingMethodCall(type: 'whatsapp' | 'slack'): void {
      debugger
      if (type === 'whatsapp' && this.notifications.slack == true) {
        this.notificationVia.id = 2;
      } else if(type === 'slack' && this.notifications.slack == true) {
        this.notificationVia.id = 1;
      } else if (type === 'slack' && this.notifications.slack == false){
        this.notificationVia.id = 2;
      } else if (type === 'whatsapp' && this.notifications.whatsapp == false){
        this.notificationVia.id = 1;
      }
      this._data.updateNotificationSetting(this.notificationVia).subscribe({
        next: (response: UserPersonalInformationRequest) => {
          // Handle successful update
          if(response.phoneNumber && response.notificationVia == 2){
           
            this.helper.showToast("Notification Setting Updated Successfully", Key.TOAST_STATUS_SUCCESS);
            console.log('Notification settings updated successfully', response);
          } else if(response.phoneNumber== null && this.notifications.whatsapp == true){
            this.notifications.whatsapp = false;
            this.notifications.slack = true;
            this.phoneNumber='';
            this.otpModalButton.nativeElement.click();
            this.helper.showToast("You need to add your Whatsapp number for notification", Key.TOAST_STATUS_ERROR);
          } else {
            this.helper.showToast("Notification Setting Updated Successfully", Key.TOAST_STATUS_SUCCESS);

          }
          
        },
        error: (error) => {
          // Handle error
          console.error('Error updating notification settings', error);
     
        }
      });
    }


 
    
    otpSent: boolean = false;
    phoneNumber: string = '';
    sendOtptoSavePhoneNumberMethodCall(): void {
      debugger
      this.toggle=true;
      this._data.sendOtptoSavePhoneNumber(this.phoneNumber).subscribe({
        next: (response: any) => {
          // Handle the response here, e.g., showing a success message
          if(response==true){
            this.otpSent = true;
            this.toggle=false;
            this.otp=0;
            this.helper.showToast("OTP sent successfully", Key.TOAST_STATUS_SUCCESS);
            console.log('OTP sent successfully', response);
          } else {
            this.helper.showToast("Invalid number or Whatsapp Account not found", Key.TOAST_STATUS_ERROR);
          }
          
          // You might want to navigate the user or enable further UI elements here
        },
        error: (error) => {
          // Handle any errors here, e.g., showing an error message
          this.helper.showToast("Invalid number or Whatsapp Account not found", Key.TOAST_STATUS_ERROR);
          console.error('Error sending OTP', error);
        }
      });
    }
   
    toggle: boolean = false;
    otp: number = 0;
    verifyOtpMethodCall(): void {
      this.toggle=true;
      this._data.verifyOtpForUpdatingPhoneNumber(this.phoneNumber, this.otp).subscribe({
        next: (response: any) => {
          if(response==true){
            this.toggle= false
            this.helper.showToast("OTP verified successfully", Key.TOAST_STATUS_SUCCESS);
            this.otpModalButton.nativeElement.click();
            this.notifications.whatsapp= true;
            this.notifications.slack = false;
            console.log('OTP sent successfully', response);
          } else {
            this.helper.showToast("Invalid number or Whatsapp Account not found", Key.TOAST_STATUS_ERROR);
          }
        },
        error: (error) => {
          // Handle any errors here, e.g., showing an error message
          this.helper.showToast("Invalid OTP", Key.TOAST_STATUS_ERROR);
          console.error('Error sending OTP', error);
        }
    });
  }


}
