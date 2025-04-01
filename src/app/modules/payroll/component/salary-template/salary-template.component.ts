import { Component, OnInit } from '@angular/core';
import { EarningComponentTemplate } from 'src/app/payroll-models copy/OrganizationTemplateComponent';
import { OrganizationTemplateComponent } from 'src/app/payroll-models/OrganizationTemplateComponent';
import { SalaryTemplate } from 'src/app/payroll-models/SalaryTemplate';
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
  EPF_ACTUAL = 1;
  EPF_RESTRICTED= 2;
  ESI_MAX_LIMIT=21000;
  toggle:boolean =false;
  currentPage = 1;
  itemPerPage = 10;
  totalItems = 0;
  isNewTemplate:boolean=false;
  saveLoader:boolean=true;
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
              // Remove components from templateComponents that are already in salaryTemplate
              this.templateComponents.earningComponents = this.templateComponents.earningComponents.filter(tempComponent => {
                  return !this.salaryTemplate.earningComponents.some(salaryComponent => salaryComponent.name === tempComponent.name);
              });
          
          } else {
              // Move 'Basic' and 'Fixed Allowance' from templateComponents to salaryTemplate if they exist
              const basicComponent = this.templateComponents.earningComponents.find(component => component.name === 'Basic');
              const fixedAllowanceComponent = this.templateComponents.earningComponents.find(component => component.name === 'Fixed Allowance');
          
              if (basicComponent) {
                  // Add a clone of the Basic component to salaryTemplate to avoid reference issues
                  this.salaryTemplate.earningComponents.push({ ...basicComponent });
              }
          
              if (fixedAllowanceComponent) {
                  // Add a clone of the Fixed Allowance component to salaryTemplate to avoid reference issues
                  this.salaryTemplate.earningComponents.push({ ...fixedAllowanceComponent });
              }
          
              // Remove 'Basic' and 'Fixed Allowance' from templateComponents to avoid duplication
              this.templateComponents.earningComponents = this.templateComponents.earningComponents.filter(
                  component => component.name !== 'Basic' && component.name !== 'Fixed Allowance'
              );
              
          }
          
          }
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
    

calculatePercentage(value: number, annualCtc: number): number {
  if (!value || !annualCtc) return 0;
  return (value / 100) * annualCtc;
}




calculateFixed(): number {
  if (!this.salaryTemplate.earningComponents) return 0;

  let totalOtherComponents = this.salaryTemplate.earningComponents
    .map((comp, i) => ({ comp }))
    .filter(item => item.comp.displayName !== 'Fixed Allowance')
    .reduce((sum, item) => {
      if (item.comp.valueTypeId === this.VALUE_TYPE_PERCENTAGE) {
        if(item.comp.name=='Basic'){
        return sum + this.calculateBasic();
        }else if(item.comp.name!='Basic'){
          return sum + this.calculatePercentageOfBasic(item.comp.value);
        }
      } else if (item.comp.valueTypeId === this.VALUE_TYPE_FLAT) {
        return sum + (item.comp.value * 12);
      }
      return sum;
    }, 0);
  if (this.salaryTemplate.reimbursementComponents) {
    totalOtherComponents += this.salaryTemplate.reimbursementComponents
      .map((comp, i) => ({ comp }))
      .reduce((sum, item) => sum + (item.comp.value * 12), 0);
  }
  return Math.max((this.salaryTemplate.annualCtc - totalOtherComponents), 0);
}



onInputChange(component: EarningComponentTemplate) {
  if (component.valueTypeId === this.VALUE_TYPE_PERCENTAGE) {
      component.value = this.calculatePercentage(component.value, this.salaryTemplate.annualCtc) / 12;
  } else if (component.displayName === 'Fixed Allowance') {
      component.value = this.calculateFixed() / 12;
  }

  
}

originalValues: { [key: number]: number } = {};

onReimbursementInput(index: number, event: any) {
  let inputValue = Number(event.target.value); 
  const maxValue = this.originalValues[index];

  if (inputValue > maxValue) {
    event.target.value = maxValue; 
    this.salaryTemplate.reimbursementComponents[index].value = maxValue;
  } else if (inputValue < 0 || isNaN(inputValue)) {
    event.target.value = 0;
    this.salaryTemplate.reimbursementComponents[index].value = 0;
  } else {
    this.salaryTemplate.reimbursementComponents[index].value = inputValue;
  }
}

epfEmployerContribution: number=0; 
calculateBasic(): number {
  const basicComponent = this.salaryTemplate.earningComponents.find(c => c.name == 'Basic');
  if (!basicComponent) {
    return 0;
  }
  let basicSalary = 0;
  if (basicComponent.valueTypeId == this.VALUE_TYPE_PERCENTAGE) {
    basicSalary = this.calculatePercentage(basicComponent.value, this.salaryTemplate.annualCtc);
  } else {
    basicSalary = basicComponent.value || 0;
  }

  return basicSalary;
}




