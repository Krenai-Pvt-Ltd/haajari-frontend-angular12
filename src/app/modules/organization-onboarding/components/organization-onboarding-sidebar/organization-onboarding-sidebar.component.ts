import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-organization-onboarding-sidebar',
  templateUrl: './organization-onboarding-sidebar.component.html',
  styleUrls: ['./organization-onboarding-sidebar.component.css']
})
export class OrganizationOnboardingSidebarComponent implements OnInit {

  constructor(private dataService: DataService,
    private _onboardingService: OrganizationOnboardingService) { }

  ngOnInit(): void {
    this.getOnboardingStep();
  }

  getOnboardingStep(){
    this._onboardingService.getOrgOnboardingStep().subscribe((response:any)=>{
      if(response.status){
        this.dataService.markStepAsCompleted(response.object);
      }
      
    })

  }

  isStepCompleted(stepIndex: number): boolean {
    if(stepIndex<=this.dataService.stepIndex){
      return true;
    }else{
      return false;
    }

  }
}
