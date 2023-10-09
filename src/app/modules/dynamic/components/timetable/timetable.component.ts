import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import * as moment from 'moment';
import { AttendenceDto } from 'src/app/models/attendence-dto';


@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent implements OnInit {

  constructor(private dataService : DataService) { }

  startDateStr : any ='';
  endDateStr : any = '';
  attendanceRecords: any=[];
  
  selected: { startDate: moment.Moment, endDate: moment.Moment } | null = null;

  ngOnInit(): void {
    
  }

  dateRangeFilter(event: any) {
    //debugger
    if (event.startDate != null) {
      if (this.selected != undefined && this.selected != null && this.selected.startDate != undefined && this.selected.endDate != undefined && this.selected != null) {
        this.startDateStr = moment((this.selected.startDate).toDate()).startOf('day').format('YYYY-MM-DD');
        this.endDateStr = moment((this.selected.endDate).toDate()).endOf('day').format('YYYY-MM-DD');
        this.getDataFromDate();
      } else {
        this.startDateStr=null;
        this.endDateStr=null
      }
    }
  }
  myAttendanceData: Record<string, AttendenceDto[]> = {};

getDataFromDate() {
  this.dataService.getDurationDetails(this.startDateStr, this.endDateStr).subscribe(
    (response : any) => {
        this.myAttendanceData = response.body;
        console.log(this.myAttendanceData);
    
    },
    (error) => {
      console.error('Error fetching data:', error);
    }
  );
}

}
