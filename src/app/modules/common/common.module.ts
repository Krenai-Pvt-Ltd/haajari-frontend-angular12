import { NgModule } from '@angular/core';
import { CommonRoutingModule } from './common-routing.module';
import { ErrorPageComponent } from './error-page/error-page.component';
import { SlackDataLoaderComponent } from './slack-data-loader/slack-data-loader.component';
import { DurationPickerComponent } from './duration-picker/duration-picker.component';
import { CommonComponent } from './common.component';
import { TopbarComponent } from './topbar/topbar.component';
import { HajiriPageLoaderComponent } from './hajiri-page-loader/hajiri-page-loader.component';
import { HeaderComponent } from './header/header.component';
import { NewEmployeeProfileSidebarComponent } from './new-employee-profile-sidebar/new-employee-profile-sidebar.component';
import { AgmCoreModule } from '@agm/core';
import { HolidayDatePickerComponent } from './holiday-date-picker/holiday-date-picker.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    ErrorPageComponent,
    HajiriPageLoaderComponent,
    TopbarComponent,
    SlackDataLoaderComponent,
    DurationPickerComponent,
    CommonComponent,
    HeaderComponent,
    NewEmployeeProfileSidebarComponent,
    HolidayDatePickerComponent


  ],
  imports: [CommonModule, CommonRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB6SQE_TmOLpGLohpMLl-6FzdwJJAU9MnA',
      libraries: ['places'],
    }),
  ],
  exports: [],
})
export class CommonModule { }
