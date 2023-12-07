import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {

  constructor(private dataService: DataService, private activateRoute : ActivatedRoute) {  if(this.activateRoute.snapshot.queryParamMap.has('userId')){
    this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
  };
}

userId: any;
  ngOnInit(): void {

    this.getUserByUuid();
  }


  
user:any={};

getUserByUuid(){
  debugger
  this.dataService.getUserByUuid(this.userId).subscribe(data =>{
    console.log(data);
    this.user = data;
    console.log(this.user);

  }, (error) => {
    console.log(error);
  })
}




updateStatusUserByUuid(userUuid:string, type:string){
  debugger
  this.dataService.updateStatusUser(userUuid, type).subscribe(data =>{
   console.log("status updated:" + type);

  }, (error) => {
    console.log(error);
  })
}


}
