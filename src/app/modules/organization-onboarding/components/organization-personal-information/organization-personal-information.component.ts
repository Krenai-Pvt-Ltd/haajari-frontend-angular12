
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';


import { OrganizationPersonalInformation } from 'src/app/models/organization-personal-information';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-organization-personal-information',
  templateUrl: './organization-personal-information.component.html',
  styleUrls: ['./organization-personal-information.component.css']
})
export class OrganizationPersonalInformationComponent implements OnInit {

  constructor(private dataService:DataService) { }

  ngOnInit(): void {
    this.getOrganizationDetails();
  }


  organizationPersonalInformation: OrganizationPersonalInformation = {
    id: 0,
    name: '',
    email: '',
    password: '',
    state: '',
    country: '',
    logo: '',
    city: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    organization: {
      id: 0,
      name: "",
      email: "",
      password: "",
      country: 0,
      state: "",
      token: "",
      webhook: "",
      appId: "",
      userToken: "",
      configureUrl: ""
    }
  };
 

  registerOrganizationPersonalInformation() {
    this.dataService.registerOrganizationPersonalInformation(this.organizationPersonalInformation)
      .subscribe(response => {
        console.log("organization personal Info Registered Successfully");

      },(error) => {
          console.log(error.error.message);
      });
  }

  getOrganizationDetails(){
    debugger
    this.dataService.getOrganizationDetails().subscribe(
      (data)=> {
          this.organizationPersonalInformation = data;          
          console.log(this.organizationPersonalInformation);
      }, (error) => {
        console.log(error);
      });
  }

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
  
    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.value.length === 0) {
      event.preventDefault();
  }
    // if (!isNaN(Number(event.key)) && event.key !== ' ') {
    //   event.preventDefault();
    // }
  }

  preventLeadingWhitespaceAndNumber(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
  
    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
    }
  }

  
  isFormInvalid: boolean = false;
  @ViewChild ('personalInformationForm') personalInformationForm !: NgForm
checkFormValidation(){
  if(this.personalInformationForm.invalid){
  this.isFormInvalid = true;
  return
  } else {
    this.isFormInvalid = false;
  }
}

submit(){
  this.checkFormValidation();

  if(this.isFormInvalid==true){
    return
  } else{
  }
}
}
