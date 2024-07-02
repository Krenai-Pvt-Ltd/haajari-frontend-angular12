export class LopSummaryRequest {
    uuid : string = '';
    lopDays : number = 0;
    finalLopDays : number = 0;
    adjustedLopDays : number = 0;
    lopSummaryComment : string = '';

    constructor(uuid: string, lopDays: number, finalLopDays : number, adjustedLopDays : number, lopSummaryComment : string) {
        this.uuid = uuid;
        this.lopDays = lopDays;
        this.finalLopDays = finalLopDays;
        this.adjustedLopDays = adjustedLopDays;
        this.lopSummaryComment = lopSummaryComment;
    }
}