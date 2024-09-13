import { Component, OnInit } from '@angular/core';
import { OrganizationRegistrationFormRequest } from 'src/app/models/organization-registration-form-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-organization-registration-form',
  templateUrl: './organization-registration-form.component.html',
  styleUrls: ['./organization-registration-form.component.css']
})
export class OrganizationRegistrationFormComponent implements OnInit {

  constructor(private dataService : DataService) { }

  ngOnInit(): void {
  }

  formData: OrganizationRegistrationFormRequest = {
    organizationName: '',
    employeeCount: 0,
    industryType: '',
    organizationEmail: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  };


  onSubmit(): void {
    if (this.formData) {
      this.dataService.registerOrganizationRegistrationFormInfo(this.formData).subscribe(
        response => {
          console.log('Registration successful', response);
        },
        error => {
          console.error('Registration failed', error);
        }
      );
    }
  }


}
