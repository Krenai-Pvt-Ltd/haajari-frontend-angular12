import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router : Router) { }

  ngOnInit(): void {
  }

  // name : string = this.getLoginDetailsName()!.toUpperCase();
  // role : string = this.getLoginDetailsRole();
  

  getLoginDetailsRole(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      return loginData.role;
    }
  }

  getLoginDetailsName(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      return loginData.name;
    }
  }

  onLogout(){
    localStorage.removeItem('loginData');
    localStorage.removeItem('managerFunc');
    localStorage.removeItem('orgId');
    this.router.navigate(['/dynamic/login']);
  }

  temp(){
    console.log("CLICKED")
    this.router.navigate(["/dynamic/timetable"])
  }
}
