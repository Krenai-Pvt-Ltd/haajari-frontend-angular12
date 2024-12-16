import { PayActionType } from "./pay-action-type";

export class UserExitResponse {

    // uuid : string = '';
    // name : string = '';
    // email : string = '';
    // salary : number = 0;
    // resignationDate : string = '';
    // noticePeriodEndDate : string = '';
    // resignationStatus : string = '';
    // payActionTypeId !: number;
    // payActionType : PayActionType = new PayActionType();
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