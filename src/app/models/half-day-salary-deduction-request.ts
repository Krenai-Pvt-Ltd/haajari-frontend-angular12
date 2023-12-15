export class HalfDaySalaryDeductionRequest {
    lateDuration !: string;
    occurrenceType : string = 'Count';
    occurrenceCount !: number;
    occurrenceDuration !: string;
}
