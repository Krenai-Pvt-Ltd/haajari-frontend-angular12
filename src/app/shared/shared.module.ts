import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HajiriPageLoaderComponent } from '../modules/common/hajiri-page-loader/hajiri-page-loader.component';
import { TopbarComponent } from '../modules/common/topbar/topbar.component';
import { NotifactionTostComponent } from '../modules/sharable/notifaction-toast/notifaction-toast.component';
import { CommonToDoStepsComponent } from '../modules/common/common-to-do-steps/common-to-do-steps.component';
import { MapComponent } from '../modules/common/map/map.component';
import { AgmCoreModule } from '@agm/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { FaqComponent } from '../modules/common/faq/faq.component';
import { FaqDetailComponent } from '../modules/common/faq-detail/faq-detail.component';
import { ChatComponent } from '../modules/common/chat/chat.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ExitModalComponent } from '../modules/common/exit-modal/exit-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssetRequestComponent } from '../modules/common/asset-request/asset-request.component';
import { ProfileUpdateComponent } from '../modules/common/profile-update/profile-update.component';
import { ExpenseRequestComponent } from '../modules/common/expense-request/expense-request.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { AttendanceUpdateComponent } from '../modules/common/attendance-update/attendance-update.component';
import { LeaveRequestComponent } from '../modules/common/leave-request/leave-request.component';

@NgModule({
  declarations: [
    CommonToDoStepsComponent,
    TopbarComponent,
    HajiriPageLoaderComponent,
    NotifactionTostComponent,
    MapComponent,
    FaqComponent,
    FaqDetailComponent,
    ChatComponent,
    ExitModalComponent,
    AssetRequestComponent,
    ProfileUpdateComponent,
    ExpenseRequestComponent,
    AttendanceUpdateComponent,
    LeaveRequestComponent
  ],

  imports: [CommonModule,
     NgbModule,
     NgbModalModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB6SQE_TmOLpGLohpMLl-6FzdwJJAU9MnA',
      libraries: ['places'],
    }),
    GooglePlaceModule,
    NzEmptyModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzAutocompleteModule,
    NzTimePickerModule,
    NzDatePickerModule,
    FormsModule
  ],
  exports: [
    TopbarComponent,
    HajiriPageLoaderComponent,
    NotifactionTostComponent,
    CommonToDoStepsComponent,
    MapComponent,
    FaqComponent,
    FaqDetailComponent,
    ChatComponent,
    ExitModalComponent,
    AssetRequestComponent,
    ProfileUpdateComponent,
    ExpenseRequestComponent,
    AttendanceUpdateComponent,
    LeaveRequestComponent

  ],
})
export class SharedModule { }
