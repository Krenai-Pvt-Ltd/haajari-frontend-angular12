import { BreakTimings } from "./break-timings";

export class AttendenceDto {
    createdDate: string = '';
    createdDay : string = '';
    checkInTime: string = '';
    currentStatus: string = '';
    checkOutTime: string = '';
    duration: string = '';
    breakCount: number = 0;
    breakDuration: string = '';
    breakTimings: BreakTimings[] = [];
    totalPresentDays: number = 0;
    converterDate!: Date; //used for storing createdDate as an Date object
}