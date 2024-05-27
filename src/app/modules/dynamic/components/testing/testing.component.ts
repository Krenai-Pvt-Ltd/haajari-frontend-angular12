import { Component, OnInit } from '@angular/core';
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
  }
  time = new Date();

  testing: Testing = new Testing();
  refresh() {
    this.dataService.testing(this.testing).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  temp : string = '';
  getTestingGetMethodCall(){
    this.dataService.getTestingGet().subscribe((response) => {

      //@ts-ignore
      this.temp = response.date;
    })
  }
}
