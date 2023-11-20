import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../modules/common/header/header.component';
import { TopbarComponent } from '../modules/common/topbar/topbar.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';



@NgModule({
  declarations: [
    HeaderComponent,
    TopbarComponent,
  ],
  exports:[
    HeaderComponent,
    TopbarComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AppRoutingModule
  ]
})
export class SharedModule { }
