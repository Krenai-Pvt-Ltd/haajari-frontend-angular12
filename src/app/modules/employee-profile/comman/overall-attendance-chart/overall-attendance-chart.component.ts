import { Component, Input, OnInit } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexMarkers, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-overall-attendance-chart',
  templateUrl: './overall-attendance-chart.component.html',
  styleUrls: ['./overall-attendance-chart.component.css']
})
export class OverallAttendanceChartComponent implements OnInit {

  @Input() data: any;
  constructor(private dataService: DataService) { }


// Chart properties
public series: ApexAxisChartSeries = [];
public chart: ApexChart = {
  type: 'area', // Use 'area' for filled line chart
  height: 150, // Reduced height as requested
  zoom: { enabled: false },
  toolbar: { show: false }
};
public xaxis: ApexXAxis = {
  type: 'category',
  title: { text: '' }, // Dynamically set based on searchString
  categories: []
};
public yaxis: ApexYAxis = {
  min: 0 // Matches beginAtZero: true
};
public title: ApexTitleSubtitle = {
  text: 'Worked Hours',
  align: 'center'
};
public stroke: ApexStroke = {
  curve: 'smooth'
};
public fill: ApexFill = {
  type: 'solid',
  colors: ['rgba(153, 102, 255, 0.2)'] // Fill color
};
public dataLabels: ApexDataLabels = { enabled: false };
public markers: ApexMarkers = { size: 0 }; // Hide markers
public tooltip: ApexTooltip = {
  y: {
    formatter: (val: number) => this.formatDecimalToTime(val) // HH:MM format
  }
};
public grid: ApexGrid = { show: true };
public isChartInitialized: boolean = false;
public isPlaceholder: boolean = false;

// Existing properties
userId: string = 'your-user-id'; // Set as needed
startDate: string = ''; // Assume this is set elsewhere
endDate: string = ''; // Assume this is set elsewhere
searchString = 'WEEK';
endDateStr: string = '';
holidays: { [key: string]: { title: string; description: string } } = {};
holidayList: any;

ngOnInit(): void {
  this.userId = this.data.userId;
  this.startDate = this.data.startDate;
  this.endDate = this.data.endDate;
  this.searchString = this.data.searchString;
  this.getHoliday();
  this.getWorkedHourForEachDayOfAWeek();
}

// Fetch holiday data
getHoliday(): void {
  this.dataService.getAllHoliday().subscribe((res: any) => {
    if (res.status) {
      this.holidayList = res.object;
      this.holidays = {};
      this.holidayList.forEach((holiday: any) => {
        this.holidays[holiday.date] = {
          title: holiday.title,
          description: holiday.description
        };
      });
      console.log('Formatted holidays:', this.holidays);
    }
  });
}

// Disable holiday dates
disableHolidayDate = (current: Date): boolean => {
  const formattedDate = this.formatDate2(current);
  return !!this.holidays[formattedDate];
};

// Fetch and initialize chart data
getWorkedHourForEachDayOfAWeek(): void {
  const currentDate = new Date();
  const endDate = new Date(this.endDate);
  const dayOfWeek = currentDate.getDay();
  const lastDayOfWeek = new Date(currentDate);
  lastDayOfWeek.setDate(currentDate.getDate() - dayOfWeek + 6);

  currentDate.setHours(0, 0, 0, 0);
  lastDayOfWeek.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (endDate >= currentDate && endDate <= lastDayOfWeek) {
    console.log('End date is within the current week');
    this.endDateStr = lastDayOfWeek.toISOString().split('T')[0];
  } else {
    this.endDateStr = this.endDate;
  }

  this.dataService
    .getWorkedHourForEachDayOfAWeek(this.userId, this.startDate, this.endDateStr, this.searchString)
    .subscribe(
      (response: any) => {
        const labels = response.listOfObject.map((item: any) => this.formatDate(item.workDate));
        const data = response.listOfObject.map((item: any) => this.formatToDecimalHours(item.totalWorkedHour));

        // Update chart series and x-axis
        this.series = [{
          name: 'Total Worked Hours',
          data: data
        }];
        this.xaxis = {
          ...this.xaxis,
          categories: labels,
          title: { text: this.searchString === 'ALL' ? 'Weeks' : 'Days' } // Dynamic x-axis title
        };

        // Handle placeholder and initialization
        if (response.listOfObject.length === 0) {
          this.isPlaceholder = true;
          this.isChartInitialized = false;
        } else {
          this.isPlaceholder = false;
          this.isChartInitialized = true;
        }
      },
      (error) => {
        console.error('Error fetching worked hours:', error);
        this.isPlaceholder = true;
        this.isChartInitialized = false;
      }
    );
}

// Helper functions
formatDate2(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

formatToDecimalHours(time: string): number {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours + minutes / 60 + seconds / 3600;
}

formatDate(date: string): string {
  if (this.searchString === 'ALL') {
    return date;
  } else {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return new Date(date).toLocaleDateString('en-US', options);
  }
}

formatDecimalToTime(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}hrs`;
}

}
