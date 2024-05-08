export class FullLeaveSettingResponse {
  leaveSetting!: LeaveSettingResponse;
  leaveSettingCategories!: LeaveSettingCategoryResponse[];
  userLeaveRule!: UserLeaveSettingRule[];
  userUuids!: string[];
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
