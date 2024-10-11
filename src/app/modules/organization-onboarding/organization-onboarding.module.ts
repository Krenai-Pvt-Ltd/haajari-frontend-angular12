import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationOnboardingRoutingModule } from './organization-onboarding-routing.module';
import { OrganizationOnboardingComponent } from './organization-onboarding.component';
import { OrganizationPersonalInformationComponent } from './components/organization-personal-information/organization-personal-information.component';
import { LeaveRuleSetupComponent } from './components/leave-rule-setup/leave-rule-setup.component';
import { HolidayRuleSetupComponent } from './components/holiday-rule-setup/holiday-rule-setup.component';
import { OrganizationOnboardingSidebarComponent } from './components/organization-onboarding-sidebar/organization-onboarding-sidebar.component';
import { AutomationRulesComponent } from './components/automation-rules/automation-rules.component';
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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { AttendanceModeComponent } from './components/attendance-mode/attendance-mode.component';
import { ShiftTimeListComponent } from './components/shift-time-list/shift-time-list.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { AddShiftPlaceholderComponent } from './components/add-shift-placeholder/add-shift-placeholder.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@NgModule({
  declarations: [
    OrganizationOnboardingComponent,
    OrganizationPersonalInformationComponent,
    LeaveRuleSetupComponent,
    HolidayRuleSetupComponent,
    OrganizationOnboardingSidebarComponent,
    AutomationRulesComponent,
    LeaveSettingComponent,
    LeaveSettingCreateComponent,
    AddShiftTimeComponent,
    HolidaySettingComponent,
    UploadTeamComponent,
    AttendanceModeComponent,
    ShiftTimeListComponent,
    AddShiftPlaceholderComponent,
  ],
  imports: [
    CommonModule,
    OrganizationOnboardingRoutingModule,
    RouterModule,
    FormsModule,
    DynamicRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase, 'cloud'),
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireMessagingModule,
    NgxMaskModule.forRoot(),
    NgbModule,
    GooglePlaceModule,
    NgxPaginationModule,
    NgxShimmerLoadingModule,
    NzTimePickerModule,
    NzDatePickerModule,
    ImageCropperModule,
    NzEmptyModule,
    NzSelectModule,
    // NzOptionModule,
    NzToolTipModule,
    NgxMaskModule.forRoot(),
    NgbModule,
    NzAutocompleteModule,
    NzDropDownModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule
  ],
})
export class OrganizationOnboardingModule {}
