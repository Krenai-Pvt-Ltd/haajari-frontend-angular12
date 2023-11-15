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
  itemPerPage : number = 10;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;

  ngOnInit(): void {
    this.getUsersByFiltersFunction();
  }

  getUsersByFiltersFunction() {
    debugger
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'', this.getLoginDetailsId(), this.getLoginDetailsRole()).subscribe((data : any) => {
      this.users = data.users;
      this.total = data.count;
      console.log(this.users);

       
      //  const emailIdPairs = data.users.map((user: any) => ({ email: user.email, id: user.id }));
      //  console.log(emailIdPairs);


    }, (error) => {
      console.log(error);
      const res = document.getElementById("error-page") as HTMLElement | null;

      if(res){
        res.style.display = "block";
      }
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


  getLoginDetailsRole(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      return loginData.role;
    }
  }

  getLoginDetailsId(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);

      return loginData.id;
      // const decodedToken : any = jwt_decode(loginData.access_token);
      // return decodedToken.organization_database_id;
    }

    // const id = localStorage.getItem('id');
    
    // if(id!==null){
    //   const idd = JSON.parse(id);
    //   return idd;
    // }
    
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
