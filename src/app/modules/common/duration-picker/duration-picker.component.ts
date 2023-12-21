import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

declare var TimePicker: any;

@Component({
  selector: 'app-duration-picker',
  template: `
    <div>
      <input type="text" #time id="time" placeholder="Time">
    </div>
  `,
  styles: []
})
export class DurationPickerComponent implements AfterViewInit {
  @ViewChild('time') timeInput!: ElementRef;

  ngAfterViewInit() {
    const timepicker = new TimePicker(this.timeInput.nativeElement, {
      lang: 'en',
      theme: 'dark'
    });
    timepicker.on('change', (evt : any) => {
      const value = (evt.hour || '00') + ':' + (evt.minute || '00');
      this.timeInput.nativeElement.value = value;
    });
  }
}

