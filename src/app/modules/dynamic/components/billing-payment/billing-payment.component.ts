import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SubscriptionPlan } from 'src/app/models/SubscriptionPlan';
import { SubscriptionPlanReq } from 'src/app/models/SubscriptionPlanReq';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';
import { Location } from '@angular/common';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
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
  constructor(
    private _activeRouter: ActivatedRoute,
    private _subscriptionPlanService: SubscriptionPlanService,
    private router: Router,
    private _location: Location,
    private roleBased: RoleBasedAccessControlService
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
  }

  getSubscriptionPlanDetails() {
    debugger;
    let id = this._activeRouter.snapshot.queryParamMap.get('id')!;
    this._subscriptionPlanService
      .getSubscriptionPlan(id)
      .subscribe((response) => {
        if (response.status) {
          this.subscriptionPlan = response.object;
          this.sbscriptionPlanReq.amount =
            this.sbscriptionPlanReq.noOfEmployee *
              this.subscriptionPlan.amount *
              12 -
            (this.sbscriptionPlanReq.noOfEmployee *
              this.subscriptionPlan.amount *
              20 *
              12) /
              100;
          this.taxAmount = (this.sbscriptionPlanReq.amount * 18) / 100;
          this.totalAmount = this.sbscriptionPlanReq.amount + this.taxAmount;
        }
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

  selecrPlanType(value: string) {
    debugger;
    this.sbscriptionPlanReq.planType = value;
    this.sbscriptionPlanReq.amount =
      this.sbscriptionPlanReq.noOfEmployee * this.subscriptionPlan?.amount;
    if (this.sbscriptionPlanReq.planType == 'annual') {
      this.sbscriptionPlanReq.amount =
        this.sbscriptionPlanReq.noOfEmployee *
          this.subscriptionPlan?.amount *
          12 -
        (this.sbscriptionPlanReq.noOfEmployee *
          this.subscriptionPlan?.amount *
          20 *
          12) /
          100;
    }
    this.taxAmount = (this.sbscriptionPlanReq.amount * 18) / 100;
    this.totalAmount = this.sbscriptionPlanReq.amount + this.taxAmount;

    this.couponCode = '';
    this.isCouponVerify = false;
    this.couponDiscount = 0;
  }

  getCalcu(value: any) {
    this.sbscriptionPlanReq.amount = 0;
    this.taxAmount = 0;
    this.monthlyAmount = value * this.subscriptionPlan?.amount;
    this.annualAmount =
      this.monthlyAmount * 12 - (this.monthlyAmount * 12 * 20) / 100;
    this.selecrPlanType('annual');
    this.couponCode = '';
    this.getCouponInput();
  }

  processingPayment: boolean = false;
  razorKey: string = 'rzp_test_Wd1RYd0fng3673';
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
      // "prefill": {
      //   "name": 'Your Name',
      //   "email": 'xyz@test.com'
      // },
      notes: {
        orgUuid: this.orgUuid,
        orderId: 'order-12',
        type: 'subscription order',
        planType: this.sbscriptionPlanReq.planType,
        orderFrom: 'Hajiri',
        subscriptionPlanId: this.subscriptionPlan.id,
        noOfEmployee: this.sbscriptionPlanReq.noOfEmployee,
      },
      // ,
      // "theme": {
      //   "color": "#2196f3"
      // }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  }

  isPaymentDone: boolean = false;
  checkout(value: any) {
    console.log('transaction id', value);
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
  applyCoupon() {
    this._subscriptionPlanService
      .verifyCoupon(this.couponCode, this.totalAmount)
      .subscribe((response) => {
        if (response.status) {
          this.coupon = response.object;
          this.tempTotalAmount = this.totalAmount;
          this.couponDiscount = this.totalAmount - response.totalItems;
          this.totalAmount = response.totalItems;
          this.isCouponVerify = true;
        } else {
          this.message = 'Invalid coupon code';
        }
      });
  }

  getCouponInput() {
    this.message = '';
    if (this.isCouponVerify) {
      this.totalAmount = this.tempTotalAmount;
    }
    this.isCouponVerify = false;
    this.couponDiscount = 0;
  }
}
