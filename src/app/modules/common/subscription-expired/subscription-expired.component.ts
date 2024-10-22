import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationSubscriptionDetail } from 'src/app/models/OrganizationSubscriptionDetail';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-subscription-expired',
  templateUrl: './subscription-expired.component.html',
  styleUrls: ['./subscription-expired.component.css']
})
export class SubscriptionExpiredComponent implements OnInit {

  constructor(private _router:Router,
    public _subscriptionService :SubscriptionPlanService) { }

  ngOnInit(): void {
    this.getCurrentSubscriptionPlan();
  }


  routeToSubscription(){
    this._router.navigate(['/setting/subscription']);
  }


  orgSubscriptionPlanDetail: OrganizationSubscriptionDetail = new OrganizationSubscriptionDetail();
  getCurrentSubscriptionPlan(){
    this._subscriptionService.getCurrentPlan().subscribe((response) => {
      if(response.status){
        this.orgSubscriptionPlanDetail = response.object;
        if(this.orgSubscriptionPlanDetail == null){
          this.orgSubscriptionPlanDetail = new OrganizationSubscriptionDetail();
        }
      }else{
        this.orgSubscriptionPlanDetail = new OrganizationSubscriptionDetail();
      }
    },(error)=>{

    });
  }

}
