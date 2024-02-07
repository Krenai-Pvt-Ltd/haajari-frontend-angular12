import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication.component';
import { AddToSlackComponent } from './add-to-slack/add-to-slack.component';
import { LoginComponent } from './login/login.component';
import { NewLoginComponent } from './new-login/new-login.component';
import { SlackAuthComponent } from './slack-auth/slack-auth.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';

const routes: Routes = [{ path: '', redirectTo: '/auth/login', pathMatch:'full'},
    { path: '', component: AuthenticationComponent,
  
    children:[
      
    {path: 'slackauth', component: SlackAuthComponent},
    {path: 'addtoslack', component: AddToSlackComponent},
    {path : 'new-login', component: NewLoginComponent},
    { path: 'login', component: LoginComponent },
    { path: 'otp-verification', component: OtpVerificationComponent }
  ] }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
