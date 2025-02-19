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
    ExitModalComponent
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
    ReactiveFormsModule
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
    ExitModalComponent
  ],
})
export class SharedModule { }
