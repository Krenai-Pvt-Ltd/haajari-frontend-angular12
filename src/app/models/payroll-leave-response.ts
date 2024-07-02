import { LeaveInfoForPayrollReflection } from "./leave-info-for-payroll-reflection";
import { UserInfoForPayrollReflection } from "./user-info-for-payroll-reflection";

export class PayrollLeaveResponse {
    userInfo : UserInfoForPayrollReflection = new UserInfoForPayrollReflection();
    leaveInfo : LeaveInfoForPayrollReflection = new LeaveInfoForPayrollReflection();
}