import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { UserBankDetailRequest } from 'src/app/models/user-bank-detail-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PreviewFormComponent } from '../preview-form/preview-form.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.css']
})
export class BankDetailsComponent implements OnInit {
  userBankDetailRequest: UserBankDetailRequest = new UserBankDetailRequest();

  constructor(public dataService: DataService, private router: Router,
    private helperService: HelperService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getEmployeeBankDetailsMethodCall();
  }
  backRedirectUrl(){
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');

    // Initialize an empty object for queryParams
    let queryParams: any = {};

    // Add userUuid to queryParams if it exists
    if (userUuid) {
      queryParams['userUuid'] = userUuid;
    }

    // Conditionally add adminUuid to queryParams if updateRequest is true
    if (this.userBankDetailRequest.updateRequest) {
      const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
      if (adminUuid) {
        queryParams['adminUuid'] = adminUuid;
      }
    }

    // Create NavigationExtras object with the queryParams
    let navExtra: NavigationExtras = { queryParams };
    if(this.dataService.isRoutePresent('/employee-experience')){
      this.router.navigate(
        ['/employee-onboarding/employee-experience'],
        navExtra
      );
  } else if(this.dataService.isRoutePresent('/acadmic')){
      this.router.navigate(
        ['/employee-onboarding/acadmic'],
        navExtra
      );
  } else if(this.dataService.isRoutePresent('/employee-document')){
      this.router.navigate(
        ['/employee-onboarding/employee-document'],
        navExtra
      );
  } else if(this.dataService.isRoutePresent('/employee-address-detail')){
        this.router.navigate(
          ['/employee-onboarding/employee-address-detail'],
          navExtra
        );
  }else {
    this.router.navigate(
      ['/employee-onboarding/employee-onboarding-form'],
      navExtra
    );
  }
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    if(this.dataService.isRoutePresent('/emergency-contact')){
      this.router.navigate(['/employee-onboarding/emergency-contact'], navExtra);
    }
  }

  userBankDetailsStatus = "";
  toggle = false;
  toggleSave = false;
  setEmployeeBankDetailsMethodCall() {
    if(this.buttonType=='next'){
      this.toggle = true;
      this.userBankDetailRequest.updateRequest = false;
    } else if (this.buttonType=='save'){
      this.toggleSave = true;
      this.userBankDetailRequest.updateRequest = false;
    } else if (this.buttonType=='update'){
      this.toggle = true;
      this.userBankDetailRequest.updateRequest = true;
    }
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';

    this.dataService.setEmployeeBankDetails(this.userBankDetailRequest, userUuid)
      .subscribe(
        (response: UserBankDetailRequest) => {
          // console.log(response);
          this.dataService.markStepAsCompleted(response.statusId);
          this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;

        if(this.buttonType=='next'){
          this.routeToUserDetails();
        } else if (this.buttonType=='save'){
          this.handleOnboardingStatus(response.employeeOnboardingStatus);
          if(this.employeeOnboardingFormStatus!='REJECTED'){
            this.successMessageModalButton.nativeElement.click();
          }
          setTimeout(() => {

            this.routeToFormPreview();
          }, 2000);
        } else if(this.buttonType=='update'){
          this.helperService.showToast("Information Updated Successfully", Key.TOAST_STATUS_SUCCESS);
        }

          this.userBankDetailsStatus = response.statusResponse;
          this.toggle = false;
          // localStorage.setItem('statusResponse', JSON.stringify(this.userBankDetailsStatus));
          // this.router.navigate(['/emergency-contact']);
        },
        (error) => {
          console.error(error);
          this.toggle = false;
        }
      );
  }

  isNewUser: boolean = true;
  isLoading:boolean = true;
  employeeOnboardingFormStatus:string|null=null;
@ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;
async getEmployeeBankDetailsMethodCall() {
    debugger
    return new Promise<boolean>(async (resolve, reject) => {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    if (userUuid) {
      this.dataService.getEmployeeBankDetails(userUuid).subscribe(
        async (response: UserBankDetailRequest) => {
          this.filteredBanks = this.banksInIndia;
          this.dataService.markStepAsCompleted(response.statusId);
          if(response!=null){
            this.userBankDetailRequest = response;

          }
          this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
          if(response.employeeOnboardingStatus == "PENDING"){
            this.isNewUser = false;
          }
          if(adminUuid){
            await this.getAdminVerifiedForOnboardingUpdateMethodCall();
          }
          if(response.employeeOnboardingFormStatus=='USER_REGISTRATION_SUCCESSFUL' && this.employeeOnboardingFormStatus != 'REJECTED' && !this.userBankDetailRequest.updateRequest){
            this.successMessageModalButton.nativeElement.click();
          }
          this.handleOnboardingStatus(response.employeeOnboardingStatus);


          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error fetching user details:', error);

        }
      );
    } else {
      console.error('uuidNewUser not found in localStorage');

    }
  })
  }

