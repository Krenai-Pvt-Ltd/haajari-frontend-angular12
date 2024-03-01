import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NavigationEnd, Router } from '@angular/router';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { Notification } from 'src/app/models/Notification';
import { DataService } from 'src/app/services/data.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { UserNotificationService } from 'src/app/services/user-notification.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  
  databaseHelper: DatabaseHelper = new DatabaseHelper();

  constructor(public dataService: DataService, 
    private router: Router,
    private rbacService: RoleBasedAccessControlService,
    private _notificationService: UserNotificationService,
    private _router: Router,
    private db: AngularFireDatabase) { }

  topbarValue: string | undefined;


  ngOnInit() {

    this.updateTopbarValue();

    this.router.events.subscribe(event => {
      this.updateTopbarValue();
    });
    this.getUserUUID();
    this.getFirebase();
  }

  private updateTopbarValue() {
    let routeValue = this.extractValueFromRoute(this.router.url);

    if(routeValue === "timetable"){
      routeValue = "Attendance Details";
    }

    if(routeValue === "role"){
      routeValue = "Roles & Security";
    }

    if(routeValue.includes("team-detail")){
      routeValue = "Team Details";
    }

    if(routeValue.includes("employee-profile")){
      routeValue = "Employee Profile";
    }

    if(routeValue.includes("leave-setting")){
      routeValue = "Leave Setting";

    }
    if(routeValue.includes("attendance-setting")){
      routeValue = "Attendance Setting";
    }

    if(routeValue.includes("company-setting")){
      routeValue = "Company Setting";
    }

    if(routeValue.includes("salary-setting")){
      routeValue = "Salary Setting";
    }

    if(routeValue.includes("add-role?roleId")){
      routeValue = "Edit Role";
    }

    if(routeValue.includes("account-settings?setting=accountDetails")){
      routeValue = "Account Details";
    }

    if(routeValue.includes("account-settings?setting=security")){
      routeValue = "Security";
    }

    if(routeValue.includes("account-settings?setting=profilePreferences")){
      routeValue = "Profile Preferences";
    }

    if(routeValue.includes("account-settings?setting=referralProgram")){
      routeValue = "Referral Program";
    }

    if(routeValue.includes("billing-payment?id=")){
      routeValue = "Billing & Payment";
    }

    if(routeValue.includes("setting/billing")){
      routeValue = "Subscription & Plan";
    }

    this.topbarValue = this.capitalizeFirstLetter(routeValue);
  }

  private extractValueFromRoute(route: string): string {
    return route.substring(1);
  }

  capitalizeFirstLetter(input: string): string {
    if (!input || input.length === 0) {
        return input;
    }

    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  UUID : any;
  async getUserUUID(){
    this.UUID = await this.rbacService.getUUID();
    this.getNotification(this.UUID,'notify')
    this.getMailNotification(this.UUID,'mail')
  }

  notificationList: Notification[]= new Array();
  totalNotification: number =0;
  loading: boolean = false;
  totalNewNotification: number = 0;
  getNotification(uuid:any,notificationType:string){
    this.loading = true;
    this._notificationService.getNotification(uuid, this.databaseHelper,notificationType).subscribe(response=>{
      if(response.status){
        this.notificationList = [...this.notificationList, ...response.object]
        this.totalNewNotification = response.object[0].newNotificationCount;
        this.totalNotification = response.totalItems;
        this.loading = false;
      }
      this.loading = false;
    })
  }

  mailList: Notification[]= new Array();
  totalMailNotification: number = 0;
  mailLoading: boolean = false;
  totalNewMailNotification: number = 0;
  getMailNotification(uuid:any,notificationType:string){
    this.mailLoading = true;
    this._notificationService.getMailNotification(uuid, this.databaseHelper,notificationType).subscribe(response=>{
      if(response.status){
        // this.mailList = response.object;
        this.mailList = [...this.mailList, ...response.object]
        this.totalNewMailNotification = response.object[0].newNotificationCount;
        this.totalMailNotification = response.totalItems;
        this.mailLoading = false;
      }
      this.mailLoading = false;
    })
  }

  fetchNotification(notificationType:string){
    this.mailList = [];
    this.notificationList = [];
    this.databaseHelper.currentPage = 1; 
    if(notificationType == 'mail'){
      this.getMailNotification(this.UUID,notificationType)
    }
    else
    {
      this.getNotification(this.UUID,notificationType);
    }

  }

  markAsReadAll(notificationType: string){
    this._notificationService.readAllNotification(this.UUID,notificationType).subscribe(response=>{
      if(response.status){
        this.getNotification(this.UUID,notificationType);
        
      }
    })
  }

  markMailAsReadAll(notificationType: string){
    this._notificationService.readAllNotification(this.UUID, notificationType).subscribe(response=>{
      if(response.status){
        this.getMailNotification(this.UUID,notificationType);
        
      }
    })
  }

  routeToPage(id:number){
    this._notificationService.readNotification(id).subscribe(response =>{
      if(response.status){
        this.getMailNotification(this.UUID,"mail");
      }
    })
    this._router.navigateByUrl("/leave-management");
  }

  timeAgo(value: Date): string {
    const currentDate = new Date();
    const date = new Date(value);
    const seconds = Math.floor((currentDate.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
      return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
    }
    return Math.floor(seconds) + ' second' + (Math.floor(seconds) === 1 ? '' : 's') + ' ago';
  }

  @HostListener('window:scroll', ['$event'])
  onMailScroll(event:any) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight-5) {
      if (this.mailList.length < this.totalNotification && !this.mailLoading &&
        this.databaseHelper.currentPage <= (this.totalNotification / this.databaseHelper.itemPerPage)) {
        this.databaseHelper.currentPage++;
        this.getMailNotification(this.UUID,"mail");
      }
    }
  }
  
  @HostListener('window:scroll', ['$event'])
  onNotificationScroll(event:any) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight-3) {
      if (this.notificationList.length < this.totalNotification && !this.loading &&
        this.databaseHelper.currentPage <= (this.totalNotification / this.databaseHelper.itemPerPage)) {
        this.databaseHelper.currentPage++;
        this.getNotification(this.UUID,"notify");
      }
    }
  }

  getFirebase()
  {
    // this.slackDataPlaceholderFlag=true;
    // console.log(bulkId)
    this.db.object("user_notification"+"/"+"organization_"+"/"+"user_").valueChanges()
      .subscribe(async res => {

        console.log(res);
        
        //@ts-ignore
        var res = res;


        //@ts-ignore
        this.percentage = res.percentage; 


        //@ts-ignore
        // if (res != undefined && res != null) {

          

        //    //@ts-ignore
        //   // if(res.flag==1){
        //   //   this.slackDataPlaceholderFlag=false;
        //   //   localStorage.removeItem('uniqueId');
        //   //   this.getTeamsByFiltersFunction();
        //   // }
        // }
      });
  }
  

}
