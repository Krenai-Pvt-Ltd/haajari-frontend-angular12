import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { Routes } from 'src/app/constant/Routes';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { Notification } from 'src/app/models/Notification';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { UserNotificationService } from 'src/app/services/user-notification.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  employeeProfileRoute : string = '';
  readonly Routes=Routes;
  constructor(
    public dataService: DataService,
    private router: Router,
    public rbacService: RoleBasedAccessControlService,
    private _notificationService: UserNotificationService,
    private helperService:HelperService,
    private _router: Router,
    private db: AngularFireDatabase,
    private onboardingService: OnboardingService
  ) {
    // this.employeeProfileRoute = Key.EMPLOYEE_PROFILE_ROUTE;
  }

  topbarValue: string | undefined;

  ROLE: any;
  // UUUI!:String;
  async ngOnInit() {
    // this.UUID = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    this.updateTopbarValue();

    this.router.events.subscribe((event) => {
      this.updateTopbarValue();
    });
    this.getUuids();
  }
  routeDesc:any="Here's what's going on today.";
  private updateTopbarValue() {
    let routeValue = window.location.pathname;
    var routeDesc=this.routeDesc;
   switch(routeValue){

    case this.Routes.DASHBOARD:{
      routeValue = 'Dashboard';
      routeDesc="Organizational Performance Overview"
      break;
    }
    case this.Routes.EMPLOYEEONBOARDING:{
      routeValue = 'Employee';
      routeDesc="Streamline the Integration of New Hires"
      break;
    }
    case this.Routes.TEAM:{
      routeValue = 'Team';
      routeDesc="Manage and Organize Employee Groups"
      break;
    }
    case this.Routes.TEAMDETAIL:{
      routeValue = 'Team Detail';
      routeDesc="Manage and Organize Employee Groups"
      break;
    }
    case this.Routes.TIMETABLE:{
      routeValue = 'Attendance Details';
      routeDesc="Monitor Employee Attendance Records"
      break;
    }
    case this.Routes.LEAVEMANAGEMENT:{
      routeValue = 'Leave-management';
      routeDesc="Handle Leave Requests and Approvals"
      break;
    }
    case this.Routes.LEAVEMANAGEMENTS:{
      routeValue = 'Leave-managements';
      routeDesc="Handle Leave Requests and Approvals"
      break;
    }
    case this.Routes.EXPENSE:{
      routeValue = 'Expense';
      routeDesc="Manage Employee Expense Reimbursements"
      break;
    }
    case this.Routes.ASSETS:{
      routeValue = 'Assets';
      routeDesc="Track and Assign Company Assets"
      break;
    }
    case this.Routes.REPORTS:{
      routeValue = 'Reports';
      routeDesc="Generate Comprehensive HR Reports"
      break;
    }
    case this.Routes.COINS:{
      routeValue = 'Super Coins';
      routeDesc="Employee Rewards and Recognition System"
      break;
    }
    case this.Routes.PAYROLLDASHBOARD:{
      routeValue = 'Payroll Dashboard';
      routeDesc="Manage and Review Payroll Processes"
      break;
    }
    case this.Routes.BONUSDEDUCTION:{
      routeValue = 'Bonus And Deduction';
      routeDesc="Handle Bonuses and Salary Deductions"
      break;
    }
    case this.Routes.EPFESITDS:{
      routeValue = 'EPF, ESI & TDS';
      routeDesc="Manage Statutory Contributions and Taxe"
      break;
    }
    case this.Routes.PAYMENTHISTORY:{
      routeValue = 'Generate Salary Slip';
      routeDesc="Create and Distribute Salary Statements"
      break;
    }
    case this.Routes.COMPANYSETTING:{
      routeValue = 'Company Setting';
      routeDesc="Configure Organizational Policies"
      break;
    }
    case this.Routes.ATTENDANCESETTING:{
      routeValue = 'Attendance Setting';
      routeDesc="Customize Attendance Rules and Policies"
      break;
    }
    case this.Routes.LEAVESETTING:{
      routeValue = 'Leave Setting';
      routeDesc="Define and Manage Leave Policies"
      break;
    }
    case this.Routes.SALARYSETTING:{
      routeValue = 'Salary Setting';
      routeDesc="Establish Salary Structures and Plans"
      break;
    }
    case this.Routes.ROLE:{
      routeValue = 'Roles & Security';
      routeDesc="Control User Roles and Permissions"
      break;
    }
    case this.Routes.EXITPOLICY:{
      routeValue = 'Exit-policy';
      routeDesc="Manage Employee Exiting Processes"
      break;
    }
    case this.Routes.SUBSCRIPTION:{
      routeValue = 'Billing & Subscription';
      routeDesc="Handle Billing and Subscriptions"
      break;
    }
    case this.Routes.ACCOUNTSETTINGS:{
      routeValue = 'Account Details';
      routeDesc="Update and View Personal Information"
      break;
    }
    case this.Routes.INBOX:{
      routeValue = 'Inbox';
      routeDesc="Your Centralize Notifications Hub"
      break;
    }
    case this.Routes.ASSETSMANAGEMENT:{
      routeValue = 'Assets';
      routeDesc="Track and Assign Company Assets"
      break;
    }
    case this.Routes.FAQ:{
      routeValue = 'FAQ';
      routeDesc="Frequently Asked Question"
      break;
    }
    case this.Routes.FAQDETAIL:{
      routeValue = 'FAQ Detail';
      routeDesc="Frequently Asked Question Detail"
      break;
    }
    case this.Routes.EXPENSEMANAGEMENT:{
      routeValue = 'Expense Management';
      routeDesc="Manage Employee Expense Reimbursements"
      break;
    }
    case this.Routes.PAYROLL:{
      routeValue = 'Payroll Overview';
      routeDesc="Manage and Review Payroll Processes"
      break;
    }

   }

    this.topbarValue = this.capitalizeFirstLetter(routeValue);
    this.routeDesc=routeDesc;
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

  UUID: any;
  orgUuid: any;
  async getUuids() {
    this.UUID = await this.rbacService.getUUID();
    this.employeeProfileRoute = `${Key.EMPLOYEE_PROFILE_ROUTE}?userId=${this.UUID}`;
    // this.employeeProfileRoute = Key.EMPLOYEE_PROFILE_ROUTE +'?userId={{UUID}}';
    this.orgUuid = await this.rbacService.getOrgRefUUID();
    this.getFirebase(this.orgUuid, this.UUID);
  }

  notificationList: Notification[] = new Array();
  totalNotification: number = 0;
  loading: boolean = false;
  totalNewNotification: number = 0;
  getNotification(orgUuid: any, uuid: any, notificationType: string) {
    debugger;
    this.loading = true;
    this._notificationService
      .getNotification(orgUuid, uuid, this.databaseHelper, notificationType)
      .subscribe((response) => {
        if (response.status) {
          this.notificationList = [
            ...this.notificationList,
            ...response.object,
          ];
          this.totalNewNotification = response.object[0].newNotificationCount;
          this.totalNotification = response.totalItems;
          this.loading = false;
        }
        this.loading = false;
      });
  }

  mailList: Notification[] = new Array();
  totalMailNotification: number = 0;
  mailLoading: boolean = false;
  totalNewMailNotification: number = 0;
  getMailNotification(uuid: any, notificationType: string) {
    debugger;
    this.mailLoading = true;
    this._notificationService
      .getMailNotification(uuid, this.databaseHelper, notificationType)
      .subscribe((response) => {
        if (response.status) {
          this.mailList = [...this.mailList, ...response.object];
          this.totalNewMailNotification =
            response.object[0].newNotificationCount;
          this.totalMailNotification = response.totalItems;
          this.mailLoading = false;
        }
        this.mailLoading = false;
      });
  }

  fetchNotification(notificationType: string) {
    debugger;
    this.mailList = [];
    this.notificationList = [];
    this.databaseHelper.currentPage = 1;
    if (notificationType == 'mail') {
      this.getMailNotification(this.UUID, notificationType);
    } else {
      this.getNotification(this.orgUuid, this.UUID, notificationType);
    }
  }

  markAsReadAll(notificationType: string) {
    debugger;
    this._notificationService
      .readAllNotification(this.UUID, notificationType)
      .subscribe((response) => {
        if (response.status) {
          this.getNotification(this.orgUuid, this.UUID, notificationType);
        }
      });
  }

  markMailAsReadAll(notificationType: string) {
    debugger;
    this._notificationService
      .readAllNotification(this.UUID, notificationType)
      .subscribe((response) => {
        if (response.status) {
          this.getMailNotification(this.UUID, notificationType);
        }
      });
  }

  routeToPage(id: number) {
    this._notificationService.readNotification(id).subscribe((response) => {
      if (response.status) {
        this.getMailNotification(this.UUID, 'mail');
      }
    });
    this._router.navigateByUrl('/leave-management');
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
    return (
      Math.floor(seconds) +
      ' second' +
      (Math.floor(seconds) === 1 ? '' : 's') +
      ' ago'
    );
  }

  @HostListener('window:scroll', ['$event'])
  onMailScroll(event: any) {
    if (
      event.target.offsetHeight + event.target.scrollTop >=
      event.target.scrollHeight - 5
    ) {
      if (
        this.mailList.length < this.totalNotification &&
        !this.mailLoading &&
        this.databaseHelper.currentPage <=
          this.totalNotification / this.databaseHelper.itemPerPage
      ) {
        this.databaseHelper.currentPage++;
        this.getMailNotification(this.UUID, 'mail');
      }
    }
  }

  @HostListener('window:scroll', ['$event'])
  onNotificationScroll(event: any) {
    if (
      event.target.offsetHeight + event.target.scrollTop >=
      event.target.scrollHeight - 3
    ) {
      if (
        this.notificationList.length < this.totalNotification &&
        !this.loading &&
        this.databaseHelper.currentPage <=
          this.totalNotification / this.databaseHelper.itemPerPage
      ) {
        this.databaseHelper.currentPage++;
        this.getNotification(this.orgUuid, this.UUID, 'notify');
      }
    }
  }

  newNotiication: boolean = false;
  getFirebase(orgUuid: any, userUuid: any) {
    this.db
      .object(
        'user_notification' +
          '/' +
          'organization_' +
          orgUuid +
          '/' +
          'user_' +
          userUuid
      )
      .valueChanges()
      .subscribe(async (res) => {
        //@ts-ignore
        if (res?.flag != undefined && res?.flag != null) {
          //@ts-ignore
          this.newNotiication = res?.flag == 1 ? true : false;
        }
      });
  }

  logout() {
    localStorage.clear();
    this.helperService.orgStepId = 0;
    this.helperService.stepId = 0;
    // this.onboardingService.isLoadingOnboardingStatus = true;
    this.rbacService.clearRbacService();
    this.helperService.clearHelperService();
    this.router.navigate(['/login']);
  }

  routeToAccountPage(tabName: string) {
    this.router.navigate(['/setting/account-settings'], {
      queryParams: { setting: tabName },
    });
  }

  routeToEmployeeProfilePage() {
    this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], {
      queryParams: { userId: this.UUID, dashboardActive: 'true' },
    });
  }

  routeToInbox() {
    this.router.navigate(["/inbox"]);
  }
}
