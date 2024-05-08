import { PayActionType } from "./pay-action-type";

export class NewJoineeResponse {
    uuid : string = '';
    name : string = '';
    email : string = '';
    joiningDate : string = '';
    salary : number = 0;
    payActionType : PayActionType = new PayActionType();
    comment : string = '';
    selected : boolean = false;
}