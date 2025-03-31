import { Component, OnInit } from '@angular/core';
import { EarningComponentTemplate } from 'src/app/payroll-models copy/OrganizationTemplateComponent';
import { OrganizationTemplateComponent } from 'src/app/payroll-models/OrganizationTemplateComponent';
import { SalaryTemplate } from 'src/app/payroll-models/SalaryTemplate';
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

  constructor(private _salaryTemplateService : SalaryTemplateService) { }

  ngOnInit(): void {
    this.getTemplateComponents();
   
  }



    templates = [
      {
        name: 'Internship',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      },
      {
        name: 'Fresher',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. ',
        status: false
      },
      {
        name: 'SDE 1',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      },
      {
        name: 'SDE 2',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      },
      {
        name: 'SDE 3',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: false
      },
      {
        name: 'Internship 2',
        date: '12th June, 2024',
        description: 'Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      },
      {
        name: 'Fresher 2',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      }
    ];
  
    toggleStatus(index: number) {
      this.templates[index].status = !this.templates[index].status;
    }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE COMPONENT                                                                                // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 

  templateComponents: OrganizationTemplateComponent = new OrganizationTemplateComponent();
  tempTemplateComponents: SalaryTemplate = new SalaryTemplate();
  sideViewComponents: OrganizationTemplateComponent = new OrganizationTemplateComponent();
  loader:boolean=false;
  shimmer:boolean=true;
  getTemplateComponents() {
    this.loader = true;
    this.shimmer = true;
    this._salaryTemplateService.getTemplateComponents().subscribe(
      (response) => {
        if (response.status) {
          this.templateComponents = response.object;
          if (this.templateComponents == null) {
            this.templateComponents = new OrganizationTemplateComponent();
          } else {
            this.tempTemplateComponents = JSON.parse(
              JSON.stringify(this.templateComponents)
            );
          }
          this.tempTemplateComponents.earningComponents.forEach((component, i) => {
            const key = `earning-${i}`;
            this.showFlags[key] = component.name === "Basic" || component.name === "Fixed Allowance";
          });

          this.tempTemplateComponents.reimbursementComponents.forEach((component, i) => {
            const key = `reimbursement-${i}`;
            this.showFlags[key] = false;
          });

          this.tempTemplateComponents.reimbursementComponents.forEach((component, index) => {
            this.originalValues[index] = component.value; 
          });
        } else {
          this.templateComponents = new OrganizationTemplateComponent();
        }

        this.shimmer = false;
        this.loader = false;
      },
      (error) => {
        this.loader = false;
        this.shimmer = false;
        this.templateComponents = new OrganizationTemplateComponent();
      }
    );
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE                                                                                 // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
salaryTemplate:SalaryTemplate = new SalaryTemplate();
    
showFlags: { [key: string]: boolean } = {};

calculatePercentage(value: number, annualCtc: number): number {
  if (!value || !annualCtc) return 0;
  return (value / 100) * annualCtc;
}
toggleShowFlag(category: string, index: number) {
  const key = `${category}-${index}`;
  this.showFlags[key] = !this.showFlags[key];
}



checkShowFlag(): boolean {
  return Object.values(this.showFlags).every(flag => flag);
}


calculateFixed(): number {
  if (!this.tempTemplateComponents?.earningComponents) return 0;

  let totalOtherComponents = this.tempTemplateComponents.earningComponents
    .map((comp, i) => ({ comp, isVisible: this.showFlags[`earning-${i}`] }))
    .filter(item => item.comp.displayName !== 'Fixed Allowance' && item.isVisible)
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

  if (this.tempTemplateComponents?.reimbursementComponents) {
    totalOtherComponents += this.tempTemplateComponents.reimbursementComponents
      .map((comp, i) => ({ comp, isVisible: this.showFlags[`reimbursement-${i}`] }))
      .filter(item => item.isVisible)
      .reduce((sum, item) => sum + (item.comp.value * 12), 0);
  }

  if (this.showFlags['deductions-1'] && this.epfEmployerContribution !== null) {
    totalOtherComponents += this.epfEmployerContribution;
  }
  if (this.showFlags['deductions-2'] && this.esiContriution !== null) {
    totalOtherComponents += this.esiContriution;
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
    this.tempTemplateComponents.reimbursementComponents[index].value = maxValue;
  } else if (inputValue < 0 || isNaN(inputValue)) {
    event.target.value = 0;
    this.tempTemplateComponents.reimbursementComponents[index].value = 0;
  } else {
    this.tempTemplateComponents.reimbursementComponents[index].value = inputValue;
  }
}

epfEmployerContribution: number=0; 
calculateBasic(): number {
  const basicComponent = this.tempTemplateComponents.earningComponents.find(c => c.name === 'Basic');

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

shouldShowReimbursements(): boolean {
  return this.tempTemplateComponents.reimbursementComponents?.length > 0 &&
         Object.keys(this.showFlags).some(key => key.startsWith('reimbursement-') && this.showFlags[key]);
}



calculateEpfContribution(): void {
  let basicSalary = this.calculateBasic();
  
  this.epfEmployerContribution = this.tempTemplateComponents.deductions.epfConfiguration.employerContribution == this.EPF_ACTUAL
    ? (basicSalary * 0.12)
    : (15000 * 0.12);

}

calculatePercentageOfBasic(componentValue:number):number{
  let basicSalary = Math.floor(this.calculateBasic()/12);
  let monthlyValue = Math.floor((componentValue / 100) * basicSalary);
  return Math.floor(monthlyValue);  
}



esiContriution:number=0;
calculateEsiContribution(annualCtc: number): number {
  let monthlyCtc = annualCtc / 12;

  if (monthlyCtc <= this.ESI_MAX_LIMIT) {
    let esiWage = this.tempTemplateComponents.earningComponents
      .map((comp, i) => ({ comp, isVisible: this.showFlags[`earning-${i}`] }))
      .filter(item => item.isVisible && item.comp.displayName !== 'HRA') 
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
  console.log(this.tempTemplateComponents)
}


















    
}

