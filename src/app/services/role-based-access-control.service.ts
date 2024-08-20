import { Injectable, OnInit } from '@angular/core';
import { HelperService } from './helper.service';
import { ModulesWithSubmodules } from '../models/modules-with-submodules';
import { ModuleResponse } from '../models/module-response';
import { resolve } from 'dns';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleBasedAccessControlService {
  clearRbacService() {
    this.userInfo = null;
  }

  userInfo: any;
  isUserInfoInitialized: boolean = false;
  private userInfoInitialized: Promise<void>|any;

  constructor(private helperService: HelperService) {
   
    debugger
     this.LoadAsync();

    
  }


  private LoadAsync = async () => {
    this.userInfoInitialized =  this.initializeUserInfo();
 };
  public async initializeUserInfo(): Promise<void> {
    debugger
    try {
     await this.helperService.getDecodedValueFromToken().then((res:any)=>{
        console.log(res)
        this.userInfo=res;
        this.userInfo!.uuid=res.uuid;
        console.log("updated uuid",  this.userInfo!.uuid)
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
    debugger
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
    debugger
    // console.log("role is ",this.userInfo)
    return this.userInfo!.role;
  }

  async getUUID(): Promise<string> {
    debugger
    // return Promise.resolve(this.userInfo!.uuid);\
    // if(this.userInfo){
    return Promise.resolve(this.userInfo!.uuid);
    // }else{
    //   return Promise.resolve("");

    // }
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
        if (
          subModules == undefined ||
          subModules == null ||
          subModules.length == 0
        ) {
          subModules =
            await this.helperService.getAccessibleSubModuleResponseMethodCall();
        }
        for (const subModule of subModules) {
          if (
            subModule.description === subModuleRouteValue &&
            subModule.isAccessible
          ) {
            resolve(true);
            return;
          }
        }

        resolve(false);
      } catch (error) {
        reject(error);
      }
    });
  }
}