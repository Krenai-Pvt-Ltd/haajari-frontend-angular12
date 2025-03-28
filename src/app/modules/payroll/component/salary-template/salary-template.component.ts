import { Component, OnInit } from '@angular/core';
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
  tempTemplateComponents: OrganizationTemplateComponent = new OrganizationTemplateComponent();
  loader:boolean=false;
  shimmer:boolean=true;
  getTemplateComponents(){
    this.loader = true;
    this.shimmer=true;
      this._salaryTemplateService.getTemplateComponents().subscribe((response) => {
          if(response.status){
            this.templateComponents= response.object;
            if(this.templateComponents==null){
              this.templateComponents= new OrganizationTemplateComponent();
            }else{
              this.tempTemplateComponents = JSON.parse(JSON.stringify(this.templateComponents));
            }
            this.showFlags = this.tempTemplateComponents.earningComponents.map(component => 
              component.name == "Basic" || component.name == "Fixed Allowance"
            );
          }else{
            this.templateComponents= new OrganizationTemplateComponent();
          }
          this.shimmer=false;
          this.loader = false;
        },
        (error) => {
          this.loader = false;
          this.shimmer=false;
          this.templateComponents= new OrganizationTemplateComponent();
        }
      );
    }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       SALARY TEMPLATE                                                                                 // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
salaryTemplate:SalaryTemplate = new SalaryTemplate();
    
showFlags: boolean[] = [];

calculatePercentage(value: number, annualCtc: number): number {
  if (!value || !annualCtc) return 0;
  return (value / 100) * annualCtc;
}
toggleShowFlag(index: number) {
  this.showFlags[index] = !this.showFlags[index];
}

checkShowFlag():boolean{
  return this.showFlags.every(flag => flag);
}

calculateFixed(): number {
  if (!this.tempTemplateComponents?.earningComponents) return 0;

  let totalOtherComponents = this.tempTemplateComponents.earningComponents
      .map((comp, i) => ({ comp, isVisible: this.showFlags[i] }))
      .filter(item => item.comp.displayName !== 'Fixed Allowance' && item.isVisible) 
      .reduce((sum, item) => {
          if (item.comp.valueTypeId === this.VALUE_TYPE_PERCENTAGE) {
              return sum + ((item.comp.value / 100) * this.salaryTemplate.annualCtc);
          } else if (item.comp.valueTypeId === this.VALUE_TYPE_FLAT) {
              return sum + (item.comp.value * 12); 
          }
          return sum;
      }, 0);

  return Math.max((this.salaryTemplate.annualCtc - totalOtherComponents), 0);
}




    
}

