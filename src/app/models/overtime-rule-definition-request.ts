export class OvertimeRuleDefinitionRequest {
    customDuration : string = '';
    halfDayDuration : string = '';
    fullDayDuration : string = '';

    customOvertimeTypeId : number = 0;
    halfDayOvertimeTypeId : number = 0;
    fullDayOvertimeTypeId : number = 0;

    customAmountInRupees : number = 0;
    halfDayAmountInRupees : number = 0;
    fullDayAmountInRupees : number = 0;

    attendanceRuleId : number = 0;
    userUuids : string[] = [];
}