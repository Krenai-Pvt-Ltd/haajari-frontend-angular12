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
  // slackDataSaved: boolean = false;
  // localStorageKey: string = 'slackDataSaved';

  // itemPerPage : number = 5;
  // pageNumber : number = 1;
  // total !: number;
  teamName : string = '';
  teamDescription: string =''

  teamsNew : TeamResponse[] = [];
  filteredUsers : Users[] = [];
  itemPerPage : number = 6;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;
  

  ngOnInit(): void {
  // this.getAllUsersByFiltersFunction();
  // this.getAllUser();
  this. getTeamsByFiltersFunction();
  this.getUsersRoleFromLocalStorage();
  // const localStorageFlag = localStorage.getItem(this.localStorageKey);

  // if (!localStorageFlag && this.localStorageRoleAdminFlag==true) {
  //   this.saveSlackChannelsDataToTeam(); 
  //   localStorage.setItem(this.localStorageKey, 'true');
  // }
   
   
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
    this.router.navigate(['/team-detail'], { queryParams: { teamId: teamId } });
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
    console.log(+this.getLoginDetailsOrgRefId());
    debugger
    this.dataService.registerTeam(this.userIds,this.teamName,this.teamDescription, +this.getLoginDetailsOrgRefId()).subscribe((data) => {
      console.log(data);

      debugger
      // location.reload();
    }, (error) => {
      // location.reload();
      console.log(error);
    })
  }


  getLoginDetailsOrgRefId(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      return loginData.orgRefId;
    }
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
    this.dataService.getAllTeamsWithUsersByUserId(+this.getTeamDetailByUserId(), this.getTeamDetailByUserRole())
    .subscribe(data => {
      // console.log(this.getLoginDetailsId(), this.getLoginDetailsRole());
      this.teams = data;
      // console.log(this.teams);
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
    this.router.navigate(['/team-detail'], navExtra);
  }
  
  capitalizeFirstLetter(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return name; 
  }

  //  new ############################################33

  localStorageRoleAdminFlag=false;
  
  getUsersRoleFromLocalStorage(){
    const loginDetails = localStorage.getItem('loginData');
     if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);

      if(loginData.role=='ADMIN'){
        this.localStorageRoleAdminFlag=true;
      }else if(loginData.role=='USER'){
        this.localStorageRoleAdminFlag=false;
      }
    }
  }

  capitalizeFirstLetterAndSmallOtherLetters(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return name; 
  }

  assignManagerRoleToMemberMethodCall(teamId: number, userId: number) {
    this.dataService.assignManagerRoleToMember(teamId,userId).subscribe((data) => {
      console.log(data);
      const managerdata = {
        teamId: teamId,
        managerId: data.manager.id,
      };
      localStorage.setItem('managerFunc', JSON.stringify(managerdata));
    }, (error) => {
      console.log(error);
    })
  }

  assignMemberRoleToManagerMethodCall(teamId: number, userId: number){
    debugger
    if (localStorage.getItem('managerFunc')) {
      localStorage.removeItem('managerFunc');
      console.log('managerFunc removed from localStorage');
    } else {
      console.log('managerFunc not found in localStorage');
    }  
    this.dataService.assignMemberRoleToManager(teamId,userId).subscribe((data) => {
      // localStorage.removeItem('managerFunc');
      console.log(data);
    }, (error) => {
      console.log(error);
    })
  }

  removeUserFromTeam(teamId: number, userId: number) {
    this.dataService.removeUserFromTeam(teamId, userId)
      .subscribe(
        response => {
          console.log('Success:', response);
        },
        error => {
          console.error('Error:', error);
        }
      );
  }
  teamIid:any;
  userIid:any;

  toGetTeamId(teamId: number){
    debugger
    this.teamIid=teamId;
    console.log(this.teamIid);
    this.getTeamMemberById();

  }
  team:any=[];
  
  getTeamMemberById(){
    debugger
    this.dataService.getTeamsById(this.teamIid)
    .subscribe(data => {
      debugger
      this.team = data;
      console.log(this.team);
    });
  }


  deleteTeamByTeamId(teamId: number){
    this.dataService.deleteTeam(teamId, this.getLoginDetailsRole()).subscribe(response =>{
        console.log("Team Deleted Successfully");
        location.reload();
    },error => {
      console.error(error);
      // location.reload();
    });
  }

  saveSlackChannelsDataToTeam(){
    debugger
    this.dataService.getSlackChannelsDataToTeam(this.getLoginDetailsId()).subscribe(response =>{
      console.log("slack data saved to team successfully");
      location.reload();
    }, error => {
      console.error(error);
    })
  }

  // #########################################33 pagination

  

  // team.component.ts

  isShimmer: boolean=false;
  isPlaceholder: boolean=false;

getTeamsByFiltersFunction() {
  this.isShimmer=true;
  this.dataService.getTeamsByFilter(
    this.getLoginDetailsId(),
    this.getLoginDetailsRole(),
    this.itemPerPage,
    this.pageNumber,
    this.searchText,
    "name"
  ).subscribe((data: any) => {
    if (data) {
      this.teamsNew = data.teams;
      this.total = data.count;
      if(this.teamsNew == null){
        this.teamsNew = [];
        this.total = 0;
      }
    } else {
      this.teamsNew = [];
      this.total = 0;
      // Handle the case where the expected data structure is not received
      console.error("Invalid data format received from the server");
    }
    this.isShimmer=false;
  }, (error) => {
    this.isShimmer=false;
  });
}


  
  onTableDataChange(event : any)
  {
    this.pageNumber=event;
    this.getTeamsByFiltersFunction();
  }


  searchText : string = '';

  searchTeams() {
    this.getTeamsByFiltersFunction();
  }



changePage(page: number | string) {
  if (typeof page === 'number') {
    this.pageNumber = page;
  } else if (page === 'prev' && this.pageNumber > 1) {
    this.pageNumber--;
  } else if (page === 'next' && this.pageNumber < this.totalPages) {
    this.pageNumber++;
  }
  this.getTeamsByFiltersFunction();
}

getPages(): number[] {
  const totalPages = Math.ceil(this.total / this.itemPerPage);
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

get totalPages(): number {
  return Math.ceil(this.total / this.itemPerPage);
}

getStartIndex(): number {
  return (this.pageNumber - 1) * this.itemPerPage + 1;
}
getEndIndex(): number {
  const endIndex = this.pageNumber * this.itemPerPage;
  return endIndex > this.total ? this.total : endIndex;
}


  
}

