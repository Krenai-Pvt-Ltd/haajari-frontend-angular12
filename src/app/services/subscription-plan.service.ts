import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Key } from "../constant/key";
import { DatabaseHelper } from "../models/DatabaseHelper";


@Injectable({
  providedIn: "root",
})
export class SubscriptionPlanService {

  private _key: Key = new Key();

  constructor(private _httpClient: HttpClient) {

  }

  getAllSubscriptionPlan() {
    return this._httpClient.get<any>(this._key.base_url + this._key.get_subscription)
  }

  getSubscriptionPlan(id: any) {
    return this._httpClient.get<any>(this._key.base_url + this._key.get_subscription + "/" + id)
  }

  getActiveUserCount() {
    return this._httpClient.get<any>(this._key.base_url + this._key.get_active_user_count)
  }

  getPurchasedStatus() {
    return this._httpClient.get<any>(this._key.base_url + this._key.get_purchased_status)
  }
  getPlanPurchasedStatus(planId:any) {
    const params = new HttpParams()
      .set("planId", planId);
    return this._httpClient.get<any>(this._key.base_url + this._key.get_plan_purchased_status,{params})
  }
  
  addMoreEmployee(noOfEmployee: number) {
    const params = new HttpParams()
      .set("no_of_employee", noOfEmployee);
    return this._httpClient.post<any>(this._key.base_url + this._key.add_more_employee, {}, { params })
  }

  getInvoices(databaseHelper:DatabaseHelper){
    const params = new HttpParams()
      .set('itemPerPage', databaseHelper.itemPerPage)
      .set('currentPage', databaseHelper.currentPage)
      .set('sortBy', "id")
      .set('sortOrder', "desc")
    return this._httpClient.get<any>(this._key.base_url + this._key.get_invoices, {params})
  }
  getLastInvoices(){
    return this._httpClient.get<any>(this._key.base_url + this._key.get_last_invoices)
  }

  getDueInvoices(){
    return this._httpClient.get<any>(this._key.base_url + this._key.get_due_invoices)
  }

  getDuePendingStatus(){
    return this._httpClient.get<any>(this._key.base_url + this._key.get_due_pending_Status)
  }

  getOrgSubsPlanMonthDetail(){
    return this._httpClient.get<any>(this._key.base_url + this._key.get_org_subs_plan_month_detail)
  }

  getPlanPurchasedLog(databaseHelper:DatabaseHelper){
    const params = new HttpParams()
      .set('itemPerPage', databaseHelper.itemPerPage)
      .set('currentPage', databaseHelper.currentPage)
      .set('sortBy', "id")
      .set('sortOrder', "desc")
    return this._httpClient.get<any>(this._key.base_url + this._key.get_plan_purchased_log, {params})
  }

  cancelSubscription(){
    return this._httpClient.get<any>(this._key.base_url + this._key.cancel_subscription)
  }

  verifyCoupon(couponCode:string, amount:number){
    const params = new HttpParams()
      .set('couponCode', couponCode)
      .set('amount', Math.round(amount) )
    return this._httpClient.get<any>(this._key.base_url + this._key.verify_coupon, {params})
  }


}