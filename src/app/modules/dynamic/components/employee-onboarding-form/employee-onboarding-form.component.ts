import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-onboarding-form',
  templateUrl: './employee-onboarding-form.component.html',
  styleUrls: ['./employee-onboarding-form.component.css']
})
export class EmployeeOnboardingFormComponent implements OnInit {

  userPersonalInformationRequest: UserPersonalInformationRequest = new UserPersonalInformationRequest();

  constructor(private dataService: DataService, private router: Router, private activateRoute: ActivatedRoute,
) { }

  ngOnInit(): void {
    this.getNewUserPersonalInformationMethodCall();
  }


  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-address-detail'], navExtra);
  }

  
   userPersonalDetailsStatus = "";
  setEmployeePersonalDetailsMethodCall() {
    
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    this.dataService.markStepAsCompleted(0);
   
    this.dataService.setEmployeePersonalDetails(this.userPersonalInformationRequest, userUuid)
      .subscribe(
        (response: UserPersonalInformationRequest) => {
          console.log(response);  
          
          if (!userUuid) {
            // localStorage.setItem('uuidNewUser', response.uuid);
            this.dataService.setEmployeePersonalDetails(this.userPersonalInformationRequest, userUuid)
            // this.userPersonalDetailsStatus = response.statusResponse;
            // localStorage.setItem('statusResponse', JSON.stringify(this.userPersonalDetailsStatus));
            this.dataService.markStepAsCompleted(0);
          }  
          
          // this.router.navigate(['/employee-address-detail']);
        },
        (error) => {
          console.error(error);
        }
      );
  }
  


  getNewUserPersonalInformationMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  
    if (userUuid) {
      this.dataService.getNewUserPersonalInformation(userUuid).subscribe(
        (response: UserPersonalInformationRequest) => {
          this.userPersonalInformationRequest = response;
          this.dataService.markStepAsCompleted(0);
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          
        }
      );
    } else {
      console.error('uuidNewUser not found in localStorage');
      
    }
  } 

  changeMethodCall(file : Event){
    console.log(file);
  }
  
}
