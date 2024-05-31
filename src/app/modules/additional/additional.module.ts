import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdditionalRoutingModule } from './additional-routing.module';
import { AdditionalComponent } from './additional.component';
import { LeaveRequestFormComponent } from './components/leave-request-form/leave-request-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlackInstallationSuccessfullComponent } from './components/slack-installation-successfull/slack-installation-successfull.component';


@NgModule({
  declarations: [
    AdditionalComponent,
    LeaveRequestFormComponent,
    SlackInstallationSuccessfullComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdditionalRoutingModule
  ]
})
export class AdditionalModule { }
