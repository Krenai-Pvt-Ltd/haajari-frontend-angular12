import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { UserBankDetailRequest } from 'src/app/models/user-bank-detail-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.css']
})
export class BankDetailsComponent implements OnInit {
  userBankDetailRequest: UserBankDetailRequest = new UserBankDetailRequest();

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.getEmployeeBankDetailsMethodCall();
  }
  backRedirectUrl(){
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-experience'], navExtra);
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/emergency-contact'], navExtra);
  }

  userBankDetailsStatus = "";

  setEmployeeBankDetailsMethodCall() {
    
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    this.dataService.markStepAsCompleted(5);
    this.dataService.setEmployeeBankDetails(this.userBankDetailRequest, userUuid)
      .subscribe(
        (response: UserBankDetailRequest) => {
          console.log(response);  
          this.userBankDetailsStatus = response.statusResponse;
          // localStorage.setItem('statusResponse', JSON.stringify(this.userBankDetailsStatus));
          // this.router.navigate(['/emergency-contact']);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  getEmployeeBankDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  
    if (userUuid) {
      this.dataService.getEmployeeBankDetails(userUuid).subscribe(
        (response: UserBankDetailRequest) => {
          this.userBankDetailRequest = response;
          this.dataService.markStepAsCompleted(5);
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
