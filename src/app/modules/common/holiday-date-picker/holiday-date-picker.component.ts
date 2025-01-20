import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-holiday-date-picker',
  templateUrl: './holiday-date-picker.component.html',
  styleUrls: ['./holiday-date-picker.component.css']
})
export class HolidayDatePickerComponent implements OnInit {

  @Input() holidays: { [key: string]: { title: string, description: string } } = {};

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  holidayList: any[] = new Array();
  getHoliday1(){
    if(this.holidayList.length == 0){
      this.dataService.getAllHoliday().subscribe((res: any) =>{
        if(res.status){
          this.holidayList = res.object;
          console.log('holidayList list: ',this.holidayList)
        }
      })
    }
  }

/*
  holidays: { [key: string]: string } = {
    '2024-12-25': 'Christmas Day',
    '2024-12-31': 'New Year\'s Eve',
    '2025-01-01': 'New Year\'s Day',
  };

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getHolidayName(date: Date): string {
    const formattedDate = this.formatDate(date);
    return this.holidays[formattedDate] || ''; 
  }

  isHoliday(date: Date): boolean {
    const formattedDate = this.formatDate(date);
    return !!this.holidays[formattedDate]; // Return true if holiday is found
  }

  // Template for custom rendering of each date
  customDateRender = (current: Date): HTMLElement => {
    const div = document.createElement('div');
    div.classList.add('ant-picker-cell-inner');
    div.innerHTML = current.getDate().toString();

    // If the current date is a holiday, highlight it
    if (this.isHoliday(current)) {
      div.classList.add('holiday-highlight');
    }

    return div;
  };*/

  @Input() currentDate: Date | null = null;

  // Function to format the date to 'yyyy-MM-dd' for comparison with holidays
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

// Function to get the holiday description
getHolidayName(): string {
  if (!this.currentDate) return ''; // Return empty string if currentDate is not defined
  const formattedDate = this.formatDate(this.currentDate);

  // Check if holiday exists for the formatted date and return the title
  const holiday = this.holidays[formattedDate];
  // console.log('nameis: ',holiday?.title)
  return holiday ? holiday.title : ''; // Return the holiday title or empty string if not found
}

getHolidayDescription(): string {
  if (!this.currentDate) return ''; // Return empty string if currentDate is not defined
  const formattedDate = this.formatDate(this.currentDate);

  // Check if holiday exists for the formatted date and return the title
  const holiday = this.holidays[formattedDate];
  // console.log('nameis: ',holiday?.title)
  return holiday ? holiday.description : ''; // Return the holiday title or empty string if not found
}



  // Function to check if the date is a holiday
  isHoliday(): boolean {
    if (!this.currentDate) return false;
    const formattedDate = this.formatDate(this.currentDate);
    return !!this.holidays[formattedDate]; // Returns true if holiday exists
  }

}
