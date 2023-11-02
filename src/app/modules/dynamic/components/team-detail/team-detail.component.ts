

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent implements OnInit {

  constructor(private dataService: DataService,
    private activateRoute : ActivatedRoute) { 
      debugger
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
    this.getTeamMemberById();
    // this.openModal();
  }

  // openModal() {
  //   this.modalService.open('#addteam');
  // }
//   ngAfterViewInit(){
//     if(this.addteamModel!=undefined){
//       this.addteamModel.nativeElement.click();
//     }
// }
//  @ViewChild("addTeamModalButton") addteamModel!: ElementRef;
//   @ViewChild("requestAddTeamCloseModel") requestAddTeamCloseModel!: ElementRef;

//   @ViewChild("addteam") addteam!: any;
//   @ViewChild("requestAddTeamOpenModel") requestAddTeamOpenModel!: ElementRef;

//   addTeamFlag: boolean = true;

//   toggleModel(){
//     debugger
//    if(this.addTeamFlag){
//   this.requestAddTeamOpenModel.nativeElement.click();
//    }
// }

  teamId :any;

  team:any=[];
  
 
  // userId = 117;
  //  index=0;
  // teamId =2

  getTeamMemberById(){
    debugger
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

  capitalizeFirstLetterAndSmallOtherLetters(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
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
