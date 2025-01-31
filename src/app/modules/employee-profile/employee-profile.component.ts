import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { HelperService } from 'src/app/services/helper.service';
import { Key } from 'src/app/constant/key';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {

  constructor(public roleService: RoleBasedAccessControlService, private dataService: DataService,
    private activateRoute: ActivatedRoute, public _helperService: HelperService, private router: Router,
  ) {
    this.UUID =  this.roleService.getUuid();
    // this.currentUserUuid = await this.roleService.getUuid();

    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = String(this.activateRoute.snapshot.queryParamMap.get('userId'));
    }
    if(this.roleService.ROLE=='USER' && this.UUID!==this.userId) {
      // this.router.navigate(['/employee'], { queryParams: { userId: this.UUID } });
      this.userId = this.UUID;
      this.router.navigate(['/']);
    }else if(this.roleService.ROLE!='ADMIN' && this.UUID!==this.userId){
      this.checkUserUnderManager();
    }else{
      this.getEmployeeProfileData();
    this.getUserJoiningDataByUserId();
    }
    this._helperService.restrictedModules.forEach((restrictedModule)=>{
      if(restrictedModule.module=='Payroll'){
        this.isBasicPlan=true;
      }
    });
  }

  isBasicPlan:boolean=false;
  ngOnInit(): void {
    // this.getUuid();
  }

  activeTab: string = 'attendance-leave';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  @ViewChild('settingTab') settingTab!: ElementRef;
  @ViewChild('firstTab') firstTab!: ElementRef;
  isEmployeeExit: boolean = false;
  UUID: string=''
  currentUserUuid: string='';
  userId: string='';

  _key:Key = new Key();
  private baseUrl = this._key.base_url;
  public async getUuid() {



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

  managerCheckLoading: boolean = false;
  checkUserUnderManager() {
    this.managerCheckLoading = true;
    this.dataService.isUserUnderManager( this.userId).subscribe(
      (response) => {

        if(!response.isUserUnderManager){
          this.userId = this.UUID;
          this.router.navigate(['/']);

        }else{
          this.getEmployeeProfileData();
          this.getUserJoiningDataByUserId();
          this.managerCheckLoading = false;

        }
      },
      (error) => {
        this.managerCheckLoading = false;
        this.userId = this.UUID;
        this.router.navigate(['/']);
      }
    );
  }


  



}
