import { PayActionType } from "./pay-action-type";

export class NewJoineeResponse {
    id:number=0;
    uuid : string = '';
    name : string = '';
    email : string = '';
    phone : string ='';
    joiningDate : string = '';
    comment : string = '';
    payActionTypeId : number=0;
    payoutDays:number=0;

}