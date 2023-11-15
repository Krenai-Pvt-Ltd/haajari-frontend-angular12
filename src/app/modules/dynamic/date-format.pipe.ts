import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string): string {
    // Parse the input date string as a UTC date
    const date = new Date(value);

    // Convert to UTC by setting the timezone offset to 0
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    // Format the date using desired options
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: '2-digit' };
    return utcDate.toLocaleDateString('en-US', options);
  }
}
