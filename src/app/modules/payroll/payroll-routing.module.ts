import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollSetupComponent } from './component/payroll-setup/payroll-setup.component';
import { PayrollComponent } from './payroll.component';
import { ConfigurationComponent } from './component/config/configuration/configuration.component';


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
      
    ]
  }
  
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
