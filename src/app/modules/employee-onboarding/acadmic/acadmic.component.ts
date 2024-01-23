import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { UserAcademicsDetailRequest } from 'src/app/models/user-academics-detail-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-acadmic',
  templateUrl: './acadmic.component.html',
  styleUrls: ['./acadmic.component.css']
})
export class AcadmicComponent implements OnInit {
  userAcademicsDetailRequest: UserAcademicsDetailRequest = new UserAcademicsDetailRequest();

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.getUserAcademicDetailsMethodCall();
  }
  backRedirectUrl(){
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-onboarding/employee-document'], navExtra);
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-onboarding/employee-experience'], navExtra);
  }

  userAcademicDetailsStatus = "";
  toggle = false;
  toggleSave = false;
  setEmployeeAcademicsMethodCall() {
    debugger
    if(this.buttonType=='next'){
      this.toggle = true;
    } else if (this.buttonType=='save'){
      this.toggleSave = true;
    }
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    
    this.dataService.setEmployeeAcademics(this.userAcademicsDetailRequest, userUuid)
      .subscribe(
        (response: UserAcademicsDetailRequest) => {
          console.log(response);  
          this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
          this.dataService.markStepAsCompleted(response.statusId);
          this.toggle = false
          if(this.buttonType=='next'){
            this.routeToUserDetails();
          } else if (this.buttonType=='save'){
            this.handleOnboardingStatus(response.employeeOnboardingStatus);
            if(this.employeeOnboardingFormStatus!='REJECTED'){
              this.successMessageModalButton.nativeElement.click();
            }
          setTimeout(() => {
            
            this.routeToFormPreview();  
          }, 2000);
          }
          this.userAcademicDetailsStatus = response.statusResponse;
          // localStorage.setItem('statusResponse', JSON.stringify(this.userAcademicDetailsStatus));
          // this.router.navigate(['/employee-experience']);
        },
        (error) => {
          console.error(error);
          this.toggle = false
        }
      );
  }
  isNewUser: boolean = true;
  isLoading:boolean = true;
  employeeOnboardingFormStatus:string|null=null;
  @ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;
  getUserAcademicDetailsMethodCall() {
    debugger
   
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    if (userUuid) {
      this.dataService.getUserAcademicDetails(userUuid).subscribe((response: UserAcademicsDetailRequest) => {
        this.dataService.markStepAsCompleted(response.statusId);
        this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
        if(response != null){
          this.userAcademicsDetailRequest = response;
          
          if(response.employeeOnboardingFormStatus=='USER_REGISTRATION_SUCCESSFUL' && this.employeeOnboardingFormStatus != 'REJECTED'){
            this.successMessageModalButton.nativeElement.click();
          }
          if(response.employeeOnboardingStatus == "PENDING"){
            this.isNewUser = false;
          }
          this.handleOnboardingStatus(response.employeeOnboardingStatus);
          
          this.isLoading = false; 
        }
        this.isLoading = false; 
        },(error: any) => {
          console.error('Error fetching user details:', error);
        }
      );
    } else {
      console.error('uuidNewUser not found in localStorage');
      
    }
  } 

  @ViewChild("formSubmitButton") formSubmitButton!:ElementRef;

buttonType:string="next"
selectButtonType(type:string){
  this.buttonType=type;
  this.userAcademicsDetailRequest.directSave = false;
  this.formSubmitButton.nativeElement.click();
}

directSave: boolean = false;

submit(){
switch(this.buttonType){
  case "next" :{
    this.setEmployeeAcademicsMethodCall();
    break;
  }
  case "save" :{
    debugger
    this.userAcademicsDetailRequest.directSave = true;
    this.setEmployeeAcademicsMethodCall();
    break;
  }
}
}
@ViewChild("dismissSuccessModalButton") dismissSuccessModalButton!:ElementRef;
routeToFormPreview() {
  this.dismissSuccessModalButton.nativeElement.click();
  setTimeout(x=>{
  let navExtra: NavigationExtras = {
    
    queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
  };
  this.router.navigate(['/employee-onboarding/employee-onboarding-preview'], navExtra);
},2000)
}

displayModal = false;
  allowEdit = false;

  handleOnboardingStatus(response: string) {
    this.displayModal = true;
    switch (response) {
      
      case 'REJECTED':
        this.allowEdit = true;
        break;
        case 'APPROVED':
      case 'PENDING':
        this.allowEdit = false;
        break;
      default:
        this.displayModal = false;
        break;
    }
  }

  selectQualification(qualification: string): void {
    this.userAcademicsDetailRequest.highestEducationalLevel = qualification;
  }
    // Default value set
  qualifications = [
    'None',
    'Elementary School',
    'Middle School',
    'High School Diploma',
    'Vocational Qualification',
    'Associate\'s Degree',
    'Bachelor\'s Degree',
    'Graduate Certificate',
    'Postgraduate Diploma',
    'Master\'s Degree',
    'Professional Degree (e.g., MD, JD, DDS)',
    'Doctor of Philosophy (PhD)',
    'Post-Doctoral Fellowship',
    'Professorship/Academic Title',
    'Honorary Degree',
    'Other (Specify)'
  ];

  // selectCourses(course: string): void {
  //   this.userAcademicsDetailRequest.degreeObtained = course;
  // }
  
  // courses = [
  //   'None',
  //   'Elementary School',
  //   'Middle School',
  //   'High School Diploma',
  //   'Vocational Qualification',
  //   'Associate\'s Degree',
  //   'Bachelor\'s Degree',
  //   'Graduate Certificate',
  //   'Postgraduate Diploma',
  //   'Master\'s Degree',
  //   'Professional Degree (e.g., MD, JD, DDS)',
  //   'Doctor of Philosophy (PhD)',
  //   'Post-Doctoral Fellowship',
  //   'Professorship/Academic Title',
  //   'Honorary Degree',
  //   'Other (Specify)'
  // ];
}
