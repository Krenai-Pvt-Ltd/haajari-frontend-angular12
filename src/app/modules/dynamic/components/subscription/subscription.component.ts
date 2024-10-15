import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { GstResponse } from 'src/app/models/GstResponse';
import { InvoiceDetail } from 'src/app/models/InvoiceDetail';
import { OrganizationSubscriptionDetail } from 'src/app/models/OrganizationSubscriptionDetail';
import { SubscriptionPlan } from 'src/app/models/SubscriptionPlan';
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
  progress:number=0;
  getCurrentSubscriptionPlan(){
    this._subscriptionPlanService.getCurrentPlan().subscribe((response) => {
      if(response.status){
        this.orgSubscriptionPlanDetail = response.object;
        if(this.orgSubscriptionPlanDetail == null){
          this.orgSubscriptionPlanDetail = new OrganizationSubscriptionDetail();
        }else{
          this.progress =  (this.orgSubscriptionPlanDetail.quotaUsed/ this.orgSubscriptionPlanDetail.employeeQuota)* 100;
        }
      }else{
        this.orgSubscriptionPlanDetail = new OrganizationSubscriptionDetail();
      }
    },(error)=>{

    });
  }

  selectPlan(plan:SubscriptionPlan){
    this.selectedSubscriptionPlan = plan;
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
    this.calcPlanPeriodicallyAmount();
    if(this.selectedSubscriptionPlan.isMonthly==1){
      this.payableAmount = this.employeeCount * this.selectedSubscriptionPlan.amount;
      this.subAmount = Math.round(( this.payableAmount / (1.18)) * 100.0) / 100.0;
      this.taxAmount = Math.round(((this.payableAmount -  this.subAmount)) * 100.0) / 100.0;

    }else if(this.selectedSubscriptionPlan.isYearly==1){
      this.payableAmount = this.employeeCount * this.selectedSubscriptionPlan.amount * 12;
      this.subAmount= Math.round(( this.payableAmount / (1.18)) * 100.0) / 100.0;
      this.taxAmount = Math.round((this.payableAmount -  this.subAmount) * 100.0) / 100.0;
    }
  }


  calcPlanPeriodicallyAmount(){
    this.typeBySubscriptionPlans.forEach(plan=>{
      if(plan.isMonthly == 1){
        this.monthlyAmount = this.employeeCount * plan.amount;
      }
      if(plan.isYearly == 1){
        this.annualAmount =  this.employeeCount * plan.amount * 12; 
      }
    }) 
  }

  // ,
  // "prefill": {
  //   "email": this.email,
  //   "phone": '7667790550'
  // }

  processingPayment: boolean = false;
  verifiedCoupon!: string;
  @ViewChild('sucessPaymentModalButton')sucessPaymentModalButton!:ElementRef;
  async activatePlan(): Promise<void> {
   
    this.createFirebaseForProcessing();
    var options = {
      "key": Key.razorKey,
      "amount": this.payableAmount * 100,
      //  "amount":  1 * 100,
      "name": "HAJIRI",
      "description": this.selectedSubscriptionPlan.name + " plan purchase",
      "image": "../../../../../assets/images/hajiri-icon.png",
      "handler": this.showPaymentDetail.bind(this),
      "modal": {
        "confirm_close": true,
        // "ondismiss": this.stopProcessingPayment.bind(this)
      },
      "prefill": {
        "email": '',
        "phone": ''
      },
      "notes": {
        "orderFrom": 'Hajiri',
        "type": 'Plan-Activate',
        "orgUuid": this.orgUuid,
        "planId": this.selectedSubscriptionPlan.id,
        "employeeCount": this.employeeCount,
        "couponCode": this.couponCode,
        "invoiceId": '',
        "couponDiscount": '',
        "gstNumber":  !constant.EMPTY_STRINGS.includes(this.gstResponse.gstNo)?this.gstResponse.gstNo:'',
        "tradeName":  !constant.EMPTY_STRINGS.includes(this.gstResponse.tradeName)?this.gstResponse.tradeName:'',
        "address":  !constant.EMPTY_STRINGS.includes(this.gstResponse.fullAddress)?this.gstResponse.fullAddress:''

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
              this.afterSuccessfulPayment();     
            }
          }
        });
      });
  }


  afterSuccessfulPayment(){
    this.getRecentPaidInvoiceDetail();
    this.getPlans();
    this.getCurrentSubscriptionPlan();
    this._subscriptionPlanService.getOrganizationSubsPlanDetail();
  }

  showPaymentDetail(){
    this.sucessPaymentModalButton.nativeElement.click();
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


invoiceDetail:InvoiceDetail = new InvoiceDetail();
  getRecentPaidInvoiceDetail(){
    this._subscriptionPlanService.getRecentPaidInvoiceDetail().subscribe((response) => {
      if(response.status){
        this.invoiceDetail = response.object;
      }
    },(error)=>{

    });
  }

  toggle:boolean =false;
}
