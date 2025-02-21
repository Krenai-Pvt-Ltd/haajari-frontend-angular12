import { Component, OnInit } from '@angular/core';
import { NavigationEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { Key } from './constant/key';
import { HelperService } from './services/helper.service';
import { RoleBasedAccessControlService } from './services/role-based-access-control.service';
import { OnboardingService } from './services/onboarding.service';
import { co } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'hajari';

  //showHeader: boolean = true;
  isShowToast: boolean = false;
  readonly key = Key;
  _router: any;
  constructor(
    private router: Router,
    public rbacService: RoleBasedAccessControlService,
    private _helperService: HelperService,
    public onboardingService : OnboardingService
  ) {

    this.router.events.subscribe((event:any) => {
      if (event instanceof RouteConfigLoadStart) {
        this._helperService.detectOpenModalOnBack();
      } 
      if(event instanceof NavigationEnd){
        window.scrollTo(0, 0);
      }
      if(event instanceof NavigationEnd &&  document.body?.classList){
        document.body?.classList?.remove("modal-open")
        document.body.style.overflow = 'scroll';
      }
    })
    this._helperService.toastSubscription.subscribe((value) => {
      this.isShowToast = value;
    });
    this._router = router;
  }
  ngOnInit(): void {
  }

  moduleResponseList: any[] = [];
  setModules(moduleResponseList: any) {
    this.moduleResponseList = this.moduleResponseList;
  }

  
}
