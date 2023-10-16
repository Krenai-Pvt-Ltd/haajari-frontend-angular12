import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-add-to-slack',
  templateUrl: './add-to-slack.component.html',
  styleUrls: ['./add-to-slack.component.css']
})
export class AddToSlackComponent implements OnInit{
  
  constructor(private dataService : DataService){}
  id !: number;
  ngOnInit(): void {
    debugger
    // Retrieve the orgId from DataService
    // this.dataService.getOrgIdEmitter().subscribe((orgId) => {
    //   console.log('Org ID', orgId);
    //   this.id = orgId;
      
    // });

    if (this.dataService.orgId != undefined && this.dataService.orgId != null && this.dataService.orgId != '') {
      this.id = this.dataService.orgId;
      this.dataService.orgId = this.id;
    }
  }

  

}