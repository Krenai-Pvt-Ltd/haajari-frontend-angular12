import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { debug } from 'console';
import { UserAddressDetailsRequest } from 'src/app/models/user-address-details-request';
import { UserAddressRequest } from 'src/app/models/user-address-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-address-detail',
  templateUrl:'./employee-address-detail.component.html',
  styleUrls: ['./employee-address-detail.component.css']
})
export class EmployeeAddressDetailComponent implements OnInit {
  sameAddress: boolean = true;

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
  this.userAddressDetailsRequest.sameAddress = this.isPermanent;
  this.toggle = true;
  const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';

  if (!userUuid) { // Fixed check here
    console.error('User UUID is not available.');
    this.toggle = false; // Reset toggle since we're not proceeding
    return;
  }

  this.dataService.markStepAsCompleted(2);

  this.dataService.setEmployeeAddressDetails(this.userAddressDetailsRequest, userUuid)
    .subscribe(
      (response: UserAddressDetailsRequest) => {
        console.log('Response:', response);
        this.toggle = false;
        this.routeToUserDetails(); // Ensure this method does what's expected
      },
      (error) => {
        console.error('Error occurred:', error);
        this.toggle = false;
        // Optionally update the UI to show an error message
      }
    );
}

  
isLoading:boolean = true;
  getNewUserAddressDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    this.dataService.markStepAsCompleted(2);
    if (userUuid) {
      this.dataService.getNewUserAddressDetails(userUuid).subscribe(
        (response: UserAddressDetailsRequest) => {
          this.isLoading=false;
          if (response && response.userAddressRequest && response.userAddressRequest.length > 0) {
            this.userAddressDetailsRequest = response;
            

            if(response.sameAddress==false){
              this.isPermanent=false;
            }else{
              this.isPermanent=true;
            }
            
          } else {
            // Properly initialize the object with default values
            this.userAddressDetailsRequest = {
              statusId: 0,
              sameAddress: false, // Default to false since there are no addresses to determine if they are the same
              userAddressRequest: [new UserAddressRequest(), new UserAddressRequest()] // Initialize with two empty addresses
            };
          }
          
        },
        (error: any) => {
          console.error('Error fetching user address details:', error);
        }
      );
    } else {
      console.error('User UUID not found in the URL search parameters');
    }
  }
  
  
//   isPermanent: boolean = true;

// showPermanent() {
//   // Toggle the boolean value
//   this.isPermanent = !this.isPermanent;
//   this.userAddressDetailsRequest.sameAddress = this.isPermanent;
// }

isPermanent:boolean=true;
  showPermanent(){
    this.isPermanent= this.isPermanent == true ? false:true;
    // this.userAddressDetailsRequest.sameAddress = this.isPermanent;
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
