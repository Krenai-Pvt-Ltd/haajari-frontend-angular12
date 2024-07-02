import { Status } from "./status";

export class EmployeeMonthWiseSalaryData {
  id: number = 0;
  name !: string;
  email!: string;
  uuid!: string;
  tdsAmount: number = 0;
  epfAmount: number = 0;
  esiAmount: number = 0;
  grossPay: number = 0;
  netPay: number = 0;
  image !: string;
  payStatus : Status = new Status();
}
