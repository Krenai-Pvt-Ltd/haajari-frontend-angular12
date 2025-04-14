import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollSetupComponent } from './component/payroll-setup/payroll-setup.component';
import { PayrollComponent } from './payroll.component';
import { ConfigurationComponent } from './component/configuration/configuration.component';
import { PayrollManagementComponent } from './component/payroll-management/payroll-management.component';
import { StatutoryDeductionComponent } from './component/statutory-deduction/statutory-deduction.component';
import { SalaryTemplateComponent } from './component/salary-template/salary-template.component';
import { SalaryTemplateCopyComponent } from './component/salary-template-copy/salary-template-copy.component';


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
        path: 'payroll-management',
        component: PayrollManagementComponent
      },
      {
        path: 'statutory-deduction',
        component: StatutoryDeductionComponent
      },
      {
        path: 'salary-template',
        component: SalaryTemplateComponent
      },
      {
        path: 'salary-template-copy',
        component: SalaryTemplateCopyComponent
      },
      
      
    ]
  }
  
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
