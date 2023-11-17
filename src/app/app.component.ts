
import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './modules/common/header/header.component';
import { Key } from './constant/key';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hajari';

  showHeader: boolean = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHeader = !this.shouldHideHeader(event.url);
    });
  }

  private shouldHideHeader(url: string): boolean {
    const urlsToHideHeader = [Key.LOGIN, Key.ONBOARDING];

    return urlsToHideHeader.includes(url);
  }
}


