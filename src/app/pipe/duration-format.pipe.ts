import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat'
})
export class DurationFormatPipe implements PipeTransform {
  transform(duration: string | number | null): string {
    if (duration === null) {
      return '   -   ';
    }

    // Check if the duration is in ISO 8601 format (PT#H#M)
    if(typeof duration === 'number'){
      return this.formatSecondsToHoursAndMinutes(duration);
    } else if (duration.startsWith('PT')) {
      return this.formatIsoDuration(duration);
    } else {
      return this.formatSimpleDuration(duration);
    }
  }

  private formatIsoDuration(duration: string): string {
    const regex = /PT(-?\d+H)?(-?\d+M)?(-?\d+(\.\d+)?S)?/;
    const matches = duration.match(regex);

    let hours = '';
    let minutes = '';

    if (matches) {
      const hoursMatch = matches[1];
      const minutesMatch = matches[2];
      const secondsMatch = matches[3];

      if (hoursMatch) {
        hours = hoursMatch.replace('H', 'h ');
      }
      if (minutesMatch) {
        minutes = minutesMatch.replace('M', 'm');
      }
    }

    return `${hours}${minutes}`.trim();
  }

  private formatSimpleDuration(duration: string | null): string {

    if (duration === null) {
      return '   -   ';
    }

    const parts = duration.split(':');

    let hours = parts[0];
    let minutes = parts[1];
    
    const formattedDuration = `${hours}:${minutes} hrs.`;
    
    return formattedDuration;
  }

  // Method to format seconds into hours and minutes
  private formatSecondsToHoursAndMinutes(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  }
}

