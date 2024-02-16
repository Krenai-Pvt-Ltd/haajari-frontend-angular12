import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LiveManagerComponent } from './components/live-manager/live-manager.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { PaymentComponent } from './components/payment/payment.component';
import { ProjectComponent } from './components/project/project.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';
import { TimetableComponent } from './components/timetable/timetable.component';
import { UserlistComponent } from './components/userlist/userlist.component';
import { DynamicComponent } from './dynamic.component';
import { WaitingPageComponent } from './components/waiting-page/waiting-page.component';
import { TeamComponent } from './components/team/team.component';
import { TeamDetailComponent } from './components/team-detail/team-detail.component';
import { AuthGuard } from 'src/app/modules/authentication/auth/auth-guard';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { DatePipe } from '@angular/common';
import { RoleComponent } from './components/role/role.component';
import { ReportsComponent } from './components/reports/reports.component';
import { EmployeeProfileComponent } from './components/employee-profile/employee-profile.component';
import { TestingComponent } from './components/testing/testing.component';
import { SlackDataLoadComponent } from './slack-data-load/slack-data-load.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SupportComponent } from './components/support/support.component';
import { ErrorPageComponent } from '../common/error-page/error-page.component';
import { SlackDataLoaderComponent } from '../common/slack-data-loader/slack-data-loader.component';
import { DurationPickerComponent } from '../common/duration-picker/duration-picker.component';
import { RoleAddComponent } from './components/role-add/role-add.component';
import { BillingComponent } from './components/billing/billing.component';
import { EmployeeOnboardingSidebarComponent } from '../employee-onboarding/employee-onboarding-sidebar/employee-onboarding-sidebar.component';
import { EmployeeOnboardingDataComponent } from './components/employee-onboarding-data/employee-onboarding-data.component';
import { BillingPaymentComponent } from './components/billing-payment/billing-payment.component';
import { SuccessComponent } from './components/success/success.component';
import { EmployeeLocationValidatorComponent } from './employee-location-validator/employee-location-validator.component';
import { UnauthorizedComponent } from '../sharable/unauthorized/unauthorized.component';
import { LeaveManagementComponent } from './components/leave-management/leave-management.component';



  const routes: Routes = [{ path: '', redirectTo: '/dashboard', pathMatch:'full'},
    { path: '', component: DynamicComponent,
  children:[
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/dashboard' } }, //canActivate: [AuthGuard] (To activate the auth guard, need to add this under curly braces of this line by seperated commas)
    { path: 'timetable', component: TimetableComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/timetable' }},
    { path: 'project', component: ProjectComponent },
    { path: 'team', component: TeamComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/team' }},
    { path: 'task-manager', component: TaskManagerComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/task-manager' }},
    { path: 'onboarding', component: OnboardingComponent, canActivate: [AuthGuard]},
    { path: 'payment', component: PaymentComponent , canActivate: [AuthGuard], data: { requiredSubmodule: '/payment' }},
    { path: 'userlist', component: UserlistComponent , canActivate: [AuthGuard]},
    {path: 'waiting', component: WaitingPageComponent},
    {path: 'team-detail', component: TeamDetailComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/team-detail' }},
    {path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard]}, 
    {path: 'employee-onboarding-data', component: EmployeeOnboardingDataComponent, canActivate: [AuthGuard]},
    {path: 'role', component: RoleComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/role' }},
    {path: 'employee-onboarding-sidebar', component: EmployeeOnboardingSidebarComponent},
    {path: 'reports', component: ReportsComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/reports' }},
    {path: 'employee-profile', component: EmployeeProfileComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/employee-profile' }},
    {path: 'testing', component: TestingComponent},
    {path: 'privacy', component: PrivacyComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/privacy' }},
    {path: 'support', component: SupportComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/support' }},
    {path : 'add-role', component: RoleAddComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/add-role' }},
    {path : 'billing', component: BillingComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/billing' }},
    {path : 'billing-payment', component: BillingPaymentComponent, canActivate: [AuthGuard], data: { requiredSubmodule: '/billing-payment' }},
    {path : 'success', component: SuccessComponent},
    {path : 'location-validator', component: EmployeeLocationValidatorComponent},
    {path : 'unauthorized', component: UnauthorizedComponent},
    {path : 'leave-management', component: LeaveManagementComponent},
    
  ] }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DatePipe]
})
export class DynamicRoutingModule { }
