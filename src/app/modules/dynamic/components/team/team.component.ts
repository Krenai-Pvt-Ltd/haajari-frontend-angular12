import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent {
  itemPerPage : number = 5;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;
  teamName : string = '';
  

  constructor(private router : Router, private dataService: DataService) { 
    this.Settings = {
      singleSelection: false,
      text: 'Select Module',
      enableSearchFilter: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
    };
  }

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
  userIds: number[] = [];

  
  searchUsers() {
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchQuery,'', 1, "ADMIN").subscribe((data : any) => {
      this.userList = data.users;
      this.total = data.count;
      console.log(this.userList);
    });
  }

  toggleUserSelection(user: User) {
    const index = this.selectedUsers.findIndex((u) => u.id === user.id); // Adjust the condition as per your user object structure
    if (index === -1) {
      this.selectedUsers.push(user);
      this.userIds.push(user.id);
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
      this.selectedUsers.splice(index, 1); // Remove the user from the selectedUsers array
    }
  }

  registerTeamSubmitButton(){
    debugger
    this.dataService.registerTeam(this.userIds,this.teamName,"NA").subscribe((data) => {
      debugger
      console.log(data);
    }, (error)=> {
      console.log(error);
    })
  }

  // ngOnInit(): void {
  //   this.getAllUsersByFiltersFunction();
  // }

  // users : Users[] = [];
  // filteredUsers : Users[] = [];
  // total !: number;
  // rowNumber : number = 1;

  // emailIdPairs: any[] = [];

  // getAllUsersByFiltersFunction() {
  //   debugger
  //   this.dataService.getAllUsersByFilter('asc','id',this.searchText,'', this.getLoginDetailsId(), this.getLoginDetailsRole()).subscribe((data : any) => {
  //     this.users = data.users;
  //     console.log(this.users);

  //      debugger
  //      this.emailIdPairs = data.users.map((user: any) => ({id: user.id, image:user.image, name:user.name, email: user.email}));
  //      console.log(this.emailIdPairs);


  //   }, (error) => {
  //     console.log(error);
  //     const res = document.getElementById("error-page") as HTMLElement | null;

  //     if(res){
  //       res.style.display = "block";
  //     }
  //   })
  // }

  // getLoginDetailsRole(){
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

  // searchText : string = '';

  // searchUsers() {
  //   this.getAllUsersByFiltersFunction();
  // }

  // // ##########################################################################

  // name!: string;
  // // userIds: number[] = [];


  // onSubmit() {
  //   this.dataService.registerTeam(this.name, this.selectedMembers)
  //     .subscribe(
  //       (response) => {
  //         console.log('Team registration successful:', response);
  //       },
  //       (error) => {
  //         console.error('Error registering team:', error);
  //       }
  //     );
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

  
  
}

