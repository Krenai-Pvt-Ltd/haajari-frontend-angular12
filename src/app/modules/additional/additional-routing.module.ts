import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdditionalComponent } from './additional.component';
import { InternalServerErrorPageComponent } from './components/internal-server-error-page/internal-server-error-page.component';
import { LeaveRequestFormComponent } from './components/leave-request-form/leave-request-form.component';
import { SlackInstallationSuccessfullComponent } from './components/slack-installation-successfull/slack-installation-successfull.component';
import { EmployeeAttendancePhotoComponent } from './components/employee-attendance-photo/employee-attendance-photo.component';
import { AttendanceUrlComponent } from './components/attendance-url/attendance-url.component';

const routes: Routes = [
  { path: '', redirectTo: '/additional/leave-request', pathMatch: 'full' },
  {
    path: '',
    component: AdditionalComponent,

    children: [
      { path: 'leave-request', component: LeaveRequestFormComponent },
      { path: 'slack-installation-successfull', component: SlackInstallationSuccessfullComponent },
      { path: 'internal-server-error', component: InternalServerErrorPageComponent },
      { path: 'location-validator', component: AttendanceUrlComponent },
      // EmployeeLocationValidatorComponent - deprecated
      { path: 'attendance-photo', component: EmployeeAttendancePhotoComponent },
      //EmployeeAttendancePhotoComponent - deprecated
      { path: 'attendance-url', component: AttendanceUrlComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdditionalRoutingModule { }
