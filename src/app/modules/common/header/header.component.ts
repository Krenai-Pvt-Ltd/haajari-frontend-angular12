import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Console } from 'console';
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
  people: string[] = ['onboarding', 'team'];
  management: string[] = ['attendance', 'leave setting', 'report', 'asset', 'coin'];
  payroll: string[] = ['payroll dashboard', 'bonus or deduction', 'epf esi tds', 'salary slip'];
  company: string[] = ['company setting', 'attendance setting', 'leave setting','salary setting', 'role & permission'];
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

  // shouldDisplay(moduleName: string): boolean {
  //   const role = this.rbacService.getRoles();
  //   if( role === Key.ADMIN ){
  //     return true;
  //   }
  //   console.log("my helper service",this.helperService.subModuleResponseList );
  //   console.log(this.helperService.subModuleResponseList.some((module:any)=> module.name.toLowerCase()==moduleName));
  //   console.log(moduleName);
  //   return (

  //     (this.helperService.subModuleResponseList.some((module:any)=> module.name.toLowerCase()==moduleName))
  //   );
  // }

  shouldDisplay(moduleName: string): boolean {
    const role = this.rbacService.getRoles();

    // If the role is admin, grant access to all modules
    if (role === Key.ADMIN) {
      return true;
    }

    // Check if we already have a cached response list
    if (this.helperService.subModuleResponseList && this.helperService.subModuleResponseList.length > 0) {
      // Perform the module name matching
      return this.helperService.subModuleResponseList.some(
        (module: any) => module.name.toLowerCase() === moduleName.toLowerCase()
      );
    }

    // If there's no cached response, fetch the data and update the helper service
    this.dataService.getAccessibleSubModuleResponse().subscribe(
      (response: any[]) => {
        this.helperService.subModuleResponseList = response;

        // Perform the module name matching after fetching data
        return response.some(
          (module: any) => module.name.toLowerCase() === moduleName.toLowerCase()
        );
      },
      (error) => {
        console.error('Error fetching accessible submodules:', error);
        return false;
      }
    );

    // Return false by default if data is not yet fetched
    return false;
  }


  checkModule(element: string[]): boolean {
    const role = this.rbacService.getRoles();
    if( role === Key.ADMIN ){
      return true;
    }
    for (let i = 0; i < element.length; i++) {
      if((this.helperService.subModuleResponseList.some((module:any)=> module.name.toLowerCase()==element[i].toLowerCase()))){
        return true;
      }
    }
    return false;
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

  //Management navigation
  activeIndex: number = 0;
  hoverIndex: number | null = null;
  sliderStyle: any = {};
  sliderStyle2: any = {};
  sliderStyle3: any = {};
  sliderStyle4: any = {};
  sliderStyle5: any = {};

  setActive(index: number) {
    this.activeIndex = index;
    this.updateSliderStyle(index);
  }
  resetHoverIndex() {
    this.sliderStyle = {
      opacity: 0,
      transform: `translateY(0)px`,
    };
  }

  updateSliderStyle(index: number) {
    const itemheight = (100 / 2)-8;
    this.sliderStyle = {
      opacity: 1, transform: `translateY(${index * itemheight}px)`,
    };
  }


  //People navigation

  setActive2(index: number) {
    this.activeIndex = index;
    this.updateSliderStyle2(index);
  }
  resetHoverIndex2() {
    this.sliderStyle2 = {
      opacity: 0,
      transform: `translateY(0)px`,
    };
  }

  updateSliderStyle2(index: number) {
    const itemheight = (100 / 2)-8;
    this.sliderStyle2 = {
      opacity: 1, transform: `translateY(${index * itemheight}px)`,
    };
  }
  //Payroll navigation
  setActive3(index: number) {
    this.activeIndex = index;
    this.updateSliderStyle3(index);
  }
  resetHoverIndex3() {
    this.sliderStyle3 = {
      opacity: 0,
      transform: `translateY(0)px`,
    };
  }

  updateSliderStyle3(index: number) {
    const itemheight = (100 / 2)-8;
    this.sliderStyle3 = {
      opacity: 1, transform: `translateY(${index * itemheight}px)`,
    };
  }


  //Company navigation
  setActive4(index: number) {
    this.activeIndex = index;
    this.updateSliderStyle4(index);
  }
  resetHoverIndex4() {
    this.sliderStyle4 = {
      opacity: 0,
      transform: `translateY(0)px`,
    };
  }

  updateSliderStyle4(index: number) {
    const itemheight = (100 / 2)-8;
    this.sliderStyle4 = {
      opacity: 1, transform: `translateY(${index * itemheight}px)`,
    };
  }

   //Dashboard navigation
  setActive5(index: number) {
    this.activeIndex = index;
    this.updateSliderStyle5(index);
  }
  resetHoverIndex5() {
    this.sliderStyle5 = {
      opacity: 0,
      transform: `translateY(0)px`,
    };
  }

  updateSliderStyle5(index: number) {
    const itemheight = (100 / 2)-8;
    this.sliderStyle5 = {
      opacity: 1, transform: `translateY(${index * itemheight}px)`,
    };
  }
}
