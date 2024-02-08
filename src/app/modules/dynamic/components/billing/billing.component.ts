import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {

  subscriptionList :any[] = new Array() ;

  constructor(private _subscriptionPlanService:SubscriptionPlanService,
    private _router: Router) { }

  ngOnInit(): void {
    this.getSubscription();
  }

  getSubscription(){
    debugger
    this._subscriptionPlanService.getAllSubscriptionPlan().subscribe(response=>{
      if(response.status){
        this.subscriptionList = response.object;
      }
    })
  }


  routeToBillingPaymentPage(id: number) {
    debugger
    this._router.navigate(["/setting/billing-payment"], { queryParams: { id: id } });
  }

}
