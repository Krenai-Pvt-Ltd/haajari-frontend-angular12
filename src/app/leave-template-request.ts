import { LeaveTemplateCategoryRequest } from "./leave-template-category-request";

export class LeaveTemplateRequest {
    id : number = 0;
    name : string = '';
    startDate : string = '';
    endDate : string = '';
    leaveTemplateCategoryRequestList : LeaveTemplateCategoryRequest[] = [];
    userUuidList : String[] = [];
}


