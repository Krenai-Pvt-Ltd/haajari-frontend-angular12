import { Component,  OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-add-shift-placeholder',
  templateUrl: './add-shift-placeholder.component.html',
  styleUrls: ['./add-shift-placeholder.component.css']
})
export class AddShiftPlaceholderComponent implements OnInit {

constructor(
  private dataService: DataService,
  private router: Router,
  private helperService: HelperService,
  private onboardingService: OrganizationOnboardingService
) {}

ngOnInit(): void {
  const token = localStorage.getItem('token');
    if (token==null) {
      this.router.navigate(['/auth/signup']);
    }
}

backPage() {
  this.checkShiftTimingExistsMethodCall();
}


isAddShiftBackLoading: boolean = false;
checkShiftTimingExistsMethodCall() {
  this.isAddShiftBackLoading = true;
  this.dataService.shiftTimingExists().subscribe(
    (response: any) => {
      console.log(response);
      if (response.object) {
        this.dataService.markStepAsCompleted(3);
        // this.onboardingService.saveOrgOnboardingStep(3).subscribe();
        this.onboardingService.saveOrgOnboardingStep(3).subscribe((resp) => {
          this.onboardingService.refreshOnboarding();
        });
        // this.router.navigate(['/organization-onboarding/shift-time-list']);
      } else {
        this.dataService.markStepAsCompleted(2);
        // this.onboardingService.saveOrgOnboardingStep(2).subscribe();
        this.onboardingService.saveOrgOnboardingStep(2).subscribe((resp) => {
          this.onboardingService.refreshOnboarding();
        });
        // this.router.navigate(['/organization-onboarding/upload-team']);
      }

      setTimeout(() => {
        this.isAddShiftBackLoading = false;
      }, 5000);
      // this.isBackLoading = false;
      // this.onboardingService.refreshOnboarding();
    },
    (error) => {}
  );
}



}
