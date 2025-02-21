import { LeaveTemplateCategoryResponse } from "./leave-template-category-response";

export class LeaveTemplateResponse {
    id : number = 0;
    name : string = '';
    startDate : string = '';
    endDate : string = '';
    leaveTemplateCategoryResponseList : LeaveTemplateCategoryResponse[] = [];
    userUuidList : string[] = [];
}


