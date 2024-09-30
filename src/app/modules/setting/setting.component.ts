import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  readonly key = Key;
  _router : any;
  constructor(private router: Router, private dataService : DataService, public roleBasedAccessControlService: RoleBasedAccessControlService){
    this._router = router;
  }

  ngOnInit(): void {
    this.isToDoStepsCompletedData();
  }

  isToDoStepsCompleted: number = 0;
  isToDoStepsCompletedData() {
    debugger
    this.dataService.isToDoStepsCompleted().subscribe(
      (response) => {
        this.isToDoStepsCompleted = response.object;
        console.log("success");
        
      },
      (error) => {
        console.log('error');
      }
    );
  }

}
