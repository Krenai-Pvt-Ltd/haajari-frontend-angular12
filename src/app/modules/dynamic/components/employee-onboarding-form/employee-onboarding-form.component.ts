import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-onboarding-form',
  templateUrl: './employee-onboarding-form.component.html',
  styleUrls: ['./employee-onboarding-form.component.css']
})
export class EmployeeOnboardingFormComponent implements OnInit {

  userPersonalInformationRequest: UserPersonalInformationRequest = new UserPersonalInformationRequest();

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.getNewUserPersonalInformationMethodCall();
  }

  setEmployeePersonalDetailsMethodCall() {
    
    let userUuid = localStorage.getItem('uuidNewUser') || '';
  
   
    this.dataService.setEmployeePersonalDetails(this.userPersonalInformationRequest, userUuid)
      .subscribe(
        (response: UserPersonalInformationRequest) => {
          console.log(response);  
          
          if (!userUuid) {
            localStorage.setItem('uuidNewUser', response.userUuid);
            this.dataService.setEmployeePersonalDetails(this.userPersonalInformationRequest, userUuid)
          }  
          
          this.router.navigate(['/employee-address-detail']);
        },
        (error) => {
          console.error(error);
        }
      );
  }
  


  getNewUserPersonalInformationMethodCall() {
    debugger
    const userUuid = localStorage.getItem('uuidNewUser');
  
    if (userUuid) {
      this.dataService.getNewUserPersonalInformation(userUuid).subscribe(
        (response: UserPersonalInformationRequest) => {
          this.userPersonalInformationRequest = response;
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          
        }
      );
    } else {
      console.error('uuidNewUser not found in localStorage');
      
    }
  } 

  
}
