import { PayActionType } from "./pay-action-type";

export class SalaryChangeOvertimeResponse {
    uuid : string = '';
    name : string = '';
    email : string = '';
    overtimeCount : number = 0;
    overtimeHour : number = 0;
    payActionType : PayActionType = new PayActionType();
    payActionTypeId !: number;
}