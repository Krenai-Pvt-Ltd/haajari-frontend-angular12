import { PayActionType } from "./pay-action-type";

export class FinalSettlementResponse {
    // uuid : string = '';
    // name : string = '';
    // email : string = '';
    // salary : number = 0;
    // noticePeriodEndDate : string = '';
    // lastWorkingDate : string = '';
    // payActionType : PayActionType = new PayActionType();
    // payActionTypeId !: number;
    // resignationStatus : string = '';
    // comment : string = '';

    userName:string='';
    uuid : string = ''
    email:string='';
    phone:string='';
    createdDate:string='';
    lastWorkingDate:string='';
    fnfDate:string='';
    status:any;

}