import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { OrganizationRegistrationFormRequest } from 'src/app/models/organization-registration-form-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-organization-registration-form',
  templateUrl: './organization-registration-form.component.html',
  styleUrls: ['./organization-registration-form.component.css']
})
export class OrganizationRegistrationFormComponent implements OnInit {

  constructor(private dataService : DataService,  private router: Router, private helperService : HelperService, private _onboardingService : OrganizationOnboardingService) { }

  employeeCountOptions = [
    { value: '0-10', label: '0 - 10' },
    { value: '11-50', label: '11 - 50' },
    { value: '51-100', label: '51 - 100' },
    { value: '101-500', label: '101 - 500' },
    { value: '500+', label: '500+' },
  ];

  ngOnInit(): void {
  }

  formData: OrganizationRegistrationFormRequest = {
    organizationName: '',
    employeeCount: '',
    industryType: '',
    organizationEmail: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    termsAndConditions: false
  };

  orgName: string = '';
  errorMessage: string = '';

  isLoading:boolean=false;
  onSubmit(): void {

    if (this.formData) {
      this.isLoading = true;
      this.dataService.registerOrganizationRegistrationFormInfo(this.formData).subscribe(
        response => {
          if(response.status === false) {
            this.orgName = response.object;
            this.errorMessage = 'This Info is Already Registered with us!'
            // this.helperService.showToast(this.errorMessage, Key.TOAST_STATUS_ERROR);
            this.isLoading = false;
          }else if(response.status === true){
          console.log('Registration successful', response);
          this.router.navigate(['/auth/signup']);
          this.isLoading = false;
          // this.helperService.showToast("Info Registered Successfully", Key.TOAST_STATUS_SUCCESS);
          }
        },
        error => {
          this.isLoading = false;
          console.error('Registration failed', error);
        }
      );
    }
  }

  isEmailExist: boolean = false;
  checkEmailExistance(email: string) {
    debugger;
    if (email != null && email.length > 5) {
      this._onboardingService
        .checkEmployeeEmailExistWithoutToken(email)
        .subscribe((response: any) => {
          this.isEmailExist = response;
        });
    }
  }

  isNumberExist: boolean = false;
  checkExistance(number: string) {
    if (number != '' && number.length >= 10) {
      this._onboardingService.checkAdminNumberExistWithoutToken(number).subscribe(
        (response: any) => {
          this.isNumberExist = response;
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  isFormInvalid(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
    const phonePattern = /^[0-9]{10}$/; 

    const isEmailInvalid = !emailPattern.test(this.formData.organizationEmail);
    const isPhoneInvalid = !phonePattern.test(this.formData.phoneNumber);

    return !(
      this.formData.organizationName &&
      this.formData.employeeCount &&
      this.formData.industryType &&
      this.formData.organizationEmail &&
      this.formData.firstName &&
      this.formData.lastName &&
      this.formData.phoneNumber &&
      this.formData.termsAndConditions &&
      !this.isEmailExist &&  
      !this.isNumberExist &&  
      !isEmailInvalid &&      
      !isPhoneInvalid         
    );
  }

  // resetForm(form: NgForm) {
  //   form.resetForm();
  //   this.formData = {
  //     organizationName: '',
  //     employeeCount: '',
  //     industryType: '',
  //     organizationEmail: '',
  //     firstName: '',
  //     lastName: '',
  //     phoneNumber: '',
  //     termsAndConditions: false
  //   };
  // }

  onCheckboxChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
  console.log('Checkbox checked:', inputElement.checked); 
  this.formData.termsAndConditions = inputElement.checked;
  }

  restrictToDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.value = input.value.replace(/[^0-9]/g, '');
    }
  }
  

  industryOptions = [
    { label: 'Technology', value: 'technology' },
    { label: 'Finance', value: 'finance' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Education', value: 'education' },
    { label: 'Retail', value: 'retail' },
    { label: 'Manufacturing', value: 'manufacturing' },
    { label: 'Transportation', value: 'transportation' },
    { label: 'Telecommunications', value: 'telecommunications' },
    { label: 'Construction', value: 'construction' },
    { label: 'Real Estate', value: 'real-estate' },
    { label: 'Energy', value: 'energy' },
    { label: 'Utilities', value: 'utilities' },
    { label: 'Hospitality', value: 'hospitality' },
    { label: 'Media', value: 'media' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Pharmaceuticals', value: 'pharmaceuticals' },
    { label: 'Biotechnology', value: 'biotechnology' },
    { label: 'Agriculture', value: 'agriculture' },
    { label: 'Automotive', value: 'automotive' },
    { label: 'Aerospace', value: 'aerospace' },
    { label: 'Legal', value: 'legal' },
    { label: 'Consulting', value: 'consulting' },
    { label: 'Non-Profit', value: 'non-profit' },
    { label: 'Government', value: 'government' },
    { label: 'Insurance', value: 'insurance' },
    { label: 'Consumer Goods', value: 'consumer-goods' },
    { label: 'Professional Services', value: 'professional-services' },
    { label: 'IT Services', value: 'it-services' },
    { label: 'E-commerce', value: 'e-commerce' },
    { label: 'Healthcare Services', value: 'healthcare-services' },
    { label: 'Education Technology', value: 'education-technology' }
  ];
  


}
