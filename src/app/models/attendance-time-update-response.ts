export class AttendanceTimeUpdateResponse {
    id : number = 0;
    userUuid : string = '';
    userImage : string = '';
    userEmail : string = '';
    createdDate !: Date;
    requestReason : string = '';
    status : string = '';
    updatedDate !: Date;
    oldDate !: Date;
    managerName : string = '';
    userName : string = '';
    attendanceStatus : string = '';
    requestType : string = '';
    inRequestTime : string = '';
    outRequestTime : string = '';
    managerUuid : string = '';
}