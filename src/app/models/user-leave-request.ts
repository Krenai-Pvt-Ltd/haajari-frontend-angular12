export class UserLeaveRequest {
    userId!: number;
    startDate!: any;
    endDate!: any;
    halfDayLeave: boolean = false; // Initialize to false
    dayShift: boolean = false; // Initialize to false
    eveningShift: boolean = false; // Initialize to false
    leaveType!: string;
    // leaveType!: any;
    uuid!: string;
    status!: string;
    managerId!: number;
    optNotes!: string;
    userLeaveTemplateId!: number;

    date!: string;
    type!: string;
    requestedTo!: string;
    approvedBy!: string;
    actionTakenOn!: string;
    leaveNote!: string;
    cancelReason!: string;
  }
