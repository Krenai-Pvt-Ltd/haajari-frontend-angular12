import { PayActionType } from "./pay-action-type";

export class SalaryChangeBonusResponse {
    uuid : string = '';
    name : string = '';
    email : string = '';
    phone:string='';
    amount : number = 0;
    comment : string = '';
    payActionType : PayActionType = new PayActionType();
    payActionTypeId !: number;
}