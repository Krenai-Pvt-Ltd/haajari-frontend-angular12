import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './modules/common/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hajari';
  @ViewChild('header') header: any;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const showHeader = this.shouldShowHeader(event.url);
        this.header.visible = showHeader;
      }
    });
  }

  shouldShowHeader(url: string): boolean {
    return ['dynamic/login', '/signup'].indexOf(url) === -1;
  }
}
