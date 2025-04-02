import { EmployeeProvidentFund } from "./EmployeeProvidentFund";
import { EmployeeStateInsurance } from "./EmployeeStateInsurance";
import { ReimbursementComponent } from "./ReimbursementComponent";

export class OrganizationTemplateComponent{

    earningComponents:EarningComponentTemplate[]=new Array();
    reimbursementComponents:ReimbursementComponent[]= new Array();
    deductions:TemplateDeductionResponse[]= new Array();
    
}


export class EarningComponentTemplate{
      id:number=0;;
      name:string='';
      displayName:string='';
      statusId:number=0;
      percentage:number=0;
      value:number=0;
      calculationBasedId:number=0;
      valueTypeId:number=0;
      payTypeId:number=0;
      canStatusChange:boolean=false;
      isCustom:boolean=false;
      isEsiIncludded:boolean=false;
      isEpfIncluded:boolean=false;
      amount:number=0;
}


export class TemplateDeductionResponse{
    esiConfiguration!:EmployeeProvidentFund;
    epfConfiguration!:EmployeeStateInsurance;
}