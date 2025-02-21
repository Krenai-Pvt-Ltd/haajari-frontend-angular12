import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { UserExperienceDetailRequest } from 'src/app/models/user-experience-detail-request';
import { DataService } from 'src/app/services/data.service';
import { UserExperience } from 'src/app/models/user-experience';
import { Form, NgForm } from '@angular/forms';
import { HelperService } from 'src/app/services/helper.service';
import { Key } from 'src/app/constant/key';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PreviewFormComponent } from '../preview-form/preview-form.component';

@Component({
  selector: 'app-employee-experience',
  templateUrl: './employee-experience.component.html',
  styleUrls: ['./employee-experience.component.css']
})
export class EmployeeExperienceComponent implements OnInit {
  userExperienceDetailRequest: UserExperienceDetailRequest = new UserExperienceDetailRequest();
  userExperiences: UserExperience[] = []; // Array to hold user experiences
  experiences: any;

  constructor(public dataService: DataService, private router: Router,
    private helperService: HelperService, private modalService: NgbModal) { }

  ngOnInit(): void {

    const userUuid = this.getUserUuid();
    if (userUuid) {
      this.getEmployeeExperiencesDetailsMethodCall(userUuid);
    } else {
      this.addExperience();
    }
  }

  getUserUuid(): string | null {
    return new URLSearchParams(window.location.search).get('userUuid') || localStorage.getItem('uuidNewUser');
  }

