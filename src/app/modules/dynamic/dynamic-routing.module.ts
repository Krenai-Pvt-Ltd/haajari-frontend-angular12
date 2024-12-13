import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
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
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SupportComponent } from './components/support/support.component';
import { RoleAddComponent } from './components/role-add/role-add.component';
import { EmployeeOnboardingSidebarComponent } from '../employee-onboarding/employee-onboarding-sidebar/employee-onboarding-sidebar.component';
import { EmployeeOnboardingDataComponent } from './components/employee-onboarding-data/employee-onboarding-data.component';
import { UnauthorizedComponent } from '../sharable/unauthorized/unauthorized.component';
import { LeaveManagementComponent } from './components/leave-management/leave-management.component';

import { AssetsComponent } from './components/assets/assets.component';
import { CoinsComponent } from './components/coins/coins.component';
import { ToDoStepDashboardComponent } from './components/to-do-step-dashboard/to-do-step-dashboard.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { SubscriptionGuard } from 'src/app/guards/subscription.guard';
import { PreviewFormComponent } from '../employee-onboarding/preview-form/preview-form.component';
import { ReferFriendComponent } from './components/refer-friend/refer-friend.component';
import { NewEmployeeProfileComponent } from './components/new-employee-profile/new-employee-profile.component';
import { CreateExpenseComponent } from './components/create-expense/create-expense.component';
import { ExistPolicyComponent } from './components/exist-policy/exist-policy.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: '',
    component: DynamicComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard,SubscriptionGuard],
        data: { requiredSubmodule: '/dashboard' },
      }, //canActivate: [AuthGuard] (To activate the auth guard, need to add this under curly braces of this line by seperated commas)
      {
        path: 'timetable',
        component: TimetableComponent,
        canActivate: [AuthGuard,SubscriptionGuard]
      },
      {
        path: 'project',
        component: ProjectComponent,
        canActivate: [AuthGuard,SubscriptionGuard]
      },
      {
        path: 'team',
        component: TeamComponent,
        canActivate: [AuthGuard,SubscriptionGuard]
      },
      {
        path: 'task-manager',
        component: TaskManagerComponent,
        canActivate: [AuthGuard,SubscriptionGuard]
      },
      {
        path: 'onboarding',
        component: OnboardingComponent,
        canActivate: [AuthGuard,SubscriptionGuard],
      },
      {
        path: 'userlist',
        component: UserlistComponent,
        canActivate: [AuthGuard,SubscriptionGuard],
      },
      { path: 'waiting', component: WaitingPageComponent },
      {
        path: 'team-detail',
        component: TeamDetailComponent,
        canActivate: [AuthGuard,SubscriptionGuard]
      },
      {
        path: 'user-profile',
        component: UserProfileComponent,
        canActivate: [AuthGuard,SubscriptionGuard],
      },
      {
        path: 'employee-onboarding-data',
        component: EmployeeOnboardingDataComponent,
        canActivate: [AuthGuard,SubscriptionGuard],
      },
      {
        path: 'role',
        component: RoleComponent,
        canActivate: [AuthGuard,SubscriptionGuard],
        data: { requiredSubmodule: '/role' },
      },
      {
        path: 'employee-onboarding-sidebar',
        component: EmployeeOnboardingSidebarComponent,
      },
      {
        path: 'preview-form',
        component: PreviewFormComponent,
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { requiredSubmodule: '/reports' },
      },
      {
        path: 'assets',
        component: AssetsComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { requiredSubmodule: '/assets' },
      },
      {
        path: 'coins',
        component: CoinsComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { requiredSubmodule: '/coins' },
      },
      {
        path: 'employee-profile',
        component: EmployeeProfileComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { requiredSubmodule: '/employee-profile' },
      },
      { path: 'testing', component: TestingComponent },
      {
        path: 'privacy',
        component: PrivacyComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { requiredSubmodule: '/privacy' },
      },
      {
        path: 'support',
        component: SupportComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { requiredSubmodule: '/support' },
      },
      {
        path: 'add-role',
        component: RoleAddComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { requiredSubmodule: '/add-role' },
      },
      { path: 'unauthorized', 
        component: UnauthorizedComponent 
      },
      { path: 'leave-management', 
        component: LeaveManagementComponent, 
        canActivate: [AuthGuard, SubscriptionGuard]
      },
     
      {
        path: 'to-do-step-dashboard',
        component: ToDoStepDashboardComponent,
        canActivate: [AuthGuard, SubscriptionGuard]
      },
      {
        path: 'subscription',
        component: SubscriptionComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'refer-friend',
        component: ReferFriendComponent,
        canActivate: [AuthGuard, SubscriptionGuard]
      },
      {
        path: 'new-employee-profile',
        component: NewEmployeeProfileComponent,
      },
      {
        path: 'expense',
        component: CreateExpenseComponent,
        canActivate: [AuthGuard, SubscriptionGuard]
      },
      {
        path: 'exit-policy',
        component: ExistPolicyComponent,
        canActivate: [AuthGuard, SubscriptionGuard]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DatePipe],
})
export class DynamicRoutingModule {}
