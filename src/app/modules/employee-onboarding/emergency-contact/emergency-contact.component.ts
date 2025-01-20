import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { EmployeeAdditionalDocument } from 'src/app/models/employee-additional-document';
import { OnboardingFormPreviewResponse } from 'src/app/models/onboarding-form-preview-response';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { UserExperience } from 'src/app/models/user-experience';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
declare var bootstrap: any;
@Component({
  selector: 'app-emergency-contact',
  templateUrl: './emergency-contact.component.html',
  styleUrls: ['./emergency-contact.component.css']
})
export class EmergencyContactComponent implements OnInit {
  userEmergencyContactDetails: UserEmergencyContactDetailsRequest[] = [];

  constructor(public dataService: DataService, private router: Router, private cd: ChangeDetectorRef, private helperService:HelperService) { }

  ngOnInit(): void {
    //this.getOnboardingFormPreviewMethodCall();
    this.getEmployeeEmergencyContactsDetailsMethodCall();
  }
@ViewChild("dismissSuccessModalButton") dismissSuccessModalButton!:ElementRef;
@ViewChild("dismissPreviewModalButton") dismissPreviewModalButton!: ElementRef;
  routeToFormPreview() {
debugger
    this.dismissPreviewModalButton.nativeElement.click();
    // this.dismissSuccessModalButton.nativeElement.click();
    setTimeout(x=>{
      let navExtra: NavigationExtras = {
        queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
      };
      this.router.navigate(['/employee-onboarding/employee-onboarding-preview'], navExtra);
    },2000);



  }

  backRedirectUrl() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');

    // Initialize an empty object for queryParams
    let queryParams: any = {};

    // Add userUuid to queryParams if it exists
    if (userUuid) {
      queryParams['userUuid'] = userUuid;
    }

    // Conditionally add adminUuid to queryParams if updateRequest is true
    if (this.isAdminPresent) {
      const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
      if (adminUuid) {
        queryParams['adminUuid'] = adminUuid;
      }
    }

    // Create NavigationExtras object with the queryParams
    let navExtra: NavigationExtras = { queryParams };
    if(this.dataService.isRoutePresent('/bank-details')){
      this.router.navigate(
        ['/employee-onboarding/bank-details'],
        navExtra
      );
  } else if(this.dataService.isRoutePresent('/employee-experience')){
      this.router.navigate(
        ['/employee-onboarding/employee-experience'],
        navExtra
      );
  } else if(this.dataService.isRoutePresent('/acadmic')){
      this.router.navigate(
        ['/employee-onboarding/acadmic'],
        navExtra
      );
  } else if(this.dataService.isRoutePresent('/employee-document')){
      this.router.navigate(
        ['/employee-onboarding/employee-document'],
        navExtra
      );
  } else if(this.dataService.isRoutePresent('/employee-address-detail')){
        this.router.navigate(
          ['/employee-onboarding/employee-address-detail'],
          navExtra
        );
  }else {
    this.router.navigate(
      ['/employee-onboarding/employee-onboarding-form'],
      navExtra
    );
  }
  }

  deleteEmergencyContact(index: number) {
    this.userEmergencyContactDetails.splice(index, 1);
  }
  addEmergencyContact(): void {
    this.userEmergencyContactDetails.push(new UserEmergencyContactDetailsRequest());
  }
  displaySuccessModal = false;

  showSuccess() {
    debugger

    this.setEmployeeEmergencyContactDetailsMethodCall();
    this.displaySuccessModal = true;
    this.cd.detectChanges();
    // setTimeout(() => this.displaySuccessModal = false, 3000);

  }


  toggle = false;
  @ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;
  setEmployeeEmergencyContactDetailsMethodCall() {
    debugger

    this.allowEdit = false;
    this.toggle = true;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';

    if (!userUuid) {
      console.error('User UUID is not available in localStorage.');
      return;
    }

    this.dataService.setEmployeeEmergencyContactDetails(this.userEmergencyContactDetails, userUuid)
      .subscribe(
        (response: UserEmergencyContactDetailsRequest) => {
          console.log('Response:', response);

          this.dataService.markStepAsCompleted(response.statusId);
          if(this.buttonType=='update'){
            this.toggle = false;
            this.helperService.showToast("Information Updated Successfully", Key.TOAST_STATUS_SUCCESS);
          }
          if( this.buttonType !='update'){
          this.getOnboardingFormPreviewMethodCall();
          }
             response.employeeOnboardingStatus;
            // if(response.employeeOnboardingFormStatus == 'USER_REGISTRATION_SUCCESSFUL' ){
            //   this.employeeOnboardingFormStatus=response.employeeOnboardingStatus;
            //   if(this.employeeOnboardingFormStatus!='REJECTED'){
            //     this.successMessageModalButton.nativeElement.click();
            //   }
            // }
            // setTimeout(()=>{
            //   this.routeToFormPreview();
            // },500);



          // this.userEmergencyContactDetailsStatus = response.statusResponse;


            // localStorage.setItem('statusResponse', JSON.stringify(this.userEmergencyContactDetailsStatus));
          // this.router.navigate(['/next-route']); // Update the route as needed
        },
        (error) => {
          console.error('Error occurred:', error);
          this.toggle = false;
        }
      );
  }

