import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentComponent } from './payment.component';
import { PayrollDashboardComponent } from './payroll-dashboard/payroll-dashboard.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { TdsComponent } from './tds/tds.component';
import { BonusAndDeductionComponent } from './bonus-and-deduction/bonus-and-deduction.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicModule } from '../dynamic/dynamic.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DateFormatterPipe } from 'src/app/pipe/date-formatter.pipe';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { LeaveSummaryComponent } from './leave-summary/leave-summary.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { EarningManagementComponent } from './earning-management/earning-management.component';
import { SalaryDeductionManagementComponent } from './salary-deduction-management/salary-deduction-management.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@NgModule({
  declarations: [
    PaymentComponent,
    PayrollDashboardComponent,
    PaymentHistoryComponent,
    TdsComponent,
    BonusAndDeductionComponent,
    DateFormatterPipe,
    LeaveSummaryComponent,
    EmployeeManagementComponent,
    EarningManagementComponent,
    SalaryDeductionManagementComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DynamicModule,
    ReactiveFormsModule,
    PaymentRoutingModule,
    NzDatePickerModule,
    NzDropDownModule,
    NgxPaginationModule,
    NgxShimmerLoadingModule,
    NgxChartsModule,
    NzEmptyModule,
    NgbModule,
    NzSelectModule,
    NzSwitchModule,
    NzToolTipModule
  ],
})
export class PaymentModule {}
