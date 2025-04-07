import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

constructor(private _salaryTemplateService : SalaryTemplateService,
public _helperService : HelperService) {
  this.searchSubject.pipe(debounceTime(250))
    .subscribe(searchText => {
        this.searchByInput(searchText);
    });
}

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
  this._salaryTemplateService.getSalaryTemplates(this.currentPage, this.itemPerPage,this.search).subscribe((response) => {
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
        const shouldKeep = !this.salaryTemplate.earningComponents.some(salaryComponent => salaryComponent.name === tempComponent.name);
        if (shouldKeep) tempComponent.isAdd = true;  
        return shouldKeep;
      });
  
      this.templateComponents.reimbursementComponents = this.templateComponents.reimbursementComponents.filter(tempComponent => {
        const shouldKeep = !this.salaryTemplate.reimbursementComponents.some(salaryComponent => salaryComponent.type === tempComponent.type);
        if (shouldKeep) tempComponent.isAdd = true;  
        return shouldKeep;
      });
  
      this.templateComponents.deductions = this.templateComponents.deductions.filter(tempComponent => {
        const shouldKeep = !this.salaryTemplate.deductions.some(salaryComponent => salaryComponent.name === tempComponent.name);
        if (shouldKeep) tempComponent.isAdd = true;  
        return shouldKeep;
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
  this.shimmer=true;
  if(isNew){
    this.isNewTemplate = true;
  }else{
    this.isNewTemplate = false;
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
  this.previewCalculations = true;
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


calculatedAmountWithoutFixed:number=0;
totalEarningAmount: number=0;
totalReimbursementAmount : number=0;
CalculateMonthlyAmountNew() {
  this.totalEarningAmount = 0;
  this.totalReimbursementAmount = 0;
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
      this.totalEarningAmount += component.amount;
      
    }    
    ++count;    
  });


  if(count== this.salaryTemplate.earningComponents.length){
    this.salaryTemplate.reimbursementComponents.forEach(component=>{
      if(!component.isAdd){
        component.isAdd = true;
        component.amount = component.value;
      }
      this.totalReimbursementAmount += component.amount;
      ++count; 
  });

  if(count== this.salaryTemplate.earningComponents.length + this.salaryTemplate.reimbursementComponents.length){
    this.calculatedAmountWithoutFixed = this.totalEarningAmount + this.totalReimbursementAmount;
    this.calculateSalaryComponents();
  }
}

}


mapFinalValue(result : CalculationResult){
  var hasEPF = this.salaryTemplate.deductions.find(x => x.name === 'EPF');
  if(hasEPF){
    hasEPF.amount = Math.round(result.epf);
  }
  var hasESI = this.salaryTemplate.deductions.find(x => x.name === 'ESI');
  if(hasESI){
    hasESI.amount = Math.round(result.esi);
  }

  var fixedAllowance = this.salaryTemplate.earningComponents.find(x => x.name === 'Fixed Allowance');
  if(fixedAllowance){
    fixedAllowance.amount =  Math.round(result.fixed);;
    if(fixedAllowance.amount < 0){
      this.previewCalculations = true;
        this.negativeMonthlyCTC = fixedAllowance.amount;
    }else{
      this.previewCalculations = false;
      this.negativeMonthlyCTC = 0;
    }
  }

}


// Constants for rates and thresholds
EPF_RATE = 0.12; // 12% Employer contribution for EPF
ESI_RATE = 0.0325; // 3.25% Employer contribution for ESI
EPF_RESTRICTED_VALUE = 15000; // Max value for EPF calculation
ESI_THRESHOLD = 21000; // Threshold above which ESI becomes 0


// Main calculation function
calculateSalaryComponents(){
  // Step 1: Calculate monthly CTC from annual CTC
  const monthlyCTC = Math.round(this.salaryTemplate.annualCtc / 12);

  // Step 2: Check if EPF and ESI are available in deductions
  const hasEPF = this.salaryTemplate.deductions.some(x => x.name === 'EPF');
  const hasESI = this.salaryTemplate.deductions.some(x => x.name === 'ESI');

  // Step 3: Define helper functions for EPF and ESI calculations
  const getEPF = (fixed: number): number => this.calculateEPF(fixed, hasEPF);
  const getESI = (fixed: number): number => this.calculateESI(fixed, hasESI);

  // Step 4: Calculate Fixed Allowance iteratively
  const fixed = this.calculateFixed(monthlyCTC, getEPF, getESI);

  // Step 5: Calculate final EPF and ESI with the computed Fixed value
  const epf = getEPF(fixed);
  const esi = getESI(fixed);
  console.log("=============fixed=========",fixed, "==========epf=========",epf,"===============esi=============",esi)
  // Step 6: Return the result with rounded values
  var result : CalculationResult = {
    fixed,
    epf: Number(epf.toFixed(2)),
    esi: Number(esi.toFixed(2))
  }
  this.mapFinalValue(result);
}

