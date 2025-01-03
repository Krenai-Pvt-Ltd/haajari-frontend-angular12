import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {

  constructor(public roleService: RoleBasedAccessControlService, private dataService: DataService,
    private activateRoute: ActivatedRoute, private _helperService: HelperService
  ) {

  }

  ngOnInit(): void {
    this.getUuid();
  }

  activeTab: string = 'attendance-leave';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isEmployeeExit: boolean = false;
  UUID: any
  currentUserUuid: any
  userId: any

  public async getUuid() {
    this.UUID = await this.roleService.getUuid();
    this.currentUserUuid = await this.roleService.getUuid();

    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }


    this.getEmployeeProfileData();
    this.getUserJoiningDataByUserId();
  }

  employeeProfileResponseData: any;
  resignationDate: any;
  isLoading: boolean = false;
  getEmployeeProfileData() {

    this.isEmployeeExit = false;
    this.isLoading = true;
    this.dataService.getEmployeeProfile(this.UUID).subscribe((response) => {
      // console.log(response.object);
      this.employeeProfileResponseData = response.object;
      if (this.employeeProfileResponseData.resignationStatus != null && this.employeeProfileResponseData.resignationStatus == 43) {
        this.isEmployeeExit = true;
        this.resignationDate = this.employeeProfileResponseData.approvedDate;
      }

      this.isLoading = false;

    }, (error) => {
      //  console.log(error);
    })
  }


  getUserJoiningDataByUserId() {
    this.dataService.getEmployeeProfile(this.userId).subscribe((response) => {

      this.employeeProfileResponseData = response.object;
      if (this.employeeProfileResponseData.joiningDate != null) {
        this._helperService.userJoiningDate = this.employeeProfileResponseData.joiningDate;
      }
    })
  }

  @ViewChild('notificationBtn') notificationBtn!: ElementRef;
  public clickViewAll() {
    debugger
    if (this.notificationBtn) {
      this.notificationBtn.nativeElement.click();
    }
  }



  @ViewChild('profileBtn') profileBtn!: ElementRef;
  public clickOnProfileTab() {
    if (this.profileBtn) {
      this.profileBtn.nativeElement.click();
    }
  }



}
