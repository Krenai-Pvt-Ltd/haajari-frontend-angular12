import { EarningComponentTemplate } from "../payroll-models copy/OrganizationTemplateComponent";
import { EmployeeProvidentFund } from "./EmployeeProvidentFund";
import { EmployeeStateInsurance } from "./EmployeeStateInsurance";
import { EpfTemplate } from "./EpfTemplate";
import { ReimbursementComponent } from "./ReimbursementComponent";

export class SalaryTemplate{
    id:number=0;
    name:string='';
    updatedAt:Date=new Date();
    annualCtc:number=0;
    monthlyCtc:number=0;
    description:string=''
    // templateName:string='';
    statusId:number=0;
    earningComponents:EarningComponentTemplate []=new Array();
    reimbursementComponents:ReimbursementComponent[]= new Array();
    deductions:TemplateDeductionResponse[]= new Array();
    
    
}

export class TemplateDeductionResponse{

    id:number=0;
    name:string='';
    isCtcIncluded:number=0;
    employeeContribution:number=0;
    employerContribution:number=0;
    statusId:number=0;
    deductionFrequecncyId:number=0
    isProRate:number=0;
    condiserLop:number=0;
    description:string='';
    value:number=0;
    amount:number=0;
    isAdd:boolean=false;
    maxLimit:number=0;

}