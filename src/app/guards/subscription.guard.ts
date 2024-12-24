import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SubscriptionPlanService } from '../services/subscription-plan.service';
import { RoleBasedAccessControlService } from '../services/role-based-access-control.service';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate {

  constructor(
    private _subscriptionService:SubscriptionPlanService,
    private _router: Router,
    private _rbacService: RoleBasedAccessControlService) { 

    }

    async canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot):Promise<boolean>  {

        return this._subscriptionService.verifySubscriptionAndRoute();

        // // console.log("=====isSubscription======",this._subscriptionService.isSubscription)
        // if(this._subscriptionService.isSubscription==undefined){
        //  await this._subscriptionService.isSubscriptionPlanExpired();
        // }

        // // console.log("=====isSubscription======",this._subscriptionService.isSubscription)
        // if(this._subscriptionService.isSubscription!=undefined && this._rbacService.getRoles()=='ADMIN'){
        //   if(this._subscriptionService.isSubscription){
        //     if(this._subscriptionService.isPlanExpired){
        //       this._router.navigate( ['/subscription/expired']);
        //       return false;
        //     }else{
        //       return true;
        //     }
        //   }else{
        //     this._router.navigate( ['/setting/subscription']);
        //     return false;
        //   }
        // }else if(this._subscriptionService.isSubscription!=undefined  && this._rbacService.getRoles()!='USER') {
        //   if(this._subscriptionService.isSubscription){
        //     if(this._subscriptionService.isPlanExpired){
        //       this._router.navigate( ['/subscription/expired']);
        //       return false;
        //     }else{
        //       return true;
        //     }
        //   }else{
        //     // this._router.navigate( ['/setting/subscription']);
        //     return false;
        //   }
        // }

        // return true;
  }
  
}
