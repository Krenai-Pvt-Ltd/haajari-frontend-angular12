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
import { BrowserModule } from '@angular/platform-browser';
import { DynamicModule } from '../dynamic/dynamic.module';


@NgModule({
  declarations: [
    PaymentComponent,
    PayrollDashboardComponent,
    PaymentHistoryComponent,
    TdsComponent,
    BonusAndDeductionComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DynamicModule,
    ReactiveFormsModule,
    PaymentRoutingModule
  ]
})
export class PaymentModule { }
