import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HajiriPageLoaderComponent } from '../modules/common/hajiri-page-loader/hajiri-page-loader.component';
import { TopbarComponent } from '../modules/common/topbar/topbar.component';
import { NotifactionTostComponent } from '../modules/sharable/notifaction-toast/notifaction-toast.component';
import { CommonToDoStepsComponent } from '../modules/common/common-to-do-steps/common-to-do-steps.component';
import { HeaderComponent } from '../modules/common/header/header.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

@NgModule({
  declarations: [
    CommonToDoStepsComponent,
    TopbarComponent,
    HajiriPageLoaderComponent,
    NotifactionTostComponent,
  ],

  imports: [CommonModule, NgbModule],
  exports: [
    TopbarComponent,
    HajiriPageLoaderComponent,
    NotifactionTostComponent,
    CommonToDoStepsComponent,
  ],
})
export class SharedModule {}
