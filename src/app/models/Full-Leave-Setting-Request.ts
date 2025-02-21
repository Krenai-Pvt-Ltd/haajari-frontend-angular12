export class FullLeaveSettingRequest {
  leaveSettingResponse: LeaveSettingResponse = new LeaveSettingResponse();
  leaveSettingCategoryResponse: LeaveSettingCategoryResponse[] = new Array();
  userUuids!: string[];
  userIds!: number[];
  // userLeaveRule: UserLeaveSettingRule = new UserLeaveSettingRule();
}

export class LeaveSettingResponse {
  id!: number;
  templateName!: string;
  leaveCycle!: string;
  accrualType!: string;
  sandwichRules!: string;
  sandwichCount?: number;
  yearlyCycleEnd!: Date;
  yearlyCycleStart!: Date;
  organizationId!: number;
  assignedMonthlyLimit!: number;
}

export class LeaveSettingCategoryResponse {
  leaveName!: string;
  leaveCount!: number;
  leaveRules!: string;
  carryForwardDays!: number;
  leaveSettingId!: number;
}

export class UserLeaveSettingRule {
  leaveSettingId!: number;
  userUuids!: string[];
}
