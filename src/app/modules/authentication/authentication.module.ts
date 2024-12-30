import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthenticationComponent } from './authentication.component';
import { SlackAuthComponent } from './components/sign-in-with-slack-auth/slack-auth/slack-auth.component';
import { LoginComponent } from './components/login/login.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgxMaskModule } from 'ngx-mask';
import { SignInWithSlackComponent } from './components/sign-in-with-slack-auth/sign-in-with-slack.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { OnboardingWhatappComponent } from './components/onboarding-whatapp/onboarding-whatapp.component';
import { OrganizationRegistrationFormComponent } from './components/organization-registration-form/organization-registration-form.component';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { RegisterComponent } from './components/register/register.component';
import { AddShiftComponent } from './components/add-shift/add-shift.component';
import { SetAttendanceModeComponent } from './components/set-attendance-mode/set-attendance-mode.component';
import { OrganizationPersonalInformationComponent } from '../authentication/components/organization-personal-information/organization-personal-information.component';
import { OrganizationOnboardingSidebarComponent } from '../authentication/components/organization-onboarding-sidebar/organization-onboarding-sidebar.component';
import { AddShiftTimeComponent } from '../authentication/components/add-shift-time/add-shift-time.component';
import { DynamicRoutingModule } from '../dynamic/dynamic-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from 'src/environments/environment';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgxPaginationModule } from 'ngx-pagination';
import { UploadTeamComponent } from '../authentication/components/upload-team/upload-team.component';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { AttendanceModeComponent } from '../authentication/components/attendance-mode/attendance-mode.component';
import { ShiftTimeListComponent } from '../authentication/components/shift-time-list/shift-time-list.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { AddShiftPlaceholderComponent } from '../authentication/components/add-shift-placeholder/add-shift-placeholder.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { OnboardingSuccessfulComponent } from '../authentication/components/onboarding-successful/onboarding-successful.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSpaceModule } from 'ng-zorro-antd/space';
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
    OrganizationPersonalInformationComponent,
    OrganizationOnboardingSidebarComponent,
    AddShiftTimeComponent,
    UploadTeamComponent,
    AttendanceModeComponent,
    ShiftTimeListComponent,
    AddShiftPlaceholderComponent,
    OnboardingSuccessfulComponent,
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
    CommonModule,
    RouterModule,
    FormsModule,
    DynamicRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase, 'cloud'),
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireMessagingModule,
    NgxMaskModule.forRoot(),
    NgbModule,
    GooglePlaceModule,
    NgxPaginationModule,
    NgxShimmerLoadingModule,
    NzTimePickerModule,
    NzDatePickerModule,
    ImageCropperModule,
    NzEmptyModule,
    NzSelectModule,
    // NzOptionModule,
    NzToolTipModule,
    NgxMaskModule.forRoot(),
    NgbModule,
    NzAutocompleteModule,
    NzDropDownModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    SharedModule,
    NzImageModule,
    NzSpaceModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AuthenticationModule { }
