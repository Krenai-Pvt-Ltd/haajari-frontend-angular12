export class EmployeeProfileAttendanceResponse{

  createdDate!: Date;
  uuid!: string;
  name!: string;
  checkInTime!: Date;
  checkOutTime!: Date;
  checkoutType!: string;
  breakCount!: number;
  totalBreakHours!: string;
  totalWorkedHour!: string;
  attendanceSource!: string;
  shiftInTime!: Date;
  shiftOutTime!: Date;
  totalWorkingHour!: string;
  shiftType!: string;
  workingHourDifference!: string;
  status!: string;
  currentStatus!: string;
  halfDayMinutes!: string;
  lateMinutes!: string;
}

export class TotalEmployeeProfileAttendanceResponse {
    totalWorkedHours!: string;
	totalLateHours!: string;
	totalLateCount!: string;
	totalHalfDayHours!: string;
	totalHalfDayCount!: string;
	totalEarlyCheckoutHours!: string;
	totalEarlyCheckoutCount!: string;
	totalSystemCheckoutCount!: string;
    totalAbsentCount!: string;
    totalOvertimeHours!: string;
    totalOvertimeCount!: string;
}