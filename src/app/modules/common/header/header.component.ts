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
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  loggedInUser: LoggedInUser = new LoggedInUser();

  private _key: Key = new Key();
  private baseUrl = this._key.base_url;
  showSuperCoinFlag:boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private helperService: HelperService,
    private dataService: DataService,
    private rbacService: RoleBasedAccessControlService,
    private _subscriptionPlanService: SubscriptionPlanService
  ) {
    // if (this.route.snapshot.queryParamMap.has('userId')) {
    //     this.activeTab = 'dashboard';
    //   }
  }

  ngOnInit(): void {
    this.getUserUUID();
    this.getLoggedInUserDetails();

    this.route.queryParams.subscribe((params) => {
      const setting = params['setting'];
      const dashboardActive = params['dashboardActive'];

      if (dashboardActive === 'true') {
        this.activeTab = 'dashboard';
      } else if (setting === 'accountDetails') {
        this.activeTab = 'accountDetails';
      } else if (setting === 'security') {
        this.activeTab = 'security';
      } else if (setting === 'profilePreferences') {
        this.activeTab = 'profilePreferences';
      } else if (setting === 'referralProgram') {
        this.activeTab = 'referralProgram';
      }
    });

    if((this.baseUrl === 'https://staging.hajiri.work/api/v2') || (this.baseUrl === 'http://localhost:8080/api/v2')) {
        this.showSuperCoinFlag = true;
    } else {
       this.showSuperCoinFlag = false;
    }

    this.getOrgSubsPlanMonthDetail();
  }

  setActiveTabEmpty() {
    this.activeTab = '';
  }

  ADMIN = Key.ADMIN;
  USER = Key.USER;
  MANAGER = Key.MANAGER;
  KRENAI_UUID = Key.KRENAI_UUID;
  DEMO_ORGANIZATION_UUID = Key.DEMO_ORGANIZATION_UUID;

  // ROLE = this.rbacService.getRole();
  ROLE: any;
  UUID: any;
  ORGANIZATION_UUID: any;

  DASHBOARD: boolean = false;
  PEOPLE: boolean = false;
  MANAGEMENT: boolean = false;
  PAYROLL: boolean = false;
  COMPANY: boolean = false;

  async getUserUUID() {
    this.UUID = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    this.ORGANIZATION_UUID = await this.rbacService.getOrgRefUUID();
  }

  async getLoggedInUserDetails() {
    this.loggedInUser = await this.helperService.getDecodedValueFromToken();
    if (this.loggedInUser.name == '') {
      this.getOrganizationName();
    }
  }

  getOrganizationName() {
    debugger;
    this.dataService.getOrganizationDetails().subscribe(
      (data) => {
        this.loggedInUser.name = data.adminName;
      },
      (error) => {
        console.log(error);
      }
    );
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

  onLogout() {
    localStorage.clear();
    this.rbacService.clearRbacService();
    this.helperService.clearHelperService();
    this.router.navigate(['/login']);
  }

  routeToAccountPage(tabName: string) {
    // this.dataService.activeTab = tabName !== 'account';
    this.router.navigate(['/setting/account-settings'], {
      queryParams: { setting: tabName },
    });
  }

  routeToEmployeeProfilePage() {
    // this.router.navigate(["/employee-profile"], { queryParams: {"userId":  this.UUID} });
    this.activeTab = 'dashboard';
    this.router.navigate(['/employee-profile'], {
      queryParams: { userId: this.UUID, dashboardActive: 'true' },
    });
  }

  show: boolean = false;

  shouldDisplay(moduleName: string): boolean {
    const role = this.rbacService.getRoles(); 
    const modulesToShowForManager = [
      'dashboard',
      'team',
      'project',
      'reports',
      'attendance',
      'leave-management',
    ];
    const modulesToShowForUser = ['team', 'project', 'leave-management'];
    const modulesToShowForHRADMIN = ['onboarding'];

    return (
      role === Key.ADMIN ||
      (role === Key.MANAGER && modulesToShowForManager.includes(moduleName)) ||
      (role === Key.USER && modulesToShowForUser.includes(moduleName)) ||
      (role === Key.HRADMIN && modulesToShowForHRADMIN.includes(moduleName))
    );
  }

  // shouldDisplay(subModuleName: string){
  //   debugger;
  //   return this.rbacService.hasAccessToSubmodule(subModuleName);
  // }

  activeTab: string = '';

  routeToSettings(settingType: string) {
    //  this.activeTab=settingType;
    let navigationExtra: NavigationExtras = {
      queryParams: { setting: settingType },
    };
    this.router.navigate(['/setting/account-settings'], navigationExtra);
  }

  orgSubsPlanMonthDetail: OrganizationSubscriptionPlanMonthDetail = new OrganizationSubscriptionPlanMonthDetail();
  getOrgSubsPlanMonthDetail() {
    this._subscriptionPlanService
      .getOrgSubsPlanMonthDetail()
      .subscribe((response) => {
        if (response.status) {
          this.orgSubsPlanMonthDetail = response.object;
        }
      });
  }

  isCollapsed = true; // Initially collapsed
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
