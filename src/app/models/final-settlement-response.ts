import { PayActionType } from "./pay-action-type";

export class FinalSettlementResponse {
    uuid : string = '';
    name : string = '';
    email : string = '';
    salary : number = 0;
    noticePeriodEndDate : string = '';
    lastWorkingDate : string = '';
    payActionType : PayActionType = new PayActionType();
    resignationStatus : string = '';
    comment : string = '';
}