import { Component, NgZone, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Key } from 'src/app/constant/key';
import { GstResponse } from 'src/app/models/GstResponse';
import { OrganizationSubscriptionDetail } from 'src/app/models/OrganizationSubscriptionDetail';
import { SubscriptionPlan } from 'src/app/models/SubscriptionPlan';
import { SubscriptionPlanReq } from 'src/app/models/SubscriptionPlanReq';
import { DataService } from 'src/app/services/data.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';
declare var Razorpay: any;
@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css'],
})
export class SubscriptionComponent implements OnInit {
  planSwitch: boolean = false;
  RulesRegulation: boolean = false;
  showYearlyPlans:number=1;
  orgUuid:string='';
  constructor( private _subscriptionPlanService: SubscriptionPlanService,
    private _roleBasedService: RoleBasedAccessControlService,
    private db: AngularFireDatabase,private ngZone: NgZone) {

      this.orgUuid = this._roleBasedService.getOrgRefUUID();
    }

  ngOnInit(): void {
    this.getCurrentSubscriptionPlan();
    this.getPlans();
    this.getActiveUserCount();
  }

  switchSubscriptionPlan() {
    this.planSwitch = this.planSwitch == true ? false : true;
  }
  switchRulesRegulation() {
    this.RulesRegulation = this.RulesRegulation == true ? false : true;
  }


  selectedSubscriptionPlan:SubscriptionPlan = new SubscriptionPlan();
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
    this.selectedSubscriptionPlan = this.subscriptionPlans[index];
    // console.log("======selectedSubscriptionPlans=======", this.selectedSubscriptionPlan);
    this.typeBySubscriptionPlans = new Array();
    this.typeBySubscriptionPlans = this.subscriptionPlans.filter(x=> x.planType == this.selectedSubscriptionPlan.planType);
    // console.log("=============", this.typeBySubscriptionPlan);
    this.switchSubscriptionPlan();
    if(this.totalEmployee>0){
      this.employeeCount = this.totalEmployee;
    }

