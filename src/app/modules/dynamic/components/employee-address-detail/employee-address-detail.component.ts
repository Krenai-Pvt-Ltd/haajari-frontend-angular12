import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAddressDetailsRequest } from 'src/app/models/user-address-details-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-address-detail',
  templateUrl: './employee-address-detail.component.html',
  styleUrls: ['./employee-address-detail.component.css']
})
export class EmployeeAddressDetailComponent implements OnInit {

  userAddressDetailsRequest: UserAddressDetailsRequest = new UserAddressDetailsRequest();

  constructor(private dataService: DataService, private router : Router) { }

  ngOnInit(): void {
    this.getNewUserAddressDetailsMethodCall();
  }
  backRedirectUrl(){
    this.router.navigate(['/employee-onboarding-form']);
  }

  setEmployeeAddressDetailsMethodCall() {
    let userUuid = localStorage.getItem('uuidNewUser') || '';
  
    this.dataService.setEmployeeAddressDetails(this.userAddressDetailsRequest, userUuid)
      .subscribe(
        (response: UserAddressDetailsRequest) => {
          console.log(response);
          this.router.navigate(['/employee-document']);
        },
        (error) => {
          console.error(error);
        }
      );
  }
  
  getNewUserAddressDetailsMethodCall() {
    debugger
    const userUuid = localStorage.getItem('uuidNewUser');
  
    if (userUuid) {
      this.dataService.getNewUserAddressDetails(userUuid).subscribe(
        (response: UserAddressDetailsRequest) => {
          this.userAddressDetailsRequest = response;
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
