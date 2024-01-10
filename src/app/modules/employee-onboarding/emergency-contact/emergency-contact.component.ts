import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { DataService } from 'src/app/services/data.service';
declare var bootstrap: any;
@Component({
  selector: 'app-emergency-contact',
  templateUrl: './emergency-contact.component.html',
  styleUrls: ['./emergency-contact.component.css']
})
export class EmergencyContactComponent implements OnInit {
  userEmergencyContactDetails: UserEmergencyContactDetailsRequest[] = [];

  constructor(private dataService: DataService, private router: Router, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {

    this.getEmployeeEmergencyContactsDetailsMethodCall();
  }
@ViewChild("dismissSuccessModalButton") dismissSuccessModalButton!:ElementRef;

  routeToFormPreview() {
debugger
    this.dismissSuccessModalButton.nativeElement.click();
    setTimeout(x=>{
      let navExtra: NavigationExtras = {
        queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
      };
      this.router.navigate(['/employee-onboarding/employee-onboarding-preview'], navExtra);
    },2000);
  
  
  
  }

  backRedirectUrl() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-onboarding/bank-details'], navExtra);
  }

  deleteEmergencyContact(index: number) {
    this.userEmergencyContactDetails.splice(index, 1);
  }
  addEmergencyContact(): void {
    this.userEmergencyContactDetails.push(new UserEmergencyContactDetailsRequest()); 
  }
  displaySuccessModal = false;
  
  showSuccess() {
    debugger
    this.setEmployeeEmergencyContactDetailsMethodCall();
    this.displaySuccessModal = true;
    this.cd.detectChanges();
    // setTimeout(() => this.displaySuccessModal = false, 3000);
   
  }


  toggle = false;
  @ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;
  setEmployeeEmergencyContactDetailsMethodCall() {
    debugger
    this.allowEdit = false;
    this.toggle = true;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    
    if (!userUuid) {
      console.error('User UUID is not available in localStorage.');
      return;
    }

    this.dataService.setEmployeeEmergencyContactDetails(this.userEmergencyContactDetails, userUuid)
      .subscribe(
        (response: UserEmergencyContactDetailsRequest) => { 
          console.log('Response:', response);
          this.dataService.markStepAsCompleted(response.statusId);
          
             response.employeeOnboardingStatus;
            if(response.employeeOnboardingFormStatus == 'USER_REGISTRATION_SUCCESSFUL' ){
              this.employeeOnboardingFormStatus=response.employeeOnboardingStatus;
              this.successMessageModalButton.nativeElement.click();
            }
            setTimeout(()=>{
              this.routeToFormPreview();
            },500);
          
         
          this.toggle = false;
          // this.userEmergencyContactDetailsStatus = response.statusResponse;
          
          this.handleOnboardingStatus(response.employeeOnboardingStatus);
            // localStorage.setItem('statusResponse', JSON.stringify(this.userEmergencyContactDetailsStatus));
          // this.router.navigate(['/next-route']); // Update the route as needed
        },
        (error) => {
          console.error('Error occurred:', error);
          this.toggle = false;
        }
      );
  }

delete(index:number){
  if(this.userEmergencyContactDetails.length==1){
 return
  }
  this.userEmergencyContactDetails.splice(index,1);
}
  isLoading:boolean = true;
  employeeOnboardingFormStatus:string|null=null;
  getEmployeeEmergencyContactsDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    if (userUuid) {
      this.dataService.getEmployeeContactsDetails(userUuid).subscribe(
        (contacts) => {
          console.log(contacts);
          this.dataService.markStepAsCompleted(contacts[0].statusId);
          this.isLoading = false;
          if (contacts[0].contactName && contacts.length > 0) {
          this.userEmergencyContactDetails = contacts;
         
            this.employeeOnboardingFormStatus=this.userEmergencyContactDetails[0].employeeOnboardingStatus;
            if(contacts[0].employeeOnboardingFormStatus=='USER_REGISTRATION_SUCCESSFUL'){
              this.successMessageModalButton.nativeElement.click();
          }
            
          this.handleOnboardingStatus(contacts[0].employeeOnboardingStatus);
        
        } else {
          this.addEmergencyContact();
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

  // displayModal = false;
  allowEdit = false;

  handleOnboardingStatus(response: string) {
    this.displaySuccessModal = true;
    switch (response) {
      
      case 'REJECTED':
        this.allowEdit = true;
        break;
      case 'APPROVED' :
      case 'PENDING':
        this.allowEdit = false;
        break;
      default:
        this.displaySuccessModal = false;
        break;
    }
  }

  closeAndEdit() {
    this.displaySuccessModal = false;
    // Logic to enable form editing
  }

  closeModal() {
    this.displaySuccessModal = false;
    // Additional logic if needed when modal is closed without editing
  }

  @ViewChild("confirmationModalButton") confirmationModalButton!:ElementRef;
  
  
  openModal() {
    this.confirmationModalButton.nativeElement.click();
  }
}
