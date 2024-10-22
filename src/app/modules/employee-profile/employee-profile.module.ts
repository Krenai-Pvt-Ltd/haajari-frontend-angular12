import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeProfileRoutingModule } from './employee-profile-routing.module';
import { EmployeeProfileComponent } from './employee-profile.component';
import { EmployeeProfileSidebarComponent } from './employee-profile-sidebar/employee-profile-sidebar.component';
import { EmployeeProfileTopbarComponent } from './employee-profile-topbar/employee-profile-topbar.component';
import { AttendanceLeaveComponent } from './attendance-leave/attendance-leave.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { EmployeeDocumentComponent } from './employee-document/employee-document.component';



@NgModule({
  declarations: [
    EmployeeProfileComponent,
    EmployeeProfileSidebarComponent,
    EmployeeProfileTopbarComponent,
    AttendanceLeaveComponent,
    EmployeeDocumentComponent
  ],
  imports: [
    CommonModule,
    EmployeeProfileRoutingModule,
    NzDatePickerModule,
    NzDropDownModule,
    NzSelectModule
  ]
})
export class EmployeeProfileModule { }
