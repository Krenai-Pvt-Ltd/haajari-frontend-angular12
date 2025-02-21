import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { constant } from 'src/app/constant/constant';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { GstResponse } from 'src/app/models/GstResponse';
import { InvoiceDetail } from 'src/app/models/InvoiceDetail';
import { Invoices } from 'src/app/models/Invoices';
import { OrganizationSubscriptionDetail } from 'src/app/models/OrganizationSubscriptionDetail';
import { SubscriptionPlan } from 'src/app/models/SubscriptionPlan';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';
import { RAZOR_PAY_KEY } from 'src/environments/environment';
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
  requestForm: FormGroup;
  
  readonly Constant = constant; 
  constructor( public _subscriptionPlanService: SubscriptionPlanService,
    private _roleBasedService: RoleBasedAccessControlService,
    private _helperService: HelperService,
    private db: AngularFireDatabase,private ngZone: NgZone, private fb: FormBuilder, private dataService: DataService) {

      this.orgUuid = this._roleBasedService.userInfo.orgRefId;

      this.requestForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        empCount: ['', [Validators.required, Validators.min(1)]],
        description: ['', Validators.required],
      });

    }

  ngOnInit(): void {
    this.getCurrentSubscriptionPlan();
    this.getPlans();
    this.getActiveUserCount();
    this.fetchSubscriptionRequestInfo();
    this.getSubscriptionRequestStatus();
  }

  switchSubscriptionPlan() {
    this.planSwitch = this.planSwitch ? false : true;
  }
  switchRulesRegulation() {
    this.RulesRegulation = this.RulesRegulation ? false : true;
  }


  selectedSubscriptionPlan:SubscriptionPlan = new SubscriptionPlan();
  subscriptionPlans:SubscriptionPlan[] = new Array();
  typeBySubscriptionPlans: SubscriptionPlan[] = new Array();
  isShimmerForSubscriptionPlan : boolean = false;
  getPlans() {
    this.isShimmerForSubscriptionPlan = true;
    this._subscriptionPlanService.getPlans().subscribe((response) => {
      if(response.status){
        this.subscriptionPlans = response.object;
        if(this.subscriptionPlans == null){
          this.subscriptionPlans = new Array();
        }
      }else{
        this.subscriptionPlans = new Array();
      }
      this.isShimmerForSubscriptionPlan = false;
    }, (error) => {
      this.isShimmerForSubscriptionPlan = false;
    });

    
  }

  orgSubscriptionPlanDetail: OrganizationSubscriptionDetail = new OrganizationSubscriptionDetail();
  progress:number=0;
  getCurrentSubscriptionPlan(){
    this._subscriptionPlanService.getCurrentPlan().subscribe((response:any) => {
      if(response.status){
        this.orgSubscriptionPlanDetail = response.object;
        if(this.orgSubscriptionPlanDetail != null){
          this.progress =  (this.orgSubscriptionPlanDetail.quotaUsed/ this.orgSubscriptionPlanDetail.employeeQuota)* 100;
        }
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

  validateDowngrade:boolean=false;
  @ViewChild('downgradeModalButton')downgradeModalButton!:ElementRef;
  selectPlan(plan:SubscriptionPlan){
    // console.log("======Soooo",this.orgSubscriptionPlanDetail )
    this.selectedSubscriptionPlan = plan;
    this.typeBySubscriptionPlans = new Array();
    this.typeBySubscriptionPlans = this.subscriptionPlans.filter(x=> x.planType == this.selectedSubscriptionPlan.planType);
    if(this.orgSubscriptionPlanDetail !=null){
        if(this.orgSubscriptionPlanDetail.planName.toUpperCase() == 'PREMIUM' &&  this.selectedSubscriptionPlan.name.toUpperCase()== 'BASIC'){
          this.validateDowngrade = false;
          this.downgradeModalButton.nativeElement.click();
        }else{
          this.switchSubscriptionPlan();
        }
    }else{
      this.switchSubscriptionPlan();
    }
    if(this.totalEmployee>0){
      this.employeeCount = this.totalEmployee;
    }
    this.calculateEmployeeSize();
  }

  validateDowngradeConfirm(){
    this.validateDowngrade = this.validateDowngrade ? false: true;
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
  
  isValidEmployeeCount:boolean=false;
  calculateEmployeeSize(){
    if(this.employeeCount < this.totalEmployee){
      this.isValidEmployeeCount = false;
    }else{
      this.isValidEmployeeCount = true;
    }
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
        this.annualAmount =  this.employeeCount * plan.amount; 
      }
    }) 
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////=========SUBSCRIPTION===========///////////////////////////////////////////////////////


  isUnderProcess: boolean = false;
  realtimeDbSubscriber!: any;
  processingPayment: boolean = false;
  @ViewChild('sucessPaymentModalButton')sucessPaymentModalButton!:ElementRef;
  activatePlan() {
    this.createFirebaseForProcessing();
    var options = {
      "key": RAZOR_PAY_KEY,
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
    this._helperService.getRestrictedModules();
    this.removeCoupon();
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

verifyGstInputField():boolean{
  if(!this.gstLoading && this.gstNumber.length==15){
    return true;
  }else{
    return false;
  }
}

gstNumber:string='';
checkGst(){
  if(this.gstNumber.length == 15 && !this.gstLoading){
    this.verifyGst();
  }
}

  gstResponse: GstResponse = new GstResponse();
  gstLoading: boolean = false;
  verifyGst() {
    this.gstLoading = true;
    this._subscriptionPlanService.verifyGstNumber(this.gstNumber).subscribe((response) => {
      this.gstLoading = false;
      if (response.status) {
     
        this.gstResponse = response.object;
        if (this.gstResponse == null) {
             this.isVerified =false;
        } else {
             this.isVerified =true;
        }
      }else{
        this.isVerified =false;
      }   
    }, (error) => {
      this.gstLoading = false;
       this.isVerified =false;
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


  getInvoices(){
    this.duesDatabaseHelper = new DatabaseHelper();
    this.paidInvoiceDatabaseHelper = new DatabaseHelper();
    this.getDueInvoices();
    this.getPaidInvoices();
  }

  invoiceLoading:boolean = false;
  paidInvoiceDatabaseHelper:DatabaseHelper = new DatabaseHelper();
  invoices:Invoices[] = new Array();
  totalInvoices:number=0;
  getPaidInvoices() {
    this.invoiceLoading = true;
    this.invoices = [];
    var statusIds = [StatusKeys.BILLING_PAID];
    this._subscriptionPlanService.getInvoices(this.paidInvoiceDatabaseHelper,statusIds).subscribe((response) => {
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
    if(page!=this.paidInvoiceDatabaseHelper.currentPage){
      this.paidInvoiceDatabaseHelper.currentPage = page;
      this.getPaidInvoices();
    }
  }


  downloadInvoiceLoading:boolean=false;
  async download(invoice:any){
     this.downloadInvoiceLoading = true;
    if(!constant.EMPTY_STRINGS.includes(invoice.invoiceUrl)){
      window.open(invoice.invoiceUrl, "_blank");
      this.downloadInvoiceLoading = false;
    }else{
      await this.downloadInvoice(invoice.id);
      this.downloadInvoiceLoading = false;
    }
  }


  downloadingInvoice: boolean = false;
  async downloadInvoice(invoiceId: number) {
    this.downloadingInvoice = true;
    this.downloadInvoiceLoading = true;
    try {
      const response = await this._subscriptionPlanService.downloadInvoice(invoiceId).toPromise();
      this.downloadingInvoice = false;
      if (response.status && response.object) {
        window.open(response.object, "_blank");
      }
      this.downloadInvoiceLoading = false;
    } catch (error) {
      this.downloadingInvoice = false;
      this.downloadInvoiceLoading = false;
    }
  }

  // async downloadInvocie(invoiceUrl: string) {
  //   invoiceUrl = decodeURI(invoiceUrl);
  //   var fileName = invoiceUrl
  //     .substring(invoiceUrl.lastIndexOf('/'))
  //     .split('%2F')
  //     .join('/');
  //   fileName = fileName.split('%26').join('/');
  //   fileName = fileName.substring(fileName.lastIndexOf('/'));
  //   if (fileName.charAt(0) == '/') {
  //     fileName = fileName.substring(1);
  //   }
  //   fileName = fileName.substring(0, fileName.lastIndexOf('?'));
  //   const response = await fetch(invoiceUrl);
  //   const blob = await response.blob();
  //   const link = document.createElement("a");
  //   link.href = window.URL.createObjectURL(blob);
  //   link.download = fileName;
  //   link.click();
  // }

  dueInvoices:Invoices[] = new Array();
  totalDueInvoices :number=0;
  duesDatabaseHelper : DatabaseHelper = new DatabaseHelper();
  getDueInvoices(){
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
        }else{
          this.findTotalDuesAmount();
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

  totalDuesAmount:number=0;
  findTotalDuesAmount(){
    this.totalDuesAmount  =0;
    this.dueInvoices.forEach((invoice)=>{
      this.totalDuesAmount = this.totalDuesAmount + invoice.payableAmount;

    })
  }


  /////////////////////////////////////////////////////////////////=========INVOICE===========//////////////////////////////////////////////////////

  selectedInvoice: Invoices = new Invoices();
  invoiceIds:number[]= new Array();
  duesAmount:number=0;
  selectedDuesInvoice(invoice:Invoices){
    this.invoiceIds = [];
    this.selectedInvoice = invoice;
    this.invoiceIds.push(this.selectedInvoice.id);
    this.duesAmount = this.selectedInvoice.payableAmount;
    this.payInvoice();
  }

  payInvoice() {
    var options = {
      "key": RAZOR_PAY_KEY,
      "amount": this.duesAmount * 100,
      "name": "HAJIRI",
      "description": "Dues Payment",
      "image": "../../../../../assets/images/hajiri-icon.png",
      "handler": this.handleSuccesfullDuesPayment.bind(this),
      "modal": {
        "confirm_close": true,
        // "ondismiss": this.stopInvoiceProcessingPayment.bind(this)
      },
      "notes": {
        "orderFrom": 'Hajiri',
        "type": 'Bill',
        "orgUuid": this.orgUuid,
        "invoiceIds": String(this.invoiceIds),
      },
      "theme": {
        "color": "#6666f3"
      }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  }

@ViewChild('loaderModalButton')loaderModalButton!:ElementRef;
  handleSuccesfullDuesPayment(){
    this.createInvoiceFirebaseForProcessing();
    this.loaderModalButton.nativeElement.click();
  }


  createInvoiceFirebaseForProcessing() {
    this.ngZone.run(() => {
      var orgUuid = this.orgUuid.replace(/[^a-zA-Z0-9_]/g, "_");
      this.db.object("/invoices/paid_by_" + orgUuid).set({ status: "Processing" });
      this.isUnderProcess = true;
      this.getInvoiceStatusFromFirebase();
    });
  }

  stopInvoiceProcessingPayment() {
    this.ngZone.run(() => {
      var orgUuid = this.orgUuid.replace(/[^a-zA-Z0-9_]/g, "_");
      this.db.object("/invoices/paid_by_" + orgUuid).set({ status: "" });
      this.isUnderProcess = false;
    });
  }


  getInvoiceStatusFromFirebase() {
    var orgUuid = this.orgUuid.replace(/[^a-zA-Z0-9_]/g, "_");
    this.realtimeDbSubscriber = this.db.object("/invoices/paid_by_" + orgUuid).valueChanges()
      .subscribe((res: any) => {
        this.ngZone.run(() => {
          // console.log("/invoices/paid_by_" + orgUuid + "---" + JSON.stringify(res));
          if (res != null) {
            if (res.status == "Processing") {
              this.isUnderProcess = true;
            } else if (res.status == "Complete") {
  
              if (this.realtimeDbSubscriber) {
                this.realtimeDbSubscriber.unsubscribe();
              }
              this.isUnderProcess = false;
              this.afterSuccessfulInvoicePayment();
              this.stopInvoiceProcessingPayment(); 
            }
          }
        });
      });
  }


  afterSuccessfulInvoicePayment(){
    this.getInvoices();
    this._subscriptionPlanService.isSubscriptionPlanExpired();
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  

@ViewChild('closemodal')closemodal!:ElementRef;
submitRequest() {
  if (this.requestForm.valid) {
    this.dataService.createSubscriptionInquiryRequest(this.requestForm.value).subscribe({
      next: (response) => {
        // alert('Request submitted successfully!');
        this.getSubscriptionRequestStatus();
        this.closemodal.nativeElement.click();
        this.requestForm.reset();
      },
      error: (error) => {
        // alert('Error submitting request');
        console.error(error);
      }
    });
  } else {
    alert('Please fill out the form correctly.');
  }
}


fetchSubscriptionRequestInfo(): void {
  this.dataService.getSubscriptionRequestInfo().subscribe({
    next: (response) => {
      if (response.status) {
        const data = response.object;
        this.requestForm.patchValue({
          name: data.name,
          email: data.email,
          phone: data.phoneNumber,
          empCount: data.totalEmpCount
        });
      } else {
        console.log("error fetching subscription request info");
        // alert('Failed to load subscription request info');
      }
    },
    error: (err) => {
      console.error(err);
      // alert('Error fetching subscription request info');
    }
  });
}

pendingSubscriptionRequestStatus: boolean = false;
getSubscriptionRequestStatus(): void {
  this.dataService.getSubscriptionRequestStatus().subscribe({
    next: (response) => {
      if (response.status) {
        if(response.object===0) {
          this.pendingSubscriptionRequestStatus = true;
        }else if(response.object===1) {
          this.pendingSubscriptionRequestStatus = false;
        };
      } else {
        console.log("error fetching subscription request info");
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
}




}
