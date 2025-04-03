import { Component, OnInit } from '@angular/core';
import { s } from '@fullcalendar/core/internal-common';
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


  VALUE_TYPE_PERCENTAGE = 1;
  VALUE_TYPE_FLAT=2;
  CALCULATION_BASED_CTC=3;
  CALCULATION_BASED_BASIC=4;
  EPF_ACTUAL = 1;
  EPF_RESTRICTED= 2;
  ESI_MAX_LIMIT=21000;
  toggle:boolean =false;
  currentPage = 1;
  itemPerPage = 10;
  totalItems = 0;
  isNewTemplate:boolean=false;
  saveLoader:boolean=false;
  negativeValue:boolean=false;
  negativeMonthlyCTC:number=0;
  esiAmount:number=0;

  constructor(private _salaryTemplateService : SalaryTemplateService,
    public _helperService : HelperService
  ) { }

  ngOnInit(): void {
    this.getSalaryTemplates();
   
  }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE COMPONENT                                                                                // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 

  // templateComponents: OrganizationTemplateComponent = new OrganizationTemplateComponent();
  templateComponents: SalaryTemplate = new SalaryTemplate();
  tempTemplateComponents: SalaryTemplate = new SalaryTemplate();

  loader:boolean=false;
  shimmer:boolean=false;
  getTemplateComponents() {
    this.loader = true;
    // this.shimmer = true;
    this._salaryTemplateService.getTemplateComponents().subscribe(
      (response) => {
        if (response.status) {
          this.templateComponents = response.object;
          if (this.templateComponents == null) {
            this.templateComponents = new SalaryTemplate();
          } else {
            this.tempTemplateComponents = JSON.parse( JSON.stringify(this.templateComponents));

            if (!this.isNewTemplate) {
              this.templateComponents.earningComponents = this.templateComponents.earningComponents.filter(tempComponent => {
                  return !this.salaryTemplate.earningComponents.some(salaryComponent => salaryComponent.name == tempComponent.name);
              });
              this.templateComponents.reimbursementComponents = this.templateComponents.reimbursementComponents.filter(tempComponent => {
                return !this.salaryTemplate.reimbursementComponents.some(salaryComponent => salaryComponent.type ==  tempComponent.type);
            });          
          } else {
              const basicComponent = this.templateComponents.earningComponents.find(component => component.name === 'Basic');
              const fixedAllowanceComponent = this.templateComponents.earningComponents.find(component => component.name === 'Fixed Allowance');
          
              if (basicComponent) {
                  this.salaryTemplate.earningComponents.push({ ...basicComponent });
              }
          
              if (fixedAllowanceComponent) {
                  this.salaryTemplate.earningComponents.push({ ...fixedAllowanceComponent });
              }
          
              this.templateComponents.earningComponents = this.templateComponents.earningComponents.filter(
                  component => component.name !== 'Basic' && component.name !== 'Fixed Allowance'
              );
              
          }
          
          }
          this.CalculateMonthlyAmountNew();
        } else {
          this.templateComponents = new SalaryTemplate();
        }

        // this.shimmer = false;
        this.loader = false;
      },
      (error) => {
        this.loader = false;
        // this.shimmer = false;
        this.templateComponents = new SalaryTemplate();
      }

      
    );
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE                                                                                 // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
salaryTemplate:SalaryTemplate = new SalaryTemplate();

createTemplate(){
  this.toggle=true;
  this.isNewTemplate = true;
  this.getTemplateComponents();

}

editSalaryTemplate(template:SalaryTemplate){
  this.toggle=true;
  this.isNewTemplate = false;
  this.salaryTemplate = JSON.parse(JSON.stringify(template));
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
  }
  this.CalculateMonthlyAmountNew();
}


count:number=0;
totalEpfAmount:number=0;
totalEsiAmount:number=0;
CalculateMonthlyAmountNew1() {
  this.count =0;
  this.calculatedAmount = this.benefitsCalculatedAmount
  this.totalEpfAmount =0;
  this.totalEsiAmount =0;
  this.findEarning();
}

CalculateMonthlyAmountNew() {
  this.count =0;
  this.calculatedAmount = 0;
  this.totalEpfAmount =0;
  this.totalEsiAmount =0;
  this.findEarning();
}


