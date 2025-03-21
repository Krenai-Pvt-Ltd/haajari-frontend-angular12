import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {FormArray,FormBuilder,FormGroup,NgForm,Validators,} from '@angular/forms';
import * as _ from 'lodash';
import moment from 'moment';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { Employeetype } from 'src/app/models/EmployeeType';
import { FullLeaveSettingRequest } from 'src/app/models/Full-Leave-Setting-Request';
import { FullLeaveSettingResponse } from 'src/app/models/full-leave-setting-response';
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
    private helperService: HelperService,
    private cdr: ChangeDetectorRef,
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

    const leaveId = localStorage.getItem('tempId');
    this.filteredLeaveCategories = []
    this.leaveCategories1 = []
    this.leaveCategories2 = []
    this.displayedCategories = []

    if (leaveId != null) {
      this.idFlag = true;
      this.localStorageLeaveRuleId = +leaveId;
    } else {
      this.idFlag = false;
      this.localStorageLeaveRuleId = 0;
    }

    this.checkStepCompletionStatusByStepId(Key.LEAVE_TEMPLATE_ID);
    this.leaveTemplateDefinitionForm = this.fb.group({
      employeeTypeId: [0, [Validators.required, Validators.min(1)]]
      // employeeTypeId: [null, Validators.required], // The form control for employee type
      // Other form controls...
    });
    setTimeout(() => {
      this.loadStaffIdsCache();
    }, 2000);

    setTimeout(()=> {
      this.fetchAssignedUsers();
    }, 1000);
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


  get categories(): FormArray {
    return this.form.get('categories') as FormArray;
  }


  addRow() {
    debugger

    const newRow = this.fb.group({
      leaveCategoryId: ['', Validators.required],
      leaveCycleId: ['', Validators.required],
      leaveCount: [0, [Validators.required]],
      // , Validators.min(0)
      isSandwichLeave: [''],
      unusedLeaveActionId: [''],
      unusedLeaveActionCount: [''],
      accrualTypeId: [''],
      gender: [''],
      isReset:[true],
      flexible: [false],
      carryoverAction: [''],
      carryover:['']
    });

    this.categories.push(newRow);
  }

  formIndex: number = 0;
  formSelected: boolean = false;
  leaveCategories1: any;
  tempLeaveCategories1: any;
  leaveCategories2: any;
  rowIndex: number = 1;
  editingIndex: number | null = null;
  displayedCategories: any;

  clearFormFields() {
    this.form.patchValue({
      leaveCategoryId: '',
      leaveCycleId: '',
      leaveCount: 0,
      isSandwichLeave: '',
      unusedLeaveActionId: '',
      unusedLeaveActionCount: '',
      accrualTypeId: '',
      gender: '',
      isReset:true,
      flexible:false,
      carryoverAction:'',
      carryover:''
    });
  }

  addFormRow1() {
    debugger

    //for array
    const newRow = this.fb.group({
      leaveCategoryId: ['', Validators.required],
      leaveCycleId: ['', Validators.required],
      leaveCount: [0, [Validators.required, Validators.min(0)]],
      isSandwichLeave: [''],
      unusedLeaveActionId: [''],
      unusedLeaveActionCount: [''],
      accrualTypeId: [''],
      gender: [''],
      isReset:[true],
      flexible: [false],
      carryoverAction: [''],
      carryover:['']
    });
    // this.categories.clear();
    this.categories.push(newRow);

    //for array end


    if (this.editingIndex !== null) {
      // Update existing entry
      this.leaveCategories1[this.editingIndex] = this.form.value;
      this.editingIndex = null;
    } else {

      this.leaveCategories1.push(this.form.value);
      // console.log('this.leaveCategories1: ', this.leaveCategories1)

      this.leaveCategories2.push(this.form.value.categories[0]);
      // console.log('this.leaveCategories2: ', this.leaveCategories2)

      // Process leaveCategories2 to include categoryName
      this.displayedCategories = this.leaveCategories2.map((category: any) => {
        const matchedCategory = this.leaveCategoryList.find(c => c.id === category.leaveCategoryId);
        const matchedUnusedLeaveAction = this.unusedLeaveActionList.find(c => c.id === category.unusedLeaveActionId);
        const matchedAccrualType = this.accrualTypes.find(c => c.id === category.accrualTypeId);
        const matchedLeaveCycle = this.leaveCycleList.find(c => c.id === category.leaveCycleId);
        return {
          ...category,
          categoryName: matchedCategory ? matchedCategory.name : 'N/A',
          unusedLeaveName: matchedUnusedLeaveAction ? matchedUnusedLeaveAction.name : 'N/A',
          accrualName: matchedAccrualType ? matchedAccrualType.name : 'N/A',
          leaveCycleName: matchedLeaveCycle ? matchedLeaveCycle.name : 'N/A'
        };
      });
      // console.log('this.displayedCategories: ', this.displayedCategories)

    }

    // this.form.reset(); // Clear form fields
    this.leaveCategories1 = []
    this.form.value.reset();
    // this.clearFormFields();

  }

  addFormToggle: boolean = false;
  addFormRow(index: number) {
    debugger

    if (this.deleteToggle) {
      this.deleteToggle = false;
    }

    this.addFormToggle = true;

    if (this.editingIndex !== null) {
      // Update existing entry
      this.editToggle = false;

      //Set all values
      const category = this.form.value.categories[this.editingIndex]; // Access the specific category
      const updatedCategory = {
        ...category,
        categoryName: this.leaveCategoryList.find(c => c.id === category.leaveCategoryId)?.name || 'N/A',
        unusedLeaveName: this.unusedLeaveActionList.find(c => c.id === category.unusedLeaveActionId)?.name || 'N/A',
        accrualName: this.accrualTypes.find(c => c.id === category.accrualTypeId)?.name || 'N/A',
        leaveCycleName: this.leaveCycleList.find(c => c.id === category.leaveCycleId)?.name || 'N/A'
      };

      (this.categories.at(index) as FormGroup).patchValue(updatedCategory);
      this.displayedCategories[this.editingIndex] = updatedCategory;

      this.editingIndex = null;

    } else {

      const newRow = this.fb.group({
        leaveCategoryId: ['', Validators.required],
        leaveCycleId: ['', Validators.required],
        leaveCount: [0, [Validators.required, Validators.min(0)]],
        isSandwichLeave: [''],
        unusedLeaveActionId: [''],
        unusedLeaveActionCount: [''],
        accrualTypeId: [''],
        gender: [''],
        isReset:[true],
        flexible: [false],
        carryoverAction:[''],
        carryover:['']
      });
      this.categories.push(newRow);

      this.leaveCategories1.push(this.form.value);

      // console.log('this.leaveCategories1: ',this.leaveCategories1)

      this.tempLeaveCategories1 = this.leaveCategories1;

      this.leaveCategories2.push(this.form.value.categories[index]);

      // Process leaveCategories2 to include categoryName
      this.displayedCategories = this.leaveCategories2.map((category: any) => {
        const matchedCategory = this.leaveCategoryList.find(c => c.id === category.leaveCategoryId);
        const matchedUnusedLeaveAction = this.unusedLeaveActionList.find(c => c.id === category.unusedLeaveActionId);
        const matchedAccrualType = this.accrualTypes.find(c => c.id === category.accrualTypeId);
        const matchedLeaveCycle = this.leaveCycleList.find(c => c.id === category.leaveCycleId);
        return {
          ...category,
          categoryName: matchedCategory ? matchedCategory.name : 'N/A',
          unusedLeaveName: matchedUnusedLeaveAction ? matchedUnusedLeaveAction.name : 'N/A',
          accrualName: matchedAccrualType ? matchedAccrualType.name : 'N/A',
          leaveCycleName: matchedLeaveCycle ? matchedLeaveCycle.name : 'N/A'
        };
      });

    }

    if (this.updateToggle) {
      this.displayedCategories = [...this.displayedCategories, ...this.tempDisplayedCategories];

    }
    // this.deleteCategoryToggle = false;
    // console.log('this.displayedCategories: ',this.displayedCategories)
    this.wfhIndex++;
    if(this.wfhTemplateToggle){
      this.leaveTemplateForm(true);
    }

    this.tempLeaveCount = 0;
    this.showErrorCount = false
  }


  editToggle: boolean = false;
  editCategory(index: number) {
    debugger
    this.editToggle = true;
    this.editingIndex = index;

    const category = this.leaveCategories1[this.leaveCategories1.length - 1];
    this.form.patchValue(category);

    // console.log('Edit form: ', this.form)

  }

  deleteCategory(index: number) {

    this.leaveCategories1.splice(index, 1);
    this.leaveCategories2.splice(index, 1);
    this.displayedCategories.splice(index, 1);

    if (this.editToggle) {
      if (this.editingIndex !== null) {
        // Update existing entry
        this.leaveCategories1[this.editingIndex] = this.form.value;
        this.editingIndex = null;
      }
    }

    this.categories.removeAt(index);

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

    this.pageNumber = 1
    this.searchUserPlaceholderFlag = false;
    this.searchText = '';
    this.isSubmitted = false;
    this.isCustomDateRange = false;

    this.showAllUser();
    this.crossFlag = false;
  }

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

      // this.dataService.getUsersByFilterForLeaveSetting(this.itemPerPage, this.pageNumber, 'asc', 'id', this.searchText, '', leaveSettingId, this.selectedTeamId, this.selectedUserIds)
      this.dataService.getUsersByFilterForLeaveSetting(this.databaseHelper.itemPerPage, this.databaseHelper.currentPage, 'asc', 'id', this.searchText, '', leaveSettingId, this.selectedTeamId, this.selectedUserIds)
        .subscribe(
          (response) => {

            this.staffs = response.users;

            if (this.staffs != undefined) {
              this.staffs.forEach((staff, index) => {
                staff.checked = this.selectedStaffIdsUser.includes(staff.id);
              });
            } else {
              this.staffs = []
            }

            this.total = response.count;

            if (this.total == 0) {
              this.isStaffEmpty = true;
            } else {
              this.isStaffEmpty = false;
            }

            this.isAllSelected = this.staffs.every((staff) => staff.selected);

            // console.log('staffs: ', this.staffs)
          },
          (error) => {
            console.error(error);
          }
        );
    }, debounceTime);
  }

  // New method to select all staff with joining dates across all pages
  selectAllPages: boolean = false;
