import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingComponent } from './setting.component';
import { AuthGuard } from 'src/app/guards/auth-guard';
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { LeaveSettingComponent } from './components/leave-setting/leave-setting.component';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { StaffAttendanceLocationComponent } from './components/staff-attendance-location/staff-attendance-location.component';
import { UploadPhotoComponent } from './components/upload-photo/upload-photo.component';
import { SalarySettingComponent } from './components/salary-setting/salary-setting.component';
import { SubscriptionGuard } from 'src/app/guards/subscription.guard';

const routes: Routes = [
  { path: '', redirectTo: '/setting/attendance-setting', pathMatch: 'full' },
  {
    path: '',
    component: SettingComponent,

    children: [
      {
        path: 'attendance-setting',
        component: AttendanceSettingComponent,
        canActivate: [AuthGuard,SubscriptionGuard],
      },
      {
        path: 'company-setting',
        component: CompanySettingComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
      },
      {
        path: 'salary-setting',
        component: SalarySettingComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
      },
      {
        path: 'leave-setting',
        component: LeaveSettingComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
      },
      {
        path: 'account-settings',
        component: AccountSettingsComponent,
        canActivate: [AuthGuard, SubscriptionGuard],
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
