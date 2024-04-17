import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { User } from 'src/app/models/user';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TeamResponse } from 'src/app/models/team';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamDetailComponent } from '../team-detail/team-detail.component';
import { ModalService } from 'src/app/modal.service';
import { HelperService } from 'src/app/services/helper.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import * as uuid from 'uuid';
import { Key } from 'src/app/constant/key';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

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
  itemPerPage : number = 12;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;

  loginDetails = this.helperService.getDecodedValueFromToken();
  async assignRole(){
    // this.role =  await this.rbacService.getRole();
    // this.userUuid = await this.rbacService.getUUID();
    this.orgRefId = this.rbacService.getOrgRefUUID();
  }
  // role: any;
  // userUuid : any;
  orgRefId : any;
  ROLE: any;
  onboardingVia:string = '';
  logInUserUuid: string="";
  showManagerTickForUuid: string = '';

  async ngOnInit(): Promise<void> {
  // this.getAllUsersByFiltersFunction();
  this.assignRole();
  // this.getAllUser();
  this.ROLE = await this.rbacService.getRole();
  this.logInUserUuid = await this.rbacService.getUUID();
  this.getTeamsByFiltersFunction();
  this.getUsersRoleFromLocalStorage();
  // const localStorageFlag = localStorage.getItem(this.localStorageKey);
    const localStorageUniqueUuid = localStorage.getItem('uniqueId');
    if(localStorageUniqueUuid){
      this.uniqueUuid = localStorageUniqueUuid;
      this.getFirebase();
    }

    const localStorageUniqueSlackUuid = localStorage.getItem('uniqueUuid');
    if(localStorageUniqueSlackUuid){
      this.uniqueUuid = localStorageUniqueSlackUuid;
      this.getFirebaseDataOfReload();
    }

    // const localStorageRotateToggle = localStorage.getItem('rotateToggle');
    // if(localStorageRotateToggle){
    //   this.rotateToggle = true;
    // }



  // if (!localStorageFlag && this.localStorageRoleAdminFlag==true) {
  //   this.saveSlackChannelsDataToTeam(); 
  //   localStorage.setItem(this.localStorageKey, 'true');
  // }
   
   this.getOnboardingVia();
  }

  constructor(private router : Router, public dataService: DataService,  private activateRoute : ActivatedRoute, private modalService: ModalService, private helperService: HelperService, private db: AngularFireDatabase, private rbacService:RoleBasedAccessControlService) { 
    this.Settings = {
      singleSelection: false,
      text: 'Select Module',
      enableSearchFilter: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
    };
  }

  // ############################


  // showManagerTick(uuid: string) {
  //   this.showManagerTickForUuid = uuid;
  // }

  
  addTeamFlag: boolean = false;

  // openTeamModal(teamId: number) {
  //   this.router.navigate(['/team-detail'], { queryParams: { teamId: teamId } });
  //   // this.openModal();

  // }

  getOnboardingVia(){
    debugger
    this.dataService.getOrganizationDetails().subscribe((data)=> {
      this.onboardingVia = data.organization.onboardingVia;
      }, (error) => {
        console.log(error);
      });
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
  userIds: string[] = [];

  
  searchUsers() {
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchQuery,'name').subscribe((data : any) => {
      this.userList = data.users;
      this.total = data.count;
    });
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

  @ViewChild("closeCreateTeam") closeCreateTeam!:ElementRef;

  registerTeamSubmitButton(){
    // console.log(+this.getLoginDetailsOrgRefId());
    debugger
    this.dataService.registerTeam(this.userIds,this.teamName,this.teamDescription).subscribe((data) => {

      debugger
      // location.reload();
      this.closeCreateTeam.nativeElement.click();
      this.getTeamsByFiltersFunction();
      this.helperService.showToast("Team saved successfully.", Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      // location.reload();
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);

    })
  }


  // getLoginDetailsOrgRefId(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if(loginDetails!==null){
  //     const loginData = JSON.parse(loginDetails);
  //     return loginData.orgRefId;
  //   }
  // }
  

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
    this.dataService.getAllTeamsWithUsersByUserId()
    .subscribe(data => {
      // console.log(this.getLoginDetailsId(), this.getLoginDetailsRole());
      this.teams = data;
      // console.log(this.teams);
    });
  }

  // getTeamDetailByUserId(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if(loginDetails!==null){
  //     const loginData = JSON.parse(loginDetails);
  //     return loginData.id;
  //   }
  // }

  // getTeamDetailByUserRole(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if(loginDetails!==null){
  //     const loginData = JSON.parse(loginDetails);

  //     return loginData.role;

  //   }
  // }

  // getLoginDetailsId(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if(loginDetails!==null){
  //     const loginData = JSON.parse(loginDetails);

  //     return loginData.id;

  //   }
  // }

  // getLoginDetailsRole(){
  //   const loginDetails = localStorage.getItem('loginData');
  //   if(loginDetails!==null){
  //     const loginData = JSON.parse(loginDetails);
  //     return loginData.role;
  //   }
  // }

  routeToTeamDetails(uuid:string, managerId:string){
    // console.log("managerId" + managerId);
    if(managerId!=='noManager'){
    let navExtra : NavigationExtras = {
      queryParams : {"teamId" : uuid, "Id": managerId},
      // queryParams : {"teamId" : uuid},
    };
    this.router.navigate(['/team-detail'], navExtra);

  }else if(managerId=='noManager'){
    let navExtra : NavigationExtras = {
      // queryParams : {"teamId" : uuid, "Id": managerId},
      queryParams : {"teamId" : uuid},
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

  localStorageRoleAdminFlag=false;
  
  getUsersRoleFromLocalStorage(){
    // const loginDetails = localStorage.getItem('loginData');
    //  if(loginDetails!==null){
    //   const loginData = JSON.parse(loginDetails);

      if(this.ROLE=='ADMIN'){
        this.localStorageRoleAdminFlag=true;
      }else{
        this.localStorageRoleAdminFlag=false;
      }
  }

  capitalizeFirstLetterAndSmallOtherLetters(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return name; 
  }

  @ViewChild("assignManagerModalCloseButton") assignManagerModalCloseButton!: ElementRef;

  assignManagerRoleToMemberMethodCall(teamId: string, userId: string) {
    debugger
    this.dataService.assignManagerRoleToMember(teamId,userId).subscribe((data) => {
      // const managerdata = {
      //   teamUuid: teamId,
      //   managerId: data.manager.uuid,
      // };
      // localStorage.setItem('managerFunc', JSON.stringify(managerdata));
      this.assignManagerModalCloseButton.nativeElement.click();
      this.getTeamsByFiltersFunction();
      this.helperService.showToast("Manager assigned successfully.", Key.TOAST_STATUS_SUCCESS);
      // location.reload();
    }, (error) => {
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      // this.assignManagerModalCloseButton.nativeElement.click();
      // this.getTeamsByFiltersFunction();
      // location.reload();
    })
  }

  assignMemberRoleToManagerMethodCall(teamId: string, userId: string){
    debugger
    if (localStorage.getItem('managerFunc')) {
      localStorage.removeItem('managerFunc');
    } else {
    }  
    this.dataService.assignMemberRoleToManager(teamId,userId).subscribe((data) => {
      // localStorage.removeItem('managerFunc');
      location.reload();
    }, (error) => {
      location.reload();
    })
  }

  exitUserFromTeamLoader:boolean=false;
  @ViewChild("closeUserDeleteModal") closeUserDeleteModal!:ElementRef;

  removeUserFromTeam(teamId: string, userId: string) {
    this.exitUserFromTeamLoader=true;
    this.dataService.removeUserFromTeam(teamId, userId)
      .subscribe(
        response => {
          this.exitUserFromTeamLoader=false;
          this.getTeamsByFiltersFunction();
          this.closeUserDeleteModal.nativeElement.click();
          this.helperService.showToast("Exited from team successfully.", Key.TOAST_STATUS_SUCCESS);

        },
        error => {
          this.exitUserFromTeamLoader=false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);

        }
      );
  }

  teamIid:any;
  userIid:any;

  toGetTeamId(teamUuid: string){
    debugger
    this.teamIid=teamUuid;
    this.getTeamMemberById();

  }
  team:any=[];
  
  getTeamMemberById(){
    debugger
    this.dataService.getTeamsById(this.teamIid)
    .subscribe(data => {
      debugger
      this.team = data;
    });
  }


  deleteTeamByTeamId(teamId: number){
    this.dataService.deleteTeam(teamId).subscribe(response =>{
        this.getTeamsByFiltersFunction();
        // location.reload();
        this.helperService.showToast("Team Deleted Successfully.", Key.TOAST_STATUS_SUCCESS);
    },error => {
      // console.error(error);
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      // location.reload();
    });
  }

  slackFirstPlaceholderFlag:boolean=false;
  getFlagOfSlackPlaceholder(){
    this.slackFirstPlaceholderFlag=true;
    this.saveSlackChannelsDataToTeam();
  }
  getFlagOfSlackPlaceholder2(){
    this.slackFirstPlaceholderFlag=false;
    this.saveSlackChannelsDataToTeam();
  }

  rotateToggle:boolean = false
  newRotateToggle: boolean = false;
  slackDataPlaceholderFlag:boolean=false;
  
  saveSlackChannelsDataToTeam(){
    debugger
    this.rotateToggle = true;
    // localStorage.setItem("rotateToggle", this.rotateToggle.toString());
    this.newRotateToggle = true;
    this.percentage=0;
    // this.dataService.slackDataPlaceholderFlag = true;
    // setTimeout(()=>{
    //   this.rotateToggle = false;
    // }, 100000)
   this.uniqueUuid= uuid.v4();
   if(this.slackFirstPlaceholderFlag==true){
   localStorage.setItem("uniqueId", this.uniqueUuid);
   this.getFirebase();
   this.slackDataPlaceholderFlag==false;
   }else if(this.slackFirstPlaceholderFlag===false){
   localStorage.setItem("uniqueUuid", this.uniqueUuid);
   this.getFirebaseDataOfReload();
   }

   
   
    this.dataService.getSlackChannelsDataToTeam(this.uniqueUuid).subscribe(response =>{
      this.newRotateToggle = false;
      // this.dataService.slackDataPlaceholderFlag = false;
      if(response){
        setTimeout(()=>{
        this.rotateToggle = false;
        // localStorage.removeItem('rotateToggle');
        }, 500)
        }
      this.getTeamsByFiltersFunction();
      // location.reload();
      if(localStorage.getItem('uniqueId')){
      localStorage.removeItem('uniqueId');
      this.slackDataPlaceholderFlag==false;
      }
      if(localStorage.getItem('uniqueUuid')){
      localStorage.removeItem('uniqueUuid');
      }

     
    }, error => {
      // console.error(error);
    })
  }

  uniqueUuid:string='';
  // basePath:"haziri_notific"+"/"+"organi_"+uuid+"/"+"user"+uuid+"/"+uniquesUUid
 percentage!:number;
 toggle:boolean=false;
  getFirebase()
  {
    this.slackDataPlaceholderFlag=true;
    // console.log(bulkId)
    this.db.object("hajiri_notification"+"/"+"organization_"+this.orgRefId+"/"+"user_"+this.logInUserUuid+"/"+this.uniqueUuid).valueChanges()
      .subscribe(async res => {

        //@ts-ignore
        var res = res;


        //@ts-ignore
        this.percentage = res.percentage; 


        //@ts-ignore
        if (res != undefined && res != null) {

          

           //@ts-ignore
          if(res.flag==1){
            this.slackDataPlaceholderFlag=false;
            localStorage.removeItem('uniqueId');
            this.getTeamsByFiltersFunction();
          }
        }
      });
  }

  firebaseDataReloadFlag=false;
  showNotification=false;

  getFirebaseDataOfReload()
  {
    this.showNotification=false;
    this.firebaseDataReloadFlag=true;
    this.rotateToggle=true;
    // console.log(bulkId)
    this.db.object("hajiri_notification"+"/"+"organization_"+this.orgRefId+"/"+"user_"+this.logInUserUuid+"/"+this.uniqueUuid).valueChanges()
      .subscribe(async res => {

        //@ts-ignore
        var res = res;


        //@ts-ignore
        this.percentage = res.percentage; 


        //@ts-ignore
        if (res != undefined && res != null) {

          

           //@ts-ignore
          if(res.flag==1){
            this.firebaseDataReloadFlag=false;
            this.rotateToggle=false;
            localStorage.removeItem('uniqueUuid');
            this.showNotification=true;
            setTimeout(()=>{
              this.showNotification=false;
            }, 2000)
            
            this.getTeamsByFiltersFunction();
          }
        }
      });
  }

  // #########################################33 pagination

  

  // team.component.ts

  isShimmer: boolean=false;
  isPlaceholder: boolean=false;
  errorToggleTeam:boolean=false;
  debounceTimer: any;
getTeamsByFiltersFunction(debounceTime: number = 300) {

  if (this.debounceTimer) {
    clearTimeout(this.debounceTimer);
}
  this.isShimmer=true;
  this.debounceTimer = setTimeout(() => { 
  this.dataService.getTeamsByFilter(
    this.itemPerPage,
    this.pageNumber,
    this.searchText,
    "name",
    "name",
    "ASC"
  ).subscribe((data: any) => {
    if (data) {
      this.teamsNew = data.teams;
      this.total = data.count;

      this.teamsNew.forEach(team => {
        team.showTick = team.manager && team.manager.uuid === this.logInUserUuid;
        team.exitFromTeam = team.userList.some(user => user.uuid === this.logInUserUuid);

      });

      if(this.teamsNew == null){
        this.teamsNew = [];
        this.total = 0;
        this.searchTeamPlaceholderFlag=false;
      }
    } else {
      this.teamsNew = [];
      this.total = 0;
      // console.error("Invalid data format received from the server");
    }
    this.isShimmer=false;
    // this.crossFlag=false;
  }, (error) => {
    this.isShimmer=false;
    this.errorToggleTeam=true;
  });
}, debounceTime);

}


  
  onTableDataChange(event : any)
  {
    this.pageNumber=event;
    this.getTeamsByFiltersFunction();
  }


  searchText : string = '';

  searchTeamPlaceholderFlag: boolean=false;
  crossFlag: boolean = false;
  resetCriteriaFilter(){
    this.itemPerPage = 12;
    this.pageNumber = 1;
  }
  searchTeams() {
    this.crossFlag=true;
    this.searchTeamPlaceholderFlag=true;
    this.resetCriteriaFilter();
    this.getTeamsByFiltersFunction();
    if(this.searchText== ''){
      this.crossFlag=false;
    }

  }
  // reloadPage() {
  //   location.reload();
  //   this.crossFlag=false;
  // }
  reloadPage(){
  this.searchText='';
  this.getTeamsByFiltersFunction();
  this.crossFlag=false;

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

delUserUuid: string='';
delUserFromTeamUuid: string='';

  @ViewChild('deleteConfirmationModal') deleteConfirmationModal: any;

  openDeleteConfirmationModal(teamUuid:string, userUuid: string) {
    this.delUserUuid = userUuid;
    this.delUserFromTeamUuid = teamUuid;
  }
  // deleteUserFromTeamLoader:boolean=false;

  exitUserFromTeam() {
    if (this.delUserUuid !== null && this.delUserFromTeamUuid !=null) {
      this.removeUserFromTeam(this.delUserFromTeamUuid, this.delUserUuid);
      this.delUserUuid = '';
      this.delUserFromTeamUuid='';
    }
  }

  closeDeleteModal() { 
    this.deleteConfirmationModal.nativeElement.click();
  }

  routeToUserDetails(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    this.router.navigate(['/employee-profile'], navExtra);
  }
  
}

