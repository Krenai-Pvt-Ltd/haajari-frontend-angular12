import { EarningComponentTemplate } from "../payroll-models copy/OrganizationTemplateComponent";
import { ReimbursementComponent } from "./ReimbursementComponent";

export class SalaryTemplate{
    id:number=0;
    annualCtc:number=0;
    description:string=''
    templateName:string='';
    earningComponents:EarningComponentTemplate []=new Array();
    reimbursementComponents:ReimbursementComponent[]= new Array();
    
}