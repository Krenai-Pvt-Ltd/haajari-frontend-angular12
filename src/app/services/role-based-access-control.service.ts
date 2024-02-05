import { Injectable, OnInit } from '@angular/core';
import { HelperService } from './helper.service';
import { ModulesWithSubmodules } from '../models/modules-with-submodules';
import { ModuleResponse } from '../models/module-response';
import { resolve } from 'dns';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleBasedAccessControlService implements OnInit{
  private userInfo: any;

  constructor(private helperService: HelperService, private authService : AuthService) {
    this.userInfo = this.initializeUserInfo();
    
  }
  ngOnInit(): void {
    
  }

  private async initializeUserInfo(): Promise<void> {
    try {
      this.userInfo = await this.helperService.getDecodedValueFromToken();
    } catch (error) {
      console.error('Error fetching decoded value from token:', error);
    }
  }

  async getRole(): Promise<string> {
    return Promise.resolve(this.userInfo.role);
  }

  getRoles(){
    return this.userInfo.role;
  }

  getUUID(){
    return this.userInfo.uuid;
  }

  getOrgRefUUID(){
    return this.userInfo.orgRefId;
  }

  moduleResponseList: any[] = [];
  setModules(moduleResponseList : any){
    this.moduleResponseList = this.moduleResponseList;
  }

  getModules() {
    return this.moduleResponseList;
  }

  
  async hasAccessToSubmodule(subModuleRouteValue: string): Promise<boolean> {
    debugger
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        // const modules = await this.helperService.getModulesWithSubModules();

        let subModules = this.helperService.subModuleResponseList;
        if(subModules==undefined || subModules==null || subModules.length==0){
          subModules = await this.helperService.getAccessibleSubModuleResponseMethodCall();
        }
        for (const subModule of subModules) {

          if(subModule.description === subModuleRouteValue && subModule.isAccessible){
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
