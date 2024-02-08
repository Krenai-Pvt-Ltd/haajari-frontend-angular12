import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-billing-payment',
  templateUrl: './billing-payment.component.html',
  styleUrls: ['./billing-payment.component.css']
})
export class BillingPaymentComponent implements OnInit {

  subscriptionPlan: any;

  constructor(
    private _activeRouter:ActivatedRoute,
    private _subscriptionPlanService:SubscriptionPlanService) { }

  ngOnInit(): void {

    
  }

  getEmployeeDetails(){
    let id = this._activeRouter.snapshot.queryParamMap.get('id')!
    this._subscriptionPlanService.getSubscriptionPlan(id).subscribe((response)=>{
      this.subscriptionPlan = response.object;
    })
  }

}
