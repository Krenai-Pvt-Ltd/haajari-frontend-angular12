import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing.module';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { AttendanceSettingComponent } from './components/attendance-setting/attendance-setting.component';
import { CompanySettingComponent } from './components/company-setting/company-setting.component';
import { LeaveSettingComponent } from './components/leave-setting/leave-setting.component';
import { SelerySettingComponent } from './components/selery-setting/selery-setting.component';
import { SettingComponent } from './setting.component';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DynamicModule } from "../dynamic/dynamic.module";


@NgModule({
    declarations: [
        SettingComponent,
        AttendanceSettingComponent,
        CompanySettingComponent,
        SelerySettingComponent,
        LeaveSettingComponent,
        AccountSettingsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        SettingRoutingModule,
        NgxPaginationModule,
        NgxShimmerLoadingModule,
        DynamicModule
    ]
})
export class SettingModule { }
