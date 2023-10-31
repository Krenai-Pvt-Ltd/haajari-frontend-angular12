import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TeamResponse } from 'src/app/models/team';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  

  constructor(private router : Router, private dataService: DataService,
    private activateRoute : ActivatedRoute) { }

  ngOnInit(): void {
    // this.getAllUsersByFiltersFunction();
    this.getAllUser();
  }

  users : Users[] = [];
  filteredUsers : Users[] = [];
  total !: number;
  rowNumber : number = 1;

  emailIdPairs: any[] = [];

  getAllUsersByFiltersFunction() {
    debugger
    this.dataService.getAllUsersByFilter('asc','id',this.searchText,'', this.getLoginDetailsId(), this.getLoginDetailsRole()).subscribe((data : any) => {
      this.users = data.users;
      console.log(this.users);

       debugger
       this.emailIdPairs = data.users.map((user: any) => ({id: user.id, image:user.image, name:user.name, email: user.email}));
       console.log(this.emailIdPairs);


    }, (error) => {
      console.log(error);
      const res = document.getElementById("error-page") as HTMLElement | null;

      if(res){
        res.style.display = "block";
      }
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
    }
  }

  searchText : string = '';

  searchUsers() {
    this.getAllUsersByFiltersFunction();
  }

  // ################################# MultiSelect #########################################

  name!: string;
  // userIds: number[] = [];


  onSubmit() {
    this.dataService.registerTeam(this.name, this.selectedMembers)
      .subscribe(
        (response) => {
          console.log('Team registration successful:', response);
        },
        (error) => {
          console.error('Error registering team:', error);
        }
      );
  }
  

  showMultiselectDropdown: boolean = true;
  searchTxt: string = '';

  selectedMembers: number[] = [];
  filteredMembers: any[] = [];

  filterMembers() {
    this.filteredMembers = this.emailIdPairs.filter(user =>
      user.name.toLowerCase().includes(this.searchTxt.toLowerCase())
    );
  }

  toggleMember(user: any) {
    if (this.selectedMembers.includes(user.id)) {
      this.selectedMembers = this.selectedMembers.filter(id => id !== user.id);
    } else {
      this.selectedMembers.push(user.id);
    }
  }

  // ######################################## Home #################################

  teams: TeamResponse[] = [];
  
 
  //  teamId!:any;
  //  index=0;
  

  teamIds:number[]=new Array();
  getAllUser(){
    debugger
    this.dataService.getAllTeamsWithUsersByUserId(this.getLoginDetailsId()).subscribe(data => {
      this.teams = data;

      console.log(this.teams);
    });
  }

  routeToTeamDetails(id:number){
    let navExtra : NavigationExtras = {
      queryParams : {"teamId" : id},
    };
    this.router.navigate(['/dynamic/team-detail'], navExtra);
  }
  
  capitalizeFirstLetter(name: string): string {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return name; 
  }
  
}

