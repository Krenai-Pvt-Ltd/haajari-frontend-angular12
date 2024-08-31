export class SalaryChangeOvertimeRequest {
    uuid : string = '';
    name : string = '';
    email : string = '';
    amount : number = 0;
    comment : string = '';
    payActionTypeId : number = 0;

    constructor(uuid: string, payActionTypeId: number) {
        this.uuid = uuid;
        this.payActionTypeId = payActionTypeId;
    }
}
