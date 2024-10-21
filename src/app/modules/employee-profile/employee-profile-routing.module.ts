import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../authentication/auth/auth-guard';
import { EmployeeProfileComponent } from './employee-profile.component';

const routes: Routes = [{
  path: '', component: EmployeeProfileComponent,
  children: [
    {
      path: 'dashboard',
      component: EmployeeProfileComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeProfileRoutingModule { }
