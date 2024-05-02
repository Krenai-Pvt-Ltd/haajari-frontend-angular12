export class NewJoineeAndUserExitRequest {
    uuid : string = '';
    comment : string = '';
    startDate : string = '';
    endDate : string = '';
    payActionTypeId : number = 1;

    constructor(uuid: string, payActionTypeId: number, comment : string) {
        this.uuid = uuid;
        this.payActionTypeId = payActionTypeId;
        this.comment = comment;
    }
}
