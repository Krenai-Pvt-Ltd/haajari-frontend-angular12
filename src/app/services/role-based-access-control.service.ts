import { Injectable, OnInit } from '@angular/core';
import { HelperService } from './helper.service';
import { ModulesWithSubmodules } from '../models/modules-with-submodules';
import { ModuleResponse } from '../models/module-response';
import { resolve } from 'dns';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleBasedAccessControlService {

  clearRbacService() {
    this.userInfo = null;
  }

  userInfo: any;
  private userInfoInitialized: Promise<void>;


  constructor(private helperService: HelperService) {
    this.userInfoInitialized = this.initializeUserInfo();

  }


  private async initializeUserInfo(): Promise<void> {
    try {
      this.userInfo = await this.helperService.getDecodedValueFromToken();
    } catch (error) {
      console.error('Error fetching decoded value from token:', error);
    }
  }

  isUserInfoInitialized(): Promise<void> {
    return this.userInfoInitialized;
  }


  async getRole() {
    let role = null;
    this.userInfo = await this.helperService.getDecodedValueFromToken();
    await this.helperService.getDecodedValueFromToken().then((response:any)=>{
      this.userInfo=response;
      role = this.userInfo.role;
    });
    return role;
  }

  getRoles() {
    return this.userInfo.role;
  }

  async getUUID(): Promise<string> {
    // return Promise.resolve(this.userInfo!.uuid);\
    return Promise.resolve(this.userInfo!.uuid);
  }

  // getUUID(){
  //   return this.userInfo.uuid;
  // }


  // getUUIDTemp(): Promise<string>{
  //   return Promise.resolve(this.userInfo.uuid);
  // }

  getOrgRefUUID() {
    return this.userInfo!.orgRefId;
  }

  getUuid(){
    return this.userInfo!.uuid;
  }


  async hasAccessToSubmodule(subModuleRouteValue: string): Promise<boolean> {
    debugger
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let subModules = this.helperService.subModuleResponseList;
        if (subModules == undefined || subModules == null || subModules.length == 0) {
          subModules = await this.helperService.getAccessibleSubModuleResponseMethodCall();
        }
        for (const subModule of subModules) {

          if (subModule.description === subModuleRouteValue && subModule.isAccessible) {
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
