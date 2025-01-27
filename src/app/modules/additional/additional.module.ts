import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdditionalRoutingModule } from './additional-routing.module';
import { AdditionalComponent } from './additional.component';
import { LeaveRequestFormComponent } from './components/leave-request-form/leave-request-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlackInstallationSuccessfullComponent } from './components/slack-installation-successfull/slack-installation-successfull.component';
import { InternalServerErrorPageComponent } from './components/internal-server-error-page/internal-server-error-page.component';
import { EmployeeAttendancePhotoComponent } from './components/employee-attendance-photo/employee-attendance-photo.component';
import { EmployeeLocationValidatorComponent } from './components/employee-location-validator/employee-location-validator.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { WebcamModule } from 'ngx-webcam';
import { AgmCoreModule } from '@agm/core';
import { LinkExpiredPageComponent } from './components/link-expired-page/link-expired-page.component';
import { AttendanceUrlComponent } from './components/attendance-url/attendance-url.component';


@NgModule({
  declarations: [
    AdditionalComponent,
    LeaveRequestFormComponent,
    SlackInstallationSuccessfullComponent,
    InternalServerErrorPageComponent,
    EmployeeAttendancePhotoComponent,
    EmployeeLocationValidatorComponent,
    LinkExpiredPageComponent,
    AttendanceUrlComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdditionalRoutingModule,
    WebcamModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB6SQE_TmOLpGLohpMLl-6FzdwJJAU9MnA',
      libraries: ['places'],
    }),
    GooglePlaceModule
  ],
  exports: [AttendanceUrlComponent]
})
export class AdditionalModule { }
