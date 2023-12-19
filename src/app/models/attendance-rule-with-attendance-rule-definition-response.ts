import { AttendanceRuleDefinitionResponse } from "./attendance-rule-definition-response";
import { AttendanceRuleResponse } from "./attendance-rule-response";

export class AttendanceRuleWithAttendanceRuleDefinitionResponse {
    // id : number = 0;
	// name : string = '';
	// description : string = '';
    // customRuleHeader : string = '';
	// halfDayRuleHeader : string = '';
	// fullDayRuleHeader : string = '';
	// ruleSubHeader : string = '';

    attendanceRuleResponse = new AttendanceRuleResponse();
    attendanceRuleDefinitionResponseList : AttendanceRuleDefinitionResponse[] = [];
}
