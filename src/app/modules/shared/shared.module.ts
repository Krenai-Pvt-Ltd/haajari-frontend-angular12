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

@NgModule({
  declarations: [
    // ConstantComponent,
    SharedComponent,
    HelperComponent,
    LogoutConfirmationModalComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule, SharedRoutingModule],
  exports: [],
})
export class SharedModule {}
