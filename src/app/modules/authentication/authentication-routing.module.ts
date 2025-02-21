import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication.component';
import { LoginComponent } from './components/login/login.component';
import { SlackAuthComponent } from './components/sign-in-with-slack-auth/slack-auth/slack-auth.component';
import { SignInWithSlackComponent } from './components/sign-in-with-slack-auth/sign-in-with-slack.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { OnboardingWhatappComponent } from './components/onboarding-whatapp/onboarding-whatapp.component';
import { OrganizationRegistrationFormComponent } from './components/organization-registration-form/organization-registration-form.component';
import { OrganizationPersonalInformationComponent } from './components/organization-personal-information/organization-personal-information.component';
import { AddShiftTimeComponent } from './components/add-shift-time/add-shift-time.component';
import { UploadTeamComponent } from './components/upload-team/upload-team.component';
import { AttendanceModeComponent } from './components/attendance-mode/attendance-mode.component';
import { ShiftTimeListComponent } from './components/shift-time-list/shift-time-list.component';
import { AddShiftPlaceholderComponent } from './components/add-shift-placeholder/add-shift-placeholder.component';

const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: '',
    component: AuthenticationComponent,

    children: [
      { path: 'slackauth', component: SlackAuthComponent },
      {
        path: 'sign-in-with-slack',
        component: SignInWithSlackComponent,
      },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignUpComponent },
      {
        path: 'onboarding-whatapp',
        component: OnboardingWhatappComponent,
      },
      {
        path: 'organization-registration-form',
        component: OrganizationRegistrationFormComponent,
      },
      { path: 'personal-information', component: OrganizationPersonalInformationComponent },
      { path: 'add-shift-time', component: AddShiftTimeComponent },
      { path: 'upload-team', component: UploadTeamComponent },
      { path: 'attendance-mode', component: AttendanceModeComponent },
      { path: 'shift-time-list', component: ShiftTimeListComponent },
      { path: 'add-shift-placeholder', component: AddShiftPlaceholderComponent },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule { }
