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
  uuid: string;
  image: string;
  email: string;
  leaveDate: Date;
  startDate: Date;
  endDate: Date;
  notes: string;
  leaveType: string;
  halfDay: string;
  docFileLink: string;
  managerName: string;
  managerUuid: string;
  totalDays: any;
  approvedLeaves: number;
  pendingLeaves: number;
  remainingLeaves: number;
  attachment: any;
  totalValidDays:number;

  remainingQuota: any;
  applied: any;
  approved: any;
}

export interface LeaveResponse {
  id: number;
  name: string;
  username:string;
  uuid: string;
  image: string;
  email: string;
  leaveDate: Date;
  startDate: Date;
  endDate: Date;
  notes: string;
  leaveType: string;
  halfDay: string;
  docFileLink: string;
  managerName: string;
  managerUuid: string;
  totalDays: any;
  approvedLeaves: number;
  pendingLeaves: number;
  remainingLeaves: number;
  attachment: any;
  status:string;

  remainingQuota: any;
  applied: any;
  approved: any;
  rejectionReason:string;
  approvedCount: number;
  rejectedCount: number;
  remainingCount: number;
}
