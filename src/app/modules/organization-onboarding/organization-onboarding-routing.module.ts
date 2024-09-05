import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationPersonalInformation } from 'src/app/models/organization-personal-information';
import { AddShiftTimeComponent } from './components/add-shift-time/add-shift-time.component';
import { AutomationRulesComponent } from './components/automation-rules/automation-rules.component';
import { HolidayRuleSetupComponent } from './components/holiday-rule-setup/holiday-rule-setup.component';
import { HolidaySettingComponent } from './components/holiday-setting/holiday-setting.component';
import { LeaveRuleSetupComponent } from './components/leave-rule-setup/leave-rule-setup.component';
import { LeaveSettingCreateComponent } from './components/leave-setting-create/leave-setting-create.component';
import { OrganizationPersonalInformationComponent } from './components/organization-personal-information/organization-personal-information.component';
import { UploadTeamComponent } from './components/upload-team/upload-team.component';
import { OrganizationOnboardingComponent } from './organization-onboarding.component';
import { AttendanceModeComponent } from './components/attendance-mode/attendance-mode.component';
import { ShiftTimeListComponent } from './components/shift-time-list/shift-time-list.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationOnboardingComponent,
    children: [
      {
        path: 'personal-information',
        component: OrganizationPersonalInformationComponent,
      },
      { path: 'leave-rule-setup', component: LeaveRuleSetupComponent },
      { path: 'holiday-rule-setup', component: HolidayRuleSetupComponent },
      { path: 'automation-rules', component: AutomationRulesComponent },
      { path: 'leave-setting-create', component: LeaveSettingCreateComponent },
      { path: 'add-shift-time', component: AddShiftTimeComponent },
      { path: 'holiday-setting', component: HolidaySettingComponent },
      { path: 'upload-team', component: UploadTeamComponent },
      { path: 'attendance-mode', component: AttendanceModeComponent },
      { path: 'shift-time-list', component: ShiftTimeListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationOnboardingRoutingModule {}
