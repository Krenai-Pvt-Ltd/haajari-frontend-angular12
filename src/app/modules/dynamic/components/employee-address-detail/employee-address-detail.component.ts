import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { UserAddressDetailsRequest } from 'src/app/models/user-address-details-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-address-detail',
  templateUrl:'./employee-address-detail.component.html',
  styleUrls: ['./employee-address-detail.component.css']
})
export class EmployeeAddressDetailComponent implements OnInit {

  userAddressDetailsRequest: UserAddressDetailsRequest = new UserAddressDetailsRequest();

  constructor(private dataService: DataService, private router : Router, private activateRoute : ActivatedRoute) { 

    if (this.activateRoute.snapshot.queryParamMap.has('userUuid')) {
      this.userUuid = this.activateRoute.snapshot.queryParamMap.get('userUuid');
    }
  }

  ngOnInit(): void {
    this.getNewUserAddressDetailsMethodCall();
  }
  backRedirectUrl(){
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-onboarding-form'], navExtra);
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-document'], navExtra);
  }
  userUuid:any;

  
  userAddressDetailsStatus = "";
  toggle = false;
  setEmployeeAddressDetailsMethodCall() {
    debugger
    this.toggle = true;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    this.dataService.markStepAsCompleted(2);
    if (!this.userUuid) {
      console.error('User UUID is not available in localStorage.');
      return;
    }
  
    this.dataService.setEmployeeAddressDetails(this.userAddressDetailsRequest, this.userUuid)
    
      .subscribe(
        (response: UserAddressDetailsRequest) => {
          console.log('Response:', response);
          this.toggle = false
          this.userAddressDetailsStatus = response.statusResponse;
          this.routeToUserDetails()
          // this.router.navigate(['/employee-document']);
          // localStorage.setItem('statusResponse', JSON.stringify(this.userAddressDetailsStatus));

        },
        (error) => {
          console.error('Error occurred:', error);
          this.toggle = false
        }
      );
  }
  
  
  getNewUserAddressDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  
    if (userUuid) {
      this.dataService.getNewUserAddressDetails(userUuid).subscribe(
        (response: UserAddressDetailsRequest) => {
          this.userAddressDetailsRequest = response;
          if(response!=null){
            this.dataService.markStepAsCompleted(2);
          }
          
          if(this.userAddressDetailsRequest==null){
            this.userAddressDetailsRequest = new UserAddressDetailsRequest();
          }
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          
        }
      );
    } else {
      console.error('uuidNewUser not found in localStorage');
      
    }
  } 

  isPermanent:boolean=false;
  showPermanent(){
    this.isPermanent= this.isPermanent == true ? false:true;
    if(!this.isPermanent){
      // this.registerForm.sameAddress=false;
    }
  }


  // registerForm = new FormGroup({
  
  //   currentAddress: new FormControl('', [Validators.required]),
  //   currentPincode: new FormControl('', [Validators.required, Validators.pattern("[0-9]*"), Validators.minLength(6), Validators.maxLength(6)]),
  //   currentCity: new FormControl('', [Validators.required]),
  //   currentState: new FormControl('', [Validators.required]),
  //   currentCountry: new FormControl('', [Validators.required]),
  //   sameAddress: new FormControl("true"),  
  //   permanentAddress: new FormControl(''),
  //   permanentPincode: new FormControl('', [Validators.pattern("[0-9]*"), Validators.minLength(6), Validators.maxLength(6)]),
  //   permanentCity: new FormControl(''),
  //   permanentState: new FormControl(''),
  //   permanentCountry: new FormControl('')
  // });
  
  
  
  // ... similarly for the other fields ...
  
  
  
}
