import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollTodoStep } from 'src/app/payroll-models/PayrollTodoStep';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';
@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {


  constructor(private _payrollConfigurationService :PayrollConfigurationService,
    private activateRoute: ActivatedRoute,
    private router: Router
  ) {

    if (this.activateRoute.snapshot.queryParamMap.has('tab')) {
      this.currentTab = String(this.activateRoute.snapshot.queryParamMap.get('tab'));
    }
  }

  ngOnInit(): void {
    this.getTodoList();
  }

  currentTab: string= 'profile';
  route(tabName: string) {
    this.router.navigate(['/payroll/configuration'], {
      queryParams: { tab: tabName },
    });
    this.currentTab=tabName;
  }

  toDoStepList:PayrollTodoStep[]=new Array();
   getTodoList() {

      this._payrollConfigurationService.getTodoList().subscribe(
        (response) => {
          if(response.status){
            this.toDoStepList = response.object;
            this.checkAllCompleted();

          }
        },
        (error) => {
  
        }
      );
    }
    checkAllCompleted(): boolean {
      return this.toDoStepList.every(step => step.completed);
    }


}


  

