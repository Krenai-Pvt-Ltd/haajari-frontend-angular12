import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-organization-onboarding-sidebar',
  templateUrl: './organization-onboarding-sidebar.component.html',
  styleUrls: ['./organization-onboarding-sidebar.component.css']
})
export class OrganizationOnboardingSidebarComponent implements OnInit {

  constructor(private dataService: DataService,
    private _onboardingService: OrganizationOnboardingService,
    private router: Router) { }

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
    this._onboardingService.getOrgOnboardingStep().subscribe((response: any) => {
      if (response.status) {
        this.dataService.markStepAsCompleted(response.object);
        this.goToStep(this.dataService.stepIndex);
      }
    })
  }

  goToStep(index: number) {
console.log("Index to Go", index);

    switch (index) {
      case 1: {
        console.log("Step 1 is calling");
        this.router.navigate(['/organization-onboarding/attendance-rule-setup']);
        //statements; 
        break;
      }
      case 2: {
        console.log("Step 2 is calling");
        this.router.navigate(['/organization-onboarding/leave-rule-setup']);
        //statements; 
        break;
      }
      case 3: {
        console.log("Step 3 is calling");
        this.router.navigate(['/organization-onboarding/holiday-setting']);
        //statements; 
        break;
      }
      case 4: {
        this.router.navigate(['/organization-onboarding/upload-team']);
        console.log("Step 4 is calling");
        //statements; 
        break;
      }
      case 5: {
        console.log("Step 5 is calling");
        //statements; 
        break;
      }
      case 6: {
        this.router.navigate(['/dashboard']);
        console.log("Step 6 is calling");
        //statements; 
        break;
      }
      default: {
        this.router.navigate(['/organization-onboarding/personal-information']);
        console.log("Step default is calling");
        //statements; 
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
}
