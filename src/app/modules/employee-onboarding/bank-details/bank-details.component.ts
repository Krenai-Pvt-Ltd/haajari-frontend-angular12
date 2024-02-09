import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
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
    this.router.navigate(['/employee-onboarding/employee-experience'], navExtra);
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-onboarding/emergency-contact'], navExtra);
  }

  userBankDetailsStatus = "";
  toggle = false;
  toggleSave = false;
  setEmployeeBankDetailsMethodCall() {
    if(this.buttonType=='next'){
      this.toggle = true;
    } else if (this.buttonType=='save'){
      this.toggleSave = true;
    }
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    
    this.dataService.setEmployeeBankDetails(this.userBankDetailRequest, userUuid)
      .subscribe(
        (response: UserBankDetailRequest) => {
          console.log(response);  
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
  getEmployeeBankDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  
    if (userUuid) {
      this.dataService.getEmployeeBankDetails(userUuid).subscribe(
        (response: UserBankDetailRequest) => {
          this.filteredBanks = this.banksInIndia;
          this.dataService.markStepAsCompleted(response.statusId);
          if(response!=null){
            this.userBankDetailRequest = response;
            
          }
          this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
          if(response.employeeOnboardingStatus == "PENDING"){
            this.isNewUser = false;
          }
          if(response.employeeOnboardingFormStatus=='USER_REGISTRATION_SUCCESSFUL' && this.employeeOnboardingFormStatus != 'REJECTED'){
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
  } 

  @ViewChild("formSubmitButton") formSubmitButton!:ElementRef;

buttonType:string="next"
selectButtonType(type:string){
  debugger
  this.buttonType=type;
  this.userBankDetailRequest.directSave = false;
  this.formSubmitButton.nativeElement.click();
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
    break;
  }
  case "save" :{
    debugger
    this.userBankDetailRequest.directSave = true;
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
    
}
