import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { User } from 'src/app/models/user';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TeamResponse } from 'src/app/models/team';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';
import { ModalService } from 'src/app/services/modal.service';
import { HelperService } from 'src/app/services/helper.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import * as uuid from 'uuid';
import { Key } from 'src/app/constant/key';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { TeamLocation } from 'src/app/models/team-location';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { NgForm } from '@angular/forms';
import { Routes } from 'src/app/constant/Routes';

export class RegisterTeamRequest {
  userUuids!: string[];
  managerUuid!: string;
  teamLocationRequest!: TeamLocation;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
})
export class TeamComponent implements OnInit {
  teamName: string = '';
  teamDescription: string = '';
  teamsNew: TeamResponse[] = [];
  filteredUsers: Users[] = [];
  itemPerPage: number = 12;
  pageNumber: number = 1;
  total!: number;
  rowNumber: number = 1;
  teams: TeamResponse[] = [];

  loginDetails = this.helperService.getDecodedValueFromToken();
  readonly Routes=Routes;
  async assignRole() {
    this.orgRefId = this.rbacService.getOrgRefUUID();
  }
  orgRefId: any;
  ROLE: any;
  onboardingVia: string = '';
  logInUserUuid: string = '';
  showManagerTickForUuid: string = '';
  addTeamFlag: boolean = false;

  async ngOnInit(): Promise<void> {
    window.scroll(0, 0);
    this.assignRole();
    this.ROLE = await this.rbacService.getRole();
    this.logInUserUuid = await this.rbacService.getUUID();
    this.getTeamsByFiltersFunction();
    this.getUsersRoleFromLocalStorage();
    const localStorageUniqueUuid = localStorage.getItem('uniqueId');
    if (localStorageUniqueUuid) {
      this.uniqueUuid = localStorageUniqueUuid;
      this.getFirebase();
    }

    const localStorageUniqueSlackUuid = localStorage.getItem('uniqueUuid');
    if (localStorageUniqueSlackUuid) {
      this.uniqueUuid = localStorageUniqueSlackUuid;
      this.getFirebaseDataOfReload();
    }
    this.getOnboardingVia();
  }

  constructor(
    private router: Router,
    public dataService: DataService,
    private activateRoute: ActivatedRoute,
    private modalService: ModalService,
    private helperService: HelperService,
    private db: AngularFireDatabase,
    public rbacService: RoleBasedAccessControlService
  ) {
    this.Settings = {
      singleSelection: false,
      text: 'Select Module',
      enableSearchFilter: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
    };
  }

  // ############################



