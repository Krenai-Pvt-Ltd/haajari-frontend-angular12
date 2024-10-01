import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SubscriptionPlan } from 'src/app/models/SubscriptionPlan';
import { SubscriptionPlanReq } from 'src/app/models/SubscriptionPlanReq';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';
import { Location } from '@angular/common';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { DataService } from 'src/app/services/data.service';
import { AdminPersonalDetailResponse } from 'src/app/models/admin-personal-detail-response';
import { Key } from 'src/app/constant/key';
declare var Razorpay: any;

@Component({
  selector: 'app-billing-payment',
  templateUrl: './billing-payment.component.html',
  styleUrls: ['./billing-payment.component.css'],
})
export class BillingPaymentComponent implements OnInit {
  subscriptionPlan: SubscriptionPlan = new SubscriptionPlan();
  sbscriptionPlanReq: SubscriptionPlanReq = new SubscriptionPlanReq();
  activeUserCount: number = 0;
  taxAmount: number = 0;
  totalAmount: number = 0;
  monthlyAmount: number = 0;
  annualAmount: number = 0;
  orgUuid: string = '';
  name!: string;
  email!: string;
  phoneNumber!: string;

  constructor(
    private _activeRouter: ActivatedRoute,
    private _subscriptionPlanService: SubscriptionPlanService,
    private router: Router,
    private _location: Location,
    private roleBased: RoleBasedAccessControlService,
    private dataService: DataService
  ) {
    let token = localStorage.getItem('token')!;
    const helper = new JwtHelperService();
    // this.orgUuid = helper.decodeToken(token).orgRefId;
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.orgUuid = this.roleBased.getOrgRefUUID();
    this.getPlanPurchasedStatus();
    this.getSubscriptionPlanDetails();
    this.getActiveUserCount();
    this.selecrPlanType('annual');
    this.getAdminPersonalDetailMethodCall();
  }
  getAdminPersonalDetailMethodCall() {
    this.dataService.getAdminPersonalDetail().subscribe((response: AdminPersonalDetailResponse) => {
      this.name = response.name;
      this.email = response.email;
      this.phoneNumber = response.phoneNumber;
    }, error => {
      console.error('Error fetching admin details', error);
    });
  }


  totalEmployee: number = 0;
  getActiveUserCount() {
    debugger;
    this._subscriptionPlanService.getActiveUserCount().subscribe((response) => {
      if (response.status) {
        this.sbscriptionPlanReq.noOfEmployee = response.totalItems;
      }
    });
  }

  

  getCalcu(value: any) {
    this.sbscriptionPlanReq.amount = 0;
    this.taxAmount = 0;
    this.monthlyAmount = value * this.subscriptionPlan?.amount;
    this.annualAmount =
      this.monthlyAmount * 12 - (this.monthlyAmount * 12 * 20) / 100;
    this.selecrPlanType('annual');
    // this.couponCode = '';
    // this.getCouponInput();
  }

  processingPayment: boolean = false;
  verifiedCoupon!: string;
  readonly razorKey = Key.razorKey;
  hajiri_logo: string = '../../../../../assets/images/hajiri-icon.png';

