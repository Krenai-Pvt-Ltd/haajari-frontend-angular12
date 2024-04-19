import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdditionalComponent } from './additional.component';
import { LeaveRequestFormComponent } from './components/leave-request-form/leave-request-form.component';

const routes: Routes = [{ path: '', redirectTo: '/additional/leave-request', pathMatch:'full'},
  { path: '', component: AdditionalComponent,

  children:[
  {path: 'leave-request', component: LeaveRequestFormComponent}
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdditionalRoutingModule { }
