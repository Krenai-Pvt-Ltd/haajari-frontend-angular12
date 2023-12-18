  import { Component, OnInit } from '@angular/core';
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
      const userUuid = localStorage.getItem('uuidNewUser');
    
      if (userUuid) {
        this.getEmployeeExperiencesDetailsMethodCall();
      } else {
        this.addExperience();
      }
    }
    
    backRedirectUrl(){
      let navExtra: NavigationExtras = {
        queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
      };
      this.router.navigate(['/acadmic'], navExtra);
    }

    deleteExperience(index: number): void {
      this.userExperiences.splice(index, 1);
  }

    addExperience(): void {
      this.userExperiences.push(new UserExperience()); 
    }
  // prepareUserExperienceDetailRequest(): UserExperienceDetailRequest[] {
  //   let request = new UserExperienceDetailRequest();
  //   request.experiences = this.userExperiences;
  //   var list: UserExperienceDetailRequest[] = [request];
  //   return list;
  // }
  prepareUserExperienceDetailRequest(): UserExperience[] {
    return this.userExperiences;
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/bank-details'], navExtra);
  }

  //   setEmployeeExperienceDetailsMethodCall() {
  //     let userUuid = localStorage.getItem('uuidNewUser') || '';
    
  //     if (!userUuid) {
  //       console.error('User UUID is not available in localStorage.');
  //       return;
  //     }

  //     let userExperienceDetailRequest = this.prepareUserExperienceDetailRequest();

  //     this.dataService.setEmployeeExperienceDetails(userExperienceDetailRequest, userUuid)
  //       .subscribe(
  //         (response) => { 
  //           console.log('Response:', response);
  //           this.router.navigate(['/bank-details']);
  //         },
  //         (error) => {
  //           console.error('Error occurred:', error);
  //         }
  //       );
  // }
  setEmployeeExperienceDetailsMethodCall() {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    this.dataService.markStepAsCompleted(4);
    if (!userUuid) {
      console.error('User UUID is not available in localStorage.');
      return;
    }

    this.dataService.setEmployeeExperienceDetails(this.userExperiences, userUuid)
        .subscribe(
            (response) => { 
                console.log('Response:', response);
                // this.router.navigate(['/bank-details']);
            },
            (error) => {
                console.error('Error occurred:', error);
            }
        );
  }



    getEmployeeExperiencesDetailsMethodCall() {
      debugger
      const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    
      if (userUuid) {
        this.dataService.getEmployeeExperiencesDetailsOnboarding(userUuid).subscribe(
          (experiences) => {
            if (experiences && experiences.length > 0) {
              this.userExperiences = experiences;
              this.dataService.markStepAsCompleted(4);
            } else {
              this.addExperience(); // Call addExperience if experiences is null or empty
            }
          },
          (error: any) => {
            console.error('Error fetching user details:', error);
            this.addExperience();
          }
        );
      } else {
        console.error('uuidNewUser not found in localStorage');
        
      }
    } 
  }
