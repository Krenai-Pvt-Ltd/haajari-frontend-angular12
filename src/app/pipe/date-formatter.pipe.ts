import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormatter',
})
export class DateFormatterPipe implements PipeTransform {
  transform(date: Date): string {
    // Format the date using desired options
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  }
}
