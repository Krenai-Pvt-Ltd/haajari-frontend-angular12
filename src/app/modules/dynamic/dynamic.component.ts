import { Component, OnInit } from '@angular/core';
import { NavigationEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';


@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.css']
})
export class DynamicComponent implements OnInit {

  readonly key = Key;
  _router : any;
  constructor(private router: Router,
    private _helperService:HelperService,
    private dataService : DataService,
    public roleBasedAccessControlService:RoleBasedAccessControlService){
    this._router = router;
    
  }

  ngOnInit(): void {
    // console.log(this.roleBasedAccessControlService.isUserInfoInitialized,"-------");
    this.isToDoStepsCompletedData();
    this._router.events.subscribe((event:any) => {
      if(event instanceof NavigationEnd &&  document.body?.classList){
        this._helperService.todoStepsSubject.next("close")
      }
    })
    //  this.helperService.todoStepsSubject
  }

  
  isToDoStepsCompleted : number = 0;
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