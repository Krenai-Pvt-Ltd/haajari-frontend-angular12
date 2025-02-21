import { Status } from "./status";

export class EmployeeMonthWiseSalaryData {
  id: number = 0;
  userId !:  number;
  name !: string;
  email!: string;
  phone!:string;
  uuid!: string;
  tdsAmount: number = 0;
  epfAmount: number = 0;
  esiAmount: number = 0;
  grossPay: number = 0;
  netPay: number = 0;
  payStatusName !: string;
  department !: string;
  image !: string;
  payActionType !: string;
  comment !: string;
  paySlipUrl !: string;
  payslipMonth !: string;
  payStatus : Status = new Status();
  isSlipHold:number =0;
  checked:boolean=false;
  status:string='';
  payStatusId:number=0;
  paySlipStatusId:number=0;
}
