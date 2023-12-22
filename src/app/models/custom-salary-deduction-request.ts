export class CustomSalaryDeductionRequest {
    
    occurrenceType : string = 'Count';
    occurrenceCount : number = 0;
    occurrenceDuration : string = '';
    amountInRupees : number = 0;
    hours : number = 0;
    minutes : number = 0;
    occurrenceDurationHours : number = 0;
    occurrenceDurationMinutes : number = 0;
    lateDuration : string = '';

    updateLateDuration() {
        this.lateDuration = `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}`;
    }

    updateOccurrenceDuration() {
        this.occurrenceDuration = `${this.occurrenceDurationHours.toString().padStart(2, '0')}:${this.occurrenceDurationMinutes.toString().padStart(2, '0')}`;
    }
}
