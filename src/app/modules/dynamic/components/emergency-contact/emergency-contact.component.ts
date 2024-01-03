import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debug } from 'console';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-emergency-contact',
  templateUrl: './emergency-contact.component.html',
  styleUrls: ['./emergency-contact.component.css']
})
export class EmergencyContactComponent implements OnInit {
  userEmergencyContactDetails: UserEmergencyContactDetailsRequest[] = [];

  constructor(private dataService: DataService, private router: Router, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    // this.addEmergencyContact();
    this.getEmployeeEmergencyContactsDetailsMethodCall();
  }

  backRedirectUrl() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/bank-details'], navExtra);
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

  userEmergencyContactDetailsStatus = "";

  toggle = false;
  setEmployeeEmergencyContactDetailsMethodCall() {
    debugger
    this.allowEdit = false;
    this.toggle = true;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    this.dataService.markStepAsCompleted(7);
    if (!userUuid) {
      console.error('User UUID is not available in localStorage.');
      return;
    }

    this.dataService.setEmployeeEmergencyContactDetails(this.userEmergencyContactDetails, userUuid)
      .subscribe(
        (response: UserEmergencyContactDetailsRequest) => { 
          console.log('Response:', response);
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

  getEmployeeEmergencyContactsDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    if (userUuid) {
      this.dataService.getEmployeeContactsDetails(userUuid).subscribe(
        (contacts) => {
          console.log(contacts);
          if (contacts && contacts.length > 0) {
          this.userEmergencyContactDetails = contacts;
          this.dataService.markStepAsCompleted(7);
          this.handleOnboardingStatus(contacts[0].employeeOnboardingStatus);
          if(contacts[0].employeeOnboardingFormStatus==='USER_REGISTRATION_SUCCESSFUL'){
            this.displaySuccessModal = true;
          }
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
      case 'APPROVED' :
      case 'REJECTED':
        this.allowEdit = true;
        break;
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

}
