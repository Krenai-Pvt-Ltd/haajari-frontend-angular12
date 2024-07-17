import { DeductionRuleDefinitionRequest } from "./deduction-rule-definition-request";
import { OvertimeRuleDefinitionRequest } from "./overtime-rule-definition-request";

export class AttendanceRuleDefinitionRequest {

    id : number = 0;
    attendanceRuleId : number = 0;
    attendanceRuleTypeId : number = 0;
    
    deductionRuleDefinitionRequest : DeductionRuleDefinitionRequest = new DeductionRuleDefinitionRequest();
    overtimeRuleDefinitionRequest : OvertimeRuleDefinitionRequest = new OvertimeRuleDefinitionRequest();

    userUuids : string[] = [];
    
}
