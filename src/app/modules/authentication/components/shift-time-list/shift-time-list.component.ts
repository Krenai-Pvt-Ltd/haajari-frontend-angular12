import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrganizationShiftTimingRequest } from 'src/app/models/organization-shift-timing-request';
import { OrganizationShiftTimingResponse } from 'src/app/models/organization-shift-timing-response';
import { OrganizationShiftTimingWithShiftTypeResponse } from 'src/app/models/organization-shift-timing-with-shift-type-response';
import { ShiftType } from 'src/app/models/shift-type';
import { Staff } from 'src/app/models/staff';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { WeekDay } from 'src/app/models/WeekDay';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-shift-time-list',
  templateUrl: './shift-time-list.component.html',
  styleUrls: ['./shift-time-list.component.css'],
})
export class ShiftTimeListComponent implements OnInit {

  defaultInOpenTime: Date = new Date();
  defaultOutOpenTime: Date = new Date();
  defaultStartLunchOpenTime: Date = new Date();
  defaultEndLunchOpenTime: Date = new Date();

 public readonly constant = constant;
  constructor(
    private dataService: DataService,
    private router: Router,
    private onboardingService: OrganizationOnboardingService,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.getWeekDays();
    this.checkShiftTimingExistsMethodCall();
    this.getAllShiftTimingsMethodCall();
    this.getOnboardingVia();
    this.defaultInOpenTime.setMinutes(0, 0, 0);
    this.defaultOutOpenTime.setMinutes(0, 0, 0);
    this.defaultStartLunchOpenTime.setMinutes(0, 0, 0);
    this.defaultEndLunchOpenTime.setMinutes(0, 0, 0);

  }

