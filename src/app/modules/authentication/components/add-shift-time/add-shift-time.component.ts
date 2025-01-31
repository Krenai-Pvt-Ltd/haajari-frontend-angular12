import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { OrganizationShiftTimingRequest } from 'src/app/models/organization-shift-timing-request';
import { OrganizationShiftTimingWithShiftTypeResponse } from 'src/app/models/organization-shift-timing-with-shift-type-response';
import { ShiftType } from 'src/app/models/shift-type';
import { Staff } from 'src/app/models/staff';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { constant } from 'src/app/constant/constant';
import { WeekDay } from 'src/app/models/WeekDay';

@Component({
  selector: 'app-add-shift-time',
  templateUrl: './add-shift-time.component.html',
  styleUrls: ['./add-shift-time.component.css'],
})
export class AddShiftTimeComponent implements OnInit {
  organizationShiftTimingRequest: OrganizationShiftTimingRequest =
    new OrganizationShiftTimingRequest();
  selectedShiftType: ShiftType = new ShiftType();

  defaultInOpenTime: Date = new Date();
  defaultOutOpenTime: Date = new Date();
  defaultStartLunchOpenTime: Date = new Date();
  defaultEndLunchOpenTime: Date = new Date();

  readonly constant = constant;
  // shiftString = constant.REMOVE_SHIFT_STRING;

  constructor(
    private dataService: DataService,
    private router: Router,
    private _location: Location,
    private helperService: HelperService,
    private onboardingService: OrganizationOnboardingService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token == null) {
      this.router.navigate(['/auth/signup']);
    }
    this.getOnboardingVia();
    this.getShiftTypeMethodCall();
    this.getWeekDays();
    this.getUserByFiltersMethodCall();
    this.getAllShiftTimingsMethodCall();
    this.defaultInOpenTime.setHours(0, 0, 0, 0);
    this.defaultOutOpenTime.setHours(0, 0, 0, 0);
    this.defaultStartLunchOpenTime.setHours(0, 0, 0, 0);
    this.defaultEndLunchOpenTime.setHours(0, 0, 0, 0);
  }

  // backPage() {
  //   // if(this.isNoShiftCreated) {
  //   //   this.isNoShiftCreated = false
  //   // }else {
  //   // this.checkShiftTimingExistsMethodCall();
  //   // }

  //   this.checkShiftTimingExistsMethodCall();
  // }

  async backPage() {
    debugger;
    await this.checkShiftTimingExists();
    if (this.shiftTimingExists) {
      constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE
      this.router.navigate([constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE]);
    } else {
      // this.router.navigate(['/auth/add-shift-placeholder']);
      this.router.navigate([constant.ORG_ONBOARDING_SHIFT_TIME_PLACEHOLDER_ROUTE]);

    }

  }
  

  shiftTimingExists = false;
  async checkShiftTimingExists(): Promise<void> {
    debugger;
    try {
      const response: any = await this.dataService
        .shiftTimingExists()
        .toPromise(); // Use toPromise() to convert observable to a promise
      this.shiftTimingExists = response.object;
    } catch (error) {
      console.error(error);
    }
  }

  isAddShiftBackLoading: boolean = false;
  checkShiftTimingExistsMethodCall() {
    this.isAddShiftBackLoading = true;
    this.dataService.shiftTimingExists().subscribe(
      (response: any) => {
        console.log(response);
        if (response.object) {
          this.dataService.markStepAsCompleted(3);
          // this.onboardingService.saveOrgOnboardingStep(3).subscribe();
          this.onboardingService.saveOrgOnboardingStep(3).subscribe((resp) => {
            this.onboardingService.refreshOnboarding();
          });
          // this.router.navigate(['/organization-onboarding/shift-time-list']);
        } else {
          this.dataService.markStepAsCompleted(2);
          // this.onboardingService.saveOrgOnboardingStep(2).subscribe();
          this.onboardingService.saveOrgOnboardingStep(2).subscribe((resp) => {
            this.onboardingService.refreshOnboarding();
          });
          // this.router.navigate(['/organization-onboarding/upload-team']);
        }

        setTimeout(() => {
          this.isAddShiftBackLoading = false;
        }, 5000);
        // this.isBackLoading = false;
        // this.onboardingService.refreshOnboarding();
      },
      (error) => {}
    );
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

  itemPerPage: number = 8;
  pageNumber: number = 1;
  total!: number;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];
  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;

  getUserByFiltersMethodCall() {
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

  closeModal() {
    this.isValidated = false;
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
  }

  @ViewChild('closeButton2') closeButton2!: ElementRef;
  @ViewChild('closeButton') closeButton!: ElementRef;
  isRegisterLoad: boolean = false;
  registerShift() {
    debugger;
    this.isRegisterLoad = true;
    this.closeButton2.nativeElement.click();

    this.registerOrganizationShiftTimingMethodCall();
    
    // setTimeout(() => {
    //   this.closeButton2.nativeElement.click();
    // }, 300);
  }
  loading: boolean = false;
  registerOrganizationShiftTimingMethodCall() {
    debugger;
    this.loading = true;
  
    this.organizationShiftTimingRequest.userUuids = this.selectedStaffsUuids;

    this.organizationShiftTimingRequest.weekdayInfos = this.weekDay
    .filter((day) => day.selected)
    .map((day) => ({
      weeklyOffDay: day.name,
      isAlternateWeekoff: day.isAlternate,
      weekOffType: day.weekOffType,
      userUuids: this.selectedStaffsUuids,
    }));

    // this.organizationShiftTimingRequest.shiftTypeId = 1;
    this.dataService
      .registerShiftTiming(this.organizationShiftTimingRequest)
      .subscribe(
        (response) => {
          // this.closeShiftTimingModal.nativeElement.click();
          this.getAllShiftTimingsMethodCall();
          this.helperService.registerOrganizationRegistratonProcessStepData(
            Key.SHIFT_TIME_ID,
            Key.PROCESS_COMPLETED
          );
          this.loading = false;
          this.isRegisterLoad = false;
          this.hideShiftNoteFlag = true;
          // this.helperService.showToast(
          //   'Shift Timing registered successfully',
          //   Key.TOAST_STATUS_SUCCESS
          // );
          this.router.navigate([constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE]);
        },
        (error) => {
          this.isRegisterLoad = false;
          this.helperService.showToast(
            'Shift creation failed!',
            Key.TOAST_STATUS_ERROR
          );
          this.loading = false;
          this.hideShiftNoteFlag = true;
        }
      );
  }

  organizationShiftTimingWithShiftTypeResponseList: OrganizationShiftTimingWithShiftTypeResponse[] =
    [];
  getAllShiftTimingsMethodCall() {
    debugger;
    this.dataService.getAllShiftTimings().subscribe(
      (response) => {
        this.organizationShiftTimingWithShiftTypeResponseList = response;
        if (response[0] != null) {
          // this.skip = true;
          // this.skipShift = true
        }

        // console.log(this.organizationShiftTimingWithShiftTypeResponseList);

        if (
          response === undefined ||
          response === null ||
          response.length === 0
        ) {
          // this.dataNotFoundPlaceholder = true;
        }
      },
      (error) => {
        console.log(error);
        // this.networkConnectionErrorPlaceHolder = true;
      }
    );
  }

  @ViewChild('shiftTimingActiveTab') shiftTimingActiveTab!: ElementRef;

  shiftTimingActiveTabMethod() {
    // this.shiftTimingActiveTab.nativeElement.click();
    this.SHIFT_TIME_STEP_ID = this.SHIFT_TIME_ID;
  }

  weekOffActiveTabMethod() {
    // this.isWeekOffFlag = true;
    this.SHIFT_TIME_STEP_ID = this.WEEK_OFF_ID;
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

  checkIndividualSelection() {
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
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

    this.activeModel2 = true;

    if (this.selectedStaffsUuids.length === 0) {
      this.activeModel2 = false;
    }
  }

  activeModel2: boolean = false;
  isAllUsersSelected: boolean = false;

  checkForShiftId: number = 0;
  selectAll(checked: boolean) {
    debugger
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
  

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffsUuids = [];
    this.activeModel2 = false;
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
  }

  selectAllUsers(isChecked: boolean) {
    this.isAllUsersSelected = isChecked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked)); // Update each staff's selected property

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffsUuids list
      this.activeModel2 = true;
      this.getAllUserUuidsMethodCall().then((allUuids) => {
        this.selectedStaffsUuids = allUuids;
      });
    } else {
      this.selectedStaffsUuids = [];
      this.activeModel2 = false;
    }
  }

  // Fetching all the uuids of the users by organization
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

  searchUsers() {
    this.getUserByFiltersMethodCall();
  }

  @ViewChild('staffActiveTabInShiftTiming')
  staffActiveTabInShiftTiming!: ElementRef;

  SHIFT_TIME_ID = Key.SHIFT_TIME;
  STAFF_SELECTION_ID = Key.STAFF_SELECTION;
  WEEK_OFF_ID = Key.WEEK_OFF;

  SHIFT_TIME_STEP_ID = Key.SHIFT_TIME;
  isAddShiftLastLoading: boolean = false;
  staffActiveTabInShiftTimingMethod() {
    debugger;
    this.isAddShiftLastLoading = true;
    this.hideShiftNoteFlag = false;
    if (this.isValidForm()) {
      this.isAddShiftLastLoading = false;
      this.SHIFT_TIME_STEP_ID = Key.STAFF_SELECTION;
    }
    // this.onboardingService.saveOrgOnboardingStep(4).subscribe((resp) => {
    //   this.onboardingService.refreshOnboarding();
    // });
    // this.onboardingService.refreshOnboarding();
    // this.selectAll(true);
    this.getOrganizationUserNameWithShiftNameData(this.checkForShiftId, "");
  }

  organizationShiftTimingValidationErrors: { [key: string]: string } = {};
  private isValidForm(): boolean {
    return (
      Object.keys(this.organizationShiftTimingValidationErrors).length === 0
    );
  }

  onTimeChange(field: keyof OrganizationShiftTimingRequest, value: Date): void {
    debugger;
    // Set the field value directly
    switch (field) {
      case 'inTime':
        this.organizationShiftTimingRequest.inTime = value;
        // console.log('inTimeadd shift ' + this.organizationShiftTimingRequest.inTime);
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
    debugger;
    const { inTime, outTime, startLunch, endLunch } =
      this.organizationShiftTimingRequest;

    // Reset errors and calculated times
    this.organizationShiftTimingValidationErrors = {};
    this.organizationShiftTimingRequest.lunchHour = '';
    this.organizationShiftTimingRequest.workingHour = '';

    // Helper function to convert Date object to minutes from start of the day in local time
    const dateToLocalMinutes = (date: Date | undefined) => {
      if (!date) return 0;
      const localDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );
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
        this.organizationShiftTimingValidationErrors['outTime'] =
          'Out time must be after in time.';
      } else {
        const totalWorkedMinutes = outTimeMinutes - inTimeMinutes;
        this.organizationShiftTimingRequest.workingHour =
          this.formatMinutesToTime(totalWorkedMinutes);
      }
    }

    // Check for valid lunch start time
    if (
      startLunch &&
      (startLunchMinutes <= inTimeMinutes ||
        startLunchMinutes >= outTimeMinutes)
    ) {
      this.organizationShiftTimingValidationErrors['startLunch'] =
        'Lunch time should be within in and out times.';
    }

    // Check for valid lunch end time
    if (
      endLunch &&
      (endLunchMinutes <= inTimeMinutes || endLunchMinutes >= outTimeMinutes)
    ) {
      this.organizationShiftTimingValidationErrors['endLunch'] =
        'Lunch time should be within in and out times.';
    }

    // Calculate lunch hour and adjust working hours if lunch times are valid
    if (startLunch && endLunch && startLunchMinutes < endLunchMinutes) {
      const lunchBreakMinutes = endLunchMinutes - startLunchMinutes;
      this.organizationShiftTimingRequest.lunchHour =
        this.formatMinutesToTime(lunchBreakMinutes);

      if (this.organizationShiftTimingRequest.workingHour) {
        const workingHourMinutes =
          this.organizationShiftTimingRequest.workingHour
            .split(':')
            .map(Number);
        const totalWorkingMinutes =
          workingHourMinutes[0] * 60 + workingHourMinutes[1];
        const adjustedWorkedMinutes = totalWorkingMinutes - lunchBreakMinutes;
        this.organizationShiftTimingRequest.workingHour =
          this.formatMinutesToTime(adjustedWorkedMinutes);
      }
    }

    // Additional validation for lunch times
    if (startLunch && endLunch) {
      if (endLunchMinutes <= startLunchMinutes) {
        this.organizationShiftTimingValidationErrors['endLunch'] =
          'Please enter a valid back time from lunch.';
      }
      if (startLunchMinutes >= endLunchMinutes) {
        this.organizationShiftTimingValidationErrors['startLunch'] =
          'Please enter a valid lunch start time.';
      }
    }
  }

  formatMinutesToTime(minutes: any) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }

  submitShiftTimingForm(): void {
    this.calculateTimes();
    if (this.isValidForm()) {
      // Proceed with form submission logic
    } else {
      // Handle invalid form case
    }
  }

  selectShiftType(shiftType: number) {
    debugger
    // this.selectedShiftType = shiftType;
    // this.organizationShiftTimingRequest.shiftTypeId = shiftType.id;
    this.organizationShiftTimingRequest.shiftTypeId = shiftType;
    console.log(this.organizationShiftTimingRequest.shiftTypeId);
  }

  clearSearch() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }

  backToShiftTime() {
    this.SHIFT_TIME_STEP_ID = Key.SHIFT_TIME;
  }

  onboardingViaString: string = 'SLACK';
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

  isNoShiftCreated: boolean = false;
  createNewShift() {
    this.isNoShiftCreated = true;
  }

  getRowNumber(index: number): number {
    return (this.pageNumber - 1) * this.itemPerPage + index + 1;
  }

  isShiftNamePresent: boolean = false;
  checkShiftPresenceData(shiftName: string) {
    this.dataService.checkShiftPresence(shiftName).subscribe(
      (response) => {
        this.isShiftNamePresent = response.object;
      },
      (error) => {
        console.log('error');
      }
    );
  }

  userNameWithShiftName: any;
  getOrganizationUserNameWithShiftNameData(shiftId: number, type:string) {
    this.dataService
      .getOrganizationUserNameWithShiftName(this.selectedStaffsUuids, shiftId)
      .subscribe(
        (response) => {
          this.isRemovingDuplicateUsers=false;
          this.userNameWithShiftName = response.listOfObject;
          if( this.userNameWithShiftName.length <1 && type == "SHIFT_USER_EDIT") {
            this.closeButton.nativeElement.click();
          }
        },
        (error) => {
          console.log('error');
        }
      );
  }

  isValidated: boolean = false;
  checkValidation() {
    this.isValidated ? false : true;
  }

  isRemovingDuplicateUsers:boolean=true;
  removeUser(uuid: string) {
    this.isRemovingDuplicateUsers=true;
    this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
      (id) => id !== uuid
    );
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
    // this.getUserByFiltersMethodCall();
    
  }

  hideShiftNoteFlag: boolean = true;
  hideShiftNote() {
    this.hideShiftNoteFlag = false;
  }

  @ViewChild('videoIframe', { static: false }) youtubeIframe:
  | ElementRef<HTMLIFrameElement>
  | undefined;
  setSrc(){
    if (this.youtubeIframe) {
    const iframeElement = this.youtubeIframe.nativeElement as HTMLIFrameElement;
      iframeElement.src = 'https://www.youtube.com/embed/jh7-qF48ANk?si=WJvojNbQucaWaknY';
    }
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
