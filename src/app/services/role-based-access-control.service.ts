import { Injectable, OnInit } from '@angular/core';
import { HelperService } from './helper.service';
import { ModulesWithSubmodules } from '../models/modules-with-submodules';
import { ModuleResponse } from '../models/module-response';
import { resolve } from 'dns';
import { Observable } from 'rxjs';
import { reject } from 'lodash';
import { ActivationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoleBasedAccessControlService {
  clearRbacService() {
    this.userInfo = null;
  }

  userInfo: any;
  currentRoute: string='';
  // userInfoInitialized!: any;
  isResolved: boolean = false;

  constructor(private helperService: HelperService, private _router: Router) {
  //  this.initializeUserInfo();

    if (this._router != undefined) {
      console.log("_router is not undefined" )

      this._router.events.subscribe(async val => {
        console.log("INSIDE LOOP _router is not undefined" +this.currentRoute+"----")

        // !this.isRefreshingToken && !this.Routes.AUTH_ROUTES.includes(this.currentRoute)
        if (val instanceof ActivationEnd && this.currentRoute!=""  ) { 

          //@ts-ignore
          this.currentRoute = val.snapshot._routerState.url.split("?")[0];
          // console.log("route=======", this.currentRoute);
          // if (!this.Routes.AUTH_ROUTES.includes(String(this.currentRoute))) {
            // var refresh_token = localStorage.getItem(Constant.REFRESH_TOKEN_STR); 

            // this.isTokenExpired = this._authenticationService?.isTokenExpiredWithoutRedirection();
             console.log("getmodules called from data service " )
         await  this.initializeUserInfo();
          // }
        }

      });


    }
    //  this.initializeUserInfo();
  }

   async initializeUserInfo() {
 
    return new Promise(async (resolve, reject) => {
      try {
        this.userInfo = await this.helperService.getDecodedValueFromToken();
        // await this.getRoleTemp();
        this.isResolved=true;
      console.log("  this.isResolved=true;",  this.isResolved)
        resolve(true);
      } catch (error) {
        reject(false);
      }
  
    })
    // .then(async x => {

    //     await this.getRole();
    //     this.isResolved=true;
    //   console.log("  this.isResolved=true;",  this.isResolved )
      
    // });
  }

  // isUserInfoInitialized(): Promise<void> {
  //   return this.userInfoInitialized;
  // }

  async getRole() {
    return this.userInfo.role;
    // return new Promise(async (resolve, reject) => {

    // let role = null;
    // // this.userInfo = await this.helperService.getDecodedValueFromToken()
     
    //     // this.userInfo = response;
    //     role = this.userInfo.role;
    //     console.log(role);
    //     resolve(role);
   
    // });
  }

  async getRoleDecoded() {
    return new Promise(async (resolve, reject) => {

    let role = null;
    // this.userInfo = await this.helperService.getDecodedValueFromToken()
     
        // this.userInfo = response;
        role = this.userInfo.role;
        console.log(role);
        resolve(role);
   
    });
  }

  getRoleVal() {
    return this.userInfo.role;
  }

  async getUUID(): Promise<string> {
    // return Promise.resolve(this.userInfo!.uuid);\
    return Promise.resolve(this.userInfo!.uuid);
  }

  async getOnboardingStep(): Promise<number> {
    return Promise.resolve(this.userInfo!.onboardingStep);
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

  getUuid() {
    return this.userInfo!.uuid;
  }

  async hasAccessToSubmodule(subModuleRouteValue: string): Promise<boolean> {
    debugger;
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let subModules = this.helperService.subModuleResponseList;
        if (
          subModules == undefined ||
          subModules == null ||
          subModules.length == 0
        ) {
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
