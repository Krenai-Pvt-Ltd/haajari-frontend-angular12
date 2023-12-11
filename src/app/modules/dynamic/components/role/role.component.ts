import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleRequest } from 'src/app/models/module-request';
import { UserAndControl } from 'src/app/models/user-and-control';
import { ModuleResponse } from 'src/app/models/module-response';
import { Role } from 'src/app/models/role';
import { RoleRequest } from 'src/app/models/role-request';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
isShimmer: boolean = true;


  constructor(private dataService : DataService, private router : Router) { }

  roles : Role[] = [];
  itemPerPage : number = 5;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;
  searchText : string = '';
  users : User[] = [];
  

  ngOnInit(): void {
    this.getUserAndControlRolesByFilterMethodCall();
    // this.getUsersByFilterMethodCall();
    this.call();
    // this.getAllRolesMethodCall();
  }

  selectedRole: any;
  selectedUser: any;

  // Method to update selectedRole
  selectRole(role: any) {
    this.selectedRole = role;
  }

  selectUser(user: any) {
    this.selectedUser = user;
  }

  selectUserAndControl(userAndControl: UserAndControl) {
    this.selectedUser = userAndControl.user;
    this.selectedRole = userAndControl.role;
  }

  userAndControlDetailVariable : UserAndControl = new UserAndControl();
  userAndControlDetailMethod(userAndControl : UserAndControl){
    this.userAndControlDetailVariable = userAndControl;
  }
  // # Data Table of roles
  getAllRolesMethodCall(){

    this.dataService.getAllRoles(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'', 0).subscribe((data) => {

      this.roles = data.object;
      this.total = data.totalItems;

      console.log(this.roles);
    }, (error) => {

      console.log(error);
    })
  }

  searchUsers(){
    this.getUserAndControlRolesByFilterMethodCall();
  }

  

  // # Modal Data
  name : string = '';
  description : string = '';
  moduleResponse : ModuleResponse[] = [];
  roleRequest : RoleRequest = new RoleRequest();
  moduleRequestList : ModuleRequest[] = [];

  showDataToModal(role : any){
    debugger

    if(role === null || role === undefined){
      this.roleRequest.id = 0;
    } else {
      this.roleRequest.id = role.id;
      this.roleRequest.name = role.name;
      this.roleRequest.description = role.description;
    }

    this.getSubModuleByRoleMethodCall();

  }

  getSubModuleByRoleMethodCall(){

    debugger;
    console.log(this.roleRequest.id);
    this.dataService.getSubModuleByRole(this.roleRequest.id).subscribe((data) => {

      this.moduleResponse = data;

      for(let i of this.moduleResponse){
        debugger
        const submodules = i.subModules;

        for(let j of submodules){
          const moduleRequest : ModuleRequest = new ModuleRequest();
          moduleRequest.subModuleId = j.id;
          moduleRequest.privilegeId = j.privilegeId;
          this.moduleRequestList.push(moduleRequest);
        }
      }
      console.log(this.moduleResponse);
    }, (error) => {

      console.log(error);
    })
  }


  @ViewChild('createRoleModalClose') createRoleModalClose !: ElementRef;
  createRoleMethodCall(){
    this.dataService.createRole(this.roleRequest).subscribe((data) => {
      console.log(data);
      this.createRoleModalClose.nativeElement.click();
    }, (error)=>{
      console.log(error);
    })
  }
  updateRoleWithPermissionsMethodCall(){
    for(let i of this.moduleRequestList){
      if(i.privilegeId === null || i.privilegeId === 0){
        this.moduleRequestList.splice(this.moduleRequestList.indexOf(i), 1);
      }
    }
 
    debugger
    console.log(this.moduleRequestList);
    this.dataService.updateRoleWithPermissions(this.roleRequest).subscribe((data) => {
      console.log(data);
    }, (error) => {

      console.log(error);
    })
  }

  settingSubModuleRequestValue(privilegeId : number, subModule : any){

    const moduleRequest : ModuleRequest = new ModuleRequest();
    moduleRequest.subModuleId = subModule.id;
    moduleRequest.privilegeId = privilegeId;

    const existingIndex = this.moduleRequestList.findIndex((item) => item.subModuleId === moduleRequest.subModuleId && item.privilegeId === moduleRequest.privilegeId);
    
    if (existingIndex !== -1) {
      this.moduleRequestList.splice(existingIndex, 1);
  } else {
      const subModuleIndex = this.moduleRequestList.findIndex((item) => item.subModuleId === moduleRequest.subModuleId);

      if (subModuleIndex !== -1) {
          this.moduleRequestList[subModuleIndex].privilegeId = privilegeId;
      } else {
          this.moduleRequestList.push(moduleRequest);
      }
  }

    console.log(this.moduleRequestList);
    this.roleRequest.moduleRequestList = this.moduleRequestList;

  }

  handleRadioClickForSubModule(privilegeId: number, subModule: any) {
    if (subModule.privilegeId === privilegeId) {
        subModule.privilegeId = null;
    } else {
        subModule.privilegeId = privilegeId;
    }

    this.settingSubModuleRequestValue(privilegeId, subModule);
  }

  handleRadioClickForModule(privilegeId: number, module: any){
    debugger
    if (module.privilegeId === privilegeId) {
      module.privilegeId = null;
    } else {
      module.privilegeId = privilegeId;
    }

    const subModules = module.subModules;

    for(let i of subModules){
      this.handleRadioClickForSubModule(module.privilegeId, i);
    }
    // console.log(subModules);

  // this.settingSubModuleRequestValue(privilegeId, module);
}

  call(){
    this.dataService.callingHelloWorld().subscribe((data) => {
      console.log(data.text);
    }, (error) => {
      console.log(error);
    })
  }


  getUsersByFilterMethodCall(){
    debugger
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'name').subscribe((data) => {
      this.users = data.users;
      // this.total = data.count;

      console.log(this.users,this.total);
    })
  }

  @ViewChild('assignroleModalClose') assignroleModalClose !: ElementRef; 

  assignRoleToUserInUserAndControlMethodCall(){
    this.dataService.assignRoleToUserInUserAndControl((this.selectedUser.id), (this.selectedRole.id)).subscribe((data) => {
      // console.log(data);
      
      this.assignroleModalClose.nativeElement.click();
    }, (error) => {
      console.log(error);
      this.assignroleModalClose.nativeElement.click();
    })
  }



  userAndControlRoles : UserAndControl[] = [];
  userAndControlRolesTotalCount : number = 0;
  getUserAndControlRolesByFilterMethodCall(){
    this.dataService.getUserAndControlRolesByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'').subscribe((data) => {
      debugger
      this.userAndControlRoles = data.object;
      this.total = data.totalItems;

      console.log(this.userAndControlRoles,this.total);
    }, (error) => {
      console.log(error);
    })
  }


  // ##### Pagination ############
  changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getUserAndControlRolesByFilterMethodCall();
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

  onTableDataChange(event : any)
  {
    this.pageNumber=event;
    this.getAllRolesMethodCall();
  }
}
