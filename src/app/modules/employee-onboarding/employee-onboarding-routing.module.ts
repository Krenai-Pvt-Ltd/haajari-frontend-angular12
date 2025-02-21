import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { EmployeeOnboardingComponent } from './employee-onboarding.component';
import { AcadmicComponent } from './acadmic/acadmic.component';
import { BankDetailsComponent } from './bank-details/bank-details.component';
import { EmergencyContactComponent } from './emergency-contact/emergency-contact.component';
import { EmployeeAddressDetailComponent } from './employee-address-detail/employee-address-detail.component';
import { EmployeeDocumentComponent } from './employee-document/employee-document.component';
import { EmployeeExperienceComponent } from './employee-experience/employee-experience.component';
import { EmployeeOnboardingFormComponent } from './employee-onboarding-form/employee-onboarding-form.component';
import { EmployeeOnboardingPreviewComponent } from './employee-onboarding-preview/employee-onboarding-preview.component';
import { EmployeeOnboardingSidebarComponent } from './employee-onboarding-sidebar/employee-onboarding-sidebar.component';
import { PreviewFormComponent } from './preview-form/preview-form.component';

const routes: Routes = [
  { path: '', component: EmployeeOnboardingComponent,
  children:[
    {path: 'employee-onboarding-form', component: EmployeeOnboardingFormComponent},
    {path: 'employee-onboarding-sidebar', component: EmployeeOnboardingSidebarComponent},
    {path: 'preview-form', component: PreviewFormComponent},
    {path: 'employee-address-detail', component: EmployeeAddressDetailComponent},
    {path: 'employee-document', component: EmployeeDocumentComponent},
    {path: 'acadmic', component: AcadmicComponent},
    {path: 'employee-experience', component: EmployeeExperienceComponent},
    {path: 'bank-details', component: BankDetailsComponent},
    {path: 'emergency-contact', component: EmergencyContactComponent},
    {path: 'employee-onboarding-preview', component: EmployeeOnboardingPreviewComponent},

    ]

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeOnboardingRoutingModule { }
