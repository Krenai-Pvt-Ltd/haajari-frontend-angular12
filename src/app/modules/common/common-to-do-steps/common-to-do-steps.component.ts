import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-common-to-do-steps',
  templateUrl: './common-to-do-steps.component.html',
  styleUrls: ['./common-to-do-steps.component.css'],
})
export class CommonToDoStepsComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private router: Router,
    private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService,
    private _subscriptionService:SubscriptionPlanService
  ) {
    if(this._subscriptionService.isSubscription !=undefined && this._subscriptionService.isSubscription &&!this._subscriptionService.isPlanExpired){
      this.isToDoStepsCompletedData();

    }
  }

  @ViewChild('stepCompletionModal') stepCompletionModal!: ElementRef;
  getToDoStepViaSubject() {
    debugger;
    this.helperService.todoStepsSubject.subscribe((res) => {
      if (res) {
        // this.saveOrgSecondaryToDoStepBarData(0);
        // this.getOrgSecondaryToDoStepBarData();
        this.showToDoStep();
        if (res == 'close') {
          this.isShowSecondaryToDoSteps = false;
        } else {
          this.getStepsData();
          this.getOrganizationRegistratonProcessStepData();
          this.isToDoStepsCompletedData();
          if (this.isToDoStepsCompletedFlag == 1) {
            // console.log(this.isTo)
            this.dataService.step=5;
            this.dataService.isToDoStepCompleted=1;
            this.stepCompletionModal.nativeElement.click();
          }
        }

        // this.getOrganizationInitialToDoStepBar();
      }
    });
  }

  isToDoStepsCompletedFlag: number = 0;
  count: number = 0;
  isToDoStepsCompletedData() {
    debugger;
    this.dataService.isToDoStepsCompleted().subscribe(
      (response) => {
        this.isToDoStepsCompletedFlag = response.object;

        if (this.isToDoStepsCompletedFlag == 0) {
          this.getToDoStepViaSubject();
        } else {
          if (this.count == 0) {
            // console.log(this.isTo)
            this.stepCompletionModal.nativeElement.click();
            this.count++;
          }

          this.getOrganizationInitialToDoStepBar();
          // this.router.navigate(['/dashboard']);
        }
        // console.log("success");
      },
      (error) => {
        console.log('error');
      }
    );
  }

  ROLE: any;
  ngOnInit(): void {
    this.getStepsData();
    this.getOrganizationInitialToDoStepBar();
    this.getOrganizationRegistratonProcessStepData();
    this.getRoleDetails();
  }

  async getRoleDetails() {
    this.ROLE = await this.rbacService.getRole();
  }

  hideOrganizationInitialToDoStepBar() {
    debugger;
    this.dataService.hideOrganizationInitialToDoStepBar().subscribe(
      (response) => {
        // console.log("success");
        this.getOrganizationInitialToDoStepBar();
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  isToDoStep: boolean = false;
  showToDo: boolean = false;

  showToDoStep() {
    const currentRoute = this.router.url;
    if (!currentRoute.includes('/to-do-step-dashboard')) {
      this.showToDo = true;
    } else {
      this.showToDo = false;
    }
  }
  getOrganizationInitialToDoStepBar() {
    debugger;
    this.dataService.getOrganizationInitialToDoStepBar().subscribe(
      (response) => {
        this.isToDoStep = response.object;
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  stepsData: any;
  getStepsData() {
    debugger;
    this.dataService.getStepsData().subscribe(
      (response) => {
        this.stepsData = response.listOfObject[0];
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  getProgressPercentage(): number {
    if (this.stepsData?.totalSteps === 0) {
      return 0;
    }
    return (
      (this.stepsData?.totalCompletedSteps / this.stepsData?.totalSteps) * 100
    );
  }

  organizationRegistrationProcessResponse: any;
  getOrganizationRegistratonProcessStepData() {
    debugger;
    this.dataService.getOrganizationRegistratonProcessStepStatus().subscribe(
      (response) => {
        this.organizationRegistrationProcessResponse = response.listOfObject;
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  // routeToStep(route : string) {
  //   this.router.navigate([route]);
  // }

  routeToStep(route: string, name: string) {
    this.router.navigate([route], { queryParams: { name } });
  }

  isShowToDoSteps: boolean = false;

  showToDoSteps() {
    debugger;
    if (this.isShowToDoSteps == true) {
      this.isShowToDoSteps = false;
    } else if (this.isShowToDoSteps == false) {
      this.isShowToDoSteps = true;
    }
  }
  hideToDoSteps() {
    this.isShowToDoSteps = false;
  }

  saveOrgSecondaryToDoStepBarData(value: number) {
    debugger;
    this.dataService.saveOrgSecondaryToDoStepBar(value).subscribe(
      (response) => {
        // console.log("success");
        this.getOrgSecondaryToDoStepBarData();
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  isShowSecondaryToDoSteps: boolean = false;
  getOrgSecondaryToDoStepBarData() {
    debugger;
    this.dataService.getOrgSecondaryToDoStepBar().subscribe(
      (response) => {
        this.isShowSecondaryToDoSteps = response.object;
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  routeToDashboard() {
    this.dataService.step = 5;
    this.router.navigate(['/dashboard']);
  }

  @ViewChild('onboardingview') onboardingview!: ElementRef;
  scrollToView() {
    this.onboardingview.nativeElement.scrollTop =
      this.onboardingview.nativeElement.scrollHeight;
  }
}