  selectedStaffsUuids: string[] = [];
  itemPerPage: number = 5;
  pageNumber: number = 1;
  total!: number;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];
  isAllSelected: boolean = false;
  selectedShiftType: ShiftType = new ShiftType();
  organizationShiftTimingRequest: OrganizationShiftTimingRequest =
    new OrganizationShiftTimingRequest();

  checkShiftTimingExistsMethodCall() {
    this.dataService.shiftTimingExists().subscribe(
      (response: any) => {
        if (!response.object) {
          // this.router.navigate(['/organization-onboarding/add-shift-placeholder']);
          this.router.navigate([constant.ORG_ONBOARDING_SHIFT_TIME_PLACEHOLDER_ROUTE]);

        }
      },
      (error) => {}
    );
  }

  @ViewChild('shiftTimingActiveTab') shiftTimingActiveTab!: ElementRef;

  shiftTimingActiveTabMethod() {
    this.shiftTimingActiveTab.nativeElement.click();
  }

  getUserByFiltersMethodCall() {
    debugger;
    this.dataService
      .getUsersByFilter(
        this.itemPerPage,
        this.pageNumber,
        'asc',
        'id',
        this.searchText,
        '',
        0
      )
      .subscribe(
        (response) => {
          this.staffs = response.users.map((staff: Staff) => ({
            ...staff,
            selected: this.selectedStaffsUuids.includes(staff.uuid),
          }));
          this.total = response.count;

          this.isAllSelected = this.staffs.every((staff) => staff.selected);
        },
        (error) => {
          console.error(error);
        }
      );
  }


  getRowNumber(index: number): number {
    return (this.pageNumber - 1) * this.itemPerPage + index + 1;
  }

  deleteOrganizationShiftTimingTemplateLoader(id: any): boolean {
    return this.deleteOrganizationShiftTimingLoaderStatus[id] || false;
  }

  deleteOrganizationShiftTimingLoaderStatus: { [key: string]: boolean } = {};
  deleteOrganizationShiftTimingLoader: boolean = false;

  async deleteOrganizationShiftTimingMethodCall(
    organizationShiftTimingId: number
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.deleteOrganizationShiftTimingLoaderStatus[
        organizationShiftTimingId
      ] = true;
      this.dataService
        .deleteOrganizationShiftTiming(organizationShiftTimingId)
        .subscribe(
          async (response) => {
            this.deleteOrganizationShiftTimingLoaderStatus[
              organizationShiftTimingId
            ] = false;

            await this.getAllShiftTimingsMethodCall();

            if (
              this.organizationShiftTimingWithShiftTypeResponseList.length == 0
            ) {
              location.reload();
            }

            // this.helperService.showToast(
            //   'Shift timing deleted successfully.',
            //   Key.TOAST_STATUS_SUCCESS
            // );
            resolve(true);
          },
          (error) => {
            console.log(error);
            // this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
            this.deleteOrganizationShiftTimingLoaderStatus[
              organizationShiftTimingId
            ] = false;
            reject(error);
          }
        );
    });
  }

  skipShift: boolean = false;
  organizationShiftTimingWithShiftTypeResponseList: OrganizationShiftTimingWithShiftTypeResponse[] =
    [];
  allShiftTimingsLoader: boolean = false;
  async getAllShiftTimingsMethodCall(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.allShiftTimingsLoader = true;
      // this.organizationShiftTimingWithShiftTypeResponseList = [];
      this.dataService.getAllShiftTimings().subscribe(
        (response) => {
          this.organizationShiftTimingWithShiftTypeResponseList = response;

          this.allShiftTimingsLoader = false;

          if (
            this.organizationShiftTimingWithShiftTypeResponseList.length != 0
          ) {
            this.activeIndex = 0;
          }

          if (response[0] != null) {
            this.skipShift = true;
          }

          // console.log(this.organizationShiftTimingWithShiftTypeResponseList);

          if (
            response === undefined ||
            response === null ||
            response.length === 0
          ) {
            // this.dataNotFoundPlaceholder = true;
          }
          this.organizationShiftTimingWithShiftTypeResponseList.forEach(
            (item) => {
              // Check if organizationShiftTimingResponseList is defined and not empty
              if (
                item.organizationShiftTimingResponseList &&
                item.organizationShiftTimingResponseList.length > 0
              ) {
                // Iterate through each shift in the organizationShiftTimingResponseList
                item.organizationShiftTimingResponseList.forEach((shift) => {
                  shift.inTimeDate = shift.inTime;
                  shift.outTimeDate = shift.outTime;
                  shift.startLunchDate = shift.startLunch;
                  shift.endLunchDate = shift.endLunch;
                  // console.log(shift.inTime, shift.outTime);
                });
              }
            }
          );
          resolve(true);
        },
        (error) => {
          console.log(error);
          // this.networkConnectionErrorPlaceHolder = true;
          reject(error);
        }
      );
    });
  }

  updateOrganizationShiftTiming(
    organizationShiftTimingResponse: OrganizationShiftTimingResponse,
    tab: string
  ) {
    this.SHIFT_TIME_ID = Key.SHIFT_TIME;
    // this.shiftTimingActiveTab.nativeElement.click();
    debugger
    // console.log('inTime ' + this.organizationShiftTimingRequest.inTime);
    this.organizationShiftTimingRequest = organizationShiftTimingResponse;
    this.weekDay = organizationShiftTimingResponse.weekDayResponse;

    const inLocalTime = new Date(organizationShiftTimingResponse.inTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const outLocalTime = new Date(organizationShiftTimingResponse.outTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const startLunchLocalTime = new Date(organizationShiftTimingResponse.startLunch.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const endLunchLocalTime = new Date(organizationShiftTimingResponse.endLunch.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    this.organizationShiftTimingRequest.inTime = inLocalTime;
    this.organizationShiftTimingRequest.outTime = outLocalTime;
    this.organizationShiftTimingRequest.startLunch = startLunchLocalTime;
    this.organizationShiftTimingRequest.endLunch = endLunchLocalTime;

    this.organizationShiftTimingRequest.shiftTypeId =
      organizationShiftTimingResponse.shiftType.id;
    this.selectedStaffsUuids = organizationShiftTimingResponse.userUuids;

    this.getShiftTypeMethodCall();
    this.selectedShiftType = organizationShiftTimingResponse.shiftType;
    // this.getUserByFiltersMethodCall();

    // setTimeout(() => {
    //   if (tab == 'STAFF_SELECTION') {
    //     this.staffActiveTabInShiftTimingMethod();
    //   }
    // }, 0);
  }

  checkForShiftId: number = 0;
  totalUsersOnSelectedShift: number = 0;
  updateOrganizationShiftTimingUser(organizationShiftTimingResponse: OrganizationShiftTimingResponse,
    tab: string
  ) {
    debugger

    this.organizationShiftTimingRequest = organizationShiftTimingResponse;
    this.weekDay = organizationShiftTimingResponse.weekDayResponse;

    this.organizationShiftTimingRequest.shiftTypeId =
      organizationShiftTimingResponse.shiftType.id;
    this.selectedStaffsUuids = organizationShiftTimingResponse.userUuids;
    this.checkForShiftId = organizationShiftTimingResponse.id;
    // this.totalUsersOnSelectedShift = organizationShiftTimingResponse.userUuids.length;
    this.getShiftTypeMethodCall();
    this.selectedShiftType = organizationShiftTimingResponse.shiftType;
    this.getUserByFiltersMethodCall();
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
  }

  clearShiftTimingModel() {
    this.shiftTimingActiveTab.nativeElement.click();
    this.organizationShiftTimingRequest = new OrganizationShiftTimingRequest();
    this.selectedShiftType = new ShiftType();
  }

  selectShiftType(shiftType: ShiftType) {
    this.selectedShiftType = shiftType;
    this.organizationShiftTimingRequest.shiftTypeId = shiftType.id;
  }

  shiftTypeList: ShiftType[] = [];
  getShiftTypeMethodCall() {
    this.dataService.getAllShiftType().subscribe(
      (response) => {
        this.shiftTypeList = response;
        // console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  isShiftAdded: boolean = false;
  @ViewChild('closeShiftTimingModal') closeShiftTimingModal!: ElementRef;

  registerOrganizationShiftTimingMethodCall() {
    debugger;
    this.organizationShiftTimingRequest.userUuids = this.selectedStaffsUuids;
    // this.organizationShiftTimingRequest.shiftTypeId = 1;
    // this.organizationShiftTimingRequest.weekdayInfos = [];

    this.organizationShiftTimingRequest.weekdayInfos = this.weekDay
    .filter((day) => day.selected)
    .map((day) => ({
      weeklyOffDay: day.name,
      isAlternateWeekoff: day.isAlternate,
      weekOffType: day.weekOffType,
      userUuids: this.selectedStaffsUuids,
    }));

    this.dataService
      .registerShiftTiming(this.organizationShiftTimingRequest)
      .subscribe(
        async (response) => {
          debugger;
          this.isEditStaffLoader = false;
          this.editShiftTimeLoader = false;
          this.isRegisterLoad = false;
          // console.log(response);
          if(this.closeShiftTimingModal) {
          this.closeShiftTimingModal.nativeElement.click();
          }
          await this.getAllShiftTimingsMethodCall();
          this.helperService.showToast(
            response.message,
            Key.TOAST_STATUS_SUCCESS
          );

          this.dataService.markStepAsCompleted(5);
        },
        (error) => {
          console.log(error);
          this.isEditStaffLoader = false;
          this.editShiftTimeLoader = false;
          // this.helperService.showToast(
          //   'Error In Shift Creation',
          //   Key.TOAST_STATUS_ERROR
          // );
        }
      );
  }

  @ViewChild("closeButtonEditStaffInfo") closeButtonEditStaffInfo!: ElementRef;
  isEditStaffLoader: boolean = false;
  editShiftStaffInfo() {
    this.isEditStaffLoader = true;
    this.organizationShiftTimingWithShiftTypeResponseList = [];
    this.registerOrganizationShiftTimingMethodCall();
    this.closeButtonEditStaffInfo.nativeElement.click();

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
    this.getUserByFiltersMethodCall();
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

  isAllUsersSelected: boolean = false;
  checkIndividualSelection() {
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
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
  }

  activeModel2: boolean = false;

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffsUuids = [];
    this.activeModel2 = false;
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
  }

  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffsUuids based on the current page selection
    if (checked) {
      this.activeModel2 = true;
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
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
  }

  selectAllUsers(isChecked: boolean) {
    // const inputElement = event.target as HTMLInputElement;
    // const isChecked = inputElement ? inputElement.checked : false;
    this.isAllUsersSelected = isChecked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked)); // Update each staff's selected property

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffsUuids list
      this.activeModel2 = true;
      this.getAllUsersUuids().then((allUuids) => {
        this.selectedStaffsUuids = allUuids;
        this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
      });
    } else {
      this.selectedStaffsUuids = [];
      this.activeModel2 = false;
    }

  }
  async getAllUsersUuids(): Promise<string[]> {
    // Replace with your actual API call to get all users
    const response = await this.dataService
      .getAllUsers('asc', 'id', this.searchText, '')
      .toPromise();
    return response.users.map((user: { uuid: any }) => user.uuid);
  }

  searchUsers() {
    this.getUserByFiltersMethodCall();
  }

  @ViewChild('staffActiveTabInShiftTiming')
  staffActiveTabInShiftTiming!: ElementRef;

  staffActiveTabInShiftTimingMethod() {
    if (this.isValidForm()) {
      this.staffActiveTabInShiftTiming.nativeElement.click();
    }
  }

  organizationShiftTimingValidationErrors: { [key: string]: string } = {};

  private isValidForm(): boolean {
    return (
      Object.keys(this.organizationShiftTimingValidationErrors).length === 0
    );
  }

  // calculateTimes(): void {
  //   const { inTime, outTime, startLunch, endLunch } =
  //     this.organizationShiftTimingRequest;

  //   // Reset errors and calculated times
  //   this.organizationShiftTimingValidationErrors = {};
  //   this.organizationShiftTimingRequest.lunchHour = '';
  //   this.organizationShiftTimingRequest.workingHour = '';

  //   // Helper function to convert time string to minutes
  //   const timeToMinutes = (time: any) => {
  //     if (!time) return 0;
  //     const [hours, minutes] = time.split(':').map(Number);
  //     return hours * 60 + minutes;
  //   };

  //   // Convert times to minutes
  //   const inTimeMinutes = timeToMinutes(inTime);
  //   const outTimeMinutes = timeToMinutes(outTime);
  //   const startLunchMinutes = timeToMinutes(startLunch);
  //   const endLunchMinutes = timeToMinutes(endLunch);

  //   // Check for valid in and out times
  //   if (inTime && outTime) {
  //     if (outTimeMinutes < inTimeMinutes) {
  //       this.organizationShiftTimingValidationErrors['outTime'] =
  //         'Out time must be after in time.';
  //     } else {
  //       const totalWorkedMinutes = outTimeMinutes - inTimeMinutes;
  //       this.organizationShiftTimingRequest.workingHour =
  //         this.formatMinutesToTime(totalWorkedMinutes);
  //     }
  //   }

  //   // Check for valid lunch start time
  //   if (
  //     startLunch &&
  //     (startLunchMinutes < inTimeMinutes || startLunchMinutes > outTimeMinutes)
  //   ) {
  //     this.organizationShiftTimingValidationErrors['startLunch'] =
  //       'Lunch time should be within in and out times.';
  //   }

  //   // Check for valid lunch end time
  //   if (
  //     endLunch &&
  //     (endLunchMinutes < inTimeMinutes || endLunchMinutes > outTimeMinutes)
  //   ) {
  //     this.organizationShiftTimingValidationErrors['endLunch'] =
  //       'Lunch time should be within in and out times.';
  //   }

  //   // Calculate lunch hour and adjust working hours if lunch times are valid
  //   if (startLunch && endLunch && startLunchMinutes < endLunchMinutes) {
  //     const lunchBreakMinutes = endLunchMinutes - startLunchMinutes;
  //     this.organizationShiftTimingRequest.lunchHour =
  //       this.formatMinutesToTime(lunchBreakMinutes);

  //     if (this.organizationShiftTimingRequest.workingHour) {
  //       const adjustedWorkedMinutes =
  //         timeToMinutes(this.organizationShiftTimingRequest.workingHour) -
  //         lunchBreakMinutes;
  //       this.organizationShiftTimingRequest.workingHour =
  //         this.formatMinutesToTime(adjustedWorkedMinutes);
  //     }
  //   }

  //   // Additional validation for lunch times
  //   if (startLunch && endLunch) {
  //     if (endLunchMinutes <= startLunchMinutes) {
  //       this.organizationShiftTimingValidationErrors['endLunch'] =
  //         'Please enter a valid back time from lunch.';
  //     }
  //     if (startLunchMinutes >= endLunchMinutes) {
  //       this.organizationShiftTimingValidationErrors['startLunch'] =
  //         'Please enter a valid lunch start time.';
  //     }
  //   }
  // }

calculateTimes(): void {
  debugger
  const { inTime, outTime, startLunch, endLunch } = this.organizationShiftTimingRequest;

  // Reset errors and calculated times
  this.organizationShiftTimingValidationErrors = {};
  // this.organizationShiftTimingRequest.lunchHour = '';
  // this.organizationShiftTimingRequest.workingHour = '';

  // Helper function to convert Date object to minutes from start of the day in local time
  const dateToLocalMinutes = (date: Date | undefined) => {
      if (!date) return 0;
      const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      const hours = localDate.getHours();
      const minutes = localDate.getMinutes();
      return hours * 60 + minutes;
  };

  // Convert times to local minutes
  const inTimeMinutes = dateToLocalMinutes(inTime);
  const outTimeMinutes = dateToLocalMinutes(outTime);
  const startLunchMinutes = dateToLocalMinutes(startLunch);
  const endLunchMinutes = dateToLocalMinutes(endLunch);

  // Check for valid in and out times
  if (inTime && outTime) {
      if (outTimeMinutes <= inTimeMinutes) {
          this.organizationShiftTimingValidationErrors['outTime'] = 'Out time must be after in time.';
      } else {
          const totalWorkedMinutes = outTimeMinutes - inTimeMinutes;
          this.organizationShiftTimingRequest.workingHour = this.formatMinutesToTime(totalWorkedMinutes);
      }
  }

  // Check for valid lunch start time
  if (startLunch && (startLunchMinutes <= inTimeMinutes || startLunchMinutes >= outTimeMinutes)) {
      this.organizationShiftTimingValidationErrors['startLunch'] = 'Lunch time should be within in and out times.';
  }

  // Check for valid lunch end time
  if (endLunch && (endLunchMinutes <= inTimeMinutes || endLunchMinutes >= outTimeMinutes)) {
      this.organizationShiftTimingValidationErrors['endLunch'] = 'Lunch time should be within in and out times.';
  }

  // Calculate lunch hour and adjust working hours if lunch times are valid
  if (startLunch && endLunch && startLunchMinutes < endLunchMinutes) {
      const lunchBreakMinutes = endLunchMinutes - startLunchMinutes;
      this.organizationShiftTimingRequest.lunchHour = this.formatMinutesToTime(lunchBreakMinutes);

      if (this.organizationShiftTimingRequest.workingHour) {
          const workingHourMinutes = this.organizationShiftTimingRequest.workingHour.split(':').map(Number);
          const totalWorkingMinutes = workingHourMinutes[0] * 60 + workingHourMinutes[1];
          const adjustedWorkedMinutes = totalWorkingMinutes - lunchBreakMinutes;
          this.organizationShiftTimingRequest.workingHour = this.formatMinutesToTime(adjustedWorkedMinutes);
      }
  }

  // Additional validation for lunch times
  if (startLunch && endLunch) {
      if (endLunchMinutes <= startLunchMinutes) {
          this.organizationShiftTimingValidationErrors['endLunch'] = 'Please enter a valid back time from lunch.';
      }
      if (startLunchMinutes >= endLunchMinutes) {
          this.organizationShiftTimingValidationErrors['startLunch'] = 'Please enter a valid lunch start time.';
      }
  }
}


  onTimeChange(field: keyof OrganizationShiftTimingRequest, value: Date): void {

    debugger
    // Set the field value directly
    switch (field) {
        case 'inTime':
            this.organizationShiftTimingRequest.inTime = value;
            break;
        case 'outTime':
            this.organizationShiftTimingRequest.outTime = value;
            break;
        case 'startLunch':
            this.organizationShiftTimingRequest.startLunch = value;
            break;
        case 'endLunch':
            this.organizationShiftTimingRequest.endLunch = value;
            break;
        default:
            break;

    }

    this.calculateTimes();

}


  formatMinutesToTime(minutes: any) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }

  editShiftTimeLoader : boolean = false;

  @ViewChild("closeButton") closeButton!: ElementRef;
  submitShiftTimingForm(): void {
    debugger
    this.editShiftTimeLoader = true;
    this.calculateTimes();
    this.registerOrganizationShiftTimingMethodCall();
    this.closeButton.nativeElement.click();
    // if (this.isValidForm()) {
    //   this.registerOrganizationShiftTimingMethodCall();
    // } else {
    //  return;
    // }
  }

  skipShiftSetting() {}
  isShiftListNextLoading: boolean = false;
  nextPage() {
    this.isShiftListNextLoading = true;
    this.dataService.markStepAsCompleted(4);
    // this.onboardingService.saveOrgOnboardingStep(4).subscribe();
    this.onboardingService.saveOrgOnboardingStep(4).subscribe((resp) => {
      this.isShiftListNextLoading = false;
      this.onboardingService.refreshOnboarding();
    });
    // this.router.navigate(['/organization-onboarding/attendance-mode']);
  }

  isShiftTimeBackLoading: boolean = false;
  backPage() {
    this.isShiftTimeBackLoading = true;
    this.dataService.markStepAsCompleted(2);
    // this.onboardingService.saveOrgOnboardingStep(2).subscribe();
    this.onboardingService.saveOrgOnboardingStep(2).subscribe((resp) => {
      this.onboardingService.refreshOnboarding();
      setTimeout(() => {
        this.isShiftTimeBackLoading = false;
      }, 5000);
      // this.isBackLoading = false;
    });
    // this.router.navigate(['/organization-onboarding/upload-team']);
  }

  onboardingViaString: string = '';
  getOnboardingVia() {
    this.dataService.getOnboardingVia().subscribe(
      (response) => {
        this.onboardingViaString = response.message;
      },
      (error) => {
        console.log('error');
      }
    );
  }

  activeIndex: number | null = null;

  toggleCollapse(index: number): void {
    if (this.activeIndex === index) {
      this.activeIndex = null;
    } else {
      this.activeIndex = index;
    }
  }

  userNameWithShiftName: any;
  getOrganizationUserNameWithShiftNameData(shiftId : number, type:string) {
    this.dataService.getOrganizationUserNameWithShiftName(this.selectedStaffsUuids, shiftId).subscribe(
      (response) => {
        this.isRemovingDuplicateUsers=false;

        this.userNameWithShiftName = response.listOfObject;
        if( this.userNameWithShiftName.length <1 && type == "SHIFT_USER_EDIT") {
          this.closeButton3.nativeElement.click();
        }
      },
      (error) => {
        console.log('error');
      }
    );
  }

  isValidated:boolean = false;
  checkValidation() {
    this.isValidated ? false : true;
  }

  isRemovingDuplicateUsers:boolean=true;

  @ViewChild("closeButton3") closeButton3!:ElementRef;
  removeUser(uuid: string) {
   debugger
   this.isRemovingDuplicateUsers=true;
    this.selectedStaffsUuids = this.selectedStaffsUuids.filter(id => id !== uuid);

    this.staffs.forEach((staff) => {
      staff.selected = this.selectedStaffsUuids.includes(staff.uuid);
    });
    this.isAllSelected = false;
    // if(this.selectedStaffsUuids.length <1) {
      // this.unselectAllUsers();
    // }
    // this.updateSelectedStaffs();
    this.userNameWithShiftName = [];
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "SHIFT_USER_EDIT");



  }

  @ViewChild('closeButton2') closeButton2!: ElementRef;
  isRegisterLoad: boolean = false;
  registerShift() {
    debugger;
    this.isRegisterLoad = true;
    this.closeButton2.nativeElement.click();
    this.editShiftStaffInfo();
    // this.registerOrganizationShiftTimingMethodCall();

    // setTimeout(() => {
    //   this.closeButton2.nativeElement.click();
    //   this.closeButtonEditStaffInfo.nativeElement.click();
    // }, 300);
  }

  closeModal() {
    this.isValidated = false;
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
  }

  SHIFT_TIME_ID = Key.SHIFT_TIME;
  // STAFF_SELECTION_ID = Key.STAFF_SELECTION;
  WEEK_OFF_ID = Key.WEEK_OFF;

  SHIFT_TIME_STEP_ID = Key.SHIFT_TIME;

  goToShiftTab() {
    // this.shiftTimingActiveTab.nativeElement.click();
    this.SHIFT_TIME_STEP_ID = this.SHIFT_TIME_ID;
  }

  goToWeekOffTab() {
    // this.isWeekOffFlag = true;
    this.SHIFT_TIME_STEP_ID = this.WEEK_OFF_ID;
  }

  //  new
     weekDay: WeekDay[] = [];

     getWeekDays() {
      this.dataService.getWeekDays().subscribe((holidays) => {
        this.weekDay = holidays.map((day) => ({
          ...day,
          selected: false, // Explicitly set selected to false
          isAlternate: false, // Ensure isAlternate is also set to false by default
          weekOffType: 0, // Set weekOffType to default value, if needed
        }));
        // console.log(this.weekDay);
      });
    }


    toggleSelection(i: number): void {
      this.weekDay[i].selected = !this.weekDay[i].selected;

      // Automatically set isAlternate to false when a day is selected
      this.weekDay[i].isAlternate = false;
    }

    toggleAlternate(i: number, isAlternate: boolean): void {
      debugger;
      this.weekDay[i].isAlternate = isAlternate;
      this.weekDay[i].weekOffType = 1;

      // Reset weekOffType to 0 when "All" is selected
      if (!isAlternate) {
        this.weekDay[i].weekOffType = 0;
      }
    }
}

