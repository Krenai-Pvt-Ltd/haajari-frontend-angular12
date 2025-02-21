import { Component, OnInit } from '@angular/core';
import { Temp } from 'src/app/models/temp';
import { Testing } from 'src/app/models/testing';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css'],
})
export class TestingComponent implements OnInit {
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getTestingGetMethodCall();
    // console.log(this.getTimeZone());
  }
  time = new Date();

  testing: Testing = new Testing();

  refresh() {
    this.dataService.testing(this.testing).subscribe(
      (data) => {
        // console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
  }


  getTestingGetMethodCall(){
    this.dataService.getTesting().subscribe((response) => {

      //@ts-ignore
      this.tempObject = response;
    })
  }


  tempObject : Temp = new Temp();
  postTestingMethodCall(){
    this.dataService.postTesting(this.tempObject).subscribe((response) => {
      // console.log("Post testing method is called successfully.");
    })
  }

  changeDate(dateTime : Date){
    // console.log(dateTime);
    this.tempObject.dateTime = dateTime;
  }


  getTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}
