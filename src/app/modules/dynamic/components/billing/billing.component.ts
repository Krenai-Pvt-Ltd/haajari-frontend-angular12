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
  loading: boolean = false;

  constructor(private _subscriptionPlanService:SubscriptionPlanService,
    private _router: Router) { }

  ngOnInit(): void {
    this.getAllSubscription();
  }

  getAllSubscription(){
    debugger
    this.loading = true
    this._subscriptionPlanService.getAllSubscriptionPlan().subscribe(response=>{
      if(response.status){
        this.subscriptionList = response.object;
        this.loading = false;
      }
      this.loading = false;
    })
  }


  routeToBillingPaymentPage(id: number) {
    debugger
    this._router.navigate(["/setting/billing-payment"], { queryParams: { id: id } });
  }

}
