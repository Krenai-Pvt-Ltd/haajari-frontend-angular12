import { CustomSalaryDeductionRequest } from "./custom-salary-deduction-request";
import { DeductionType } from "./deduction-type";
import { FullDaySalaryDeductionRequest } from "./full-day-salary-deduction-request";
import { HalfDaySalaryDeductionRequest } from "./half-day-salary-deduction-request";

export class AttendanceRuleDefinitionResponse {
    id : number = 0;
    customSalaryDeduction : CustomSalaryDeductionRequest = new CustomSalaryDeductionRequest();
    halfDaySalaryDeduction : HalfDaySalaryDeductionRequest = new HalfDaySalaryDeductionRequest();
    fullDaySalaryDeduction : FullDaySalaryDeductionRequest = new FullDaySalaryDeductionRequest();
    deductionType : DeductionType = new DeductionType();
}
