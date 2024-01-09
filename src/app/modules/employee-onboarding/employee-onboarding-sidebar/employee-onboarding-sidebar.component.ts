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

  }

  navigateTo(route: string, stepIndex: number): void {
    if(this.stepService.stepIndex<(stepIndex-1)){

    }else{
      let navExtra: NavigationExtras = {
        queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
      };
      this.router.navigate([route], navExtra);
    }

  }

  ind:number=-1;
  isStepCompleted(stepIndex: number): boolean {
    
    // for(var i=0;i<=6;i++){
    //   if(this.stepsCompletionStatus[i]==true){
    //     this.ind=i;
    //     break;
    //   }
    // }
    // for(var i=0;i<=this.ind;i++){
    //   this.stepsCompletionStatus[i]=true;
    // }
    // if((stepIndex)<=this.ind){
    //   return true;
    // }else{
    // return false;
    // }
    if(stepIndex<=this.stepService.stepIndex){
      return true;
    }else{
      return false;
    }
 
  }


  
}
