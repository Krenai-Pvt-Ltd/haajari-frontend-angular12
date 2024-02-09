import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionPlan } from 'src/app/models/SubscriptionPlan';
import { SubscriptionPlanReq } from 'src/app/models/SubscriptionPlanReq';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-billing-payment',
  templateUrl: './billing-payment.component.html',
  styleUrls: ['./billing-payment.component.css']
})
export class BillingPaymentComponent implements OnInit {

  subscriptionPlan: SubscriptionPlan = new SubscriptionPlan();
  sbscriptionPlanReq: SubscriptionPlanReq = new SubscriptionPlanReq();
  activeUserCount: number = 0;
  taxAmount: number = 0;
  totalAmount: number = 0;
  monthlyAmount: number = 0;
  annualAmount: number = 0;

  constructor(
    private _activeRouter:ActivatedRoute,
    private _subscriptionPlanService:SubscriptionPlanService) {
     }

  ngOnInit(): void {
    this.getActiveUserCount();
    this.getSubscriptionPlanDetails();
    
  }

  getSubscriptionPlanDetails(){
    let id = this._activeRouter.snapshot.queryParamMap.get('id')!
    this._subscriptionPlanService.getSubscriptionPlan(id).subscribe((response)=>{
      if(response.status){
        this.subscriptionPlan = response.object;
      }
    })
  }

  totalEmployee:number = 0;
  getActiveUserCount(){
    this._subscriptionPlanService.getActiveUserCount().subscribe((response)=>{
      if(response.status){
        this.sbscriptionPlanReq.noOfEmployee = response.totalItems;        
      }
    })
  }

  
  selecrPlanType(value:string){
    this.sbscriptionPlanReq.planType = value;
    this.sbscriptionPlanReq.amount = this.sbscriptionPlanReq.noOfEmployee*this.subscriptionPlan?.amount
    if(this.sbscriptionPlanReq.planType == 'annual'){
      this.sbscriptionPlanReq.amount = this.sbscriptionPlanReq.noOfEmployee*this.subscriptionPlan?.amount*12 - (this.sbscriptionPlanReq.noOfEmployee*this.subscriptionPlan?.amount*20*12)/100 
    }
    this.taxAmount = this.sbscriptionPlanReq.amount*18/100;
    this.totalAmount = this.sbscriptionPlanReq.amount + this.taxAmount;


    
  }

  getCalcu(value:any){
    this.sbscriptionPlanReq.planType = null;
    this.sbscriptionPlanReq.amount = 0;
    this.taxAmount = 0;
    this.monthlyAmount = value*this.subscriptionPlan?.amount;
    this.annualAmount = this.monthlyAmount*12 - (this.monthlyAmount*12*20)/100;   
      
  }
  

}
