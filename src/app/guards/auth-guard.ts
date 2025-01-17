import { HelperService } from '../services/helper.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,CanActivate,Router,RouterStateSnapshot} from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';
import { OnboardingService } from '../services/onboarding.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private rbacService: RoleBasedAccessControlService,
    private _helperService: HelperService,
    private _onboardingService: OrganizationOnboardingService,
    private onboardingService: OnboardingService,
    private dataService: DataService
  ) {
  
  }
  step!: number;
  UUID: any;
  ROLE: any;
  ONBOARDING_STEP: any;
  PLAN_PURCHASED: any;
  currentRoute:any;

  async ngOnInit(): Promise<void> {

  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot,): Promise<boolean> {
    const token = localStorage.getItem('token');
    
    if (!await this.isValidTokenFormat(token)) {
      this.router.navigate(['/auth/login']);
      return false;
    }

   
    if( route!.routeConfig!.path == 'dashboard'){
      this._helperService.isDashboardActive=true;
    }else{
      this._helperService.isDashboardActive=false;
    }

    // console.log("=====this._helperService.isDashboardActive======",this._helperService.isDashboardActive, "====route====",route!.routeConfig!.path);

    
    await this.rbacService.isUserInfoInitializedMethod();
    // console.log("=====isSubscription======",this._subscriptionService.isSubscription)

    // commented need to check
    // if(this._subscriptionService.isSubscription!=undefined){
    //   if(!this._subscriptionService.isSubscription || this._subscriptionService.isPlanExpired){
    //       return false;
    //   }
    // }


    if(this._helperService.orgStepId){
      this.step=this._helperService.orgStepId;
      if (this.step < 5) {
        this.onboardingService.switchToRoutes(this.step);

        // this.router.navigate(['/organization-onboarding/personal-information']);
        return false;
      }
    }else if (!this.step) {
      await this.isOnboardingCompleted();
      if (this.step < 5) {
        this.onboardingService.switchToRoutes(this.step);

        // this.router.navigate(['/organization-onboarding/personal-information']);
        return false;
      }
    }

//  deprecated
      // if(this._helperService.stepId){
      //   this.step=this._helperService.stepId;
      //   if (this.step < 5) {
      //     this.router.navigate(['/organization-onboarding/personal-information']);
      //     return false;
      //   }
      // }else if (!this.step) {
      //   await this.isOnboardingCompleted();
      //   if (this.step < 5) {
      //     this.router.navigate(['/organization-onboarding/personal-information']);
      //     return false;
      //   }
      // }

    // if(this.dataService.isToDoStepCompleted){
    //   this.isToDoStepsCompleted=this.dataService.isToDoStepCompleted;
    // }else  if (!this.isToDoStepsCompleted) {
    //   await this.isToDoStepsCompletedData();
    // }


      this.ROLE = await this.rbacService.getRole();

    // if (this.ROLE == 'ADMIN' && this.isToDoStepsCompleted == 0 && route!.routeConfig!.path == 'dashboard') {
    //   debugger
    //   // this.router.navigate(['/to-do-step-dashboard']);
    //   return false;
    // }else if (this.ROLE == 'ADMIN' && this.isToDoStepsCompleted == 0) {
    //   debugger
    //   return true;
    // }

    

 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.currentRoute = state.url;
    // console.log("======this.currentRoute==========",this.currentRoute);
    if (this.currentRoute != null) {  
        this.currentRoute = this.currentRoute.split("?")[0];
        // console.log("======this.currentRoute==========",this.currentRoute,"=============restrict========",this._helperService.restrictedModules)
      if(this._helperService.restrictedModules == undefined){
        await this._helperService.getRestrictedModules();
      }

      if (this._helperService.restrictedModules != undefined &&  this._helperService.restrictedModules.length > 0) {
        var index = this._helperService.restrictedModules.findIndex(module => module.route == this.currentRoute.trim())
        if (index > -1) {
          console.log("🚀 restricted route  :: ", this.currentRoute);
          return false;
        }
      }


      if ((this.ROLE != 'ADMIN' && this.ROLE != 'MANAGER') && this.currentRoute == '/dashboard') {
        debugger
        // console.log("🚀 ~ AuthGuard ~ canActivate ~ this.currentRoute: user ####", this.currentRoute);
        console.log("🚀routing to employee profile ", this.currentRoute);
        this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], {
          queryParams: {
            userId: await this.rbacService.getUUID(),
            dashboardActive: 'true',
          },
          
        }
      
      );
        return false;
      }
      console.log("🚀 ~ AuthGuard ~ canActivate ~ this.currentRoute:", this.currentRoute)


      if (!await this.rbacService.hasAccessToSubmodule(this.currentRoute)) {
        console.log("🚀 ~ AuthGuard ~ canActivate ~ this.currentRoute: un");
        this.router.navigate(['/unauthorized']);
        return false;
      }

    } 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.log("guard resolved to true");
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



  isToDoStepsCompleted !: number;
  isToDoStepsCompletedData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService.isToDoStepsCompleted().subscribe(
        (response) => {
          this.isToDoStepsCompleted = response.object;
          resolve(response);
        },
        (error: any) => {
          resolve(true);
        }
      );
    });
  }

  isOnboardingCompleted(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._onboardingService.getOrgOnboardingStep().subscribe((response: any) => {
        this.step = parseInt(response?.object?.step);
        resolve(response);

      },
        (error: any) => {
          resolve(true);
        }
      );
    });


  }
}
