import { LeaveTemplateCategoryRes } from "./LeaveTemplateCategoryRes";

export class LeaveTemplateRes{
    id: number = 0;
    updatedDate!: any;
    startDate!: any;
    endDate!: any;
    templateName!: string;
    employeeTypeId!: number;
    gender!: string;

    leaveTemplateCategoryRes: LeaveTemplateCategoryRes[] = [];

}