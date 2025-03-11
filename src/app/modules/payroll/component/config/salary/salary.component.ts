import { Component, OnInit } from '@angular/core';
import { ComponentConfiguration, EarningComponent } from 'src/app/payroll-models/EarrningComponent';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { ActivatedRoute } from '@angular/router';
import { TaxSlabService } from 'src/app/services/tax-slab.service';
import { HelperService } from 'src/app/services/helper.service';


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

  readonly EARNING_COMPONENT =1;
  readonly BENEFIT_COMPONENT =2;
  readonly DEDUCTION_COMPONENT =3;

  currentPage = 1;
  itemPerPage = 10;
  totalItems = 0;

  shimmer: boolean = false;
  toggle:boolean =false;

  constructor(
    private _payrollConfigurationService:PayrollConfigurationService,
    private activateRoute :  ActivatedRoute,
    private taxSlabService: TaxSlabService,
    public _helperService : HelperService
  ) { 
    // if (this.activateRoute.snapshot.queryParamMap.has('tab')) {
    //   this.currentTab = this.activateRoute.snapshot.queryParamMap.get('tab');
    // }
    
  }

  ngOnInit(): void {
    this.getEarningComponent();
    
  }

  showSubComponent:boolean =false;
  earningComponents:EarningComponent[] = new Array();
    getEarningComponent(){
      this.shimmer = true;
      this.earningComponents = [];
        this._payrollConfigurationService.getEarningComponents().subscribe((response) => {
            if(response.status){
              this.earningComponents= response.object;
              this.totalItems = response.totalItems;

              if(this.earningComponents==null){
                this.earningComponents= new Array();
                this.totalItems = 0;
              }
            }else{
              this.earningComponents= new Array();
              this.totalItems = 0;
            }
            this.shimmer = false;
          },
          (error) => {
            this.shimmer = false;
          }
        );
      }

      
    getEarningStatus(configurations: ComponentConfiguration[], configId: number): string {
        return configurations.some(config => config.configurationId === configId) ? 'Yes' : 'No';
    }
    
    getEarningClass(configurations: ComponentConfiguration[], configId: number): string {
        return configurations.some(config => config.configurationId === configId) ? 'text-success' : 'text-danger';
    }
    

    checkStatus(statusId: number): boolean {
      return statusId == StatusKeys.ACTIVE ? true : false;
    }
    

    pageChange(page: number): void {
      if(this.currentPage!= page){
        this.currentPage = page;
        this.getEarningComponent();
      }
    }


    selectedEarningComponent:EarningComponent = new EarningComponent();
    selectedTab:number=0;
    editEarning(earningComponent : EarningComponent){
      this.toggle=true;
      this.selectedEarningComponent= JSON.parse(JSON.stringify(earningComponent)) ;
      this.selectedTab = this.EARNING_COMPONENT;
    }


    selectedPfWage = "12% of Actual PF Wage"; // Default selected value

    employer = [
      { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
      { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
    ];
    employee = [
      { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
      { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
    ];
}
