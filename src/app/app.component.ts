import { Component, OnInit } from '@angular/core';
import { NavigationEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { Key } from './constant/key';
import { HelperService } from './services/helper.service';
import { RoleBasedAccessControlService } from './services/role-based-access-control.service';

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
    private _helperService: HelperService
  ) {

    this.router.events.subscribe((event:any) => {
      if (event instanceof RouteConfigLoadStart) {
        this._helperService.detectOpenModalOnBack();
      } 
      if(event instanceof NavigationEnd )
      { 
        window.scroll(0, 0);

        if( document.body?.classList){
        document.body?.classList?.remove("modal-open")
        document.body.style.overflow = 'scroll';
      }
    }
    })
    this._helperService.toastSubscription.subscribe((value) => {
      this.isShowToast = value;
    });
    this._router = router;
  }
  ngOnInit(): void {
    // this._helperService.showToast("Successfully generated.", "Success");
  }

  moduleResponseList: any[] = [];
  setModules(moduleResponseList: any) {
    this.moduleResponseList = this.moduleResponseList;
  }

  // constructor(private router: Router) {
  //   this.router.events.pipe(
  //     filter(event => event instanceof NavigationEnd)
  //   ).subscribe((event: any) => {
  //     this.showHeader = !this.shouldHideHeader(event.url);
  //   });
  // }
  // private shouldHideHeader(url: string): boolean {
  //   const urlsToHideHeader = [Key.LOGIN, Key.ONBOARDING, Key.SLACKAUTH];

  //   return urlsToHideHeader.includes(url);
  // }

  // isShowToDoSteps: boolean = false;

  // showToDoSteps() {
  //   this.isShowToDoSteps = true;
  // }
  // hideToDoSteps() {
  //   this.isShowToDoSteps = false;
  // }
}
