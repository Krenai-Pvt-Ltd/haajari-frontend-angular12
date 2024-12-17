export class OvertimeRequestLogResponse {
    userUuid : string = '';
    userName : string = '';
    userEmail : string = '';
    managerName : string = '';
    startTime !: Date;
    endTime !: Date;
    workingHour : string = '';
    createdDate !: Date;
    requestStatusId : number = 0;
    note : string = '';
    statusName : string= '';
}