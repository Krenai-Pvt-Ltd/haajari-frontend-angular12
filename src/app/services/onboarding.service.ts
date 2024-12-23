import { Injectable } from '@angular/core';
import { OrganizationOnboardingService } from './organization-onboarding.service';
import { Router } from '@angular/router';
import { constant } from '../constant/constant';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  // isOnboardingCompleted: boolean = false;
  isLoadingOnboardingStatus: boolean = true;
  constructor(private onboardingService : OrganizationOnboardingService, private router: Router, private helperService: HelperService) {
    this.onboardingService
      .getOrgOnboardingStep()
      .subscribe((response: any) => {
        
        console.log("response" , response)
        if (response.status) {
          this.helperService.stepId = response.object.step;
         
          console.log("stepId1", this.helperService.stepId);

          // if(this.helperService.stepId === 5){
          //   this.isOnboardingCompleted = true;
          // }else {
          //   this.isOnboardingCompleted = false;
          // }

         this.switchToRoutes(this.helperService.stepId);
          
        }
      },
      (error) => {
        this.isLoadingOnboardingStatus=false;
        this.router.navigate(['/auth/login']);
      });
  }

  switchToRoutes(stepId: number): void {
    // for onboarding routes 
    console.log("stepId2", stepId);
    switch (stepId+"") {
      case (constant.ORG_ONBOARDING_PERSONAL_INFORMATION_STEP_ID): {
        this.router.navigate(['/organization-onboarding/personal-information']);
        this.isLoadingOnboardingStatus=false;

        // console.log("Step 1 is calling");
        break;
      }
      case (constant.ORG_ONBOARDING_EMPLOYEE_CREATION_STEP_ID): {
        console.log("Step 2 is calling");

        this.router.navigate(['/organization-onboarding/upload-team']);
        this.isLoadingOnboardingStatus=false;

        break;
      }
      case (constant.ORG_ONBOARDING_SHIFT_TIME_STEP_ID): {
        this.router.navigate(['/organization-onboarding/shift-time-list']);
        this.isLoadingOnboardingStatus=false;

        // console.log("Step 3 is calling");
        break;
      }
      case (constant.ORG_ONBOARDING_ATTENDANCE_MODE_STEP_ID): {
        this.router.navigate(['/organization-onboarding/attendance-mode']);
        this.isLoadingOnboardingStatus=false;

        // console.log("Step 4 is calling");
        break;
      }
      case (constant.ORG_ONBOARDING_ONBOARDING_COMPLETED_STEP_ID): {
         this.router.navigate(['/dashboard']);
         this.isLoadingOnboardingStatus=false;

        console.log("Step 5 is calling");
        break;
      }
      default: {
        this.isLoadingOnboardingStatus=false;
        this.router.navigate(['/auth/login']);
        // console.log("Step default is calling");
        break;
      }
    }
  }
}