delete(index:number){
  if(this.userEmergencyContactDetails.length==1){
 return
  }
  this.userEmergencyContactDetails.splice(index,1);
}
  isLoading:boolean = true;
  employeeOnboardingFormStatus:string|null=null;
  async getEmployeeEmergencyContactsDetailsMethodCall() {
    debugger
    return new Promise<boolean>(async (resolve, reject) => {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    if (userUuid) {
      this.dataService.getEmployeeContactsDetails(userUuid).subscribe(
       async (contacts) => {

          // console.log(contacts);
          this.dataService.markStepAsCompleted(contacts[0].statusId);
          this.isLoading = false;
          if (contacts[0].contactName && contacts.length > 0) {
          this.userEmergencyContactDetails = contacts;
          if(adminUuid){
            await this.getAdminVerifiedForOnboardingUpdateMethodCall();
          }

            this.employeeOnboardingFormStatus=this.userEmergencyContactDetails[0].employeeOnboardingStatus;
            if(contacts[0].employeeOnboardingFormStatus=='USER_REGISTRATION_SUCCESSFUL' && this.employeeOnboardingFormStatus != 'REJECTED' && !this.isAdminPresent){
              this.successMessageModalButton.nativeElement.click();
          }

          this.handleOnboardingStatus(contacts[0].employeeOnboardingStatus);

        } else {
          this.addEmergencyContact();
        }
          },
        (error: any) => {
          console.error('Error fetching user details:', error);
        }
      );
    } else {
      console.error('uuidNewUser not found in localStorage');
    }
  })
  }

  // displayModal = false;
  allowEdit = false;

  handleOnboardingStatus(response: string) {
    this.displaySuccessModal = true;
    switch (response) {

      case 'REJECTED':
        this.allowEdit = true;
        break;
      case 'APPROVED' :
      case 'PENDING':
        this.allowEdit = false;
        break;
      default:
        this.displaySuccessModal = false;
        break;
    }
  }

  closeAndEdit() {
    this.displaySuccessModal = false;
    // Logic to enable form editing
  }

  closeModal() {
    this.displaySuccessModal = false;
    // Additional logic if needed when modal is closed without editing
  }

  @ViewChild("confirmationModalButton") confirmationModalButton!:ElementRef;

  @ViewChild("previewModalCallButton") previewModalCallButton!: ElementRef;
  openModal() {
    debugger
    this.checkFormValidation();

  if(this.isFormInvalid==true){
    return
  } else{
    if(this.buttonType == 'update'){
      this.userEmergencyContactDetails[0].directSave=false;
      this.userEmergencyContactDetails[0].updateRequest = true;
      this.setEmployeeEmergencyContactDetailsMethodCall();
    } else {
      this.setEmployeeEmergencyContactDetailsMethodCall();
    }


    // this.confirmationModalButton.nativeElement.click();
  }
  }

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    if (event.key === ' ' && input.selectionStart === 0 && !input.value.trim()) {

        event.preventDefault();
    }
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
    }
}




  isFormInvalid: boolean = false;
@ViewChild ('emergencyInformationForm') emergencyInformationForm !: NgForm
checkFormValidation(){
if(this.emergencyInformationForm.invalid){
this.isFormInvalid = true;
return
} else {
  this.isFormInvalid = false;
}
}

secondarySchoolCertificateFileName: string = '';
highSchoolCertificateFileName1: string = '';
highestQualificationDegreeFileName1: string = '';
testimonialReccomendationFileName1: string = '';
aadhaarCardFileName: string = '';
pancardFileName: string = '';
companyLogoUrl: string = '';


isFresher: boolean = false;
isSchoolDocument: boolean = true;
isHighSchoolDocument: boolean = true
onboardingPreviewData: OnboardingFormPreviewResponse = new OnboardingFormPreviewResponse();
userEmergencyContactArray: UserEmergencyContactDetailsRequest[]=[];
userExperienceArray: UserExperience[]=[];
employeeAdditionalDocument: EmployeeAdditionalDocument[] = [];

