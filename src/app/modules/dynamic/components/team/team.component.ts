import { Component, OnInit } from '@angular/core';

import { User } from 'src/app/models/user';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TeamResponse } from 'src/app/models/team';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamDetailComponent } from '../team-detail/team-detail.component';
import { ModalService } from 'src/app/modal.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit{
  itemPerPage : number = 5;
  pageNumber : number = 1;
  total !: number;
  teamName : string = '';
  teamDescription: string =''
  

  ngOnInit(): void {
    // this.getAllUsersByFiltersFunction();
    this.getAllUser();
  }

  constructor(private router : Router, private dataService: DataService,  private activateRoute : ActivatedRoute, private modalService: ModalService) { 
    this.Settings = {
      singleSelection: false,
      text: 'Select Module',
      enableSearchFilter: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
    };
  }

  // ############################
  
  addTeamFlag: boolean = false;

  openTeamModal(teamId: number) {
    this.router.navigate(['/dynamic/team-detail'], { queryParams: { teamId: teamId } });
    // this.openModal();

  }

  openModal() {
    this.modalService.openModal();
  }

  // callModal() {
  //   const modalRef = this.modalService.open(TeamDetailComponent,
  //     { size: 'xl', backdrop: 'static', keyboard: false, windowClass:'modal fade'
  //     });
  // }

  // ###############################

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
      this.selectedUsers.splice(index, 1); // Remove the user from the selectedUsers array
    }
  }

  registerTeamSubmitButton(){
    debugger
    this.dataService.registerTeam(this.userIds,this.teamName,this.teamDescription).subscribe((data) => {
      console.log(data);
      location.reload();
    }, (error) => {
      location.reload();
      console.log(error);
    })
  }


  

  // showMultiselectDropdown: boolean = true;
  // searchTxt: string = '';

  // selectedMembers: number[] = [];
  // filteredMembers: any[] = [];

  // filterMembers() {
  //   this.filteredMembers = this.emailIdPairs.filter(user =>
  //     user.name.toLowerCase().includes(this.searchTxt.toLowerCase())
  //   );
  // }

  // toggleMember(user: any) {
  //   if (this.selectedMembers.includes(user.id)) {
  //     this.selectedMembers = this.selectedMembers.filter(id => id !== user.id);
  //   } else {
  //     this.selectedMembers.push(user.id);
  //   }
  // }

  // ######################################## Home #################################

  teams: TeamResponse[] = [];
  
 
  //  teamId!:any;
  //  index=0;
  

  // teamIds:number[]=new Array();
  // getAllUser(){
  //   debugger
  //   this.dataService.getAllTeamsWithUsersByUserId(this.getLoginDetailsId()).subscribe(data => {
  //     this.teams = data;

  //     console.log(this.teams);
  //   });
  // }

  // teams: TeamResponse[] = [];


  // userId = 117;
  //  index=0;


  getAllUser(){
    debugger
    this.dataService.getAllTeamsWithUsersByUserId(+this.getTeamDetailByUserId(), this.getTeamDetailByUserRole())
    .subscribe(data => {
      console.log(this.getLoginDetailsId(), this.getLoginDetailsRole());
      this.teams = data;
      console.log(this.teams);
    });
  }

  getTeamDetailByUserId(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      return loginData.id;
    }
  }

  getTeamDetailByUserRole(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);

      return loginData.role;

    }
  }

  getLoginDetailsId(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);

      return loginData.id;

    }
  }

  getLoginDetailsRole(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      return loginData.role;
    }
  }

  routeToTeamDetails(id:number){
    let navExtra : NavigationExtras = {
      queryParams : {"teamId" : id},
    };
    this.router.navigate(['/dynamic/team-detail'], navExtra);
  }
  
  capitalizeFirstLetter(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return name; 
  }
  
}

