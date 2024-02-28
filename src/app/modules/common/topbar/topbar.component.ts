import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
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
    private elementRef: ElementRef) { }

  topbarValue: string | undefined;


  ngOnInit() {

    this.updateTopbarValue();

    this.router.events.subscribe(event => {
      this.updateTopbarValue();
    });
    this.getUserUUID();
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
    this.getNotification(this.UUID)
  }

  notificationList: Notification[]= new Array();
  loading: boolean = false;
  totalNewNotification: number = 0;
  getNotification(uuid:any){
    this.loading = true;
    this._notificationService.getNotification(uuid, this.databaseHelper).subscribe(response=>{
      if(response.status){
        this.notificationList = response.object;
        this.totalNewNotification = response.totalItems;
        this.loading = false;
      }
      this.loading = false;
    })
  }

  markAsReadAll(){
    this._notificationService.readAllNotification(this.UUID).subscribe(response=>{
      if(response.status){
        this.getNotification(this.UUID);
        
      }
    })
  }

  scrollDownPagination(event: any) {
    const element = this.elementRef.nativeElement;
    const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight;

    console.log("vjndfn");
    if (atBottom && !this.loading && this.notificationList.length < this.totalNewNotification) {
      console.log("vjndfn");
      
      this.loading = true;
    }
  }
  

}
