import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthenticationComponent } from './authentication.component';
import { SlackAuthComponent } from './slack-auth/slack-auth.component';
import { LoginComponent } from './login/login.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgxMaskModule } from 'ngx-mask';
import { SignInWithSlackComponent } from './sign-in-with-slack-auth/sign-in-with-slack.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { OnboardingWhatappComponent } from './onboarding-whatapp/onboarding-whatapp.component';
import { OrganizationRegistrationFormComponent } from './organization-registration-form/organization-registration-form.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { RegisterComponent } from './register/register.component';
import { AddShiftComponent } from './add-shift/add-shift.component';
import { SetAttendanceModeComponent } from './set-attendance-mode/set-attendance-mode.component';

@NgModule({
  declarations: [
    AuthenticationComponent,
    LoginComponent,
    SlackAuthComponent,
    SignInWithSlackComponent,
    SignUpComponent,
    OnboardingWhatappComponent,
    OrganizationRegistrationFormComponent,
    RegisterComponent,
    AddShiftComponent,
    SetAttendanceModeComponent,
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
