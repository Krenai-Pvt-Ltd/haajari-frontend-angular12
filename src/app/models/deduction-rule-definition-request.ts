import { CustomSalaryDeductionRequest } from "./custom-salary-deduction-request";
import { FullDaySalaryDeductionRequest } from "./full-day-salary-deduction-request";
import { HalfDaySalaryDeductionRequest } from "./half-day-salary-deduction-request";

export class DeductionRuleDefinitionRequest {
    customSalaryDeduction : CustomSalaryDeductionRequest = new CustomSalaryDeductionRequest();
    halfDaySalaryDeduction : HalfDaySalaryDeductionRequest = new HalfDaySalaryDeductionRequest();
    fullDaySalaryDeduction : FullDaySalaryDeductionRequest = new FullDaySalaryDeductionRequest();
    attendanceRuleId : number = 0;
    userUuids : string[] = [];
}