export class UserLeaveRequest {
    userId!: number;
    startDate!: Date;
    endDate!: Date;
    halfDayLeave: boolean = false; // Initialize to false
    dayShift: boolean = false; // Initialize to false
    eveningShift: boolean = false; // Initialize to false
    // leaveType!: string;
    leaveType!: any;
    uuid!: string;
    status!: string;
    managerId!: number;
    optNotes!: string;
    userLeaveTemplateId!: number;
  }
  