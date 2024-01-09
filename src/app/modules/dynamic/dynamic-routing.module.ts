import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from '../common/header/header.component';
import { TopbarComponent } from '../common/topbar/topbar.component';
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
import { AuthGuard } from 'src/app/auth/auth-guard';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { DatePipe } from '@angular/common';
import { EmployeeOnboardingComponent } from './components/employee-onboarding/employee-onboarding.component';
import { RoleComponent } from './components/role/role.component';
import { EmployeeOnboardingFormComponent } from './components/employee-onboarding-form/employee-onboarding-form.component';
import { EmployeeOnboardingSidebarComponent } from '../common/employee-onboarding-sidebar/employee-onboarding-sidebar.component';
import { EmployeeAddressDetailComponent } from './components/employee-address-detail/employee-address-detail.component';
import { EmployeeDocumentComponent } from './components/employee-document/employee-document.component';
import { AcadmicComponent } from './components/acadmic/acadmic.component';
import { EmployeeExperienceComponent } from './components/employee-experience/employee-experience.component';
import { BankDetailsComponent } from './components/bank-details/bank-details.component';
import { EmergencyContactComponent } from './components/emergency-contact/emergency-contact.component';
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
import { EmployeeOnboardingPreviewComponent } from './components/employee-onboarding-preview/employee-onboarding-preview.component';


  const routes: Routes = [{ path: '', redirectTo: '/dashboard', pathMatch:'full'},
    { path: '', component: DynamicComponent,
  children:[
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},  //canActivate: [AuthGuard] (To activate the auth guard, need to add this under curly braces of this line by seperated commas)
    { path: 'header', component: HeaderComponent },
    { path: 'topbar', component: TopbarComponent },
    { path: 'timetable', component: TimetableComponent, canActivate: [AuthGuard]},
    { path: 'project', component: ProjectComponent},
    { path: 'team', component: TeamComponent, canActivate: [AuthGuard]},
    { path: 'task-manager', component: TaskManagerComponent, canActivate: [AuthGuard]},
    { path: 'live-manager', component: LiveManagerComponent, canActivate: [AuthGuard]},
    { path: 'onboarding', component: OnboardingComponent, canActivate: [AuthGuard]},
    { path: 'payment', component: PaymentComponent , canActivate: [AuthGuard]},
    { path: 'userlist', component: UserlistComponent , canActivate: [AuthGuard]},
    {path: 'waiting', component: WaitingPageComponent},
    {path: 'team-detail', component: TeamDetailComponent, canActivate: [AuthGuard]},
    {path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard]}, 
    {path: 'employee-onboarding', component: EmployeeOnboardingComponent, canActivate: [AuthGuard]},
    {path: 'role', component: RoleComponent},
    {path: 'employee-onboarding-form', component: EmployeeOnboardingFormComponent},
    {path: 'employee-onboarding-sidebar', component: EmployeeOnboardingSidebarComponent},
    {path: 'employee-address-detail', component: EmployeeAddressDetailComponent},
    {path: 'employee-document', component: EmployeeDocumentComponent},
    {path: 'acadmic', component: AcadmicComponent},
    {path: 'employee-experience', component: EmployeeExperienceComponent},
    {path: 'bank-details', component: BankDetailsComponent},
    {path: 'emergency-contact', component: EmergencyContactComponent},
    {path: 'reports', component: ReportsComponent},
    {path: 'employee-profile', component: EmployeeProfileComponent},
    {path: 'testing', component: TestingComponent},
    {path: 'privacy', component: PrivacyComponent},
    {path: 'support', component: SupportComponent},
    {path: 'error-page', component: ErrorPageComponent},
    {path: 'slack-data-loader', component: SlackDataLoaderComponent},
    {path : 'duration-picker', component: DurationPickerComponent},
    {path : 'add-role', component: RoleAddComponent},
    {path : 'employee-onboarding-preview', component: EmployeeOnboardingPreviewComponent}
  ] }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DatePipe]
})
export class DynamicRoutingModule { }
