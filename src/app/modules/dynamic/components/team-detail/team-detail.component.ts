

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

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
    this.getUsersRoleFromLocalStorage();
    // this.openModal();
  }

  ngAfterViewInit() {
    // ...
    this.getLoginDetailsId();
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

  managerIdFlag=false;

  getTeamMemberById(){
    debugger
    this.dataService.getTeamsById(this.teamId)
    .subscribe(data => {
      debugger
      this.team = data;
      if(data.manager!==null){
        const managerdata = {
          teamId: this.teamId,
          managerId: data.manager.id,
        };
        localStorage.setItem('managerFunc', JSON.stringify(managerdata));
      }
      console.log(this.team);
    });
  }

  getLoginDetailsId(){
    const loginDetails = localStorage.getItem('loginData');
     const managerDetails =localStorage.getItem('managerFunc');
    if(loginDetails !== null && managerDetails !== null){
      const loginData = JSON.parse(loginDetails);
      const managerFunc = JSON.parse(managerDetails);

      if((managerFunc.managerId==loginData.id) && (managerFunc.teamId==this.teamId)){
        this.managerIdFlag=true;
      }else{
        this.managerIdFlag=false;
      }

    }
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
      Swal.fire({
        position: 'bottom-left',
        icon: 'success',
        title: 'Mail sent successfully!',
        showConfirmButton: false,
        timer: 1500 
    });
    },(error) => {
      debugger
      this.userEmails = [];
      this.selectedUsers = [];
      Swal.fire({
        position: 'bottom-start',
        customClass: {
          popup: 'custom-popup', 
        },
        icon: 'success',
        title: 'Mail sent successfully!',
        showConfirmButton: false,
        timer: 1500 
      });
      console.log(error);
    })
  }


  assignManagerRoleToMemberMethodCall(teamId: number, userId: number) {
    this.dataService.assignManagerRoleToMember(teamId,userId).subscribe((data) => {
      console.log(data);
      const managerdata = {
        teamId: this.teamId,
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

  // addUserToTeam(teamId: number) {
  //   debugger
  //   this.dataService.addUsersToTeam(teamId,this.userIds).subscribe(
  //     response => {
  //       console.log(response);
  //     },
  //     error => {
  //       console.error(error);
  //     }
  //   );
  // }

  addUsersToTeam() {
    if (this.userIds.length > 0) {
      const tid = +this.teamId; 
      this.dataService
        .addUsersToTeam(tid, this.userIds)
        .subscribe(
          (result) => {
            console.log(result);
            this.selectedUsers = [];
            this.userIds = [];
            // location.reload();
          },
          (error) => {
            console.error(error);
          }
        );
    } else {
      console.error("No users selected for adding to the team.");
    }
  }
  
  

  // addUsersToTeam(teamId: number) {
  //   debugger
  //   // this.userIds=[];
  //   this.dataService
  //     .addUsersToTeam(teamId, this.userIds)
  //     .subscribe((result) => {
  //       console.log(result);

  //     });
  // }
  
  
  
}
