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


@NgModule({
  declarations: [
    AuthenticationComponent,
    LoginComponent,
    NewLoginComponent,
    SlackAuthComponent,
    AddToSlackComponent
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AuthenticationModule { }
