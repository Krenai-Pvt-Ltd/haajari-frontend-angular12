import { Component, OnInit } from '@angular/core';
import { OrganizationSubscriptionDetail } from 'src/app/models/OrganizationSubscriptionDetail';
import { SubscriptionPlan } from 'src/app/models/SubscriptionPlan';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css'],
})
export class SubscriptionComponent implements OnInit {
  planSwitch: boolean = false;
  RulesRegulation: boolean = false;
  showYearlyPlans:number=1;
  constructor( private _subscriptionPlanService: SubscriptionPlanService,) {}

  ngOnInit(): void {
    this.getCurrentSubscriptionPlan();
    this.getPlans();
  }

  switchSubscriptionPlan() {
    this.planSwitch = this.planSwitch == true ? false : true;
  }
  switchRulesRegulation() {
    this.RulesRegulation = this.RulesRegulation == true ? false : true;
  }


  selectedSubscriptionPlans:SubscriptionPlan = new SubscriptionPlan();
  subscriptionPlans:SubscriptionPlan[] = new Array();
  typeBySubscriptionPlans:SubscriptionPlan[] = new Array();
  getPlans(){
    this._subscriptionPlanService.getPlans().subscribe((response) => {
      if(response.status){
        this.subscriptionPlans = response.object;
        if(this.subscriptionPlans == null){
          this.subscriptionPlans = new Array();
        }
      }else{
        this.subscriptionPlans = new Array();
      }

    },(error)=>{
      this.subscriptionPlans = new Array();
    });

    
  }

  orgSubscriptionPlanDetail: OrganizationSubscriptionDetail = new OrganizationSubscriptionDetail();
  getCurrentSubscriptionPlan(){
    this._subscriptionPlanService.getCurrentPlan().subscribe((response) => {
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

  selectPlan(index:number){
    this.selectedSubscriptionPlans = this.subscriptionPlans[index];
    console.log("======selectedSubscriptionPlans=======", this.selectedSubscriptionPlans);
    this.typeBySubscriptionPlans = new Array();
    this.typeBySubscriptionPlans = this.subscriptionPlans.filter(x=> x.planType == this.selectedSubscriptionPlans.planType);
    console.log("=============", this.typeBySubscriptionPlans);
    this.switchSubscriptionPlan();
  }

  isGstAvailable:boolean=false;
  isVerified:boolean=false;
  applyGst(){
    this.isGstAvailable = this.isGstAvailable == true? false: true;
  }
}
