export class UserLeaveRequest {
    userId !: number;
    startDate !: Date;
    endDate !: Date;
    leaveType !: string;
    status !: string;
    managerId !: number;
    optNotes !: string;
}

