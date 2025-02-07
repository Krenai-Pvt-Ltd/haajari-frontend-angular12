import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { SlackDataLoaderComponent } from './slack-data-loader/slack-data-loader.component';
import { DurationPickerComponent } from './duration-picker/duration-picker.component';
import { HajiriPageLoaderComponent } from './hajiri-page-loader/hajiri-page-loader.component';

const routes: Routes = [
  { path: 'header', component: HeaderComponent },
  { path: 'topbar', component: TopbarComponent },
  { path: 'error-page', component: ErrorPageComponent },
  { path: 'slack-data-loader', component: SlackDataLoaderComponent },
  { path: 'duration-picker', component: DurationPickerComponent },
  { path: 'hajiri-page-loader', component: HajiriPageLoaderComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommonRoutingModule {}
