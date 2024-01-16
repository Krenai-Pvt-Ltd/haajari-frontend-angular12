import { CustomSalaryDeductionRequest } from "./custom-salary-deduction-request";
import { DeductionType } from "./deduction-type";
import { FullDaySalaryDeductionRequest } from "./full-day-salary-deduction-request";
import { HalfDaySalaryDeductionRequest } from "./half-day-salary-deduction-request";
import { OrganizationAddressDetail } from "./organization-address-detail";
import { OvertimeType } from "./overtime-type";

export class AttendanceRuleDefinitionResponse {
    id : number = 0;
    customSalaryDeduction : CustomSalaryDeductionRequest = new CustomSalaryDeductionRequest();
    halfDaySalaryDeduction : HalfDaySalaryDeductionRequest = new HalfDaySalaryDeductionRequest();
    fullDaySalaryDeduction : FullDaySalaryDeductionRequest = new FullDaySalaryDeductionRequest();
    deductionType : DeductionType = new DeductionType();
    overtimeType : OvertimeType = new OvertimeType();
    attendanceRuleId : number = 0;
    userUuids : string[] = [];
    organizationAddressDetail : OrganizationAddressDetail = new OrganizationAddressDetail();
}
