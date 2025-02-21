import { DayWiseStatus } from "./day-wise-status";
import { UserDetailsResponse } from "./user-details-response";

export class AttendanceReportResponse {
	// userUuid : string = '';
    // userName : string = '';
	// userEmail : string = '';
	// userImage : string = '';
	// presentUpToToday : number = 0;
	// absentUpToToday : number = 0;
	// halfDays : number = 0;
	// overTime : number = 0;
	// unmarkedUpToToday : number = 0;
	// paidLeaveUpToToday : number = 0;
	// unpaidLeaveUpToToday : number = 0;
	// totalPayOutDaysUpToToday : number = 0;
	// dayWiseStatusList : DayWiseStatus[] = [];

	userUuid : string = '';
    userName : string = '';
	email : string = '';
	userImage : string = '';
	halfDayCount : number = 0;
	paidLeave : number = 0;
	presentCount : number = 0;
	totalDayInMonth : number = 0;
	totalHolidays : number = 0;
	totalWeekendInMonth : number = 0;
	unmarkedAttendanceCount : number = 0;
	unpaidLeave : number = 0;
	dayWiseStatusList : DayWiseStatus[] = [];

	totalDeduction: number = 0;
	totalAbsentCount: number = 0;
	// totalDayInMonth: number = 0;
}