  openRazorPay(): void {
    debugger;
    // var response ={'razorpay_payment_id':"BY_PASS"};
    //this.payDues(response);
    //return;
    // this.orderId = this._data.cart.id + '';
    //  console.log(this.invoice.payableAmount);

    this.processingPayment = false;

    var options = {
      key: this.razorKey,
      amount: Math.round(this.totalAmount) * 100,
      name: 'Hajiri',
      description: 'Test Transaction',
      image: this.hajiri_logo,
      handler: this.checkout.bind(this),
      modal: {
        confirm_close: true,
        // "ondismiss": this.markPaymentFailed.bind(this)
      },
      "prefill": {
        "name": this.name,
        "email": this.email,
        "contact":this.phoneNumber
      },
      notes: {
        couponCode: this.verifiedCoupon,
        orgUuid: this.orgUuid,
        type: 'subscription order',
        planType: this.sbscriptionPlanReq.planType,
        orderFrom: 'Hajiri',
        subscriptionPlanId: this.subscriptionPlan.id,
        noOfEmployee: this.sbscriptionPlanReq.noOfEmployee,
      },
      // ,
      "theme": {
        "color": "#6666f3"
      }
      
        // "theme": {
        //     "color": "#3399cc" // Blue color theme
        // }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  }

  isPaymentDone: boolean = false;
  checkout(value: any) {
    // console.log('transaction id', value);
    // this.isPaymentDone = true;
    window.location.reload();
  }

  isPlanPurchased: boolean = false;
  getPlanPurchasedStatus() {
    let id = this._activeRouter.snapshot.queryParamMap.get('id')!;
    this._subscriptionPlanService
      .getPlanPurchasedStatus(id)
      .subscribe((response) => {
        this.isPlanPurchased = response;
        if (this.isPlanPurchased) {
          this.router.navigate(['/setting/success']);
        }
      });
  }

  paymentMethod: string = '';
  selectPaymentMethod(value: any) {
    this.paymentMethod = value;
  }

  proceedToPay() {
    if (this.paymentMethod == 'razorpay') {
      this.openRazorPay();
    }
  }

  couponCode: string = '';
  coupon: any;
  message: string = '';
  isCouponVerify: boolean = false;
  tempTotalAmount: number = 0;
  couponDiscount: number = 0;

  getCouponInput() {
    this.message = '';
    if (this.isCouponVerify) {
      this.totalAmount = this.tempTotalAmount;
    }
    this.isCouponVerify = false;
    this.couponDiscount = 0;
  }

  originalAmount: number = 0;

  applyCoupon() {
      this._subscriptionPlanService
          .verifyCoupon(this.couponCode, this.originalAmount, this.sbscriptionPlanReq.planType)
          .subscribe((response) => {
              if (response.status) {
                this.message = '';
                  this.coupon = response.object;
                  this.verifiedCoupon = response.object.couponCode;
                  this.tempTotalAmount = this.originalAmount;
                  this.couponDiscount = this.originalAmount - response.totalItems;
                  this.sbscriptionPlanReq.amount = response.totalItems;
                  this.isCouponVerify = true;
                  this.calculateTotalAmount();
              } else {
                  this.message = 'Invalid coupon code';
              }
          });
  }
  

  selecrPlanType(value: string) {
      this.sbscriptionPlanReq.planType = value;
      this.originalAmount = this.sbscriptionPlanReq.noOfEmployee * this.subscriptionPlan?.amount;
      this.sbscriptionPlanReq.amount = this.originalAmount;
      if (this.sbscriptionPlanReq.planType == 'annual') {
          this.originalAmount = this.sbscriptionPlanReq.noOfEmployee *
              this.subscriptionPlan?.amount * 12 - (this.sbscriptionPlanReq.noOfEmployee *
              this.subscriptionPlan?.amount * 20 * 12) / 100;
          this.sbscriptionPlanReq.amount = this.originalAmount;
      }
      if (this.isCouponVerify) {
          this.applyCoupon(); 
      } else {
          this.calculateTotalAmount();
      }
  }
  
  calculateTotalAmount() {
      this.taxAmount = (this.sbscriptionPlanReq.amount * 18) / 100;
      this.totalAmount = this.sbscriptionPlanReq.amount + this.taxAmount;
  }
  
  getSubscriptionPlanDetails() {
      let id = this._activeRouter.snapshot.queryParamMap.get('id')!;
      this._subscriptionPlanService
          .getSubscriptionPlan(id)
          .subscribe((response) => {
              if (response.status) {
                  this.subscriptionPlan = response.object;
                  this.originalAmount = this.sbscriptionPlanReq.noOfEmployee *
                      this.subscriptionPlan.amount * 12 - (this.sbscriptionPlanReq.noOfEmployee *
                      this.subscriptionPlan.amount * 20 * 12) / 100;
                  this.sbscriptionPlanReq.amount = this.originalAmount;
                  this.calculateTotalAmount();
              }
          });
  }
  

}
