import { Component, OnInit } from '@angular/core';
import { EarningComponent } from 'src/app/payroll-models/EarrningComponent';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryComponentService } from 'src/app/services/salary-component.service';
import { ComponentConfiguration } from 'src/app/payroll-models/ComponentConfiguration';


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

  constructor(private _salaryComponentService : SalaryComponentService,
    public _helperService : HelperService) { 
 
  }

  ngOnInit(): void {
    window.scroll(0,0);
    this.getOrganizationEarningComponent();
    
  }

  defaultEarningComponents:EarningComponent[] = new Array();
  getDefaultEarningComponent(){
      this._salaryComponentService.getDefaultEarningComponent().subscribe((response) => {
          if(response.status){
            this.defaultEarningComponents= response.object;
          }
        },
        (error) => {
        }
      );
    }

  showSubComponent:boolean =false;
  earningComponents:EarningComponent[] = new Array();
  getOrganizationEarningComponent(){
      this.shimmer = true;
      this.earningComponents = [];
        this._salaryComponentService.getOrganizationEarningComponent().subscribe((response) => {
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
            this.earningComponents= new Array();
            this.totalItems = 0;
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
    

    pageChange(page: number){
      if(this.currentPage!= page){
        this.currentPage = page;
        this.getOrganizationEarningComponent();
      }
    }

    viewSection(tab:number): boolean{
      if(tab== this.selectedTab){
        return true;
      }else{
        return false;
      }
    }

    selectedEarningComponent!:EarningComponent;
    selectedTab:number=0;
    editEarning(earningComponent : EarningComponent){
      this.toggle=true;
      this.selectedNewEarning = false;
      this.isNewComponent = false;
      this.selectedTab = this.EARNING_COMPONENT;
      this.selectedEarningComponent= JSON.parse(JSON.stringify(earningComponent)) ;
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


    isNewComponent:boolean=false;
    addComponent(component: number) {
      this.toggle = true;
      this.isNewComponent = true;
      switch (component) {
        case 1: {
          this.getDefaultEarningComponent();
          break;
        }
        case 2: {
          // this.getDefaultBenefitComponent();
          break;
        }
        case 3: {
          // this.getDefaultDeductionComponent();
          break;
        }
      }
    }



  selectedNewEarning:boolean=false;
  selectedEarningType:string='';
   selectDefaultEarningComponent(type:string){
    this.selectedNewEarning = true;
    const selectedComponent = this.defaultEarningComponents.find(x=> x.name == type)
    this.selectedEarningComponent = JSON.parse(JSON.stringify(selectedComponent));
   } 

   backFromEarning(){
    this.toggle = false;
    this.selectedEarningType = '';
    this.selectedNewEarning = false;
    this.isNewComponent = false;
   }

   saveLoader:boolean=false;
   saveEarningComponent(){
      this.saveLoader = true;
      this._salaryComponentService.saveOrganizationEarningComponent(this.selectedEarningComponent).subscribe((response) => {
          if(response.status){
          
          }else{
   
          }
          this.saveLoader = false;
        },
        (error) => {
          this.saveLoader = false;
        }
      );

   }
}
