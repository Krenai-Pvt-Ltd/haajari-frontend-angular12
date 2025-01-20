import { Injectable } from '@angular/core';
import { OrganizationOnboardingService } from './organization-onboarding.service';
import { Router } from '@angular/router';
import { constant } from '../constant/constant';
import { HelperService } from './helper.service';
import { SubscriptionPlanService } from './subscription-plan.service';
import { RoleBasedAccessControlService } from './role-based-access-control.service';
import { Routes } from '../constant/Routes';
@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  // isOnboardingCompleted: boolean = false;
  isLoadingOnboardingStatus: boolean = true;
  requestedRoute!: string;
  readonly Routes= Routes;
  readonly constant =constant;
  constructor(private onboardingService: OrganizationOnboardingService, private router: Router, private helperService: HelperService, private subscriptionService: SubscriptionPlanService, private rbacService: RoleBasedAccessControlService) {
    const token = localStorage.getItem('token');
    this.requestedRoute = decodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
    if(window.location.pathname==Routes.SIGNUP && constant.EMPTY_STRINGS.includes(token)){
      this.isLoadingOnboardingStatus = false;
  }
   else if(!constant.PUBLIC_ROUTES.includes(window.location.pathname) && !this.Routes.SLACK_AUTH_ROUTES.includes(window.location.pathname)){
    this.checkOnboardingStatus();
    }
    else{
      this.isLoadingOnboardingStatus = false;
    }
  }

  async checkOnboardingStatus(): Promise<void> {
    try {
      const response: any = await this.onboardingService.getOrgOnboardingStep().toPromise();
      if (response.status) {
        this.helperService.orgStepId = response.object.step;

        // to Check subscription plan
        if (this.helperService.orgStepId == +constant.ORG_ONBOARDING_ONBOARDING_COMPLETED_STEP_ID) {
          await this.checkSubscriptionPlan();
          if (this.helperService.restrictedModules == undefined) {
            await this.helperService.getRestrictedModules();
          }
        }

        if ((await this.rbacService.getRole()) != constant.USER) {
          this.switchToRoutes(this.helperService.orgStepId);
        } else {
          this.isLoadingOnboardingStatus = false;
        }
      }
    } catch (error) {
      this.isLoadingOnboardingStatus = false;
      this.router.navigate(['/auth/login']);
    }
  }

  async checkSubscriptionPlan() {
    if (this.subscriptionService.isSubscription == undefined) {
      await this.subscriptionService.isSubscriptionPlanExpired();
    }
  }

  switchToRoutes(orgStepId: number): void {
    this.isLoadingOnboardingStatus = true;
    // for onboarding routes 
    switch (orgStepId + "") {
      case (constant.ORG_ONBOARDING_PERSONAL_INFORMATION_STEP_ID): {
        this.router.navigate([constant.ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE]);
        this.isLoadingOnboardingStatus = false;
        break;
      }
      case (constant.ORG_ONBOARDING_EMPLOYEE_CREATION_STEP_ID): {
        this.router.navigate([constant.ORG_ONBOARDING_EMPLOYEE_CREATION_ROUTE]);
        this.isLoadingOnboardingStatus = false;

        break;
      }
      case (constant.ORG_ONBOARDING_SHIFT_TIME_STEP_ID): {
        this.router.navigate([constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE]);
        this.isLoadingOnboardingStatus = false;
        break;
      }
      case (constant.ORG_ONBOARDING_ATTENDANCE_MODE_STEP_ID): {
        this.router.navigate([constant.ORG_ONBOARDING_ATTENDANCE_MODE_ROUTE]);
        this.isLoadingOnboardingStatus = false;
        break;
      }
      case (constant.ORG_ONBOARDING_ONBOARDING_COMPLETED_STEP_ID): {
        if (this.subscriptionService.isSubscription) {
          if (!constant.ONBOARDING_ROUTES.includes(this.requestedRoute.split("?")[0])) {
            // Parse the requested route into the path and query parameters
            const [path, queryString] = this.requestedRoute.split('?');
            const queryParams = this.parseQueryParams(queryString);
            // Navigate to the route with query parameters
            this.router.navigate([path], { queryParams });

          } else {
            this.router.navigate([constant.DASHBOARD_ROUTE]);
          }
          this.isLoadingOnboardingStatus = false;

        } else {
          // this.subscriptionService.verifySubscriptionAndRoute();
          this.router.navigate([constant.SETTING_SUBSCRIPTION_ROUTE]);
          this.isLoadingOnboardingStatus = false;

        }

        console.log("Step 5 is calling");
        break;
      }
      default: {
        this.isLoadingOnboardingStatus = false;
        this.router.navigate([constant.LOGIN_ROUTE]);
        // console.log("Step default is calling");
        break;
      }
    }
  }

  private parseQueryParams(queryString: string): { [key: string]: any } {
    if (!queryString) return {};
    return queryString.split('&').reduce((acc: any, param) => {
      const [key, value] = param.split('=');
      acc[key] = decodeURIComponent(value || '');
      return acc;
    }, {});
  }
}
