import { DayWiseStatus } from "./day-wise-status";
import { UserDetailsResponse } from "./user-details-response";

export class AttendanceReportResponse {
	userUuid : string = '';
    userName : string = '';
	userEmail : string = '';
	userImage : string = '';
	present : number = 0;
	absentUpToToday : number = 0;
	halfDays : number = 0;
	overTime : number = 0;
	unmarked : number = 0;
	paidLeave : number = 0;
	unpaidLeave : number = 0;
	totalPayOutDays : number = 0;
	dayWiseStatusList : DayWiseStatus[] = [];
}
