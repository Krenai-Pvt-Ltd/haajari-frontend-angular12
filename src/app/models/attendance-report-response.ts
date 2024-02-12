import { DayWiseStatus } from "./day-wise-status";
import { UserDetailsResponse } from "./user-details-response";

export class AttendanceReportResponse {
	userUuid : string = '';
    userName : string = '';
	userEmail : string = '';
	userImage : string = '';
	presentUpToToday : number = 0;
	absentUpToToday : number = 0;
	halfDays : number = 0;
	overTime : number = 0;
	unmarkedUpToToday : number = 0;
	paidLeaveUpToToday : number = 0;
	unpaidLeaveUpToToday : number = 0;
	totalPayOutDaysUpToToday : number = 0;
	dayWiseStatusList : DayWiseStatus[] = [];
}
