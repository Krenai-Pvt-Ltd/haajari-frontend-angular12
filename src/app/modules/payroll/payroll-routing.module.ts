import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollSetupComponent } from './component/payroll-setup/payroll-setup.component';
import { PayrollComponent } from './payroll.component';
import { ConfigurationComponent } from './component/configuration/configuration.component';
import { EarningDetailsComponent } from './component/config/earning-details/earning-details.component';
import { SalaryComponentRequest } from 'src/app/models/salary-component-request';
import { SalaryTemplateComponent } from './component/salary-template/salary-template.component';


const routes: Routes = [{ path: '', redirectTo: '/payroll/setup', pathMatch: 'full' },
  {
    path: '', component: PayrollComponent,
    children: [
      {
        path: 'setup',
        component: PayrollSetupComponent,
      },
      {
        path: 'configuration',
        component: ConfigurationComponent
      },
      {
        path: 'earning-details',
        component: EarningDetailsComponent
      },
      {
        path: 'salary-template',
        component: SalaryTemplateComponent
      },
      
    ]
  }
  
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
