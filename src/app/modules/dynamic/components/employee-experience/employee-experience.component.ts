import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { UserExperienceDetailRequest } from 'src/app/models/user-experience-detail-request';
import { DataService } from 'src/app/services/data.service';
import { UserExperience } from 'src/app/models/user-experience';

@Component({
  selector: 'app-employee-experience',
  templateUrl: './employee-experience.component.html',
  styleUrls: ['./employee-experience.component.css']
})
export class EmployeeExperienceComponent implements OnInit {
  userExperienceDetailRequest: UserExperienceDetailRequest = new UserExperienceDetailRequest();
  userExperiences: UserExperience[] = []; // Array to hold user experiences

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    const userUuid = this.getUserUuid();
    if (userUuid) {
      this.getEmployeeExperiencesDetailsMethodCall(userUuid);
    } else {
      this.addExperience();
    }
  }

  getUserUuid(): string | null {
    return new URLSearchParams(window.location.search).get('userUuid') || localStorage.getItem('uuidNewUser');
  }

  backRedirectUrl() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: this.getUserUuid() },
    };
    this.router.navigate(['/acadmic'], navExtra);
  }

  deleteExperience(index: number): void {
    if(this.userExperiences.length == 1){
      return
    }
    this.userExperiences.splice(index, 1);
  }

  // @ViewChild("experienceTab") experienceTab!: ElementRef;

  addExperience(): void {
    this.userExperiences.push(new UserExperience()); 
    // this.experienceTab.nativeElement.click();

  }

  addMoreExperience() {
    const newExperience: UserExperience = {
        companyName: '',
        employementDuration: '',
        lastJobDepartment: '',
        lastSalary: '',
        lastJobPosition: '',
        jobResponisibilities: '',
        fresher: false // or true, depending on your logic
    };
    this.userExperiences.push(newExperience);
}

  
  
  prepareUserExperienceDetailRequest(): UserExperience[] {
    return this.userExperiences;
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: this.getUserUuid() },
    };
    this.router.navigate(['/bank-details'], navExtra);
  }



  toggle = false;
  setEmployeeExperienceDetailsMethodCall() {
    debugger
    const userUuid = this.getUserUuid();
    if (!userUuid) {
      console.error('User UUID is not available.');
      return;
    }
    this.toggle = true;
    this.dataService.setEmployeeExperienceDetails(this.userExperiences, userUuid)
      .subscribe(
        response => { 
          console.log('Response:', response);
          this.dataService.markStepAsCompleted(5);
          this.routeToUserDetails();
          this.toggle = false;
        },
        error => {
          console.error('Error occurred:', error);
          this.toggle = false;
        }
      );
  }

  isLoading: boolean = true; 

  getEmployeeExperiencesDetailsMethodCall(userUuid: string) {
    debugger
    this.isLoading = true;
    this.dataService.getEmployeeExperiencesDetailsOnboarding(userUuid).subscribe(
      experiences => {
        if (experiences && experiences.length > 0) {
          this.isFresher= 
          this.isLoading = false;
          this.isFresher=false;
          this.userExperiences = experiences;
          
          this.dataService.markStepAsCompleted(5);
        } else {
          this.isLoading = false;
          this.addExperience(); // Call addExperience if experiences is null or empty
        }
      },
      error => {
        this.isLoading = false;
        console.error('Error fetching user details:', error);
        this.addExperience();
      }
    );
  }



  isFresher:boolean=true;
}