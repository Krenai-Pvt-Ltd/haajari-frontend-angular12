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
    let routeValue = this.extractValueFromRoute(this.router.url);

    if(routeValue === "timetable"){
      routeValue = "Attendance Details";
    }

    this.topbarValue = this.capitalizeFirstLetter(routeValue);
  }

  private extractValueFromRoute(route: string): string {
    return route.substring(1);
  }

  capitalizeFirstLetter(input: string): string {
    if (!input || input.length === 0) {
        return input;
    }

    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  

}
