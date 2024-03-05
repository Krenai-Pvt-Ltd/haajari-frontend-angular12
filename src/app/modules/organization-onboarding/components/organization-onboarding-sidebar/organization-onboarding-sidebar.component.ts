import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-organization-onboarding-sidebar',
  templateUrl: './organization-onboarding-sidebar.component.html',
  styleUrls: ['./organization-onboarding-sidebar.component.css']
})
export class OrganizationOnboardingSidebarComponent implements OnInit {

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  isStepCompleted(stepIndex: number): boolean {
    if(stepIndex<=this.dataService.stepIndex){
      return true;
    }else{
      return false;
    }

  }
}
