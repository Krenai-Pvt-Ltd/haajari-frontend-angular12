import { EarningComponentTemplate } from "../payroll-models copy/OrganizationTemplateComponent";
import { EmployeeProvidentFund } from "./EmployeeProvidentFund";
import { EmployeeStateInsurance } from "./EmployeeStateInsurance";
import { ReimbursementComponent } from "./ReimbursementComponent";

export class OrganizationTemplateComponent{
    id:number=0;
    earningComponents:EarningComponentTemplate []=new Array();
    reimbursementComponents:ReimbursementComponent[]= new Array();
    deductions:TemplateDeductionResponse= new TemplateDeductionResponse();
    
}




export class TemplateDeductionResponse{
    esiConfiguration!:EmployeeProvidentFund;
    epfConfiguration!:EmployeeStateInsurance;
}