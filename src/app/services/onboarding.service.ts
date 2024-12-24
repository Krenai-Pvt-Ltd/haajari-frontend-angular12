import { Injectable } from '@angular/core';
import { OrganizationOnboardingService } from './organization-onboarding.service';
import { Router } from '@angular/router';
import { constant } from '../constant/constant';
import { HelperService } from './helper.service';
import { SubscriptionPlanService } from './subscription-plan.service';
import { RoleBasedAccessControlService } from './role-based-access-control.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  // isOnboardingCompleted: boolean = false;
  isLoadingOnboardingStatus: boolean = true;
  constructor(private onboardingService : OrganizationOnboardingService, private router: Router, private helperService: HelperService, private subscriptionService: SubscriptionPlanService, private rbacService : RoleBasedAccessControlService) {
    this.checkOnboardingStatus();
     
  }

  async checkOnboardingStatus(){
    this.onboardingService
      .getOrgOnboardingStep()
      .subscribe(async (response: any) => {
        
        console.log("response" , response)
        if (response.status) {
          this.helperService.orgStepId = response.object.step;
          console.log("stepId1", this.helperService.orgStepId);

           // to Check subscription plan
          if(this.helperService.orgStepId == +constant.ORG_ONBOARDING_ONBOARDING_COMPLETED_STEP_ID) {
            console.log("stepId1check", this.helperService.orgStepId);
            await this.checkSubscriptionPlan();
            if(this.helperService.restrictedModules == undefined){
              await this.helperService.getRestrictedModules();
            }
          }
          
          this.switchToRoutes(this.helperService.orgStepId);
          
        }
      },
      (error) => {
        this.isLoadingOnboardingStatus=false;
        this.router.navigate(['/auth/login']);
      });

  }

  async checkSubscriptionPlan(){
    if(this.subscriptionService.isSubscription==undefined){
      await this.subscriptionService.isSubscriptionPlanExpired();
    }
    console.log("=====isSubscription======",this.subscriptionService.isSubscription);
  }

  switchToRoutes(orgStepId: number): void {
    this.isLoadingOnboardingStatus=true;
    // for onboarding routes 
    console.log("stepId2", orgStepId);
    switch (orgStepId+"") {
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
        // window.alert("Onboarding Completed" + this.helperService.orgStepId +"9999" +this.isLoadingOnboardingStatus);
        if(this.subscriptionService.isSubscription){
          this.router.navigate(['/dashboard']);
          this.isLoadingOnboardingStatus=false;

        }else{
          // this.subscriptionService.verifySubscriptionAndRoute();
          this.router.navigate( ['/setting/subscription']);
          this.isLoadingOnboardingStatus=false;

        }

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
