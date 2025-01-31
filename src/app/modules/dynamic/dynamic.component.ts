import { Component, OnInit } from '@angular/core';
import { NavigationEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';


@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.css']
})
export class DynamicComponent implements OnInit {

  readonly key = Key;
  _router : any;
  constructor(private router: Router,
    public _helperService:HelperService,
    private dataService : DataService,
    public roleBasedAccessControlService:RoleBasedAccessControlService, public onboardingService: OnboardingService, public helperService: HelperService){
    this._router = router;
    console.log(this.roleBasedAccessControlService.isUserInfoInitialized,"-------", this.onboardingService.isLoadingOnboardingStatus, "------",this.helperService.orgStepId);

    
  }

  ngOnInit(): void {
    this.isToDoStepsCompletedData();
    this.getOrganizationInitialToDoStepBar();
  }

  
  isToDoStepsCompleted : number = 1;
  isToDoStepsCompletedData() {
    debugger
    this.dataService.isToDoStepsCompleted().subscribe(
      (response) => {
        this.isToDoStepsCompleted = response.object;
        // console.log("isToDoStepsCompleted", this.isToDoStepsCompleted);
        
      },
      (error) => {
        // console.log('error');
      }
    );
  }


  isToDoStep: boolean = false;
  getOrganizationInitialToDoStepBar() {
    debugger;
    this.dataService.getOrganizationInitialToDoStepBar().subscribe(
      (response) => {
      
        this.isToDoStep = response.object;
        // console.log("######### todo step" , this.isToDoStep, "***********", this._helperService.isDashboardActive);
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }
}