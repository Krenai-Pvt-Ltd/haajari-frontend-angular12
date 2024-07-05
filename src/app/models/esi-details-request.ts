export class EsiDetailsRequest {
    userUuid : string = '';
    amount : number = 0;

    constructor(userUuid : string, amount : number) {
        this.userUuid = userUuid;
        this.amount = amount;
    }
}
