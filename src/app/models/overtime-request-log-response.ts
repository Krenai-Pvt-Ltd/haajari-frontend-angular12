export class OvertimeRequestLogResponse {
    userName : string = '';
    userEmail : string = '';
    managerName : string = '';
    startTime !: Date;
    endTime !: Date;
    workingHour : string = '';
    createdDate !: Date;
    requestStatusId : number = 0;
    note : string = '';
}