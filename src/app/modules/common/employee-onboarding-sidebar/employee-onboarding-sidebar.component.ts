import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-onboarding-sidebar',
  templateUrl: './employee-onboarding-sidebar.component.html',
  styleUrls: ['./employee-onboarding-sidebar.component.css']
})
export class EmployeeOnboardingSidebarComponent implements OnInit {

  stepsCompletionStatus: boolean[] = [];

  constructor(private router: Router, private stepService: DataService) { }

  ngOnInit(): void {
    this.stepService.stepsCompletionStatus$.subscribe(
      (status) => this.stepsCompletionStatus = status
    );
  }

  navigateTo(route: string, stepIndex: number): void {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate([route], navExtra);
  }


  isStepCompleted(stepIndex: number): boolean {
    return this.stepsCompletionStatus[stepIndex];
  }

  
}
