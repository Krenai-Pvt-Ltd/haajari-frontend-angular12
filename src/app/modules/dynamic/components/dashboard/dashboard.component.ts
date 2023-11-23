import { Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private dataService : DataService, private router : Router) { }

  currentDayEmployeesData : any = [];

  ngOnInit(): void {
    // this.checkAccessToken();
    this.getCurrentDayEmployeesData();
    this.getTodaysLiveLeaveCount();
  }
  

  // checkAccessToken(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if (!loginDetails) {
  //     this.router.navigate(['/dynamic/login']);
  //   }
  // }


  getCurrentDayEmployeesData(){
    this.dataService.getTodayEmployeesData().subscribe((data) => {
      this.currentDayEmployeesData=data;
      console.log(this.currentDayEmployeesData);
    }, (error) => {
      console.log(error);
    })
  }

  leaveCount!: number;
  getTodaysLiveLeaveCount(){
  this.dataService.getTodaysLeaveCount().subscribe((data) => {
    this.leaveCount=data;
    console.log(this.leaveCount);
  }, (error) => {
    console.log(error);
  })
}

}