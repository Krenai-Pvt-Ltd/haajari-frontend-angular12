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
import { EmployeeOnboardingSidebarComponent } from '../common/employee-onboarding-sidebar/employee-onboarding-sidebar.component';
import { AcadmicComponent } from './components/acadmic/acadmic.component';
import { AddToSlackComponent } from './components/add-to-slack/add-to-slack.component';
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { BankDetailsComponent } from './components/bank-details/bank-details.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmergencyContactComponent } from './components/emergency-contact/emergency-contact.component';
import { EmployeeAddressDetailComponent } from './components/employee-address-detail/employee-address-detail.component';
import { EmployeeDocumentComponent } from './components/employee-document/employee-document.component';
import { EmployeeExperienceComponent } from './components/employee-experience/employee-experience.component';
import { EmployeeOnboardingFormComponent } from './components/employee-onboarding-form/employee-onboarding-form.component';
import { EmployeeOnboardingComponent } from './components/employee-onboarding/employee-onboarding.component';
import { EmployeeProfileComponent } from './components/employee-profile/employee-profile.component';
import { LeaveSettingComponent } from './components/leave-setting/leave-setting.component';
import { LiveManagerComponent } from './components/live-manager/live-manager.component';
import { LoginComponent } from './components/login/login.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { PaymentComponent } from './components/payment/payment.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { ProjectComponent } from './components/project/project.component';
import { ReportsComponent } from './components/reports/reports.component';
import { RoleComponent } from './components/role/role.component';
import { SelerySettingComponent } from './components/selery-setting/selery-setting.component';
import { SlackAuthComponent } from './components/slack-auth/slack-auth.component';
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
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { NewLoginComponent } from './components/new-login/new-login.component';


@NgModule({
  declarations: [
    DynamicComponent,
    DashboardComponent,
    TimetableComponent,
    ProjectComponent,
    TaskManagerComponent,
    LiveManagerComponent,
    OnboardingComponent,
    LoginComponent,
    PaymentComponent,
    UserlistComponent,
    SlackAuthComponent,
    AddToSlackComponent,
    DateFormatPipe,
    TimeFormatPipe,
    DurationFormatPipe,
    WaitingPageComponent,
    TeamComponent,
    TeamDetailComponent,
    EmployeeOnboardingComponent,
    AttendanceSettingComponent,
    CompanySettingComponent,
    SelerySettingComponent,
    RoleComponent,
    EmployeeOnboardingFormComponent,
    EmployeeOnboardingSidebarComponent,
    EmployeeAddressDetailComponent,
    EmployeeDocumentComponent,
    AcadmicComponent,
    EmployeeExperienceComponent,
    BankDetailsComponent,
    EmergencyContactComponent,
    ReportsComponent,
    EmployeeProfileComponent,
    TestingComponent,
    LeaveSettingComponent,
    SlackDataLoadComponent,
    PrivacyComponent,
    SupportComponent,
    SafePipe,
    RoleAddComponent,
    AccountSettingsComponent,
    NewLoginComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    DynamicRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    NgxShimmerLoadingModule,
    NgbModule,
    FullCalendarModule,
    AngularFireModule.initializeApp(environment.firebase, "cloud"),
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireMessagingModule,
    
  ],
  providers: [DataService,{ provide: LOCALE_ID, useValue: 'en-US' }],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class DynamicModule { }
