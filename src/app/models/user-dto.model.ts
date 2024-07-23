export class UserDto {
    id: number;
    name: string;
  
    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  export interface AttendanceCheckTimeResponse {
    attendanceId: number;
    checkTime: Date;
  
  }

  export class AttendanceTimeUpdateRequestDto {

   attendanceId!: number;
   updatedTime!: Date;
   managerId!: number;
   requestReason!: String;
  }
  

