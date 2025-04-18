import { NgModule } from '@angular/core';
import { SettingRoutingModule } from './setting-routing.module';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { LeaveSettingComponent } from './components/leave-setting/leave-setting.component';
import { SettingComponent } from './setting.component';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DynamicModule } from '../dynamic/dynamic.module';
import { CommonModule } from '@angular/common';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { StaffAttendanceLocationComponent } from './components/staff-attendance-location/staff-attendance-location.component';
import { UploadPhotoComponent } from './components/upload-photo/upload-photo.component';
import { NgxMaskModule } from 'ngx-mask';
import { SalarySettingComponent } from './components/salary-setting/salary-setting.component';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NgOtpInputModule } from 'ng-otp-input';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AgmCoreModule } from '@agm/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { ExistPolicyComponent } from './components/exist-policy/exist-policy.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { LeavePolicyComponent } from './components/leave-policy/leave-policy.component';
import { LeavePolicyListComponent } from './components/leave-policy-list/leave-policy-list.component';


@NgModule({
  declarations: [
    SettingComponent,
    AttendanceSettingComponent,
    CompanySettingComponent,
    SalarySettingComponent,
    LeaveSettingComponent,
    AccountSettingsComponent,
    StaffAttendanceLocationComponent,
    UploadPhotoComponent,
    SalarySettingComponent,
    ExistPolicyComponent,
    LeavePolicyComponent,
    LeavePolicyListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GooglePlaceModule,
    ReactiveFormsModule,
    SettingRoutingModule,
    NgxPaginationModule,
    NgxShimmerLoadingModule,
    NzSwitchModule,
    DynamicModule,
    NgxMaskModule.forRoot(),
    NzInputNumberModule,
    NzPopoverModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzCalendarModule,
    NgOtpInputModule,
    NzAutocompleteModule,
    NzDropDownModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzFormModule,
    NzToolTipModule,
    NzEmptyModule,
    NgbModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB6SQE_TmOLpGLohpMLl-6FzdwJJAU9MnA',
      libraries: ['places'],
    }),
    DragDropModule,
    NgbTooltipModule,
    SharedModule,
    NzAlertModule,

  ],
})
export class SettingModule { }
