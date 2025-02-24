import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollDashboardComponent } from './payroll-dashboard/payroll-dashboard.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { BonusAndDeductionComponent } from './bonus-and-deduction/bonus-and-deduction.component';
import { TdsComponent } from './tds/tds.component';
import { PaymentComponent } from './payment.component';
import { LeaveSummaryComponent } from './leave-summary/leave-summary.component';
import { AuthGuard } from '../../guards/auth-guard';
import { SubscriptionGuard } from 'src/app/guards/subscription.guard';

const routes: Routes = [{ path: '', redirectTo: '/payment/payroll-dashboard', pathMatch: 'full' },
{
  path: '', component: PaymentComponent,
  children: [
    {
      path: 'payroll-dashboard',
      component: PayrollDashboardComponent,
      canActivate: [AuthGuard, SubscriptionGuard]
    },
    {
      path: 'payment-history',
      component: PaymentHistoryComponent,
      canActivate: [AuthGuard, SubscriptionGuard]
    },
    {
      path: 'bonus-and-deduction',
      component: BonusAndDeductionComponent,
      canActivate: [AuthGuard, SubscriptionGuard]
    },
    {
      path: 'epf-esi-tds',
      component: TdsComponent,
      canActivate: [AuthGuard, SubscriptionGuard]
    },
    {
      path: 'payroll-dashboard/leave-summary',
      component: LeaveSummaryComponent,
      canActivate: [AuthGuard, SubscriptionGuard]
    },
    {
      path: 'payroll-dashboard/payroll-setup',
      component: LeaveSummaryComponent,
      canActivate: [AuthGuard, SubscriptionGuard]
    }
  ]
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
