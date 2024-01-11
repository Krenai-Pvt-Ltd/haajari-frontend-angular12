import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
// import { ConstantComponent } from './constant/constant.component';
import { HelperComponent } from './helper/helper.component';
import { NotifactionTostComponent } from 'src/app/modules/sharable/notifaction-toast/notifaction-toast.component';


@NgModule({
  declarations: [
    // ConstantComponent,
    HelperComponent,
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports:[
   
  ]
})
export class SharedModule { }
