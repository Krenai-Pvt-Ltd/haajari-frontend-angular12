import { PayActionType } from "./pay-action-type";

export class SalaryChangeOvertimeResponse {
    uuid : string = '';
    name : string = '';
    email : string = '';
    overtimeCount : number = 0;
    overtimeHour : string = '';
    payActionType : PayActionType = new PayActionType();
    payActionTypeId !: number;
}