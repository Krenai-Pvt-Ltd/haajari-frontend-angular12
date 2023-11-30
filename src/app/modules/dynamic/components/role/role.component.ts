import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  showDataToModal(role : any){
    this.roleRequest.name = role.name;
    this.roleRequest.description = role.description;
  }

  getSubModuleByRoleMethodCall(){
    this.dataService.getSubModuleByRole(1).subscribe((data) => {

      this.moduleResponse = data;
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
}
