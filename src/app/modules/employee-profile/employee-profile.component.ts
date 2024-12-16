import { Component, OnInit } from '@angular/core';

import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {

  constructor(private roleService: RoleBasedAccessControlService, private dataService: DataService,
    private activateRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getUuid();
  }

  activeTab: string = 'home';

  setActiveTab(tab: string) {
      this.activeTab = tab;
  }

  isEmployeeExit: boolean = false;
  UUID: any
  currentUserUuid: any
  userId: any

  public async getUuid(){
    this.UUID = await this.roleService.getUuid();
    this.currentUserUuid = await this.roleService.getUuid();

    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }


    this.getEmployeeProfileData();
  }

  employeeProfileResponseData: any;
  resignationDate: any;
  isLoading: boolean = false;
  getEmployeeProfileData() {
    debugger
    this.isEmployeeExit = false;
    this.isLoading = true;
    this.dataService.getEmployeeProfile(this.UUID).subscribe((response) => {
      console.log(response.object);
      this.employeeProfileResponseData = response.object;

      if(this.employeeProfileResponseData.resignationStatus != null && this.employeeProfileResponseData.resignationStatus  == 43){
        this.isEmployeeExit = true;
        this.resignationDate = this.employeeProfileResponseData.approvedDate;
      }

      this.isLoading = false;

    }, (error) => {
         console.log(error);
    })
  }



}
