import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingComponent } from './setting.component';
import { AuthGuard } from 'src/app/modules/authentication/auth/auth-guard';
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { SelerySettingComponent } from './components/selery-setting/selery-setting.component';
import { LeaveSettingComponent } from './components/leave-setting/leave-setting.component';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { StaffAttendanceLocationComponent } from './components/staff-attendance-location/staff-attendance-location.component';
import { UploadPhotoComponent } from './components/upload-photo/upload-photo.component';

const routes: Routes = [{ path: '', redirectTo: '/setting/attendance-setting', pathMatch:'full'},
  { path: '', component: SettingComponent,

  children:[

  {path: 'attendance-setting', component: AttendanceSettingComponent, canActivate: [AuthGuard]},
  {path: 'company-setting', component: CompanySettingComponent, canActivate: [AuthGuard]},
  {path: 'selery-setting', component: SelerySettingComponent, canActivate: [AuthGuard]},
  {path: 'leave-setting', component: LeaveSettingComponent, canActivate: [AuthGuard]},
  {path: 'account-settings', component: AccountSettingsComponent, canActivate: [AuthGuard]},
  {path: 'staff-attendance-location', component: StaffAttendanceLocationComponent, canActivate: [AuthGuard]},
  {path: 'upload-photo', component: UploadPhotoComponent, canActivate: [AuthGuard]}
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
