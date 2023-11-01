import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TeamResponse } from 'src/app/models/team';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent implements OnInit {

  constructor(private dataService: DataService,
    private activateRoute : ActivatedRoute) { 

      if(this.activateRoute.snapshot.queryParamMap.has('teamId')){
        this.teamId = this.activateRoute.snapshot.queryParamMap.get('teamId');

      }
    }

  ngOnInit(): void {
    this.getAllUser();
    // this.toggleModel();
  }

//   @ViewChild("addteamModel") addteamModel!: any;
//   @ViewChild("requestAddTeamCloseModel") requestAddTeamCloseModel!: ElementRef;

//   addteamModelSetInvalidToggle: boolean = false;

//   toggleModel(){
//     debugger
//   this.requestAddTeamCloseModel.nativeElement.click();
// }

  teamId :any;

  team:any=[];
  
 
  // userId = 117;
  //  index=0;
  // teamId =2

  getAllUser(){
    this.dataService.getTeamsById(this.teamId)
    .subscribe(data => {
      debugger
      this.team = data;
      console.log(this.team);
    });
  }

  capitalizeFirstLetter(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return name; 
  }

}
