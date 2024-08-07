import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Key } from 'src/app/constant/key';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private rbacService: RoleBasedAccessControlService,
    private _subscriptionPlanService: SubscriptionPlanService
  ) {
    this.PLAN_PURCHASED = _subscriptionPlanService
  }

  UUID: any;
  ROLE: any;
  ONBOARDING_STEP: any;
  PLAN_PURCHASED: any;
  async ngOnInit(): Promise<void> {
    this.UUID = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    this.PLAN_PURCHASED = 
    this.ONBOARDING_STEP = await this.rbacService.getOnboardingStep();
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!(await this.isValidTokenFormat(token))) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // if (this.isOrganizationOnboarded(this.ONBOARDING_STEP)) {
    //   console.log(this.ONBOARDING_STEP);
    //   this.router.navigate(['/dashboard']);
    // } else {
    //   console.log(this.ONBOARDING_STEP);
    //   this.router.navigate(['/organization-onboarding/personal-information']);
    // }

    await this.rbacService.isUserInfoInitializedMethod();

    if (route !== null && route.routeConfig !== null) {
      if (
        (await this.rbacService.getRole()) == Key.USER &&
        route.routeConfig.path == 'dashboard'
      ) {
        this.router.navigate(['/employee-profile'], {
          queryParams: {
            userId: await this.rbacService.getUUID(),
            dashboardActive: 'true',
          },
        });
        return false;
      }

      const requiredSubmodule = '/' + route.routeConfig.path;
      if (
        requiredSubmodule &&
        !(await this.rbacService.hasAccessToSubmodule(requiredSubmodule))
      ) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }

  // async canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot,
  // ): Promise<boolean> {
  //   const token = localStorage.getItem('token');
  //   if (!(await this.isValidTokenFormat(token))) {
  //     this.router.navigate(['/auth/login']);
  //     return false;
  //   }
  
  //   await this.rbacService.isUserInfoInitializedMethod();
  
  //   if (route !== null && route.routeConfig !== null) {
  //     const role = await this.rbacService.getRole();
  
  //     if (role === Key.ADMIN) {
  //       // Check if the admin has purchased a plan
  //       const planPurchased = await this.isPlanPurchased();
  //       if (!planPurchased) {
  //         this.router.navigate(['/billing-and-subscription']);
  //         return false;
  //       } else {
  //         this.router.navigate(['/dashboard']);
  //         return false;
  //       }
  //     }
  
  //     if (role === Key.USER && route.routeConfig.path === 'dashboard') {
  //       this.router.navigate(['/employee-profile'], {
  //         queryParams: {
  //           userId: await this.rbacService.getUUID(),
  //           dashboardActive: 'true',
  //         },
  //       });
  //       return false;
  //     }
  
  //     const requiredSubmodule = '/' + route.routeConfig.path;
  //     if (
  //       requiredSubmodule &&
  //       !(await this.rbacService.hasAccessToSubmodule(requiredSubmodule))
  //     ) {
  //       this.router.navigate(['/unauthorized']);
  //       return false;
  //     }
  //   }
  
  //   return true;
  // }
  

  async isValidTokenFormat(token: string | null): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        if (!token) {
          resolve(false);
          return;
        }

        const parts = token.split('.');
        resolve(parts.length === 3);
      } catch (error) {
        reject(error);
      }
    });
  }

  isOrganizationOnboarded(onboardingStep: number): boolean {
    if (onboardingStep == Key.REGISTRATION_COMPLETED_STEP) {
      return true;
    } else {
      return false;
    }
  }


  
  // private async isPlanPurchased(): Promise<boolean> {
  //   return new Promise((resolve) => {
  //     this._subscriptionPlanService.getPurchasedStatus().subscribe((response) => {
  //       console.log("Hi" + response)
  //       resolve(response == true);
  //     });
  //   });
  // }
  

}