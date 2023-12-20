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
  
  setEmployeeAddressDetailsMethodCall() {
    debugger
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
          this.userAddressDetailsStatus = response.statusResponse;
          // this.router.navigate(['/employee-document']);
          // localStorage.setItem('statusResponse', JSON.stringify(this.userAddressDetailsStatus));

        },
        (error) => {
          console.error('Error occurred:', error);
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
          this.dataService.markStepAsCompleted(2);
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
      this.userAddressDetailsRequest.sameAddress=false;
    }
  }


  registerForm = new FormGroup({
    // ... existing form controls ...
  
    currentAddress: new FormControl('', [Validators.required]),
    currentPincode: new FormControl('', [Validators.required, Validators.pattern("[0-9]*"), Validators.minLength(6), Validators.maxLength(6)]),
    currentCity: new FormControl('', [Validators.required]),
    currentState: new FormControl('', [Validators.required]),
    currentCountry: new FormControl('', [Validators.required]),
    sameAddress: new FormControl(true),  // Assuming this is a checkbox for same address
    permanentAddress: new FormControl(''),
    permanentPincode: new FormControl('', [Validators.pattern("[0-9]*"), Validators.minLength(6), Validators.maxLength(6)]),
    permanentCity: new FormControl(''),
    permanentState: new FormControl(''),
    permanentCountry: new FormControl('')
  });
  
  
  // Getters for the current address form controls
get currentAddress(): FormControl {
  return this.registerForm.get('currentAddress') as FormControl;
}

get currentPincode(): FormControl {
  return this.registerForm.get('currentPincode') as FormControl;
}

get currentCity(): FormControl {
  return this.registerForm.get('currentCity') as FormControl;
}

get currentState(): FormControl {
  return this.registerForm.get('currentState') as FormControl;
}

get currentCountry(): FormControl {
  return this.registerForm.get('currentCountry') as FormControl;
}

// Getters for the permanent address form controls
get permanentAddress(): FormControl {
  return this.registerForm.get('permanentAddress') as FormControl;
}

get permanentPincode(): FormControl {
  return this.registerForm.get('permanentPincode') as FormControl;
}

get permanentCity(): FormControl {
  return this.registerForm.get('permanentCity') as FormControl;
}

get permanentState(): FormControl {
  return this.registerForm.get('permanentState') as FormControl;
}

get permanentCountry(): FormControl {
  return this.registerForm.get('permanentCountry') as FormControl;
}


get sameAddress(): FormControl {
  return this.registerForm.get('sameAddress') as FormControl;
}

  
  // ... similarly for the other fields ...
  
  // onSameAddressChange() {
  //   const permanentAddressControls = [
  //     'permanentAddress',
  //     'permanentPincode',
  //     'permanentCity',
  //     'permanentState',
  //     'permanentCountry'
  //   ];
  
  //   if (this.registerForm.get('sameAddress').value) {
  //     permanentAddressControls.forEach(field => {
  //       this.registerForm.get(field).disable();
  //       this.registerForm.get(field).reset();
  //     });
  //   } else {
  //     permanentAddressControls.forEach(field => this.registerForm.get(field).enable());
  //   }
  // }
  
}
