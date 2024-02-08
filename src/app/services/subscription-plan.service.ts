import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Key } from "../constant/key";


@Injectable({
    providedIn: "root",
  })
  export class SubscriptionPlanService {

    private _key:Key = new Key();

    constructor(private _httpClient: HttpClient) {

    }

    getAllSubscriptionPlan(){
        return this._httpClient.get<any>(this._key.main_url+this._key.get_subscription)
    }

    getSubscriptionPlan(id: any){
      return this._httpClient.get<any>(this._key.main_url+this._key.get_subscription+"/"+id)
  }


  }