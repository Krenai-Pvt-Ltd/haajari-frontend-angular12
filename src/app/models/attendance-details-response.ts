import { BreakTimings } from "./break-timings";
import { UserDetailsResponse } from "./user-details-response";

export class AttendanceDetailsResponse {
    userDetailsResponse : UserDetailsResponse = new UserDetailsResponse();

    uuid : string = '';
    name : string = '';
    email : string = '';
    image : string = '';
    isShiftMapped !: number;
    isAutomationRuleMapped !: number;
    createdDate : string = '';
    createdDay : string = '';
    checkInTime : string = '';
    checkOutTime : string = '';
    currentStatus: string = '';
    totalWorkingHours : string = '';
    totalBreakHours : string = '';
    duration : string = '';
    breakCount : number = 0;
    breakDuration : string = '';
    breakTimingsList : BreakTimings[] = [];

}
