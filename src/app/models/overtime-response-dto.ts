export class OvertimeResponseDTO {
    userUuid : string = '';
    userName : string = '';
    userImage : string = '';
    managerName : string = '';
    startTime !: Date;
    endTime !: Date;
    workingHour : string = '';
    createdDate !: Date;
    requestStatusId : number = 0;
    note : string = '';
}