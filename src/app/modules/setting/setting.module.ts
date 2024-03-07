import { NgModule } from '@angular/core';

import { SettingRoutingModule } from './setting-routing.module';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { LeaveSettingComponent } from './components/leave-setting/leave-setting.component';
import { SettingComponent } from './setting.component';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DynamicModule } from "../dynamic/dynamic.module";
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
        SalarySettingComponent
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
        NzDatePickerModule,
        NzCalendarModule
        
       
        
    ]
})
export class SettingModule { }
