import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { LoggedInUser } from 'src/app/models/logged-in-user';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router : Router, private helperService : HelperService ) { }

  ngOnInit(): void {
    this.getLoggedInUserDetails();
  }

  // name : string = this.getLoginDetailsName()!.toUpperCase();
  // role : string = this.getLoginDetailsRole();

  
  loggedInUser : LoggedInUser = new LoggedInUser();

  getLoggedInUserDetails(){
    this.loggedInUser = this.helperService.getDecodedValueFromToken();
  }


  getFirstAndLastLetterFromName(name: string): string {
    let words = name.split(' ');

    if (words.length >= 2) {
        let firstLetter = words[0].charAt(0);
        let lastLetter = words[words.length - 1].charAt(0);
        return firstLetter + lastLetter;
    } else {
        return "";
    }
  }



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
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
