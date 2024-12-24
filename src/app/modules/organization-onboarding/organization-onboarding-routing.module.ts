import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddShiftTimeComponent } from './components/add-shift-time/add-shift-time.component';
import { OrganizationPersonalInformationComponent } from './components/organization-personal-information/organization-personal-information.component';
import { UploadTeamComponent } from './components/upload-team/upload-team.component';
import { OrganizationOnboardingComponent } from './organization-onboarding.component';
import { AttendanceModeComponent } from './components/attendance-mode/attendance-mode.component';
import { ShiftTimeListComponent } from './components/shift-time-list/shift-time-list.component';
import { AddShiftPlaceholderComponent } from './components/add-shift-placeholder/add-shift-placeholder.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationOnboardingComponent,
    children: [
      { path: 'personal-information',component: OrganizationPersonalInformationComponent},
      { path: 'add-shift-time', component: AddShiftTimeComponent },
      { path: 'upload-team', component: UploadTeamComponent },
      { path: 'attendance-mode', component: AttendanceModeComponent },
      { path: 'shift-time-list', component: ShiftTimeListComponent },
      { path: 'add-shift-placeholder', component: AddShiftPlaceholderComponent },
      // { path: 'onboarding-successful', component: OnboardingSuccessfulComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationOnboardingRoutingModule {}
