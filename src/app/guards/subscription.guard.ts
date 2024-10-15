import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SubscriptionPlanService } from '../services/subscription-plan.service';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate {

  constructor(
    private _subscriptionService:SubscriptionPlanService,
    private _router: Router) { 

    }

    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot):boolean  {

        
      if(this._subscriptionService.isPlanExpired!=undefined){
       if(this._subscriptionService.isPlanExpired){
         this._router.navigate( ['/subscription-ended']);
         return false;
       }else{
        return true;
       } 
      }else{
        return true;     
      }
      
  }
  
}
