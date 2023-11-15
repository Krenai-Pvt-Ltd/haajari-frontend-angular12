export class AttendenceDto {
    createdDate!: string;
    createdDay!: string;
    checkInTime!: string | null;
    checkOutTime!: string | null;
    duration!: string | null;
    breakCount!: number;
    breakDuration!: string;
    totalPresentDays!: number;
}