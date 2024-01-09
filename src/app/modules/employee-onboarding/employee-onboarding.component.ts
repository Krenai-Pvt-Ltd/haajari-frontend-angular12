import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-onboarding',
  templateUrl: './employee-onboarding.component.html',
  styleUrls: ['./employee-onboarding.component.css']
})
export class EmployeeOnboardingComponent implements OnInit {

  constructor(private router : Router) { 
  }
  isTrue: boolean=false;
  ngOnInit(): void {

  }
  showSidebar(){
    if(this.getBaseUrl(this.router.url) === '/employee-onboarding/employee-onboarding-preview'){
      this.isTrue=false;
    } else{
      this.isTrue=true;
    }
  }
  getBaseUrl(url: string): string {
    // Split the URL on '?' and take the first part
    const baseUrl = url.split('?')[0];
    return baseUrl;
  }

}
