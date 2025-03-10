import { Component, OnInit } from '@angular/core';
import { EarningComponent } from 'src/app/payroll-models/EarrningComponent';
import { PriorPayrollComponent } from '../prior-payroll/prior-payroll.component';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxSlabService } from 'src/app/services/tax-slab.service';
import { ea } from '@fullcalendar/core/internal-common';
import { PayrollTodoStep } from 'src/app/payroll-models/PayrollTodoStep';


@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {

  VALUE_TYPE_PERCENTAGE=1;
  VALUE_TYPE_FLAT=2;
  CALCULATION_BASED_CTC=3;
  CALCULATION_BASED_BASIC=4;
  PAY_TYPE_FIXED=5;
  PAY_TYPE_VARIABLE=6;
  CONSIDER_EPF=5;
  CONSIDER_ESI=6;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  isUserShimer: boolean = true;
  moved:boolean =true;

  constructor(
    private _payrollConfigurationService:PayrollConfigurationService,
    private activateRoute :  ActivatedRoute,
    private router : Router,
    private taxSlabService: TaxSlabService
  ) { 
    if (this.activateRoute.snapshot.queryParamMap.has('tab')) {
      this.currentTab = this.activateRoute.snapshot.queryParamMap.get('tab');
    }
    
  }

  ngOnInit(): void {
    this.getEarningComponent();
    
  }

  showSubComponent:boolean =false;

  earningComponent:EarningComponent[] = new Array();
    getEarningComponent(){
      this.isUserShimer = true;

        this._payrollConfigurationService.getEarningComponents().subscribe(
          (response) => {
            if(response.status){
              this.earningComponent= response.object;
            }
            this.isUserShimer = false;
          },
          (error) => {
            this.isUserShimer = false;
          }
        );
      }

      

      getEarningStatus(earning: EarningComponent, configId: number): string {
        return earning.configurations?.some(config => config.configurationId === configId) ? 'Yes' : 'No';
    }
    
    getEarningClass(earning: EarningComponent, configId: number): string {
        return earning.configurations?.some(config => config.configurationId === configId) ? 'text-success' : 'text-danger';
    }

    checkStatus(earning: EarningComponent): boolean {
      return earning.statusId === StatusKeys.ACTIVE ? true : false;
    }
    

    componentPageChange(page: number): void {
      this.currentPage = page;
      this.getEarningComponent();
    }

    currentTab: any= 'salary';
    earningId: any;
    editEarning(id :  number){
      this.moved=false;
      this.earningId=id;
      this.sendEditDetails(id.toString());
      }



     sendEditDetails(sendId: string) {
      const filteredEarningComponent = this.earningComponent.find(er => String(er.id) === sendId);
        if (filteredEarningComponent) {
          this.taxSlabService.editEarning(filteredEarningComponent);
      } 
    }
}
