import { Component, OnInit } from '@angular/core';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { EarningComponentTemplate } from 'src/app/payroll-models copy/OrganizationTemplateComponent';
import { ReimbursementComponent } from 'src/app/payroll-models copy/ReimbursementComponent';
import { SalaryTemplate, TemplateDeductionResponse } from 'src/app/payroll-models/SalaryTemplate';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryTemplateService } from 'src/app/services/salary-template.service';


@Component({
  selector: 'app-salary-template',
  templateUrl: './salary-template.component.html',
  styleUrls: ['./salary-template.component.css']
})
export class SalaryTemplateComponent implements OnInit {

/**
 * Component factor
 */
  VALUE_TYPE_PERCENTAGE = 1;
  VALUE_TYPE_FLAT=2;
  CALCULATION_BASED_CTC=3;
  CALCULATION_BASED_BASIC=4;
/**
 * Component factor
 */

  EPF_ACTUAL = 1;
  EPF_RESTRICTED= 2;
  ESI_MAX_LIMIT=21000;
  PF_RESTRICTED_LIMIT = 15000;
  toggle:boolean =false;
  currentPage = 1;
  itemPerPage = 10;
  totalItems = 0;
  isNewTemplate:boolean=false;
  saveLoader:boolean=false;
  negativeValue:boolean=false;
  negativeMonthlyCTC:number=0;
  esiAmount:number=0;
  shimmer:boolean=false;
  readonly constant = constant;

  previewCalculations:boolean=false;

  constructor(private _salaryTemplateService : SalaryTemplateService,
    public _helperService : HelperService) { }

