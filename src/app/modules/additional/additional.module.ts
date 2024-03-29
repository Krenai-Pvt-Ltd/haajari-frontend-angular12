import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdditionalRoutingModule } from './additional-routing.module';
import { AdditionalComponent } from './additional.component';
import { LeaveRequestFormComponent } from './components/leave-request-form/leave-request-form.component';


@NgModule({
  declarations: [
    AdditionalComponent,
    LeaveRequestFormComponent
  ],
  imports: [
    CommonModule,
    AdditionalRoutingModule
  ]
})
export class AdditionalModule { }
