// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'durationFormat'
// })
// export class DurationFormatPipe implements PipeTransform {
//   transform(duration: string | null): string {
//     if (duration === null) {
//       return '   -   ';
//     }

//     // Split the duration string into parts
//     const parts = duration.split(', ');

//     // Extract hours, minutes, and seconds
//     let hours = '';
//     let minutes = '';
//     for (const part of parts) {
//       if (part.endsWith('hours')) {
//         hours = part.replace(' hours', 'h');
//       } else if (part.endsWith('minutes')) {
//         minutes = part.replace(' minutes', 'm');
//       }
//     }

//     // Combine hours and minutes
//     const formattedDuration = `${hours} ${minutes}`;

//     return formattedDuration;
//   }
// }


import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat'
})
export class DurationFormatPipe implements PipeTransform {
  transform(duration: string | null): string {
    if (duration === null) {
      return '   -   ';
    }

    // Extract hours, minutes, and seconds from ISO duration
    const regex = /PT(-?\d+H)?(-?\d+M)?(-?\d+(\.\d+)?S)?/;
    const matches = duration.match(regex);

    let hours = '';
    let minutes = '';

    if (matches) {
      const hoursMatch = matches[1];
      const minutesMatch = matches[2];

      if (hoursMatch) {
        hours = hoursMatch.replace('H', 'h ');
      }
      if (minutesMatch) {
        minutes = minutesMatch.replace('M', 'm');
      }
    }

    // Combine hours and minutes
    const formattedDuration = `${hours}${minutes}`;

    return formattedDuration.trim(); // Remove extra spaces if any
  }
}
