import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { OrganizationSubscriptionPlanMonthDetail } from 'src/app/models/OrganizationSubscriptionPlanMonthDetail';
import { LoggedInUser } from 'src/app/models/logged-in-user';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  loggedInUser: LoggedInUser = new LoggedInUser();

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private helperService: HelperService,
    private dataService: DataService, 
    private rbacService: RoleBasedAccessControlService,
    private _subscriptionPlanService:SubscriptionPlanService
  ) { 
    // if (this.route.snapshot.queryParamMap.has('userId')) {
    //     this.activeTab = 'dashboard';
    //   }
    }

  ngOnInit(): void {
    this.getUserUUID();
    this.getLoggedInUserDetails();

    this.route.queryParams.subscribe(params => {
      const setting = params['setting'];
      const dashboardActive = params['dashboardActive'];

      if (dashboardActive === 'true') {
        this.activeTab = 'dashboard';
      }else if (setting === 'accountDetails') {
        this.activeTab = 'accountDetails';
      } else if (setting === 'security') {
        this.activeTab = 'security';
      } else if (setting === 'profilePreferences') {
        this.activeTab = 'profilePreferences';
      } else if (setting === 'referralProgram') {
        this.activeTab = 'referralProgram';
      }
    });
     
    this.getOrgSubsPlanMonthDetail();
  }

  setActiveTabEmpty(){
    this.activeTab = '';
  }

  ADMIN = Key.ADMIN;
  USER = Key.USER;
  MANAGER = Key.MANAGER;

  // ROLE = this.rbacService.getRole();
  ROLE: any;
  UUID : any;

  async getUserUUID(){
    this.UUID = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
  }

  async getLoggedInUserDetails(){
    this.loggedInUser = await this.helperService.getDecodedValueFromToken();
  }

  getFirstAndLastLetterFromName(name: string): string {
    let words = name.split(' ');
    if (words.length >= 2) {
      let firstLetter = words[0].charAt(0);
      let lastLetter = words[words.length - 1].charAt(0);
      return firstLetter + lastLetter;
    } else {
      return name.charAt(0);
    }
  }

  onLogout(){
    localStorage.clear();
    this.rbacService.clearRbacService();
    this.helperService.clearHelperService();
    this.router.navigate(['/login']);
  }

  routeToAccountPage(tabName: string){
    this.dataService.activeTab = tabName !== 'account';
    this.router.navigate(["/setting/account-settings"], { queryParams: {tab: tabName } });
  }
   
  routeToEmployeeProfilePage(){
    // this.router.navigate(["/employee-profile"], { queryParams: {"userId":  this.UUID} });
    this.activeTab = 'dashboard';
    this.router.navigate(['/employee-profile'], { queryParams: { userId: this.UUID, dashboardActive: 'true' } });
  }

  show:boolean=false;

    shouldDisplay(moduleName: string): boolean {
    const role = this.rbacService.getRoles(); // Assuming getRole returns a Promise<string>
    const modulesToShowForManager = ['dashboard', 'team', 'project', 'reports', 'attendance', 'leave-management'];
    const modulesToShowForUser = ['team', 'project'];
  
    return role === Key.ADMIN || 
           (role === Key.MANAGER && modulesToShowForManager.includes(moduleName)) || 
           (role === Key.USER && modulesToShowForUser.includes(moduleName));
  }
  
  
  activeTab:string='';


  routeToSeetings(settingType:string){
    debugger
  //  this.activeTab=settingType;
    let navigationExtra : NavigationExtras = {
      queryParams : {"setting": settingType},
    }
    this.router.navigate(['/setting/account-settings'], navigationExtra);
  }

  OrgSubsPlanMonthDetail: OrganizationSubscriptionPlanMonthDetail = new OrganizationSubscriptionPlanMonthDetail();
  getOrgSubsPlanMonthDetail(){
    this._subscriptionPlanService.getOrgSubsPlanMonthDetail().subscribe(response=>{
      if(response.status){
        this.OrgSubsPlanMonthDetail = response.object;
      }
    })
  }
}
