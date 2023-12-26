import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../modules/common/header/header.component';
import { TopbarComponent } from '../modules/common/topbar/topbar.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HajiriPageLoaderComponent } from '../modules/common/hajiri-page-loader/hajiri-page-loader.component';



@NgModule({
  declarations: [
    HeaderComponent,
    TopbarComponent,
    HajiriPageLoaderComponent,
  ],
  exports:[
    HeaderComponent,
    TopbarComponent,
    HajiriPageLoaderComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AppRoutingModule,
    NgbModule
  ]
})
export class SharedModule { }
