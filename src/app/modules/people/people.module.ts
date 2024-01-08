import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './component/team/team.component';
import { TeamDetailComponent } from './component/team-detail/team-detail.component';
import { EmployeeOnboardingComponent } from './component/employee-onboarding/employee-onboarding.component';



@NgModule({
  declarations: [
    TeamComponent,
    TeamDetailComponent,
    EmployeeOnboardingComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PeopleModule { }
