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

    if(routeValue === "role"){
      routeValue = "Roles & Security";
    }

    if(routeValue.includes("team-detail")){
      routeValue = "Team Details";
    }

    if(routeValue.includes("employee-profile")){
      routeValue = "Employee Profile";
    }

    if(routeValue.includes("leave-setting")){
      routeValue = "Leave Setting";

    }
    if(routeValue.includes("attendance-setting")){
      routeValue = "Attendance Setting";
    }

    if(routeValue.includes("company-setting")){
      routeValue = "Company Setting";
    }

    if(routeValue.includes("selery-setting")){
      routeValue = "Salary Setting";
    }

    if(routeValue.includes("add-role?roleId")){
      routeValue = "Edit Role";
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
