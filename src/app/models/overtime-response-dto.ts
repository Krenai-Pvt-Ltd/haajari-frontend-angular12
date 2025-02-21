export class OvertimeResponseDTO {
    overtimeRequestId : number = 0;
    userUuid : string = '';
    userName : string = '';
    userEmail : string = '';
    userImage : string = '';
    managerName : string = '';
    startTime !: Date;
    endTime !: Date;
    workingHour : string = '';
    createdDate !: Date;
    requestStatusId : number = 0;
    note : string = '';
}