calculateEpfContribution(): void {
  let basicSalary = this.calculateBasic();
  
  this.epfEmployerContribution = this.salaryTemplate.deductions.epfConfiguration.employerContribution == this.EPF_ACTUAL
    ? (basicSalary * 0.12)
    : (15000 * 0.12);

}

calculatePercentageOfBasic(componentValue:number):number{
  let basicSalary = this.calculateBasic();
  let monthlyValue = Math.floor((componentValue / 100) * basicSalary);
  return (monthlyValue);  
}



esiContriution:number=0;
calculateEsiContribution(annualCtc: number): number {
  let monthlyCtc = annualCtc / 12;

  if (monthlyCtc <= this.ESI_MAX_LIMIT) {
    let esiWage = this.salaryTemplate.earningComponents
      .map((comp, i) => ({ comp }))
      .filter(item =>  item.comp.displayName !== 'HRA') 
      .reduce((sum, item) => {
        let value = 0;
        if (item.comp.valueTypeId === this.VALUE_TYPE_PERCENTAGE) {
          if (item.comp.name == 'Basic') {
            value = this.calculateBasic(); 
            value = this.calculatePercentageOfBasic(item.comp.value);
          }
        } else if (item.comp.valueTypeId == this.VALUE_TYPE_FLAT) {
          value = item.comp.value;
        }
        return sum + value;
      }, 0);
    let fixedAllowance = this.calculateFixed() / 12;
    esiWage += fixedAllowance;
    this.esiContriution = Math.floor((esiWage * 3.25) / 100);
    return this.esiContriution;
  }

  return 0;
}


saveSalaryTemplate(){
  this.saveLoader = true;
  console.log(this.salaryTemplate)
}

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

// toggleEarningComponent(component: EarningComponentTemplate) {
//   const salaryIndex = this.salaryTemplate.earningComponents.indexOf(component);
//   const tempIndex = this.templateComponents.earningComponents.indexOf(component);

//   if (salaryIndex > -1) {
//       this.salaryTemplate.earningComponents.splice(salaryIndex, 1);
//       this.templateComponents.earningComponents.push(component);
//   } else if (tempIndex > -1) {
//       this.tempTemplateComponents.earningComponents.splice(tempIndex, 1);
//       this.salaryTemplate.earningComponents.push(component);
//   }
//   console.log(this.salaryTemplate);
// }

toggleEarningComponent(component: EarningComponentTemplate) {
  // Find the component in salaryTemplate by name
  const salaryIndex = this.salaryTemplate.earningComponents.findIndex(c => c.name === component.name);
  // Find the component in templateComponents by name
  const tempIndex = this.templateComponents.earningComponents.findIndex(c => c.name === component.name);

  if (salaryIndex > -1) {
      // Remove the component from salaryTemplate and push it back to templateComponents
      const removedComponent = this.salaryTemplate.earningComponents.splice(salaryIndex, 1)[0];
      this.templateComponents.earningComponents.push(removedComponent); // Move back to templateComponents
  } else if (tempIndex > -1) {
      // When adding back to salaryTemplate, use the fresh default value from tempTemplateComponents
      const freshComponent = this.tempTemplateComponents.earningComponents.find(c => c.name === component.name);

      if (freshComponent) {
          // Clone the fresh component and push to salaryTemplate
          this.salaryTemplate.earningComponents.push({ ...freshComponent }); // Avoid reference issues

          // Remove the component from templateComponents once added to salaryTemplate
          this.templateComponents.earningComponents = this.templateComponents.earningComponents.filter(c => c.name !== component.name);
      }
  }

}





CalculateMonthlyAmount(component: EarningComponentTemplate, annualCtc: number): number {
    if (!component.value || !annualCtc) return 0;

    if (component.name == 'Basic') {
      return (component.value / 100) * annualCtc;
    }
    const basicSalary = Math.floor(this.calculateBasic());  
    const monthlyValue = Math.floor((component.value / 100) * basicSalary);
    return monthlyValue; 
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE LIST                                                                              // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
salaryTemplateList:SalaryTemplate[] = new Array();

getSalaryTemplates() {
  this._salaryTemplateService.getSalaryTemplates(this.currentPage, this.itemPerPage).subscribe(
    (response) => {
      if (response.status) {
        this.salaryTemplateList = response.object.content;
        this.totalItems = response.object.totalElements;

      } else {
        this.salaryTemplateList = new Array();
        this.totalItems = 0;
      }
    },
    (error) => {
      this.salaryTemplateList = new Array();
      this.totalItems = 0;

    }
  );
}

pageChange(page: number){
  if(this.currentPage!= page){
    this.currentPage = page;
    this.getSalaryTemplates();

  }
}
















    
}

