export class UserLeaveRequest {
    userId !: number;
    startDate !: Date;
    endDate !: Date;
    halfDayLeave !: boolean;
    dayShift !: boolean;
    eveningShift !: boolean;
    leaveType !: string;
    uuid !: string;
    status !: string;
    managerId !: number;
    optNotes !: string;
}

