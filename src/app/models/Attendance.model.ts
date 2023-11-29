

export interface AttendanceTopPerformer {
    id: number;
    name: string;
    email: string;
    image: string;
  }
  
  export interface AttendanceWithTopPerformerResponseDto {
    attendanceTopPerformers: AttendanceTopPerformer[];
    attendanceLatePerformers: AttendanceTopPerformer[];
  }
  