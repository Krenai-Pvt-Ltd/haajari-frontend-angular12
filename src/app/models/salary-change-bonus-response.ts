import { PayActionType } from "./pay-action-type";

export class SalaryChangeBonusResponse {
    name : string = '';
    email : string = '';
    amount : number = 0;
    comment : string = '';
    payActionType : PayActionType = new PayActionType();
}