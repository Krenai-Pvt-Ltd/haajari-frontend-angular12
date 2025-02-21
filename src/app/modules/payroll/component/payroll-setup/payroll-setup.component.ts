import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payroll-setup',
  templateUrl: './payroll-setup.component.html',
  styleUrls: ['./payroll-setup.component.css']
})
export class PayrollSetupComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  toDoStepList = [
    {
      "id": 1,
      "name": "Organization Profile Setup",
      "description": "Set up your organization details and work locations for accurate payroll processing.",
      "isComplete": 0,
      "route": "/task-a",
      "active": 0
    },
    {
      "id": 2,
      "name": "Pay Schedule Configuration",
      "description": "Define payroll cycles, payment dates, and salary disbursement frequency.",
      "isComplete": 1,
      "route": "/task-b",
      "active": 0
    },
    {
      "id": 3,
      "name": "Statutory Compliance Setup",
      "description": "Enable and configure EPF, ESI, PT, LWF, and other legal deductions.",
      "isComplete": 0,
      "route": "/task-c",
      "active": 0
    },
    {
      "id": 4,
      "name": "Salary Components Management",
      "description": "Customize salary structures, allowances, and deductions as per company policy. ",
      "isComplete": 0,
      "route": "/task-d",
      "active": 0
    },
    {
      "id": 5,
      "name": "Taxes Configuration",
      "description": "Provide necessary tax details to ensure compliance with statutory regulations.",
      "isComplete": 0,
      "route": "/task-d",
      "active": 0
    },{
      "id": 6,
      "name": "Set Up Salary Template",
      "description": "Standardize payroll processing with predefined templates.",
      "isComplete": 0,
      "route": "/task-d",
      "active": 0
    },{
      "id": 7,
      "name": "Previous Payroll Import",
      "description": "Upload or configure prior payroll data for seamless payroll continuity.",
      "isComplete": 0,
      "route": "/task-d",
      "active": 0
    }
  ]
  ;
  

  activeStep(id:number){
    this.toDoStepList.forEach(step=>{
      step.active = 0;
    });
    var index = this.toDoStepList.findIndex(x=> x.id == id);
    if(index> -1){
      this.toDoStepList[index].active = 1;
    }
  }

}
