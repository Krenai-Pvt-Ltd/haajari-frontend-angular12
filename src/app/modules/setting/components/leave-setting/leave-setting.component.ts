import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { error } from 'console';
import { template } from 'lodash';
import * as moment from 'moment';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { LeaveTemplateRequest } from 'src/app/leave-template-request';
import { FullLeaveSettingRequest } from 'src/app/models/Full-Leave-Setting-Request';
import { FullLeaveSettingResponse } from 'src/app/models/full-leave-setting-response';
import { LeaveSettingCategoryResponse } from 'src/app/models/leave-categories-response';
import { LeaveSettingResponse } from 'src/app/models/leave-setting-response';
import { Staff } from 'src/app/models/staff';
import { StaffSelectionUserList } from 'src/app/models/staff-selection-userlist';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { YearType } from 'src/app/year-type';

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

  // createLeaveCategory() {
  //   return this.fb.group({
  //     leaveName: ['', Validators.required],
  //     leaveCount: ['', Validators.required],
  //     leaveRules: [''],
  //     carryForwardDays: ['']
  //   });
  // }
  readonly constants = constant;

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getTeamNames();
    this.getUserByFiltersMethodCall(0);
    this.getFullLeaveSettingInformation();
    this.getYearTypeListMethodCall();
    // this.findUsersOfLeaveSetting(30);

    const leaveId = localStorage.getItem('tempId');

    if (leaveId != null) {
      this.idFlag = true;
      this.localStorageLeaveRuleId = +leaveId;
    } else {
      this.idFlag = false;
      this.localStorageLeaveRuleId = 0;
    }
  }

  localStorageLeaveRuleId!: number;

  idFlag: boolean = false;

  leaveSettingPlaceholder: boolean = false;

  leaveSettingResponse: LeaveSettingResponse = new LeaveSettingResponse();

  isFormValid: boolean = false;
  checkFormValidity(form: NgForm | null) {
    debugger;
    this.errorTemplateNameFlag = false;
    this.isFormValid = form?.valid ?? false;
  }

  // registerLeaveSettingTemplate() {
  //   this.leaveCategoryTab.nativeElement.click();
  //   this.dataService
  //     .registerLeaveSettingTemplate(this.leaveSettingResponse)
  //     .subscribe(
  //       (response) => {
  //         this.leaveSettingResponse.id = response.id;
  //         localStorage.setItem("tempId", response.id.toString());
  //         console.log('Leave setting registered successfully:', response);
  //       },
  //       (error) => {
  //         console.error('Error registering leave setting:', error);
  //       }
  //     );
  // }

  setAccrualType(accrualType: string) {
    this.leaveSettingResponse.accrualType = accrualType;
  }

  enterCountFlag: boolean = false;
  setSandwichRules(rule: string) {
    this.leaveSettingResponse.sandwichRules = rule;
    if (rule === 'Count') {
      this.enterCountFlag = true;
    } else {
      this.enterCountFlag = false;
    }
  }

  // *********** second
  //   leaveCategories = [{ leaveName: '', leaveCount: 0, leaveRules: 'Lapse', carryForwardDays: 0 , leaveSettingId: 0}];

  //   // ...

  // setLeaveRule(index: number, rule: string) {
  //   this.leaveSettingCategories[index].leaveRules = rule;
  //   if (rule === 'Lapse') {
  //     this.leaveSettingCategories[index].carryForwardDays = 0;
  //   }
  // }

  // addLeave() {
  //   this.leaveCategories.push({
  //     leaveName: '',
  //     leaveCount: 0,
  //     leaveRules: 'Lapse',
  //     carryForwardDays: 0,
  //     leaveSettingId: 0
  //   });
  // }

  // removeLeave(index: number) {
  //   this.leaveSettingCategories.splice(index, 1);
  // }

  // // ...

  get categories(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  addRow() {
    const newRow = this.fb.group({
      leaveName: ['', Validators.required],
      leaveCount: ['', [Validators.required, Validators.min(0)]],
      leaveRules: [''],
      carryForwardDays: [''],
    });

    this.categories.push(newRow);
  }

  // leaveSettingCategories: LeaveSettingCategoryResponse[] = [];
  // templateId!: number;

  deleteRow(index: number) {
    const categoriesArray = this.form.get('categories') as FormArray;
    categoriesArray.removeAt(index);
    this.helperService.showToast('Row deleted', Key.TOAST_STATUS_SUCCESS);
  }

  hasError(controlName: string, index: number, errorName: string) {
    const control = this.categories.at(index)?.get(controlName);
    return control?.touched && control?.hasError(errorName);
  }

  // saveLeaveCategories() {
  //   const tempId = localStorage.getItem("tempId");
  //   let templateId: number | null = null;

  //   if (tempId !== null) {
  //     templateId = +tempId;
  //   }

  //   if (templateId === null || isNaN(templateId)) {
  //     console.error('Invalid templateId:', templateId);
  //     return;
  //   }

  //   debugger
  //   // const leaveSettingCategories: LeaveSettingCategoryResponse[] = this.form.value.categories;

  //   const leaveSettingCategories = this.form.value.categories.map((category: any) => ({
  //     ...category,
  //     leaveSettingId: templateId
  //   }));

  //   this.staffSelectionTab.nativeElement.click();

  //   this.dataService.registerLeaveCategories(leaveSettingCategories, templateId)
  //     .subscribe(response => {
  //       console.log('Leave categories saved successfully:', response);
  //     }, error => {
  //       console.error('Error saving leave categories:', error);
  //     });
  // }

  // *************

  // saveLeaveSetting() {
  //   debugger
  //   const tempId = localStorage.getItem("tempId");
  //   let templateId: number | null = null;

  //   if (tempId !== null) {
  //     templateId = +tempId;
  //   }

  //   if (templateId === null || isNaN(templateId)) {
  //     console.error('Invalid templateId:', templateId);
  //     return;
  //   }
  //   console.log(this.selectedStaffsUuids);
  //   // if (this.selectedStaffsUuids.length > 0 && templateId) {
  //     this.dataService.registerUserOfLeaveSetting(templateId, this.selectedStaffsUuids).subscribe(
  //       response => {
  //         this.getFullLeaveSettingInformation()
  //         this.requestLeaveCloseModel.nativeElement.click();
  //         localStorage.removeItem("tempId")
  //         this.emptyAddLeaveSettingRule();
  //         // location.reload();
  //         console.log('Users saved for leave setting:', response);
  //       },
  //       error => {
  //         console.error('Error saving users for leave setting:', error);
  //       }
  //     );
  //   // } else {
  //   //   // console.error(error);
  //   // }
  // }

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

  selectedStaffsUuids: string[] = [];
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

    this.debounceTimer = setTimeout(() => {
      this.selectedStaffsUuids = [];

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
            // this.staffSelectionUserList.user = response.users;
            this.staffs = response.users.map(
              (staff: StaffSelectionUserList) => ({
                ...staff.user,
                selected: this.selectedStaffsUuids.includes(staff.user.uuid),
                // isMapped:
                isAdded: staff.mapped,
              })
            );
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
          },
          (error) => {
            console.error(error);
          }
        );
    }, debounceTime);
  }

  isUserInLeaveRule(userUuid: string): boolean {
    const userLeaveRule = this.fullLeaveSettingResponse.userLeaveRule;
    return (
      userLeaveRule &&
      userLeaveRule.length > 0 &&
      userLeaveRule.some((rule) => rule.userUuids.includes(userUuid))
    );
  }

  checkIndividualSelection() {
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
  }

  checkAndUpdateAllSelected() {
    this.isAllSelected =
      this.staffs.length > 0 && this.staffs.every((staff) => staff.selected);
    this.isAllUsersSelected = this.selectedStaffsUuids.length === this.total;
  }

  updateSelectedStaffs() {
    this.staffs.forEach((staff) => {
      if (staff.selected && !this.selectedStaffsUuids.includes(staff.uuid)) {
        this.selectedStaffsUuids.push(staff.uuid);
      } else if (
        !staff.selected &&
        this.selectedStaffsUuids.includes(staff.uuid)
      ) {
        this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
          (uuid) => uuid !== staff.uuid
        );
      }
    });

    this.checkAndUpdateAllSelected();

    // this.activeModel2=true;

    // if(this.selectedStaffsUuids.length === 0){
    //   this.activeModel2 = false;
    // }
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
      // If selecting all, add all user UUIDs to the selectedStaffsUuids list
      // this.activeModel2 = true;
      this.getAllUsersUuids().then((allUuids) => {
        this.selectedStaffsUuids = allUuids;
      });
    } else {
      this.selectedStaffsUuids = [];
      // this.activeModel2 = false;
    }
  }

  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffsUuids based on the current page selection
    if (checked) {
      // this.activeModel2 = true;
      this.staffs.forEach((staff) => {
        if (!this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids.push(staff.uuid);
        }
      });
    } else {
      this.staffs.forEach((staff) => {
        if (this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
            (uuid) => uuid !== staff.uuid
          );
        }
      });
    }
  }

  // Asynchronous function to get all user UUIDs
  async getAllUsersUuids(): Promise<string[]> {
    debugger;
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
    // const response = await this.dataService.getAllUsers('asc', 'id', this.searchText, '').toPromise();
    // this.staffs = response.users.map((staff: StaffSelectionUserList) => ({
    //   ...staff.user,
    //   selected: this.selectedStaffsUuids.includes(staff.user.uuid),
    //   // isMapped:
    //   isAdded: staff.mapped
    // }));
    return response.users.map((userDto: any) => userDto.user.uuid);
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
    this.selectedStaffsUuids = [];
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
        if (this.fullLeaveSettingResponseList.length == 1) {
          this.activeIndex = 0;
        }
        this.isLoading = false;
        if (response == null || response.length == 0) {
          this.leaveSettingPlaceholder = true;
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
      ?.get('leaveRules');
    if (leaveRulesControl) {
      leaveRulesControl.setValue(value);
    }
  }
  // leaveSettingForm!:NgForm;
  fullLeaveSettingResponse!: FullLeaveSettingResponse;

  getLeaveSettingInformationById(leaveSettingId: number, flag: boolean): void {
    debugger;

    this.pageNumber = 1;
    this.pageNumberUser = 1;
    this.dataService.getLeaveSettingInformationById(leaveSettingId).subscribe(
      (response) => {
        this.searchTextUser = '';
        this.searchText = '';
        this.selectedStaffsUuids = [];
        this.selectedStaffsUuidsUser = [];
        this.daysCountArray = [];
        this.errorTemplateNameFlag = false;
        this.fullLeaveSettingResponse = response;
        this.idOfLeaveSetting = leaveSettingId;
        this.leaveSettingResponse = this.fullLeaveSettingResponse.leaveSetting;
        // this.selectedStaffsUuidsUser =  this.fullLeaveSettingResponse.userUuids;
        // if(this.fullLeaveSettingResponse.userUuids.length===0){
        //   this.isMappedStaffEmpty=true;
        // }else{
        //   this.isMappedStaffEmpty=false;
        // }
        if (flag) {
          this.templateSettingTab.nativeElement.click();
        }
        if (this.leaveSettingResponse != null) {
          this.isFormValid = true;
        }
        // this.checkFormValidity(this.leaveSettingForm);
        // this.form.reset();
        // Reset the form without emitting the events
        this.form.reset({ emitEvent: false });

        const categoriesArray = this.form.get('categories') as FormArray;

        // Clear the existing form controls
        categoriesArray.clear();

        // this.fullLeaveSettingResponse.leaveSettingCategories.forEach(
        //   (category) => {
        //     const categoryGroup = this.fb.group({
        //       id: category.id,
        //       leaveName: category.leaveName,
        //       leaveCount: category.leaveCount,
        //       leaveRules: category.leaveRules,
        //       carryForwardDays: category.carryForwardDays,
        //     });

        //     categoriesArray.push(categoryGroup);
        //   }
        // );

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
          });

          categoriesArray.push(categoryGroup);

          // if (
          //   category.leaveRules == 'CarryForward' ||
          //   category.leaveRules == 'Encash'
          // ) {
          //   this.updateDaysDropdown(index, category.leaveCount);
          // } else {
          //   this.daysCountArray[index] = [];
          // }
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
    this.selectedStaffsUuids = [];
    this.selectedStaffsUuidsUser = [];
    // this.selectedStaffsUuids.length = 0;

    this.leaveSettingForm.form.reset();
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

  fullLeaveSettingRuleRequest: FullLeaveSettingRequest =
    new FullLeaveSettingRequest();
  @ViewChild('requestLeaveCloseModel') requestLeaveCloseModel!: ElementRef;
  submitLeaveLoader: boolean = false;

  saveLeaveSettingRules(flag: boolean) {
    debugger;
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
    // const leaveSettingCategories = this.form.value.categories.map(
    //   (category: any) => ({
    //     ...category,
    //   })
    // );
    // this.fullLeaveSettingRuleRequest.leaveSettingCategoryResponse =
    //   leaveSettingCategories;

    const leaveSettingCategories = this.form.value.categories.map(
      (category: any) => ({
        id: category.id, // Ensure the ID is being mapped
        leaveName: category.leaveName,
        leaveCount: category.leaveCount,
        leaveRules: category.leaveRules,
        carryForwardDays: category.carryForwardDays,
      })
    );

    this.fullLeaveSettingRuleRequest.leaveSettingCategoryResponse =
      leaveSettingCategories;
    this.fullLeaveSettingRuleRequest.userUuids = [
      ...this.selectedStaffsUuids,
      ...this.selectedStaffsUuidsUser,
    ];
    // selectedStaffsUuidsUser;

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
          },
          (error) => {
            this.submitLeaveLoader = false;
            this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
          }
        );
    } else if (!flag) {
      for (const userUuid of this.fullLeaveSettingRuleRequest.userUuids) {
        this.loadingStatus[userUuid] = true;
      }
      this.selectedStaffsUuidsUser = [];

      this.dataService
        .registerLeaveSettingRules(this.fullLeaveSettingRuleRequest)
        .subscribe(
          (response) => {
            this.idOfLeaveSetting = response.leaveSettingResponse.id;
            this.getUserByFiltersMethodCall(this.idOfLeaveSetting);

            for (const userUuid of this.fullLeaveSettingRuleRequest.userUuids) {
              this.loadingStatus[userUuid] = false;
            }
            this.isMappedStaffEmpty = false;
            this.addedUserFlag = true;
            //  this.selectedStaffsUuids = [userUuid];
            //  const staffToUpdate = this.staffs.find(staff => staff.uuid === userUuid);
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
          },
          (error) => {
            for (const userUuid of this.fullLeaveSettingRuleRequest.userUuids) {
              this.loadingStatus[userUuid] = false;
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
      this.selectedStaffsUuidsUser = [];
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
            selected: this.selectedStaffsUuidsUser.includes(staff.uuid),
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

  selectedStaffsUuidsUser: string[] = [];
  selectedStaffsUser: Staff[] = [];
  isAllSelectedUser: boolean = false;

  // isUserInLeaveRuleUser(userUuid: string): boolean {
  //   const userLeaveRule = this.fullLeaveSettingResponse.userLeaveRule;
  //   return userLeaveRule && userLeaveRule.length > 0 && userLeaveRule.some(rule => rule.userUuids.includes(userUuid));
  // }

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
      this.selectedStaffsUuidsUser.length === this.totalUser;
  }

  updateSelectedStaffsUser() {
    this.staffsUser.forEach((staff) => {
      if (
        staff.selected &&
        !this.selectedStaffsUuidsUser.includes(staff.uuid)
      ) {
        this.selectedStaffsUuidsUser.push(staff.uuid);
      } else if (
        !staff.selected &&
        this.selectedStaffsUuidsUser.includes(staff.uuid)
      ) {
        this.selectedStaffsUuidsUser = this.selectedStaffsUuidsUser.filter(
          (uuid) => uuid !== staff.uuid
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
        this.selectedStaffsUuidsUser = allUuids;
      });
    } else {
      this.selectedStaffsUuidsUser = [];
    }
  }

  selectAllUser(checked: boolean) {
    this.isAllSelectedUser = checked;
    this.staffsUser.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffsUuids based on the current page selection
    if (checked) {
      // this.activeModel2 = true;
      this.staffsUser.forEach((staff) => {
        if (!this.selectedStaffsUuidsUser.includes(staff.uuid)) {
          this.selectedStaffsUuidsUser.push(staff.uuid);
        }
      });
    } else {
      this.staffsUser.forEach((staff) => {
        if (this.selectedStaffsUuidsUser.includes(staff.uuid)) {
          this.selectedStaffsUuidsUser = this.selectedStaffsUuidsUser.filter(
            (uuid) => uuid !== staff.uuid
          );
        }
      });
    }
  }

  async getAllUsersUuidsUser(): Promise<string[]> {
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
    // return this.selectedStaffsUuidsUser;
  }

  onSelectAllUsersChangeUser(event: any) {
    this.selectAllUsersUser(event.target.checked);
  }

  unselectAllUsersUser() {
    this.isAllUsersSelectedUser = false;
    this.isAllSelectedUser = false;
    this.staffsUser.forEach((staff) => (staff.selected = false));
    this.selectedStaffsUuidsUser = [];
    // this.activeModel2 = false;
  }

  // ##########b

  //

  deleteAllUsers(): void {
    for (const userUuid of this.selectedStaffsUuidsUser) {
      this.loadingDeleteStatus[userUuid] = true;
    }
    this.dataService
      .deleteAllUsersByLeaveSettingId(this.selectedStaffsUuidsUser)
      .subscribe(
        () => {
          for (const userUuid of this.selectedStaffsUuidsUser) {
            this.loadingDeleteStatus[userUuid] = false;
          }
          this.selectedStaffsUuids = [];
          this.selectedStaffsUuidsUser = [];
          this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
          this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
          // this.getLeaveSettingInformationById(this.idOfLeaveSetting);
          // this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
        },
        (error) => {
          for (const userUuid of this.selectedStaffsUuidsUser) {
            this.loadingDeleteStatus[userUuid] = true;
          }
        }
      );
  }

  deleteEmployeeLoader(staff: any): boolean {
    return this.loadingDeleteStatus[staff.uuid] || false;
  }

  loadingDeleteStatus: { [key: string]: boolean } = {};

  deleteUser(userUuid: string): void {
    this.loadingDeleteStatus[userUuid] = true;
    this.dataService.deleteUserFromUserLeaveRule(userUuid).subscribe(
      () => {
        this.selectedStaffsUuids = [];
        this.selectedStaffsUuidsUser = [];
        this.loadingDeleteStatus[userUuid] = false;
        this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
        this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
      },
      (error) => {
        // console.error('Error deleting user:', error);
        this.loadingDeleteStatus[userUuid] = false;
      }
    );
  }

  addEmployeeLoader(staff: any): boolean {
    return this.loadingStatus[staff.uuid] || false;
  }

  loadingStatus: { [key: string]: boolean } = {};
  staffAddedFlag: boolean = false;
  addedUserFlag: boolean = false;
  errorTemplateNameFlag: boolean = false;

  addUser(userUuid: string, leaveSettingId: number): void {
    this.loadingStatus[userUuid] = true;
    this.selectedStaffsUuidsUser = [];

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
      this.fullLeaveSettingRuleRequest.userUuids = [userUuid];
      // selectedStaffsUuidsUser;

      this.dataService
        .registerLeaveSettingRules(this.fullLeaveSettingRuleRequest)
        .subscribe(
          (response) => {
            this.idOfLeaveSetting = response.leaveSettingResponse.id;
            // this.getFullLeaveSettingInformation();
            // this.requestLeaveCloseModel.nativeElement.click();
            this.loadingStatus[userUuid] = false;
            this.isMappedStaffEmpty = false;
            this.addedUserFlag = true;
            this.selectedStaffsUuids = [userUuid];
            const staffToUpdate = this.staffs.find(
              (staff) => staff.uuid === userUuid
            );
            if (staffToUpdate) {
              staffToUpdate.isAdded = true;
              // this.staffAddedFlag=true;
            }
            this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
            // this.getLeaveSettingInformationById(this.idOfLeaveSetting);
            // this.selectedStaffsUuidsUser = [...this.selectedStaffsUuidsUser, userUuid];
          },
          (error) => {
            // console.error('Error registering leave setting:', error);
            this.loadingStatus[userUuid] = false;
          }
        );
    } else {
      this.dataService.addUserToLeaveRule(userUuid, leaveSettingId).subscribe(
        (response) => {
          this.isMappedStaffEmpty = false;
          this.addedUserFlag = true;
          this.loadingStatus[userUuid] = false;
          // this.selectedStaffsUuids = [userUuid];
          const staffToUpdate = this.staffs.find(
            (staff) => staff.uuid === userUuid
          );
          if (staffToUpdate) {
            staffToUpdate.isAdded = true;
            // this.staffAddedFlag=true;
          }
          this.findUsersOfLeaveSetting(this.idOfLeaveSetting);
          // this.selectedStaffsUuidsUser = [...this.selectedStaffsUuidsUser, userUuid];
        },
        (error) => {
          this.loadingStatus[userUuid] = false;
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

  onChange(value: string): void {
    this.filteredLeaveCategories = this.leaveCategories.filter((bank) =>
      bank.toLowerCase().includes(value.toLowerCase())
    );
  }

  // onChange(value: string): void {
  // // Check if leaveCategories is null or undefined before filtering
  // if (this.leaveCategories) {
  //   this.filteredLeaveCategories = this.leaveCategories.filter((bank) =>
  //     bank.toLowerCase().includes(value.toLowerCase())
  //   );
  // }

  filteredLeaveCategories: string[] = [];
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

  // onChangeDayCount(value: string): void {
  //   this.daysCount = this.daysCountCategories;
  // }

  // daysCountArray: number[] = [];
  // daysCountCategories: number[] = [0, 1, 2, 3, 4];

  // generateDaysDropdown(value: any): void {
  //   const count = parseInt(value, 10);
  //   value.forEach()
  //   this.daysCountCategories = Array.from(
  //     { length: count },
  //     (_, i) => i + 1
  //   ).reverse();
  // }
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

  // updateDaysDropdown(index: number, count: number): void {
  //   console.log('countarray ..' + count + index);
  //   // Ensure that daysCountArray has enough elements for the given index
  //   while (this.daysCountArray.length <= index) {
  //     this.daysCountArray.push([]);
  //   }

  //   // Update the daysCountArray for the specific index
  //   this.daysCountArray[index] = Array.from(
  //     { length: count + 1 },
  //     (_, i) => count - i
  //   );
  // }

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

  // updateDaysDropdown(index: number, count: number): void {
  //   this.daysCountArray[index] = Array.from(
  //     { length: count + 1 },
  //     (_, i) => count - i
  //   );
  // }

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

  // isYearlyAllAtOnce: boolean = false;

  // yearlyAllAtOnce() {
  //   if()
  // }
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
  yearTypeList : YearType[] = [];
  getYearTypeListMethodCall(){
    this.dataService.getYearTypeList().subscribe((response) => {
      if(!this.helperService.isListOfObjectNullOrUndefined(response)){
        this.yearTypeList = response.listOfObject;
      } 
    })
  }
  readonly ANNUAL_YEAR = Key.ANNUAL_YEAR;
  readonly FINANCIAL_YEAR = Key.FINANCIAL_YEAR;

  dateRange: Date[] = [];
  size: 'large' | 'small' | 'default' = 'small';
  selectDateForLeaveTemplateRequest(yearType: any) {
    debugger;
    if (yearType && yearType.id === this.ANNUAL_YEAR) {
      this.dateRange[0] = new Date(new Date().getFullYear(), 0, 1); // January 1st
      this.dateRange[1] = new Date(new Date().getFullYear(), 11, 31); // December 31st
    }
  
    if (yearType && yearType.id === this.FINANCIAL_YEAR) {
      this.dateRange[0] = new Date(new Date().getFullYear(), 3, 1); // April 1st
      this.dateRange[1] = new Date(new Date().getFullYear() + 1, 2, 31); // March 31st of the next year
    }
  
    // Format the start and end dates before assigning them to the request object
    this.leaveTemplateRequest.startDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[0]);
    this.leaveTemplateRequest.endDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[1]);
  
    console.log(this.dateRange[0]);
    console.log(this.dateRange[1]);
  }
  
  
  // selectDateForLeaveTemplateRequest(dates: Date[] | null): void {
  //   // Handle array of dates
  //   if (Array.isArray(dates)) {
  //     if (dates.length === 2 && dates[0] != null && dates[1] != null) {
  //       this.leaveTemplateRequest.startDate = this.helperService.formatDateToYYYYMMDD(dates[0]);
  //       this.leaveTemplateRequest.endDate = this.helperService.formatDateToYYYYMMDD(dates[1]);
  //     }
  //   } 
  // }

  leaveTemplateRequest : LeaveTemplateRequest = new LeaveTemplateRequest();

}
