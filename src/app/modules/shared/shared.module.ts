import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
// import { ConstantComponent } from './constant/constant.component';
import { HelperComponent } from './helper/helper.component';
import { NotifactionTostComponent } from 'src/app/modules/sharable/notifaction-toast/notifaction-toast.component';
import { LogoutConfirmationModalComponent } from './logout-confirmation-modal/logout-confirmation-modal.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedComponent } from './shared.component';
import { HeaderComponent } from '../common/header/header.component';
import { AgmCoreModule } from '@agm/core';
@NgModule({
  declarations: [
    // ConstantComponent,

    SharedComponent,
    HelperComponent,
    LogoutConfirmationModalComponent
  ],
  imports: [CommonModule, FormsModule, RouterModule, SharedRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB6SQE_TmOLpGLohpMLl-6FzdwJJAU9MnA',
      libraries: ['places'],
    }),
  ],
  exports: [],
})
export class SharedModule {}
