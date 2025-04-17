export class LeaveTemplateCategoryRequest {
    id : number = 0;
    leaveCount : number = 0;
    leaveCycleId : number = 0;
    unusedLeaveActionId : number = 0;
    unusedLeaveActionCount : number = 0;
    sandwichLeave : boolean = false;

    accrualTypeId: number =0;
    reset : boolean = true;
    flexible: boolean = true;
    carryover:number=0;
    carryoverAction:string='';
    isReset: boolean = false;
}