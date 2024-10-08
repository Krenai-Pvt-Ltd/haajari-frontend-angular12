import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingComponent } from './setting.component';
import { AuthGuard } from 'src/app/modules/authentication/auth/auth-guard';
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { LeaveSettingComponent } from './components/leave-setting/leave-setting.component';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { StaffAttendanceLocationComponent } from './components/staff-attendance-location/staff-attendance-location.component';
import { UploadPhotoComponent } from './components/upload-photo/upload-photo.component';
import { SalarySettingComponent } from './components/salary-setting/salary-setting.component';
import { OnboardingSettingComponent } from './components/onboarding-setting/onboarding-setting.component';

const routes: Routes = [
  { path: '', redirectTo: '/setting/attendance-setting', pathMatch: 'full' },
  {
    path: '',
    component: SettingComponent,

    children: [
      {
        path: 'attendance-setting',
        component: AttendanceSettingComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'company-setting',
        component: CompanySettingComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'onboarding-setting',
        component: OnboardingSettingComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'salary-setting',
        component: SalarySettingComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'leave-setting',
        component: LeaveSettingComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'account-settings',
        component: AccountSettingsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'staff-attendance-location',
        component: StaffAttendanceLocationComponent,
      },
      { path: 'upload-photo', component: UploadPhotoComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingRoutingModule {}
