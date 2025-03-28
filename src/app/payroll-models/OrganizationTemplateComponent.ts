import { EarningComponentTemplate } from "../payroll-models copy/OrganizationTemplateComponent";
import { EmployeeProvidentFund } from "./EmployeeProvidentFund";
import { EmployeeStateInsurance } from "./EmployeeStateInsurance";
import { ReimbursementComponent } from "./ReimbursementComponent";

export class OrganizationTemplateComponent{

    earningComponents:EarningComponentTemplate []=new Array();
    reimbursementComponents:ReimbursementComponent[]= new Array();
    deductions:TemplateDeductionResponse[]= new Array();
    
}




export class TemplateDeductionResponse{
    esiConfiguration!:EmployeeProvidentFund;
    epfConfiguration!:EmployeeStateInsurance;
}