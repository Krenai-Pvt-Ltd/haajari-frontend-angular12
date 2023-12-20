import { NgModule } from '@angular/core';


import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RequestInterceptorService } from './configuration/request-interceptor.service';
import { NotifactionTostComponent } from './modules/common/notifaction-tost/notifaction-tost.component';
import { SharedModule } from './shared/shared.module';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';

import { ErrorPageComponent } from './modules/common/error-page/error-page.component';


@NgModule({
  declarations: [
    AppComponent,
    NotifactionTostComponent,
    ErrorPageComponent,
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
    FullCalendarModule,

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
      // Compiler
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  
}
