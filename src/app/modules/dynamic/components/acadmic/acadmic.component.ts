import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    this.router.navigate(['/employee-document']);
  }
  setEmployeeAcademicsMethodCall() {
    
    let userUuid = localStorage.getItem('uuidNewUser') || '';
    this.dataService.setEmployeeAcademics(this.userAcademicsDetailRequest, userUuid)
      .subscribe(
        (response: UserAcademicsDetailRequest) => {
          console.log(response);  
          
          this.router.navigate(['/employee-experience']);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  getUserAcademicDetailsMethodCall() {
    debugger
    const userUuid = localStorage.getItem('uuidNewUser');
  
    if (userUuid) {
      this.dataService.getNewUserPersonalInformation(userUuid).subscribe(
        (response: UserAcademicsDetailRequest) => {
          this.userAcademicsDetailRequest = response;
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
