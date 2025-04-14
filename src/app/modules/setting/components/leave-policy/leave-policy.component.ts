import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
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
@Component({
  selector: 'app-leave-policy',
  templateUrl: './leave-policy.component.html',
  styleUrls: ['./leave-policy.component.css']
})
export class LeavePolicyComponent implements OnInit {

  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(
  ): void {
    this.getAllLeaveTemplate();
    this.resetForm();
    this.fetchStaffs();
    this.getLeaveCategoryListMethodCall();
    this.getYearTypeList();
    this.loadAccrualType();
    this.getLeaveCycleList();
    this.getUnusedLeaveActionList();
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
    this.dataService.getAllLeaveTemplate(1, 10).subscribe((response: any) => {

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
  addLeaveCategory() {
    this.leaveTemplate.leaveTemplateCategoryRequestList.push({ ...this.newCategory });
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
          this.selectedStaffIds,
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

  onPageChange(page: number) {
    this.pageNumber = page;
    this.fetchStaffs(0); // Fetch without debounce on page change
  }

  // Save and Modal Management
  saveLeaveTemplate() {
    this.leaveTemplate.userIds = this.selectedStaffIds;
    this.dataService.registerLeaveTemplate(this.leaveTemplate).subscribe(
      (response) => {
        this.closeModal();
        this.resetForm();
      },
      (error) => {
        console.error('Error saving leave template:', error);
      }
    );
  }

  closeModal() {
    if (this.leaveModal) {
      this.leaveModal.hide(); // For ngx-bootstrap
    } else {
      // For Bootstrap JS
      const modalElement = document.getElementById('leaveModal');
      if (modalElement) {
        (modalElement as any).modal('hide');
      }
    }
  }

  resetForm() {
    this.leaveTemplate = new LeaveTemplateRequest();
    this.newCategory = new LeaveTemplateCategoryRequest();
    this.selectedStaffIds = [];
    this.staffs = [];
    this.searchText = '';
    this.pageNumber = 1;
    this.total = 0;
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
  onGenderChange(value: any, i: number) {
    if (value != null) {

      if (value == 'Male') {
        this.selectedGenderId = 2;
      } else if (value == 'Female') {
        this.selectedGenderId = 3
      } else {
        this.selectedGenderId = 1;
      }

      this.leaveTemplate.gender = 'All';
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
        this.leaveTemplate.gender = 'Male';
      } else if (this.selectedGenderId == 3) {
        // Example: Exclude leave category with id 4 for females
        this.filteredLeaveCategories[i] = [...this.leaveCategoryList];
        this.filteredLeaveCategories[i] = this.filteredLeaveCategories[i].filter((leaveCategory: any) => leaveCategory.id !== 4);
        this.leaveTemplate.gender = 'Female';
      } else if (this.selectedGenderId == 1) {
        // Reset to original list if 'All' is selected
        this.filteredLeaveCategories[i] = [...this.leaveCategoryList];
        this.leaveTemplate.gender = 'All';
      }

      this.gender = this.leaveTemplate.gender;
    } else {

      this.gender = null;
      this.selectedGenderId = 0
    }
  }

    leaveCategoryList: LeaveCategory[] = [];
    onDutyList: LeaveCategory[] = [];
    weekOffCategoryList: LeaveCategory[] = [];
    getLeaveCategoryListMethodCall() {
      this.dataService.getLeaveCategoryList().subscribe((response) => {
        if (!this.helperService.isListOfObjectNullOrUndefined(response)) {
          this.leaveCategoryList = response.listOfObject;

          this.leaveCategoryList = this.leaveCategoryList.filter(category => category.category === 'LEAVE');
          this.onDutyList = this.leaveCategoryList.filter(category => category.category === 'ON_DUTY');
          this.weekOffCategoryList = this.leaveCategoryList.filter(category => category.category === 'WEEK_OFF');

        }
      }, (error) => {

      })
    }
    findCategoryById(id: number): any{
      return this.leaveCategoryList.find((category) => category.id === id)?.name;
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

      selectedStaffIdsUser: number[] = [];
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
              this.selectedStaffIdsUser.push(id)

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


            this.filteredLeaveCategories = [];
            setTimeout(() => {
              this.leaveTemplate.leaveTemplateCategoryRequestList = response.leaveTemplateCategories.map((category: any) => {
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
            }, 200)
          },
          (error) => {
            console.error('Error fetching leave setting information by ID:', error);
          }
        );
      }



}
