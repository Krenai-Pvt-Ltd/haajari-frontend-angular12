import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthenticationComponent } from './authentication.component';
import { NewLoginComponent } from './new-login/new-login.component';
import { SlackAuthComponent } from './slack-auth/slack-auth.component';
import { AddToSlackComponent } from './add-to-slack/add-to-slack.component';
import { LoginComponent } from './login/login.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgxMaskModule } from 'ngx-mask';
import { SignInWithSlackComponent } from './sign-in-with-slack-auth/sign-in-with-slack.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { OnboardingWhatsAppSlackComponent } from './onboarding-whats-app-slack/onboarding-whats-app-slack.component';
import { OnboardingWhatappComponent } from './onboarding-whatapp/onboarding-whatapp.component';
import { OrganizationRegistrationFormComponent } from './organization-registration-form/organization-registration-form.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzProgressModule } from 'ng-zorro-antd/progress';
@NgModule({
  declarations: [
    AuthenticationComponent,
    LoginComponent,
    NewLoginComponent,
    SlackAuthComponent,
    AddToSlackComponent,
    OtpVerificationComponent,
    SignInWithSlackComponent,
    SignUpComponent,
    OnboardingWhatsAppSlackComponent,
    OnboardingWhatappComponent,
    OrganizationRegistrationFormComponent,
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    NzSelectModule,
    NzProgressModule,
    NgxMaskModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AuthenticationModule {}
