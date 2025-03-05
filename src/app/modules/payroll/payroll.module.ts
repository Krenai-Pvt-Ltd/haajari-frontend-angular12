import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PayrollRoutingModule } from './payroll-routing.module';
import { PayrollSetupComponent } from './component/payroll-setup/payroll-setup.component';
import { ProfileComponent } from './component/profile/profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { PayrollComponent } from './payroll.component';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { ConfigurationComponent } from './component/configuration/configuration.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { StatutoryComponent } from './component/config/statutory/statutory.component';
import { SalaryComponent } from './component/config/salary/salary.component';
import { TaxesComponent } from './component/config/taxes/taxes.component';
import { PayScheduleComponent } from './component/config/pay-schedule/pay-schedule.component';
import { PriorPayrollComponent } from './component/config/prior-payroll/prior-payroll.component';
import { FormComponent } from './component/config/form/form.component';
import { PreferencesComponent } from './component/config/preferences/preferences.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { EarningDetailsComponent } from './component/config/earning-details/earning-details.component';
import { BenefitDetailsComponent } from './component/config/benefit-details/benefit-details.component';
import { DeductionsDetailsComponent } from './component/config/deductions-details/deductions-details.component';


@NgModule({
  declarations: [
    PayrollComponent,
    PayrollSetupComponent,
    ProfileComponent,
    ConfigurationComponent,
    StatutoryComponent,
    SalaryComponent,
    TaxesComponent,
    PayScheduleComponent,
    PriorPayrollComponent,
    FormComponent,
    PreferencesComponent,
    EarningDetailsComponent,
    BenefitDetailsComponent,
    DeductionsDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PayrollRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NzProgressModule,
    NzSelectModule,
    NzDatePickerModule,
    NzSwitchModule,
    NzEmptyModule
  ]
})
export class PayrollModule { }
