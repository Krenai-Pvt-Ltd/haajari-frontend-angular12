import { BreakTimings } from "./break-timings";

export class AttendenceDto {
    createdDate!: string;
    createdDay!: string;
    checkInTime!: string | null;
    currentStatus: string = 'active';
    checkOutTime!: string | null;
    duration!: string | null;
    breakCount!: number;
    breakDuration!: string;
    breakTimings!: BreakTimings[];
    totalPresentDays!: number;
    converterDate!: Date; //used for storing createdDate as an Date object
}