  ngOnInit(): void {
    this.getOrganizationSalaryTemplates();
   
  }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE LIST                                                                              // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
salaryTemplateList:SalaryTemplate[] = new Array();
getOrganizationSalaryTemplates() {
  this.shimmer=true;
  this.salaryTemplateList = [];
  this._salaryTemplateService.getSalaryTemplates(this.currentPage, this.itemPerPage).subscribe((response) => {
      if (response.status) {
        this.salaryTemplateList = response.object.content;
        this.totalItems = response.object.totalElements;
        if(this.salaryTemplateList == null){
          this.salaryTemplateList = new Array();
          this.totalItems = 0;
        }
      } else {
        this.salaryTemplateList = new Array();
        this.totalItems = 0;
      }
      this.shimmer=false;
    },
    (error) => {
      this.salaryTemplateList = new Array();
      this.totalItems = 0;
      this.shimmer=false;
    }
  );
}

pageChange(page: number){
  if(this.currentPage!= page){
    this.currentPage = page;
    this.getOrganizationSalaryTemplates();
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE COMPONENT                                                                                // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  templateComponents: SalaryTemplate = new SalaryTemplate();
  tempTemplateComponents: SalaryTemplate = new SalaryTemplate();
  loader:boolean=false;
  getTemplateComponents() {
    this.loader = true;
    this._salaryTemplateService.getTemplateComponents().subscribe((response) => {
        if (response.status) {
          this.templateComponents = response.object;
          if (this.templateComponents == null) {
            this.templateComponents = new SalaryTemplate();
          } else {
            this.mapOnTemplate();
          }
        }else{
          this.templateComponents = new SalaryTemplate();
        }
        this.loader = false;
      },
      (error) => {
        this.loader = false;
        this.templateComponents = new SalaryTemplate();
      } 
    );
}


  mapOnTemplate(){
    this.tempTemplateComponents = JSON.parse(JSON.stringify(this.templateComponents));
    if (!this.isNewTemplate) {
      this.templateComponents.earningComponents = this.templateComponents.earningComponents.filter(tempComponent => {
          return !this.salaryTemplate.earningComponents.some(salaryComponent => salaryComponent.name == tempComponent.name);
      });
      this.templateComponents.reimbursementComponents = this.templateComponents.reimbursementComponents.filter(tempComponent => {
        return !this.salaryTemplate.reimbursementComponents.some(salaryComponent => salaryComponent.type ==  tempComponent.type);
      });  
      this.templateComponents.deductions = this.templateComponents.deductions.filter(tempComponent => {
        return !this.salaryTemplate.deductions.some(salaryComponent => salaryComponent.name ==  tempComponent.name);
      });  
             
    } else {
      const basicComponent = this.templateComponents.earningComponents.find(component => component.name === 'Basic');
      if (basicComponent) {
        this.salaryTemplate.earningComponents.push({ ...basicComponent });
      }      
      const fixedAllowanceComponent = this.templateComponents.earningComponents.find(component => component.name === 'Fixed Allowance');
      if (fixedAllowanceComponent) {
          this.salaryTemplate.earningComponents.push({ ...fixedAllowanceComponent });
      }
      this.templateComponents.earningComponents = this.templateComponents.earningComponents.filter(
          component => component.name !== 'Basic' && component.name !== 'Fixed Allowance'
      );
      
      this.CalculateMonthlyAmountNew();
    }

  }



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE                                                                                 // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
salaryTemplate:SalaryTemplate = new SalaryTemplate();
createTemplate(isNew:boolean, template?:SalaryTemplate){
  this.toggle=true;
  if(isNew){
    this.isNewTemplate = true;
  }else{
    this.isNewTemplate = false;
    this.previewCalculations = true;
    this.salaryTemplate = JSON.parse(JSON.stringify(template));
  }
  this.getTemplateComponents();
}


toggleEarningComponent(component: EarningComponentTemplate) {
  const salaryIndex = this.salaryTemplate.earningComponents.findIndex(c => c.name === component.name);
  const tempIndex = this.templateComponents.earningComponents.findIndex(c => c.name === component.name);

  if (salaryIndex > -1) {
      const removedComponent = this.salaryTemplate.earningComponents.splice(salaryIndex, 1)[0];
      this.templateComponents.earningComponents.push(removedComponent);
  } else if (tempIndex > -1) {
      const freshComponent = this.tempTemplateComponents.earningComponents.find(c => c.name === component.name);
      if (freshComponent) {
          this.salaryTemplate.earningComponents.push({ ...freshComponent });
          this.templateComponents.earningComponents = this.templateComponents.earningComponents.filter(c => c.name !== component.name);
      }
  }

  this.CalculateMonthlyAmountNew();
}

toggleReimbursementComponent(component: ReimbursementComponent) {
  const salaryIndex = this.salaryTemplate.reimbursementComponents.findIndex(c => c.type == component.type);
  const tempIndex = this.templateComponents.reimbursementComponents.findIndex(c => c.type == component.type);

  if (salaryIndex > -1) {
      const removedComponent = this.salaryTemplate.reimbursementComponents.splice(salaryIndex, 1)[0];
      this.templateComponents.reimbursementComponents.push(removedComponent);
  } else if (tempIndex > -1) {
      const freshComponent = this.tempTemplateComponents.reimbursementComponents.find(c => c.type == component.type);
      if (freshComponent) {
          this.salaryTemplate.reimbursementComponents.push({ ...freshComponent });
          this.templateComponents.reimbursementComponents = this.templateComponents.reimbursementComponents.filter(c => c.type !== component.type);
      }
  }

  this.CalculateMonthlyAmountNew();
}

toggleDeductionComponent(component: TemplateDeductionResponse) {
  const salaryIndex = this.salaryTemplate.deductions.findIndex(comp => comp.id == component.id);
  const tempIndex = this.templateComponents.deductions.findIndex(comp => comp.id == component.id);

  if (salaryIndex > -1) {
      const removedDeduction = this.salaryTemplate.deductions.splice(salaryIndex, 1)[0];
      this.templateComponents.deductions.push(removedDeduction);

  } 
  else if (tempIndex > -1) {
      const freshDeduction = this.tempTemplateComponents.deductions.find(comp => comp.id == component.id);
      if (freshDeduction) {
          this.salaryTemplate.deductions.push({ ...freshDeduction });
          this.templateComponents.deductions = this.templateComponents.deductions.filter(comp => comp.id !== component.id);
      }
      this.previewCalculations = true;
      console.log("=========this.previewCalculations===========",this.previewCalculations)
  }
}


calculatedAmountWithoutFixed:number=0;
calculatedAmount:number=0;
benefitsCalculatedAmount :number=0;
isFindBenefits:boolean=false;
holdFixedAllowanceAmount:number=0;
totalEpfAmount : number =0;
totalEsiAmount : number =0;
CalculateMonthlyAmountNew() {
  this.previewCalculations = false;
  this.calculatedAmountWithoutFixed = 0;
  this.findEarning();
}

findEarning(){
   var count =0;
   this.salaryTemplate.earningComponents.forEach(component=>{

    if(component.valueTypeId == this.VALUE_TYPE_PERCENTAGE){ //percentage

      if(component.calculationBasedId == this.CALCULATION_BASED_CTC){ // ctc
        component.amount = (component.value/100) * Math.round(this.salaryTemplate.annualCtc/12); 

      }else if(component.calculationBasedId == this.CALCULATION_BASED_BASIC){ //basic
        const basicAllowance = this.salaryTemplate.earningComponents[0];
        if(basicAllowance){
          component.amount = (component.value/100) * basicAllowance.amount; 
      }
     }
    }else if(component.valueTypeId == this.VALUE_TYPE_FLAT && !component.isAdd){
      component.isAdd = true;
      component.amount = component.value;
    }
    component.amount = Math.round(component.amount);

    if(component.name != 'Fixed Allowance'){
      this.calculatedAmountWithoutFixed += component.amount;
      
    }    
    ++count;    
  });


  if(count== this.salaryTemplate.earningComponents.length){
    this.salaryTemplate.reimbursementComponents.forEach(component=>{
      if(!component.isAdd){
        component.isAdd = true;
        component.amount = component.value;
      }
      this.calculatedAmountWithoutFixed += component.amount;
      ++count; 
  });

  if(count== this.salaryTemplate.earningComponents.length + this.salaryTemplate.reimbursementComponents.length){
    this.findFixedAllowance();
  }
}

}

findFixedAllowance(): void {
  const monthlyCTC = Math.round(this.salaryTemplate.annualCtc / 12);
  const fixedAllowance = this.salaryTemplate.earningComponents.find(x => x.name === 'Fixed Allowance');
  if (!fixedAllowance) return;
  console.log("=============previewCalculations=========",this.previewCalculations)
  if (this.previewCalculations) {
    const epfRate = 0.12;
    const esiRate = 0.0325;
    var combineRate=0;
    var epfBaseWithoutFA=0;
    var esiBaseWithoutFA=0;
    const EPF = this.salaryTemplate.deductions.find(x => x.name === 'EPF');
    const ESI = this.salaryTemplate.deductions.find(x => x.name === 'ESI');

    if(EPF){
      epfBaseWithoutFA = this.salaryTemplate.earningComponents
      .filter(c => c.epfIncluded && c.name !== 'Fixed Allowance')
      .reduce((sum, c) => sum + c.amount, 0);
      combineRate = combineRate + epfBaseWithoutFA;
    }
    if(ESI){
      esiBaseWithoutFA = this.salaryTemplate.earningComponents
      .filter(c => c.esiIncluded && c.name !== 'Fixed Allowance')
      .reduce((sum, c) => sum + c.amount, 0);
      combineRate = combineRate + esiBaseWithoutFA;
    }   
    const numerator = monthlyCTC - (this.calculatedAmountWithoutFixed + (epfRate * epfBaseWithoutFA) + (esiRate * esiBaseWithoutFA));
    const denominator = 1 + combineRate;

    fixedAllowance.amount = Math.round(numerator / denominator);

    this.totalEpfAmount =0;
    this.totalEsiAmount =0;
    // Update total EPF & ESI base if FA is included
    if (fixedAllowance.epfIncluded) {
      this.totalEpfAmount = epfBaseWithoutFA + fixedAllowance.amount;
    }else{
      this.totalEpfAmount = epfBaseWithoutFA;
    } 
      

    if (fixedAllowance.esiIncluded) {
      this.totalEsiAmount = esiBaseWithoutFA + fixedAllowance.amount;
    }else{
      this.totalEsiAmount = esiBaseWithoutFA;
    } 
      

    this.findBenefits();
  } else {
    // EPF/ESI not applied
    fixedAllowance.amount = monthlyCTC - this.calculatedAmountWithoutFixed;
      if(fixedAllowance.amount<0){
          this.negativeMonthlyCTC =fixedAllowance.amount;
      }else{
          this.negativeMonthlyCTC=0;
      }
  }
}




findBenefits(): void {
  this.benefitsCalculatedAmount = 0;
  console.log("=============EPF=========",this.totalEpfAmount)
  const EPF = this.salaryTemplate.deductions.find(x => x.name === 'EPF');
  if (EPF) {
    if (EPF.employerContribution === this.EPF_ACTUAL) {
      EPF.amount = Math.round((this.totalEpfAmount * 12) / 100);
    } else if (EPF.employerContribution === this.EPF_RESTRICTED) {
      if (this.totalEpfAmount > this.PF_RESTRICTED_LIMIT) {
        EPF.amount = Math.round((this.PF_RESTRICTED_LIMIT * 12) / 100);
      } else {
        EPF.amount = Math.round((this.totalEpfAmount * 12) / 100);
      }
    } else {
      EPF.amount = 0;
    }
  }
  console.log("=============without=========",this.totalEsiAmount)
  const ESI = this.salaryTemplate.deductions.find(x => x.name === 'ESI');
  if (ESI) {
    if (this.totalEsiAmount <= ESI.maxLimit) {
      ESI.amount = Math.round((this.totalEsiAmount * ESI.employerContribution) / 100);
    } else {
      ESI.amount = 0;
    }

  }

  this.previewCalculations = false;
}




isSystemCalculated(component: any): boolean {
  return component.name == 'Fixed Allowance'&& this.previewCalculations && this.salaryTemplate.deductions.length > 0;
}









/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE SAVE                                                                            // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


saveSalaryTemplate(){
  this.saveLoader = true;
  this._salaryTemplateService.saveSalaryTemplate(this.salaryTemplate).subscribe((response) => {
          if(response.status){
            this._helperService.showToast("Your Salary Template has been updated successfully.", Key.TOAST_STATUS_SUCCESS);
          }else{
            this._helperService.showToast("Error in saving Salary Template.", Key.TOAST_STATUS_ERROR);
          }
          this.saveLoader = false;
        },
        (error) => {
          this.saveLoader = false;
          this._helperService.showToast("Error in saving Salary Template.", Key.TOAST_STATUS_ERROR);
  
        }
      );
      this.getOrganizationSalaryTemplates();

}


epfEmployerContribution: number=0; 
    
}