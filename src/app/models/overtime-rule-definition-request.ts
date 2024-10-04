export class OvertimeRuleDefinitionRequest {
    
    customDuration : string = '';
    halfDayDuration : string = '';
    fullDayDuration : string = '';

    customOvertimeTypeId : number = 0;
    halfDayOvertimeTypeId : number = 0;
    fullDayOvertimeTypeId : number = 0;

    customAmountInRupees : any;
    halfDayAmountInRupees : any;
    fullDayAmountInRupees : any;
}