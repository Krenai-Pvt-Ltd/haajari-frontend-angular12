import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { ConstantComponent } from './constant/constant.component';
import { HelperComponent } from './helper/helper.component';


@NgModule({
  declarations: [
    ConstantComponent,
    HelperComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ]
})
export class SharedModule { }
