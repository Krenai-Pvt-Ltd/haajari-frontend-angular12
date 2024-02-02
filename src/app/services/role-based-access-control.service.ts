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

  //     const modules = [
//       {
//           "id": 1,
//           "name": "Dashboard",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 1,
//                   "name": "dashboard",
//                   "description": "/dashboard",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 2,
//           "name": "Attendance",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 2,
//                   "name": "attendance",
//                   "description": "/timetable",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 21,
//                   "name": "location validator",
//                   "description": "/location-validator",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 3,
//           "name": "Team",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 3,
//                   "name": "team",
//                   "description": "/team",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 4,
//                   "name": "team detail",
//                   "description": "/team-detail",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 4,
//           "name": "Employee Details",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 5,
//                   "name": "employee onboarding data",
//                   "description": "/employee-onboarding-data",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 6,
//                   "name": "employee profile",
//                   "description": "/employee-profile",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 5,
//           "name": "Project",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 7,
//                   "name": "project",
//                   "description": "/project",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 6,
//           "name": "Report",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 8,
//                   "name": "report",
//                   "description": "/reports",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 7,
//           "name": "Setting",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 9,
//                   "name": "company setting",
//                   "description": "/setting/company-setting",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 10,
//                   "name": "attendance setting",
//                   "description": "/setting/attendance-setting",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 11,
//                   "name": "leave setting",
//                   "description": "/setting/leave-setting",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 12,
//                   "name": "salary setting",
//                   "description": "/setting/selery-setting",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 22,
//                   "name": "account setting",
//                   "description": "/setting/account-settings",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 8,
//           "name": "Role & Permission",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 13,
//                   "name": "role & permission",
//                   "description": "/role",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 14,
//                   "name": "add role",
//                   "description": "/add-role",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 9,
//           "name": "Billing & Subscription",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 15,
//                   "name": "payment",
//                   "description": "/payment",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 16,
//                   "name": "billing",
//                   "description": "/billing",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 17,
//                   "name": "billing & payment",
//                   "description": "/billing-payment",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 10,
//           "name": "Privacy",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 18,
//                   "name": "privacy",
//                   "description": "/privacy",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 11,
//           "name": "Support",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 19,
//                   "name": "support",
//                   "description": "/support",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 12,
//           "name": "Task Management",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 20,
//                   "name": "task manager",
//                   "description": "/task-manager",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 13,
//           "name": "Authentication",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 23,
//                   "name": "slack auth",
//                   "description": "/auth/slackauth",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 24,
//                   "name": "add to slack",
//                   "description": "/auth/addtoslack",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 25,
//                   "name": "login",
//                   "description": "/auth/login",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 14,
//           "name": "Employee Onboarding",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 26,
//                   "name": "employee onboarding sidebar",
//                   "description": "/employee-onboarding/employee-onboarding-sidebar",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 27,
//                   "name": "employee onboarding form",
//                   "description": "/employee-onboarding/employee-onboarding-form",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 28,
//                   "name": "employee address detail",
//                   "description": "/employee-onboarding/employee-address-detail",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 29,
//                   "name": "employee document",
//                   "description": "/employee-onboarding/employee-document",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 30,
//                   "name": "employee academic details",
//                   "description": "/employee-onboarding/acadmic",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 31,
//                   "name": "employee experience",
//                   "description": "/employee-onboarding/employee-experience",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 32,
//                   "name": "employee bank details",
//                   "description": "/employee-onboarding/bank-details",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 33,
//                   "name": "employee emergency contact",
//                   "description": "/employee-onboarding/emergency-contact",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 34,
//                   "name": "employee preview submission",
//                   "description": "/employee-onboarding/employee-onboarding-preview",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 15,
//           "name": "Success",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 35,
//                   "name": "success page",
//                   "description": "/success",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       },
//       {
//           "id": 16,
//           "name": "Shared Module",
//           "description": "",
//           "isAccessible": 1,
//           "subModules": [
//               {
//                   "id": 36,
//                   "name": "error page",
//                   "description": "/error-page",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 37,
//                   "name": "header",
//                   "description": "/header",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 38,
//                   "name": "topbar",
//                   "description": "/topbar",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 39,
//                   "name": "slack data loader",
//                   "description": "/slack-data-loader",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               },
//               {
//                   "id": 40,
//                   "name": "hajiri page loader",
//                   "description": "/hajiri-page-loader",
//                   "privilegeId": 2,
//                   "isAccessible": 1
//               }
//           ]
//       }
//   ];

// this.moduleResponse = this.helperService.getModulesWithSubModules();


  private userInfo: any;

  constructor(private helperService: HelperService, private authService : AuthService) {
    this.userInfo = this.helperService.getDecodedValueFromToken();
  }
  ngOnInit(): void {
    // this.modules = this.authService.getUserData();
  }

  getRole() {
    return this.userInfo.role;
  }

  getUUID(){
    return this.userInfo.uuid;
  }

  moduleResponseList: any[] = [];
  setModules(moduleResponseList : any){
    this.moduleResponseList = this.moduleResponseList;
  }

  getModules() {
    return this.moduleResponseList;
  }

  // modules : any[] = [];
  

  // async hasAccessToSubmodule(submoduleRouteValue: string): Promise<boolean> {

  //     debugger
  //     const modules = await this.helperService.getModulesWithSubModules();

  //     for (const module of modules) {
  //       if (module.subModules.some((subModule: { description: string; isAccessible: any; }) => subModule.description === submoduleRouteValue && subModule.isAccessible)) {
  //         return true;
  //       }
  //     }

  //   return false;
  // }



  
  async hasAccessToSubmodule(submoduleRouteValue: string): Promise<boolean> {
    debugger
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        // const modules = await this.helperService.getModulesWithSubModules();

        let modules = this.helperService.getModules();
        if(modules==undefined || modules==null || modules.length==0){
          modules = await this.helperService.getModulesWithSubModules();
        }
        for (const module of modules) {
          if (module.subModules.some((subModule: { description: string; isAccessible: any; }) => subModule.description === submoduleRouteValue && subModule.isAccessible)) {
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
