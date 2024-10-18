import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { GstResponse } from 'src/app/models/GstResponse';
import { InvoiceDetail } from 'src/app/models/InvoiceDetail';
import { Invoices } from 'src/app/models/Invoices';
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

  readonly Constant = constant; 
  constructor( private _subscriptionPlanService: SubscriptionPlanService,
    private _roleBasedService: RoleBasedAccessControlService,
    private db: AngularFireDatabase,private ngZone: NgZone) {

      this.orgUuid = this._roleBasedService.userInfo.orgRefId;
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

  selectPlan(plan:SubscriptionPlan){
    this.selectedSubscriptionPlan = plan;
    this.typeBySubscriptionPlans = new Array();
    this.typeBySubscriptionPlans = this.subscriptionPlans.filter(x=> x.planType == this.selectedSubscriptionPlan.planType);
    this.switchSubscriptionPlan();
    if(this.totalEmployee>0){
      this.employeeCount = this.totalEmployee;
    }
    this.calculateEmployeeSize();
  }



  isGstAvailable:boolean=false;
  isVerified:boolean=false;
  checkedGst(){
    this.isGstAvailable = this.isGstAvailable == true? false: true;
    this.isVerified = false;
    this.gstNumber = '';
    this.gstResponse = new GstResponse();
  }


  selectPlanPeriodically(plan:any){
    this.selectedSubscriptionPlan = plan;
    this.calculateEmployeeSize();
  }

  
  isCouponVerified:boolean=false;
  couponErrorMessage:string='';
  applyCoupon() {
    if(!constant.EMPTY_STRINGS.includes(this.couponCode)){
      this._subscriptionPlanService.verifyCoupon(this.couponCode, this.payableAmount)
          .subscribe((response) => {
              if (response.status) {
                this.isCouponVerified = true;
                this.couponDiscount = response.object;
                this.calculateByEmployeeSize();
              } else {
                this.isCouponVerified = false;
                this.couponErrorMessage = response.message;
                this.couponDiscount = 0;
              }
          },(error)=>{
            this.isCouponVerified = false;
          });
    }
}

  showCoupon:boolean =false;
  removeCoupon(){
    this.couponErrorMessage = '';
    this.showCoupon =false;
    this.couponCode ='';
    this.isCouponVerified = false;
    this.couponDiscount = 0;
    this.calculateByEmployeeSize();
  }
  
  calculateEmployeeSize(){
    this.removeCoupon();
  }

  employeeCount:number=0;
  couponCode:string='';
  couponDiscount:number=0;
  taxAmount:number=0;
  subAmount:number =0;
  payableAmount:number=0;
  calculateByEmployeeSize() {
    this.calcPlanPeriodicallyAmount();
    if(this.selectedSubscriptionPlan.isMonthly==1){
      this.payableAmount = this.employeeCount * this.selectedSubscriptionPlan.amount;
      if(this.isCouponVerified){
        this.payableAmount = this.payableAmount - this.couponDiscount;
      }
      this.subAmount = Math.round(( this.payableAmount / (1.18)) * 100.0) / 100.0;
      this.taxAmount = Math.round(((this.payableAmount -  this.subAmount)) * 100.0) / 100.0;

    }else if(this.selectedSubscriptionPlan.isYearly==1){
      this.payableAmount = this.employeeCount * this.selectedSubscriptionPlan.amount * 12;
      if(this.isCouponVerified){
        this.payableAmount = this.payableAmount - this.couponDiscount;
      }
      this.subAmount= Math.round(( this.payableAmount / (1.18)) * 100.0) / 100.0;
      this.taxAmount = Math.round((this.payableAmount -  this.subAmount) * 100.0) / 100.0;
    }
  }

  monthlyAmount:number=0;
  annualAmount: number =0;
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  isUnderProcess: boolean = false;
  realtimeDbSubscriber!: any;
  processingPayment: boolean = false;
  @ViewChild('sucessPaymentModalButton')sucessPaymentModalButton!:ElementRef;
  activatePlan() {
    this.createFirebaseForProcessing();
    var options = {
      "key": Key.razorKey,
      "amount": this.payableAmount * 100,
      "name": "HAJIRI",
      "description": this.selectedSubscriptionPlan.name + " plan purchase",
      "image": "../../../../../assets/images/hajiri-icon.png",
      "handler": this.handleSuccesfullPayment.bind(this),
      "modal": {
        "confirm_close": true,
        "ondismiss": this.stopProcessingPayment.bind(this)
      },
      "notes": {
        "orderFrom": 'Hajiri',
        "type": 'Plan-Activate',
        "orgUuid": this.orgUuid,
        "planId": this.selectedSubscriptionPlan.id,
        "employeeCount": this.employeeCount,
        "invoiceId": '',
        "couponCode": !constant.EMPTY_STRINGS.includes(this.couponCode)?this.couponCode:'',
        "couponDiscount": this.couponDiscount,
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

  handleSuccesfullPayment() {
    this.sucessPaymentModalButton.nativeElement.click();
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
    this._subscriptionPlanService.isSubscriptionPlanExpired();
    this.removeCoupon();
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


gstNumber:string='';
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


  invoiceLoading:boolean = false;
  invoicesDatabaseHelper:DatabaseHelper = new DatabaseHelper();
  invoices:Invoices[] = new Array();
  totalInvoices:number=0;
  getAllInvoices() {
    this.invoiceLoading = true;
    this.invoices = [];
    var statusIds = [StatusKeys.BILLING_PAID];
    this._subscriptionPlanService.getInvoices(this.invoicesDatabaseHelper,statusIds).subscribe((response) => {
        if (response.status) {
          this.invoices = response.object;
          this.totalInvoices = response.totalItems;
          if(this.invoices == null){
            this.invoices =  new Array();
            this.totalInvoices = 0;
          }
        }else{
          this.invoices =  new Array();
          this.totalInvoices = 0;
        }
        this.invoiceLoading = false;
      },(error)=>{
        this.invoiceLoading = false;
      });
  }

  invoicePageChanged(page:any){
    if(page!=this.invoicesDatabaseHelper.currentPage){
      this.invoicesDatabaseHelper.currentPage = page;
      this.getAllInvoices();
    }
  }


  downloadInvoice(invoiceUrl:string){
    if(!constant.EMPTY_STRINGS.includes(invoiceUrl)){
      window.open(invoiceUrl, "_blank");
    }
  }

  dueInvoices:Invoices[] = new Array();
  totalDueInvoices :number=0;
  duesDatabaseHelper : DatabaseHelper = new DatabaseHelper();
  getDueInvoice(){
    this.invoiceLoading = true;
    this.dueInvoices = [];
    var statusIds = [StatusKeys.BILLING_UNPAID];
    this._subscriptionPlanService.getInvoices(this.duesDatabaseHelper,statusIds).subscribe((response) => {
      if (response.status) {
        this.dueInvoices = response.object;
        this.totalDueInvoices = response.totalItems;
        if(this.invoices == null){
          this.dueInvoices =  new Array();
          this.totalDueInvoices = 0;
        }
      }else{
        this.dueInvoices =  new Array();
        this.totalDueInvoices = 0;
      }
      this.invoiceLoading = false;
    },(error)=>{
      this.invoiceLoading = false;
    });
  }
}
