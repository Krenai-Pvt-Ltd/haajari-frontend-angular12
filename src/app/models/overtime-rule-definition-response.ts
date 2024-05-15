import { OvertimeType } from "./overtime-type";

export class OvertimeRuleDefinitionResponse {
    customDuration : string = '';
    halfDayDuration : string = '';
    fullDayDuration : string = '';

    customOvertimeType : OvertimeType = new OvertimeType();
    halfDayOvertimeType : OvertimeType = new OvertimeType();
    fullDayOvertimeType : OvertimeType = new OvertimeType();

    customAmountInRupees : number = 0;
    halfDayAmountInRupees : number = 0;
    fullDayAmountInRupees : number = 0;

    attendanceRuleDefinitionId : number = 0;
}
