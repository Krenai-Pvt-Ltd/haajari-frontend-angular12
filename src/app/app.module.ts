import { Compiler, NgModule } from '@angular/core';


import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RequestInterceptorService } from './configuration/request-interceptor.service';
import { SharedModule } from './shared/shared.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NotifactionTostComponent } from './modules/common/notifaction-tost/notifaction-tost.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    AppComponent,
    NotifactionTostComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,
    NgbModule,
    FullCalendarModule

    // CalendarModule.forRoot({
    //   provide: DateAdapter,
    //   useFactory: adapterFactory,
    // }),
    // AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
      {provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptorService,
      multi: true},
      AngularFireStorage,
      Compiler
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  
}
