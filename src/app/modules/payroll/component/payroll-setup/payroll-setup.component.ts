import { Component, OnInit } from '@angular/core';
import { PayrollTodoStep } from 'src/app/payroll-models/PayrollTodoStep';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';

@Component({
  selector: 'app-payroll-setup',
  templateUrl: './payroll-setup.component.html',
  styleUrls: ['./payroll-setup.component.css']
})
export class PayrollSetupComponent implements OnInit {

  constructor(private _payrollConfigurationService  : PayrollConfigurationService) { }

  ngOnInit(): void {
    this.getTodoList();
  }

  // toDoStepList = [
  //   {
  //     "id": 1,
  //     "name": "Organization Profile Setup",
  //     "description": "Set up your organization details and work locations for accurate payroll processing.",
  //     "isComplete": false,
  //     "route": "/task-a",
  //     "active": false
  //   },
  //   {
  //     "id": 2,
  //     "name": "Pay Schedule Configuration",
  //     "description": "Define payroll cycles, payment dates, and salary disbursement frequency.",
  //     "isComplete": true,
  //     "route": "/task-b",
  //     "active": false
  //   },
  //   {
  //     "id": 3,
  //     "name": "Statutory Compliance Setup",
  //     "description": "Enable and configure EPF, ESI, PT, LWF, and other legal deductions.",
  //     "isComplete": false,
  //     "route": "/task-c",
  //     "active": false
  //   },
  //   {
  //     "id": 4,
  //     "name": "Salary Components Management",
  //     "description": "Customize salary structures, allowances, and deductions as per company policy. ",
  //     "isComplete": false,
  //     "route": "/task-d",
  //     "active": false
  //   },
  //   {
  //     "id": 5,
  //     "name": "Taxes Configuration",
  //     "description": "Provide necessary tax details to ensure compliance with statutory regulations.",
  //     "isComplete": false,
  //     "route": "/task-d",
  //     "active": false
  //   },{
  //     "id": 6,
  //     "name": "Set Up Salary Template",
  //     "description": "Standardize payroll processing with predefined templates.",
  //     "isComplete": false,
  //     "route": "/task-d",
  //     "active": false
  //   },{
  //     "id": 7,
  //     "name": "Previous Payroll Import",
  //     "description": "Upload or configure prior payroll data for seamless payroll continuity.",
  //     "isComplete": false,
  //     "route": "/task-d",
  //     "active": false
  //   }
  // ]
  // ;
  

  activeStep(id:number){
    this.toDoStepList.forEach(step=>{
      step.isActive = false;
    });
    var index = this.toDoStepList.findIndex(x=> x.id == id);
    if(index> -1){
      this.toDoStepList[index].isActive = true;
    }
  }

  completedStep:number=0;
  toDoStepList:PayrollTodoStep[]=new Array();
   getTodoList() {

      this._payrollConfigurationService.getTodoList().subscribe(
        (response) => {
          if(response.status){
            this.toDoStepList = response.object;
            var firstIncomplete = this.toDoStepList.find(obj => !obj.completed);
            if (firstIncomplete) {
              firstIncomplete.isActive = true;
            }
            this.completedStep= this.toDoStepList.filter(obj => obj.completed).length;
          }
         
        },
        (error) => {
  
        }
      );
    }

}
