import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  readonly key = Key;
  _router : any;
  constructor(private router: Router, private dataService : DataService, public roleBasedAccessControlService: RoleBasedAccessControlService, public helperService : HelperService){
    this._router = router;
  }

  ngOnInit(): void {
    this.isToDoStepsCompletedData();
    this.getOrganizationInitialToDoStepBar();
  }

  isToDoStepsCompleted: number = 1;
  isToDoStepsCompletedData() {
    debugger
    this.dataService.isToDoStepsCompleted().subscribe(
      (response) => {
        this.isToDoStepsCompleted = response.object;
        // console.log("success");
        
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
        // console.log("######### todo step" , this.isToDoStep, "***********", this.helperService.isDashboardActive);
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }

}
