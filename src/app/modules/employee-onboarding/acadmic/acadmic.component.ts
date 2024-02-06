import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
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
          this.userAcademicsDetailRequest.highestEducationalLevel = response.highestEducationalLevel;
        this.selectedQualification = response.highestEducationalLevel;
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
  this.checkFormValidation();

  if(this.isFormInvalid==true){
    return
  } else{
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
}

isFormInvalid: boolean = false;
@ViewChild ('academicInformationForm') academicInformationForm !: NgForm
checkFormValidation(){
if(this.academicInformationForm.invalid){
this.isFormInvalid = true;
return
} else {
  this.isFormInvalid = false;
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
  selectedQualification: string = '';
  selectQualification(qualification: string): void {
    this.selectedQualification = qualification;
    // If "Other" is not selected, directly bind the selected qualification
    if (qualification !== 'Other') {
      this.userAcademicsDetailRequest.highestEducationalLevel = qualification;
    } else {
      // Reset the value when "Other" is selected to ensure the input field is empty for user input
      this.userAcademicsDetailRequest.highestEducationalLevel = '';
    }
  }
  selectDegreeObtained(degree: string): void {
    debugger
    this.userAcademicsDetailRequest.degreeObtained = degree;
}
    // Default value set
  qualifications = [
    
  
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
    'Other'
  ];

  degreeOptions: { [qualification: string]: string[] } = {
    'Elementary School': [
      'Certificate of Elementary Education', 'Elementary School Completion Certificate', 'Basic Education Certificate', 'Primary School Achievement Certificate'],
    'Middle School': ['Middle School Completion Certificate', 'Lower Secondary Education Certificate', 'Junior High School Diploma', 'Secondary School Certificate'],
    'Associate\'s Degree': ['A.A.', 'A.S.', 'A.A.S.', 'A.E.T.', 'A.P.S.'],
    'Bachelor\'s Degree': ['B.Tech', 'B.Sc', 'B.Com', 'B.A', 'BBA', 'B.F.A.', 'B.Ed.', 'B.E.', 'LL.B.', 'B.Arch.', 'B.Pharm.', 'B.S.N.'],
    'Graduate Certificate': ['Grad Cert in Business', 'Grad Cert in Education', 'Grad Cert in Engineering', 'Grad Cert in Information Technology', 'Grad Cert in Public Health'],
    'Postgraduate Diploma': ['PGD in Management', 'PGD in Education', 'PGD in Computer Science', 'PGD in Public Health', 'PGD in Clinical Psychology'],
    'Master\'s Degree': ['M.Tech', 'M.Sc', 'M.Com', 'M.A', 'MBA', 'M.Ed.', 'M.F.A.', 'LL.M.', 'M.S.W.', 'M.P.H.', 'M.S.N.', 'M.P.A.', 'M.I.S.', 'M.F.S.'],
    'Professional Degree (e.g., MD, JD, DDS)': ['MD', 'JD', 'DDS', 'DVM', 'Pharm.D', 'D.O.', 'DPT', 'D.Psy', 'D.P.A.', 'D.Th.'],
    'Doctor of Philosophy (PhD)': ['PhD in Physics', 'PhD in Chemistry', 'PhD in Biology', 'PhD in Engineering', 'PhD in Education', 'PhD in Psychology', 'PhD in Economics', 'PhD in Computer Science'],
    'Post-Doctoral Fellowship': ['Postdoc in Neuroscience', 'Postdoc in Biotechnology', 'Postdoc in Environmental Science', 'Postdoc in Economics', 'Postdoc in Astrophysics'],
    'Professorship/Academic Title': ['Assistant Professor', 'Associate Professor', 'Professor', 'Lecturer', 'Senior Lecturer', 'Reader', 'Emeritus Professor'],
    'Vocational Qualification': ['Certificate in Plumbing', 'Certificate in Electrical', 'Certificate in Carpentry', 'Certified Nurse Assistant (CNA)', 'Certificate in Automotive Repair', 'Certificate in Culinary Arts', 'Certificate in Welding', 'Certificate in HVAC'],
    'High School Diploma': ['General Diploma', 'Vocational Diploma', 'Advanced Diploma', 'International Baccalaureate'],
  'Honorary Degree': [
      'Honorary Doctorate of Letters (D.Litt.)',
      'Honorary Doctorate of Laws (LL.D.)',
      'Honorary Doctorate of Science (D.Sc.)',
      'Honorary Doctorate of Arts (D.A.)',
      'Honorary Doctorate of Business Administration (DBA)',
      'Honorary Doctorate of Education (Ed.D.)',
      'Honorary Doctorate of Music (D.Mus.)',
      'Honorary Doctorate of Philosophy (Ph.D.)',
      'Honorary Doctorate of Humane Letters (L.H.D.)',
      'Honorary Doctorate of Divinity (D.D.)'
  ],
    // Additional mappings can be added as per specific requirements
};

  disabledFutureDates = (current: Date): boolean => {
    const today = new Date();
    return current.getFullYear() > today.getFullYear();
  };

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.selectionStart === 0) {
        event.preventDefault();
    }

    // Prevent numeric input (0-9)
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
  }
}


  // degreeDropdownTouched = false;

  // handleDegreeDropdownInteraction() {
  //   if (!this.selectedQualification) {
  //     this.degreeDropdownTouched = true; // Indicate that the dropdown has been interacted with
  //   }
  // }
  
  selectType(type: string): void {
    debugger
    this.userAcademicsDetailRequest.gradeType = type;
    // Reset the grade value when the type changes
    this.userAcademicsDetailRequest.grade = '';
  }
  
  selectGrade(grade: string): void {
    this.userAcademicsDetailRequest.grade = grade;
  }
  
  // You may also need to define formatter and parser functions for percentage values

  
  // Array of grades for the dropdown
  grades: string[] = [
    'O (Outstanding)', 'A+ (Excellent)', 'A (Very Good)',
    'B+ (Good)', 'B (Above Average)', 'C (Average)',
    'D (Pass)', 'F (Fail)'
  ];
  
  temporaryValue: number = 0;



  formatterPercent = (value: number): string => `${value} %`;
  parserPercent = (value: string): string => value.replace(' %', '');


}
