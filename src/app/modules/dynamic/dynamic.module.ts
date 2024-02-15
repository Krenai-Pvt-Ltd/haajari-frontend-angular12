import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireDatabaseModule } from "@angular/fire/compat/database";
import { AngularFireMessagingModule } from "@angular/fire/compat/messaging";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
// import { AcadmicComponent } from './components/acadmic/acadmic.component';
// import { BankDetailsComponent } from './components/bank-details/bank-details.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { EmergencyContactComponent } from './components/emergency-contact/emergency-contact.component';
// import { EmployeeAddressDetailComponent } from './components/employee-address-detail/employee-address-detail.component';
// import { EmployeeDocumentComponent } from './components/employee-document/employee-document.component';
// import { EmployeeExperienceComponent } from './components/employee-experience/employee-experience.component';
// import { EmployeeOnboardingFormComponent } from './components/employee-onboarding-form/employee-onboarding-form.component';
import { EmployeeProfileComponent } from './components/employee-profile/employee-profile.component';
import { LiveManagerComponent } from './components/live-manager/live-manager.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { PaymentComponent } from './components/payment/payment.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { ProjectComponent } from './components/project/project.component';
import { ReportsComponent } from './components/reports/reports.component';
import { RoleComponent } from './components/role/role.component';
import { SupportComponent } from './components/support/support.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';
import { TeamDetailComponent } from './components/team-detail/team-detail.component';
import { TeamComponent } from './components/team/team.component';
import { TestingComponent } from './components/testing/testing.component';
import { TimetableComponent } from './components/timetable/timetable.component';
import { UserlistComponent } from './components/userlist/userlist.component';
import { WaitingPageComponent } from './components/waiting-page/waiting-page.component';
import { DateFormatPipe } from './date-format.pipe';
import { DurationFormatPipe } from './duration-format.pipe';
import { DynamicRoutingModule } from './dynamic-routing.module';
import { DynamicComponent } from './dynamic.component';
import { SlackDataLoadComponent } from './slack-data-load/slack-data-load.component';
import { TimeFormatPipe } from './time-format.pipe';
import { SafePipe } from 'src/app/pipe/safe.pipe';
import { AppComponent } from 'src/app/app.component';
import { DurationPickerComponent } from '../common/duration-picker/duration-picker.component';
import { RoleAddComponent } from './components/role-add/role-add.component';
// import { EmployeeOnboardingPreviewComponent } from './components/employee-onboarding-preview/employee-onboarding-preview.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../common/header/header.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { BillingComponent } from './components/billing/billing.component';
import { EmployeeOnboardingDataComponent } from './components/employee-onboarding-data/employee-onboarding-data.component';
import { BillingPaymentComponent } from './components/billing-payment/billing-payment.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SuccessComponent } from './components/success/success.component';
import { EmployeeLocationValidatorComponent } from './employee-location-validator/employee-location-validator.component';
import { WebcamModule } from 'ngx-webcam';
import { AgmCoreModule } from '@agm/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { EmployeeAttendancePhotoComponent } from './employee-attendance-photo/employee-attendance-photo.component';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';

@NgModule({
  declarations: [
    DynamicComponent,
    DashboardComponent,
    TimetableComponent,
    ProjectComponent,
    TaskManagerComponent,
    LiveManagerComponent,
    OnboardingComponent,
    PaymentComponent,
    UserlistComponent,
    DateFormatPipe,
    TimeFormatPipe,
    DurationFormatPipe,
    WaitingPageComponent,
    TeamComponent,
    TeamDetailComponent,
    RoleComponent,
    // EmployeeOnboardingFormComponent,
    // EmployeeAddressDetailComponent,
    // EmployeeDocumentComponent,
    // AcadmicComponent,
    // EmployeeExperienceComponent,
    // BankDetailsComponent,
    // EmergencyContactComponent,
    ReportsComponent,
    EmployeeProfileComponent,
    TestingComponent,
    SlackDataLoadComponent,
    PrivacyComponent,
    SupportComponent,
    SafePipe,
    RoleAddComponent,
    HeaderComponent,
    // EmployeeOnboardingPreviewComponent,
    BillingComponent,
    EmployeeOnboardingDataComponent,
    BillingPaymentComponent,
    SuccessComponent,
    EmployeeLocationValidatorComponent,
    EmployeeAttendancePhotoComponent,
    


  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DynamicRoutingModule,
    ReactiveFormsModule,
    WebcamModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    NgxShimmerLoadingModule,
    NgbModule,
    FullCalendarModule,
    NzCalendarModule,
    AngularFireModule.initializeApp(environment.firebase, "cloud"),
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireMessagingModule,
    SharedModule,
    NzDatePickerModule,
    MatProgressSpinnerModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB6SQE_TmOLpGLohpMLl-6FzdwJJAU9MnA',
      libraries: ["places"]
    }),
    GooglePlaceModule,

    

    
  ],
  exports:[HeaderComponent],
  providers: [{ provide: NZ_I18N, useValue: en_US },DataService,{ provide: LOCALE_ID, useValue: 'en-US' }],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class DynamicModule { }
