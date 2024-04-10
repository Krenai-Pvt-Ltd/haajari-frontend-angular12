import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
        this.router.navigate(['/organization-onboarding/holiday-setting']);
        // console.log("Step 2 is calling");
        break;
      }
      case "3": {
        this.router.navigate(['/organization-onboarding/upload-team']);
        // console.log("Step 3 is calling");
        break;
      }
      case "4": {
        this.router.navigate(['/organization-onboarding/attendance-rule-setup']);
        // console.log("Step 4 is calling");
        break;
      }
      case "5": {
        this.router.navigate(['/organization-onboarding/leave-rule-setup']);
        // console.log("Step 5 is calling");
        break;
      }
      case "6": {
        this.router.navigate(['/dashboard']);
        // console.log("Step 6 is calling");
        break;
      }
      case "7": {
        this.router.navigate(['/dashboard']);
        // console.log("Step 7 is calling");
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
}