getOnboardingFormPreviewMethodCall() {
  debugger
  const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
  if (userUuid) {
    this.dataService.getOnboardingFormPreview(userUuid).subscribe(
      (preview) => {
        // console.log(preview);
        this.toggle = false;
        this.onboardingPreviewData = preview;

        this.isLoading = false;
        this.handleOnboardingStatus(preview.user.employeeOnboardingStatus.response);

        // if (preview.employeeAdditionalDocument && preview.employeeAdditionalDocument.length > 0) {
          this.employeeAdditionalDocument = preview.employeeAdditionalDocuments;
          // console.log(this.employeeAdditionalDocument);
      // } else {
      //   console.log("eroor ")
      //     // Handle the case where employeeAdditionalDocument is undefined, null, or empty
      //     this.employeeAdditionalDocument = [];
      // }

        if(preview.userDocuments!=null && preview.userDocuments.secondarySchoolCertificate){
          this.isSchoolDocument = false;
        }
        if(preview.userDocuments!=null && preview.userDocuments.highSchoolCertificate){
          this.isHighSchoolDocument = false;
        }
        if(preview.userExperience){
          this.userExperienceArray = preview.userExperience;
        }
        if(preview.fresher==true){

          this.isFresher=true;
        }
        if (preview.userEmergencyContacts) {
          this.userEmergencyContactArray = preview.userEmergencyContacts;
        } else {

          // console.log('No guarantor information available.');
          this.userEmergencyContactArray = [];
        }
        if(preview.userDocuments!=null){

        this.secondarySchoolCertificateFileName = this.getFilenameFromUrl(preview.userDocuments.secondarySchoolCertificate);
        this.highSchoolCertificateFileName1 = this.getFilenameFromUrl(preview.userDocuments.highSchoolCertificate);
        this.highestQualificationDegreeFileName1 = this.getFilenameFromUrl(preview.userDocuments.highestQualificationDegree);
        this.testimonialReccomendationFileName1 = this.getFilenameFromUrl(preview.userDocuments.testimonialReccomendation);
       this.aadhaarCardFileName = this.getFilenameFromUrl(preview.userDocuments.aadhaarCard);
       this.pancardFileName = this.getFilenameFromUrl(preview.userDocuments.pancard);

        }
        this.isLoading = false;
        this.previewModalCallButton.nativeElement.click();
      },
      (error: any) => {
        console.error('Error fetching user details:', error);
        this.userEmergencyContactArray = [];
      }
    );
  } else {
    console.error('User UUID not found');
    this.userEmergencyContactArray = [];
  }
}

getFilenameFromUrl(url: string): string {
  if (!url) return '';

  const decodedUrl = decodeURIComponent(url);

  const parts = decodedUrl.split('/');

  const filenameWithQuery = parts.pop() || '';

  const filename = filenameWithQuery.split('?')[0];

  const cleanFilename = filename.replace(/^\d+_/,'');
  return cleanFilename;
}

routeToUserDetails(routePath: string) {
  this.dismissPreviewModalButton.nativeElement.click();
  setTimeout(x=>{
  let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
  };
  this.router.navigate([routePath], navExtra);
},2000)
}

saveUserOnboardingFormStatusMethodCall(){
  debugger
  this.toggle = true;
  const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
  this.dataService.saveUserOnboardingFormStatus(userUuid)
  .subscribe(
    (response: UserEmergencyContactDetailsRequest) => {
      // console.log('Response:', response);
    this.toggle= false;
        if( response.employeeOnboardingStatus == 'PENDING' ){
          this.handleOnboardingStatus(response.employeeOnboardingStatus);
          this.routeToFormPreview();
        }
        this.toggle = false;
    },
    (error) => {
      console.error('Error occurred:', error);

    }
  );
}

isAdminPresent: boolean = false;
getAdminVerifiedForOnboardingUpdateMethodCall(): Promise<boolean> {
  debugger;
  return new Promise<boolean>((resolve, reject) => {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    if (userUuid && adminUuid) {
      this.dataService.getAdminVerifiedForOnboardingUpdate(userUuid, adminUuid).subscribe(
        (data: boolean) => {

          this.isAdminPresent = data;
          console.log('Admin verification successful.');
          resolve(data); // Resolve the promise with the result
        },
        (error: any) => {
          console.error('Error fetching admin verification status:', error);
          // reject(error); // Reject the promise on error
        }
      );
    } else {
      console.error('User UUID or Admin UUID not found in the URL.');
      // reject(new Error('User UUID or Admin UUID not found in the URL.')); // Reject the promise if parameters are missing
    }
  });
}

buttonType:string="next"
selectButtonType(type:string){
  debugger
  this.buttonType=type;
  this.userEmergencyContactDetails[0].directSave = false;
  // this.formSubmitButton.nativeElement.click();
}


goBackToProfile() {
  let navExtra: NavigationExtras = {
    queryParams: { userId: new URLSearchParams(window.location.search).get('userUuid') },
  };
  // this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], navExtra);
  const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
    return;
}



}
