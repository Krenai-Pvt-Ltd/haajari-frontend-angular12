

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TeamResponse } from 'src/app/models/team';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent implements OnInit {

  constructor(private dataService: DataService, private router : Router,
    private activateRoute : ActivatedRoute) { 

      if(this.activateRoute.snapshot.queryParamMap.has('teamId')){
        this.teamId = this.activateRoute.snapshot.queryParamMap.get('teamId');
      };

      this.Settings = {
        singleSelection: false,
        text: 'Select Module',
        enableSearchFilter: true,
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
      };

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


  //Shivendra
  itemPerPage : number = 5;
  pageNumber : number = 1;
  total !: number;
  teamName : string = '';

  Settings: {
    singleSelection: boolean;
    text: string;
    enableSearchFilter: boolean;
    selectAllText: string;
    unSelectAllText: string;
  };

  searchQuery: string = '';
  userList: User[] = [];
  selectedUsers: User[] = [];
  userIds: number[] = [];
  userEmails: string[] = [];

  
  searchUsers() {
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchQuery,'', 1, "ADMIN").subscribe((data : any) => {
      this.userList = data.users;
      this.total = data.count;
      console.log(this.userList);
    });
  }

  toggleUserSelection(user: User) {
    const index = this.selectedUsers.findIndex((u) => u.id === user.id);
    if (index === -1) {
      this.selectedUsers.push(user);
      this.userIds.push(user.id);

      this.userEmails.push(user.email);
      
      console.log(this.userIds);
    } else {
      console.log("error!");
    }

    this.userList = [];
    this.searchQuery = '';

  }

  removeSelectedUser(user: User) {
    const index = this.selectedUsers.indexOf(user);
    if (index !== -1) {
      this.selectedUsers.splice(index, 1);
    }
  }



  inviteUsers(){
    this.dataService.sendInviteToUsers(this.userEmails).subscribe((data) => {
      debugger
      this.userEmails = [];
      console.log(data);
    },(error) => {
      debugger
      this.userEmails = [];
      this.selectedUsers = [];
      console.log(error);
    })
  }

}
