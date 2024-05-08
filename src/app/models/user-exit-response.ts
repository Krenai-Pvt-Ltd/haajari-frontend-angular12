import { PayActionType } from "./pay-action-type";

export class UserExitResponse {

    uuid : string = '';
    name : string = '';
    email : string = '';
    salary : number = 0;
    resignationDate : string = '';
    noticePeriodEndDate : string = '';
    resignationStatus : string = '';
    payActionType : PayActionType = new PayActionType();
    comment : string = '';
}