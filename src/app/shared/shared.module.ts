import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HajiriPageLoaderComponent } from '../modules/common/hajiri-page-loader/hajiri-page-loader.component';
import { TopbarComponent } from '../modules/common/topbar/topbar.component';
import { NotifactionTostComponent } from '../modules/sharable/notifaction-toast/notifaction-toast.component';



@NgModule({
  declarations: [
    
    TopbarComponent,
    HajiriPageLoaderComponent,
    NotifactionTostComponent
  ],
 
  imports: [
    CommonModule,
    NgbModule,
    
  ],
  exports:[
    TopbarComponent,
    HajiriPageLoaderComponent,
    NotifactionTostComponent
  ],
})
export class SharedModule { } 
