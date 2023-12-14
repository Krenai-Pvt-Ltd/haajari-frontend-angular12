import { AttendanceRuleDefinitionResponse } from "./attendance-rule-definition-response";

export class AttendanceRuleWithAttendanceRuleDefinitionResponse {
    id : number = 0;
	name : string = '';
	description : string = '';
    attendanceRuleDefinitionResponseList : AttendanceRuleDefinitionResponse[] = [];
}
