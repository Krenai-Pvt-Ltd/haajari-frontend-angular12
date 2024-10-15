import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { OnboardingSidebarResponse } from 'src/app/models/onboarding-sidebar-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-employee-onboarding-sidebar',
  templateUrl: './employee-onboarding-sidebar.component.html',
  styleUrls: ['./employee-onboarding-sidebar.component.css']
})
export class EmployeeOnboardingSidebarComponent implements OnInit {

  stepsCompletionStatus: boolean[] = [];
  routes: string[] =[];
  private userUuid: string | null = null;
  constructor(private router: Router, private stepService: DataService, private helperService: HelperService) { }

  ngOnInit(): void {
    this.getAdminVerifiedForOnboardingUpdateMethodCall();
 this.getEmployeeStatusMethodCall();
 this.userUuid = new URLSearchParams(window.location.search).get('userUuid') || null;
    this.loadRoutes();


  }
  // getEmployeeStatusMethodCall() {
  //   throw new Error('Method not implemented.');
  // }

  navigateTo(route: string, stepIndex: number): void {
    debugger;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    this.helperService.markAsVisited();
    let adminUuid: any;
    if(new URLSearchParams(window.location.search).get('adminUuid')){
     adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    }

    if (this.stepService.stepIndex < (stepIndex - 1) && this.onboardingStatus !== "REJECTED" ) {
      // Logic for other conditions if necessary
    } else {

      let queryParams: any = {};
    if (userUuid) {
      queryParams['userUuid'] = userUuid;
    }

    // Conditionally add adminUuid to queryParams if isAdminPresent is true
    if (this.isAdminPresent && adminUuid) {
      queryParams['adminUuid'] = adminUuid;
    }

    // Assign the queryParams to navExtra
    let navExtra: NavigationExtras = { queryParams };
      this.router.navigate([route], navExtra);
    }
  }



  ind:number=-1;
  isStepCompleted(stepIndex: number): boolean {

    // for(var i=0;i<=6;i++){
    //   if(this.stepsCompletionStatus[i]==true){
    //     this.ind=i;
    //     break;
    //   }
    // }
    // for(var i=0;i<=this.ind;i++){
    //   this.stepsCompletionStatus[i]=true;
    // }
    // if((stepIndex)<=this.ind){
    //   return true;
    // }else{
    // return false;
    // }
    if(stepIndex<=this.stepService.stepIndex){
      return true;
    }else{
      return false;
    }

  }

onboardingStatus: string = ""
getEmployeeStatusMethodCall() {
  debugger
  const userUuid = new URLSearchParams(window.location.search).get('userUuid') || null ;
  if(userUuid){
    this.stepService.getEmployeeStatus(userUuid).subscribe(
      (response: OnboardingSidebarResponse) => {
        this.onboardingStatus = response.onboardingStatus;
      },
      (error: any) => {
        console.error('Error fetching user details:', error);

      }
    );
  }else {
    console.error('uuidNewUser not found in localStorage');

  }
}

  isAdminPresent : Boolean = false;
  getAdminVerifiedForOnboardingUpdateMethodCall() {
    debugger;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    if (userUuid && adminUuid) {
      this.stepService.getAdminVerifiedForOnboardingUpdate(userUuid, adminUuid).subscribe(
        (isAdminPresent: boolean) => {
          if (isAdminPresent) {
            this.isAdminPresent = isAdminPresent;
            // console.log('Admin verification successful. ' + this.isAdminPresent);
          } else {
            this.isAdminPresent = isAdminPresent;
            console.error('Admin verification failed.');
          }
        },
        (error: any) => {
          console.error('Error fetching admin verification status:', error);
        }
      );
    } else {
      this.isAdminPresent = false;
      console.error('User UUID or Admin UUID not found in the URL.');
    }
  }

  private loadRoutes(): void {
    this.stepService.getRoutesByOrganization(this.userUuid).subscribe(
      (routes: string[]) => {
        this.routes = routes;
        this.stepService.onboardingRoutes=routes;
        console.log('Loaded routes:', this.routes);
      },
      error => {
        console.error('Error fetching routes', error);
      }
    );
  }

  isRoutePresent(routeToCheck: string): boolean {
    const isPresent = this.routes.includes(routeToCheck);
    console.log(`Is route present: ${isPresent}`);
    return isPresent;
  }
  findRouteIndex( searchString: string): number {
    return this.routes.indexOf(searchString)+1;
  }
  


}

