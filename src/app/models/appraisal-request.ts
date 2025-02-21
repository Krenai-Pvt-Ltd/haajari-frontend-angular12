export class AppraisalRequest {

    effectiveDate !: string;
    userUuid : string='';
    previousCtc !: number;
    updatedCtc !: number;
    checked:boolean=false;
    position:string='';
}
