import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-staff-attendance-location',
  templateUrl: './staff-attendance-location.component.html',
  styleUrls: ['./staff-attendance-location.component.css'],
})
export class StaffAttendanceLocationComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    window.scroll(0, 0);
  }

  str: string = 'abcd';
}
