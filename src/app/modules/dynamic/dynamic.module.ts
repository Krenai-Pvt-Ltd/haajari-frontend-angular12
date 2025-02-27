import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeProfileComponent } from './components/employee-profile/employee-profile.component';
import { LiveManagerComponent } from './components/live-manager/live-manager.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { ProjectComponent } from './components/project/project.component';
import { ReportsComponent } from './components/reports/reports.component';
import { RoleComponent } from './components/role/role.component';
import { SupportComponent } from './components/support/support.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';
import { TeamDetailComponent } from './components/team-detail/team-detail.component';
import { TeamComponent } from './components/team/team.component';
import { TestingComponent } from './components/testing/testing.component';
import { TimetableComponent } from './components/timetable/timetable.component';
import { UserlistComponent } from './components/userlist/userlist.component';
import { WaitingPageComponent } from './components/waiting-page/waiting-page.component';
import { DateFormatPipe } from '../../pipe/date-format.pipe';
import { DurationFormatPipe } from '../../pipe/duration-format.pipe';
import { DynamicRoutingModule } from './dynamic-routing.module';
import { DynamicComponent } from './dynamic.component';
import { TimeFormatPipe } from '../../pipe/time-format.pipe';
import { SafePipe } from 'src/app/pipe/safe.pipe';
import { AppComponent } from 'src/app/app.component';
import { RoleAddComponent } from './components/role-add/role-add.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { EmployeeOnboardingDataComponent } from './components/employee-onboarding-data/employee-onboarding-data.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WebcamModule } from 'ngx-webcam';
import { AgmCoreModule } from '@agm/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { LeaveManagementComponent } from './components/leave-management/leave-management.component';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientJsonpModule } from '@angular/common/http';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MatDialogModule } from '@angular/material/dialog';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { AssetsComponent } from './components/assets/assets.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { CoinsComponent } from './components/coins/coins.component';
import { ToDoStepDashboardComponent } from './components/to-do-step-dashboard/to-do-step-dashboard.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ReferFriendComponent } from './components/refer-friend/refer-friend.component';
import { NewEmployeeProfileComponent } from './components/new-employee-profile/new-employee-profile.component';
import { CreateExpenseComponent } from './components/create-expense/create-expense.component';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { LeaveManagementsComponent } from './components/leave-managements/leave-managements.component';
import { InboxComponent } from './components/inbox/inbox.component';
import { AssetsManagementComponent } from './components/assets-management/assets-management.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { ExpenseManagementComponent } from './components/expense-management/expense-management.component';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

 @NgModule({
  declarations: [

    DynamicComponent,
    DashboardComponent,
    TimetableComponent,
    ProjectComponent,
    TaskManagerComponent,
    LiveManagerComponent,
    OnboardingComponent,
    UserlistComponent,
    DateFormatPipe,
    TimeFormatPipe,
    DurationFormatPipe,
    WaitingPageComponent,
    TeamComponent,
    TeamDetailComponent,
    RoleComponent,
    ReportsComponent,
    EmployeeProfileComponent,
    TestingComponent,
    PrivacyComponent,
    SupportComponent,
    SafePipe,
    RoleAddComponent,
    EmployeeOnboardingDataComponent,
    EmployeeProfileComponent,
    LeaveManagementComponent,
    AssetsComponent,
    CoinsComponent,
    ToDoStepDashboardComponent,
    SubscriptionComponent,
    ReferFriendComponent,
    NewEmployeeProfileComponent,
    CreateExpenseComponent,
    // ExistPolicyComponent,
    LeaveManagementsComponent,
    InboxComponent,
    AssetsManagementComponent,
    ExpenseManagementComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    InfiniteScrollModule,
    DynamicRoutingModule,
    ReactiveFormsModule,
    WebcamModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    NgxShimmerLoadingModule,
    NgbModule,
    FullCalendarModule,
    NzCalendarModule,
    AngularFireModule.initializeApp(environment.firebase, 'cloud'),
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireMessagingModule,
    SharedModule,
    NzDatePickerModule,
    NzCalendarModule,
    MatProgressSpinnerModule,
    NzSwitchModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB6SQE_TmOLpGLohpMLl-6FzdwJJAU9MnA',
      libraries: ['places'],
    }),
    GooglePlaceModule,
    DragDropModule,
    NgxChartsModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    NzSelectModule,
    ScrollingModule,
    DragDropModule,
    MatDialogModule,
    NzTimePickerModule,
    NzInputModule,
    NzInputNumberModule,
    NzUploadModule,
    NzToolTipModule,
    NzIconModule,
    NzButtonModule,
    NzPopoverModule,
    NzRadioModule,
    NzEmptyModule,
    NzAutocompleteModule,
    NzDrawerModule,
    NzProgressModule,
    NgApexchartsModule
  ],
  exports: [DurationFormatPipe],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    DataService,
    { provide: LOCALE_ID, useValue: 'en-US' },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DynamicModule {}
