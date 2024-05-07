import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollDashboardComponent } from './payroll-dashboard/payroll-dashboard.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { BonusAndDeductionComponent } from './bonus-and-deduction/bonus-and-deduction.component';
import { TdsComponent } from './tds/tds.component';
import { PaymentComponent } from './payment.component';
import { LeaveSummaryComponent } from './leave-summary/leave-summary.component';

const routes: Routes = [{path : '', redirectTo : '/payment/payroll-dashboard', pathMatch : 'full'},
{path : '', component : PaymentComponent,
  children: [
    {path : 'payroll-dashboard', component : PayrollDashboardComponent},
    {path : 'payment-history', component : PaymentHistoryComponent},
    {path : 'bonus-and-deduction', component : BonusAndDeductionComponent},
    {path : 'tds', component : TdsComponent},
    {path : 'payroll-dashboard/leave-summary', component : LeaveSummaryComponent}
  ]
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
