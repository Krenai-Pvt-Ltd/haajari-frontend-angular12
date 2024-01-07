import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css']
})
export class TestingComponent implements OnInit {

  constructor(private dataService : DataService) { }

  ngOnInit(): void {
  }
  time = new Date();
  refresh(){
    this.dataService.callingHelloWorld().subscribe((data)=>{
      console.log(data);
    }, (error) => {
      console.log(error);
    })
  }

}
