import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponent } from './shared.component';
import { SlackOnboardingSuccessPageComponent } from './slack-onboarding-success-page/slack-onboarding-success-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/shared/slack-installation-successfull',
    pathMatch: 'full',
  },
  {
    path: '',
    component: SharedComponent,

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