  getOnboardingVia() {
    debugger;
    this.dataService.getOrganizationDetails().subscribe(
      (data) => {
        this.onboardingVia = data.organization.onboardingVia;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  openModal() {
    this.modalService.openModal();
  }

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
  userListManager: User[] = [];
  selectedUsers: User[] = [];
  userIds: string[] = [];

  searchUsers() {
    if (this.searchQuery == '') {
      this.userList = [];
    }
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

  searchQueryManager: string = '';

  searchUsersManager() {
    if (this.searchQueryManager == '') {
      this.userListManager = [];
    }
    this.dataService
      .getUsersByFilter(
        this.itemPerPage,
        this.pageNumber,
        'asc',
        'id',
        this.searchQueryManager,
        'name',
        0
      )
      .subscribe((data: any) => {
        this.userListManager = data.users;
        this.total = data.count;
      });
  }

  selectedManager: User | null = null;
  managerId: string = '';
  toggleUserSelectionManager(user: User) {
    // const index =  u.uuid === user.uuid);
    this.selectedManager = user;
    this.managerId = user.uuid;

    this.userListManager = [];
    this.searchQueryManager = '';
  }

  removeSelectedUserOfSelectionManager(user: User) {
    this.selectedManager = null;
  }

  toggleUserSelection(user: User) {
    const index = this.selectedUsers.findIndex((u) => u.uuid === user.uuid);
    if (index === -1) {
      this.selectedUsers.push(user);
      this.userIds.push(user.uuid);
    } else {
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

  @ViewChild('closeCreateTeam') closeCreateTeam!: ElementRef;

  locationEnabled: boolean = false;
  teamLocationRequest: TeamLocation = new TeamLocation();
  // registerTeamRequest: RegisterTeamRequest = new RegisterTeamRequest();
  registerTeamRequest: RegisterTeamRequest = {
    userUuids: [],
    managerUuid: '',
    teamLocationRequest: new TeamLocation(),
  };

  getDefaultTeamLocation(): TeamLocation {
    return {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      longitude: '',
      latitude: '',
      range: '',
    };
  }

  registerTeamSubmitButton() {
    debugger;
    this.registerTeamRequest.userUuids = this.userIds;
    this.registerTeamRequest.managerUuid = this.managerId;

    if (this.locationEnabled && this.teamLocationRequest) {
      this.registerTeamRequest.teamLocationRequest = this.teamLocationRequest;
    } else {
      this.registerTeamRequest.teamLocationRequest = new TeamLocation();
    }

    this.dataService
      .registerTeam(
        this.teamName,
        this.teamDescription,
        this.registerTeamRequest
      )
      .subscribe(
        (data) => {
          this.locationEnabled = false;
          this.teamLocationRequest = new TeamLocation();
          this.teamName = '';
          this.teamDescription = '';
          this.userIds = [];
          this.managerId = '';
          this.userList = [];
          this.userListManager = [];
          this.selectedManager = null;
          this.selectedUsers = [];
          this.total = 0;
          this.registerTeamRequest.userUuids = [];
          this.closeCreateTeam.nativeElement.click();
          this.getTeamsByFiltersFunction();
          this.helperService.showToast(
            'Team saved successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          // location.reload();
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  

  // ######################################## Home #################################



  getAllUser() {
    this.dataService.getAllTeamsWithUsersByUserId().subscribe((data) => {
      // console.log(this.getLoginDetailsId(), this.getLoginDetailsRole());
      this.teams = data;
      // console.log(this.teams);
    });
  }

  routeToTeamDetails(uuid: string, managerId: string) {
    if (managerId !== 'noManager') {
      let navExtra: NavigationExtras = {
        queryParams: { teamId: uuid, Id: managerId },
        // queryParams : {"teamId" : uuid},
      };
      this.router.navigate(['/team-detail'], navExtra);
    } else if (managerId == 'noManager') {
      let navExtra: NavigationExtras = {
        // queryParams : {"teamId" : uuid, "Id": managerId},
        queryParams: { teamId: uuid },
      };
      this.router.navigate(['/team-detail'], navExtra);
    }
  }

  capitalizeFirstLetter(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return name;
  }

  //  new ############################################33

  localStorageRoleAdminFlag = false;

  getUsersRoleFromLocalStorage() {
    // const loginDetails = localStorage.getItem('loginData');
    //  if(loginDetails!==null){
    //   const loginData = JSON.parse(loginDetails);

    if (this.ROLE == 'ADMIN') {
      this.localStorageRoleAdminFlag = true;
    } else {
      this.localStorageRoleAdminFlag = false;
    }
  }

  capitalizeFirstLetterAndSmallOtherLetters(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return name;
  }

  @ViewChild('assignManagerModalCloseButton')
  assignManagerModalCloseButton!: ElementRef;

  assignManagerRoleToMemberMethodCall(teamId: string, userId: string) {
    debugger;
    this.dataService.assignManagerRoleToMember(teamId, userId).subscribe(
      (data) => {
        // const managerdata = {
        //   teamUuid: teamId,
        //   managerId: data.manager.uuid,
        // };
        // localStorage.setItem('managerFunc', JSON.stringify(managerdata));
        this.assignManagerModalCloseButton.nativeElement.click();
        this.getTeamsByFiltersFunction();
        this.helperService.showToast(
          'Manager assigned successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
        // location.reload();
      },
      (error) => {
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        // this.assignManagerModalCloseButton.nativeElement.click();
        // this.getTeamsByFiltersFunction();
        // location.reload();
      }
    );
  }

  assignMemberRoleToManagerMethodCall(teamId: string, userId: string) {
    debugger;
    if (localStorage.getItem('managerFunc')) {
      localStorage.removeItem('managerFunc');
    } else {
    }
    this.dataService.assignMemberRoleToManager(teamId, userId).subscribe(
      (data) => {
        // localStorage.removeItem('managerFunc');
        location.reload();
      },
      (error) => {
        location.reload();
      }
    );
  }

  exitUserFromTeamLoader: boolean = false;
  @ViewChild('closeUserDeleteModal') closeUserDeleteModal!: ElementRef;

  removeUserFromTeam(teamId: string, userId: string) {
    this.exitUserFromTeamLoader = true;
    this.dataService.removeUserFromTeam(teamId, userId).subscribe(
      (response) => {
        this.exitUserFromTeamLoader = false;
        this.getTeamsByFiltersFunction();
        this.closeUserDeleteModal.nativeElement.click();
        this.helperService.showToast(
          'Exited from team successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.exitUserFromTeamLoader = false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  teamIid: any;
  userIid: any;

  toGetTeamId(teamUuid: string) {
    debugger;
    this.teamIid = teamUuid;
    this.getTeamMemberById();
  }
  team: any = [];

  getTeamMemberById() {
    debugger;
    this.dataService.getTeamsById(this.teamIid).subscribe((data) => {
      debugger;
      this.team = data;
    });
  }

  deleteTeamByTeamId(teamId: number) {
    this.dataService.deleteTeam(teamId).subscribe(
      (response) => {
        this.getTeamsByFiltersFunction();
        // location.reload();
        this.helperService.showToast(
          'Team Deleted Successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        // console.error(error);
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        // location.reload();
      }
    );
  }

  slackFirstPlaceholderFlag: boolean = false;
  getFlagOfSlackPlaceholder() {
    this.slackFirstPlaceholderFlag = true;
    this.saveSlackChannelsDataToTeam();
  }
  getFlagOfSlackPlaceholder2() {
    this.slackFirstPlaceholderFlag = false;
    this.saveSlackChannelsDataToTeam();
  }

  rotateToggle: boolean = false;
  newRotateToggle: boolean = false;
  slackDataPlaceholderFlag: boolean = false;

  saveSlackChannelsDataToTeam() {
    debugger;
    this.rotateToggle = true;
    // localStorage.setItem("rotateToggle", this.rotateToggle.toString());
    this.newRotateToggle = true;
    this.percentage = 0;
    // this.dataService.slackDataPlaceholderFlag = true;
    // setTimeout(()=>{
    //   this.rotateToggle = false;
    // }, 100000)
    this.uniqueUuid = uuid.v4();
    if (this.slackFirstPlaceholderFlag == true) {
      localStorage.setItem('uniqueId', this.uniqueUuid);
      this.getFirebase();
      this.slackDataPlaceholderFlag == false;
    } else if (this.slackFirstPlaceholderFlag === false) {
      localStorage.setItem('uniqueUuid', this.uniqueUuid);
      this.getFirebaseDataOfReload();
    }

    this.dataService.getSlackChannelsDataToTeam(this.uniqueUuid).subscribe(
      (response) => {
        this.newRotateToggle = false;
        // this.dataService.slackDataPlaceholderFlag = false;
        if (response) {
          setTimeout(() => {
            this.rotateToggle = false;
            // localStorage.removeItem('rotateToggle');
          }, 500);
        }
        this.getTeamsByFiltersFunction();
        // location.reload();
        if (localStorage.getItem('uniqueId')) {
          localStorage.removeItem('uniqueId');
          this.slackDataPlaceholderFlag == false;
        }
        if (localStorage.getItem('uniqueUuid')) {
          localStorage.removeItem('uniqueUuid');
        }
      },
      (error) => {
        this.rotateToggle = false;
        // console.error(error);
      }
    );
  }

  uniqueUuid: string = '';
  // basePath:"haziri_notific"+"/"+"organi_"+uuid+"/"+"user"+uuid+"/"+uniquesUUid
  percentage!: number;
  toggle: boolean = false;
  getFirebase() {
    this.slackDataPlaceholderFlag = true;
    // console.log(bulkId)
    this.db
      .object(
        'hajiri_notification' +
          '/' +
          'organization_' +
          this.orgRefId +
          '/' +
          'user_' +
          this.logInUserUuid +
          '/' +
          this.uniqueUuid
      )
      .valueChanges()
      .subscribe(async (res) => {
        //@ts-ignore
        var res = res;

        //@ts-ignore
        this.percentage = res.percentage;

        //@ts-ignore
        if (res != undefined && res != null) {
          //@ts-ignore
          if (res.flag == 1) {
            this.slackDataPlaceholderFlag = false;
            localStorage.removeItem('uniqueId');
            this.getTeamsByFiltersFunction();
          }
        }
      });
  }

  firebaseDataReloadFlag = false;
  showNotification = false;

  getFirebaseDataOfReload() {
    this.showNotification = false;
    this.firebaseDataReloadFlag = true;
    this.rotateToggle = true;
    // console.log(bulkId)
    this.db
      .object(
        'hajiri_notification' +
          '/' +
          'organization_' +
          this.orgRefId +
          '/' +
          'user_' +
          this.logInUserUuid +
          '/' +
          this.uniqueUuid
      )
      .valueChanges()
      .subscribe(async (res) => {
        //@ts-ignore
        var res = res;

        //@ts-ignore
        this.percentage = res.percentage;

        //@ts-ignore
        if (res != undefined && res != null) {
          //@ts-ignore
          if (res.flag == 1) {
            this.firebaseDataReloadFlag = false;
            this.rotateToggle = false;
            localStorage.removeItem('uniqueUuid');
            this.showNotification = true;
            setTimeout(() => {
              this.showNotification = false;
            }, 2000);

            this.getTeamsByFiltersFunction();
          }
        }
      });
  }

  // #########################################33 pagination

  // team.component.ts

  isShimmer: boolean = false;
  isPlaceholder: boolean = false;
  errorToggleTeam: boolean = false;
  debounceTimer: any;
  getTeamsByFiltersFunction(debounceTime: number = 300) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.isShimmer = true;
    this.debounceTimer = setTimeout(() => {
      this.dataService
        .getTeamsByFilter(
          this.itemPerPage,
          this.pageNumber,
          this.searchText,
          'name',
          'name',
          'ASC'
        )
        .subscribe(
          (data: any) => {
            if (data) {
              this.teamsNew = data.teams;
              this.total = data.count;

              this.teamsNew.forEach((team) => {
                team.showTick =
                  team.manager && team.manager.uuid === this.logInUserUuid;
                team.exitFromTeam = team.userList.some(
                  (user) => user.uuid === this.logInUserUuid
                );
              });

              if (this.teamsNew == null) {
                this.teamsNew = [];
                this.total = 0;
                this.searchTeamPlaceholderFlag = false;
              }
            } else {
              this.teamsNew = [];
              this.total = 0;
              // console.error("Invalid data format received from the server");
            }
            this.isShimmer = false;
            // this.crossFlag=false;
          },
          (error) => {
            this.isShimmer = false;
            this.errorToggleTeam = true;
          }
        );
    }, debounceTime);
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    this.getTeamsByFiltersFunction();
  }

  searchText: string = '';

  searchTeamPlaceholderFlag: boolean = false;
  crossFlag: boolean = false;
  resetCriteriaFilter() {
    this.itemPerPage = 12;
    this.pageNumber = 1;
  }
  searchTeams() {
    this.crossFlag = true;
    this.searchTeamPlaceholderFlag = true;
    this.resetCriteriaFilter();
    this.getTeamsByFiltersFunction();
    if (this.searchText == '') {
      this.crossFlag = false;
    }
  }
  // reloadPage() {
  //   location.reload();
  //   this.crossFlag=false;
  // }
  reloadPage() {
    this.searchText = '';
    this.getTeamsByFiltersFunction();
    this.crossFlag = false;
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

  delUserUuid: string = '';
  delUserFromTeamUuid: string = '';

  @ViewChild('deleteConfirmationModal') deleteConfirmationModal: any;

  openDeleteConfirmationModal(teamUuid: string, userUuid: string) {
    this.delUserUuid = userUuid;
    this.delUserFromTeamUuid = teamUuid;
  }
  // deleteUserFromTeamLoader:boolean=false;

  exitUserFromTeam() {
    if (this.delUserUuid !== null && this.delUserFromTeamUuid != null) {
      this.removeUserFromTeam(this.delUserFromTeamUuid, this.delUserUuid);
      this.delUserUuid = '';
      this.delUserFromTeamUuid = '';
    }
  }

  closeDeleteModal() {
    this.deleteConfirmationModal.nativeElement.click();
  }

  routeToUserDetails(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    // this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], navExtra);
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
    return;
  }

  // new code

  @ViewChild('placesRef') placesRef!: GooglePlaceDirective;

  public handleAddressChange(e: any) {
    debugger;
    // var id = this.organizationAddressDetail.id;
    this.teamLocationRequest = new TeamLocation();
    this.teamLocationRequest.longitude = e.geometry.location.lng();
    this.teamLocationRequest.latitude = e.geometry.location.lat();

    // console.log(e.geometry.location.lat());
    // console.log(e.geometry.location.lng());
    this.teamLocationRequest.addressLine1 = e.name + ', ' + e.vicinity;

    e?.address_components?.forEach((entry: any) => {
      // console.log(entry);

      if (entry.types?.[0] === 'route') {
        this.teamLocationRequest.addressLine2 = entry.long_name + ',';
      }
      if (entry.types?.[0] === 'sublocality_level_1') {
        this.teamLocationRequest.addressLine2 =
          this.teamLocationRequest.addressLine2 + entry.long_name;
      }
      if (entry.types?.[0] === 'locality') {
        this.teamLocationRequest.city = entry.long_name;
      }
      if (entry.types?.[0] === 'administrative_area_level_1') {
        this.teamLocationRequest.state = entry.long_name;
      }
      if (entry.types?.[0] === 'country') {
        this.teamLocationRequest.country = entry.long_name;
      }
      if (entry.types?.[0] === 'postal_code') {
        this.teamLocationRequest.pincode = entry.long_name;
      }
    });
  }

  @ViewChild('createteam')
  createteam!: ElementRef;
  @ViewChild('teamLocationss')
  teamLocationss!: ElementRef;
  @ViewChild('closeTeamLocationModal') closeTeamLocationModal!: ElementRef;
  toggleModals() {
    // this.closeCreateTeam.nativeElement.click();
    this.teamLocationss.nativeElement.click();
  }

  modal2toggle: boolean = false;
  reopenCreateTeamModal() {
    // console.log('Checking team location request:', this.teamLocationRequest);

    // Check that required properties are not empty
    if (
      this.teamLocationRequest &&
      this.teamLocationRequest.addressLine1 &&
      this.teamLocationRequest.city &&
      this.teamLocationRequest.state &&
      this.teamLocationRequest.country &&
      this.teamLocationRequest.pincode
    ) {
      // console.log('Valid team location request found, closing the modal.');

      // Reset location toggle switch
      this.locationEnabled = true;
      this.modal2toggle = true;
      this.createteam.nativeElement.click();
      this.refreshTeamLocationsForm(false);
      // Close the current modal
      // this.closeTeamLocationModal.nativeElement.click();
    } else {
      this.locationEnabled = false;
      // this.modal2toggle = false;
      // this.teamLocationss.nativeElement.click();
      console.warn('Incomplete team location request data.');
    }
  }

  // locationEnabled: boolean = false;

  handleLocationToggle() {
    if (this.locationEnabled) {
      this.teamLocationss.nativeElement.click();
    } else {
      this.locationEnabled = false;
      this.teamLocationRequest = new TeamLocation();
      // this.createteam.nativeElement.click();
    }
  }

  refreshTeamLocationsForm(flag: boolean) {
    if (flag) {
      this.locationEnabled = false;
      this.teamLocationRequest = new TeamLocation();
      this.createteam.nativeElement.click();
    } else {
      this.createteam.nativeElement.click();
    }
  }

  submit() {
    debugger;
    this.checkFormValidation();

    if (this.isFormInvalid == true) {
      return;
    } else {
      this.reopenCreateTeamModal();
    }
  }
  isFormInvalid: boolean = false;
  @ViewChild('teamLocationForm') teamLocationForm!: NgForm;
  checkFormValidation() {
    if (this.teamLocationForm.invalid) {
      this.isFormInvalid = true;
      return;
    } else {
      this.isFormInvalid = false;
    }
  }


}
