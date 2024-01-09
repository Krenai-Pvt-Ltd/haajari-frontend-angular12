import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingComponent } from './setting.component';
import { AuthGuard } from 'src/app/auth/auth-guard';
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { SelerySettingComponent } from './components/selery-setting/selery-setting.component';
import { LeaveSettingComponent } from './components/leave-setting/leave-setting.component';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';

const routes: Routes = [{ path: '', redirectTo: '/setting/attendance-setting', pathMatch:'full'},
  { path: '', component: SettingComponent,

  children:[

  {path: 'attendance-setting', component: AttendanceSettingComponent},
  {path: 'company-setting', component: CompanySettingComponent},
  {path: 'selery-setting', component: SelerySettingComponent},
  {path: 'leave-setting', component: LeaveSettingComponent},
  {path: 'account-settings', component: AccountSettingsComponent}
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
