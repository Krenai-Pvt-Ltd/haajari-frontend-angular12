import { Component, OnInit } from '@angular/core';
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

}