findEarning(){
  console.log("========A=====================")
  var currentMonthlyCTC = Math.round(this.salaryTemplate.annualCtc/12);
  this.salaryTemplate.earningComponents.forEach(component=>{

    if(component.valueTypeId == this.VALUE_TYPE_PERCENTAGE){ //percentage
      if(component.calculationBasedId == this.CALCULATION_BASED_CTC){ // ctc
        component.amount = (component.value/100) * currentMonthlyCTC; 

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
    component.amount = Math.round( component.amount);

    if(component.name != 'Fixed Allowance'){
      this.calculatedAmount += component.amount;
      
    }

    if(component.epfIncluded){
      this.totalEpfAmount += component.amount;
    }
    if(component.esiIncludded){
      this.totalEsiAmount += component.amount;
    }
    ++this.count;    
});


if(this.count== this.salaryTemplate.earningComponents.length){
  this.findReimbursement();
}

}


findReimbursement(){
  console.log("==============B===============")
  this.salaryTemplate.reimbursementComponents.forEach(component=>{
    if(!component.isAdd){
      component.isAdd = true;
      component.amount = component.value;
    }
    this.calculatedAmount += component.amount;
    ++this.count; 
  });
  if(this.count== this.salaryTemplate.earningComponents.length + this.salaryTemplate.reimbursementComponents.length){
    this.findBenefits(false);
  }
}

calculatedAmount:number=0;
findFixedAllowance(){
  const fixedAllowance = this.salaryTemplate.earningComponents.find(x=> x.name == 'Fixed Allowance')
  if(fixedAllowance){
    console.log("========this.calculatedAmount=====================",this.calculatedAmount)
    fixedAllowance.amount =  Math.round(this.salaryTemplate.annualCtc/12) - this.calculatedAmount;
    if(fixedAllowance.amount<0){
      this.negativeMonthlyCTC =fixedAllowance.amount;
    }else{
      this.negativeMonthlyCTC=0;
    }
  }
}



fixedAllowanceAmount :number=0;
benefitsCalculatedAmount :number=0;
findBenefits(flag?:boolean){
  console.log("========1=====================",flag)
   this.fixedAllowanceAmount = 0;
   this.benefitsCalculatedAmount = 0;

  const fixedAllowance = this.salaryTemplate.earningComponents.find(x=> x.name == 'Fixed Allowance')
  if(fixedAllowance){
    this.fixedAllowanceAmount = fixedAllowance.amount;
  }

  const ESI = this.salaryTemplate.deductions.find(x=> x.name == 'ESI')
  if(ESI){
    if(this.totalEsiAmount<=ESI.maxLimit){
      ESI.amount = Math.round((this.totalEsiAmount * ESI.employerContribution)/100);
    }else{
      ESI.amount=0;
    }
    this.benefitsCalculatedAmount += ESI.amount;
  }

  const EPF = this.salaryTemplate.deductions.find(x=> x.name == 'EPF')
  if(EPF){
    if(EPF.employerContribution == this.EPF_ACTUAL){
      EPF.amount = Math.round((this.totalEpfAmount*12)/100);
    }else if(EPF.employerContribution == this.EPF_RESTRICTED){
      if(this.totalEpfAmount> 15000){
        EPF.amount = Math.round((15000*12)/100);
      }else{
        EPF.amount = Math.round((this.totalEpfAmount*12)/100);
      }
    }else{
      EPF.amount=0;
    } 
    this.benefitsCalculatedAmount += EPF.amount;
  }

  if(flag){
    console.log("========2=====================")
    var tempFixedAmount = this.fixedAllowanceAmount -this.benefitsCalculatedAmount;
    if(fixedAllowance){
      console.log("========2.1=====================",tempFixedAmount)
      fixedAllowance.amount = tempFixedAmount;
      console.log("==========fixedAllowance.amount=============",fixedAllowance)
      // this.calculatedAmount = this.calculatedAmount +this.benefitsCalculatedAmount
      this.CalculateMonthlyAmountNew1();
    }
  }else{
    // this.calculatedAmount = this.calculatedAmount +this.benefitsCalculatedAmount
    console.log("========3=====================")
    this.findFixedAllowance();
  }
  
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE LIST                                                                              // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
salaryTemplateList:SalaryTemplate[] = new Array();

getSalaryTemplates() {
  this.shimmer=true;
  this._salaryTemplateService.getSalaryTemplates(this.currentPage, this.itemPerPage).subscribe(
    (response) => {
      if (response.status) {
        this.salaryTemplateList = response.object.content;
        this.totalItems = response.object.totalElements;
        this.shimmer=false;
      } else {
        this.salaryTemplateList = new Array();
        this.totalItems = 0;
        this.shimmer=false;

      }
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
    this.getSalaryTemplates();

  }
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
  console.log(this.salaryTemplate)
}


epfEmployerContribution: number=0; 

// calculateEpfContribution(): void {
//   let basicSalary = this.calculateBasic();
  
//   this.epfEmployerContribution = this.salaryTemplate.deductions.epfConfiguration.employerContribution == this.EPF_ACTUAL
//     ? (basicSalary * 0.12)
//     : (15000 * 0.12);

// }




// esiContriution:number=0;
// calculateEsiContribution(annualCtc: number): number {
//   let monthlyCtc = annualCtc / 12;

//   if (monthlyCtc <= this.ESI_MAX_LIMIT) {
//     let esiWage = this.salaryTemplate.earningComponents
//       .map((comp, i) => ({ comp }))
//       .filter(item =>  item.comp.displayName !== 'HRA') 
//       .reduce((sum, item) => {
//         let value = 0;
//         if (item.comp.valueTypeId === this.VALUE_TYPE_PERCENTAGE) {
//           if (item.comp.name == 'Basic') {
//             value = this.calculateBasic(); 
//             value = this.calculatePercentageBasedOnType(item.comp.value,item.comp);
//           }
//         } else if (item.comp.valueTypeId == this.VALUE_TYPE_FLAT) {
//           value = item.comp.value;
//         }
//         return sum + value;
//       }, 0);
//     let fixedAllowance = this.calculateFixed() / 12;
//     esiWage += fixedAllowance;
//     this.esiContriution = Math.floor((esiWage * 3.25) / 100);
//     return this.esiContriution;
//   }

//   return 0;
// }














    
}

