import { CustomSalaryDeduction } from "./custom-salary-deduction";
import { DeductionType } from "./deduction-type";
import { FullDaySalaryDeduction } from "./full-day-salary-deduction";
import { HalfDaySalaryDeduction } from "./half-day-salary-deduction";

export class DeductionRuleDefinitionResponse {
    
    customSalaryDeduction : CustomSalaryDeduction = new CustomSalaryDeduction();
    halfDaySalaryDeduction : HalfDaySalaryDeduction = new HalfDaySalaryDeduction();
    fullDaySalaryDeduction : FullDaySalaryDeduction = new FullDaySalaryDeduction();

    deductionType : DeductionType = new DeductionType();
    attendanceRuleDefinitionId : number = 0;
}
