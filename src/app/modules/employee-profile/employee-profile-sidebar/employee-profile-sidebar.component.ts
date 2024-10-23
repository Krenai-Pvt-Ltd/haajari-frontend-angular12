import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeProfileResponse } from 'src/app/models/employee-profile-info';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-employee-profile-sidebar',
  templateUrl: './employee-profile-sidebar.component.html',
  styleUrls: ['./employee-profile-sidebar.component.css']
})
export class EmployeeProfileSidebarComponent implements OnInit {

  userId : any;
  constructor( private dataService: DataService,
    private activateRoute: ActivatedRoute,
    public helperService: HelperService,
    private router: Router,
    private roleService: RoleBasedAccessControlService,
    public domSanitizer: DomSanitizer,
    private afStorage: AngularFireStorage,
    private sanitizer: DomSanitizer,) {
    // if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
    //   this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    // }

    this.userId = "731a011e-ae1e-11ee-9597-784f4361d885";
   }

  ngOnInit(): void {
    this.getEmployeeProfileData();

  }


  employeeProfileResponseData : EmployeeProfileResponse | undefined;
  teamString !: any;
  getEmployeeProfileData() {
    debugger
    this.dataService.getEmployeeProfile(this.userId).subscribe((response) => { 
      this.employeeProfileResponseData = response.object;
      this.teamString = this.employeeProfileResponseData?.teams;
      this.splitTeams();
    }, (error) => {
         console.log(error);
    })
  }

  teams: string[] = [];

  splitTeams(): void {
    this.teams = this.teamString.split(',').map((team: string) => team.trim());
    console.log(this.teams);
  }

  getFirstLetterOfName(): string {
    return this.employeeProfileResponseData?.userName ? this.employeeProfileResponseData.userName.charAt(0).toUpperCase() : '';
  }

}
