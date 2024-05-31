import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdditionalComponent } from './additional.component';
import { LeaveRequestFormComponent } from './components/leave-request-form/leave-request-form.component';
import { SlackInstallationSuccessfullComponent } from './components/slack-installation-successfull/slack-installation-successfull.component';

const routes: Routes = [{ path: '', redirectTo: '/additional/leave-request', pathMatch:'full'},
  { path: '', component: AdditionalComponent,

  children:[
  {path: 'leave-request', component: LeaveRequestFormComponent},
  {path: 'slack-installation-successfull', component: SlackInstallationSuccessfullComponent}
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdditionalRoutingModule { }
