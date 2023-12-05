import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Users } from 'src/app/models/users';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-employee-onboarding',
  templateUrl: './employee-onboarding.component.html',
  styleUrls: ['./employee-onboarding.component.css']
})
export class EmployeeOnboardingComponent implements OnInit {

  constructor(private dataService : DataService, private router : Router, private helperService : HelperService) { }
  users : Users[] = [];
  filteredUsers : Users[] = [];
  itemPerPage : number = 10;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;


  ngOnInit(): void {
    this.getUsersByFiltersFunction();
  }

  isUserShimer:boolean=false;
  placeholder:boolean=false;
  errorToggleTop:boolean=false;
  getUsersByFiltersFunction() {
    // const role = this.loginDetails.role;
    this.isUserShimer=true;
    debugger
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'').subscribe((data : any) => {
      debugger
      this.users = data.users;
      this.total = data.count;
      console.log(this.users);
      this.isUserShimer=false;
      if(this.total==null){
        this.placeholder=true;
      }
       
      //  const emailIdPairs = data.users.map((user: any) => ({ email: user.email, id: user.id }));
      //  console.log(emailIdPairs);


    }, (error) => {
      this.isUserShimer=false;
      this.errorToggleTop=true;
      console.log(error);
      const res = document.getElementById("error-page") as HTMLElement | null;

      if(res){
        res.style.display = "block";
      }
    })
  }

  text = '';
  changeStatus(presenceStatus : Boolean){
    this.dataService.changeStatusById(presenceStatus).subscribe(data =>{
      console.log(data);
      console.log("====================");
    }, (error) => {
      console.log(error);
      console.log("-------------------------------")
    })
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

  reloadPage(){
    location.reload();
  }

  showProjectOfOnboardingSection: boolean=false;

  

changePage(page: number | string) {
  if (typeof page === 'number') {
    this.pageNumber = page;
  } else if (page === 'prev' && this.pageNumber > 1) {
    this.pageNumber--;
  } else if (page === 'next' && this.pageNumber < this.totalPages) {
    this.pageNumber++;
  }
  this.getUsersByFiltersFunction();
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

}
