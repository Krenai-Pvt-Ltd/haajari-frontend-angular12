import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
// import { ConstantComponent } from './constant/constant.component';
import { HelperComponent } from './helper/helper.component';
import { NotifactionTostComponent } from 'src/app/modules/sharable/notifaction-toast/notifaction-toast.component';
import { OrganizationPersonalInformationComponent } from '../organization-onboarding/components/organization-personal-information/organization-personal-information.component';
import { LogoutConfirmationModalComponent } from './logout-confirmation-modal/logout-confirmation-modal.component';
import { SlackOnboardingSuccessPageComponent } from './slack-onboarding-success-page/slack-onboarding-success-page.component';

@NgModule({
  declarations: [
    // ConstantComponent,
    HelperComponent,
    OrganizationPersonalInformationComponent,
    LogoutConfirmationModalComponent,
    SlackOnboardingSuccessPageComponent,
  ],
  imports: [CommonModule, SharedRoutingModule],
  exports: [],
})
export class SharedModule {}
