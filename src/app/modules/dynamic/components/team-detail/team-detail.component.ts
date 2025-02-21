import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { Key } from 'src/app/constant/key';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css'],
})
export class TeamDetailComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private activateRoute: ActivatedRoute,
    private helperService: HelperService,
    private router: Router,
    private rbacService: RoleBasedAccessControlService
  ) {
    debugger;
    if (this.activateRoute.snapshot.queryParamMap.has('teamId')) {
      this.teamId = this.activateRoute.snapshot.queryParamMap.get('teamId');
    }

    if (this.activateRoute.snapshot.queryParamMap.has('Id')) {
      this.managerId = this.activateRoute.snapshot.queryParamMap.get('Id');
    }
    this.Settings = {
      singleSelection: false,
      text: 'Select Module',
      enableSearchFilter: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
    };
  }
  managerId: any;
  role: any;
  userUuid: any;
  orgRefId: any;

  async ngOnInit(): Promise<void> {
    window.scroll(0, 0);
    this.role = await this.rbacService.getRole();
    this.userUuid = await this.rbacService.getUUID();
    this.assignRole();
    this.getLoginDetailsId();
    this.getTeamMemberById();
    this.getUsersRoleFromLocalStorage();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
  }

  // ngAfterViewInit() {
  //   this.getLoginDetailsId();
  // }

  async assignRole() {
    // this.role =   this.rbacService.getRole();
    // this.userUuid = this.rbacService.getUUID();
    this.orgRefId = this.rbacService.getOrgRefUUID();
  }

  teamId: any;
  team: any = [];

  managerIdFlag = false;

  getTeamMemberById() {
    debugger;
    this.dataService.getTeamsById(this.teamId).subscribe((data) => {
      debugger;
      this.team = data;
      this.managerId = data.manager.uuid;
      // if(data.manager!==null){
      //   const managerdata = {
      //     teamUuid: this.teamId,
      //     managerId: data.manager.uuid,
      //   };
      //   localStorage.setItem('managerFunc', JSON.stringify(managerdata));
      // }
    });
  }

  getLoginDetailsId() {
    debugger;
    if (this.managerId == this.userUuid) {
      this.managerIdFlag = true;
    } else {
      this.managerIdFlag = false;
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
  itemPerPage: number = 5;
  pageNumber: number = 1;
  total!: number;
  teamName: string = '';

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

  PRESENT = Key.PRESENT;
  ABSENT = Key.ABSENT;
  UNMARKED = Key.UNMARKED;
  WEEKEND = Key.WEEKEND;
  HOLIDAY = Key.HOLIDAY;

  ROLE = this.rbacService.getRole();

  ADMIN = Key.ADMIN;
  MANAGER = Key.MANAGER;
  USER = Key.USER;

  searchUsers() {
    if (this.searchQuery === '') {
      this.userList = [];
      this.total = 0;
    } else {
      this.dataService
        .getUsersByFilter(
          this.itemPerPage,
          this.pageNumber,
          'asc',
          'id',
          this.searchQuery,
          'name',
          0
        )
        .subscribe((data: any) => {
          this.userList = data.users;
          this.total = data.count;
        });
    }
  }

  toggleUserSelection(user: User) {
    const index = this.selectedUsers.findIndex((u) => u.uuid === user.uuid);
    if (index === -1) {
      this.selectedUsers.push(user);
      this.userIds.push(user.uuid);

      this.userEmails.push(user.email);
    } else {
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

  inviteUsers() {
    debugger;
    this.dataService.sendInviteToUsers(this.userEmails, this.teamId).subscribe(
      (data) => {
       
        Swal.fire({
          position: 'bottom-start',
          customClass: {
            popup: 'custom-popup',
          },
          icon: 'success',
          title: 'Mail sent successfully!',
          showConfirmButton: false,
          timer: 1500,
        });
        this.getTeamMemberById();
        this.helperService.showToast(
          'Mail Sent Successfully To ' + this.userEmails,
          Key.TOAST_STATUS_SUCCESS
        );
         this.userEmails = [];
        this.selectedUsers = [];
      },
      (error) => {
        this.helperService.showToast("Please Contact To Your Admin", Key.TOAST_STATUS_ERROR);
      }
    );
  }

  assignManagerRoleToMemberMethodCall(teamUuid: string, userUuid: string) {
    debugger;
    this.dataService.assignManagerRoleToMember(teamUuid, userUuid).subscribe(
      (data) => {
        this.managerId = userUuid;
        this.getUsersRoleFromLocalStorage();

        let navExtra: NavigationExtras = {
          queryParams: { teamId: teamUuid, Id: userUuid },
        };
        this.router.navigate(['/team-detail'], navExtra);

        if (this.managerId == this.userUuid) {
          this.managerIdFlag = true;
        } else {
          this.managerIdFlag = false;
        }
        this.getTeamMemberById();
        // location.reload();
        this.helperService.showToast(
          'Manager assigned successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  assignMemberRoleToManagerMethodCall(teamUuid: string, userUuid: string) {
    debugger;
    // if (localStorage.getItem('managerFunc')) {
    //   localStorage.removeItem('managerFunc');
    // } else {
    // }
    this.dataService.assignMemberRoleToManager(teamUuid, userUuid).subscribe(
      (data) => {
        // localStorage.removeItem('managerFunc');
        this.managerId = userUuid;
        this.getUsersRoleFromLocalStorage();

        let navExtra: NavigationExtras = {
          queryParams: { teamId: teamUuid },
        };
        this.router.navigate(['/team-detail'], navExtra);

        if (this.managerId == this.userUuid) {
          this.managerIdFlag = false;
        } else {
          this.managerIdFlag = true;
        }
        this.getTeamMemberById();
        // location.reload();
        this.helperService.showToast(
          'Manager removed successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  localStorageRoleAdminFlag = false;

  getUsersRoleFromLocalStorage() {
    // console.log("role" + this.role);
    debugger;
    if (this.role == this.ADMIN) {
      this.localStorageRoleAdminFlag = true;
    } else if (this.role == this.USER || this.role == this.MANAGER) {
      this.localStorageRoleAdminFlag = false;
    }
  }
  @ViewChild('closeUserDeleteModal') closeUserDeleteModal!: ElementRef;
  removeUserFromTeam(teamUuid: string, userUuid: string) {
    debugger;
    this.deleteUserFromTeamLoader = true;
    this.dataService.removeUserFromTeam(teamUuid, userUuid).subscribe(
      (response) => {
        if (this.managerId == userUuid) {
          let navExtra: NavigationExtras = {
            queryParams: { teamId: teamUuid },
          };
          this.router.navigate(['/team-detail'], navExtra);
        }
        this.deleteUserFromTeamLoader = false;
        if (this.managerId == userUuid) {
          this.managerIdFlag = false;
        } else {
          this.managerIdFlag = true;
        }
        // location.reload();
        this.getTeamMemberById();
        this.closeUserDeleteModal.nativeElement.click();
        this.helperService.showToast(
          'User removed successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.deleteUserFromTeamLoader = false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
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

  showErrorMessageForPresentMembersInTeam = false;
  //   showErrorMessageForPresentMembersInTeamFun(){

  //     this.showErrorMessageForPresentMembersInTeam = true;
  //     setTimeout(() => {
  //       this.showErrorMessageForPresentMembersInTeam = false;
  //     }, 1000);

  // }

  alreadyAddedEmails: string[]= [];
  addUsersToTeam() {
    debugger
    if (this.userIds.length > 0) {
      const tid = this.teamId;
      this.dataService.addUsersToTeam(tid, this.userIds).subscribe(
        (response: any) => {
          // console.log("retunred value " + response.object);
          this.alreadyAddedEmails = response.object;

          // Remove already added emails from userEmails
          if (this.alreadyAddedEmails.length > 0) {
            this.userEmails = this.userEmails.filter(
              email => !this.alreadyAddedEmails.includes(email)
            );
          }
          // this.inviteUsers();
          this.selectedUsers = [];
          this.userIds = [];

          if (this.userEmails.length > 0) {
            this.inviteUsers();
          } else {
            this.helperService.showToast(
          'The user has already been added to the team.',
          Key.TOAST_STATUS_SUCCESS
        );
          }
          // location.reload();
        },
        (error) => {
          // this.showErrorMessageForPresentMembersInTeam=true;
          // this.inviteUsers();
          console.log(error);
        }
      );
    } else {
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
    // this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], navExtra);
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
    return;
  }

  delUserUuid: string = '';
  delUserFromTeamUuid: string = '';

  @ViewChild('deleteConfirmationModal') deleteConfirmationModal: any;

  openDeleteConfirmationModal(teamUuid: string, userUuid: string) {
    this.delUserUuid = userUuid;
    this.delUserFromTeamUuid = teamUuid;
  }
  deleteUserFromTeamLoader: boolean = false;
  deleteUserFromTeam() {
    debugger;
    if (this.delUserUuid !== null && this.delUserFromTeamUuid != null) {
      this.removeUserFromTeam(this.delUserFromTeamUuid, this.delUserUuid);
      this.delUserUuid = '';
      this.delUserFromTeamUuid = '';
    }
  }

  closeDeleteModal() {
    this.deleteConfirmationModal.nativeElement.click();
  }

  isProjectTab: boolean = false;
  isMessagesTab: boolean = false;
  isCalendarTab: boolean = false;
  isAboutTab: boolean = false;
  isGeneralTab: boolean = false;
  isAdvanceTab: boolean = false;
}
