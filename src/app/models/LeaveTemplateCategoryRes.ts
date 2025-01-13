export class LeaveTemplateCategoryRes{
  
    id!: number;
    leaveCategoryId!: number;
    leaveCycleId!: number;
    unusedLeaveActionId!: number;
    accrualTypeId!: number;
    leaveCount!: number;
    unusedLeaveActionCount!: number;

    leaveName!: string;
    unusedLeaveActionName!: string;
    leaveCycleName!: string;
    accrualTypeName!: string;
    reset!:boolean;
}