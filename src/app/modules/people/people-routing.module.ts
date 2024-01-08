import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from '../common/header/header.component';
import { TopbarComponent } from '../common/topbar/topbar.component';
import { PeopleComponent } from './people.component';
import { DatePipe } from '@angular/common';
import { TeamComponent } from './component/team/team.component';
import { TeamDetailComponent } from './component/team-detail/team-detail.component';
import { EmployeeOnboardingComponent } from './component/employee-onboarding/employee-onboarding.component';
import { AuthGuard } from 'src/app/auth/auth-guard';


  const routes: Routes = [{ path: '', redirectTo: '/login', pathMatch:'full'},
    { path: '', component: PeopleComponent,
  children:[
    {path: 'team', component: TeamComponent, canActivate: [AuthGuard]},
    {path: 'team-detail', component: TeamDetailComponent, canActivate: [AuthGuard]},
    {path: 'employee-onboarding', component: EmployeeOnboardingComponent, canActivate: [AuthGuard]}
  ] }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DatePipe]
})
export class DynamicRoutingModule { }
