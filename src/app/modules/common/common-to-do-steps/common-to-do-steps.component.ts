import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-common-to-do-steps',
  templateUrl: './common-to-do-steps.component.html',
  styleUrls: ['./common-to-do-steps.component.css']
})
export class CommonToDoStepsComponent implements OnInit {

  constructor(private dataService :DataService, private router : Router, private helperService:HelperService) { 

    this.isToDoStepsCompletedData();
  }

  getToDoStepViaSubject() {
    this.helperService.todoStepsSubject.subscribe(
      (res)=>{
        if(res ){
          this.getStepsData();
          this.getOrganizationRegistratonProcessStepData();
          // this.getOrganizationInitialToDoStepBar();
        }
      }
    )
  }

  isToDoStepsCompletedFlag: number = 0;
  isToDoStepsCompletedData() {
    debugger
    this.dataService.isToDoStepsCompleted().subscribe(
      (response) => {
        this.isToDoStepsCompletedFlag = response.object;

        if(this.isToDoStepsCompletedFlag == 0) {
          this.getToDoStepViaSubject();
        }else {
          this.getOrganizationInitialToDoStepBar();
          // this.router.navigate(['/dashboard']);
        }
        console.log("success");
        
      },
      (error) => {
        console.log('error');
      }
    );
  }
  

  ngOnInit(): void {
    this.getStepsData();
    this.getOrganizationInitialToDoStepBar();
    this.getOrganizationRegistratonProcessStepData();
  }



  hideOrganizationInitialToDoStepBar() {
    debugger
    this.dataService.hideOrganizationInitialToDoStepBar().subscribe(
      (response) => {
        console.log("success");  
        this.getOrganizationInitialToDoStepBar();
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


  isShowToDoSteps: boolean = false;

  showToDoSteps() {
    debugger
    if(this.isShowToDoSteps == true) {
      this.isShowToDoSteps = false;
    }else if(this.isShowToDoSteps == false) {
      this.isShowToDoSteps = true;
    }
  }
  hideToDoSteps() {
    this.isShowToDoSteps = false;
  }

  
}