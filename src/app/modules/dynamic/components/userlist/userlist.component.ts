import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css']
})
export class UserlistComponent implements OnInit {


  constructor(private dataService : DataService, private router : Router) { }

  users : Users[] = [];
  filteredUsers : Users[] = [];
  itemPerPage : number = 5;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;

  ngOnInit(): void {
    this.getUsersByFiltersFunction();
  }

  getUsersByFiltersFunction() {
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'').subscribe((data : any) => {
      this.users = data.users;
      this.total = data.count;
      console.log(this.users);
    }, (error) => {
      console.log(error);
      console.log("-----------------------------")
    })
  }

  text = '';
  changeStatus(id: number, presenceStatus : Boolean){
    this.dataService.changeStatusById(id,presenceStatus).subscribe(data =>{
      console.log(data);
      console.log("====================");
    }, (error) => {
      console.log(error);
      console.log("-------------------------------")
    })
  }


  updateLeaveStatus(){

  }
  

  onTableDataChange(event : any)
  {
    this.pageNumber=event;
    this.getUsersByFiltersFunction();
  }


  searchText : string = '';


  searchUsers() {
    this.getUsersByFiltersFunction();
  }
}