    this.calculateByEmployeeSize();
  }

  isGstAvailable:boolean=false;
  isVerified:boolean=false;
  applyGst(){
    this.isGstAvailable = this.isGstAvailable == true? false: true;
    this.isVerified = false;
    this.gstNumber = '';
    this.gstResponse = new GstResponse();
  }


  totalEmployee: number = 0;
  getActiveUserCount() {
    this._subscriptionPlanService.getActiveUserCount().subscribe((response) => {
      if (response.status) {
        this.totalEmployee = response.object;
        if(this.totalEmployee>0){
          this.employeeCount = this.totalEmployee;
        }
      }
    });
  }


  selectPlanPeriodically(plan:any){
    this.selectedSubscriptionPlan = plan;
    this.calculateByEmployeeSize();
  }

  email:string='abhi.verma@krenai.com'; ///todo
  // subscriptionPlanReq: SubscriptionPlanReq = new SubscriptionPlanReq();
  employeeCount:number=0;
  monthlyAmount:number=0;
  annualAmount: number =0;
  couponCode:string='';
  couponDiscount:number=0;
  taxAmount:number=0;
  tax:string='18%';
  subAmount:number =0;
  payableAmount:number=0;
  roundOffAmount:number=0;
  calculateByEmployeeSize() {
 
    this.monthlyAmount = this.employeeCount * this.selectedSubscriptionPlan.amount;
    this.annualAmount =  this.monthlyAmount * 12; 
    if(this.selectedSubscriptionPlan.isMonthly==1){
      this.subAmount = this.employeeCount * this.selectedSubscriptionPlan.amount;
      this.taxAmount =  (this.monthlyAmount * 18 ) / 100 ;
      this.payableAmount = Math.floor(this.monthlyAmount +  this.taxAmount);
      this.roundOffAmount = (this.monthlyAmount +  this.taxAmount) - this.payableAmount;
    }else if(this.selectedSubscriptionPlan.isYearly==1){
      this.subAmount = this.employeeCount * this.selectedSubscriptionPlan.amount * 12;
      this.taxAmount =  (this.annualAmount * 18 ) / 100 ;
      this.payableAmount = Math.floor(this.annualAmount +  this.taxAmount);
      this.roundOffAmount =  (this.annualAmount +  this.taxAmount) - this.payableAmount;
    }
  }



  processingPayment: boolean = false;
  verifiedCoupon!: string;

  async activatePlan(): Promise<void> {
   
    this.createFirebaseForProcessing();
    var options = {
      "key": Key.razorKey,
      "amount": Math.round(this.payableAmount) * 100,
      //  "amount":  1 * 100,
      "name": "HAJIRI",
      "description": this.selectedSubscriptionPlan.name + " plan purchase",
      "image": "../../../../../assets/images/hajiri-icon.png",
      "modal": {
        "confirm_close": true,
        "ondismiss": this.stopProcessingPayment.bind(this)
      },
      "prefill": {
        "email": this.email,
        "phone": '7667790550'
      },
      "notes": {
        "orderFrom": 'Hajiri',
        "type": 'Plan-Activate',
        "orgUuid": this.orgUuid,
        "planId": this.selectedSubscriptionPlan.id,
        "employeeCount": this.employeeCount,
        "couponCode": this.couponCode,
        "invoiceId": '',
        "couponDiscount": ''
      },
      "theme": {
        "color": "#6666f3"
      }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  }


  createFirebaseForProcessing() {
    this.ngZone.run(() => {
      var orgUuid = this.orgUuid.replace(/[^a-zA-Z0-9_]/g, "_");
      this.db.object("/subscription_plan/plan_purchased_by_" + orgUuid).set({ status: "Processing" });
      this.isUnderProcess = true;
      this.getExportStatusFromFirebase();
    });
  }

  stopProcessingPayment() {
    this.ngZone.run(() => {
      var orgUuid = this.orgUuid.replace(/[^a-zA-Z0-9_]/g, "_");
      this.db.object("/subscription_plan/plan_purchased_by_" + orgUuid).set({ status: "" });
      this.isUnderProcess = false;
    });
  }

  isUnderProcess: boolean = false;
  realtimeDbSubscriber!: any;
  getExportStatusFromFirebase() {
    debugger
    var orgUuid = this.orgUuid.replace(/[^a-zA-Z0-9_]/g, "_");
    this.realtimeDbSubscriber = this.db.object("/subscription_plan/plan_purchased_by_" + orgUuid).valueChanges()
      .subscribe((res: any) => {
        this.ngZone.run(() => {
          console.log("/subscription_plan/plan_purchased_by_" + orgUuid + "---" + JSON.stringify(res));
          if (res != null) {
            if (res.status == "Processing") {
              this.isUnderProcess = true;
            } else if (res.status == "Complete") {
  
              if (this.realtimeDbSubscriber) {
                this.realtimeDbSubscriber.unsubscribe();
              }
              this.isUnderProcess = false;
              this.stopProcessingPayment();

              // if (this.isRegistration && this.tempPlanId != 1 && this.selectedPlanObject.discountedAmount != 0) {
              //   debugger
              //   if (!this.isloadingPopupOpen) {
              //     this.loaderPopup.nativeElement.click();
              //     this.isloadingPopupOpen = true;
              //   }
              //   this._sharedService.statusId = StatusKeys.ACTIVE;
              //   setTimeout(() => {
              //     this._sharedService.routing = true;
              //     if (this.loaderDismiss != undefined && this.isloadingPopupOpen) {
              //       this.loaderDismiss.nativeElement.click();
              //       this.isloadingPopupOpen = false;
              //     }

              //     this._router.navigate([Routes.STORE_DASHBOARD], { replaceUrl: true });

              //   }, 8000);
              // }
            }
          }
        });
      });
  }

gstNumber:string='';
verified!:boolean;
checkGst(){
  if(this.gstNumber.length == 15){
    this.verifyGst();
  }
}

gstResponse:GstResponse = new GstResponse();
  verifyGst(){
    this._subscriptionPlanService.verifyGstNumber(this.gstNumber).subscribe((response) => {
      if (response.status) {
        this.isVerified =true;
        this.gstResponse = response.object;
      }else{
        this.isVerified =false;
      }
    });
  }
}
