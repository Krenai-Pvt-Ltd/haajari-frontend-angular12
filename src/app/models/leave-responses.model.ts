export interface FullLeaveLogsResponse {
    id: number;
    username: string;
    leaveDate: Date;  
    startDate: Date;
    endDate: Date;
    notes: string;
    leaveType: string;
    status: string;
    managerName: string;
    totalDays: any;
  }
  
  export interface PendingLeavesResponse {
    id: number;
    username: string;
    image: string;
    leaveDate: Date;
    startDate: Date;
    endDate: Date;
    notes: string;
    leaveType: string;
    halfDay: string;
    status: string;
    managerName: string;
    totalDays: any;
  }
  
  export interface PendingLeaveResponse {
    id: number;
    name: string;
    image: string;
    email: string;
    leaveDate: Date;
    startDate: Date;
    endDate: Date;
    notes: string;
    leaveType: string;
    halfDay: string;
    managerName: string;
    totalDays: any;
    approvedLeaves: number;
    pendingLeaves: number;
    remainingLeaves: number;
  }