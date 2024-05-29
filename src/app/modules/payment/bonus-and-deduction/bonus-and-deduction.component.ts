import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bonus-and-deduction',
  templateUrl: './bonus-and-deduction.component.html',
  styleUrls: ['./bonus-and-deduction.component.css'],
})
export class BonusAndDeductionComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    window.scroll(0, 0);
  }

  size: 'small' | 'default' | 'large' = 'default';
  selectedDate: Date | null = null;

  disableYears = (date: Date): boolean => {
    return date.getFullYear() < 2024;
  };

  onYearChange(date: Date): void {
    this.selectedDate = date;
    console.log('Selected year:', date.getFullYear());
  }
}
