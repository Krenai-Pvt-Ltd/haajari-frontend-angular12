import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Key } from 'src/app/constant/key';
import { AdminPersonalDetailResponse } from 'src/app/models/admin-personal-detail-response';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { OrganizationSubscriptionPlanMonthDetail } from 'src/app/models/OrganizationSubscriptionPlanMonthDetail';
import { SubscriptionPlan } from 'src/app/models/SubscriptionPlan';
import { SubscriptionPlanReq } from 'src/app/models/SubscriptionPlanReq';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';
declare var Razorpay: any;
@Component({
  selector: 'app-billing-and-subscription-page',
  templateUrl: './billing-and-subscription-page.component.html',
  styleUrls: ['./billing-and-subscription-page.component.css']
})
export class BillingAndSubscriptionPageComponent implements OnInit {


  constructor(
    private dataService: DataService,
    private router: Router,
    private datePipe: DatePipe,
    private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService,
    private modalService: NgbModal, 
    private _subscriptionPlanService: SubscriptionPlanService,
    private _activeRouter: ActivatedRoute,
    private roleBasedAccessControlService: RoleBasedAccessControlService,
    private ngZone:NgZone
  ) {
    
  
    let token = localStorage.getItem('token')!;
    const helper = new JwtHelperService();
  }
  ngOnInit(): void {
    this.orgUuid = this.roleBasedAccessControlService.getOrgRefUUID();
    this.getPurchasedStatus();
   
    this.selecrPlanType('annual');
    this.getActiveUserCount();
    this.getAdminPersonalDetailMethodCall();
    this.getAllSubscription();

  }

  routeToUserDashboard() {
    
    this.router.navigate(['/dashboard']);
  }

  selectedSubscriptionId: number = 3;

  subscriptionList: any[] = new Array();
  loading: boolean = false;
  getAllSubscription() {
    debugger;
    this.loading = true;
    this._subscriptionPlanService
      .getAllSubscriptionPlan()
      .subscribe((response) => {
        if (response.status) {
          this.subscriptionList = response.object;
          this.loading = false;
        }
        this.loading = false;
      });
  }

  selectSubscription(subscriptionId: number) {
    this.selectedSubscriptionId = subscriptionId;
  } 

  isPurchased: boolean = false;
  // @ViewChild('billingModal') billingModal!: ElementRef;
  getPurchasedStatus() {
    debugger;
    this._subscriptionPlanService.getPurchasedStatus().subscribe((response) => {
      this.isPurchased = response;
console.log(this.isPurchased)
      if (this.isPurchased == true) {
        this.routeToUserDashboard();
      } else {
        this.BILLING_AND_SUBSCRIPTION_MODAL_TOGGLE = true
        // this.billingModal.nativeElement.click();
       
      }
    });
  }

  routeToBillingPaymentPage(plandId : any) {
this.BILLING_AND_SUBSCRIPTION_MODAL_TOGGLE = false
this.getSubscriptionPlanDetails(plandId);
  }


  toggleBack() {
    this.BILLING_AND_SUBSCRIPTION_MODAL_TOGGLE = true;
  }





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
  BILLING_AND_SUBSCRIPTION_MODAL_TOGGLE : boolean = true ;


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
      "theme": {
        "color": "#6666f3"
      }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  }

  isPaymentDone: boolean = false;
  checkout(value: any) {
    debugger
    this.ngZone.run(() => {
    console.log('new transaction id', value);
    // this.isPaymentDone = true;
    this.router.navigate(['/dashboard']);
    // window.location.reload();
  })

  }

  isPlanPurchased: boolean = false;
  getPlanPurchasedStatus() {
    debugger
    let id = this._activeRouter.snapshot.queryParamMap.get('id')!;
    this._subscriptionPlanService
      .getPlanPurchasedStatus(id)
      .subscribe((response) => {
        this.isPlanPurchased = response;
        if (this.isPlanPurchased) {
          this.router.navigate(['/dashboard']);
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
  verifiedCoupon !: string;
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
                  console.log(this.verifiedCoupon);
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
  
  getSubscriptionPlanDetails(id: any) {
      
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
