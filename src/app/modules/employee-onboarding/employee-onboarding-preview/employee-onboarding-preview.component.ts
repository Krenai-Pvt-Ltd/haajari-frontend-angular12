import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { EmployeeAdditionalDocument } from 'src/app/models/employee-additional-document';
import { OnboardingFormPreviewResponse } from 'src/app/models/onboarding-form-preview-response';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { UserExperience } from 'src/app/models/user-experience';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-onboarding-preview',
  templateUrl: './employee-onboarding-preview.component.html',
  styleUrls: ['./employee-onboarding-preview.component.css']
})
export class EmployeeOnboardingPreviewComponent implements OnInit {

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit(): void {
    this.getOnboardingFormPreviewMethodCall();
    this.userUuid = new URLSearchParams(window.location.search).get('userUuid') || null;
    this.loadRoutes();
  }

  routeToUserDetails(routePath: string) {
    let navExtra: NavigationExtras = {
        queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate([routePath], navExtra);
}

  private userUuid: string | null = null;
  secondarySchoolCertificateFileName: string = '';
  highSchoolCertificateFileName1: string = '';
  highestQualificationDegreeFileName1: string = '';
  testimonialReccomendationFileName1: string = '';
  aadhaarCardFileName: string = '';
  pancardFileName: string = '';
  companyLogoUrl: string = '';

  isLoading: boolean = true;
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
          this.onboardingPreviewData = preview;
          if(preview.companyLogo){
            this.companyLogoUrl = preview.companyLogo;
          }
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

            console.log('No guarantor information available.');
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

  allowEdit = false;

  handleOnboardingStatus(response: string) {
    // this.displaySuccessModal = true;
    switch (response) {

      case 'REJECTED':
        this.allowEdit = true;
        break;
      case 'APPROVED' :
      case 'PENDING':
        this.allowEdit = false;
        break;
      default:
        // this.displaySuccessModal = false;
        break;
    }
  }
  isRoutePresent(routeToCheck: string): boolean {
    const isPresent = this.dataService.onboardingRoutes.includes(routeToCheck);
    console.log(`Is route present: ${isPresent}`);
    return isPresent;
  }
  private loadRoutes(): void {
    this.dataService.getRoutesByOrganization(this.userUuid).subscribe(
      (routes: string[]) => {
        this.dataService.onboardingRoutes=routes;
      },
      error => {
        console.error('Error fetching routes', error);
      }
    );
  }

  navigateToDashboard() {
    window.location.href = '/dashboard';
  }
}
