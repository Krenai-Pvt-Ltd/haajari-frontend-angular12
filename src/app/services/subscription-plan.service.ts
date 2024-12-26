import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Key } from "../constant/key";
import { HelperService } from "./helper.service";
import { ActivatedRoute, ActivationEnd, NavigationEnd, Router } from "@angular/router";
import { constant } from "../constant/constant";
import { Routes } from "../constant/Routes";
import { DatabaseHelper } from "../models/DatabaseHelper";
import { filter } from "rxjs/operators";
import { RoleBasedAccessControlService } from "./role-based-access-control.service";

@Injectable({
  providedIn: "root",
})
export class SubscriptionPlanService {

  private _key: Key = new Key();
  currentRoute:any;
  constructor(private _httpClient: HttpClient,
    private _helperService : HelperService,
    private router : Router,
    private rbacService : RoleBasedAccessControlService
  ) {
  

    if (this.router != undefined) {
      // console.log("11111route=======", this._router );
        this.router.events.subscribe(val => {
          // console.log("val=======", val);
          if (val instanceof ActivationEnd && constant.EMPTY_STRINGS.includes(this.currentRoute)) {
            //@ts-ignore
            this.currentRoute = val.snapshot._routerState.url.split("?")[0];
            // console.log("route=======", this.currentRoute);
            if (!Routes.AUTH_ROUTES.includes(String(this.currentRoute))) {
               this.LoadAsync();
            }
          }
        });
    }
  }


  LoadAsync = async () => {
    
    await this.isSubscriptionPlanExpired();
    await this._helperService.getRestrictedModules();
    await this.getOrganizationSubsPlanDetail();
 };



  planName:string='';
  month:number=0;
  getOrganizationSubsPlanDetail() {
    this.getOrgSubsPlanDetail().subscribe((response) => {
        if (response.status){
  
          this.planName = response.object.planName;
      
          this.month = response.object.month;
        }
      },(error)=>{

      });
  }

  isPlanExpired!:boolean;
  isTrialPlan!:boolean;
  isSubscription!:boolean;
  isDuesInvoice!:boolean;
  isSubscriptionPlanExpired() {
    return new Promise((resolve)=>{
      this.isSubscrPlanExpired().subscribe((response) => {
          if (response.status){
            this.isPlanExpired = response.object.isExpired;
            this.isTrialPlan = response.object.isTrialPlan;
            this.isSubscription = response.object.isSubscription;
            this.isDuesInvoice = response.object.isDuesInvoice;
          }
          resolve(true);
        },(error)=>{
          resolve(true);
        });
    });
  }

  verifySubscriptionAndRoute():boolean{
    debugger
    if(this.isSubscription!=undefined && this.rbacService.getRoles()=='ADMIN'){
      
      if(this.isSubscription){
        if(this.isPlanExpired){
          this.router.navigate( ['/subscription/expired']);
          return false;
        }else{
          return true;
        }
      }else{
        this.router.navigate( ['/setting/subscription']);
        return false;
      }
    }else if(this.isSubscription!=undefined  && this.rbacService.getRoles()!='USER') {
      if(this.isSubscription){
        if(this.isPlanExpired){
          this.router.navigate( ['/subscription/expired']);
          return false;
        }else{
          return true;
        }
      }else{
        // this._router.navigate( ['/setting/subscription']);
        return false;
      }
    }
    return true;
  }

  getActiveUserCount() {
    return this._httpClient.get<any>(this._key.base_url + this._key.get_active_user_count);
  }


  verifyCoupon(couponCode:string, amount:number){
    const params = new HttpParams()
      .set('couponCode', couponCode)
      .set('amount', amount)
    return this._httpClient.get<any>(this._key.base_url + this._key.verify_coupon, {params})
  }

  getPlans(){
    return this._httpClient.get<any>(this._key.base_url + this._key.get_subscription_plans);
  }


  getCurrentPlan(){
    return this._httpClient.get<any>(this._key.base_url + this._key.get_current_subscription_plan);
  }

  getOrgSubsPlanDetail(){
    return this._httpClient.get<any>(this._key.base_url + this._key.get_subscription_plan_light_detail);
  }

  verifyGstNumber(gstNumber:string) {
    const params = new HttpParams()
    .set('gstNumber', gstNumber)
    return this._httpClient.get<any>(this._key.base_url + this._key.verify_gst_number,{params});
  }

  getRecentPaidInvoiceDetail(){
    return this._httpClient.get<any>(this._key.base_url + this._key.get_subscription_payment_detail);
  }


  isSubscrPlanExpired() {
    return this._httpClient.get<any>(this._key.base_url + this._key.is_plan_expired);
  }

  getInvoices(databaseHelper:DatabaseHelper,statusIds:number[]){
    const params = new HttpParams()
      .set('itemPerPage', databaseHelper.itemPerPage)
      .set('currentPage', databaseHelper.currentPage)
      .set('sortBy', "createdDate")
      .set('sortOrder', "desc")
      .set('statusIds', String(statusIds))
    return this._httpClient.get<any>(this._key.base_url + this._key.get_invoices, {params});
  }

  downloadInvoice(invoiceId:number){
    const params = new HttpParams()
    .set('invoiceId', invoiceId)
  return this._httpClient.get<any>(this._key.base_url + this._key.download_invoice, {params});
  }
}