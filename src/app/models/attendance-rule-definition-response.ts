import { DeductionRuleDefinitionResponse } from "./deduction-rule-definition-response";
import { OvertimeRuleDefinitionResponse } from "./overtime-rule-definition-response";

export class AttendanceRuleDefinitionResponse {

    id : number = 0;
    attendanceRuleId : number = 0;
    attendanceRuleTypeId : number = 0;
    
    deductionRuleDefinitionResponse : DeductionRuleDefinitionResponse = new DeductionRuleDefinitionResponse();
    overtimeRuleDefinitionResponse : OvertimeRuleDefinitionResponse = new OvertimeRuleDefinitionResponse();

    userUuids : string[] = [];
}
