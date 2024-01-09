import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { OnboardingFormPreviewResponse } from 'src/app/models/onboarding-form-preview-response';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { UserExperience } from 'src/app/models/user-experience';
import { UserExperienceDetailRequest } from 'src/app/models/user-experience-detail-request';
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
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-onboarding-form'], navExtra);
  }

  secondarySchoolCertificateFileName: string = '';
  highSchoolCertificateFileName1: string = '';
  highestQualificationDegreeFileName1: string = '';
  testimonialReccomendationFileName1: string = '';

  isLoading: boolean = true;
  isFresher: boolean = false;

  onboardingPreviewData: OnboardingFormPreviewResponse = new OnboardingFormPreviewResponse();
  userEmergencyContactArray: UserEmergencyContactDetailsRequest[]=[];
  userExperienceArray: UserExperience[]=[];

  getOnboardingFormPreviewMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    if (userUuid) {
      this.dataService.getOnboardingFormPreview(userUuid).subscribe(
        (preview) => {
          this.onboardingPreviewData = preview;
          this.isLoading = false;
          this.handleOnboardingStatus(preview.user.employeeOnboardingStatus.response);
          if(preview.userExperience){
            this.userExperienceArray = preview.userExperience;
          }
          if(preview.userExperience[0].user.fresher==true){
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
}
