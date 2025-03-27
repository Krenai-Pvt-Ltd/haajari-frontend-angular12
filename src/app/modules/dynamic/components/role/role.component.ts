import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModuleRequest } from 'src/app/models/module-request';
import { UserAndControl } from 'src/app/models/user-and-control';
import { ModuleResponse } from 'src/app/models/module-response';
import { Role } from 'src/app/models/role';
import { RoleRequest } from 'src/app/models/role-request';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { Key } from 'src/app/constant/key';
import { RoleAccessibilityType } from 'src/app/role-accessibility-type';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { Routes } from 'src/app/constant/Routes';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
})
export class RoleComponent implements OnInit {
  isShimmer: boolean = true;

  constructor(
    private dataService: DataService,
    private router: Router,
    public helperService: HelperService,
    public rbacService: RoleBasedAccessControlService

  ) { }
  readonly Routes=Routes;

  roles: Role[] = [];
  itemPerPage: number = 9;
  pageNumber: number = 1;
  pageNumberUser: number = 1;
  total: number = 0;
  rowNumber: number = 1;
  searchText: string = '';
  users: User[] = [];
  roleSectionTabFlag: boolean = false;

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getUserAndControlRolesByFilterMethodCall();
    this.getUsersByFilterMethodCall();
    this.getAllRolesMethodCall();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
    debugger;
    // if(!this.helperService.getRoleSectionTab()){

    // }

