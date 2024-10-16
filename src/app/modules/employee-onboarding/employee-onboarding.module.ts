import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeOnboardingRoutingModule } from './employee-onboarding-routing.module';
import { BankDetailsComponent } from './bank-details/bank-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmployeeOnboardingFormComponent } from './employee-onboarding-form/employee-onboarding-form.component';

import { EmployeeAddressDetailComponent } from './employee-address-detail/employee-address-detail.component';
import { EmployeeDocumentComponent } from './employee-document/employee-document.component';
import { AcadmicComponent } from './acadmic/acadmic.component';
import { EmployeeExperienceComponent } from './employee-experience/employee-experience.component';
import { EmergencyContactComponent } from './emergency-contact/emergency-contact.component';
import { EmployeeOnboardingPreviewComponent } from './employee-onboarding-preview/employee-onboarding-preview.component';
import { RouterModule } from '@angular/router';
import { EmployeeOnboardingComponent } from './employee-onboarding.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from 'src/environments/environment';
import { EmployeeOnboardingSidebarComponent } from './employee-onboarding-sidebar/employee-onboarding-sidebar.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NumberToWordsPipe } from 'src/app/pipe/NumberToWordPipe';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { PreviewFormComponent } from './preview-form/preview-form.component';

// import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
@NgModule({
  declarations: [
    BankDetailsComponent,
    EmployeeOnboardingFormComponent,
    EmployeeAddressDetailComponent,
    EmployeeDocumentComponent,
    AcadmicComponent,
    EmployeeExperienceComponent,
    EmergencyContactComponent,
    EmployeeOnboardingPreviewComponent,
    EmployeeOnboardingComponent,
    EmployeeOnboardingSidebarComponent,
    NumberToWordsPipe,
    PreviewFormComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeOnboardingRoutingModule,
    GooglePlaceModule,
    SharedModule,
    AngularFireModule.initializeApp(environment.firebase, 'cloud'),
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireMessagingModule,
    NzDatePickerModule,
    NzCalendarModule,
    NgxMaskModule.forRoot(),
    NgbModule,
    NzAutocompleteModule,
    NzDropDownModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    ImageCropperModule,
    NzInputNumberModule,

    // NgxMaskDirective,
    // NgxMaskPipe,
  ],
})
export class EmployeeOnboardingModule {}
