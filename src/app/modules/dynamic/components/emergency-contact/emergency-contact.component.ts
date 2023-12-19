import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
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
    this.displaySuccessModal = true;
    this.cd.detectChanges();
  }

  userEmergencyContactDetailsStatus = "";

  setEmployeeEmergencyContactDetailsMethodCall() {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    this.dataService.markStepAsCompleted(7);
    if (!userUuid) {
      console.error('User UUID is not available in localStorage.');
      return;
    }

    this.dataService.setEmployeeEmergencyContactDetails(this.userEmergencyContactDetails, userUuid)
      .subscribe(
        (response) => { 
          console.log('Response:', response);
          this.userEmergencyContactDetailsStatus = response.statusResponse;
            // localStorage.setItem('statusResponse', JSON.stringify(this.userEmergencyContactDetailsStatus));
          // this.router.navigate(['/next-route']); // Update the route as needed
        },
        (error) => {
          console.error('Error occurred:', error);
        }
      );
  }

  getEmployeeEmergencyContactsDetailsMethodCall() {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    if (userUuid) {
      this.dataService.getEmployeeContactsDetails(userUuid).subscribe(
        (contacts) => {
          if (contacts && contacts.length > 0) {
          this.userEmergencyContactDetails = contacts;
          this.dataService.markStepAsCompleted(7);
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
}
