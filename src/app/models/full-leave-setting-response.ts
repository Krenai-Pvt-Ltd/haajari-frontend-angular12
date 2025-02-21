import { LeaveTemplateCategoryRes } from "./LeaveTemplateCategoryRes";
import { LeaveTemplateRes } from "./LeaveTemplateRes";

export class FullLeaveSettingResponse {
  leaveSetting!: LeaveSettingResponse;
  leaveSettingCategories!: LeaveSettingCategoryResponse[];
  userLeaveRule!: UserLeaveSettingRule[];
  userUuids!: string[];

  leaveTemplate: LeaveTemplateRes = new LeaveTemplateRes();
  leaveTemplateCategories!: LeaveTemplateCategoryRes[];
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
  id!: number;
  leaveName!: string;
  leaveCount!: number;
  leaveRules!: string;
  carryForwardDays!: number;
  leaveSettingId!: number;
  accrualTypeId!: number;
  gender: string = 'All';
}

export class UserLeaveSettingRule {
  leaveSettingId!: number;
  userUuids!: string[];
}
