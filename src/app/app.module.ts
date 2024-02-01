import { NgModule } from '@angular/core';


import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RequestInterceptorService } from './configuration/request-interceptor.service';
import { DurationPickerComponent } from './modules/common/duration-picker/duration-picker.component';
import { ErrorPageComponent } from './modules/common/error-page/error-page.component';
import { SlackDataLoaderComponent } from './modules/common/slack-data-loader/slack-data-loader.component';
import { SettingModule } from './modules/setting/setting.module';
import { SharedComponent } from './modules/shared/shared.component';
import { SharedModule } from './shared/shared.module';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { NgxMaskModule, IConfig } from 'ngx-mask';
// import { OnboardingSidebarResponse } from './models/onboarding-sidebar-response';



@NgModule({
  declarations: [
    AppComponent,
  
    ErrorPageComponent,
    SlackDataLoaderComponent,
    DurationPickerComponent,
    SharedComponent
 
    // AuthenticationComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule, 
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxShimmerLoadingModule,
    SharedModule,
    NgbModule,
    FullCalendarModule,
    SettingModule,
    BrowserAnimationsModule,
    Ng2TelInputModule,
    NgxMaskModule.forRoot()
    // OnboardingSidebarResponse

    

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
