import { BreakTimings } from "./break-timings";
import { UserDetailsResponse } from "./user-details-response";

export class AttendanceDetailsResponse {
    userDetailsResponse : UserDetailsResponse = new UserDetailsResponse();
    createdDate : string = '';
    createdDay : string = '';
    checkInTime : string = '';
    checkOutTime : string = '';
    duration : string = '';
    breakCount : number = 0;
    breakDuration : string = '';
    breakTimings : BreakTimings[] = [];

}
