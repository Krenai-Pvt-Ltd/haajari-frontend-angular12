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


@NgModule({
  declarations: [
    PayrollComponent,
    PayrollSetupComponent,
    ProfileComponent,
    ConfigurationComponent
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
    NzDatePickerModule
  ]
})
export class PayrollModule { }
