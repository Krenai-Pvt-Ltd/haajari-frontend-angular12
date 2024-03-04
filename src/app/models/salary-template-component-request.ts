import { SalaryComponentRequest } from "./salary-component-request";

export class SalaryTemplateComponentRequest {

    id : number = 0;
    name : string = '';
    description : string = '';
    salaryComponentRequestList : SalaryComponentRequest[] = [];
    userUuids : string[] = [];
}
