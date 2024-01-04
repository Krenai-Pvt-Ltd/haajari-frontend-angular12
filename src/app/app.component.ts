
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from './constant/key';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hajari';

  //showHeader: boolean = true;

  readonly key = Key;
  _router : any;
  constructor(private router: Router){
    this._router = router;
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
}


