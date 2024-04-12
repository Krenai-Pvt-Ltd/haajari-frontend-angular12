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

  attendanceRuleLoading:boolean = false;
  attendanceRuleResponseList : AttendanceRuleResponse[] = [];
  getAttendanceRuleByOrganizationMethodCall(){
    debugger
    this.attendanceRuleLoading = true;
    this.dataService.getAttendanceRuleByOrganization().subscribe((response) => {
      this.attendanceRuleLoading = false
      this.attendanceRuleResponseList = response;
    }, (error)=>{
      this.attendanceRuleLoading = false
      console.log(error);
    });
  }

  routeToCreate(id:any){
    this._router.navigate(["/organization-onboarding/creat-rule"], { queryParams: { rule: id } });
  }

}
