import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  constructor(public dataService: DataService, private router: Router) { }

  topbarValue: string | undefined;


  ngOnInit() {
    this.updateTopbarValue();

    this.router.events.subscribe(event => {
      this.updateTopbarValue();
    });
  }

  private updateTopbarValue() {
    const currentRoute = this.router.url;

    this.topbarValue = this.extractValueFromRoute(currentRoute);
  }

  private extractValueFromRoute(route: string): string {
    return route.substring(1);
  }

}
