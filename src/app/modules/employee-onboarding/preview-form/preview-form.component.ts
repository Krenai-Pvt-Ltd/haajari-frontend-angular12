import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeAdditionalDocument } from 'src/app/models/employee-additional-document';
import { OnboardingFormPreviewResponse } from 'src/app/models/onboarding-form-preview-response';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { UserExperience } from 'src/app/models/user-experience';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-preview-form',
  templateUrl: './preview-form.component.html',
  styleUrls: ['./preview-form.component.css']
})
export class PreviewFormComponent implements OnInit {

  constructor(public dataService: DataService,  private modalService: NgbModal,
    private router: Router, private helperService: HelperService) { }
  ngOnInit(): void {
    this.getOnboardingFormPreviewMethodCall();
  }
  @ViewChild("dismissPreviewModalButton") dismissPreviewModalButton!: ElementRef;
  @ViewChild("previewModalCallButton") previewModalCallButton!: ElementRef;
  onboardingPreviewData: OnboardingFormPreviewResponse = new OnboardingFormPreviewResponse();
  toggle = false;
  isLoading:boolean = true;
  employeeAdditionalDocument: EmployeeAdditionalDocument[] = [];
  isFresher: boolean = false;
  isSchoolDocument: boolean = true;
  isHighSchoolDocument: boolean = true
  userEmergencyContactArray: UserEmergencyContactDetailsRequest[]=[];
  userExperienceArray: UserExperience[]=[];
  secondarySchoolCertificateFileName: string = '';
  highSchoolCertificateFileName1: string = '';
  highestQualificationDegreeFileName1: string = '';
  testimonialReccomendationFileName1: string = '';
  aadhaarCardFileName: string = '';
  pancardFileName: string = '';
  companyLogoUrl: string = '';
  displaySuccessModal = false;
  allowEdit = false;

  routeToUserDetails(routePath: string) {
    this.dismissPreviewModalButton.nativeElement.click();
    setTimeout(x=>{
    let navExtra: NavigationExtras = {
        queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate([routePath], navExtra);
  },2000)
  }
  isLoadingPreview = false;
  getOnboardingFormPreviewMethodCall() {
    debugger
    this.isLoadingPreview = true;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    if (userUuid) {
      this.dataService.getOnboardingFormPreview(userUuid).subscribe(
        (preview) => {
          this.isLoadingPreview = false;
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

  getFilenameFromUrl(url: string): string {
    if (!url) return '';

    const decodedUrl = decodeURIComponent(url);

    const parts = decodedUrl.split('/');

    const filenameWithQuery = parts.pop() || '';

    const filename = filenameWithQuery.split('?')[0];

    const cleanFilename = filename.replace(/^\d+_/,'');
    return cleanFilename;
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
          if(response.employeeOnboardingStatus == 'PENDING' ){
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

      closeModal(){
        this.modalService.dismissAll();
      }
}
