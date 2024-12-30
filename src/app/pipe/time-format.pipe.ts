import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string | null): string {
    if (value === null) {
      return '-'; // Return an empty string or another appropriate value for null
    }

    // Parse the input time string
    const inputTime = new Date(value);

    // Format the time as "hh:mm AM/PM"
    return inputTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}
