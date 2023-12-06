import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { error } from 'console';
import { ModuleRequest } from 'src/app/models/module-request';
import { ModuleResponse } from 'src/app/models/module-response';
import { Role } from 'src/app/models/role';
import { RoleRequest } from 'src/app/models/role-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  constructor(private dataService : DataService, private router : Router) { }

  roles : Role[] = [];
  itemPerPage : number = 10;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;
  searchText : string = '';

  ngOnInit(): void {
    this.call();
    this.getAllRolesMethodCall();
    this.getSubModuleByRoleMethodCall();
  }

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
    this.getAllRolesMethodCall();
  }

  onTableDataChange(event : any)
  {
    this.pageNumber=event;
    this.getAllRolesMethodCall();
  }

  // # Modal Data
  name : string = '';
  description : string = '';
  moduleResponse : ModuleResponse[] = [];
  roleRequest : RoleRequest = new RoleRequest();
  moduleRequestList : ModuleRequest[] = [];

  showDataToModal(role : any){
    this.roleRequest.id = role.id;
    this.roleRequest.name = role.name;
    this.roleRequest.description = role.description;
  }

  getSubModuleByRoleMethodCall(){
    this.dataService.getSubModuleByRole(1).subscribe((data) => {

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

  updateRolePermissionsMethodCall(){
    this.dataService.updateRolePermissions(this.roleRequest).subscribe((data) => {
      console.log(data);
    }, (error) => {

      console.log(error);
    })
  }

  settingModuleRequestValue(privilegeId : number, subModule : any){
    debugger

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

  handleRadioClick(privilegeId: number, subModule: any) {
    if (subModule.privilegeId === privilegeId) {
        subModule.privilegeId = null;
    } else {
        subModule.privilegeId = privilegeId;
    }

    this.settingModuleRequestValue(privilegeId, subModule);
  }

  call(){
    this.dataService.callingHelloWorld().subscribe((data) => {
      console.log(data.text);
    }, (error) => {
      console.log(error);
    })
  }
}
