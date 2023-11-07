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
import { TemporaryComponent } from './components/temporary/temporary.component';
import { AuthGuard } from 'src/app/auth/auth-guard';

const routes: Routes = [
  { path: '', component: DynamicComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},  //canActivate: [AuthGuard] (To activate the auth guard, need to add this under curly braces of this line by seperated commas)
  

  { path: 'header', component: HeaderComponent },
  { path: 'topbar', component: TopbarComponent },
  { path: 'timetable', component: TimetableComponent, canActivate: [AuthGuard] },
  { path: 'project', component: ProjectComponent},
  { path: 'team', component: TeamComponent, canActivate: [AuthGuard]},
  { path: 'task-manager', component: TaskManagerComponent, canActivate: [AuthGuard] },
  { path: 'live-manager', component: LiveManagerComponent},
  { path: 'onboarding', component: OnboardingComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'userlist', component: UserlistComponent },
  {path: 'slackauth', component: SlackAuthComponent },
  {path: 'addtoslack', component: AddToSlackComponent, canActivate: [AuthGuard] },
  {path: 'waiting', component: WaitingPageComponent},
  {path: 'team-detail', component: TeamDetailComponent, canActivate: [AuthGuard]},
  {path: 'temporary', component: TemporaryComponent}
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicRoutingModule { }
