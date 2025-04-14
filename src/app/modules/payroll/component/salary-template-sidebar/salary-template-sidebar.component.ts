import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { EarningComponentTemplate } from 'src/app/payroll-models copy/OrganizationTemplateComponent';
import { ReimbursementComponent } from 'src/app/payroll-models copy/ReimbursementComponent';
import { SalaryTemplate, TemplateDeductionResponse } from 'src/app/payroll-models/SalaryTemplate';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryTemplateService } from 'src/app/services/salary-template.service';

@Component({
  selector: 'app-salary-template-sidebar',
  templateUrl: './salary-template-sidebar.component.html',
  styleUrls: ['./salary-template-sidebar.component.css']
})
export class SalaryTemplateSidebarComponent implements OnInit {

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
  isSearching:boolean=false;
  readonly constant = constant;
  search:string='';

  previewCalculations:boolean=false;
  salaryTemplate:SalaryTemplate = new SalaryTemplate();


 constructor(private _salaryTemplateService : SalaryTemplateService,
   public _helperService : HelperService) {
    
   }
   
     ngOnInit(): void {
      
     }

@Input() templateComponents!: SalaryTemplate;    
@Input() loader:boolean=false;   

@Output() earningComponentToggled = new EventEmitter<EarningComponentTemplate>();
@Output() reimbursementComponentToggled =  new EventEmitter<ReimbursementComponent>();
@Output() deductionComponentToggled = new EventEmitter<TemplateDeductionResponse>();

toggleEarningComponent(component: EarningComponentTemplate) {
  this.earningComponentToggled.emit(component);
}

toggleReimbursementComponent(component: ReimbursementComponent) {
  this.reimbursementComponentToggled.emit(component);
}
  
toggleDeductionComponent(component: TemplateDeductionResponse){
  this.deductionComponentToggled.emit(component);
}
   
}