// Helper function to calculate EPF
private calculateEPF(fixed: number, hasEPF: boolean, ): number {
  if (!hasEPF) return 0; // No EPF if not available

  const EPF = this.salaryTemplate.deductions.find(x => x.name === 'EPF');
  // Calculate base amount for EPF (excluding Fixed Allowance)
  const epfBaseWithoutFA = this.salaryTemplate.earningComponents
    .filter(c => c.epfIncluded && c.name !== 'Fixed Allowance')
    .reduce((sum, c) => sum + c.amount, 0);

  // Add Fixed to the base
  const epfBase = epfBaseWithoutFA + fixed;

  // Determine the value to use for EPF calculation
  let applicableValue: number;
   // Apply restriction: use 15,000 if base exceeds it, otherwise use actual value
  if (EPF?.employerContribution == this.EPF_RESTRICTED) {
    // Restricted case: cap at 15,000 if base exceeds it
    applicableValue = epfBase >= this.EPF_RESTRICTED_VALUE ? this.EPF_RESTRICTED_VALUE : epfBase;
  } else {
    // Unrestricted case: use the actual sum regardless of value
    applicableValue = epfBase;
  }
  // Calculate EPF contribution
  return this.EPF_RATE * applicableValue;
}

// Helper function to calculate ESI
private calculateESI(fixed: number, hasESI: boolean): number {
  if (!hasESI) return 0; // No ESI if not available

  // Calculate base amount for ESI (excluding Fixed Allowance)
  const esiBaseWithoutFA = this.salaryTemplate.earningComponents
    .filter(c => c.esiIncluded && c.name !== 'Fixed Allowance')
    .reduce((sum, c) => sum + c.amount, 0);

  // Add Fixed to the base
  const esiBase = esiBaseWithoutFA + fixed;

  // Apply threshold: if base > 21,000, ESI is 0; otherwise calculate normally
  return esiBase > this.ESI_THRESHOLD ? 0 : this.ESI_RATE * esiBase;
}

// Helper function to calculate Fixed Allowance iteratively
private calculateFixed(monthlyCTC: number,
  getEPF: (fixed: number) => number,
  getESI: (fixed: number) => number
): number {
  let fixed = 0; // Initial guess for Fixed Allowance
  let epf = 0;   // EPF contribution
  let esi = 0;   // ESI contribution

  // Precomputed sum of all components except Fixed (e.g., Basic, HRA, etc.)
  const constants = this.calculatedAmountWithoutFixed;

  // Iteratively refine Fixed value (since EPF and ESI depend on it)
  for (let i = 0; i < 10; i++) {
    epf = getEPF(fixed); // Calculate EPF with current Fixed
    esi = getESI(fixed); // Calculate ESI with current Fixed
    fixed = monthlyCTC - (constants + epf + esi); // Update Fixed based on equation
  }

  // Return Fixed rounded
  return Number(fixed.toFixed(2));
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                      STATUS UPDATE                                                                           // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


loadingMap: { [key: number]: boolean } = {};
load(templateId:number){
 return !!this.loadingMap[templateId];
}

@ViewChild("statusChange")statusChange!:ElementRef;
@ViewChild("statusChangeCloseButton")statusChangeCloseButton!:ElementRef;
templateId: number = 0;
type:string='';
loading:boolean=false;
changeStatus(templateId:number){
  this.templateId = templateId;
  this.loadingMap[templateId] = true;
  this.statusChange.nativeElement.click();
}

checkStatus(statusId: number): boolean {
  return statusId == StatusKeys.ACTIVE ? true : false;
}

closeModal(){
  this.loadingMap[this.templateId] = false;
}

statusToggle:boolean=false;
chnageTemplateStatus() {
 this.statusToggle = true;
 this._salaryTemplateService.chnageTemplateStatus(this.templateId).subscribe(
   (response) => {
     if (response.status) {
       this._helperService.showToast('Status updated successfully.', Key.TOAST_STATUS_SUCCESS);
       this.toggleStatus(this.templateId);
     } else {
       this._helperService.showToast('Error updating component.', Key.TOAST_STATUS_ERROR);
     }
     this.statusToggle = false;
     this.statusChangeCloseButton.nativeElement.click();
     this.loadingMap[this.templateId] = false;
   },
   (error) => {
     this.statusToggle = false;
   }
 );
}

toggleStatus(templateId: number) {
  const template = this.salaryTemplateList.find(t => t.id === templateId); 

  if (template) {
    template.statusId = template.statusId === StatusKeys.ACTIVE ? StatusKeys.INACTIVE : StatusKeys.ACTIVE;
  }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                      SEARCH TEMPLATE                                                                          // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


private searchSubject = new Subject<boolean>();
searchDebounce(event:any){
  this.searchSubject.next(event)
}

searchByInput(event: any) {
  const inp = String.fromCharCode(event.keyCode || event.which);
  if (event.type === 'paste') {
    const pastedText = event.clipboardData.getData('text');
    if (/^[a-zA-Z\s]{3,}$/.test(pastedText)) {
      this.currentPage = 1;
      this.getOrganizationSalaryTemplates();
    }
    return;
  }
  if (/^[a-zA-Z]$/.test(inp)) {
    if (this.search.length >= 2) {
      this.currentPage = 1;
      this.getOrganizationSalaryTemplates();
    }
  } 
  else if (event.code === 'Backspace' && event.target.value.length >= 3) {
    this.currentPage = 1;
    this.getOrganizationSalaryTemplates();
  } 
  else if (this.search.length === 0) {
    this.currentPage = 1;
    this.search = '';
    this.getOrganizationSalaryTemplates();
  }
}

       
 






}

// Interface for the result
interface CalculationResult {
  fixed: number; // Fixed Allowance amount
  epf: number;   // EPF contribution
  esi: number;   // ESI contribution
}


