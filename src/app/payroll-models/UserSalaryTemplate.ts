import { SalaryTemplate } from "./SalaryTemplate";

export class UserSalaryTemplate{
    id:number=0;
    effectiveDate:Date = new Date();
    isRevision:boolean=false;
    userUuid:string='b773b732-fb0f-11ef-af6d-784f4377a291';
    salaryTemplate:SalaryTemplate = new SalaryTemplate();
}