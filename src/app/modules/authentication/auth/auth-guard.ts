import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Key } from 'src/app/constant/key';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private helperService: HelperService, 
    private rbacService: RoleBasedAccessControlService,
  ) {}

  UUID: any;
  ROLE: any;
  ONBOARDING_STEP: any;
  async ngOnInit(): Promise<void> {
    this.UUID =this.rbacService.userInfo.uuid;
    //  await this.rbacService.getUUID();
    this.ROLE = this.rbacService.userInfo.role;
    // await this.rbacService.getRole();
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

//TODO uncomments
    // await this.rbacService.isUserInfoInitialized();

    var role="";
    if(this.rbacService.userInfo){
      role=this.rbacService?.userInfo.role;
    }else{
      var userinfo=await this.helperService.getDecodedValueFromToken();
      var role:string=userinfo?.role
    }
    if (route !== null && route.routeConfig !== null) {
      //TODO: uncomment if required
      // if (
      //   (await this.rbacService.getRole()) == Key.USER &&
      //   route.routeConfig.path == 'dashboard'
      // ) {
        if (
          (role) == Key.USER &&
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
}
