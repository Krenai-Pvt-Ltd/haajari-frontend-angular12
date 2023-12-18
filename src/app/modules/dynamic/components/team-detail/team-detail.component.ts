

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent implements OnInit {


  constructor(private dataService: DataService,
    private activateRoute : ActivatedRoute, private helperService : HelperService,  private router: Router) { 
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
  

  loginDetails = this.helperService.getDecodedValueFromToken();
  role:string = this.loginDetails.role;
  userUuid: string = this.loginDetails.uuid;
  orgRefId:string = this.loginDetails.orgRefId;

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

  teamId: any;

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
          teamUuid: this.teamId,
          managerId: data.manager.uuid,
        };
        localStorage.setItem('managerFunc', JSON.stringify(managerdata));
      }
      console.log(this.team);
    });
  }

  getLoginDetailsId(){
    debugger
    // const loginDetails = localStorage.getItem('loginData');
     const managerDetails =localStorage.getItem('managerFunc');
    if(managerDetails !== null){
      // const loginData = JSON.parse(loginDetails);
      const managerFunc = JSON.parse(managerDetails);

      console.log(managerFunc.managerId);
      console.log(this.userUuid);
      console.log(managerFunc.teamUuid);
      console.log(this.teamId);



      if((managerFunc.managerId==this.userUuid) && (managerFunc.teamUuid==this.teamId)){
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
  userIds: string[] = [];
  userEmails: string[] = [];

  
  searchUsers() {
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchQuery,'name').subscribe((data : any) => {
      this.userList = data.users;
      this.total = data.count;
      console.log(this.userList);
    });
  }

  toggleUserSelection(user: User) {
    const index = this.selectedUsers.findIndex((u) => u.uuid === user.uuid);
    if (index === -1) {
      this.selectedUsers.push(user);
      this.userIds.push(user.uuid);

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
      location.reload();

    })
  }


  assignManagerRoleToMemberMethodCall(teamUuid: string, userUuid: string) {
    this.dataService.assignManagerRoleToMember(teamUuid,userUuid).subscribe((data) => {
      console.log(data);
      const managerdata = {
        teamId: this.teamId,
        managerId: data.manager.id,
      };
      localStorage.setItem('managerFunc', JSON.stringify(managerdata));
    }, (error) => {
      console.log(error);
      window.location.reload();

    })
  }

  assignMemberRoleToManagerMethodCall(teamUuid: string, userUuid: string){
    debugger
    if (localStorage.getItem('managerFunc')) {
      localStorage.removeItem('managerFunc');
      console.log('managerFunc removed from localStorage');
    } else {
      console.log('managerFunc not found in localStorage');
    }  
    this.dataService.assignMemberRoleToManager(teamUuid,userUuid).subscribe((data) => {
      // localStorage.removeItem('managerFunc');
      console.log(data);
    }, (error) => {
      console.log(error);
      window.location.reload();

    })
  }

  localStorageRoleAdminFlag=false;
  
  getUsersRoleFromLocalStorage(){
    // const loginDetails = localStorage.getItem('loginData');
    //  if(loginDetails!==null){
    //   const loginData = JSON.parse(loginDetails);

      if(this.role=='ADMIN'){
        this.localStorageRoleAdminFlag=true;
      }else if(this.role=='USER'){
        this.localStorageRoleAdminFlag=false;
      }
  }

  removeUserFromTeam(teamUuid: string, userUuid: string) {
    this.dataService.removeUserFromTeam(teamUuid, userUuid)
      .subscribe(
        response => {
          console.log('Success:', response);
          location.reload();
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

  showErrorMessageForPresentMembersInTeam=false;
//   showErrorMessageForPresentMembersInTeamFun(){

//     this.showErrorMessageForPresentMembersInTeam = true;
//     setTimeout(() => {
//       this.showErrorMessageForPresentMembersInTeam = false;
//     }, 1000);

// }


  addUsersToTeam() {
    if (this.userIds.length > 0) {
      const tid = this.teamId; 
      this.dataService
        .addUsersToTeam(tid, this.userIds)
        .subscribe(
          (result) => {
            // this.inviteUsers(); 
            console.log(result);
            this.selectedUsers = [];
            this.userIds = [];
            location.reload();
          },
          (error) => {
            // this.showErrorMessageForPresentMembersInTeam=true;
            this.inviteUsers();
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
  
  

  routeToUserDetails(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    this.router.navigate(['/employee-profile'], navExtra);
  }

  
}