  @ViewChild("formSubmitButton") formSubmitButton!:ElementRef;

buttonType:string="next"
selectButtonType(type:string){
  debugger
  this.buttonType=type;
  this.userBankDetailRequest.directSave = false;
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
  debugger
  this.checkFormValidation();

  if(this.isFormInvalid==true){
    return
  } else{
switch(this.buttonType){
  case "next" :{
    this.setEmployeeBankDetailsMethodCall();
    this.userBankDetailRequest.directSave = false;
    this.userBankDetailRequest.updateRequest = false;
    break;
  }
  case "save" :{
    debugger
    this.userBankDetailRequest.directSave = true;
    this.userBankDetailRequest.updateRequest = false;
    this.setEmployeeBankDetailsMethodCall();
    break;
  }
  case "update" :{
    debugger
    this.userBankDetailRequest.directSave = false;
    this.userBankDetailRequest.updateRequest = true;
    this.setEmployeeBankDetailsMethodCall();
    break;
  }
}
  }
}

isFormInvalid: boolean = false;
@ViewChild ('bankInformationForm') bankInformationForm !: NgForm
checkFormValidation(){
if(this.bankInformationForm.invalid){
this.isFormInvalid = true;
return
} else {
  this.isFormInvalid = false;
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

    preventLeadingWhitespace(event: KeyboardEvent): void {
      const input = event.target as HTMLInputElement;
      // Prevent leading spaces
      if (event.key === ' ' && input.selectionStart === 0) {
          event.preventDefault();
      }
      // Prevent numeric input entirely
      if (!isNaN(Number(event.key)) && event.key !== ' ') {
        event.preventDefault();
      }
    }

    preventWhitespace(event: KeyboardEvent): void {
      const input = event.target as HTMLInputElement;
      // Prevent leading spaces
      if (event.key === ' ' && input.selectionStart === 0) {
          event.preventDefault();
      }
    }

    onChange(value: string): void {
      this.filteredBanks = this.banksInIndia.filter(bank => bank.toLowerCase().includes(value.toLowerCase()));
    }

    filteredBanks: string[] = [];
    banksInIndia: string[] = [
      'Allahabad Bank',
      'Andhra Bank',
      'Axis Bank',
      'Bank of Bahrain and Kuwait',
      'Bank of Baroda - Corporate Banking (BOB)',
      'Bank of Baroda - Retail Banking (BOB)',
      'Bank of India (BOI)',
      'Bank of Maharashtra',
      'Canara Bank',
      'Central Bank of India',
      'City Union Bank',
      'Corporation Bank',
      'Deutsche Bank',
      'Development Credit Bank',
      'Dhanlaxmi Bank',
      'Federal Bank',
      'HDFC Bank',
      'ICICI Bank',
      'IDBI Bank',
      'Indian Bank',
      'Indian Overseas Bank',
      'IndusInd Bank',
      'ING Vysya Bank',
      'Jammu and Kashmir Bank',
      'Karnataka Bank Ltd',
      'Karur Vysya Bank',
      'Kotak Bank',
      'Laxmi Vilas Bank',
      'Oriental Bank of Commerce',
      'Punjab National Bank - Corporate Banking',
      'Punjab National Bank - Retail Banking',
      'Punjab & Sind Bank',
      'SBM Bank (India) Ltd.',
      'Shamrao Vitthal Co-operative Bank',
      'South Indian Bank',
      'State Bank of Bikaner & Jaipur (SBBJ)',
      'State Bank of Hyderabad (SBH)',
      'State Bank of India (SBI)',
      'State Bank of Mysore (SBM)',
      'State Bank of Patiala (SBP)',
      'State Bank of Travancore (SBT)',
      'Syndicate Bank',
      'Tamilnad Mercantile Bank Ltd.',
      'UCO Bank',
      'Union Bank of India',
      'United Bank of India',
      'Vijaya Bank',
      'Yes Bank Ltd'
    ];

    getAdminVerifiedForOnboardingUpdateMethodCall(): Promise<boolean> {
      debugger;
      return new Promise<boolean>((resolve, reject) => {
        const userUuid = new URLSearchParams(window.location.search).get('userUuid');
        const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
        if (userUuid && adminUuid) {
          this.dataService.getAdminVerifiedForOnboardingUpdate(userUuid, adminUuid).subscribe(
            (isAdminPresent: boolean) => {
              this.userBankDetailRequest.updateRequest = isAdminPresent;
              // console.log('Admin verification successful.');
              resolve(isAdminPresent); // Resolve the promise with the result
            },
            (error: any) => {
              console.error('Error fetching admin verification status:', error);
              // reject(error); // Reject the promise on error
            }
          );
        } else {
          console.error('User UUID or Admin UUID not found in the URL.');
          // reject(new Error('User UUID or Admin UUID not found in the URL.')); // Reject the promise if parameters are missing
        }
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
