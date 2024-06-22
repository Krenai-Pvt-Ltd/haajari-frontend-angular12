export class LopReversalRequest {
    uuid : string = '';
    lopDays : number = 0;
    lopDaysToBeReversed : number = 0;
    lopReversalComment : string = '';

    constructor(uuid : string, lopDays : number, lopDaysToBeReversed : number, lopReversalComment : string){
        this.uuid = uuid;
        this.lopDays = lopDays;
        this.lopDaysToBeReversed = lopDaysToBeReversed;
        this.lopReversalComment = lopReversalComment;
    }
}
