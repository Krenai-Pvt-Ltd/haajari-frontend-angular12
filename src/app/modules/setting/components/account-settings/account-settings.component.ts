import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute, Params } from '@angular/router';

import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit, AfterViewInit {

  userPersonalInformationRequest: UserPersonalInformationRequest = new UserPersonalInformationRequest();

  accountDetailsTab: string | null = null;
  securityTab: any;
  profilePreferencesTab: any;
  referralProgramTab: any;

  constructor(private _routeParam: ActivatedRoute,
    public _data: DataService,
    private cdr: ChangeDetectorRef, private afStorage: AngularFireStorage) {
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


  userEmail: String = '';
  getUserAccountDetailsMethodCall() {
    debugger
    this._data.getUserAccountDetails().subscribe({
      next: (response: UserPersonalInformationRequest) => {
        this.userEmail = response.email; // Handle the response, e.g., store it for display
        this.userPersonalInformationRequest.image =  response.image;
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




}
