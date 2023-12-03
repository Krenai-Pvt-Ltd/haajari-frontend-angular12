

export interface AttendanceTopPerformer {
    id: number;
    name: string;
    email: string;
    image: string;
  }
  
  export interface AttendanceWithTopPerformerResponseDto {
    attendanceTopPerformers: AttendanceTopPerformer[];
    // attendanceLatePerformers: AttendanceTopPerformer[];
  }
  
  export interface AttendanceWithLatePerformerResponseDto {
    // attendanceTopPerformers: AttendanceTopPerformer[];
    attendanceLatePerformers: AttendanceLatePerformer[];
  }

  export interface AttendanceLatePerformer {
    id: number;
    name: string;
    date: string;
    lateTime: string;
  }
  