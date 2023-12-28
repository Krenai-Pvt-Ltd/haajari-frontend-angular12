import { UserDetailsResponse } from "./user-details-response";

export class AttendanceReportResponse {
    userDetailsResponse : UserDetailsResponse = new UserDetailsResponse();
    presentDaysCount : number = 0
	absentDaysCount : number = 0;
	halfDaysCount : number = 0;
	paidLeaveCount : number = 0;
	unmarkedCount : number = 0;
	overtimeDaysCount : number = 0;
	totalAttendanceCount : number = 0;
}
