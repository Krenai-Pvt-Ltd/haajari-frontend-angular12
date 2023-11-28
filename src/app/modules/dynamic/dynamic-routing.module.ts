import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from '../common/header/header.component';
import { TopbarComponent } from '../common/topbar/topbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LiveManagerComponent } from './components/live-manager/live-manager.component';
import { LoginComponent } from './components/login/login.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { PaymentComponent } from './components/payment/payment.component';
import { ProjectComponent } from './components/project/project.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';
import { TimetableComponent } from './components/timetable/timetable.component';
import { UserlistComponent } from './components/userlist/userlist.component';
import { DynamicComponent } from './dynamic.component';
import { SlackAuthComponent } from './components/slack-auth/slack-auth.component';
import { AddToSlackComponent } from './components/add-to-slack/add-to-slack.component';
import { WaitingPageComponent } from './components/waiting-page/waiting-page.component';
import { TeamComponent } from './components/team/team.component';
import { TeamDetailComponent } from './components/team-detail/team-detail.component';
import { AuthGuard } from 'src/app/auth/auth-guard';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ReportsComponent } from './components/reports/reports.component';
import { DatePipe } from '@angular/common';
import { EmployeeOnboardingComponent } from './components/employee-onboarding/employee-onboarding.component';
<<<<<<< HEAD
=======
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { SelerySettingComponent } from './components/selery-setting/selery-setting.component';
import { RoleComponent } from './components/role/role.component';
>>>>>>> 7c7985b308fb2c0d363efd6c64540d543714b9f2

const routes: Routes = [
  { path: '', component: DynamicComponent },
  { path: 'dashboard', component: DashboardComponent},  //canActivate: [AuthGuard] (To activate the auth guard, need to add this under curly braces of this line by seperated commas)
  { path: 'header', component: HeaderComponent },
  { path: 'topbar', component: TopbarComponent },
  { path: 'timetable', component: TimetableComponent},
  { path: 'project', component: ProjectComponent},
  { path: 'team', component: TeamComponent},
  { path: 'task-manager', component: TaskManagerComponent},
  { path: 'live-manager', component: LiveManagerComponent},
  { path: 'onboarding', component: OnboardingComponent},
  { path: 'login', component: LoginComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'userlist', component: UserlistComponent },
  {path: 'slackauth', component: SlackAuthComponent },
  {path: 'addtoslack', component: AddToSlackComponent},
  {path: 'waiting', component: WaitingPageComponent},
  {path: 'team-detail', component: TeamDetailComponent},
  {path: 'user-profile', component: UserProfileComponent}, 
  {path: 'reports', component: ReportsComponent}, 
<<<<<<< HEAD
  {path: 'employee-onboarding', component: EmployeeOnboardingComponent}
=======
  {path: 'employee-onboarding', component: EmployeeOnboardingComponent},
  {path: 'attendance-setting', component: AttendanceSettingComponent},
  {path: 'company-setting', component: CompanySettingComponent},
  {path: 'selery-setting', component: SelerySettingComponent},
  {path: 'role', component: RoleComponent}
>>>>>>> 7c7985b308fb2c0d363efd6c64540d543714b9f2


//   {path: 'team-detail', component: TeamDetailComponent},
//   {path: 'temporary', component: TemporaryComponent, canActivate: [AuthGuard]}
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DatePipe]
})
export class DynamicRoutingModule { }
