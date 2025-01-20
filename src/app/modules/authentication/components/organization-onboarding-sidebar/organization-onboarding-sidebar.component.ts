import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { LoggedInUser } from 'src/app/models/logged-in-user';
import { LogoutConfirmationModalComponent } from 'src/app/modules/shared/logout-confirmation-modal/logout-confirmation-modal.component';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-organization-onboarding-sidebar',
  templateUrl: './organization-onboarding-sidebar.component.html',
  styleUrls: ['./organization-onboarding-sidebar.component.css'],
})
export class OrganizationOnboardingSidebarComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private _onboardingService: OrganizationOnboardingService,
    private router: Router,
    private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService,
    private modalService: NgbModal,
    private _subscriptionService: SubscriptionPlanService,
    private onboardingService: OnboardingService
  ) {}

  onboardingViaString: string = '';
  private subscription!: Subscription;

  ngOnInit(): void {
    // this.subscription = this._onboardingService.refreshSidebar$.subscribe(refresh => {
    //   this.reloadSidebar();
    // });

    this._onboardingService.onboardingRefresh$.subscribe(() => {
      this.getOnboardingStep();
    });
    this.getOnboardingStep();
    this.getUserUUID();
    this.getLoggedInUserDetails();
  }

  // reloadSidebar() {
  //   // Logic to reload or refresh the sidebar
  //   console.log('Sidebar is reloading...');
  // }

  // ngOnDestroy() {
  //   this.subscription.unsubscribe();
  // }

  navigateTo(route: string, stepIndex: number): void {
    if (this.dataService.stepIndex < stepIndex - 1) {
    } else {
      this.router.navigate([route]);
    }
  }

  STEP_ID: number = 1;
  STEP_TEXT: string = 'Personal Information';
  STEP_CONTENT: string = 'Please confirm the validity of your email address';
  getOnboardingStep() {
    debugger;
    this._onboardingService
      .getOrgOnboardingStep()
      .subscribe((response: any) => {
        if (response.status) {
          this.dataService.markStepAsCompleted(response.object.step);
          this.onboardingViaString = response.object.onboardingString;
          this.STEP_ID = response.object.step;
          // console.log(response.object.step);
          this.goToStep(response.object.step);
        }
      });
  }

  async goToStep(index: string) {
    debugger;
    // console.log("Index to Go :", index);
    switch (index) {
      case (constant.ORG_ONBOARDING_PERSONAL_INFORMATION_STEP_ID): {
        this.STEP_ID = +constant.ORG_ONBOARDING_PERSONAL_INFORMATION_STEP_ID;
        this.helperService.orgStepId = this.STEP_ID;
        this.STEP_TEXT = 'Personal Information';
        this.STEP_CONTENT = 'Please confirm the validity of your email address';
        this.router.navigate([constant.ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE]);
        this.onboardingService.isLoadingOnboardingStatus = false;
        console.log("Step 1 sidebar is calling");
        break;
      }
      case (constant.ORG_ONBOARDING_EMPLOYEE_CREATION_STEP_ID): {
        this.STEP_ID = +constant.ORG_ONBOARDING_EMPLOYEE_CREATION_STEP_ID;
        this.helperService.orgStepId = this.STEP_ID;
        this.STEP_TEXT = 'Employee Creation';
        this.STEP_CONTENT = 'Please upload valid credentials';
        this.router.navigate([constant.ORG_ONBOARDING_EMPLOYEE_CREATION_ROUTE]);
        this.onboardingService.isLoadingOnboardingStatus = false;
        // console.log("Step 2 is calling");
        break;
      }
      case (constant.ORG_ONBOARDING_SHIFT_TIME_STEP_ID): {
        this.STEP_ID = +constant.ORG_ONBOARDING_SHIFT_TIME_STEP_ID;
        this.helperService.orgStepId = this.STEP_ID;
        this.STEP_TEXT = 'Shift Time';
        this.STEP_CONTENT = 'Register shift time for your organization';
        this.router.navigate([constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE]);
        this.onboardingService.isLoadingOnboardingStatus = false;
        // console.log("Step 3 is calling");
        break;
      }
      case (constant.ORG_ONBOARDING_ATTENDANCE_MODE_STEP_ID): {
        this.STEP_ID = +constant.ORG_ONBOARDING_ATTENDANCE_MODE_STEP_ID;
        this.helperService.orgStepId = this.STEP_ID;
        this.STEP_TEXT = 'Attendance Mode';
        this.STEP_CONTENT =
          'Please select attendance mode for your organization';
        this.router.navigate([constant.ORG_ONBOARDING_ATTENDANCE_MODE_ROUTE]);
        this.onboardingService.isLoadingOnboardingStatus = false;
        // console.log("Step 4 is calling");
        break;
      }
      case (constant.ORG_ONBOARDING_ONBOARDING_COMPLETED_STEP_ID): {
        this.helperService.orgStepId = +constant.ORG_ONBOARDING_ONBOARDING_COMPLETED_STEP_ID;
        this.helperService.orgStepId = this.STEP_ID;
         await this._subscriptionService.LoadAsync();
         setTimeout(() => {
         this.router.navigate([constant.DASHBOARD_ROUTE]);
          // this.router.navigate(['/to-do-step-dashboard']);
        }, 5000);
        this.onboardingService.isLoadingOnboardingStatus = false;
        // this.router.navigate(['/dashboard']);
        // console.log("Step 5 is calling");
        break;
      }
      default: {
        this.router.navigate([constant.ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE]);
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

  onLogout() {
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
  UUID: any;
  ORGANIZATION_UUID: any;
  loggedInUser: LoggedInUser = new LoggedInUser();

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

  routeToAccountPage(tabName: string) {
    // this.dataService.activeTab = tabName !== 'account';
    this.router.navigate(['/setting/account-settings'], {
      queryParams: { setting: tabName },
    });
  }

  routeToEmployeeProfilePage() {
    // this.router.navigate(["/employee-profile"], { queryParams: {"userId":  this.UUID} });
    // this.activeTab = 'dashboard';
    
    this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], {
      queryParams: { userId: this.UUID, dashboardActive: 'true' },
    });
  }

  logoutFunction() {
    localStorage.clear();
    this.rbacService.clearRbacService();
    this.helperService.orgStepId = 0;
    this.helperService.stepId = 0;
    // this.onboardingService.isLoadingOnboardingStatus = true;
    this.helperService.clearHelperService();
    this.router.navigate(['/login']);
  }

  openLogoutModal() {
    const modalRef = this.modalService.open(LogoutConfirmationModalComponent, {
      centered: true,
      backdropClass: 'static',
    });
    modalRef.result.then((result) => {
      if (result === 'logoutConfirmed') {
        // Handle the logout logic if confirmed
        this.logoutFunction();
      }
    });
  }

  getStepClass(): string {
    switch (this.STEP_ID) {
      case 1:
        return 'sideBarStep-one';
      case 2:
        return 'sideBarStep-one sideBarStep-two';
      case 3:
        return 'sideBarStep-one sideBarStep-three';
      case 4:
        return 'sideBarStep-one sideBarStep-four';
      default:
        return '';
    }
  }
}
