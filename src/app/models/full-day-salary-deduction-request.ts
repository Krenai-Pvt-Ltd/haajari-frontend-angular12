export class FullDaySalaryDeductionRequest {
    lateDuration !: string;
    occurrenceType : string = 'Count';
    occurrenceCount !: number;
    occurrenceDuration !: string;
}
