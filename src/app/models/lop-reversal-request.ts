export class LopReversalRequest {
    uuid : string = '';
    lopDays : number = 0;
    lopDaysToBeReversed : number = 0;
    comment : string = '';

    constructor(uuid : string, lopDays : number, lopDaysToBeReversed : number, comment : string){
        this.uuid = uuid;
        this.lopDays = lopDays;
        this.lopDaysToBeReversed = lopDaysToBeReversed;
        this.comment = comment;
    }
}
