import { CustomSalaryDeduction } from "./custom-salary-deduction";
import { FullDaySalaryDeduction } from "./full-day-salary-deduction";
import { HalfDaySalaryDeduction } from "./half-day-salary-deduction";

export class DeductionRuleDefinitionRequest {
    
    customSalaryDeduction : CustomSalaryDeduction = new CustomSalaryDeduction();
    halfDaySalaryDeduction : HalfDaySalaryDeduction = new HalfDaySalaryDeduction();
    fullDaySalaryDeduction : FullDaySalaryDeduction = new FullDaySalaryDeduction();
    
    deductionTypeId : number = 0;
}