import { EmployeePayslipBreakupResponse } from "./employee-payslip-breakup-response";

export class UserSalaryRevisionRes{

 effectiveDate:string='';
 annualCtc:number=0;
 monthlyCtc:number=0;
 grossCtc : number=0;
 salaryBreakup : EmployeePayslipBreakupResponse [] = [];

}