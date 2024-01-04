import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HajiriPageLoaderComponent } from '../modules/common/hajiri-page-loader/hajiri-page-loader.component';
import { TopbarComponent } from '../modules/common/topbar/topbar.component';



@NgModule({
  declarations: [
    
    TopbarComponent,
    HajiriPageLoaderComponent,
  ],
  exports:[
    TopbarComponent,
    HajiriPageLoaderComponent,
  ],
  imports: [
    CommonModule,
    NgbModule
  ]
})
export class SharedModule { }
