import { NgModule, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './modules/common/header/header.component';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { EmployeeOnboardingSidebarComponent } from './modules/common/employee-onboarding-sidebar/employee-onboarding-sidebar.component';
import { RequestInterceptorService } from './configuration/request-interceptor.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,
    NgbModule
    // AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
      {provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptorService,
      multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  
}
