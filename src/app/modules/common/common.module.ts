import { NgModule } from '@angular/core';
import { CommonRoutingModule } from './common-routing.module';
import { ErrorPageComponent } from './error-page/error-page.component';
import { SlackDataLoaderComponent } from './slack-data-loader/slack-data-loader.component';
import { DurationPickerComponent } from './duration-picker/duration-picker.component';
import { CommonComponent } from './common.component';
import { TopbarComponent } from './topbar/topbar.component';
import { HajiriPageLoaderComponent } from './hajiri-page-loader/hajiri-page-loader.component';
import { HeaderComponent } from './header/header.component';
import { MediaManagerCropComponent } from './media-manager-crop/media-manager-crop.component';


@NgModule({
  declarations: [
  
    ErrorPageComponent,
    HajiriPageLoaderComponent,
    TopbarComponent,
    SlackDataLoaderComponent,
    DurationPickerComponent,
    CommonComponent,
    HeaderComponent,
    MediaManagerCropComponent,
  ],
  imports: [
    CommonModule,
    CommonRoutingModule
  ],
  exports: [
  ]
})
export class CommonModule { }
