export class FullLeaveSettingResponse {
    leaveSetting!: LeaveSettingResponse;
    leaveSettingCategories!: LeaveSettingCategoryResponse[];
    userLeaveRule!: UserLeaveSettingRule[];
  }
  
  export class LeaveSettingResponse {
    // Define your LeaveSetting properties here
    id!: number;
    templateName!: string;
    leaveCycle!: string;
    accrualType!: string;
    sandwichRules!: string;
    sandwichCount?: number;
    yearlyCycleEnd!: Date;
    yearlyCycleStart!: Date;
    organizationId!: number; 
  }
  
  export class LeaveSettingCategoryResponse {
    // Define your LeaveSettingCategories properties here
    leaveName!: string;
    leaveCount!: number;
    leaveRules!: string;
    carryForwardDays!: number;
    leaveSettingId!: number;
  }
  
  export class UserLeaveSettingRule {
    // Define your UserLeaveRule properties here
    leaveSettingId!: number;
    userUuids!: string[];
  }
  