    // this.rolesAndSecurity.nativeElement.click();
  }

  ngAfterViewInit() {
    if (this.helperService.getRoleSectionTab()) {
      this.rolesAndSecurityActiveTabMethod();
    }

    this.helperService.setRoleSectionTab(false);
  }

  isShimmerForUserAndControl = false;
  dataNotFoundPlaceholderForUserAndControl = false;
  networkConnectionErrorPlaceHolderForUserAndControl = false;
  preRuleForShimmersAndErrorPlaceholdersMethodCall() {
    this.isShimmerForUserAndControl = true;
    this.dataNotFoundPlaceholderForUserAndControl = false;
    this.networkConnectionErrorPlaceHolderForUserAndControl = false;
  }

  isShimmerForRolesAndSecurity = false;
  dataNotFoundPlaceholderForRolesAndSecurity = false;
  networkConnectionErrorPlaceHolderForRolesAndSecurity = false;
  preRuleForShimmersAndErrorPlaceholdersMethodCallForRolesAndSecurity() {
    this.isShimmerForRolesAndSecurity = true;
    this.dataNotFoundPlaceholderForRolesAndSecurity = false;
    this.networkConnectionErrorPlaceHolderForRolesAndSecurity = false;
  }

  @ViewChild('rolesAndSecurity') rolesAndSecurity!: ElementRef;
  rolesAndSecurityActiveTabMethod() {
    this.rolesAndSecurity.nativeElement.click();
  }

  selectedRole: any;
  selectedUser: any;

  // Method to update selectedRole
  selectRole(role: any) {
    this.selectedRole = role;
  }

  selectUser(user: any) {
    this.selectedUser = user;
  }

  isDivDisabled = false;

  selectUserAndControl(userAndControl: UserAndControl) {
    const matchedUser = this.users.find(user => user.id === userAndControl.user.id);

  this.selectedUser = matchedUser || userAndControl.user;
  const matchedRole = this.roles.find(role => role.id === userAndControl.role.id);
    this.selectedRole = matchedRole || userAndControl.role;
    this.descriptionUserRole = userAndControl.description;
    this.isDivDisabled = true;
    this.getUsersByFilterMethodCall();
  }

  userAndControlDetailVariable: UserAndControl = new UserAndControl();
  userAndControlDetailMethod(userAndControl: UserAndControl) {
    this.userAndControlDetailVariable = userAndControl;
  }
  totalUser: number = 0;

  buttonLoader = false;
  roleAccessibilityTypeList: RoleAccessibilityType[] = [];
  getAllRoleAccessibilityTypeMethodCall() {
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

  num: number = 0;

  async getTotalCountOfUsers(id: number) {
    return new Promise((resolve, reject) => {
      this.dataService.getTotalCountOfUsersOfRoleAndSecurity(id).subscribe(
        (data) => {
          this.num = data;
          // this.getAllRolesMethodCall();

          resolve(data);

          return data;
        },
        (error) => {
          console.log(error);
        }
      );
    });
  }

  // # Data Table of roles
  getAllRolesMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersMethodCallForRolesAndSecurity();
    debugger;
    this.dataService
      .getAllRoles(
        this.itemPerPage,
        this.pageNumberUser,
        'asc',
        'id',
        '',
        '',
        0
      )
      .subscribe(
        async (data) => {
          this.roles = data.object;
          for (let i = 0; i < this.roles.length; i++) {
            await this.getTotalCountOfUsers(this.roles[i].id).then((data) => {
              // console.log(data);
            });
            this.roles[i].count = this.num;
          }
          this.totalUser = data.totalItems;
          if (
            this.roles.length === 0 ||
            this.roles === null ||
            this.roles.length === undefined
          ) {
            this.dataNotFoundPlaceholderForRolesAndSecurity = true;
          }
        },
        (error) => {
          this.networkConnectionErrorPlaceHolderForRolesAndSecurity = true;
          console.log(error);
        }
      );
  }

  crossFlag: boolean = false;
  searchUsers() {
    this.crossFlag = true;
    this.getUserAndControlRolesByFilterMethodCall();
    if (this.searchText == '') {
      this.crossFlag = false;
    }
  }

  clearSearchUsers() {
    this.searchText = '';
    this.getUserAndControlRolesByFilterMethodCall();
    this.crossFlag = false;
  }

  // # Modal Data
  name: string = '';
  description: string = '';
  moduleResponse: ModuleResponse[] = [];
  roleRequest: RoleRequest = new RoleRequest();
  moduleRequestList: ModuleRequest[] = [];

  showDataToModal(role: any) {
    if (role === null || role === undefined) {
      this.roleRequest.id = 0;
    } else {
      this.roleRequest.id = role.id;
      this.roleRequest.name = role.name;
      this.roleRequest.description = role.description;
    }

    this.getSubModuleByRoleMethodCall();
    this.helperService.setData(role);
    this.router.navigate(['/add-role']);
  }

  routeToEditRole(role: any) {
    let navExtra: NavigationExtras = {
      queryParams: { roleId: role.id },
    };
    this.router.navigate(['/add-role'], navExtra);
  }

  getSubModuleByRoleMethodCall() {
    // console.log(this.roleRequest.id);
    this.dataService.getSubModuleByRole(this.roleRequest.id).subscribe(
      (data) => {
        this.moduleResponse = data;

        for (let i of this.moduleResponse) {
          const submodules = i.subModules;

          for (let j of submodules) {
            const moduleRequest: ModuleRequest = new ModuleRequest();
            moduleRequest.subModuleId = j.id;
            moduleRequest.privilegeId = j.privilegeId;
            this.moduleRequestList.push(moduleRequest);
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  @ViewChild('createRoleModalClose') createRoleModalClose!: ElementRef;
  createRoleMethodCall() {
    this.dataService.createRole(this.roleRequest).subscribe(
      (data) => {
        this.getAllRolesMethodCall();
        this.createRoleModalClose.nativeElement.click();
      },
      (error) => {
        console.log(error);
      }
    );
  }
  updateRoleWithPermissionsMethodCall() {

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

    this.roleRequest.moduleRequestList = uniqueModuleRequestList;

    this.dataService.updateRoleWithPermissions(this.roleRequest).subscribe(
      (data) => {
        // console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
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

    this.roleRequest.moduleRequestList = this.moduleRequestList;
  }

  handleRadioClickForSubModule(privilegeId: number, subModule: any) {
    if (subModule.privilegeId === privilegeId) {
      subModule.privilegeId = null;
    } else {
      subModule.privilegeId = privilegeId;
    }

    this.settingSubModuleRequestValue(privilegeId, subModule);
  }

  handleRadioClickForModule(privilegeId: number, module: any) {
    if (module.privilegeId === privilegeId) {
      module.privilegeId = null;
    } else {
      module.privilegeId = privilegeId;
    }

    const subModules = module.subModules;

    for (let i of subModules) {
      this.handleRadioClickForSubModule(module.privilegeId, i);
    }
    // console.log(subModules);

    // this.settingSubModuleRequestValue(privilegeId, module);
  }

  deleteUser(id: number) {
    this.dataService.deleteUserOfRoleAndSecurity(id).subscribe(
      (data) => {
        this.getUserAndControlRolesByFilterMethodCall();
        this.helperService.showToast(
          'Deleted successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.helperService.showToast('Deletion of all the admins is restricted .One user must always be an admin.', Key.TOAST_STATUS_ERROR);
        console.log(error);
      }
    );
  }

  deleteRolesWithUsers(id: number) {
    this.dataService.deleteRolesOfRoleAndSecurity(id).subscribe(
      (data) => {
        this.getAllRolesMethodCall();
        this.helperService.showToast(
          'Role deleted successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        console.log(error);
      }
    );
  }

  getUsersByFilterMethodCall() {
    this.dataService
      .getUsersByFilter(0, 1, 'asc', 'id', '', 'name', 0)
      .subscribe((data) => {
        this.users = data.users;
        // this.total = data.count;

        // console.log(this.users, this.total);
      });
  }

  @ViewChild('assignroleModalClose') assignroleModalClose!: ElementRef;
  descriptionUserRole: string = '';
  buttonLoaderToAssignRole: boolean = false;

  assignRoleToUserInUserAndControlMethodCall() {
    this.buttonLoaderToAssignRole = true;
    this.dataService
      .assignRoleToUserInUserAndControl(
        this.selectedUser.id,
        this.selectedRole.id,
        this.descriptionUserRole
      )
      .subscribe(
        (data) => {
          // console.log(data);
          this.getUserAndControlRolesByFilterMethodCall();
          this.assignroleModalClose.nativeElement.click();
          this.emptyAssignRoleToUserInUserAndControlMethodCall();
          this.buttonLoaderToAssignRole = false;
          this.helperService.showToast(
            'Role assigned to user successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          this.helperService.showToast('Edit of all the admins is restricted .One user must always be an admin.', Key.TOAST_STATUS_ERROR);
          console.log(error);
        }
      );
  }

  emptyAssignRoleToUserInUserAndControlMethodCall() {
    this.selectedUser = null;
    this.selectedRole = null;
    this.descriptionUserRole = '';
    this.isDivDisabled = false;
  }

  userAndControlRoles: UserAndControl[] = [];
  userAndControlRolesTotalCount: number = 0;

  isPlaceholder: boolean = false;
  debounceTimer: any;
  getUserAndControlRolesByFilterMethodCall(debounceTime: number = 300) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    debugger
    this.debounceTimer = setTimeout(() => {
      this.preRuleForShimmersAndErrorPlaceholdersMethodCall();
      this.dataService
        .getUserAndControlRolesByFilter(
          this.itemPerPage,
          this.pageNumber,
          'asc',
          'id',
          this.searchText,
          ''
        )
        .subscribe(
          (data) => {
            this.userAndControlRoles = data.object;
            this.total = data.totalItems;

            if (data === undefined ||
              data === null ||
              this.userAndControlRoles.length === 0 && this.searchText == '') {
              this.isPlaceholder = true;
            } else {
              this.isPlaceholder = false;
            }
            if (
              data === undefined ||
              data === null ||
              this.userAndControlRoles.length === 0
            ) {
              this.dataNotFoundPlaceholderForUserAndControl = true;
            }
          },
          (error) => {
            console.log(error);
            this.networkConnectionErrorPlaceHolderForUserAndControl = true;
          }
        );
    }, debounceTime);
  }

  // ##### Pagination ############
  changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getUserAndControlRolesByFilterMethodCall();
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.total / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.itemPerPage);
  }
  getStartIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }
  getEndIndex(): number {
    const endIndex = this.pageNumber * this.itemPerPage;
    return endIndex > this.total ? this.total : endIndex;
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    // this.getAllRolesMethodCall();
  }

  //  pagination users

  changePageUser(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumberUser = page;
    } else if (page === 'prev' && this.pageNumberUser > 1) {
      this.pageNumberUser--;
    } else if (page === 'next' && this.pageNumberUser < this.totalPagesUser) {
      this.pageNumberUser++;
    }
    this.getAllRolesMethodCall();
  }

  getPagesUser(): number[] {
    const totalPages = Math.ceil(this.totalUser / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPagesUser(): number {
    return Math.ceil(this.totalUser / this.itemPerPage);
  }
  getStartIndexUser(): number {
    return (this.pageNumberUser - 1) * this.itemPerPage + 1;
  }
  getEndIndexUser(): number {
    const endIndex = this.pageNumberUser * this.itemPerPage;
    return endIndex > this.totalUser ? this.totalUser : endIndex;
  }

  onTableDataChangeUser(event: any) {
    this.pageNumberUser = event;
    // this.getAllRolesMethodCall();
  }

  routeToUserProfile(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    // this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], navExtra);
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
    return;
  }
}
