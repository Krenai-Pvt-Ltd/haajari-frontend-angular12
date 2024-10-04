import { Injectable, OnInit } from '@angular/core';
import { HelperService } from './helper.service';
import { ModulesWithSubmodules } from '../models/modules-with-submodules';
import { ModuleResponse } from '../models/module-response';
import { DataService } from 'src/app/services/data.service';
import { resolve } from 'dns';
import { Observable } from 'rxjs';
import { Key } from '../constant/key';

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

  constructor(private helperService: HelperService, private dataService: DataService) {

    debugger
     this.LoadAsync();


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
        console.log(res)
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
