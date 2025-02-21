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


@NgModule({
  declarations: [
    PayrollComponent,
    PayrollSetupComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PayrollRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NzProgressModule
  ]
})
export class PayrollModule { }