  backRedirectUrl() {
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
    if(this.dataService.isRoutePresent('/acadmic')){
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

  deleteExperience(index: number): void {
    if(this.userExperiences.length == 1){
      return
    }
    this.userExperiences.splice(index, 1);
  }

  // @ViewChild("experienceTab") experienceTab!: ElementRef;

  addExperience(): void {
    this.userExperiences.push(new UserExperience());
    // this.experienceTab.nativeElement.click();

  }

//   addMoreExperience() {
//     const newExperience: UserExperience = {
//       companyName: '',
//       // employementDuration: '',
//       lastJobDepartment: '',
//       lastSalary: '',
//       lastJobPosition: '',
//       jobResponisibilities: '',
//       fresher: false, // or true, depending on your logic
//       statusId: 0,
//       directSave: false,
//       employeeOnboardingFormStatus: '',
//       employeeOnboardingStatus: '',
//       startDate: undefined,
//       endDate: undefined
//     };
//     this.userExperiences.push(newExperience);
// }



  prepareUserExperienceDetailRequest(): UserExperience[] {
    return this.userExperiences;
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: this.getUserUuid() },
    };
    if(this.dataService.isRoutePresent('/bank-details')){
      this.router.navigate(
        ['/employee-onboarding/bank-details'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/emergency-contact')){
      this.router.navigate(
        ['/employee-onboarding/emergency-contact'],
        navExtra
      );
    }
  }



  toggle = false;
  toggleSave = false;
  setEmployeeExperienceDetailsMethodCall() {
    debugger
    const userUuid = this.getUserUuid();
    if (!userUuid) {
      console.error('User UUID is not available.');
      return;
    }
    if(this.buttonType=='next'){
      this.toggle = true;

    } else if (this.buttonType=='save'){
      this.toggleSave = true;

    } else if (this.buttonType=='update'){
      this.toggle = true;

    }

    this.dataService.setEmployeeExperienceDetails(this.userExperiences, userUuid)
      .subscribe(
        response => {
          // console.log('Response:', response);
          if(response!= null){
            this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
            this.handleOnboardingStatus(response.employeeOnboardingStatus);
          }

          this.dataService.markStepAsCompleted(response.statusId);

          if(this.buttonType=='next'){
            this.routeToUserDetails();
          } else if (this.buttonType=='save'){

            if(this.employeeOnboardingFormStatus!='REJECTED'){
              this.successMessageModalButton.nativeElement.click();
            }
          setTimeout(() => {

            this.routeToFormPreview();
          }, 2000);
          } else if (this.buttonType=='update'){
            this.helperService.showToast("Information Updated Successfully", Key.TOAST_STATUS_SUCCESS);

           }
          this.toggle = false;
        },
        error => {
          console.error('Error occurred:', error);
          this.toggle = false;
        }
      );
  }

  isNewUser: boolean = true;
  isLoading: boolean = true;
  isFresher:boolean=true;
  employeeOnboardingFormStatus:string|null=null;
  @ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;

  async getEmployeeExperiencesDetailsMethodCall(userUuid: string) {
    debugger
    return new Promise<boolean>(async (resolve, reject) => {
    this.isLoading = true;
    const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    this.dataService.getEmployeeExperiencesDetailsOnboarding(userUuid).subscribe(
      async experiences => {
        if(adminUuid){
          await this.getAdminVerifiedForOnboardingUpdateMethodCall();
        }
        this.employeeOnboardingFormStatus= experiences[0].employeeOnboardingStatus;
        if(experiences[0].employeeOnboardingStatus == "PENDING"){
          this.isNewUser = false;
        }

                if(experiences[0].employeeOnboardingFormStatus=='USER_REGISTRATION_SUCCESSFUL' && this.employeeOnboardingFormStatus != 'REJECTED' && !this.isAdminPresent){
                  this.successMessageModalButton.nativeElement.click();
                }
                this.handleOnboardingStatus(experiences[0].employeeOnboardingStatus);
        if (experiences[0].companyName!=null && experiences.length > 0 && experiences[0].fresher== false) {

          this.isLoading = false;
          this.isFresher=false;
          this.userExperiences = experiences;

          this.dataService.markStepAsCompleted(experiences[0].statusId);


        } else {
          this.isLoading = false;
        //  this.userExperienceDetailRequest.experiences[0].fresher = true;
        if(experiences[0].fresher==null){
          experiences[0].fresher=false;
          this.addExperience();
        } else {

          if(experiences[0].fresher==true){
            this.addExperience();
            this.userExperiences[0].fresher=true;
          } else{
            this.userExperiences = experiences;
          }
        }
          this.isFresher=true;

          // this.addExperience(); // Call addExperience if experiences is null or empty
          this.dataService.markStepAsCompleted(experiences[0].statusId);
        }
      },
      error => {
        this.isLoading = false;
        console.error('Error fetching user details:', error);
        this.addExperience();
      }
    );
    })
  }



   jobTitles: string[] = [
    'Accountant',
    'Accounting Manager',
    'Administrative Assistant',
    'AI Developer (Artificial Intelligence)',
    'Angular Developer',
    'AR/VR Developer (Augmented Reality / Virtual Reality)',
    'Assembly Line Worker',
    'Automation Test Engineer',
    'Back-End Developer',
    'Bioinformatics Developer',
    'Blockchain Developer',
    'Brand Manager',
    'Business Analyst',
    'Business Development Executive',
    'Business Development Manager',
    'Buyer',
    'Call Center Agent',
    'Cash Manager',
    'Chief Financial Officer (CFO)',
    'Civil Engineer',
    'Cloud Developer (AWS Developer, Azure Developer, etc.)',
    'Communications Director',
    'Communications Specialist',
    'Compliance Analyst',
    'Compliance Officer',
    'Content Writer',
    'Corporate Lawyer',
    'Corporate Social Responsibility Manager',
    'Corporate Trainer',
    'Creative Director',
    'Customer Service Manager',
    'Customer Service Representative',
    'Database Administrator',
    'Database Developer',
    'Data Warehouse Developer',
    'Desktop Application Developer',
    'DevOps Developer',
    'Digital Marketing Specialist',
    'Distribution Manager',
    'Electrical Engineer',
    'Embedded Systems Developer',
    'EHS Manager',
    'Engineering Manager',
    'Environmental Analyst',
    'Environmental Engineer',
    'Event Coordinator',
    'Executive Assistant',
    'Facilities Manager',
    'Finance Manager',
    'Financial Analyst',
    'Front-End Developer',
    'Full Stack Developer',
    'Game Developer',
    'General Counsel',
    'Go Developer',
    'Graphic Designer',
    'Green Program Manager',
    'Health and Safety Officer',
    'Help Desk Technician',
    'Helpdesk Technician',
    'HR Generalist',
    'HR Manager',
    'HTML/CSS Developer',
    'Human Resources',
    'Information Technology (IT)',
    'Investment Analyst',
    'Inventory Manager',
    'Inventory Specialist',
    'IT Manager',
    'Java Developer',
    'JavaScript Developer',
    'Junior Software Developer',
    'Lead Developer / Technical Lead',
    'Learning and Development Specialist',
    'Legal Assistant',
    'Logistics Coordinator',
    'Logistics Manager',
    'Machine Learning Developer',
    'Maintenance Manager',
    'Maintenance Technician',
    'Manufacturing Engineer',
    'Market Research Analyst',
    'Marketing Manager',
    'Mechanical Engineer',
    'Media Relations Coordinator',
    'Mobile App Developer (Android Developer, iOS Developer)',
    'Network Engineer',
    'Node.js Developer',
    'Office Manager',
    'Operations Analyst',
    'Operations Manager',
    'Paralegal',
    'Payroll Clerk',
    'Payroll Specialist',
    'PHP Developer',
    'Plant Manager',
    'Plumber',
    'Product Designer',
    'Product Developer',
    'Product Manager',
    'Production Manager',
    'Production Planner',
    'Program Manager',
    'Project Coordinator',
    'Project Manager',
    'Public Relations Officer',
    'Procurement Manager',
    'Process Improvement Specialist',
    'Product Development',
    'Product Owner (in a software development context)',
    'Project Management',
    'Public Relations',
    'Purchasing Agent',
    'Python Developer',
    'QA Developer',
    'Quality Assurance Manager',
    'Quality Control Inspector',
    'Quality Control Technician',
    'Quality Inspector',
    'React Developer',
    'Receptionist',
    'Recruiter',
    'Regulatory Affairs Manager',
    'Research and Development (R&D)',
    'Research and Development Engineer',
    'Research Scientist',
    'Risk Analyst',
    'Risk Manager',
    'Robotics Developer',
    'Ruby Developer',
    'R&D Engineer',
    'R&D Manager',
    'Sales Manager',
    'Sales Representative',
    'Scrum Master',
    'Scala Developer',
    'Security Developer',
    'Senior Software Developer',
    'SEO Specialist',
    'Software Architect',
    'Software Development Manager',
    'Software Engineer',
    'Software Test Developer',
    'Software Tester',
    'Software Development',
    'Software Test Developer',
    'Software Tester',
    'Sourcing Manager',
    'Supply Chain Analyst',
    'Supply Chain Manager',
    'Sustainability Coordinator',
    'Sustainability Manager',
    'Systems Administrator',
    'Systems Software Developer',
    'Tax Specialist',
    'Training and Development Officer',
    'Training Manager',
    'Transportation Coordinator',
    'Treasury Analyst',
    'Treasurer',
    'UI (User Interface) Developer',
    'UX (User Experience) Developer',
    'Vue.js Developer',
    'Web Designer',
    'Web Developer',
    'Workplace Safety Officer'
  ];

  selectPositionForExperience(title: string, index: number): void {
    debugger
    this.userExperiences[index].lastJobPosition = title;
  }



  departments: string[] = [
    'Accounting', 'Administration', 'Business Development', 'Communications', 'Compliance',
    'Customer Service', 'Design', 'Distribution', 'Engineering', 'Environmental, Health, and Safety (EHS)',
    'Finance', 'Human Resources', 'Information Technology (IT)', 'Legal', 'Logistics',
    'Maintenance', 'Manufacturing', 'Marketing', 'Operations', 'Procurement',
    'Product Development', 'Project Management', 'Public Relations', 'Quality Assurance', 'Research and Development (R&D)',
    'Sales', 'Supply Chain Management', 'Sustainability', 'Training and Development', 'Treasury', 'other'
];


selectDepartmentForExperience(dept: string, index: number): void {
  debugger
  this.userExperiences[index].lastJobDepartment = dept;
}


@ViewChild("formSubmitButton") formSubmitButton!:ElementRef;
@ViewChild("experienceInformationForm") experienceInformationForm!:NgForm;
buttonType:string="next"
selectButtonType(type:string){
  debugger
  this.experienceInformationForm;
  this.buttonType=type;
  this.userExperiences[0].directSave = false;
  this.formSubmitButton.nativeElement.click();
  if(type === 'preview'){
    const modalRef = this.modalService.open(PreviewFormComponent, {
      centered: true,
      size: 'lg', backdrop: 'static'
    });
    }
}

directSave: boolean = false;

submit(){
  debugger
  this.checkFormValidation();

  if(this.isFormInvalid==true){
    return
  } else{
switch(this.buttonType){
  case "next" :{
     this.userExperiences[0].directSave = false;
     this.userExperiences[0].updateRequest = false;
    this.setEmployeeExperienceDetailsMethodCall();
    break;
  }
  case "save" :{
    debugger
    this.userExperiences[0].directSave = true;
    this.userExperiences[0].updateRequest = false;
    this.setEmployeeExperienceDetailsMethodCall();
    break;
  }
  case "update" :{
    debugger
    this.userExperiences[0].directSave = false;
    this.userExperiences[0].updateRequest = true;
    this.setEmployeeExperienceDetailsMethodCall();
    break;
  }
}
  }
}

isFormInvalid: boolean = false;
// @ViewChild ('experienceInformationForm') experienceInformationForm !: NgForm
checkFormValidation() {
  if (this.experienceInformationForm.invalid) {
    // console.log('Invalid controls:', this.experienceInformationForm.controls);
    Object.keys(this.experienceInformationForm.controls).forEach(key => {
      const control = this.experienceInformationForm.controls[key];
      if (control.invalid) {
        // console.log(key, 'is invalid', control.errors);
      }
    });
    this.isFormInvalid = true;
    return;
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

  experience: any = {}; // Assuming you have an experience object
  dateRange: Date[] | undefined;

  onDateRangeChange(range: [Date | null, Date | null], index: number): void {
    if (range && range.length === 2) {
      this.userExperiences[index].startDate = range[0];
      this.userExperiences[index].endDate = range[1];
    }
  }
  date: Date[] | null = null;
  disabledDate = (current: Date): boolean => {
    // Disable future dates
    if (current && current > new Date()) {
      return true;
    }
    // If start date is selected, disable all dates before it
    if (this.date && this.date[0] && current < this.date[0]) {
      return true;
    }
    return false;
  };

  departmentInputValue?: string;
positionInputValue?: string;

departmentFilteredOptions: string[] = [];
positionFilteredOptions: string[] = [];

onChangePosition(search: string, index: number): void {
  if (search) {
    this.positionFilteredOptions = this.jobTitles.filter(title =>
      title.toLowerCase().includes(search.toLowerCase())
    );
  } else {
    this.positionFilteredOptions = [];
  }
}

onChangeDepartment(search: string, index: number): void {
  if (search) {
    this.departmentFilteredOptions = this.departments.filter(department =>
      department.toLowerCase().includes(search.toLowerCase())
    );
  } else {
    this.departmentFilteredOptions = [];
  }
}
preventWhitespace(event: KeyboardEvent): void {
  const inputElement = event.target as HTMLInputElement;

  // Prevent space if it's the first character
  if (event.key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }
}

preventLeadingWhitespace(event: KeyboardEvent): void {
  const inputElement = event.target as HTMLInputElement;

  // Prevent space if it's the first character
  if (event.key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }
  if (!isNaN(Number(event.key)) && event.key !== ' ') {
    event.preventDefault();
  }
}

preventAlphabets(event: KeyboardEvent): void {
  // Check if the pressed key is an alphabetic character or not the backspace key
  const inputElement = event.target as HTMLInputElement;
  if (event.key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }
  if (/^[A-Za-z]*$/.test(event.key) && event.key !== 'Backspace') {
    event.preventDefault();
  }
}

isAdminPresent : boolean = false;
getAdminVerifiedForOnboardingUpdateMethodCall(): Promise<boolean> {
  debugger;
  return new Promise<boolean>((resolve, reject) => {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    if (userUuid && adminUuid) {
      this.dataService.getAdminVerifiedForOnboardingUpdate(userUuid, adminUuid).subscribe(
        (isAdminPresent: boolean) => {
          this.isAdminPresent = isAdminPresent;
          // console.log('Admin verification successful.');
          resolve(isAdminPresent); // Resolve the promise with the result
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
