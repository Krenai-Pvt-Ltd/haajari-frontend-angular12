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
    this.router.navigate(['/employee-document'], navExtra);
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-experience'], navExtra);
  }

  userAcademicDetailsStatus = "";
  toggle = false;
  setEmployeeAcademicsMethodCall() {
    this.toggle = true;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    this.dataService.markStepAsCompleted(4);
    this.dataService.setEmployeeAcademics(this.userAcademicsDetailRequest, userUuid)
      .subscribe(
        (response: UserAcademicsDetailRequest) => {
          console.log(response);  
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

  getUserAcademicDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  
    if (userUuid) {
      this.dataService.getUserAcademicDetails(userUuid).subscribe(
        (response: UserAcademicsDetailRequest) => {
          this.userAcademicsDetailRequest = response;
          this.dataService.markStepAsCompleted(4);
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
