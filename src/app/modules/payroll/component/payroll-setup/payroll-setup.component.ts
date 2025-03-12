import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PayrollTodoStep } from 'src/app/payroll-models/PayrollTodoStep';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';
import { TaxSlabService } from 'src/app/services/tax-slab.service';

@Component({
  selector: 'app-payroll-setup',
  templateUrl: './payroll-setup.component.html',
  styleUrls: ['./payroll-setup.component.css']
})
export class PayrollSetupComponent implements OnInit {

  constructor(private _payrollConfigurationService  : PayrollConfigurationService,
        private router: Router) { }

  ngOnInit(): void {
    window.scroll(0,0);
    this.getTodoList();
  }
  

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

    currentTab: any= 'profile';
    route(tabName: string) {
      this.router.navigate(['/payroll/configuration'], {
        queryParams: { tab: tabName },
      });
      this.currentTab=tabName;
    }
     


    getStepRoute(stepId: number): string {
      switch (stepId) {
          case 1: return 'profile';
          case 2: return 'pay-schedule';
          case 3: return 'statutory';
          case 4: return 'salary';
          case 5: return 'taxes';
          case 6: return 'profile';
          case 7: return 'prior-payroll';
          default: return 'profile';
      }
  }

}
