import { PayActionType } from "./pay-action-type";

export class NewJoineeResponse {
    monthId:number=0;
    uuid : string = '';
    name : string = '';
    email : string = '';
    phone : string ='';
    joinDate : string = '';
    payActionId : number=0;
    payoutDays:number=0;

}