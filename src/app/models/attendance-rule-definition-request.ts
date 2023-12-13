import { CustomSalaryDeductionRequest } from "./custom-salary-deduction-request";
import { FullDaySalaryDeductionRequest } from "./full-day-salary-deduction-request";
import { HalfDaySalaryDeductionRequest } from "./half-day-salary-deduction-request";

export class AttendanceRuleDefinitionRequest {

    id : number=0;
    deductionTypeId : number=0;
    attendanceRuleId : number=0;
    customSalaryDeduction : CustomSalaryDeductionRequest = new CustomSalaryDeductionRequest();
    halfDaySalaryDeduction : HalfDaySalaryDeductionRequest = new HalfDaySalaryDeductionRequest();
    fullDaySalaryDeduction : FullDaySalaryDeductionRequest = new FullDaySalaryDeductionRequest();
    userUuids : string[] = [];
    
}
