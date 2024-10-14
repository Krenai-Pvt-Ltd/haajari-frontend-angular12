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

  // export class AttendanceTimeUpdateRequestDto {

  //  attendanceId!: number;
  //  updatedTime!: Date;
  //  managerId!: number;
  //  requestReason!: String;
  // }

  export class AttendanceTimeUpdateRequestDto {
    userUuid?:string;
    requestType?:string;
    choosenDateString?:string;
    attendanceId?: number; // Only needed for UPDATE request
    updatedTime?: Date; // Only for UPDATE
    managerId!: number;
    requestReason!: string;
    selectedDateAttendance?: Date; // Only for CREATE
    inRequestTime?: Date; // Only for CREATE
    outRequestTime?: Date; // Only for CREATE
  }
  
  

