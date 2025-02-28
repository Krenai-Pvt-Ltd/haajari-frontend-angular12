import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './modules/common/error-page/error-page.component';
import { SubscriptionExpiredComponent } from './modules/common/subscription-expired/subscription-expired.component';

const routes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch:'full'},
  {
    path: '',
    loadChildren: () =>
      import('./modules/dynamic/dynamic.module').then((m) => m.DynamicModule),
  },
  // {
  //   path: 'organization-onboarding',
  //   loadChildren: () =>
  //     import(
  //       './modules/organization-onboarding/organization-onboarding.module'
  //     ).then((m) => m.OrganizationOnboardingModule),
  // },
  {
    path: 'employee-onboarding',
    loadChildren: () =>
      import('./modules/employee-onboarding/employee-onboarding.module').then(
        (m) => m.EmployeeOnboardingModule
      ),
  },
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'setting',
    loadChildren: () =>
      import('./modules/setting/setting.module').then((m) => m.SettingModule),
  },
  {
    path: 'shared',
    loadChildren: () =>
      import('./modules/shared/shared.module').then((m) => m.SharedModule),
  },
  {
    path: 'additional',
    loadChildren: () =>
      import('./modules/additional/additional.module').then(
        (m) => m.AdditionalModule
      ),
  },
  {
    path: 'payment',
    loadChildren: () =>
      import('./modules/payment/payment.module').then((m) => m.PaymentModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
  { path: 'employee', loadChildren: () => import('./modules/employee-profile/employee-profile.module').then(m => m.EmployeeProfileModule) },
  
  {
    path: 'payroll',
    loadChildren: () =>
      import('./modules/payroll/payroll.module').then((m) => m.PayrollModule),
  },
  
  {path:'subscription/expired', component: SubscriptionExpiredComponent},



  { path: '**', component: ErrorPageComponent },

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
