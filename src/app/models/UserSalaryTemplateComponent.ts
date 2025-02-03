import { SalaryComponentResponse } from "./salary-component-response";
import { TaxExemptionValueRes } from "./TaxExemptionValueRes";

export class UserSalaryTemplateComponent{

    id:number=0;
	taxRegimeId:number=0;
	salaryComponentResponseList : SalaryComponentResponse[] = new Array();
	taxExemptionValueList : TaxExemptionValueRes [] = new Array();
}