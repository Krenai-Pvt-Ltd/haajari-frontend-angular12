import { Component, OnInit } from '@angular/core';
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
  setEmployeeAcademicsMethodCall() {
    debugger
    this.toggle = true;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    
    this.dataService.setEmployeeAcademics(this.userAcademicsDetailRequest, userUuid)
      .subscribe(
        (response: UserAcademicsDetailRequest) => {
          console.log(response);  
          this.dataService.markStepAsCompleted(response.statusId);
          this.toggle = false
          this.routeToUserDetails();
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
  isLoading:boolean = true;
  getUserAcademicDetailsMethodCall() {
    debugger
   
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    if (userUuid) {
      this.dataService.getUserAcademicDetails(userUuid).subscribe((response: UserAcademicsDetailRequest) => {
        this.dataService.markStepAsCompleted(response.statusId);
        if(response != null){
          this.userAcademicsDetailRequest = response;
          
          
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
}
