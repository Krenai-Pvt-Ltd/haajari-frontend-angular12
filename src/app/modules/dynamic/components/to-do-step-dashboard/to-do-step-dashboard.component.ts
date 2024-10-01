import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-to-do-step-dashboard',
  templateUrl: './to-do-step-dashboard.component.html',
  styleUrls: ['./to-do-step-dashboard.component.css'],
})
export class ToDoStepDashboardComponent implements OnInit {


  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.isOrgOnboarTodayData();
    this.getOrganizationRegistratonProcessStepData();
    this.getStepsData();
    this.getOrganizationInitialToDoStepBar();
  }

  showToDoStep: boolean = true;
  showToDoStepModal: boolean = false;
  showToDoStepTab: boolean = false;

  hideToDoStep() {
    this.showToDoStep = false;
    this.showToDoStepTab = true;
   
  }

  organizationRegistrationProcessResponse: any;
  getOrganizationRegistratonProcessStepData() {
    debugger
    this.dataService.getOrganizationRegistratonProcessStepStatus().subscribe(
      (response) => {
        this.organizationRegistrationProcessResponse = response.listOfObject;
        console.log("success");
        
      },
      (error) => {
        console.log('error');
      }
    );
  }

  // routeToStep(route : string) {
  //   this.router.navigate([route]);
  // }
 
  routeToStep(route: string, name: string) {
    this.router.navigate([route], { queryParams: { name } });
  }

  stepsData: any;
  getStepsData() {
    debugger
    this.dataService.getStepsData().subscribe(
      (response) => {
        this.stepsData = response.listOfObject[0];
        console.log("success");
        
      },
      (error) => {
        console.log('error');
      }
    );
  }

  getProgressPercentage(): number {
    if (this.stepsData.totalSteps === 0) {
      return 0; 
    }
    return (this.stepsData.totalCompletedSteps / this.stepsData.totalSteps) * 100;
  }

  hideOrganizationInitialToDoStepBar() {
    debugger
    this.dataService.hideOrganizationInitialToDoStepBar().subscribe(
      (response) => {
        console.log("success");  
        this.getOrganizationInitialToDoStepBar();
        location.reload();
      },
      (error) => {
        console.log('error');
      }
    );
  }

  isToDoStep: boolean = false;
  getOrganizationInitialToDoStepBar() {
    debugger
    this.dataService.getOrganizationInitialToDoStepBar().subscribe(
      (response) => {
        this.isToDoStep = response.object;
        console.log("success");  
      },
      (error) => {
        console.log('error');
      }
    );
  }

  isToDoStepsCompleted: number = 0;
  isToDoStepsCompletedData(isOrgOnboardToday:number) {
    debugger
    this.dataService.isToDoStepsCompleted().subscribe(
      (response) => {
        this.isToDoStepsCompleted = response.object;

        if(this.isToDoStepsCompleted == 0 && isOrgOnboardToday == 1) {
          this.router.navigate(['/to-do-step-dashboard']);
        }else {
          this.router.navigate(['/dashboard']);
        }
        console.log("isToDoStepsCompletedFlag :", this.isToDoStepsCompleted);
        
      },
      (error) => {
        console.log('error');
      }
    );
  }


  isOrgOnboardToday: number = 0;
  isOrgOnboarTodayData() {
    debugger
    this.dataService.isOrgOnboarToday().subscribe(
      (response) => {
        this.isOrgOnboardToday = response.object;

        this.isToDoStepsCompletedData(this.isOrgOnboardToday);
        console.log("isToDoStepsCompletedFlag :", this.isToDoStepsCompleted);
        
      },
      (error) => {
        console.log('error');
      }
    );
  }

  
  
  
}
