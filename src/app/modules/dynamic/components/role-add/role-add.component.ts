import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { Routes } from 'src/app/constant/Routes';
import { ModuleRequest } from 'src/app/models/module-request';
import { ModuleResponse } from 'src/app/models/module-response';
import { RoleRequest } from 'src/app/models/role-request';
import { RoleAccessibilityType } from 'src/app/role-accessibility-type';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-role-add',
  templateUrl: './role-add.component.html',
  styleUrls: ['./role-add.component.css'],
})
export class RoleAddComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    public rbacService: RoleBasedAccessControlService
  ) {}


  ngOnInit(): void {
    debugger
    window.scroll(0, 0);
    const roleIdParam = this.activateRoute.snapshot.queryParamMap.get('roleId');
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);

    if (roleIdParam === "1" || roleIdParam === "2" || roleIdParam === "3") {
      window.location.href = this.Routes.ROLE;
      return;
    }
    if (roleIdParam !== null) {
      debugger;
      this.roleRequest.id = +roleIdParam;
    }

    this.helperService.setRoleSectionTab(true);
    this.getRoleByIdMethodCall();
    this.getSubModuleByRoleMethodCall();
    this.getAllRoleAccessibilityTypeMethodCall();
  }

  readonly Routes=Routes;
  roleRequest: RoleRequest = new RoleRequest();
  moduleResponseList: ModuleResponse[] = [];
  moduleRequestList: ModuleRequest[] = [];
  buttonLoader: boolean = false;
  @ViewChild('homeTab') homeTab!: ElementRef;

  isShimmerForRolePermissionModules = false;
  dataNotFoundPlaceholderForRolePermissionModules = false;
  networkConnectionErrorPlaceHolderForRolePermissionModules = false;
  preRuleForShimmersAndErrorPlaceholdersMethodCallForRolePermissionModules() {
    this.isShimmerForRolePermissionModules = true;
    this.dataNotFoundPlaceholderForRolePermissionModules = false;
    this.networkConnectionErrorPlaceHolderForRolePermissionModules = false;
  }

  isShimmerForRoleAccessibilityType = false;
  dataNotFoundPlaceholderForRoleAccessibilityType = false;
  networkConnectionErrorPlaceHolderForRoleAccessibilityType = false;
  preRuleForShimmersAndErrorPlaceholdersMethodCallForRoleAccessibilityType() {
    this.isShimmerForRoleAccessibilityType = true;
    this.dataNotFoundPlaceholderForRoleAccessibilityType = false;
    this.networkConnectionErrorPlaceHolderForRoleAccessibilityType = false;
  }

  modelRefreshMethodCall() {
    if (this.roleRequest.roleAccessibilityTypeId === 0) {
    }
  }

  getSubModuleByRoleMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCallForRolePermissionModules();
    // console.log(this.roleRequest.id);
    debugger;
    this.dataService.getSubModuleByRole(this.roleRequest.id).subscribe(
      (data) => {
        this.moduleResponseList = data;

        for (let i of this.moduleResponseList) {
          const submodules = i.subModules;

          for (let j of submodules) {
            const moduleRequest: ModuleRequest = new ModuleRequest();
            moduleRequest.subModuleId = j.id;
            moduleRequest.privilegeId = j.privilegeId;
            this.moduleRequestList.push(moduleRequest);
          }
        }
        // console.log(this.moduleResponseList);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectedRoleAccessibilityTypeId = null;

  submitAddRoleForm() {
    this.addRoleFormSubmitted = true;
    if (this.selectedRoleAccessibilityTypeId) {
    } else {
    }
  }

  addRoleFormSubmitted = false;
  addRoleValidationErrors: { [key: string]: string } = {};

  updateRoleWithPermissionsMethodCall() {
    this.addRoleFormSubmitted = true;
    this.buttonLoader = true;

    if (this.roleRequest.roleAccessibilityTypeId) {
      // console.log(this.moduleRequestList);

      const uniqueModuleRequestList = [];

      for (let i of this.moduleRequestList) {
        if (i.privilegeId !== null && i.privilegeId !== 0) {
          const existingIndex = uniqueModuleRequestList.findIndex(
            (item) =>
              item.subModuleId === i.subModuleId &&
              item.privilegeId === i.privilegeId
          );

          if (existingIndex === -1) {
            uniqueModuleRequestList.push(i);
          }
        }
      }

      // console.log(uniqueModuleRequestList);
      this.roleRequest.moduleRequestList = uniqueModuleRequestList;

      if (
        this.roleRequest.name == Key.ADMIN ||
        this.roleRequest.name == Key.USER ||
        this.roleRequest.name == Key.MANAGER
      ) {
        this.roleRequest.default = true;
      }

      this.dataService.updateRoleWithPermissions(this.roleRequest).subscribe(
        (data) => {
          this.buttonLoader = false;
          this.router.navigate(['/role']);
          this.helperService.setRoleSectionTab(true);
          this.helperService.showToast(
            'Role details saved successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          console.log(error);
          debugger;
          this.buttonLoader = false;
          this.helperService.showToast(
            'Error caused while saving the role!',
            Key.TOAST_STATUS_ERROR
          );
        }
      );
    } else {
      this.buttonLoader = false;
      return;
    }
  }

  handleRadioClickForSubModule(privilegeId: number, subModule: any) {
    if(!this.rbacService.hasWriteAccess(this.Routes.ADDROLE)){
      this.helperService.showPrivilegeErrorToast();
      return;
    }
    if (subModule.privilegeId === privilegeId) {
      subModule.privilegeId = null;
    } else {
      subModule.privilegeId = privilegeId;
    }

    this.settingSubModuleRequestValue(privilegeId, subModule);
  }

  settingSubModuleRequestValue(privilegeId: number, subModule: any) {
    const moduleRequest: ModuleRequest = new ModuleRequest();
    moduleRequest.subModuleId = subModule.id;
    moduleRequest.privilegeId = privilegeId;

    const existingIndex = this.moduleRequestList.findIndex(
      (item) =>
        item.subModuleId === moduleRequest.subModuleId &&
        item.privilegeId === moduleRequest.privilegeId
    );

    if (existingIndex !== -1) {
      this.moduleRequestList.splice(existingIndex, 1);
    } else {
      const subModuleIndex = this.moduleRequestList.findIndex(
        (item) => item.subModuleId === moduleRequest.subModuleId
      );

      if (subModuleIndex !== -1) {
        this.moduleRequestList[subModuleIndex].privilegeId = privilegeId;
      } else {
        this.moduleRequestList.push(moduleRequest);
      }
    }

    // console.log(this.moduleRequestList);
    this.roleRequest.moduleRequestList = this.moduleRequestList;
  }

  roleAccessibilityTypeList: RoleAccessibilityType[] = [];
  getAllRoleAccessibilityTypeMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCallForRoleAccessibilityType();
    this.dataService.getAllRoleAccessibilityType().subscribe(
      (response) => {
        this.roleAccessibilityTypeList = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  settingRoleAccessibilityType(id: number) {
    this.roleRequest.roleAccessibilityTypeId = id;
  }

  getDataToBeUpdated() {
    this.helperService.getData();
  }

  getRoleByIdMethodCall() {
    this.dataService.getRoleById(this.roleRequest.id).subscribe(
      (response) => {
        this.roleRequest = response.object;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  // setDataToBeUpdated(){

  //   const role = this.helperService.getData();

  //   if(role === null || role === undefined){
  //     this.roleRequest.id = 0;
  //   } else {
  //     this.roleRequest.id = role.id;
  //     this.roleRequest.name = role.name;
  //     this.roleRequest.description = role.description;
  //     this.roleRequest.roleAccessibilityTypeId = role.roleAccessibilityType.id;

  //   }
  // }
}
