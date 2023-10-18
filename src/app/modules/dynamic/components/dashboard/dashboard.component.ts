import { Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private router : Router) { }

  

  ngOnInit(): void {
    this.checkAccessToken();
  }
  

  checkAccessToken(){
    const loginDetails = localStorage.getItem('loginData');
    if (!loginDetails) {
      this.router.navigate(['/dynamic/login']);
    }
  }
}