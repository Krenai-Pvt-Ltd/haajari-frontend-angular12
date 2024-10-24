import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Key } from "../constant/key";
import { DatabaseHelper } from "../models/DatabaseHelper";
import { HelperService } from "./helper.service";


@Injectable({
  providedIn: "root",
})
export class SubscriptionPlanService {

  private _key: Key = new Key();

  constructor(private _httpClient: HttpClient,
    private _helperService : HelperService
  ) {
    this.LoadAsync();
  }


  LoadAsync = async () => {
    await this.isSubscriptionPlanExpired();
    await this._helperService.getRestrictedModules();
    this.getOrganizationSubsPlanDetail();
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
    return this._httpClient.get<any>(this._key.base_url + this._key.get_invoices, {params})
  }
}