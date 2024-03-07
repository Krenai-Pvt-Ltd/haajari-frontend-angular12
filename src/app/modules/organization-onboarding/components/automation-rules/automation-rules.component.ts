import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttendanceRuleResponse } from 'src/app/models/attendance-rule-response';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-automation-rules',
  templateUrl: './automation-rules.component.html',
  styleUrls: ['./automation-rules.component.css']
})
export class AutomationRulesComponent implements OnInit {

  constructor(private _location:Location,
    private dataService : DataService,
    private _router:Router) { }

  ngOnInit(): void {
    this.getAttendanceRuleByOrganizationMethodCall();
  }

  back(){
    this._location.back();
  }

  attendanceRuleResponseList : AttendanceRuleResponse[] = [];
  getAttendanceRuleByOrganizationMethodCall(){
    this.dataService.getAttendanceRuleByOrganization().subscribe((response) => {
      debugger
      this.attendanceRuleResponseList = response;
      // console.log(response);
    }, (error)=>{

      console.log(error);
    });
  }

  routeToCreate(id:any){
    this._router.navigate(["/organization-onboarding/creat-rule"], { queryParams: { rule: id } });
  }

}
