import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { debug } from 'console';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
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
  userAddressRequest: UserAddressRequest[] = [new UserAddressRequest(), new UserAddressRequest()];
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
    this.router.navigate(['/employee-onboarding/employee-onboarding-form'], navExtra);
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-onboarding/employee-document'], navExtra);
  }
  userUuid:any;

  
  userAddressDetailsStatus = "";
  toggle = false;
  toggleSave = false;
setEmployeeAddressDetailsMethodCall() {
  debugger
  this.userAddressDetailsRequest.sameAddress = this.isPermanent;
  if(this.buttonType=='next'){
    this.toggle = true;
  } else if (this.buttonType=='save'){
    this.toggleSave = true;
  }
  // this.toggle = true;
  const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';

  if (!userUuid) { // Fixed check here
    console.error('User UUID is not available.');
    this.toggle = false; // Reset toggle since we're not proceeding
    return;
  }

  

  this.dataService.setEmployeeAddressDetails(this.userAddressDetailsRequest, userUuid)
    .subscribe(
      (response: UserAddressDetailsRequest) => {
        console.log('Response:', response);
        this.dataService.markStepAsCompleted(response.statusId);
        this.toggle = false;
        this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
       
        if(this.buttonType=='next'){
          this.routeToUserDetails();
        } else if (this.buttonType=='save'){
          this.successMessageModalButton.nativeElement.click();
          this.handleOnboardingStatus(response.employeeOnboardingStatus);
          this.routeToFormPreview();
        } // Ensure this method does what's expected
      },
      (error) => {
        console.error('Error occurred:', error);
        this.toggle = false;
        // Optionally update the UI to show an error message
      }
    );
}

  
isLoading:boolean = true;
employeeOnboardingFormStatus:string|null=null;
@ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;
  getNewUserAddressDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
   
    if (userUuid) {
      this.dataService.getNewUserAddressDetails(userUuid).subscribe(
        (response: UserAddressDetailsRequest) => {
          this.isLoading=false;
          this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
          this.dataService.markStepAsCompleted(response.statusId);
          if (response && response.userAddressRequest && response.userAddressRequest.length > 0) {
            this.userAddressDetailsRequest = response;
            if(response.employeeOnboardingFormStatus=='USER_REGISTRATION_SUCCESSFUL'){
              this.successMessageModalButton.nativeElement.click();
            }
            this.handleOnboardingStatus(response.employeeOnboardingStatus);

            if(response.sameAddress==false){
              this.isPermanent=false;
            }else{
              this.isPermanent=true;
            }
            
          } else {
            // Properly initialize the object with default values
            this.userAddressDetailsRequest = new UserAddressDetailsRequest();
            this.userAddressDetailsRequest.directSave=false;
            this.userAddressDetailsRequest.sameAddress=false;
            this.userAddressDetailsRequest.statusId=0;
            this.userAddressDetailsRequest.userAddressRequest=[new UserAddressRequest(),new UserAddressRequest()];
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

isPermanent:boolean=false;
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
  @ViewChild("formSubmitButton") formSubmitButton!:ElementRef;

buttonType:string="next"
selectButtonType(type:string){
  this.buttonType=type;
  this.userAddressDetailsRequest.directSave = false;
  this.formSubmitButton.nativeElement.click();
}

directSave: boolean = false;

submit(){
switch(this.buttonType){
  case "next" :{
    this.setEmployeeAddressDetailsMethodCall();
    break;
  }
  case "save" :{
    debugger
    this.userAddressDetailsRequest.directSave = true;
    this.setEmployeeAddressDetailsMethodCall();
    break;
  }
}
}
@ViewChild("dismissSuccessModalButton") dismissSuccessModalButton!:ElementRef;
routeToFormPreview() {
  this.dismissSuccessModalButton.nativeElement.click();
  setTimeout(x=>{
  let navExtra: NavigationExtras = {
    
    queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
  };
  this.router.navigate(['/employee-onboarding/employee-onboarding-preview'], navExtra);
},2000)
}
  
displayModal = false;
  allowEdit = false;
handleOnboardingStatus(response: string) {
  this.displayModal = true;
  switch (response) {
    
    case 'REJECTED':
      this.allowEdit = true;
      break;
      case 'APPROVED':
    case 'PENDING':
      this.allowEdit = false;
      break;
    default:
      this.displayModal = false;
      break;
  }
}

@ViewChild("placesRef") placesRef! : GooglePlaceDirective;

  public handleAddressChange(e: any) {
    debugger
    var id=this.userAddressRequest[0].id;
    var addressLine1=this.userAddressRequest[0].addressLine1;
    this.userAddressRequest[0]=new UserAddressRequest();
    this.userAddressRequest[0].id=id;
    this.userAddressRequest[0].addressLine1=e.name ;
    e?.address_components?.forEach((entry: any) => {
      console.log(entry);
      
      if (entry.types?.[0] === "route") {
        this.userAddressRequest[0].addressLine2 = entry.long_name + ",";
      }
      if (entry.types?.[0] === "sublocality_level_1") {
        this.userAddressRequest[0].addressLine2 = this.userAddressRequest[0].addressLine2 + entry.long_name
      }
      if (entry.types?.[0] === "locality") {
        this.userAddressRequest[0].city = entry.long_name
      }
      if (entry.types?.[0] === "administrative_area_level_1") {
        this.userAddressRequest[0].state = entry.long_name
      }
      if (entry.types?.[0] === "country") {
        this.userAddressRequest[0].country = entry.long_name
      }
      if (entry.types?.[0] === "postal_code") {
        this.userAddressRequest[0].pincode = entry.long_name
      }



    });
  }
  
}
