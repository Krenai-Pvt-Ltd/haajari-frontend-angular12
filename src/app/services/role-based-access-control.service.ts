import { Injectable, OnInit } from '@angular/core';
import { HelperService } from './helper.service';
import { ModulesWithSubmodules } from '../models/modules-with-submodules';
import { ModuleResponse } from '../models/module-response';
import { DataService } from 'src/app/services/data.service';
import { resolve } from 'dns';
import { Observable } from 'rxjs';
import { Key } from '../constant/key';
import { ActivationEnd, Router } from '@angular/router';
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

    let role = null;
    // this.userInfo = await this.helperService.getDecodedValueFromToken();
    // this.userInfo= await this.helperService
    //   .getDecodedValueFromToken()
    //   .then((response: any) => {
    //     this.userInfo = response;
    //     role = this.userInfo.role;
      // });
    return this.userInfo.role;
  }

  getRoles() {
    // console.log("role is ",this.userInfo)
    return this.userInfo!.role;
  }

  async getUUID(): Promise<string> {
   
    if (this.userInfo && this.userInfo.uuid) {
      console.log('userInfo:', this.userInfo);
      return Promise.resolve(this.userInfo.uuid);
    } else {
      console.error('userInfo is undefined or does not contain uuid');
      return Promise.resolve("");
    }
  }

  async getOnboardingStep(): Promise<number> {
    debugger
    return Promise.resolve(this.userInfo!.onboardingStep);
  }

  // getUUID(){
  //   return this.userInfo.uuid;
  // }

  // getUUIDTemp(): Promise<string>{
  //   return Promise.resolve(this.userInfo.uuid);
  // }

  getOrgRefUUID() {
    debugger
    //TODO
    // console.log(this.userInfo)
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

        // if(this.helperService.subModuleResponseList == undefined 
        //   || this.helperService.subModuleResponseList == null 
        //   || this.helperService.subModuleResponseList.length ==0  ){

        //     this.helperService.subModuleResponseList = await this.helperService.getAccessibleSubModuleResponseMethodCall(); 

        // }

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

        // for (const subModule of subModules) {
        //   if (
        //     subModule.description === subModuleRouteValue &&
        //     subModule.isAccessible
        //   ) {
        //     resolve(true);
        //     return;
        //   }
        // }

      } catch (error) {
        reject(error);
      }
    });
  }
}
