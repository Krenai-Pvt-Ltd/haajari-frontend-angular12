import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LeaveTemplateRes } from 'src/app/models/LeaveTemplateRes';
import { Staff } from 'src/app/models/staff';
import { DataService } from 'src/app/services/data.service';
import { LeaveTemplateRequest } from 'src/app/models/leave-template-request';
import { LeaveTemplateCategoryRequest } from 'src/app/models/leave-template-category-request';
import { HelperService } from 'src/app/services/helper.service';
import { Key } from 'src/app/constant/key';
import { LeaveCategory } from 'src/app/models/leave-category';
import { YearType } from 'src/app/models/year-type';
import { LeaveCycle } from 'src/app/models/leave-cycle';
import { UnusedLeaveAction } from 'src/app/models/unused-leave-action';
import { Routes } from 'src/app/constant/Routes';
@Component({
  selector: 'app-leave-policy',
  templateUrl: './leave-policy.component.html',
  styleUrls: ['./leave-policy.component.css']
})
export class LeavePolicyComponent implements OnInit {
  readonly Routes=Routes;

  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private cdr: ChangeDetectorRef,
    public rbacService: RoleBasedAccessControlService
  ) { }

  ngOnInit(
  ): void {
    // this.getAllLeaveTemplate();
    this.resetForm();
    this.fetchStaffs();
    this.getLeaveCategoryListMethodCall();
    this.getYearTypeList();
    this.loadAccrualType();
    this.getLeaveCycleList();
    this.getUnusedLeaveActionList();
    this.getLeaveTemplate();
  }
  isLoading: boolean = false;
  leaveTemplates: LeaveTemplateRes[] = []
  wfhLeaveTemplates: LeaveTemplateRes[] = []
  weekOffTemplates: LeaveTemplateRes[] = []
  wfhLeaveTemplatesIds: number[] = [8, 9];
  weekOffTemplatesIds: number[] = [10];
  leaveTemplatesIds: number[] = [1, 2, 3, 4, 5, 6, 7, 11, 12];

  getAllLeaveTemplate() {
    debugger
    this.isLoading = true;
    this.dataService.getAllLeaveTemplate(1, 30).subscribe((response: any) => {

      this.isLoading = false;
      this.wfhLeaveTemplates = response.object.filter((template: any) =>
        this.wfhLeaveTemplatesIds.includes(template.leaveTemplateCategoryRes[0].leaveCategoryId)
      );
      this.weekOffTemplates = response.object.filter((template: any) =>
        this.weekOffTemplatesIds.includes(template.leaveTemplateCategoryRes[0].leaveCategoryId)
      );
      this.leaveTemplates = response.object.filter((template: any) =>
        this.leaveTemplatesIds.includes(template.leaveTemplateCategoryRes[0].leaveCategoryId)
      );
    },
      (error: any) => {
        this.isLoading = false;
        console.error('Error fetching leave templates:', error);
      }
    );
  }

  page: number = 1;
  pageSize: number = 10;
  currentTab: string = 'LEAVE';
  getLeaveTemplate() {
    debugger
    this.isLoading = true;
    const tab = this.currentTab;
    this.dataService.getLeaveTemplates(this.currentTab,this.page-1, this.pageSize).subscribe((response: any) => {

      this.isLoading = false;
      if (tab === 'LEAVE') {
        this.leaveTemplates = response.object.content;
      } else if (tab === 'ON_DUTY') {
        this.wfhLeaveTemplates = response.object.content;
      } else if (tab === 'WEEK_OFF') {
        this.weekOffTemplates = response.object.content;
      }else if (tab === 'ALL') {
        this.leaveTemplates = response.object.content;
      }
    },
      (error: any) => {
        this.isLoading = false;
      }
    );
  }
  onPageChange1(event: any) {
    this.page = event;
    this.getLeaveTemplate();
  }
  onTabChange(tab: string) {
    this.page=1;
    this.currentTab = tab;
    this.getLeaveTemplate();
  }



  @ViewChild('leaveModal') leaveModal?: any; // For ngx-bootstrap modal reference

  leaveTemplate: LeaveTemplateRequest = new LeaveTemplateRequest();
  newCategory: LeaveTemplateCategoryRequest = new LeaveTemplateCategoryRequest();

  // Staff selection properties
  staffs: Staff[] = [];
  selectedStaffIds: number[] = [];
  searchText: string = '';
  total: number = 0;
  pageNumber: number = 1;
  itemPerPage: number = 10;
  debounceTimer: any;
  employeeTypeId: number = 1; // Default to 'All'
  // Template Setting Methods
  onEmployeeTypeChange(id: number) {
    this.leaveTemplate.employeeTypeId = id;
    this.employeeTypeId = id;
    this.fetchStaffs(); // Refresh staff list based on employee type
  }

  // Leave Category Methods
  leaveTemplateCategoryRequestList: LeaveTemplateCategoryRequest[] = [];
  addLeaveCategory() {
    this.leaveTemplate.leaveTemplateCategoryRequestList.push({ ...this.newCategory });
    this.leaveTemplateCategoryRequestList.push({ ...this.newCategory });
    this.newCategory = new LeaveTemplateCategoryRequest(); // Reset for next entry
  }

  // Staff Selection Methods
  fetchStaffs(debounceTime: number = 300) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    let isProbation: boolean | undefined = undefined;
    if (this.employeeTypeId !== 1) {
      isProbation = this.employeeTypeId === 2; // 2 = Provisional, 3 = Confirmed
    }

    this.debounceTimer = setTimeout(() => {
      this.dataService
        .getUsersByFilterForLeaveSetting(
          this.itemPerPage,
          this.pageNumber,
          'asc',
          'id',
          this.searchText,
          '',
          0, // Assuming leaveSettingId is 0 for new template
          0, // selectedTeamId, adjust if needed
          [],
          isProbation
        )
        .subscribe(
          (response) => {
            this.staffs = response.users || [];
            this.total = response.count || 0;
            this.staffs.forEach((staff) => {
              staff.checked = this.selectedStaffIds.includes(staff.id);
            });
          },
          (error) => {
            console.error('Error fetching staff:', error);
          }
        );
    }, debounceTime);
  }

  onStaffSelect(staff: Staff) {
    if (staff.checked) {
      if (!this.selectedStaffIds.includes(staff.id)) {
        this.selectedStaffIds.push(staff.id);
      }
    } else {
      this.selectedStaffIds = this.selectedStaffIds.filter((id) => id !== staff.id);
    }
  }
  onStaffClear() {
    this.staffs.forEach((staff) => {
      staff.checked = false;
    });
    this.selectedStaffIds = [];
  }

  selectAllEmployee() {
    if(!this.rbacService.hasWriteAccess(this.Routes.LEAVESETTING)){
      this.helperService.showPrivilegeErrorToast();
      return;
    }
    if (!this.isAllSelected()) {
      this.staffs.forEach((element) => {
        // Only select if joiningDate exists
        if (element.joiningDate) {
          this.selectedStaffIds.push(element.id);
          element.checked = true;
        }
      });
    } else {
      this.staffs.forEach((element: any) => {
        element.checked = false;
        // Remove the ID from selectedStaffIds if it exists
        this.selectedStaffIds = this.selectedStaffIds.filter((id) => id !== element.id);
      });
    }
    // Remove duplicates using Set
    this.selectedStaffIds = Array.from(new Set(this.selectedStaffIds));

  }

  isAllSelected(): boolean {
    const allChecked = this.staffs.filter((staff) => staff.joiningDate).every((staff) => staff.checked);
    console.log('All selected:', allChecked);
    return allChecked;
  }

  selectAllPages: boolean = false;
  // Properties
  private cachedStaffIdsWithJoiningDate: number[] = []; // Cache for staff IDs with joining dates
  private isCacheLoaded: boolean = false; // Flag to track if cache is initialized
   cachedStaffIdsWithoutJoiningDate: number[] = [];
  // Separate method to load and cache staff IDs
  private loadStaffIdsCache() {
    let isProbation: boolean | undefined = undefined;
    if (this.employeeTypeId !== 1) {
      isProbation = this.employeeTypeId === 2; // 2 = Provisional, 3 = Confirmed
    }
    this.dataService.getUsersByFilterForLeaveSetting(
      0, // 0 items per page to get all records
      1, // Start from page 1
      'asc',
      'id',
      this.searchText,
      '',
      0, // Assuming leaveSettingId is 0 for new template
      0, // selectedTeamId, adjust if needed
      [],
      isProbation
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
          this.selectedStaffIds = [...this.cachedStaffIdsWithJoiningDate];
          this.staffs.forEach((element) => {
            // Only select if joiningDate exists
            if (element.joiningDate) {
              element.checked = true;
            }
          });
        }
      },
      (error) => {
        console.error('Error loading staff IDs cache:', error);
        this.isCacheLoaded = false;
        this.selectAllPages = false;
      }
    );
  }

  // Modified selectAllStaffAcrossPages method
  selectAllStaffAcrossPages() {
    if(!this.rbacService.hasWriteAccess(this.Routes.LEAVESETTING)){
      this.helperService.showPrivilegeErrorToast();
      return;
    }
    this.selectAllPages = !this.selectAllPages;
    setTimeout(() => {
    if (this.selectAllPages) {
      this.selectedStaffIds = [];
      if (this.isCacheLoaded) {
        // Use cached data
        this.selectedStaffIds = [...this.cachedStaffIdsWithJoiningDate];
        this.staffs.forEach((element) => {
          // Only select if joiningDate exists
          if (element.joiningDate) {
            element.checked = true;
          }
        });
      } else {
        // Load cache and proceed
        this.loadStaffIdsCache();
      }
    } else {
      this.selectedStaffIds = [];
      this.staffs.forEach((element) => {
        element.checked = false;
      });
    }
  },10);
  }

  onPageChange(page: number) {
    this.pageNumber = page;
    this.fetchStaffs(0); // Fetch without debounce on page change
  }

  // Save and Modal Management
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;
  @ViewChild('closeModal2') closeModal2!: ElementRef;
  isLoadingSave: boolean = false;
  saveLeaveTemplate() {
    if(!this.rbacService.hasWriteAccess(this.Routes.LEAVESETTING)){
      this.helperService.showPrivilegeErrorToast();
      return;
    }
    this.isLoadingSave = true;
    this.leaveTemplate.userIds = this.selectedStaffIds;
    // Filter IDs from readOnlySelectedStaffIds that are not in selectedStaffIdsUser
    const newUnSelectedIds = this.readOnlySelectedStaffIds.filter(
      id => !this.selectedStaffIds.includes(id)
    );

    // Add new IDs to unSelectedStaffIds, avoiding duplicates
    this.unSelectedStaffIds = [
      ...new Set([...this.unSelectedStaffIds, ...newUnSelectedIds])
    ];
    this.leaveTemplate.deselectUserIds = this.unSelectedStaffIds;
    this.leaveTemplate.leaveTemplateCategoryRequestList = this.leaveTemplateCategoryRequestList;

    this.dataService.registerLeaveTemplate(this.leaveTemplate).subscribe(
      (response) => {
        this.isLoadingSave = false;
        this.resetForm();
        this.getAllLeaveTemplate();
        this.closeModal.nativeElement.click();
        this.closeModal1.nativeElement.click();
        this.closeModal2.nativeElement.click();
        this.helperService.showToast(
          'Leave template saved successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.isLoadingSave = false;
        console.error('Error saving leave template:', error);
      }
    );
  }

  resetForm() {
    this.leaveTemplate = new LeaveTemplateRequest();
    this.newCategory = new LeaveTemplateCategoryRequest();
    this.selectedStaffIds = [];
    this.readOnlySelectedStaffIds = [];
    this.unSelectedStaffIds = [];
    this.staffs = [];
    this.searchText = '';
    this.pageNumber = 1;
    this.total = 0;
    this.selectAllPages=false;

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
          if (response.status) {

            this.fetchStaffs();
            this.helperService.showToast('Joining date added for ' + staff.name, Key.TOAST_STATUS_SUCCESS);
          } else {
            this.helperService.showToast('Unable to add Joining date for ' + staff.name, Key.TOAST_STATUS_SUCCESS);
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

  selectedGenderId: number = 0;
  gender: any = null;

  filteredLeaveCategories: any;

    leaveCategoryList: LeaveCategory[] = [];
    onDutyList: LeaveCategory[] = [];
    weekOffCategoryList: LeaveCategory[] = [];
    allCategoryList: LeaveCategory[] = [];
    getLeaveCategoryListMethodCall() {
      this.dataService.getLeaveCategoryList().subscribe((response) => {
        if (!this.helperService.isListOfObjectNullOrUndefined(response)) {
          let categoryList: LeaveCategory[] = response.listOfObject;
          this.allCategoryList = categoryList;
          this.leaveCategoryList = categoryList.filter(category => category.category === 'LEAVE');
          this.onDutyList = categoryList.filter(category => category.category === 'ON_DUTY');
          this.weekOffCategoryList = categoryList.filter(category => category.category === 'WEEK_OFF');

        }
      }, (error) => {

      })
    }
    findCategoryById(id: number): any{
      return this.allCategoryList.find((category) => category.id === id)?.name;
    }
    findCycleById(id: number): any{
      return this.leaveCycleList.find((category) => category.id === id)?.name;
    }
    findAccrualTypeById(id: number): any{
      return this.accrualTypes.find((category) => category.id === id)?.name;
    }
  findUnusedLeaveActionById(id: number): any{
    return this.unusedLeaveActionList.find((category) => category.id === id)?.name;
  }

  yearTypeList: YearType[] = [];
  getYearTypeList() {
    this.dataService.getYearTypeList().subscribe((response) => {
      if (!this.helperService.isListOfObjectNullOrUndefined(response)) {
        this.yearTypeList = response.listOfObject;
      }
    })
  }

  dateRange: Date[] = [];
  onStartDateChange() {
    const startDate = new Date(this.leaveTemplate.startDate);
    if (startDate) {
      this.dateRange[0] = startDate;

      // Set the end date to the same day next year
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);

      // Go one month back and get the last day of that month
      endDate.setMonth(startDate.getMonth() - 1);
      const lastDayOfPreviousMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
      endDate.setDate(lastDayOfPreviousMonth); // Set to last day of previous month

      this.dateRange[1] = endDate;

      this.leaveTemplate.startDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[0]);
      this.leaveTemplate.endDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[1]);
    }
  }

  isCustomDateRange: boolean = false;
  readonly ANNUAL_YEAR = Key.ANNUAL_YEAR;
  readonly FINANCIAL_YEAR = Key.FINANCIAL_YEAR;
  selectDateForLeaveTemplate(yearTypeName: string) {
    this.isCustomDateRange = (yearTypeName === 'Custom Date Range');

    if (yearTypeName === this.ANNUAL_YEAR) {
      this.dateRange[0] = new Date(new Date().getFullYear(), 0, 1);
      this.dateRange[1] = new Date(new Date().getFullYear(), 11, 31);
    } else if (yearTypeName === this.FINANCIAL_YEAR) {
      this.dateRange[0] = new Date(new Date().getFullYear(), 3, 1);
      this.dateRange[1] = new Date(new Date().getFullYear() + 1, 2, 31);
    }

    if (!this.isCustomDateRange) {
      this.leaveTemplate.yearTypeName = yearTypeName;
      this.leaveTemplate.startDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[0]);
      this.leaveTemplate.endDate = this.helperService.formatDateToYYYYMMDD(this.dateRange[1]);
    } else {
      // Leave it blank for custom date selection
      this.leaveTemplate.startDate = '';
      this.leaveTemplate.endDate = '';
    }

    var yearType = this.yearTypeList.find(item => item.name === yearTypeName);

    if (yearType) {
      this.leaveTemplate.fiscalYearId = yearType.id;
    }

  }

  accrualTypes: Array<{ id: number, name: string, value: string }> = []; // Gender options
  loadAccrualType() {
    this.accrualTypes = [
      { id: 1, name: 'Start', value: 'start' },
      { id: 2, name: 'End', value: 'end' }
    ];
  }
    leaveCycleList: LeaveCycle[] = [];
    getLeaveCycleList() {
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

      readOnlySelectedStaffIds: number[] = [];
      unSelectedStaffIds: number[] = [];
      readOnlyLeaveTemplateCategory : LeaveTemplateCategoryRequest[] = [];

      getLeaveSettingInformationById(leaveSettingId: number, flag: boolean): void {
        this.leaveTemplate.id = leaveSettingId;
        this.dataService.getLeaveSettingInformationById(leaveSettingId).subscribe(
          (response: any) => {

            this.employeeTypeId = response.leaveTemplate.employeeType.id;
            this.leaveTemplate.name = response.leaveTemplate.name;
            this.dateRange[0] = response.leaveTemplate.startDate
            this.dateRange[1] = response.leaveTemplate.endDate

            this.staffs.forEach((staff, index) => {
              staff.checked = response.userIds.includes(staff.id);
            });

            response.userIds.forEach((id: number) => {
              this.selectedStaffIds.push(id)

            });
            response.userIds.forEach((id: number) => {
              this.readOnlySelectedStaffIds.push(id)

            });

            setTimeout((res: any) => {
              var yearType = this.yearTypeList.find(item => item.id === response.leaveTemplate.fiscalYearId);

              if (yearType) {
                this.leaveTemplate.yearTypeName = yearType.name;
                // console.log("Year Type Name:", this.leaveTemplateRequest.yearTypeName);
              }

              if (response.leaveTemplate.fiscalYearId == 3) {
                this.isCustomDateRange = true;
              }
            }, 200)

           // Map leave template categories
      this.leaveTemplate.leaveTemplateCategoryRequestList = response.leaveTemplateCategories.map((category: any) => ({
        id: category.leaveCategory.id,
        leaveCount: category.leaveCount,
        leaveCycleId: category.leaveCycle.id,
        unusedLeaveActionId: category.unusedLeaveAction.id,
        unusedLeaveActionCount: category.unusedLeaveActionCount,
        sandwichLeave: category.sandwichLeave,
        accrualTypeId: category.accrualType.id,
        reset: category.reset,
        flexible: !!category.isFlexible, // Convert 0/1 to boolean
        carryover: category.carryover,
        carryoverAction: category.carryoverAction || '',
        categoryName: this.allCategoryList.find(c => c.id === category.leaveCategory.id)?.name || 'N/A',
        unusedLeaveName: this.unusedLeaveActionList.find(c => c.id === category.unusedLeaveAction.id)?.name || 'N/A',
        accrualName: this.accrualTypes.find(c => c.id === category.accrualType.id)?.name || 'N/A',
        leaveCycleName: this.leaveCycleList.find(c => c.id === category.leaveCycle.id)?.name || 'N/A'
      } as LeaveTemplateCategoryRequest));

      // Trigger change detection
      this.cdr.detectChanges();
          },
          (error) => {
            console.error('Error fetching leave setting information by ID:', error);
          }
        );
      }


  deleteLeaveSettingRule(leaveSettingId: number): void {
    this.dataService.deleteLeaveSettingRule(leaveSettingId).subscribe(
      () => {
        this.helperService.showToast(
          'Leave rule deleted successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      (error) => {
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  deleteLoading: boolean = false;
  deleteLeaveTemplateId: number = 0;
  @ViewChild('closeButtonDeleteLeave') closeButtonDeleteLeave!: ElementRef;
  deleteLeaveTemplate(): void {
    this.deleteLoading = true;
    this.dataService.deleteLeaveTemplate(this.deleteLeaveTemplateId).subscribe((response: any) => {
      if (response.status) {
        this.getAllLeaveTemplate();
        this.closeButtonDeleteLeave.nativeElement.click();
        this.deleteLoading = false;
        this.deleteLeaveTemplateId=0;
        this.helperService.showToast(
          'Leave Template Deleted',
          Key.TOAST_STATUS_SUCCESS
        );
      } else {
        this.deleteLoading = false;
        this.helperService.showToast(
          'Something went wrong!',
          Key.TOAST_STATUS_ERROR
        );
      }
    })
  }

  deleteCategoryId: number = 0;
  deleteLeaveSettingCategoryById(): void {
    this.deleteLoading = true;
    this.dataService.deleteLeaveSettingCategoryById(this.deleteCategoryId).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.closeButtonDeleteLeave.nativeElement.click();
        this.deleteCategoryId = 0;
        this.getAllLeaveTemplate();
        this.helperService.showToast(
          'Leave Category deleted',
          Key.TOAST_STATUS_SUCCESS
        );
      },
      error: (err) => {
        this.deleteLoading = false;
        console.error('Delete failed', err);
      },
    });
  }

  onCategorySelected(categoryId: number): void {
    console.log('Selected category ID:', categoryId);
   this.deleteCategoryId = categoryId;
  }
  onUnusedLeaveActionChange(value: number) {
    if (value === 1) {
      this.newCategory.unusedLeaveActionCount = 0;
    }
  }



}
