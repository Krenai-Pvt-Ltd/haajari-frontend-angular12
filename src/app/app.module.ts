import { NgModule } from '@angular/core';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { CommonModule, registerLocaleData } from '@angular/common';
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
import { SharedModule } from './shared/shared.module';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { NgxMaskModule } from 'ngx-mask';
import { UnauthorizedComponent } from './modules/sharable/unauthorized/unauthorized.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ConfirmationDialogComponent } from './modules/sharable/confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { HeaderComponent } from './modules/common/header/header.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { SubscriptionExpiredComponent } from './modules/common/subscription-expired/subscription-expired.component';
import { SubscriptionRestrictedComponent } from './modules/common/subscription-restricted/subscription-restricted.component';
import { AgmCoreModule } from '@agm/core';
import { ExitModalComponent } from './modules/common/exit-modal/exit-modal.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
@NgModule({
  declarations: [
    AppComponent,
    ErrorPageComponent,
    SlackDataLoaderComponent,
    DurationPickerComponent,
    UnauthorizedComponent,
    ConfirmationDialogComponent,
    HeaderComponent,
    SubscriptionExpiredComponent,
    SubscriptionRestrictedComponent,
    ExitModalComponent
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
    NgxMaskModule.forRoot(),
    DragDropModule,
    MatDialogModule,
    MatButtonModule,
    NzSwitchModule,
    NzPopoverModule,

    // OnboardingSidebarResponse

    // CalendarModule.forRoot({
    //   provide: DateAdapter,
    //   useFactory: adapterFactory,
    // }),
    // AngularFireModule.initializeApp(environment.firebase),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB6SQE_TmOLpGLohpMLl-6FzdwJJAU9MnA',
      libraries: ['places'],
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptorService,
      multi: true,
    },
    AngularFireStorage
    // Compiler
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
