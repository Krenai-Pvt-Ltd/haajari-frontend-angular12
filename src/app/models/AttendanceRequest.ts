export interface AttendanceRequest {
  id: number;
  status: string;
  updatedTime: Date | null;
  oldTime: Date | null;
  requestType: string;
  requestReason: string;
  inRequestTime: Date | null;
  outRequestTime: Date | null;
  userName: string;
  managerName: string;
  attendanceStatus: string;
  createdDate: string;
  requestedFor: string;
}
