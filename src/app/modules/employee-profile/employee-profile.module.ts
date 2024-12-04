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
import { AssetsComponent } from './assets/assets.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { AnnouncementNotificationComponent } from './announcement-notification/announcement-notification.component';
import { EmployeeExitComponent } from './employee-exit/employee-exit.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { EmployeeExpenseComponent } from './employee-expense/employee-expense.component';
import { DashboardComponent } from './dashboard/dashboard.component';



@NgModule({
  declarations: [
    EmployeeProfileComponent,
    EmployeeProfileSidebarComponent,
    EmployeeProfileTopbarComponent,
    AttendanceLeaveComponent,
    EmployeeDocumentComponent,
    AssetsComponent,
    PersonalInformationComponent,
    AnnouncementNotificationComponent,
    EmployeeExitComponent,
    EmployeeExpenseComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    EmployeeProfileRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzDatePickerModule,
    NzDropDownModule,
    NzSelectModule,
    NzEmptyModule,
    NzFormModule,
    ReactiveFormsModule,
    NzAutocompleteModule,
    NgbPaginationModule,
    NzTimePickerModule,
    NzDatePickerModule,
    NzToolTipModule,
    NzPopoverModule,
    NgxShimmerLoadingModule
  ]
})
export class EmployeeProfileModule { }
