import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SlackOnboardingSuccessPageComponent } from './slack-onboarding-success-page/slack-onboarding-success-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/shared', pathMatch: 'full' },
  {
    path: '',
    component: SlackOnboardingSuccessPageComponent,

    children: [
      {
        path: 'slack-installation-successfull',
        component: SlackOnboardingSuccessPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SharedRoutingModule {}
