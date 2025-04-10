import { Injectable, OnInit } from '@angular/core';
import { HelperService } from './helper.service';
import { DataService } from 'src/app/services/data.service';
import { Key } from '../constant/key';
import { Router } from '@angular/router';
import { constant } from '../constant/constant';
import { Routes } from '../constant/Routes';

@Injectable({
  providedIn: 'root',
})
export class RoleBasedAccessControlService {
  clearRbacService() {
    this.userInfo = null;
  }

  userInfo: any;
  ROLE !: string;
  isUserInfoInitialized: boolean = false;
  private userInfoInitialized: Promise<void>|any;
  currentRoute:any;
  constructor(private helperService: HelperService, private dataService: DataService,  private router : Router) {


                if (!Routes.AUTH_ROUTES.includes(String(window.location.pathname))&& !constant.PUBLIC_ROUTES.includes(window.location.pathname)) {
                   this.LoadAsync();
                }
             
        


  }


  private LoadAsync = async () => {
    this.userInfoInitialized =  this.initializeUserInfo();
 };

 shouldDisplay(moduleName: string): boolean {
  const role = this.getRoles();


  if (role === Key.ADMIN) {
    return true;
  }

  if (this.helperService.subModuleResponseList && this.helperService.subModuleResponseList.length > 0) {
    return this.helperService.subModuleResponseList.some(
      (module: any) => module.name.toLowerCase() === moduleName.toLowerCase()
    );

  }

  this.dataService.getAccessibleSubModuleResponse().subscribe(
    (response: any[]) => {
      this.helperService.subModuleResponseList = response;
      return response.some(
        (module: any) => module.name.toLowerCase() === moduleName.toLowerCase()
      );
    },
    (error) => {
      console.error('Error fetching accessible submodules:', error);
      return false;
    }
  );
  return false;
}

  public async initializeUserInfo(): Promise<void> {
    debugger
    try {
     await this.helperService.getDecodedValueFromToken().then((res:any)=>{
        // console.log(res)
        this.userInfo=res;
        this.userInfo!.uuid=res.uuid;
        // this.userInfo!.role=res.role;
        this.ROLE = res.role;
        // console.log("updated uuid",  this.userInfo!.uuid)
        this.isUserInfoInitialized = true;
      });

    } catch (error) {
      // this.isUserInfoInitialized = true;
      console.error('Error fetching decoded value from token:', error);
    }
  }

  isUserInfoInitializedMethod(): Promise<void> {
    debugger
    return this.userInfoInitialized;
  }

  async getRole() {
    return this.userInfo?.role;
  }

  getRoles() {
    return this.userInfo?.role;
  }

  async getUUID(): Promise<string> {
   
    if (this.userInfo && this.userInfo.uuid) {
      return Promise.resolve(this.userInfo.uuid);
    } else {
      return Promise.resolve("");
    }
  }

  async getOnboardingStep(): Promise<number> {
    debugger
    return Promise.resolve(this.userInfo!.onboardingStep);
  }


  getOrgRefUUID() {
    if(this.userInfo){
      return this.userInfo!.orgRefId;

    }else{
      return this.userInfo;
    }
  }

  getUuid() {
    debugger
    return this.userInfo!.uuid;
  }

  async hasAccessToSubmodule(subModuleRouteValue: string): Promise<boolean> {
    debugger
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let subModules = this.helperService.subModuleResponseList;
        if (subModules == undefined || subModules == null || subModules.length == 0) {
          this.helperService.subModuleResponseList = await this.helperService.getAccessibleSubModuleResponseMethodCall();  
          subModules = this.helperService.subModuleResponseList; 
        }

        if(subModules != undefined &&  subModules != null && subModules.length > 0){

          var index = subModules.findIndex(subModule=> subModule.description == subModuleRouteValue);
            if(index > -1){
               resolve(true);
              //  return;
            }else{
              resolve(false);
            }
        }else{
          resolve(false);
        }

      } catch (error) {
        reject(error);
      }
    });
  }

  hasWriteAccess(route: string): boolean {
    if (this.ROLE === Key.ADMIN) {
      return true;
    }
  
    if (this.helperService.subModuleResponseList && this.helperService.subModuleResponseList.length > 0) {
      return this.helperService.subModuleResponseList.some((module: any) => 
        module.description === route && module.privilegeId === 2
      );
    }
  
    return false; // Ensures default behavior if no match is found
  }
  

  hasReadOnlyAccess(route: string): boolean {
    if (this.ROLE === Key.ADMIN) {
      return false;
    }
    if ( this.helperService.subModuleResponseList && this.helperService.subModuleResponseList.length > 0 ) {
      return this.helperService.subModuleResponseList.some((module: any) =>
         module.description === route && module.privilegeId === 1);
    }
  
    return true;
  }
  idAdminOnlyAccess(): boolean {
    if (this.ROLE === Key.ADMIN) {
      return true;
    }
    
    return false;
  }

  hasAccess(route: string): boolean {
    if (this.ROLE === Key.ADMIN) {
      return true;
    }
  
    if (this.helperService.subModuleResponseList && this.helperService.subModuleResponseList.length > 0) {
      return this.helperService.subModuleResponseList.some((module: any) => 
        module.description === route 
      );
    }
  
    return true; // Ensures default behavior if no match is found
  }
  

  /**
   * Common action buttons managemnt methods for all modules START
   * logInUserUuid!=attendanceReq.uuid - to prevent sef
   */
  showLeaveActionButton(leave:any,logInUserUuid:string,statusCheck:string, moduleRoute:string): boolean {
    return (leave.status == statusCheck &&
       (( this.hasWriteAccess(moduleRoute))
        &&(logInUserUuid==leave.managerUuid || this.ROLE !=Key.MANAGER) ));
   }
  // showLeaveActionButton(leave:any,logInUserUuid:string,statusCheck:string, moduleRoute:string): boolean {
  //   return (leave.status == statusCheck &&
  //      ((logInUserUuid!=leave.uuid && this.hasWriteAccess(moduleRoute))
  //       ||logInUserUuid==leave.managerUuid ));
  //  }

   showAttendanceUpdateActionButton(attendanceReq:any,logInUserUuid:string,statusCheck:number, moduleRoute:string): boolean {
    return (attendanceReq.status == statusCheck &&
      (( this.hasWriteAccess(moduleRoute))
       &&(logInUserUuid==attendanceReq.managerUuid || this.ROLE !=Key.MANAGER) ));
    // return (attendanceReq.status.id == statusCheck &&
    //   ((logInUserUuid!=attendanceReq.uuid && this.hasWriteAccess(moduleRoute))
    //    ||logInUserUuid==attendanceReq.managerUuid ));
   }
    /**
   * Common action buttons managemnt methods for all modules END
   */
}
