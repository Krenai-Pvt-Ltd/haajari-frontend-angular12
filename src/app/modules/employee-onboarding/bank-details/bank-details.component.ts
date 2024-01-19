import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
          this.successMessageModalButton.nativeElement.click();
          
          this.routeToFormPreview();
        }
        this.handleOnboardingStatus(response.employeeOnboardingStatus);
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
  isLoading:boolean = true;
  employeeOnboardingFormStatus:string|null=null;
@ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;
  getEmployeeBankDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  
    if (userUuid) {
      this.dataService.getEmployeeBankDetails(userUuid).subscribe(
        (response: UserBankDetailRequest) => {
          this.dataService.markStepAsCompleted(response.statusId);
          if(response!=null){
            this.userBankDetailRequest = response;
            
          }
          this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
          if(response.employeeOnboardingFormStatus=='USER_REGISTRATION_SUCCESSFUL'){
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
}
