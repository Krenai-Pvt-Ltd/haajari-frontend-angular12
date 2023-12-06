import { NgModule } from '@angular/core';

import { DynamicRoutingModule } from './dynamic-routing.module';
import { DynamicComponent } from './dynamic.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HeaderComponent } from '../common/header/header.component';
import { TopbarComponent } from '../common/topbar/topbar.component';
import { TimetableComponent } from './components/timetable/timetable.component';
import { ProjectComponent } from './components/project/project.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';
import { LiveManagerComponent } from './components/live-manager/live-manager.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { LoginComponent } from './components/login/login.component';
import { PaymentComponent } from './components/payment/payment.component';
import { UserlistComponent } from './components/userlist/userlist.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SlackAuthComponent } from './components/slack-auth/slack-auth.component';
import { AddToSlackComponent } from './components/add-to-slack/add-to-slack.component';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import { DateFormatPipe } from './date-format.pipe';
import { TimeFormatPipe } from './time-format.pipe';
import { DurationFormatPipe } from './duration-format.pipe';
import { WaitingPageComponent } from './components/waiting-page/waiting-page.component';
import { TeamComponent } from './components/team/team.component';
import { CommonModule } from '@angular/common';
import { TeamDetailComponent } from './components/team-detail/team-detail.component';
import { EmployeeOnboardingComponent } from './components/employee-onboarding/employee-onboarding.component';
import { NgxShimmerLoadingModule } from  'ngx-shimmer-loading';
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { SelerySettingComponent } from './components/selery-setting/selery-setting.component';
import { RoleComponent } from './components/role/role.component';
import { EmployeeOnboardingFormComponent } from './components/employee-onboarding-form/employee-onboarding-form.component';
import { EmployeeOnboardingSidebarComponent } from '../common/employee-onboarding-sidebar/employee-onboarding-sidebar.component';
import { EmployeeAddressDetailComponent } from './components/employee-address-detail/employee-address-detail.component';
import { EmployeeDocumentComponent } from './components/employee-document/employee-document.component';
import { AcadmicComponent } from './components/acadmic/acadmic.component';
import { EmployeeExperienceComponent } from './components/employee-experience/employee-experience.component';
import { BankDetailsComponent } from './components/bank-details/bank-details.component';
import { EmergencyContactComponent } from './components/emergency-contact/emergency-contact.component';
import { ReportsComponent } from './components/reports/reports.component';
import { EmployeeProfileComponent } from './components/employee-profile/employee-profile.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TestingComponent } from './components/testing/testing.component';



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
  ],
  imports: [
    CommonModule,
    FormsModule,
    DynamicRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    NgxShimmerLoadingModule,
    NgbModule
  
  ]
})
export class DynamicModule { }