// Properties
private cachedStaffIdsWithJoiningDate: number[] = []; // Cache for staff IDs with joining dates
private isCacheLoaded: boolean = false; // Flag to track if cache is initialized
 cachedStaffIdsWithoutJoiningDate: number[] = [];
// Separate method to load and cache staff IDs
private loadStaffIdsCache() {
  this.dataService.getUsersByFilterForLeaveSetting(
    0, // 0 items per page to get all records
    1, // Start from page 1
    'asc',
    'id',
    this.searchText,
    '',
    this.idOfLeaveSetting,
    this.selectedTeamId,
    this.selectedUserIds
  ).subscribe(
    (response) => {
      // Filter staff with joining dates and cache their IDs
      this.cachedStaffIdsWithJoiningDate = response.users
        .filter((staff: { joiningDate: any }) => staff.joiningDate)
        .map((staff: { id: any }) => staff.id);

        this.cachedStaffIdsWithoutJoiningDate = response.users
        .filter((staff: { joiningDate: any }) => !staff.joiningDate)
        .map((staff: { id: any }) => staff.id);

      // Remove duplicates from both caches
      this.cachedStaffIdsWithJoiningDate = Array.from(new Set(this.cachedStaffIdsWithJoiningDate));
      this.cachedStaffIdsWithoutJoiningDate = Array.from(new Set(this.cachedStaffIdsWithoutJoiningDate));
      this.isCacheLoaded = true;


      // Update current page if "Select all" is active
      if (this.selectAllPages) {
        this.selectedStaffIdsUser = [...this.cachedStaffIdsWithJoiningDate];
        this.updateCurrentPageSelection();
      }
    },
    (error) => {
      console.error('Error loading staff IDs cache:', error);
      this.isCacheLoaded = false;
      this.allselected = false;
      this.selectAllPages = false; // Reset checkbox on error
    }
  );
}

// Modified selectAllStaffAcrossPages method
selectAllStaffAcrossPages() {
  if (this.selectAllPages) {
    this.allselected = true;
    this.selectedStaffIdsUser = [];

    if (this.isCacheLoaded) {
      // Use cached data
      this.selectedStaffIdsUser = [...this.cachedStaffIdsWithJoiningDate];
      this.updateCurrentPageSelection();
      console.log('Selected staff from cache: ', this.selectedStaffIdsUser);
    } else {
      // Load cache and proceed
      this.loadStaffIdsCache();
    }
  } else {
    this.allselected = false;
    this.selectedStaffIdsUser = [];

    // Update current page display
    this.updateCurrentPageSelection();

    // Optional: Refresh current page
    this.getUserByFiltersMethodCall(this.idOfLeaveSetting, 0);
  }
}

assignedUsers: any[]=[];
fetchAssignedUsers(): void {
  this.dataService.getActiveLeaveTemplates().subscribe(
    (data) => {
      if(data){
      this.assignedUsers = data;
      }
    },
    (error) => {
      console.error('Error fetching leave templates', error);
    }
  );
}

// Helper method to update current page display
private updateCurrentPageSelection() {
  this.staffs.forEach(staff => {
    staff.checked = !!staff.joiningDate && this.selectedStaffIdsUser.includes(staff.id);
  });
}




  getUserByUpdateMethodCall(leaveSettingId: number) {

    debugger

    this.selectedStaffIds = [];

    this.dataService.getUsersByFilterForLeaveSetting(
      this.itemPerPage,
      this.pageNumber,
      'asc',
      'id',
      this.searchText,
      '',
      leaveSettingId,
      this.selectedTeamId,
      this.selectedStaffIdsUser

    )
      .subscribe(
        (response) => {
          this.staffs = response.users;


          this.staffs.forEach((staff, index) => {
            staff.checked = this.selectedStaffIdsUser.includes(staff.id);
          });

          this.total = response.count;

          if (this.total == 0) {
            this.isStaffEmpty = true;
          } else {
            this.isStaffEmpty = false;
          }

          this.isAllSelected = this.staffs.every((staff) => staff.selected);

          console.log('staffs: ', this.staffs)
        },
        (error) => {
          console.error(error);
        }
      );
  }

  checkIndividualSelection1() {
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
  }

  checkIndividualSelection() {
    debugger
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
    debugger
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

    console.log('Ids: ', this.selectedStaffIds)

  }

  // #####################################################
  isAllUsersSelected: boolean = false;

  // Method to toggle all users' selection
  selectAllUsers(isChecked: boolean) {

    this.isAllUsersSelected = isChecked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked)); // Update each staff's selected property

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffIds list
      this.getAllUsersUuids().then((allUuids) => {
        this.selectedStaffIds = allUuids;
      });
    } else {
      this.selectedStaffIds = [];
    }
  }

  selectAll(checked: boolean) {
    debugger

    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffIds based on the current page selection
    if (checked) {

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

    console.log('sel all Ids: ', this.selectedStaffIds)

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
        this.selectedTeamId,
        this.selectedStaffIdsUser
      )
      .toPromise();

    return response.users.map((userDto: any) => userDto.user.id);
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
  }

  //ngb-pagination
 databaseHelper: DatabaseHelper = new DatabaseHelper();
 totalItems: number = 0;
 pageChanged(page: any) {
   if (page != this.databaseHelper.currentPage) {
      this.allselected=false;
     this.databaseHelper.currentPage = page;
     this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
   }
 }


  // ##### Pagination ############
  changePage(page: number | string) {
    this.allselected = false;
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

        // console.error('Error fetching leave setting information:', error);
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
              Number(category.leaveCount),
              [Validators.required, Validators.min(0)],
            ],
            leaveRules: [category.leaveRules],
            carryForwardDays: [category.carryForwardDays],
            accrualTypeId: [category.accrualTypeId],
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

  //Update Leave Template (working)
  updateToggle: boolean = false;
  leaveTempId: number = 0;
  tempDisplayedCategories: any;
  @ViewChild('staffSelectionTab2') staffSelectionTab2!: ElementRef
  getLeaveSettingInformationById(leaveSettingId: number, flag: boolean): void {
    debugger

    // this.wfhTemplateToggle = flag;
    this.enableWFH(flag);

    // this.wfhIndex = 0
    // if(this.wfhTemplateToggle){
    //   this.leaveTemplateForm(true);
    // }else{
    //   this.leaveTemplateForm(false);
    // }

    this.templateSettingTab2.nativeElement.click();
    this.updateToggle = true;
    this.leaveTempId = leaveSettingId;
    this.selectedStaffIdsUser = []
    this.isCustomDateRange = false;

    this.getYearTypeListMethodCall();

    this.loadGenders();
    this.getLeaveCategoryListMethodCall();
    this.getLeaveCycleListMethodCall();
    this.loadAccrualType();
    this.getUnusedLeaveActionList();

    this.form.reset();

    this.leaveTemplateRequest.id = leaveSettingId;
    this.dataService.getLeaveSettingInformationById(leaveSettingId).subscribe(
      (response: any) => {

        this.employeeTypeId = response.leaveTemplate.employeeType.id;
        this.leaveTemplateRequest.name = response.leaveTemplate.name;
        this.dateRange[0] = response.leaveTemplate.startDate
        this.dateRange[1] = response.leaveTemplate.endDate

        this.staffs.forEach((staff, index) => {
          // this.staffs[index].checked = true;
          staff.checked = response.userIds.includes(staff.id);
        });

        response.userIds.forEach((id: number) => {
          this.selectedStaffIdsUser.push(id)

        });

        this.employeeTypeList.push(response.leaveTemplate.employeeType)

        setTimeout((res: any) => {
          var yearType = this.yearTypeList.find(item => item.id === response.leaveTemplate.fiscalYearId);

          if (yearType) {
            this.leaveTemplateRequest.yearTypeName = yearType.name;
            // console.log("Year Type Name:", this.leaveTemplateRequest.yearTypeName);
          }

          if (response.leaveTemplate.fiscalYearId == 3) {
            this.isCustomDateRange = true;
          }
        }, 200)


        this.filteredLeaveCategories = []
        this.leaveCategories1 = []
        setTimeout(() => {
          this.displayedCategories = response.leaveTemplateCategories.map((category: any) => {
            const matchedCategory = this.leaveCategoryList.find(c => c.id === category.leaveCategory.id);
            const matchedUnusedLeaveAction = this.unusedLeaveActionList.find(c => c.id === category.unusedLeaveAction.id);
            const matchedAccrualType = this.accrualTypes.find(c => c.id === category.accrualType.id);
            const matchedLeaveCycle = this.leaveCycleList.find(c => c.id === category.leaveCycle.id);
            return {
              ...category,
              categoryName: matchedCategory ? matchedCategory.name : 'N/A',
              unusedLeaveName: matchedUnusedLeaveAction ? matchedUnusedLeaveAction.name : 'N/A',
              accrualName: matchedAccrualType ? matchedAccrualType.name : 'N/A',
              leaveCycleName: matchedLeaveCycle ? matchedLeaveCycle.name : 'N/A'
            };
          });
          // console.log('updateCat Display: ', this.displayedCategories)
        }, 200)


        setTimeout(() => {
          // console.log('above displayedCategories: ',this.displayedCategories)
          this.tempDisplayedCategories = this.displayedCategories
        }, 400)
        // console.log('this.tempDisplayedCategories: ',this.tempDisplayedCategories)
        this.wfhIndex = this.displayedCategories.length


      },
      (error) => {
        console.error('Error fetching leave setting information by ID:', error);
      }
    );
  }

  clearModalData() {
    this.requestLeaveCloseModel1.nativeElement.click();
    this.updateToggle = false;
    this.selectedStaffIdsUser = [];
    this.allselected=false;
    this.selectAllPages=false;
    this.leaveTemplateRequest = new LeaveTemplateRequest();
    this.leaveTemplateRequest.employeeTypeId = 0;
    this.leaveTemplateRequest.startDate = ''
    this.leaveTemplateRequest.endDate = ''
    this.employeeTypeId = 0
    this.clearSearchUsers()
    // this.dateRange[0]
    this.employeeTypeList = []
    this.leaveTemplateRequest.leaveTemplateCategoryRequestList = []

  }

  @ViewChild('templateSettingTab') templateSettingTab!: ElementRef;
  @ViewChild('newStaffSelectionTab') newStaffSelectionTab!: ElementRef;
  openStaffSelection() {
    this.newStaffSelectionTab.nativeElement.click();
  }
  @ViewChild('leaveSettingForm') leaveSettingForm!: NgForm;
  //  leaveSettingForm!: NgForm;
  @ViewChild('templateSettingTab2') templateSettingTab2!: ElementRef
  emptyAddLeaveSettingRule() {
    debugger;
    this.updateToggle = false;
    // this.isSubmitted = false;
    // this.templateSettingTab2.nativeElement.click();

    this.idOfLeaveSetting = 0;
    this.displayedCategories = []
    this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
    this.staffsUser = [];
    this.totalUser = 0;
    this.isMappedStaffEmpty = true;
    // this.getUserByFiltersMethodCall();
    // this.templateSettingTab1.nativeElement.click();
    this.templateSettingTab2.nativeElement.click();

    this.unselectAllUsers();
    this.selectedStaffIds = [];
    this.selectedStaffIdsUser = [];
    // this.selectedStaffIds.length = 0;
    // this.staffs = []
    // this.leaveSettingForm.form.reset();
    this.leaveSettingResponse = new LeaveSettingResponse();
    this.leaveSettingResponse.templateName = '';
    this.form.reset();

    // Clear the existing form controls
    const categoriesArray = this.form.get('categories') as FormArray;
    categoriesArray.clear();
    this.addRow();

    // this.templateSettingTab1.nativeElement.click();
    this.templateSettingTab2.nativeElement.click();
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
        leaveCount: Number(category.leaveCount),
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
          async (response) => {
            this.getFullLeaveSettingInformation();
            this.submitLeaveLoader = false;
            this.requestLeaveCloseModel1.nativeElement.click();
            this.helperService.showToast(
              'Leave rules registered successfully',
              Key.TOAST_STATUS_SUCCESS
            );
            await this.helperService.registerOrganizationRegistratonProcessStepData(Key.LEAVE_TEMPLATE_ID, Key.PROCESS_COMPLETED);
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
  @ViewChild('leaveCategoryTab1') leaveCategoryTab1!: ElementRef;

  goToLeaveCategoryTab1() {
    if (this.leaveSettingResponse.templateName == null) {
      this.isFormValid = false;
      return;
    }
    this.errorTemplateNameFlag = false;
    this.leaveCategoryTab.nativeElement.click();
  }

  goToLeaveCategoryTab() {
    debugger
    // if (this.leaveSettingResponse.templateName == null) {
    //   this.isFormValid = false;
    //   return;
    // }
    // this.errorTemplateNameFlag = false;
    this.leaveCategoryTab1.nativeElement.click();

    if(this.wfhTemplateToggle){
      this.leaveTemplateForm(true);
    }else{
      this.leaveTemplateForm(false);
    }

  }

  @ViewChild('staffSelectionTab') staffSelectionTab!: ElementRef;
  @ViewChild('staffSelectionTab1') staffSelectionTab1!: ElementRef;

  goToStaffSelectionTab() {
    debugger
    this.staffSelectionTab1.nativeElement.click();

    // console.log('leaveTemplateCategoryRequestList: ', this.leaveTemplateRequest.leaveTemplateCategoryRequestList)
    // console.log('categories: ', this.categories)

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
  // Define as a Set for unique IDs
// selectedStaffIdsUser: Set<number> = new Set<number>();


  selectedStaffsUser: Staff[] = [];
  isAllSelectedUser: boolean = false;


  checkIndividualSelectionUser() {
    debugger
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

  allUserUuids: string[] = [];
  async getAllUserUuidsMethodCall() {
    return new Promise<string[]>((resolve, reject) => {
      this.dataService.getAllUserUuids().subscribe({
        next: (response) => {
          this.allUserUuids = response.listOfObject;
          resolve(this.allUserUuids);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
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

  wfhActiveIndex: number | null = null;
  onDutyActiveIndex:number | null = null;
  toggleCollapseWFH(index: number): void {
    this.wfhActiveIndex = this.wfhActiveIndex === index ? null : index;
  }
  toggleCollapseOnDuty(index: number): void {
    this.onDutyActiveIndex = this.onDutyActiveIndex === index ? null : index;
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
  leaveAppliedUserCount: number = 0;
  @ViewChild('closeButtonDeleteLeave') closeButtonDeleteLeave!: ElementRef
  getLeaveTemplateOrCategoryId(id: number, isLeaveTemplate: boolean, leaveAppliedUserCount: number) {
    // this.leaveTemplateCategoryId = id;
    this.leaveAppliedUserCount = leaveAppliedUserCount;

    if (isLeaveTemplate) {
      this.leaveTemplateCategoryId = 0;
      this.leaveTemplateId = id;
    } else {
      this.leaveTemplateId = 0;
      this.leaveTemplateCategoryId = id;
    }

  }

  // deleteLeaveTemplateCategory(id: number){ amit
  deleteToggle: boolean = false;
  deleteLeaveTemplateCategory() {
    this.deleteToggle = true;
    this.dataService.deleteLeaveTemplateCategory(this.leaveTemplateCategoryId).subscribe((response: any) => {
      if (response.status) {
        this.leaveTemplateCategoryId = 0;
        this.leaveAppliedUserCount = 0;
        this.closeButtonDeleteLeave.nativeElement.click()
        this.deleteToggle = false;
        this.getAllLeaveTemplate();
        this.helperService.showToast(
          'Leave Category Deleted',
          Key.TOAST_STATUS_SUCCESS
        );
      } else {
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
  deleteLeaveTemplate() {
    this.deleteToggle = true;
    this.dataService.deleteLeaveTemplate(this.leaveTemplateId).subscribe((response: any) => {
      if (response.status) {
        this.getAllLeaveTemplate();
        this.leaveTemplateId = 0;
        this.closeButtonDeleteLeave.nativeElement.click()
        this.deleteToggle = false;
        this.helperService.showToast(
          'Leave Template Deleted',
          Key.TOAST_STATUS_SUCCESS
        );
      } else {
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
    if (value != null) {
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

    this.updateDaysDropdown(index, count);
  }


  // updateDaysDropdown(index: number, count: number): void {
  //   console.log('countarray ..' + index + ' ' + count);
  //   while (this.daysCountArray.length <= index) {
  //     this.daysCountArray.push([]);
  //   }
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
      { length: count  },
      (_, i) => count - i
    );

  //  this.daysCountArray[index] = this.daysCountArray[0].slice(0)

  //  console.log('daysCountArray: ', this.daysCountArray[index])

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
  booleanList: string[] = ['Yes', 'No'];

  leaveCategoryList: LeaveCategory[] = [];
  onDutyList: LeaveCategory[] = [];
  weekOffCategoryList: LeaveCategory[] = [];
  getLeaveCategoryListMethodCall() {
    this.dataService.getLeaveCategoryList().subscribe((response) => {
      if (!this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.leaveCategoryList = response.listOfObject;

        if(!this.wfhTemplateToggle){
          // Assuming this.leaveCategoryList is already populated
          this.leaveCategoryList = this.leaveCategoryList.filter(category => category.category === 'LEAVE');

        }
        this.onDutyList = this.leaveCategoryList.filter(category => category.category === 'ON_DUTY');
        this.weekOffCategoryList = this.leaveCategoryList.filter(category => category.category === 'WEEK_OFF');

      }

      console.log('res cateList', this.leaveCategoryList)
    }, (error) => {

    })
  }

  leaveCycleList: LeaveCycle[] = [];
  getLeaveCycleListMethodCall() {
    this.dataService.getLeaveCycleList().subscribe((response) => {
      if (!this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.leaveCycleList = response.listOfObject;
      }
    }, (error) => {

    })
  }

  unusedLeaveActionList: UnusedLeaveAction[] = [];
  getUnusedLeaveActionList() {
    this.dataService.getUnusedLeaveActionList().subscribe((response) => {
      if (!this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.unusedLeaveActionList = response.listOfObject;
      }
    }, (error) => {

    })
  }


  /** Find all employeeType method and Gender and AccrualType  */
  employeeTypeList: Employeetype[] = [];
  getAllEmployeeType() {
    this.dataService.getAllEmployeeType().subscribe((response: any) => {
      if (response.status) {
        this.employeeTypeList = response.object;
      } else {
        this.employeeTypeList = [];
      }
    })
  }


  employeeTypeId: number = 0;
  onEmployeeTypeChange(id: number) {
    this.employeeTypeId = id;

    this.leaveTemplateRequest.employeeTypeId = id;
    console.log('empId: ', this.leaveTemplateRequest.employeeTypeId)
  }

  genders: Array<{ id: number, name: string, value: string }> = []; // Gender options
  loadGenders() {
    this.genders = [
      { id: 1, name: 'All', value: 'all' },
      { id: 2, name: 'Male', value: 'male' },
      { id: 3, name: 'Female', value: 'female' }
    ];
  }


  selectedGenderId: number = 0;
  gender: any = null;

  filteredLeaveCategories: any;
  onGenderChange(value: any, i: number) {
    debugger

    // if(value != null && !this.editToggle){
    if (value != null) {

      if (value == 'Male') {
        this.selectedGenderId = 2;
      } else if (value == 'Female') {
        this.selectedGenderId = 3
      } else {
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
        this.filteredLeaveCategories[i] = [...this.leaveCategoryList];
        this.filteredLeaveCategories[i] = this.filteredLeaveCategories[i].filter((leaveCategory: any) => leaveCategory.id !== 3);
        this.leaveTemplateRequest.gender = 'Male';
      } else if (this.selectedGenderId == 3) {
        // Example: Exclude leave category with id 4 for females
        this.filteredLeaveCategories[i] = [...this.leaveCategoryList];
        this.filteredLeaveCategories[i] = this.filteredLeaveCategories[i].filter((leaveCategory: any) => leaveCategory.id !== 4);
        this.leaveTemplateRequest.gender = 'Female';
      } else if (this.selectedGenderId == 1) {
        // Reset to original list if 'All' is selected
        this.filteredLeaveCategories[i] = [...this.leaveCategoryList];
        this.leaveTemplateRequest.gender = 'All';
      }

      this.gender = this.leaveTemplateRequest.gender;

      console.log('selectedGenderName: ', this.gender)
      console.log('selectedGenderId: ', this.selectedGenderId)
      console.log('form: ', this.leaveTemplateRequest)
    } else {

      this.gender = null;
      this.selectedGenderId = 0

    }

    // console.log('leaveCategoryList: ',this.leaveCategoryList)
    // console.log('filteredLeaveCategories: ',this.filteredLeaveCategories)

  }

  //Accrual Type start
  accrualTypes: Array<{ id: number, name: string, value: string }> = []; // Gender options
  loadAccrualType() {
    this.accrualTypes = [
      { id: 1, name: 'Start', value: 'start' },
      { id: 2, name: 'End', value: 'end' }
    ];

  }

  selectedAccrualTypeId: number = 0;
  onAccrualChange(id: number) {
    this.selectedAccrualTypeId = id;  // Store the selected gender ID
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
  yearTypeList: YearType[] = [];
  getYearTypeListMethodCall() {
    this.dataService.getYearTypeList().subscribe((response) => {
      if (!this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.yearTypeList = response.listOfObject;

        console.log('yearTypeList: ', this.yearTypeList)

      }
    })
  }




  dateRange: Date[] = [];
  size: 'large' | 'small' | 'default' = 'small';
  selectDateForLeaveTemplateRequest1(yearTypeName: string, index: number) {

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

    console.log("index: ", index)

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

    var yearType = this.yearTypeList.find(item => item.name === yearTypeName);

    if (yearType) {
      this.leaveTemplateRequest.fiscalYearId = yearType.id;
    }
    // console.log("fiscalYearId: ",this.leaveTemplateRequest.fiscalYearId)
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


  disableNonFirstDates = (current: Date): boolean => {
    // Disable all dates except the 1st of each month
    return current.getDate() !== 1;
  };


  // custom date select end


  leaveTemplateDefinitionForm !: FormGroup;

  leaveTemplateRequest: LeaveTemplateRequest = new LeaveTemplateRequest();
  readonly LAPSE = Key.LAPSE;
  readonly CARRY_FORWARD = Key.CARRY_FORWARD;
  readonly ENCASH = Key.ENCASH;

  preMethodCallToCreateLeaveTemplate() {
    debugger
    this.getYearTypeListMethodCall();
    this.getLeaveCycleListMethodCall();
    this.getLeaveCategoryListMethodCall();
    this.getUnusedLeaveActionList();
    this.getAllEmployeeType();
    this.loadGenders();
    this.loadAccrualType();
    this.getOrganizationName();

    this.filteredLeaveCategories = []
    this.leaveCategories1 = []
  }

  ON_DUTY_CATEGORY_ID = [8,9];

  setFieldsToLeaveTemplateRequest() {
    debugger
    this.leaveTemplateRequest.leaveTemplateCategoryRequestList = this.form.value.categories.map(
      (category: any) => ({
        id: category.leaveCategoryId,
        leaveCycleId: category.leaveCycleId,
        leaveCount: Number(category.leaveCount),
        sandwichLeave: category.isSandwichLeave,
        unusedLeaveActionId: category.unusedLeaveActionId,
        unusedLeaveActionCount: category.unusedLeaveActionCount,
        accrualTypeId: category.accrualTypeId,
        gender: category.gender,
        reset: category.isReset,
        carryoverAction: category.carryoverAction,
        carryover: category.carryover,
        flexible: category.flexible
      })
    );
    this.leaveTemplateRequest.userIds = [...this.selectedStaffIds, ...this.selectedStaffIdsUser];
    this.leaveTemplateRequest.deselectUserIds = this.deSelectedStaffIdsUser;

  }



  registerToggle: boolean = false;

  @ViewChild('templateSettingTab1') templateSettingTab1!: ElementRef;
  @ViewChild('requestLeaveCloseModel1') requestLeaveCloseModel1!: ElementRef;
  isSubmitted: boolean = true;
  existingAssignedUsers: any[] = [];
showUsersAlreadyAssignedModal = false;
isValidated = false;
userNameWithShiftName: any[] = [];
  registerLeaveTemplateMethodCall() {
    debugger
    this.isSubmitted = false;
    this.allselected = false;
    this.setFieldsToLeaveTemplateRequest();

    // Check for existing assigned users
    const usersToCheck = [...this.selectedStaffIds, ...this.selectedStaffIdsUser];
    this.existingAssignedUsers = this.assignedUsers.filter(user =>
        usersToCheck.includes(user.userId) &&
        user.leaveTemplateName !== this.leaveTemplateRequest.name
    );

    if (this.existingAssignedUsers.length > 0 && !this.isValidated) {
        // Prepare data for modal
        this.userNameWithShiftName = this.existingAssignedUsers.map(user => ({
            userId: user.userId,
            userName: user.userName,
            shiftName: user.leaveTemplateName
        }));

        // Show modal (trigger programmatically)
        const modalElement = document.getElementById('usersAlreadyAssigned');
        if (modalElement) {
            const modal = new (window as any).bootstrap.Modal(modalElement);
            modal.show();
        }
        this.registerToggle = false;
        return; // Wait for modal confirmation
    }else{

      this.registerToggle = true;

    // console.log('CategoryList: ', this.leaveTemplateRequest.leaveTemplateCategoryRequestList)
    this.leaveTemplateRequest.leaveTemplateCategoryRequestList.splice(
      this.leaveTemplateRequest.leaveTemplateCategoryRequestList.length - 1, 1
    );

    debugger
    var isOnDutyTemplate = this.leaveTemplateRequest.leaveTemplateCategoryRequestList.some((category: any) =>
      this.ON_DUTY_CATEGORY_ID.includes(Number(category.id))
  );
    if(isOnDutyTemplate){
     this.leaveTemplateRequest.isWeekOffIncluded=1;
    }

    this.dataService.registerLeaveTemplate(this.leaveTemplateRequest).subscribe((response) => {
      this.helperService.registerOrganizationRegistratonProcessStepData(Key.LEAVE_TEMPLATE_ID, Key.PROCESS_COMPLETED);
      this.leaveTemplateRequest = new LeaveTemplateRequest();
      this.getAllLeaveTemplate();
      this.registerToggle = false;
      this.requestLeaveCloseModel1.nativeElement.click();
      this.fetchAssignedUsers();

      this.form.reset();
      this.leaveTemplateDefinitionForm.reset();

      this.form.reset({}, { emitEvent: false });
      this.leaveTemplateDefinitionForm.reset({}, { emitEvent: false });
      this.leaveCategories1 = []
      this.leaveCategories2 = []
      this.tempLeaveCategories1 = []
      this.displayedCategories = []

      this.employeeTypeId = 0
      this.leaveTemplateRequest.name = ''
      this.leaveTemplateRequest.id = 0
      this.selectedStaffIdsUser = []

      this.emptyAddLeaveSettingRule();

      this.editToggle = false;
      this.updateToggle = false;
      this.clearSearchUsers()

      // Mark all controls as pristine and untouched to clear validation errors
      Object.keys(this.leaveTemplateDefinitionForm.controls).forEach((key) => {
        const control = this.leaveTemplateDefinitionForm.get(key);
        control?.markAsPristine();
        control?.markAsUntouched();
      });

      this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
      // this.helperService.showToast('Leave template registered successfully.', Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      this.registerToggle = false;
      this.helperService.showToast('Error while registering the leave template!', Key.TOAST_STATUS_ERROR);
    })

    // console.log('clear field')
    this.leaveTemplateRequest.name = ''; // Reset the template name
    this.leaveTemplateDefinitionForm.reset(); // Reset the form state
  }
  }

  removeUserFromList(userId: number) {
    // Remove from selected users
    this.selectedStaffIds = this.selectedStaffIds.filter(id => id !== userId);
    this.selectedStaffIdsUser = this.selectedStaffIdsUser.filter(id => id !== userId);

    const staffIndex = this.staffs.findIndex(staff => staff.id === userId);
    if (staffIndex !== -1) {
        this.staffs[staffIndex].checked = false;
    }

    // Remove from display list
    this.userNameWithShiftName = this.userNameWithShiftName.filter(user => user.userId !== userId);

    this.leaveTemplateRequest.userIds = [...this.selectedStaffIds, ...this.selectedStaffIdsUser];
    // If no users left, close modal
    if (this.userNameWithShiftName.length === 0) {
        this.closeModal();
    }
}

registerShift() {
    if (!this.isValidated) return;
    this.registerLeaveTemplateMethodCall();
    // Close modal
    this.closeModal();
}

checkValidation() {
    // Toggle isValidated based on checkbox
   // this.isValidated = !this.isValidated;
}

closeModal() {
    const modalElement = document.getElementById('usersAlreadyAssigned');
    if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    this.isValidated = false;
    this.userNameWithShiftName = [];
}


  isShimmerForLeaveTemplateResponse = false;
  dataNotFoundPlaceholderForLeaveTemplateResponse = false;
  networkConnectionErrorPlaceHolderForLeaveTemplateResponse = false;
  preRuleForShimmerAndErrorPlaceholdersForLeaveTemplateResponse() {
    this.isShimmerForLeaveTemplateResponse = true;
    this.dataNotFoundPlaceholderForLeaveTemplateResponse = false;
    this.networkConnectionErrorPlaceHolderForLeaveTemplateResponse = false;
  }

  leaveTemplateResponseList: LeaveTemplateResponse[] = [];
  getLeaveTemplateResponseListByOrganizationIdMethodCall() {
    this.preRuleForShimmerAndErrorPlaceholdersForLeaveTemplateResponse();
    this.dataService.getLeaveTemplateResponseListByOrganizationId().subscribe((response) => {
      if (this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.dataNotFoundPlaceholderForLeaveTemplateResponse = true;
      } else {
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
  wfhLeaveTemplates: LeaveTemplateRes[] = []
  weekOffTemplates: LeaveTemplateRes[] = []
  wfhLeaveTemplatesIds: number[] = [8,9];
  weekOffTemplatesIds: number[] = [10];
  leaveTemplatesIds: number[] = [1, 2, 3, 4, 5, 6, 7, 11, 12];

  getAllLeaveTemplate() {
    debugger
    this.isLoading = true;
    this.dataService.getAllLeaveTemplate(1, 10).subscribe((response: any) => {

      this.isLoading = false;

      // this.leaveTemplates = response.object;
      // console.log('leaveTemplates: ',this.leaveTemplates)


  // this.wfhLeaveTemplates = response.object.filter((template: any) =>
  //   template.leaveTemplateCategoryRes.length > 0 &&
  //   template.leaveTemplateCategoryRes.leaveCategoryId == 8
  // );

  this.wfhLeaveTemplates = response.object.filter((template: any) =>
      // template.leaveTemplateCategoryRes[0].leaveCategoryId === 8 || template.leaveTemplateCategoryRes[0].leaveCategoryId === 9
  this.wfhLeaveTemplatesIds.includes(template.leaveTemplateCategoryRes[0].leaveCategoryId)
  );
  this.weekOffTemplates = response.object.filter((template: any) =>
    // template.leaveTemplateCategoryRes[0].leaveCategoryId === 10
  this.weekOffTemplatesIds.includes(template.leaveTemplateCategoryRes[0].leaveCategoryId)
  );

  this.leaveTemplates = response.object.filter((template: any) =>
    // template.leaveTemplateCategoryRes[0].leaveCategoryId != 8 && template.leaveTemplateCategoryRes[0].leaveCategoryId != 9 && template.leaveTemplateCategoryRes[0].leaveCategoryId != 10
  this.leaveTemplatesIds.includes(template.leaveTemplateCategoryRes[0].leaveCategoryId)
  );

// console.log('leaveTemplates: ',this.leaveTemplates)
// console.log('wfhLeaveTemplates: ',this.wfhLeaveTemplates)
    });
  }


  onTemplateSubmit() {
    if (this.leaveTemplateDefinitionForm.valid) {
      // Proceed with submission logic
      this.goToLeaveCategoryTab();
    } else {
      // Mark all controls as touched to show validation messages
      this.leaveTemplateDefinitionForm.controls['empTypeId'].markAsTouched();
      this.leaveTemplateDefinitionForm.controls['genderId'].markAsTouched();
    }
  }

  allselected: boolean = false;
  selectAllEmployee(event: any) {
    if (!this.allselected) {
      this.staffs.forEach((element) => {
        // Only select if joiningDate exists
        if (element.joiningDate) {
          this.selectedStaffIdsUser.push(element.id);
          element.checked = true;
        }
      });
      this.allselected = true;
    } else {
      this.staffs.forEach((element: any) => {
        element.checked = false;
      });
      this.allselected = false;
      this.selectedStaffIdsUser = [];
    }
    console.log('all Ids: ', this.selectedStaffIdsUser);

    // Remove duplicates using Set
    this.selectedStaffIdsUser = Array.from(new Set(this.selectedStaffIdsUser));
    console.log('After SET Ids: ', this.selectedStaffIdsUser);
  }

  selectSingle1(event: any, i: any) {
    debugger
    if (event.checked) {
      this.allselected = false;

      this.staffs[i].checked = false;
      var index = this.selectedStaffIdsUser.indexOf(event.id);
      this.selectedStaffIdsUser.splice(index, 1);

    } else {
      this.staffs[i].checked = true;
      this.selectedStaffIdsUser.push(event.id);

      if (this.selectedStaffIdsUser.length == this.staffs.length) {
        this.allselected = true;
      }
    }

    console.log('selIds: ', this.selectedStaffIdsUser)

  }

  deSelectedStaffIdsUser: number[] = [];
  selectSingle(event: any, i: any) {
    debugger
    if (event.checked) {
      this.allselected = false;

      this.deSelectedStaffIdsUser.push(event.id)

      this.staffs[i].checked = false;
      var index = this.selectedStaffIdsUser.indexOf(event.id);
      this.selectedStaffIdsUser.splice(index, 1);

      console.log('deSelectedStaffIdsUser: ', this.deSelectedStaffIdsUser)

      if (this.selectedStaffIdsUser.length == 0 && this.showMappedUserToggle) {
        this.showAllUser();
      }

    } else {
      this.staffs[i].checked = true;
      this.selectedStaffIdsUser.push(event.id);

      if (this.deSelectedStaffIdsUser.includes(event.id)) {
        const index = this.deSelectedStaffIdsUser.indexOf(event.id);
        if (index > -1) {
          this.deSelectedStaffIdsUser.splice(index, 1);
        }
      }

      if (this.selectedStaffIdsUser.length == this.staffs.length) {
        this.allselected = true;
      }

      console.log('selectedIds: ', this.selectedStaffIdsUser)
      console.log('del: ', this.deSelectedStaffIdsUser)
    }

  }

  clearIds() {
    this.selectedStaffIdsUser = []
    this.staffs.forEach((staff, index) => {
      staff.checked = false;
    });

    this.showAllUser();

  }

  selectedStaffList: Staff[] = [];
  selectedUserIds: number[] = [];
  showMappedUserToggle: boolean = false;
  showMappedUser() {
    this.showMappedUserToggle = true;
    this.selectedUserIds = this.selectedStaffIdsUser

    this.getUserByFiltersMethodCall(0);

    // console.log('sele staff', this.staffs);
  }

  showAllUser() {
    this.showMappedUserToggle = false;
    this.selectedUserIds = []
    this.getUserByFiltersMethodCall(0);
  }

  organizationName: string = ''
  getOrganizationName() {
    this.dataService.getOrganizationName().subscribe((res: any) => {

      if (res.status) {
        this.organizationName = res.object;
        let type=' Leave';
        if(this.wfhTemplateToggle){
          type=' On Duty';
        }
        if(this.weekOffTemplateToggle){
          type=' Week Off'
        }
        // this.leaveTemplateRequest.name = this.organizationName + " Leave"
        this.leaveTemplateRequest.name = this.organizationName + type
      } else {
        this.organizationName = '';
      }

    })
  }

  enableWFH(flag: boolean){
    this.form.reset();
    // this.form.value.reset();
    // this.categories.clear();


    this.wfhIndex = 0;
    // this.wfhIndex = this.displayedCategories.length;


    this.clearFormFields();

    this.displayedCategories = []
    this.leaveCategories1 = []
    this.leaveCategories2 = []
    this.tempLeaveCategories1 =[]
    this.weekOffTemplateToggle = false;
    this.wfhTemplateToggle = flag;
  }
  enableWeekOff(flag: boolean){
    this.form.reset();
    // this.form.value.reset();
    // this.categories.clear();

    this.wfhIndex = 0;
    // this.wfhIndex = this.displayedCategories.length;

    this.clearFormFields();

    this.displayedCategories = []
    this.leaveCategories1 = []
    this.leaveCategories2 = []
    this.tempLeaveCategories1 =[]
    this.wfhTemplateToggle = true;
    this.weekOffTemplateToggle = flag;
  }

  weekOffTemplateToggle: boolean = false;
  wfhTemplateToggle: boolean = false;
  defaultLeaveCategoryId: number = 0
  defaultLeaveActionId: number = 0
  wfhIndex: number = 0;
  async leaveTemplateForm(flag: boolean){
    debugger

    if(this.wfhTemplateToggle){

      // setTimeout(() => {
      //   this.loadGenders();

      //   this.onGenderChange(1, 1);
      //   this.getLeaveCategoryListMethodCall();
      // },200)

      // await this.loadGenders();
      // await this.onGenderChange(1, 1);
      // await this.getLeaveCategoryListMethodCall();

      this.loadGenders();
      this.onGenderChange(1, 1);
      this.getLeaveCategoryListMethodCall();

    this.filteredLeaveCategories = this.leaveCategoryList;

    // console.log('leaveTemplateForm Cat', this.filteredLeaveCategories)
    // this.defaultLeaveCategoryId = 8
    // setTimeout(() => {

    const wfhCategory = this.filteredLeaveCategories.find((leave: any) => leave.name === 'WFH');
    // console.log('earnedLeave Cat', wfhCategory)

    // if (wfhCategory) {
    //   this.defaultLeaveCategoryId = wfhCategory.id; // Set the ID of 'Earned Leave' as default
    // }

    this.getUnusedLeaveActionList();
     this.unusedLeaveActionList = this.unusedLeaveActionList
    //  console.log('unusedLeaveActionList ',this.unusedLeaveActionList)

    // this.defaultLeaveActionId = 1
    // }, 200)


    // this.setGenderValue(this.rowIndex - 1, 'All');
    // this.setCategoryValue(this.rowIndex -1, 8);
    // this.setUnusedLeaveAction(this.rowIndex -1, 1);

    this.setGenderValue(this.wfhIndex, 'All');
    this.setCategoryValue(this.wfhIndex, 8);
    this.setUnusedLeaveAction(this.wfhIndex, 1);

  }
}

setGenderValue(index: number, value: any): void {
  const laveGender = (this.form.get('categories') as FormArray)
    .at(index)
    ?.get('gender');
  if (laveGender) {
    laveGender.setValue(value);
  }
}

setCategoryValue(index: number, value: any): void {
  const laveCategory = (this.form.get('categories') as FormArray)
    .at(index)
    ?.get('leaveCategoryId');
  if (laveCategory) {
    laveCategory.setValue(value);
  }
}

setUnusedLeaveAction(index: number, value: any): void {
  const laveUnusedAction = (this.form.get('categories') as FormArray)
    .at(index)
    ?.get('unusedLeaveActionId');
  if (laveUnusedAction) {
    laveUnusedAction.setValue(value);
  }
}


  leaveTemplateForm1(flag: boolean){
    debugger
    this.wfhTemplateToggle = flag;

    if(this.wfhTemplateToggle){
      this.loadGenders();

    this.onGenderChange(1, 1);
    this.getLeaveCategoryListMethodCall();

    this.filteredLeaveCategories = this.leaveCategoryList;

  const earnedLeave = this.filteredLeaveCategories.find((leave: any) => leave.name === 'WFH');

  if (earnedLeave) {
    this.defaultLeaveCategoryId = earnedLeave.id; // Set the ID of 'Earned Leave' as default
  }

  this.getUnusedLeaveActionList();
   this.unusedLeaveActionList = this.unusedLeaveActionList
   console.log('unusedLeaveActionList ',this.unusedLeaveActionList)

  this.defaultLeaveActionId = 1

  }
}

showError: boolean = false;
showErrorCount: boolean = false;
// leaveCount: number = 1
tempLeaveCount!: number

// validateAndAdjustLeaveCount(value: number, index: number): void {
validateAndAdjustLeaveCount(value: number, index: number): void {
  debugger

 if(value > 0){
  this.showError = false;
  this.showErrorCount = false;

  const tempValue = +value
  // const tempValue = this.getVal;

  // Separate the integer and decimal parts of the input value
  const integerPart = Math.floor(value);
  const decimalPart = value - integerPart;

  let adjustedValue: number;

  if (decimalPart >= 0.5) {
    // If decimal is 0.5 or more, round to the nearest 0.5
    adjustedValue = integerPart + 0.5;
    this.showError = true;
  } else {
    // If decimal is less than 0.5, round down to the integer
    adjustedValue = integerPart;
  }

  if(decimalPart <= 0.5){
    this.showError = true;
  }



  // Show error if the input was adjusted
  // if (value  !== adjustedValue) {
    if (Number(value) !== adjustedValue) {
    // this.showError = true;
    // this.showErrorCount = true;

    // Temporarily set leaveCount to null, then assign adjusted value to trigger UI update
    this.tempLeaveCount = 0
    // this.cdr.detectChanges();
    setTimeout(() => {
      this.tempLeaveCount = adjustedValue
      // .toString();
      // this.cdr.detectChanges();
    },50);
  } else {
    this.tempLeaveCount = value
    // .toString();
    // this.showError = false;
  }

  // const hasDecimal = !Number.isInteger(tempValue);
  // console.log("tempValue ",tempValue)
  const hasDecimal = tempValue % 1 !== 0;
  if(hasDecimal){
    this.showErrorCount = true;
  }else{
    this.showErrorCount = false;
  }

  // console.log("leave count work: ",this.tempLeaveCount)

  // Call generateDaysDropdown with the adjusted value
  this.generateDaysDropdown(this.tempLeaveCount, index);
  return;
 }
}

getVal: any;
getValue1(event: any, index: number){
  debugger
  this.getVal = event.target.value
  console.log('getVal: ',this.getVal)

  this.validateAndAdjustLeaveCount(this.getVal, index)
}

getValue(event: Event, index: number): void {
  const input = (event.target as HTMLInputElement).value;

  // Allow only valid decimal numbers (e.g., 22.6) and parse it as a number
  if (/^\d+(\.\d{1,2})?$/.test(input)) {
    this.tempLeaveCount = parseFloat(input)
    // .toString();
  } else {
    // Optional: Display an error message if input is invalid
    console.log("Invalid decimal value.");
  }

  this.getVal = input;

  console.log('getVal: ',this.getVal)
  this.validateAndAdjustLeaveCount(this.getVal, index)
}

validateMaxValue(index: number): void {
  debugger
  const control = this.categories.controls[index].get('unusedLeaveActionCount');
  setTimeout(() =>{
    if (control && Number(control.value) > Number(this.tempLeaveCount)) {
      control.setValue(this.tempLeaveCount);
      this.changeCarryForwardAccrual(index);
    }
  });
}

skipLoading: boolean = false;
  async skipForNow() {
  this.skipLoading = true;
  // this.stepCompleted = true;
  await this.helperService.registerOrganizationRegistratonProcessStepData(Key.LEAVE_TEMPLATE_ID, Key.PROCESS_COMPLETED);
  this.checkStepCompletionStatusByStepId(Key.LEAVE_TEMPLATE_ID);
  this.skipLoading = false;
}


stepCompleted: boolean = true;
checkStepCompletionStatusByStepId(stepId: number) {
  this.dataService.checkStepCompletionStatusByStepId(stepId).subscribe(
    (response: any) => {
      if (response.object == 1) {
         this.stepCompleted = true;
      }else if (response.object == 0) {
        this.stepCompleted = false;
      }
    },
    (error) => {
      console.log('error');
    }
  );
}


carryoverActions: Array<{id:number,name: string, value: string }> = [
    {id: 1, name: 'Total', value: 'Total' },
    {id: 2, name: 'Restricted', value: 'Restricted' },
  ];

changeCarryForwardAccrual(index: number){

    const leaveCycle = this.categories.controls[index].get('leaveCycleId');
    const unusedLeaveActionCount = this.categories.controls[index].get('unusedLeaveActionCount');
    // console.log(leaveCycle,'unusedLeaveActionCount=========',unusedLeaveActionCount);
    if(leaveCycle && unusedLeaveActionCount){
      var count = unusedLeaveActionCount.value;
      var id = leaveCycle.value;

      if(id == 1){
        count = count * 12; //Monthly
      }else if(id == 2){
        count = count * 4;  //Quaterly
      }else if(id == 3){
        count = count * 2;  //Half Yearly
      }
      this.updateCarryForwardAccrualDaysDropdown(index, count);
    }
  }

tempForwardDaysCount:number=0;
forwardDaysCountArray: number[][] = [];
updateCarryForwardAccrualDaysDropdown(index: number, count: number): void {
  while (this.forwardDaysCountArray.length <= index) {
    this.forwardDaysCountArray.push([]);
  }
  this.forwardDaysCountArray[index] = Array.from(
    { length: count  },
    (_, i) => count - i
  );
  this.tempForwardDaysCount = count;
}
editingStaff: Staff = new Staff(); // Tracks which staff row is being edited
  tempJoiningDate: Date | null = null; // Temporary variable for the joining date

  editJoiningDate(staff: any) {
    this.editingStaff = staff; // Set the staff being edited
    this.tempJoiningDate = null; // Clear the temporary joining date
    this.cdr.detectChanges();
  }

  saveJoiningDate(staff: any) {
    if (this.tempJoiningDate) {
      this.dataService.updateJoiningDate(staff.id, this.tempJoiningDate).subscribe({
        next: (response) => {
          if(response.status){

            this.getUserByFiltersMethodCall(this.idOfLeaveSetting);
            this.helperService.showToast('Joining date added for '+ staff.name, Key.TOAST_STATUS_SUCCESS);
          }else{
            this.helperService.showToast('Unable to add Joining date for '+ staff.name, Key.TOAST_STATUS_SUCCESS);
          }
        },
        error: (err) => {
          console.error('Error:', err);

        }
      });
      staff.joiningDate = this.tempJoiningDate;
    }
    this.resetEditingState();
  }


  resetEditingState() {
    this.editingStaff = new Staff(); // Clear the editing staff
    this.tempJoiningDate = null; // Clear the temporary date
    this.cdr.detectChanges();
  }


  // getInvalidFormValues(): void {
  //   const invalidControls = Object.keys(this.form.controls).filter(controlName => {
  //     return this.form.get(controlName)?.invalid;
  //   });
  //   console.log(invalidControls);
  //   console.log(this.form);

  //   // Print the invalid values

  //   // Loop through invalid controls and print their missing validations
  //   invalidControls.forEach(controlName => {
  //     const control = this.form.get(controlName);
  //     if (control?.invalid) {
  //       const errors = control.errors;
  //       console.log(`Missing validations for ${controlName}:`);
  //       for (const errorKey in errors) {
  //         if (errors.hasOwnProperty(errorKey)) {
  //           console.log(`  - ${errorKey} is missing`);
  //         }
  //       }
  //     }
  //   });
// }

// getInvalidFormValues(event:any,index:number){
//   const isReset = (this.form.get('categories') as FormArray)
//     .at(index)
//     ?.get('isReset');
//     // console.log("🚀 ~ getInvalidFormValues ~ isReset:", isReset)

//     if(isReset!=null){
//       isReset.setValue(event);
//       console.log("🚀 ~ getInvalidFormValues ~ isReset:", isReset)
//       console.log("🚀 ~ getInvalidFormValues ~ form:", this.form.value)
// resetCarryOverAction(i: number) {
//   this.categories.controls[i]!.get('carryoverAction')?.setValue(null);
//   this.categories.controls[i]!.get('carryover')?.setValue(null);

//   if(this.categories.controls[i]!.get('isReset')?.value.getValue == true) {

//   }
// }

resetCarryOverAction(i: number) {
  const categoryControl = this.categories.controls[i];

  // Reset values when `isReset` is checked
  if (categoryControl.get('isReset')?.value === true) {
    categoryControl.get('carryoverAction')?.setValue(null);
    categoryControl.get('carryover')?.setValue(null);

    // Remove required validation
    categoryControl.get('carryoverAction')?.clearValidators();
    categoryControl.get('carryover')?.clearValidators();
  } else {
    // Add required validation when `isReset` is false

    if(this.categories.controls[i]!.get('carryoverAction')?.value=='Restricted') {
       categoryControl.get('carryover')?.setValidators([Validators.required]);
    }else {
      categoryControl.get('carryoverAction')?.setValidators([Validators.required]);
    }

    categoryControl.get('carryoverAction')?.setValue(null);
    categoryControl.get('carryover')?.setValue(null);
  }

  // Update form validity
  categoryControl.get('carryoverAction')?.updateValueAndValidity();
  categoryControl.get('carryover')?.updateValueAndValidity();
}






}
