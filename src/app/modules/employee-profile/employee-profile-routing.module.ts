import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth-guard';
import { EmployeeProfileComponent } from './employee-profile.component';
import { EmployeeExitComponent } from './employee-exit/employee-exit.component';

const routes: Routes = [{
  path: '', component: EmployeeProfileComponent,
  children: [
    {
      path: 'dashboard',
      component: EmployeeProfileComponent,
      canActivate: [AuthGuard]
    }, 
    {
      path: 'exit',
      component: EmployeeExitComponent,
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeProfileRoutingModule { }
