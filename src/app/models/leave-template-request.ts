import { Key } from "../constant/key";
import { LeaveTemplateCategoryRequest } from "./leave-template-category-request";

export class LeaveTemplateRequest {
    id : number = 0;
    name : string = '';
    yearTypeName : string = '';
    startDate : string = '';
    endDate : string = '';
    leaveTemplateCategoryRequestList : LeaveTemplateCategoryRequest[] = [];
    // userUuidList : String[] = [];
    userIds : number[] = [];

    gender: string = 'All';
    employeeTypeId: number = 1;

}