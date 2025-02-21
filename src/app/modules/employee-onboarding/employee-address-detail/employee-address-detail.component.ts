import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { debug } from 'console';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Key } from 'src/app/constant/key';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
import { UserAddressDetailsRequest } from 'src/app/models/user-address-details-request';
import { UserAddressRequest } from 'src/app/models/user-address-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PreviewFormComponent } from '../preview-form/preview-form.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-employee-address-detail',
  templateUrl:'./employee-address-detail.component.html',
  styleUrls: ['./employee-address-detail.component.css']
})
export class EmployeeAddressDetailComponent implements OnInit {
  sameAddress: boolean = true;
  userAddressRequest: UserAddressRequest[] = [new UserAddressRequest(), new UserAddressRequest()];
  userAddressDetailsRequest: UserAddressDetailsRequest = new UserAddressDetailsRequest();

  constructor(public dataService: DataService, private router : Router,
    private activateRoute : ActivatedRoute,
    private helperService : HelperService,
    private modalService: NgbModal) {

    if (this.activateRoute.snapshot.queryParamMap.has('userUuid')) {
      this.userUuid = this.activateRoute.snapshot.queryParamMap.get('userUuid');
    }
  }

  ngOnInit(): void {
    this.getNewUserAddressDetailsMethodCall();
  }
  backRedirectUrl() {
    // Retrieve userUuid from the URL query parameters
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');

    // Initialize an empty object for queryParams
    let queryParams: any = {};

    // Add userUuid to queryParams if it exists
    if (userUuid) {
      queryParams['userUuid'] = userUuid;
    }

    // Conditionally add adminUuid to queryParams if updateRequest is true
    if (this.userAddressDetailsRequest.updateRequest) {
      const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
      if (adminUuid) {
        queryParams['adminUuid'] = adminUuid;
      }
    }

    // Create NavigationExtras object with the queryParams
    let navExtra: NavigationExtras = { queryParams };

    // Navigate to the specified route with the query parameters
    this.router.navigate(['/employee-onboarding/employee-onboarding-form'], navExtra);
  }



  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    if(this.dataService.isRoutePresent('/employee-document')){
      this.router.navigate(
        ['/employee-onboarding/employee-document'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/acadmic')){
      this.router.navigate(
        ['/employee-onboarding/acadmic'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/employee-experience')){
      this.router.navigate(
        ['/employee-onboarding/employee-experience'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/bank-details')){
      this.router.navigate(
        ['/employee-onboarding/bank-details'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/emergency-contact')){
      this.router.navigate(
        ['/employee-onboarding/emergency-contact'],
        navExtra
      );
    }
  }
  userUuid:any;


  userAddressDetailsStatus = "";
  toggle = false;
  toggleSave = false;
setEmployeeAddressDetailsMethodCall() {
  debugger
  this.userAddressDetailsRequest.userAddressRequest=this.userAddressRequest;
  this.userAddressDetailsRequest.sameAddress = this.isPermanent;
  if(this.buttonType=='next'){
    this.toggle = true;
    this.userAddressDetailsRequest.directSave = false;
    this.userAddressDetailsRequest.updateRequest = false;
  } else if (this.buttonType=='save'){
    this.toggleSave = true;
    this.userAddressDetailsRequest.directSave = true;
    this.userAddressDetailsRequest.updateRequest = false;
  } else if (this.buttonType=='update'){
    this.toggle = true;
    this.userAddressDetailsRequest.directSave = false;
    this.userAddressDetailsRequest.updateRequest = true;
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
        // console.log('Response:', response);
        this.dataService.markStepAsCompleted(response.statusId);
        this.toggle = false;
        this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;

        if(this.buttonType=='next'){
          this.routeToUserDetails();
        } else if (this.buttonType=='save'){
          if(this.employeeOnboardingFormStatus!='REJECTED'){
            this.handleOnboardingStatus(response.employeeOnboardingStatus);
            this.successMessageModalButton.nativeElement.click();
          }

          setTimeout(() => {

            this.routeToFormPreview();
          }, 2000);


        } else if (this.buttonType=='update'){
          this.helperService.showToast("Information Updated Successfully", Key.TOAST_STATUS_SUCCESS);

         } // Ensure this method does what's expected
      },
      (error) => {
        console.error('Error occurred:', error);
        this.toggle = false;
        // Optionally update the UI to show an error message
      }
    );
}

isNewUser: boolean = true;
isLoading:boolean = true;
employeeOnboardingFormStatus:string|null=null;
@ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;

async getNewUserAddressDetailsMethodCall(): Promise<boolean> {
  debugger
  return new Promise<boolean>(async (resolve, reject) => { // Notice the `async` here
      const userUuid = new URLSearchParams(window.location.search).get('userUuid');
      const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
      if (userUuid) {
          this.dataService.getNewUserAddressDetails(userUuid).subscribe(
              async (response: UserAddressDetailsRequest) => { // And also notice the `async` here
                  this.isLoading=false;
                  this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
                  this.dataService.markStepAsCompleted(response.statusId);
                  if (response && response.userAddressRequest && response.userAddressRequest.length > 0) {
                      this.userAddressDetailsRequest = response;
                      this.userAddressRequest = response.userAddressRequest;

                      if(adminUuid){
                        await this.getAdminVerifiedForOnboardingUpdateMethodCall(); // This will now work
                      }



                      if(response.employeeOnboardingFormStatus=='USER_REGISTRATION_SUCCESSFUL' && this.employeeOnboardingFormStatus != 'REJECTED' && !this.userAddressDetailsRequest.updateRequest){
                          this.successMessageModalButton.nativeElement.click();
                      }
                      if(response.employeeOnboardingStatus == "PENDING"){
                          this.isNewUser = false;
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
                      this.userAddressDetailsRequest.userAddressRequest=[new UserAddressRequest(), new UserAddressRequest()];
                  }
                  resolve(true);
              },
              (error: any) => {
                  console.error('Error fetching user address details:', error);
                  // reject(error);
              }
          );
      } else {
          console.error('User UUID not found in the URL search parameters');
          // reject(new Error('User UUID not found in the URL search parameters'));
      }
  })
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
  if(type === 'preview'){
    const modalRef = this.modalService.open(PreviewFormComponent, {
      centered: true,
      size: 'lg', backdrop: 'static'
    });
    }
}

directSave: boolean = false;

submit(){
  this.checkFormValidation();

  if(this.isFormInvalid==true){
    return
  } else{
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
  case "update" :{
    debugger
    this.setEmployeeAddressDetailsMethodCall();
    break;
  }
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
    this.userAddressRequest[0].addressLine1=e.formatted_address.toString() ;
    e?.address_components?.forEach((entry: any) => {
      // console.log(entry);

      // if (entry.types?.[0] === "route") {
      //   this.userAddressRequest[0].addressLine2 = entry.long_name + ",";
      // }
      // if (entry.types?.[0] === "sublocality_level_1") {
      //   this.userAddressRequest[0].addressLine2 = this.userAddressRequest[0].addressLine2 + entry.long_name
      // }
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

  @ViewChild("placesRefPermanent") placesRefPermanent! : GooglePlaceDirective;

  public handleAddressChangePermanent(e: any) {
    debugger
    var id=this.userAddressRequest[1].id;
    var addressLine1=this.userAddressRequest[1].addressLine1;
    this.userAddressRequest[1]=new UserAddressRequest();
    this.userAddressRequest[1].id=id;
    this.userAddressRequest[1].addressLine1=e.formatted_address.toString() ;
    e?.address_components?.forEach((entry: any) => {
      // console.log(entry);

      // if (entry.types?.[0] == "route") {
      //   this.userAddressRequest[1].addressLine2 = entry.long_name + ",";
      // }
      // if (entry.types?.[0] == "sublocality_level_1") {
      //   this.userAddressRequest[1].addressLine2 = this.userAddressRequest[1].addressLine2 + entry.long_name
      // }
      if (entry.types?.[0] == "locality") {
        this.userAddressRequest[1].city = entry.long_name
      }
      if (entry.types?.[0] == "administrative_area_level_1") {
        this.userAddressRequest[1].state = entry.long_name
      }
      if (entry.types?.[0] == "country") {
        this.userAddressRequest[1].country = entry.long_name
      }
      if (entry.types?.[0] == "postal_code") {
        this.userAddressRequest[1].pincode = entry.long_name
      }



    });
  }

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
    }

  }

  preventWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }

  }


  isFormInvalid: boolean = false;
  @ViewChild ('addressInformationForm') addressInformationForm !: NgForm
checkFormValidation(){
  if(this.addressInformationForm.invalid){
  this.isFormInvalid = true;
  return
  } else {
    this.isFormInvalid = false;
  }
}

async getAdminVerifiedForOnboardingUpdateMethodCall(): Promise<boolean> {
  debugger
  return new Promise<boolean>((resolve, reject) => {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    if (!userUuid || !adminUuid) {
      console.error('User UUID or Admin UUID not found in the URL.');
      this.userAddressDetailsRequest.updateRequest = false; // Set updateRequest to false due to error
       // Reject the promise if parameters are missing
      return; // Early return to avoid further execution
    }

    this.dataService.getAdminVerifiedForOnboardingUpdate(userUuid, adminUuid).subscribe(
      (isAdminPresent: boolean) => {
        this.userAddressDetailsRequest.updateRequest = isAdminPresent;
        if (isAdminPresent) {
          // console.log('Admin verification successful.');
          this.userAddressDetailsRequest.updateRequest = true;
          resolve(true); // Resolve the promise with true if admin is present
        } else {
          console.error('Admin verification failed.');
          this.userAddressDetailsRequest.updateRequest = false;
          resolve(false); // Resolve the promise with false if admin verification fails
        }
      },
      (error: any) => {
        console.error('Error fetching admin verification status:', error);
        // reject(error); // Reject the promise on error
      }
    );
  });
}


goBackToProfile() {
  let navExtra: NavigationExtras = {
    queryParams: { userId: new URLSearchParams(window.location.search).get('userUuid') },
  };
  // this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], navExtra);
  const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
    return;
}


}
