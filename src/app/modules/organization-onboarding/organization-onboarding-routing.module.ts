import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationPersonalInformation } from 'src/app/models/organization-personal-information';
import { AttendanceRuleSetupComponent } from './components/attendance-rule-setup/attendance-rule-setup.component';
import { HolidayRuleSetupComponent } from './components/holiday-rule-setup/holiday-rule-setup.component';
import { LeaveRuleSetupComponent } from './components/leave-rule-setup/leave-rule-setup.component';
import { OrganizationPersonalInformationComponent } from './components/organization-personal-information/organization-personal-information.component';
import { OrganizationOnboardingComponent } from './organization-onboarding.component';

const routes: Routes = [{ path: '', component: OrganizationOnboardingComponent,
children:[
  {path: 'personal-information', component: OrganizationPersonalInformationComponent},
  {path: 'attendance-rule-setup', component: AttendanceRuleSetupComponent},
  {path: 'leave-rule-setup', component: LeaveRuleSetupComponent},
  {path: 'holiday-rule-setup', component: HolidayRuleSetupComponent}
  
  ]

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationOnboardingRoutingModule { }
