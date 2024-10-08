import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { error } from 'console';
import * as _ from 'lodash';
import { template } from 'lodash';
import * as moment from 'moment';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { Employeetype } from 'src/app/models/EmployeeType';
import { FullLeaveSettingRequest } from 'src/app/models/Full-Leave-Setting-Request';
import { FullLeaveSettingResponse } from 'src/app/models/full-leave-setting-response';
import { LeaveSettingCategoryResponse } from 'src/app/models/leave-categories-response';
import { LeaveCategory } from 'src/app/models/leave-category';
import { LeaveCycle } from 'src/app/models/leave-cycle';
import { LeaveSettingResponse } from 'src/app/models/leave-setting-response';
import { LeaveTemplateRequest } from 'src/app/models/leave-template-request';
import { LeaveTemplateResponse } from 'src/app/models/leave-template-response';
import { LeaveTemplateRes } from 'src/app/models/LeaveTemplateRes';
import { Staff } from 'src/app/models/staff';
import { StaffSelectionUserList } from 'src/app/models/staff-selection-userlist';
import { UnusedLeaveAction } from 'src/app/models/unused-leave-action';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { YearType } from 'src/app/models/year-type';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-leave-setting',
  templateUrl: './leave-setting.component.html',
  styleUrls: ['./leave-setting.component.css'],
})
export class LeaveSettingComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private helperService: HelperService
  ) {
    this.form = this.fb.group({
      categories: this.fb.array([]),
    });
    this.addRow();
  }

  readonly constants = constant;

  ngOnInit(): void {
    window.scroll(0, 0);

    this.getAllLeaveTemplate();

    this.getTeamNames();
    this.getUserByFiltersMethodCall(0);
    // this.getFullLeaveSettingInformation(); amit
    // this.findUsersOfLeaveSetting(30);
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
    const leaveId = localStorage.getItem('tempId');
    this.filteredLeaveCategories = []

    if (leaveId != null) {
      this.idFlag = true;
      this.localStorageLeaveRuleId = +leaveId;
    } else {
      this.idFlag = false;
      this.localStorageLeaveRuleId = 0;
    }

    this.leaveTemplateDefinitionForm = this.fb.group({
      employeeTypeId: [null, Validators.required], // The form control for employee type
      // Other form controls...
    });




  }

  

  localStorageLeaveRuleId!: number;

  idFlag: boolean = false;

  leaveSettingPlaceholder: boolean = false;

  leaveSettingResponse: LeaveSettingResponse = new LeaveSettingResponse();

  isFormValid: boolean = false;
  checkFormValidity(form: NgForm | null) {
    this.errorTemplateNameFlag = false;
    this.isFormValid = form?.valid ?? false;
  }



  // setAccrualType(accrualType: string) {
  //   this.leaveSettingResponse.accrualType = accrualType;
  // }

  // enterCountFlag: boolean = false;
  // setSandwichRules(rule: string) {
  //   this.leaveSettingResponse.sandwichRules = rule;
  //   if (rule === 'Count') {
  //     this.enterCountFlag = true;
  //   } else {
  //     this.enterCountFlag = false;
  //   }
  // }

  get categories(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  rowIndex: number = 1;
  addRow() {
    debugger

    // this.filteredLeaveCategories = [];

    const newRow = this.fb.group({
      leaveCategoryId: ['', Validators.required],
      leaveCycleId: ['', Validators.required],
      leaveCount: ['', [Validators.required, Validators.min(0)]],
      isSandwichLeave: [''],
      unusedLeaveActionId: [''],
      unusedLeaveActionCount: [''],
      accrualTypeId: [''],
      gender: ['']
      // accrualTypeId: ['', Validators.required]
    });

    this.categories.push(newRow);
  }

  deleteRow(index: number) {
    const categoriesArray = this.form.get('categories') as FormArray;
    categoriesArray.removeAt(index);
    this.helperService.showToast('Category removed successfully.', Key.TOAST_STATUS_SUCCESS);
  }

  hasError(controlName: string, index: number, errorName: string) {
    const control = this.categories.at(index)?.get(controlName);
    return control?.touched && control?.hasError(errorName);
  }

  itemPerPage: number = 8;
  pageNumber: number = 1;
  total!: number;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];

  searchUserPlaceholderFlag: boolean = false;
  crossFlag: boolean = false;

  resetCriteriaFilter() {
    this.itemPerPage = 8;
    this.pageNumber = 1;
  }

  searchUsers() {
    this.crossFlag = true;
    this.searchUserPlaceholderFlag = true;
    this.resetCriteriaFilter();
    this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
    if (this.searchText == '') {
      this.crossFlag = false;
    }
  }

  clearSearchUsers() {
    debugger;
    this.searchUserPlaceholderFlag = false;
    this.searchText = '';
    this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
    this.crossFlag = false;
  }

  // selectedStaffIds: string[] = [];
  selectedStaffIds: number[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;

  isStaffEmpty: boolean = false;

  staffSelectionUserList: StaffSelectionUserList = new StaffSelectionUserList();
  debounceTimer: any;
  getUserByFiltersMethodCall(
    leaveSettingId: number,
    debounceTime: number = 300
  ) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    debugger

    this.debounceTimer = setTimeout(() => {
      this.selectedStaffIds = [];

      this.dataService
        .getUsersByFilterForLeaveSetting(
          this.itemPerPage,
          this.pageNumber,
          'asc',
          'id',
          this.searchText,
          '',
          leaveSettingId,
          this.selectedTeamId
        )
        .subscribe(
          (response) => {
            
            // this.staffs = response.users.map(
            //   (staff: StaffSelectionUserList) => ({
            //     ...staff.user,
            //     selected: this.selectedStaffIds.includes(staff.user.id),
            //     isAdded: staff.mapped,
            //   })
            // );

            this.staffs = response.users;
            // .map(
            //   (staff: StaffSelectionUserList) => ({
            //     ...staff,
            //     selected: this.selectedStaffIds.includes(staff.id),
            //     // selected: this.selectedStaffIds.includes(staff.user.uuid),
            //     // isMapped:
            //     isAdded: staff.mapped,
            //   })
            // );

            this.total = response.count;

            if (this.total == 0) {
              this.isStaffEmpty = true;
            } else {
              this.isStaffEmpty = false;
            }

            // if(this.total==0){
            //   this.searchUserPlaceholderFlag = true;
            // }

            this.isAllSelected = this.staffs.every((staff) => staff.selected);

            console.log('staffs: ',this.staffs)
          },
          (error) => {
            console.error(error);
          }
        );
    }, debounceTime);
  }

  // isUserInLeaveRule(userId: string): boolean { amit
  //   const userLeaveRule = this.fullLeaveSettingResponse.userLeaveRule;
  //   return (
  //     userLeaveRule &&
  //     userLeaveRule.length > 0 &&
  //     userLeaveRule.some((rule) => rule.userIds.includes(userId))
  //   );
  // }

  checkIndividualSelection() {
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
  }

  checkAndUpdateAllSelected() {
    this.isAllSelected =
      this.staffs.length > 0 && this.staffs.every((staff) => staff.selected);
    this.isAllUsersSelected = this.selectedStaffIds.length === this.total;
  }

  updateSelectedStaffs() {
    this.staffs.forEach((staff) => {
      if (staff.selected && !this.selectedStaffIds.includes(staff.id)) {
        this.selectedStaffIds.push(staff.id);
      } else if (
        !staff.selected &&
        this.selectedStaffIds.includes(staff.id)
      ) {
        this.selectedStaffIds = this.selectedStaffIds.filter(
          (uuid) => uuid !== staff.id
        );
      }
    });

    this.checkAndUpdateAllSelected();

  }

  // #####################################################
  isAllUsersSelected: boolean = false;

  // Method to toggle all users' selection
  selectAllUsers(isChecked: boolean) {
    // const inputElement = event.target as HTMLInputElement;
    // const isChecked = inputElement ? inputElement.checked : false;
    this.isAllUsersSelected = isChecked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked)); // Update each staff's selected property

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffIds list
      // this.activeModel2 = true;
      this.getAllUsersUuids().then((allUuids) => {
        this.selectedStaffIds = allUuids;
      });
    } else {
      this.selectedStaffIds = [];
      // this.activeModel2 = false;
    }
  }

  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffIds based on the current page selection
    if (checked) {
      // this.activeModel2 = true;
      this.staffs.forEach((staff) => {
        if (!this.selectedStaffIds.includes(staff.id)) {
          this.selectedStaffIds.push(staff.id);
        }
      });
    } else {
      this.staffs.forEach((staff) => {
        if (this.selectedStaffIds.includes(staff.id)) {
          this.selectedStaffIds = this.selectedStaffIds.filter(
            (uuid) => uuid !== staff.id
          );
        }
      });
    }
  }

  // Asynchronous function to get all user UUIDs
  async getAllUsersUuids(): Promise<number[]> {
    const response = await this.dataService
      .getUsersByFilterForLeaveSetting(
        this.total,
        1,
        'asc',
        'id',
        this.searchText,
        '',
        this.idOfLeaveSetting,
        this.selectedTeamId
      )
      .toPromise();
 
    return response.users.map((userDto: any) => userDto.user.id);
    // return response.users.map((user: { uuid: any; }) => user.uuid);
  }

  // Call this method when the select all users checkbox value changes
  onSelectAllUsersChange(event: any) {
    this.selectAllUsers(event.target.checked);
  }

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffIds = [];
    // this.activeModel2 = false;
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
    this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
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
  }

  // *************** new

  fullLeaveSettingResponseList: FullLeaveSettingResponse[] = [];
  isLoading: boolean = false;
  isLeaveErrorPlaceholder: boolean = false;

  getFullLeaveSettingInformation(): void {
    this.isLoading = true;
    this.dataService.getFullLeaveSettingInformation().subscribe(
      (response) => {
        this.fullLeaveSettingResponseList = response;
        // this.helperService.registerOrganizationRegistratonProcessStepData(Key.LEAVE_TEMPLATE_ID, Key.PROCESS_COMPLETED);
        if (this.fullLeaveSettingResponseList.length == 1) {
          this.activeIndex = 0;
        }
        this.isLoading = false;
        if (response == null || response.length == 0) {
          this.leaveSettingPlaceholder = true;
          // this.helperService.registerOrganizationRegistratonProcessStepData(Key.LEAVE_TEMPLATE_ID, Key.PROCESS_PENDING);
        } else {
          this.leaveSettingPlaceholder = false;
        }
        this.templateSettingTab.nativeElement.click();
      },
      (error) => {
        this.isLeaveErrorPlaceholder = true;
        this.isLoading = false;
        // this.leaveSettingPlaceholder = true;
        console.error('Error fetching leave setting information:', error);
      }
    );
  }

  setLeaveRule(index: number, value: string): void {
    const leaveRulesControl = (this.form.get('categories') as FormArray)
      .at(index)
      ?.get('unusedLeaveAction');
    if (leaveRulesControl) {
      leaveRulesControl.setValue(value);
    }
  }

  // leaveSettingForm!:NgForm;
  fullLeaveSettingResponse!: FullLeaveSettingResponse;

  getLeaveSettingInformationById1(leaveSettingId: number, flag: boolean): void {

    this.pageNumber = 1;
    this.pageNumberUser = 1;
    this.dataService.getLeaveSettingInformationById(leaveSettingId).subscribe(
      (response) => {
        this.searchTextUser = '';
        this.searchText = '';
        this.selectedStaffIds = [];
        this.selectedStaffIdsUser = [];
        this.daysCountArray = [];
        this.errorTemplateNameFlag = false;
        this.fullLeaveSettingResponse = response;
        this.idOfLeaveSetting = leaveSettingId;
        this.leaveSettingResponse = this.fullLeaveSettingResponse.leaveSetting;
    
        if (flag) {
          this.templateSettingTab.nativeElement.click();
        }
        if (this.leaveSettingResponse != null) {
          this.isFormValid = true;
        }
   
        this.form.reset({ emitEvent: false });

        const categoriesArray = this.form.get('categories') as FormArray;

        // Clear the existing form controls
        categoriesArray.clear();

        response.leaveSettingCategories.forEach((category, index) => {
          // console.log(
          //   'index ..' + index + 'category.leaveCount ...' + category.leaveCount
          // );

          if (
            category.leaveRules == 'Carry Forward' ||
            category.leaveRules == 'Encash'
          ) {
            this.updateDaysDropdown(index, category.leaveCount);
          }

          const categoryGroup = this.fb.group({
            id: [category.id],
            leaveName: [category.leaveName, Validators.required],
            leaveCount: [
              category.leaveCount,
              [Validators.required, Validators.min(0)],
            ],
            leaveRules: [category.leaveRules],
            carryForwardDays: [category.carryForwardDays],
            accrualTypeId:[category.accrualTypeId],
            gender: [category.gender]

          });

          categoriesArray.push(categoryGroup);

        });

        this.getUserByFiltersMethodCall(leaveSettingId);
        this.findUsersOfLeaveSetting(leaveSettingId);
      },
      (error) => {
        console.error('Error fetching leave setting information by ID:', error);
      }
    );
  }

  //Update Leave Template
  getLeaveSettingInformationById(leaveSettingId: number, flag: boolean): void {

    this.pageNumber = 1;
    this.pageNumberUser = 1;
    this.dataService.getLeaveSettingInformationById(leaveSettingId).subscribe(
      (response) => {
        this.searchTextUser = '';
        this.searchText = '';
        this.selectedStaffIds = [];
        this.selectedStaffIdsUser = [];
        this.daysCountArray = [];
        this.errorTemplateNameFlag = false;
        this.fullLeaveSettingResponse = response;
        this.idOfLeaveSetting = leaveSettingId;
        this.leaveSettingResponse = this.fullLeaveSettingResponse.leaveSetting;
    
        if (flag) {
          this.templateSettingTab.nativeElement.click();
        }
        if (this.leaveSettingResponse != null) {
          this.isFormValid = true;
        }
   
        this.form.reset({ emitEvent: false });

        const categoriesArray = this.form.get('categories') as FormArray;

        // Clear the existing form controls
        categoriesArray.clear();

        // response.leaveSettingCategories.forEach((category, index) => {
        response.leaveSettingCategories.forEach((category, index) => {

          if (
            category.leaveRules == 'Carry Forward' ||
            category.leaveRules == 'Encash'
          ) {
            this.updateDaysDropdown(index, category.leaveCount);
          }

          const categoryGroup = this.fb.group({
            id: [category.id],
            leaveName: [category.leaveName, Validators.required],
            leaveCount: [
              category.leaveCount,
              [Validators.required, Validators.min(0)],
            ],
            leaveRules: [category.leaveRules],
            carryForwardDays: [category.carryForwardDays],
            accrualTypeId:[category.accrualTypeId],
            gender: [category.gender]

          });

          categoriesArray.push(categoryGroup);

        });

        this.getUserByFiltersMethodCall(leaveSettingId);
        this.findUsersOfLeaveSetting(leaveSettingId);
      },
      (error) => {
        console.error('Error fetching leave setting information by ID:', error);
      }
    );
  }


  @ViewChild('templateSettingTab') templateSettingTab!: ElementRef;
  @ViewChild('newStaffSelectionTab') newStaffSelectionTab!: ElementRef;
  openStaffSelection() {
    this.newStaffSelectionTab.nativeElement.click();
  }
  @ViewChild('leaveSettingForm') leaveSettingForm!: NgForm;
  //  leaveSettingForm!: NgForm;
  emptyAddLeaveSettingRule() {
    debugger;

    this.idOfLeaveSetting = 0;
    this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
    this.staffsUser = [];
    this.totalUser = 0;
    this.isMappedStaffEmpty = true;
    // this.getUserByFiltersMethodCall();
    this.templateSettingTab.nativeElement.click();
    this.unselectAllUsers();
    this.selectedStaffIds = [];
    this.selectedStaffIdsUser = [];
    // this.selectedStaffIds.length = 0;

    // this.leaveSettingForm.form.reset();
    this.leaveSettingResponse = new LeaveSettingResponse();
    this.leaveSettingResponse.templateName = '';
    this.form.reset();

    // Clear the existing form controls
    const categoriesArray = this.form.get('categories') as FormArray;
    categoriesArray.clear();
    this.addRow();
  }

  deleteLeaveTemplateLoader(id: any): boolean {
    return this.deleteLeaveLoaderStatus[id] || false;
  }

  deleteLeaveLoaderStatus: { [key: string]: boolean } = {};
  // deleteLeaveLoader:boolean=false;
  deleteLeaveSettingRule(leaveSettingId: number): void {
    this.deleteLeaveLoaderStatus[leaveSettingId] = true;
    this.dataService.deleteLeaveSettingRule(leaveSettingId).subscribe(
      () => {
        this.deleteLeaveLoaderStatus[leaveSettingId] = false;
        this.getFullLeaveSettingInformation();
        this.helperService.showToast(
          'Leave rule deleted successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.deleteLeaveLoaderStatus[leaveSettingId] = false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  // ###################### saveInOne ###################

  fullLeaveSettingRuleRequest: FullLeaveSettingRequest = new FullLeaveSettingRequest();
  @ViewChild('requestLeaveCloseModel') requestLeaveCloseModel!: ElementRef;
  submitLeaveLoader: boolean = false;

  saveLeaveSettingRules(flag: boolean) {
    debugger
    this.fullLeaveSettingRuleRequest.leaveSettingResponse = this.leaveSettingResponse;
    if (constant.EMPTY_STRINGS.includes(this.leaveSettingResponse.templateName)) {
      this.errorTemplateNameFlag = true;
      this.templateSettingTab.nativeElement.click();
      return;
    } else {
      this.errorTemplateNameFlag = false;
    }
   

    const leaveSettingCategories = this.form.value.categories.map(
      (category: any) => ({
        id: category.id, // Ensure the ID is being mapped
        leaveName: category.leaveName,
        leaveCount: category.leaveCount,
        leaveRules: category.leaveRules,
        carryForwardDays: category.carryForwardDays,
        accrualTypeId: category.accrualTypeId,
        gender: category.gender
      })
    );

    this.fullLeaveSettingRuleRequest.leaveSettingCategoryResponse =
      leaveSettingCategories;
    this.fullLeaveSettingRuleRequest.userIds = [
      ...this.selectedStaffIds,
      ...this.selectedStaffIdsUser,
    ];
    // selectedStaffIdsUser;

    if (flag) {
      this.submitLeaveLoader = true;
      this.dataService
        .registerLeaveSettingRules(this.fullLeaveSettingRuleRequest)
        .subscribe(
          (response) => {
            this.getFullLeaveSettingInformation();
            this.submitLeaveLoader = false;
            this.requestLeaveCloseModel.nativeElement.click();
            this.helperService.showToast(
              'Leave rules registered successfully',
              Key.TOAST_STATUS_SUCCESS
            );
            this.helperService.registerOrganizationRegistratonProcessStepData(Key.LEAVE_TEMPLATE_ID, Key.PROCESS_COMPLETED);
          },
          (error) => {
            this.submitLeaveLoader = false;
            this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
          }
        );
    } else if (!flag) {
      for (const userId of this.fullLeaveSettingRuleRequest.userIds) {
        this.loadingStatus[userId] = true;
      }
      this.selectedStaffIdsUser = [];

      this.dataService
        .registerLeaveSettingRules(this.fullLeaveSettingRuleRequest)
        .subscribe(
          (response) => {
            this.idOfLeaveSetting = response.leaveSettingResponse.id;
            this.getUserByFiltersMethodCall(this.idOfLeaveSetting);

            for (const userId of this.fullLeaveSettingRuleRequest.userIds) {
              this.loadingStatus[userId] = false;
            }
            this.isMappedStaffEmpty = false;
            this.addedUserFlag = true;
            //  this.selectedStaffIds = [userId];
            //  const staffToUpdate = this.staffs.find(staff => staff.id === userId);
            //  if (staffToUpdate) {
            //     staffToUpdate.isAdded = true;

            //   }
            this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
            // this.getFullLeaveSettingInformation();
            // this.requestLeaveCloseModel.nativeElement.click();
            this.helperService.showToast(
              'Leave rules registered successfully',
              Key.TOAST_STATUS_SUCCESS
            );
            this.helperService.registerOrganizationRegistratonProcessStepData(Key.LEAVE_TEMPLATE_ID, Key.PROCESS_COMPLETED);
          },
          (error) => {
            for (const userId of this.fullLeaveSettingRuleRequest.userIds) {
              this.loadingStatus[userId] = false;
            }
            console.error('Error registering leave setting:', error);
            this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
          }
        );
    }
  }

  @ViewChild('leaveCategoryTab') leaveCategoryTab!: ElementRef;

  goToLeaveCategoryTab() {
    if (this.leaveSettingResponse.templateName == null) {
      this.isFormValid = false;
      return;
    }
    this.errorTemplateNameFlag = false;
    this.leaveCategoryTab.nativeElement.click();
  }

  @ViewChild('staffSelectionTab') staffSelectionTab!: ElementRef;

  goToStaffSelectionTab() {
    this.staffSelectionTab.nativeElement.click();
  }

  rowNumberUser: number = 1;
  staffsUser: Staff[] = [];
  searchTextUser = '';
  pageNumberUser: number = 1;
  itemPerPageUser: number = 8;
  totalUser: number = 0;

  idOfLeaveSetting: number = 0;

  searchSelectedUserPlaceholderFlag: boolean = false;

  crossFlagUser: boolean = false;

  resetCriteriaFilterUser() {
    this.itemPerPageUser = 8;
    this.pageNumberUser = 1;
  }

  searchLeaveUsers(leaveSettingId: number) {
    this.crossFlagUser = true;
    this.searchSelectedUserPlaceholderFlag = true;
    this.resetCriteriaFilterUser();
    this.findUsersOfLeaveSetting(leaveSettingId);
    if (this.searchTextUser == '') {
      this.crossFlagUser = false;
    }
  }

  clearSearchSelectedUsers() {
    this.searchSelectedUserPlaceholderFlag = false;
    this.searchTextUser = '';
    this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
    this.crossFlagUser = false;
  }
  isMappedStaffEmpty: boolean = false;
  // debounceTimer: any;
  findUsersOfLeaveSetting(
    leaveSettingId: number,
    debounceTime: number = 300
  ): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.selectedStaffIdsUser = [];
      this.dataService
        .findUsersOfLeaveSetting(
          leaveSettingId,
          this.searchTextUser,
          this.pageNumberUser,
          this.itemPerPageUser,
          this.selectedTeamIdOfAddedUsers
        )
        .subscribe((response) => {
          this.staffsUser = response;

          this.staffsUser = response.users.map((staff: Staff) => ({
            ...staff,
            selected: this.selectedStaffIdsUser.includes(staff.id),
          }));
          this.totalUser = response.count;

          if (this.totalUser == 0) {
            this.isMappedStaffEmpty = true;
          } else {
            this.isMappedStaffEmpty = false;
          }

          this.isAllSelectedUser = this.staffsUser.every(
            (staff) => staff.selected
          );
        });
    }, debounceTime);
  }

  // ############# pagination mapped user tab

  changeUserPage(newpage: number | string) {
    if (typeof newpage === 'number') {
      this.pageNumberUser = newpage;
    } else if (newpage === 'prev' && this.pageNumberUser > 1) {
      this.pageNumberUser--;
    } else if (
      newpage === 'next' &&
      this.pageNumberUser < this.totalUserPages
    ) {
      this.pageNumberUser++;
    }
    this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
  }

  getUserPages(): number[] {
    const totalUserPages = Math.ceil(this.totalUser / this.itemPerPageUser);
    return Array.from({ length: totalUserPages }, (_, index) => index + 1);
  }

  get totalUserPages(): number {
    return Math.ceil(this.totalUser / this.itemPerPageUser);
  }
  getUserStartIndex(): number {
    return (this.pageNumberUser - 1) * this.itemPerPageUser + 1;
  }
  getUserEndIndex(): number {
    const endIndex = this.pageNumberUser * this.itemPerPageUser;
    return endIndex > this.totalUser ? this.totalUser : endIndex;
  }

  onUserTableDataChange(event: any) {
    this.pageNumberUser = event;
  }

  // ########### Selection func....

  selectedStaffIdsUser: number[] = [];
  selectedStaffsUser: Staff[] = [];
  isAllSelectedUser: boolean = false;


  checkIndividualSelectionUser() {
    this.isAllUsersSelectedUser = this.staffsUser.every(
      (staff) => staff.selected
    );
    this.isAllSelectedUser = this.isAllUsersSelectedUser;
    this.updateSelectedStaffsUser();
  }

  checkAndUpdateAllSelectedUser() {
    this.isAllSelectedUser =
      this.staffsUser.length > 0 &&
      this.staffsUser.every((staff) => staff.selected);
    this.isAllUsersSelectedUser =
      this.selectedStaffIdsUser.length === this.totalUser;
  }

  updateSelectedStaffsUser() {
    this.staffsUser.forEach((staff) => {
      if (
        staff.selected &&
        !this.selectedStaffIdsUser.includes(staff.id)
      ) {
        this.selectedStaffIdsUser.push(staff.id);
      } else if (
        !staff.selected &&
        this.selectedStaffIdsUser.includes(staff.id)
      ) {
        this.selectedStaffIdsUser = this.selectedStaffIdsUser.filter(
          (uuid) => uuid !== staff.id
        );
      }
    });

    this.checkAndUpdateAllSelectedUser();
  }
  isAllUsersSelectedUser: boolean = false;

  // Method to toggle all users' selection
  selectAllUsersUser(isChecked: boolean) {
    // const inputElement = event.target as HTMLInputElement;
    // const isChecked = inputElement ? inputElement.checked : false;
    this.isAllUsersSelectedUser = isChecked;
    this.isAllSelectedUser = isChecked; // Make sure this reflects the change on the current page
    this.staffsUser.forEach((staff) => (staff.selected = isChecked)); // Update each staff's selected property

    if (isChecked) {
      this.getAllUsersUuidsUser().then((allUuids) => {
        this.selectedStaffIdsUser = allUuids;
      });
    } else {
      this.selectedStaffIdsUser = [];
    }
  }

  selectAllUser(checked: boolean) {
    this.isAllSelectedUser = checked;
    this.staffsUser.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffIds based on the current page selection
    if (checked) {
      // this.activeModel2 = true;
      this.staffsUser.forEach((staff) => {
        if (!this.selectedStaffIdsUser.includes(staff.id)) {
          this.selectedStaffIdsUser.push(staff.id);
        }
      });
    } else {
      this.staffsUser.forEach((staff) => {
        if (this.selectedStaffIdsUser.includes(staff.id)) {
          this.selectedStaffIdsUser = this.selectedStaffIdsUser.filter(
            (uuid) => uuid !== staff.id
          );
        }
      });
    }
  }

  async getAllUsersUuidsUser(): Promise<number[]> {
    const response = await this.dataService
      .findUsersOfLeaveSetting(
        this.idOfLeaveSetting,
        '',
        1,
        this.totalUser,
        this.selectedTeamIdOfAddedUsers
      )
      .toPromise();
    return response.users.map((user: { uuid: any }) => user.uuid);
    // return this.selectedStaffIdsUser;
  }

  onSelectAllUsersChangeUser(event: any) {
    this.selectAllUsersUser(event.target.checked);
  }

  unselectAllUsersUser() {
    this.isAllUsersSelectedUser = false;
    this.isAllSelectedUser = false;
    this.staffsUser.forEach((staff) => (staff.selected = false));
    this.selectedStaffIdsUser = [];
    // this.activeModel2 = false;
  }

  // ##########b

  //

  deleteAllUsers(): void {
    for (const userId of this.selectedStaffIdsUser) {
      this.loadingDeleteStatus[userId] = true;
    }
    this.dataService
      .deleteAllUsersByLeaveSettingId(this.selectedStaffIdsUser)
      .subscribe(
        () => {
          for (const userId of this.selectedStaffIdsUser) {
            this.loadingDeleteStatus[userId] = false;
          }
          this.selectedStaffIds = [];
          this.selectedStaffIdsUser = [];
          this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
          this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
          // this.getLeaveSettingInformationById(this.idOfLeaveSetting);
          // this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
        },
        (error) => {
          for (const userId of this.selectedStaffIdsUser) {
            this.loadingDeleteStatus[userId] = true;
          }
        }
      );
  }

  deleteEmployeeLoader(staff: any): boolean {
    return this.loadingDeleteStatus[staff.id] || false;
  }

  loadingDeleteStatus: { [key: string]: boolean } = {};

  deleteUser(userId: string): void {
    this.loadingDeleteStatus[userId] = true;
    this.dataService.deleteUserFromUserLeaveRule(userId).subscribe(
      () => {
        this.selectedStaffIds = [];
        this.selectedStaffIdsUser = [];
        this.loadingDeleteStatus[userId] = false;
        this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
        this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
      },
      (error) => {
        // console.error('Error deleting user:', error);
        this.loadingDeleteStatus[userId] = false;
      }
    );
  }

  addEmployeeLoader(staff: any): boolean {
    return this.loadingStatus[staff.id] || false;
  }

  loadingStatus: { [key: string]: boolean } = {};
  staffAddedFlag: boolean = false;
  addedUserFlag: boolean = false;
  errorTemplateNameFlag: boolean = false;

  // addUser(userId: string, leaveSettingId: number): void { amit
  addUser(userId: number, leaveSettingId: number): void {
    this.loadingStatus[userId] = true;
    this.selectedStaffIdsUser = [];

    if (leaveSettingId == 0) {
      this.fullLeaveSettingRuleRequest.leaveSettingResponse =
        this.leaveSettingResponse;
      if (
        constant.EMPTY_STRINGS.includes(this.leaveSettingResponse.templateName)
      ) {
        this.errorTemplateNameFlag = true;
        this.templateSettingTab.nativeElement.click();
        return;
      } else {
        this.errorTemplateNameFlag = false;
      }
      const leaveSettingCategories = this.form.value.categories.map(
        (category: any) => ({
          ...category,
        })
      );
      this.fullLeaveSettingRuleRequest.leaveSettingCategoryResponse =
        leaveSettingCategories;
      this.fullLeaveSettingRuleRequest.userIds = [userId];
      // selectedStaffIdsUser;

      this.dataService
        .registerLeaveSettingRules(this.fullLeaveSettingRuleRequest)
        .subscribe(
          (response) => {
            this.idOfLeaveSetting = response.leaveSettingResponse.id;
            // this.getFullLeaveSettingInformation();
            // this.requestLeaveCloseModel.nativeElement.click();
            this.loadingStatus[userId] = false;
            this.isMappedStaffEmpty = false;
            this.addedUserFlag = true;
            this.selectedStaffIds = [userId];
            const staffToUpdate = this.staffs.find(
              (staff) => staff.id === userId
            );
            if (staffToUpdate) {
              staffToUpdate.isAdded = true;
              // this.staffAddedFlag=true;
            }
            this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
            // this.getLeaveSettingInformationById(this.idOfLeaveSetting);
            // this.selectedStaffIdsUser = [...this.selectedStaffIdsUser, userId];
          },
          (error) => {
            // console.error('Error registering leave setting:', error);
            this.loadingStatus[userId] = false;
          }
        );
    } else {
      this.dataService.addUserToLeaveRule(userId, leaveSettingId).subscribe(
        (response) => {
          this.isMappedStaffEmpty = false;
          this.addedUserFlag = true;
          this.loadingStatus[userId] = false;
          // this.selectedStaffIds = [userId];
          const staffToUpdate = this.staffs.find(
            (staff) => staff.id === userId
          );
          if (staffToUpdate) {
            staffToUpdate.isAdded = true;
            // this.staffAddedFlag=true;
          }
          this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
          // this.selectedStaffIdsUser = [...this.selectedStaffIdsUser, userId];
        },
        (error) => {
          this.loadingStatus[userId] = false;
        }
      );
    }
  }

  updateEndDate() {
    const startDate = new Date(this.leaveSettingResponse.yearlyCycleStart);

    const nextYearDate = new Date(startDate);
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);

    this.leaveSettingResponse.yearlyCycleEnd = new Date(nextYearDate);
    // console.log('oldFormat-----'+this.leaveSettingResponse.yearlyCycleEnd)
    this.leaveSettingResponse.yearlyCycleEnd = moment(
      this.leaveSettingResponse.yearlyCycleEnd
    ).format('yyyy-MM-DD');
    // console.log('new Format-----'+this.leaveSettingResponse.yearlyCycleEnd)
  }

  activeIndex: number | null = null;
  toggleCollapse(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  deleteLeaveSettingCategoryById(id: number): void {
    debugger
    this.dataService.deleteLeaveSettingCategoryById(id).subscribe({
      next: () => {
        console.log('Delete successful');
        this.getFullLeaveSettingInformation();
        this.helperService.showToast(
          'Leave Category deleted',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      error: (err) => {
        console.error('Delete failed', err);
      },
    });
  }

  leaveTemplateCategoryId: number = 0;
  leaveTemplateId: number = 0;
  isLeaveTemplate: boolean = false;
  @ViewChild('closeButtonDeleteLeave') closeButtonDeleteLeave!: ElementRef
  getLeaveTemplateOrCategoryId(id: number, isLeaveTemplate: boolean){
    // this.leaveTemplateCategoryId = id;
    if(isLeaveTemplate){
      this.leaveTemplateCategoryId = 0;
      this.leaveTemplateId = id;
    }else{
      this.leaveTemplateId = 0;
      this.leaveTemplateCategoryId = id;
    }

  }

  // deleteLeaveTemplateCategory(id: number){ amit
  deleteToggle: boolean = false;
  deleteLeaveTemplateCategory(){
    this.deleteToggle = true;
    this.dataService.deleteLeaveTemplateCategory(this.leaveTemplateCategoryId).subscribe((response: any) => {
      if(response.status){
        this.leaveTemplateCategoryId = 0;
        this.closeButtonDeleteLeave.nativeElement.click()
        this.deleteToggle = false;
        this.getAllLeaveTemplate();
        this.helperService.showToast(
          'Leave Category Deleted',
          Key.TOAST_STATUS_SUCCESS
        );
      }else{
        this.leaveTemplateCategoryId = 0;
        this.deleteToggle = false;
        this.helperService.showToast(
          'Something went wrong!',
          Key.TOAST_STATUS_ERROR
        );
      }
    })
  }

  // deleteLeaveTemplate(id: number){ amit
  deleteLeaveTemplate(){
    this.deleteToggle = true;
    this.dataService.deleteLeaveTemplate(this.leaveTemplateId).subscribe((response: any) => {
      if(response.status){
        this.getAllLeaveTemplate();
        this.leaveTemplateId = 0;
        this.closeButtonDeleteLeave.nativeElement.click()
        this.deleteToggle = false;
        this.helperService.showToast(
          'Leave Template Deleted',
          Key.TOAST_STATUS_SUCCESS
        );
      }else{
        this.leaveTemplateId = 0;
        this.deleteToggle = false;
        this.helperService.showToast(
          'Something went wrong!',
          Key.TOAST_STATUS_ERROR
        );
      }
    })
  }

  onChange(value: LeaveCategory): void {
    if(value != null){
      this.filteredLeaveCategories = this.leaveCategoryList.filter((leaveCategory) =>
        leaveCategory.name.toLowerCase().includes(value.name.toLowerCase())
      );
    }
  }


  // filteredLeaveCategories: LeaveCategory[] = [];
  
  leaveCategories: string[] = ['Annual Leave', 'Sick Leave', 'Casual Leave'];

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    // Prevent leading spaces
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
    // Prevent numeric input entirely
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
    }
  }

  daysCountArray: number[][] = [];
  dropdownVisible: boolean = false;

  generateDaysDropdown(value: any, index: number): void {
    const count = parseInt(value, 10);
    // this.daysCountArray[index] = Array.from(
    //   { length: count + 1 },
    //   (_, i) => count - i
    // );
    this.updateDaysDropdown(index, count);
  }


  updateDaysDropdown(index: number, count: number): void {
    // console.log('countarray ..' + index + ' ' + count);
    while (this.daysCountArray.length <= index) {
      this.daysCountArray.push([]);
    }
    this.daysCountArray[index] = Array.from(
      { length: count + 1 },
      (_, i) => count - i
    );
  }


  selectCarryForwardDay(day: number, index: number): void {
    const categories = this.form.get('categories') as FormArray;
    const control = categories.at(index)?.get('carryForwardDays');
    if (control) {
      control.setValue(day);
    }
    this.dropdownVisible = false;
  }

  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  editLeaveCategories(id: number) {
    this.getLeaveSettingInformationById(id, false);
    this.leaveCategoryTab.nativeElement.click();
  }

  calculateMonthlyLeaveCount(index: number): number {
    const control = this.categories.controls[index].get('leaveCount');
    if (control) {
      const yearlyCount = control.value;
      return yearlyCount / 12;
    }
    return 0;
  }

  teamNameList: UserTeamDetailsReflection[] = [];

  teamId: number = 0;
  getTeamNames() {
    debugger;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.teamNameList = response.object;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
      },
    });
  }

  page = 0;
  selectedTeamName: string = 'All';
  selectedTeamId: number = 0;
  selectTeam(teamId: number) {
    debugger;
    if (teamId === 0) {
      this.selectedTeamName = 'All';
    } else {
      const selectedTeam = this.teamNameList.find(
        (team) => team.teamId === teamId
      );
      this.selectedTeamName = selectedTeam ? selectedTeam.teamName : 'All';
    }
    this.pageNumber = 1;
    this.itemPerPage = 8;
    // this.fullLeaveLogs = [];
    // this.selectedTeamName = teamName;
    this.selectedTeamId = teamId;
    // this.getUserByFiltersMethodCall();
    this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
  }

  // pageOfAddedUsers = 0;
  selectedTeamNameOfAddedUsers: string = 'All';
  selectedTeamIdOfAddedUsers: number = 0;
  selectTeamSearchForAddedUsers(teamId: number) {
    debugger;
    if (teamId === 0) {
      this.selectedTeamNameOfAddedUsers = 'All';
    } else {
      const selectedTeam = this.teamNameList.find(
        (team) => team.teamId === teamId
      );
      this.selectedTeamNameOfAddedUsers = selectedTeam
        ? selectedTeam.teamName
        : 'All';
    }
    this.pageNumberUser = 1;
    this.itemPerPageUser = 8;
    // this.fullLeaveLogs = [];
    // this.selectedTeamName = teamName;
    this.selectedTeamIdOfAddedUsers = teamId;
    // this.getUserByFiltersMethodCall();
    this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
  }

  // Code written by Shivendra
  booleanList : string[] = ['Yes', 'No'];

  leaveCategoryList : LeaveCategory[] = [];
  getLeaveCategoryListMethodCall(){
    this.dataService.getLeaveCategoryList().subscribe((response) => {
      if(!this.helperService.isListOfObjectNullOrUndefined(response)){
        this.leaveCategoryList = response.listOfObject;
      }
    }, (error) => {

    })
  }

  leaveCycleList : LeaveCycle[] = [];
  getLeaveCycleListMethodCall(){
    this.dataService.getLeaveCycleList().subscribe((response) => {
      if(!this.helperService.isListOfObjectNullOrUndefined(response)){
        this.leaveCycleList = response.listOfObject;
      }
    }, (error) => {

    })
  }

  unusedLeaveActionList : UnusedLeaveAction[] = [];
  getUnusedLeaveActionList(){
    this.dataService.getUnusedLeaveActionList().subscribe((response) => {
      if(!this.helperService.isListOfObjectNullOrUndefined(response)){
        this.unusedLeaveActionList = response.listOfObject;
      } 
    }, (error) => {

    })
  }


  /** Find all employeeType method and Gender and AccrualType  */
  employeeTypeList: Employeetype[] = [];
  getAllEmployeeType(){
    this.dataService.getAllEmployeeType().subscribe((response: any) => {
      if(response.status){
        this.employeeTypeList = response.object;
      }else{
        this.employeeTypeList = [];
      }
    })
  }

  employeeTypeId: number = 1;
  onEmployeeTypeChange(id: number){
    this.employeeTypeId = id;

    this.leaveTemplateRequest.employeeTypeId = id;
  }

  genders: Array<{id: number, name: string, value: string }> = []; // Gender options
  loadGenders() {
    this.genders = [
      {id: 1, name: 'All', value: 'all' },
      {id: 2, name: 'Male', value: 'male' },
      {id: 3, name: 'Female', value: 'female' }
    ];
  }

  
  // selectedGenderId: number = 1;
  selectedGenderId: number = 0;
  // gender: string = 'All';
  gender: any = null;

  filteredLeaveCategories: any;
      onGenderChange(value: any, i: number) {
        debugger

        if(value != null){

        if(value == 'Male'){
          this.selectedGenderId = 2;
        }else if(value == 'Female'){
          this.selectedGenderId = 3
        }else{
          this.selectedGenderId = 1;
        }

        this.leaveTemplateRequest.gender = 'All';
      //  this.selectedGenderId = id;  // Store the selected gender ID
   
       // Initialize filteredLeaveCategories if it doesn't exist
       if (!this.filteredLeaveCategories) {
         this.filteredLeaveCategories = [];
     }
   
     // Ensure the index exists in filteredLeaveCategories
     if (!this.filteredLeaveCategories[i]) {
         this.filteredLeaveCategories[i] = [...this.leaveCategoryList]; // Initialize with original list
     }
   
     // Filter based on the selected gender and index
     if (this.selectedGenderId == 2) {
         // Example: Exclude leave category with id 3 for males
         this.filteredLeaveCategories[i] = this.filteredLeaveCategories[i].filter((leaveCategory: any) => leaveCategory.id !== 3);
         this.leaveTemplateRequest.gender = 'Male';
     } else if (this.selectedGenderId == 3) {
         // Example: Exclude leave category with id 4 for females
         this.filteredLeaveCategories[i] = this.filteredLeaveCategories[i].filter((leaveCategory: any) => leaveCategory.id !== 4);
         this.leaveTemplateRequest.gender = 'Female';
     } else if (this.selectedGenderId == 1) {
         // Reset to original list if 'All' is selected
         this.filteredLeaveCategories[i] = [...this.leaveCategoryList];
         this.leaveTemplateRequest.gender = 'All';
     }
     
         this.gender = this.leaveTemplateRequest.gender;
         console.log('selectedGenderName: ',this.gender)
         console.log('form: ',this.leaveTemplateRequest)
    }else{

      this.gender = null;
      this.selectedGenderId = 0

    }
     
         // console.log('leaveCategoryList: ',this.leaveCategoryList)
         // console.log('filteredLeaveCategories: ',this.filteredLeaveCategories)
     
       }

    //Accrual Type start
    accrualTypes: Array<{id: number, name: string, value: string }> = []; // Gender options
    loadAccrualType() {
      this.accrualTypes = [
        {id: 1, name: 'Start', value: 'start' },
        {id: 2, name: 'End', value: 'end' }
      ];

      // this.accrualTypes = [
      //   {id: 1, name: 'All At Once', value: 'all' },
      //   {id: 2, name: 'Start', value: 'start' },
      //   {id: 3, name: 'End', value: 'end' }
      // ];
    }
  
    selectedAccrualTypeId: number = 0;
    onAccrualChange(id: number) {
      this.selectedAccrualTypeId = id;  // Store the selected gender ID
      // this.leaveTemplateRequest.leaveTemplateCategoryRequestList
      
      // this.newRow.patchValue({
      //   accrualTypeId: 'yourValue'  // Replace 'yourValue' with the actual data you want to set
      // });
  }

  leaveCycleStartDate: any;
  leaveCycleEndDate: any;
  onLeaveCycleChange(id: number) {
    const currentDate = new Date(); // Get the current date

    if (id === 1) {
      // Monthly
      this.leaveCycleStartDate = this.helperService.formatDateToYYYYMMDD(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      this.leaveCycleEndDate = this.helperService.formatDateToYYYYMMDD(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
  
    } else if (id === 2) {
      // Quarterly
      this.leaveCycleStartDate = this.helperService.formatDateToYYYYMMDD(new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3, 1)); // Start of the current quarter
      this.leaveCycleEndDate = this.helperService.formatDateToYYYYMMDD(new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3 + 3, 0)); // End of the current quarter
  
    } else if (id === 3) {
      // Half Yearly
      this.leaveCycleStartDate = this.helperService.formatDateToYYYYMMDD(new Date(currentDate.getFullYear(), currentDate.getMonth() < 6 ? 0 : 6, 1)); // Start of the current half-year
      this.leaveCycleEndDate = this.helperService.formatDateToYYYYMMDD(new Date(currentDate.getFullYear(), currentDate.getMonth() < 6 ? 6 : 12, 0)); // End of the current half-year
  
    } else if (id === 4) {
      // Yearly
      this.leaveCycleStartDate = this.helperService.formatDateToYYYYMMDD(new Date(currentDate.getFullYear(), 0, 1)); // Start of the current year
      this.leaveCycleEndDate = this.helperService.formatDateToYYYYMMDD(new Date(currentDate.getFullYear(), 12, 0)); // End of the current year
    }
    
    // console.log('sDate: ',this.leaveCycleStartDate)
    // console.log('eDate: ',this.leaveCycleEndDate)

  }

  //end



  readonly ANNUAL_YEAR = Key.ANNUAL_YEAR;
  readonly FINANCIAL_YEAR = Key.FINANCIAL_YEAR;
  yearTypeList : YearType[] = [];
  getYearTypeListMethodCall(){
    this.dataService.getYearTypeList().subscribe((response) => {
      if(!this.helperService.isListOfObjectNullOrUndefined(response)){
        this.yearTypeList = response.listOfObject;

        console.log('yearTypeList: ',this.employeeTypeId)

      } 
    })
  }




  dateRange: Date[] = [];
  size: 'large' | 'small' | 'default' = 'small';  
  selectDateForLeaveTemplateRequest1(yearTypeName: string) {

    debugger

    if (yearTypeName == this.ANNUAL_YEAR) {
      this.dateRange[0] = new Date(new Date().getFullYear(), 0, 1);
      this.dateRange[1] = new Date(new Date().getFullYear(), 11, 31);
    } else if (yearTypeName == this.FINANCIAL_YEAR) {
      this.dateRange[0] = new Date(new Date().getFullYear(), 3, 1);
      this.dateRange[1] = new Date(new Date().getFullYear() + 1, 2, 31);
    }
  
    this.leaveTemplateRequest.yearTypeName = yearTypeName; 
    this.leaveTemplateRequest.startDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[0]);
    this.leaveTemplateRequest.endDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[1]);
  }

  //amit code
isCustomDateRange: boolean = false;
selectDateForLeaveTemplateRequest(yearTypeName: string) {
  this.isCustomDateRange = (yearTypeName === 'Custom Date Range');

  if (yearTypeName === this.ANNUAL_YEAR) {
    this.dateRange[0] = new Date(new Date().getFullYear(), 0, 1);
    this.dateRange[1] = new Date(new Date().getFullYear(), 11, 31);
  } else if (yearTypeName === this.FINANCIAL_YEAR) {
    this.dateRange[0] = new Date(new Date().getFullYear(), 3, 1);
    this.dateRange[1] = new Date(new Date().getFullYear() + 1, 2, 31);
  }

  if (!this.isCustomDateRange) {
    this.leaveTemplateRequest.yearTypeName = yearTypeName;
    this.leaveTemplateRequest.startDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[0]);
    this.leaveTemplateRequest.endDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[1]);
  } else {
    // Leave it blank for custom date selection
    this.leaveTemplateRequest.startDate = '';
    this.leaveTemplateRequest.endDate = '';
  }

  // this.leaveTemplateRequest.yearTypeName = yearTypeName;
}

// Watch for changes in the start date for the custom date range
onStartDateChange(startDate: Date) {
  if (this.isCustomDateRange && startDate) {
    this.dateRange[0] = startDate;
    
    // Set the end date to the same day next year
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);

    // Go one month back and get the last day of that month
    endDate.setMonth(startDate.getMonth() - 1);
    const lastDayOfPreviousMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    endDate.setDate(lastDayOfPreviousMonth); // Set to last day of previous month

    this.dateRange[1] = endDate;

    this.leaveTemplateRequest.startDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[0]);
    this.leaveTemplateRequest.endDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[1]);
  }
}


// custom date select end

  
  leaveTemplateDefinitionForm !: FormGroup;

  leaveTemplateRequest : LeaveTemplateRequest = new LeaveTemplateRequest();
  readonly LAPSE = Key.LAPSE;
  readonly CARRY_FORWARD = Key.CARRY_FORWARD;
  readonly ENCASH = Key.ENCASH;

  preMethodCallToCreateLeaveTemplate(){
    debugger
    this.getYearTypeListMethodCall(); 
    this.getLeaveCycleListMethodCall(); 
    this.getLeaveCategoryListMethodCall(); 
    this.getUnusedLeaveActionList();
    this.getAllEmployeeType();
    this.loadGenders();
    this.loadAccrualType();

    this.filteredLeaveCategories = []
    // setTimeout(() =>{
    //   this.onEmployeeTypeChange(1);
    //   this.onGenderChange(1);
    // }, 500);
   
  }
  setFieldsToLeaveTemplateRequest(){
    debugger
    this.leaveTemplateRequest.leaveTemplateCategoryRequestList = this.form.value.categories.map(
      (category: any) => ({
        id: category.leaveCategoryId,
        leaveCycleId: category.leaveCycleId,
        leaveCount: category.leaveCount,
        sandwichLeave: category.isSandwichLeave,
        unusedLeaveActionId: category.unusedLeaveActionId,
        unusedLeaveActionCount: category.unusedLeaveActionCount,
        accrualTypeId: category.accrualTypeId,
        gender: category.gender

      })
    );

    this.leaveTemplateRequest.userIds = [...this.selectedStaffIds, ...this.selectedStaffIdsUser];
  }
  

  // leaveTemplateDefinitionForm = this.fb.group({});
  registerToggle: boolean = false;
  registerLeaveTemplateMethodCall(){
    this.registerToggle = true;
    this.setFieldsToLeaveTemplateRequest();
    this.dataService.registerLeaveTemplate(this.leaveTemplateRequest).subscribe((response) => {
      this.helperService.registerOrganizationRegistratonProcessStepData(Key.LEAVE_TEMPLATE_ID, Key.PROCESS_COMPLETED);
      this.leaveTemplateRequest = new LeaveTemplateRequest();
      this.getAllLeaveTemplate();
      this.registerToggle = false;
      this.requestLeaveCloseModel.nativeElement.click();
      this.helperService.showToast('Leave template registered successfully.', Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      this.registerToggle = false;
      this.helperService.showToast('Error while registering the leave template!', Key.TOAST_STATUS_ERROR);
    })

    // console.log('clear field')
    this.leaveTemplateRequest.name = ''; // Reset the template name
    this.leaveTemplateDefinitionForm.reset(); // Reset the form state

  }

  isShimmerForLeaveTemplateResponse = false;
  dataNotFoundPlaceholderForLeaveTemplateResponse = false;
  networkConnectionErrorPlaceHolderForLeaveTemplateResponse = false;
  preRuleForShimmerAndErrorPlaceholdersForLeaveTemplateResponse() {
    this.isShimmerForLeaveTemplateResponse = true;
    this.dataNotFoundPlaceholderForLeaveTemplateResponse = false;
    this.networkConnectionErrorPlaceHolderForLeaveTemplateResponse = false;
  }

  leaveTemplateResponseList : LeaveTemplateResponse[] = [];
  getLeaveTemplateResponseListByOrganizationIdMethodCall(){
    this.preRuleForShimmerAndErrorPlaceholdersForLeaveTemplateResponse();
    this.dataService.getLeaveTemplateResponseListByOrganizationId().subscribe((response) => {
      if(this.helperService.isListOfObjectNullOrUndefined(response)){
        this.dataNotFoundPlaceholderForLeaveTemplateResponse = true;
      } else{
        this.leaveTemplateResponseList = response.listOfObject;
      }
      this.isShimmerForLeaveTemplateResponse = false;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForLeaveTemplateResponse = true;
      this.isShimmerForLeaveTemplateResponse = false;
    })
  }

  // find all leave template
 leaveTemplates: LeaveTemplateRes[] = []

  getAllLeaveTemplate(){
    this.isLoading = true;
    this.dataService.getAllLeaveTemplate(1, 10).subscribe((response: any) => {

      this.isLoading = false;
      this.leaveTemplates = response.object;
      // console.log('leaveTemplates: ',this.leaveTemplates)
    });
  }


  onTemplateSubmit(){
    if (this.leaveTemplateDefinitionForm.valid) {
      // Proceed with submission logic
      this.goToLeaveCategoryTab();
    } else {
      // Mark all controls as touched to show validation messages
      this.leaveTemplateDefinitionForm.controls['empTypeId'].markAsTouched();
      this.leaveTemplateDefinitionForm.controls['genderId'].markAsTouched();
    }
  }

}
