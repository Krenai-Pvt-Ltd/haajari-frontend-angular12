import { Employeetype } from "./EmployeeType";
import { LeaveTemplateCategoryRes } from "./LeaveTemplateCategoryRes";

export class LeaveTemplateRes{
    id: number = 0;
    updatedDate!: any;
    startDate!: any;
    endDate!: any;
    templateName!: string;
    employeeTypeId!: number;
    gender!: string;
    totalEmployees!: number;
    leaveAppliedUserCount!: number;

    leaveTemplateCategoryRes: LeaveTemplateCategoryRes[] = [];
    
    employeeType: Employeetype = new Employeetype();
    name: string ='';
}