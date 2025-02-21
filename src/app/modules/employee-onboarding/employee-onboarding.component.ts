import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-employee-onboarding',
  templateUrl: './employee-onboarding.component.html',
  styleUrls: ['./employee-onboarding.component.css']
})
export class EmployeeOnboardingComponent implements OnInit {

  constructor(private router : Router, public roleBasedAccessControlService: RoleBasedAccessControlService) {
  }
  isTrue: boolean=false;
  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token==null) {
      this.router.navigate(['/auth/login']);
    }
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
