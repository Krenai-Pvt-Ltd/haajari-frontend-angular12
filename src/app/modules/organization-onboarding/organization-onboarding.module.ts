import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationOnboardingRoutingModule } from './organization-onboarding-routing.module';
import { OrganizationOnboardingComponent } from './organization-onboarding.component';
import { OrganizationPersonalInformationComponent } from './components/organization-personal-information/organization-personal-information.component';
import { AttendanceRuleSetupComponent } from './components/attendance-rule-setup/attendance-rule-setup.component';
import { LeaveRuleSetupComponent } from './components/leave-rule-setup/leave-rule-setup.component';
import { HolidayRuleSetupComponent } from './components/holiday-rule-setup/holiday-rule-setup.component';
import { OrganizationOnboardingSidebarComponent } from './components/organization-onboarding-sidebar/organization-onboarding-sidebar.component';
import { AutomationRulesComponent } from './components/automation-rules/automation-rules.component';
import { CreatRuleComponent } from './components/creat-rule/creat-rule.component';
import { LeaveSettingComponent } from './components/leave-setting/leave-setting.component';
import { LeaveSettingCreateComponent } from './components/leave-setting-create/leave-setting-create.component';
import { AddShiftTimeComponent } from './components/add-shift-time/add-shift-time.component';
import { HolidaySettingComponent } from './components/holiday-setting/holiday-setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DynamicRoutingModule } from '../dynamic/dynamic-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from 'src/environments/environment';
import { NgxMaskModule } from 'ngx-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgxPaginationModule } from 'ngx-pagination';
import { UploadTeamComponent } from './components/upload-team/upload-team.component';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';


@NgModule({
  declarations: [
    OrganizationOnboardingComponent,
    OrganizationPersonalInformationComponent,
    AttendanceRuleSetupComponent,
    LeaveRuleSetupComponent,
    HolidayRuleSetupComponent,
    OrganizationOnboardingSidebarComponent,
    AutomationRulesComponent,
    CreatRuleComponent,
    LeaveSettingComponent,
    LeaveSettingCreateComponent,
    AddShiftTimeComponent,
    HolidaySettingComponent,
    UploadTeamComponent
  ],
  imports: [
    CommonModule,
    OrganizationOnboardingRoutingModule,
    RouterModule,
    FormsModule,
    DynamicRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase, "cloud"),
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireMessagingModule,
    NgxMaskModule.forRoot(),
    NgbModule,
    GooglePlaceModule,
    NgxPaginationModule,
    NgxShimmerLoadingModule,
    NzTimePickerModule

  ]
})
export class OrganizationOnboardingModule { }
