export interface UserLeaveDetailsWrapper {
  userDetails: UserDetails;
  leaveDetails: LeaveDetail[];
}

export interface UserDetails {
  name: string;
  image: string;
  email: string;
  uuid: string;
  requestedLeaves: number;
}

export interface LeaveDetail {
  leaveName: string;
  approvedLeave: number;
  pendingLeave: number;
  remainingLeave: number;
  totalLeave: number;
}
