import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { OrganizationSubscriptionPlanMonthDetail } from 'src/app/models/OrganizationSubscriptionPlanMonthDetail';
import { HelperService } from 'src/app/services/helper.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';
import { HttpClient } from '@angular/common/http';
declare var Razorpay: any;

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {

  subscriptionList :any[] = new Array() ;
  loading: boolean = false;
  newEmployee!: number;

  databaseHelper: DatabaseHelper = new DatabaseHelper();

  
  // currentDate: Date = new Date('2024-02-18');
  currentDate: Date;
  midDateOfMonth: Date;

  orgUuid: string = "";
  constructor(private _subscriptionPlanService:SubscriptionPlanService,
    private _router: Router,
    private helperService: HelperService,
    private http: HttpClient) { 
      let token = localStorage.getItem("token")!;
      const helper = new JwtHelperService();
      this.orgUuid = helper.decodeToken(token).orgRefId;

      this.currentDate = new Date();
      this.midDateOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 15);
    
    }

  ngOnInit(): void {
    this.getAllSubscription();
    this.getPurchasedStatus();
    this.getInvoices();
    this.getOrgSubsPlanMonthDetail();
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
    this._subscriptionPlanService.getDuePendingStatus().subscribe(response=>{
      if(!response){
        this._router.navigate(["/setting/billing-payment"], { queryParams: { id: id } });
        
      }else
      {
        this.helperService.showToast("Invoice Due Pendding", Key.TOAST_STATUS_ERROR);
        
      }
      
    })
  }

  isPurchased: boolean = false;
  getPurchasedStatus(){
    this._subscriptionPlanService.getPurchasedStatus().subscribe(response=>{
      this.isPurchased = response;
    })
  }

  totalAmount: number = 0;
  planAmount: number = 0;
  planId: number = 0;
  @ViewChild('addMoreEmployeeModal')addMoreEmployeeModal!:ElementRef
  @ViewChild('closeMoreEmployee')closeMoreEmployee!:ElementRef
  openAddMoreEmployeeModel(amount:any, planId:any){
    debugger
    this.newEmployee = 0;
    this.addMoreEmployeeModal.nativeElement.click();
    this.planAmount = amount;
    this.planId = planId;
  }

  addMoreEmployee(){
    debugger
    this.paymentFor = "add_employee"

    if(this.OrgSubsPlanMonthDetail.planType == "monthly"){
      if(this.currentDate > this.midDateOfMonth){
        this._subscriptionPlanService.addMoreEmployee(this.newEmployee).subscribe(response=>{
          if(response.status){
           this.closeMoreEmployee.nativeElement.click();
           this.helperService.showToast("Employee successfully added", Key.TOAST_STATUS_SUCCESS);
          }
        })
      }
      else
      {
        this.totalAmount = this.planAmount * this.newEmployee;
        this.totalAmount = this.totalAmount+ this.totalAmount*18/100
        this.openRazorPay();
      }
    }
    else
    {
      if(this.OrgSubsPlanMonthDetail.remainingMonths>0){
        this.totalAmount = this.planAmount * this.newEmployee* this.OrgSubsPlanMonthDetail.remainingMonths;
      this.totalAmount = this.totalAmount-this.totalAmount*20/100 //totalAmount with 20% discount
      this.totalAmount = this.totalAmount+ this.totalAmount*18/100 //totalAmount with 18% gst include
      
      this.openRazorPay();
      }
      else
      {
        this._subscriptionPlanService.addMoreEmployee(this.newEmployee).subscribe(response=>{
          if(response.status){
            this.closeMoreEmployee.nativeElement.click();
            this.helperService.showToast("Employee successfully added", Key.TOAST_STATUS_SUCCESS);
          }
        })
      }
    }
  }

  processingPayment: boolean = false;
  razorKey: string = "rzp_test_XIXZn1GUfeV9Mf"
  hajiri_logo: string = "../../../../../assets/images/hajiri-icon.png"

  openRazorPay(): void {
    debugger
    // var response ={'razorpay_payment_id':"BY_PASS"};
    //this.payDues(response);
    //return;
    // this.orderId = this._data.cart.id + '';
    //  console.log(this.invoice.payableAmount);

    this.processingPayment = false;

    var options = {
      "key": this.razorKey,
      "amount": Math.round(this.totalAmount)*100,
      "name": "Hajiri",
      "description": "Test Transaction",
      "image": this.hajiri_logo,
      "handler": this.checkout.bind(this),
      "modal": {
        "confirm_close": true,
        // "ondismiss": this.markPaymentFailed.bind(this)
      },
      // "prefill": {
      //   "name": 'Your Name',
      //   "email": 'xyz@test.com'
      // },
      "notes": {
        "orgUuid": this.orgUuid,
        "orderId": this.invoiceNo,
        "type": this.paymentFor,
        "orderFrom": "Hajiri",
        "subscriptionPlanId":this.planId,
        "noOfEmployee": this.newEmployee,
      }
      // ,
      // "theme": {
      //   "color": "#2196f3"
      // }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  }

  checkout(value:any){
    debugger
    if(this.paymentFor == "add_employee"){
      this.closeMoreEmployee.nativeElement.click();
      this.helperService.showToast("Employee successfully added", Key.TOAST_STATUS_SUCCESS);
      this.getInvoices();
    }
    else if(this.paymentFor == "due_invoice")
    {
      this.helperService.showToast("Payment Successful", Key.TOAST_STATUS_SUCCESS);
      this.getDueInvoices();
    }
    
    
  }

  invoicesList: any[] = new Array();
  totalInvoicesItems: number = 0 ;
  invoiceLoading: boolean = false;
  getInvoices(){
    debugger
    this.invoiceLoading = true;
    this.invoicesList = [];
    if (!this.pageToggle) {
      this.databaseHelper.currentPage = 1;
    }
    this._subscriptionPlanService.getInvoices(this.databaseHelper).subscribe(response=>{
      if(response.status){
        this.pageToggle = false;
        this.invoicesList = response.object;
        this.totalInvoicesItems = response.totalItems;
        this.invoiceLoading = false;
      }
      this.invoiceLoading = false;
    })
  }

  pageToggle: boolean = false;
  invoicesPageChanged(page: any){
    debugger
    this.databaseHelper.currentPage = page;
    this.pageToggle = true;
    this.getInvoices();
  }

  dueInvoicesList: any[] = new Array();
  getDueInvoices(){
    this._subscriptionPlanService.getDueInvoices().subscribe(response=>{
      if(response.status){
        this.dueInvoicesList = response.object;
      }
    })
  }

  planPurchasedLogList: any[] = new Array();
  totalItems: number = 0;
  databaseHelper1: DatabaseHelper = new DatabaseHelper();
  getPlanPurchasedLog(){
    this.loading = true;
    this.planPurchasedLogList = [];
    if (!this.pageToggle) {
      this.databaseHelper1.currentPage = 1;
    }
    this._subscriptionPlanService.getPlanPurchasedLog(this.databaseHelper1).subscribe(response=>{
      if(response.status){
        this.pageToggle = false;
        this.planPurchasedLogList = response.object;
        this.totalItems = response.totalItems;
        this.loading = false;
      }
      this.loading = false;
    })
  }

  pageChanged(page: any) {
    debugger
    this.databaseHelper1.currentPage = page;
    this.pageToggle = true;
    this.getPlanPurchasedLog();
  }

  OrgSubsPlanMonthDetail: OrganizationSubscriptionPlanMonthDetail = new OrganizationSubscriptionPlanMonthDetail();
  getOrgSubsPlanMonthDetail(){
    this._subscriptionPlanService.getOrgSubsPlanMonthDetail().subscribe(response=>{
      if(response.status){
        this.OrgSubsPlanMonthDetail = response.object;
        this.OrgSubsPlanMonthDetail.viewCard = 1;
      }
    })
  }

  num1: number = 10
  num2: number = 10;

  invoiceNo: string = '';
  paymentFor: string = '';
  proceedToPay(amount:any, invoiceNo:any){
    this.totalAmount = amount;
    this.invoiceNo = invoiceNo;
    this.paymentFor = "due_invoice";
    this.openRazorPay();
  }

  downloadInvocie(invoiceUrl:string){
    var fileName = (invoiceUrl.substring(invoiceUrl.lastIndexOf('/'))).split('%2F').join('/');
    fileName =fileName.split('%26').join('/');
    fileName = (fileName.substring(fileName.lastIndexOf('/')))
    if (fileName.charAt(0) == '/') {
      fileName = fileName.substring(1);
    }
    fileName = (fileName.substring(0,fileName.lastIndexOf('?')));
    this.http.get(invoiceUrl, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    });
  }

}
