import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from 'src/app/models/role';
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
}
