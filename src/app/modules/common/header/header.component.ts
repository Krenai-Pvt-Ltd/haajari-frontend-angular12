import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { LoggedInUser } from 'src/app/models/logged-in-user';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

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
    private rbacService: RoleBasedAccessControlService
  ) { }

  ngOnInit(): void {
    this.getLoggedInUserDetails();

    this.route.queryParams.subscribe(params => {
      const setting = params['setting'];
      if (setting === 'accountDetails') {
        this.activeTab = 'accountDetails';
      } else if (setting === 'security') {
        this.activeTab = 'security';
      } else if (setting === 'profilePreferences') {
        this.activeTab = 'profilePreferences';
      } else if (setting === 'referralProgram') {
        this.activeTab = 'referralProgram';
      }
    });

  }

  ADMIN = Key.ADMIN;
  USER = Key.USER;
  MANAGER = Key.MANAGER;

  ROLE = this.rbacService.getRole();
  UUID : any;

  async getUserUUID(){
    this.UUID = this.rbacService.getUUID();
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
    this.router.navigate(["/employee-profile"], { queryParams: {"userId":  this.UUID} });
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
}
