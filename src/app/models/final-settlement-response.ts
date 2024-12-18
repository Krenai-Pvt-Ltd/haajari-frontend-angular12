import { PayActionType } from "./pay-action-type";

export class FinalSettlementResponse {

    id:number=0;
    userName:string='';
    uuid : string = ''
    email:string='';
    phone:string='';
    createdDate:string='';
    lastWorkingDate:string='';
    fnfDate:string='';
    status:any;
    payActionTypeId:number=0;
}