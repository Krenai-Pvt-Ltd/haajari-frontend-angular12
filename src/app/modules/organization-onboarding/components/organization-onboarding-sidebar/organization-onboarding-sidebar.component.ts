import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { LoggedInUser } from 'src/app/models/logged-in-user';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-organization-onboarding-sidebar',
  templateUrl: './organization-onboarding-sidebar.component.html',
  styleUrls: ['./organization-onboarding-sidebar.component.css']
})
export class OrganizationOnboardingSidebarComponent implements OnInit {

  constructor(private dataService: DataService,
    private _onboardingService: OrganizationOnboardingService,
    private router: Router,
    private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService) { }

  onboardingViaString: string = '';

  ngOnInit(): void {
    this.getOnboardingStep();
    this.getUserUUID();
    this.getLoggedInUserDetails();

  }

  navigateTo(route: string, stepIndex: number): void {
    debugger
    if (this.dataService.stepIndex < (stepIndex - 1)) {
      
    } else {
      this.router.navigate([route]);
    }

  }

  getOnboardingStep() {
    debugger
    this._onboardingService.getOrgOnboardingStep().subscribe((response: any) => {
      if (response.status) {
        this.dataService.markStepAsCompleted(response.object.step);
        this.onboardingViaString = response.object.onboardingString;
        this.goToStep(response.object.step);
      }
    })
  }

  goToStep(index: string) {
    // console.log("Index to Go :", index);
    switch (index) {
      case "1": {
        this.router.navigate(['/organization-onboarding/personal-information']);
        // console.log("Step 1 is calling");
        break;
      }
      case "2": {
        this.router.navigate(['/organization-onboarding/upload-team']);
        // console.log("Step 2 is calling");
        break;
      }
      case "3": {
        this.router.navigate(['/organization-onboarding/shift-time-list']);
        // console.log("Step 3 is calling");
        break;
      }
      case "4": {
        this.router.navigate(['/organization-onboarding/attendance-mode']);
        // console.log("Step 4 is calling");
        break;
      }
      case "5": {
        this.router.navigate(['/dashboard']);
        // console.log("Step 5 is calling");
        break;
      }
      default: {
        this.router.navigate(['/organization-onboarding/personal-information']);
        // console.log("Step default is calling");
        break;
      }
    }

  }

  isStepCompleted(stepIndex: number): boolean {
    if (stepIndex <= this.dataService.stepIndex) {
      return true;
    } else {
      return false;
    }

  }

  onLogout(){
    localStorage.clear();
    this.rbacService.clearRbacService();
    this.helperService.clearHelperService();
    this.router.navigate(['/login']);
  }






  ADMIN = Key.ADMIN;
  USER = Key.USER;
  MANAGER = Key.MANAGER;
  KRENAI_UUID = Key.KRENAI_UUID;

  // ROLE = this.rbacService.getRole();
  ROLE: any;
  UUID : any;
  ORGANIZATION_UUID: any;
  loggedInUser: LoggedInUser = new LoggedInUser();



  async getUserUUID(){
    this.UUID = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();
    this.ORGANIZATION_UUID = await this.rbacService.getOrgRefUUID();
  }

  async getLoggedInUserDetails(){
    this.loggedInUser = await this.helperService.getDecodedValueFromToken();
    if(this.loggedInUser.name==''){
    this.getOrganizationName();
    }
    
  }

  getOrganizationName(){
    debugger
    this.dataService.getOrganizationDetails().subscribe((data)=> {
      this.loggedInUser.name = data.adminName;
      }, (error) => {
        console.log(error);
      });
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

  routeToAccountPage(tabName: string){
    // this.dataService.activeTab = tabName !== 'account';
    this.router.navigate(["/setting/account-settings"], { queryParams: {setting: tabName }});
  }
   
  routeToEmployeeProfilePage(){
    // this.router.navigate(["/employee-profile"], { queryParams: {"userId":  this.UUID} });
    // this.activeTab = 'dashboard';
    this.router.navigate(['/employee-profile'], { queryParams: { userId: this.UUID, dashboardActive: 'true' } });
  }
}





