import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Key } from 'src/app/constant/key';
import { AttendanceMode } from 'src/app/models/attendance-mode';
import { AttendanceRuleDefinitionRequest } from 'src/app/models/attendance-rule-definition-request';
import { AttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-definition-response';
import { AttendanceRuleResponse } from 'src/app/models/attendance-rule-response';
import { AttendanceRuleWithAttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-with-attendance-rule-definition-response';
import { DeductionType } from 'src/app/models/deduction-type';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
import { OrganizationShiftTimingRequest } from 'src/app/models/organization-shift-timing-request';
import { OrganizationShiftTimingResponse } from 'src/app/models/organization-shift-timing-response';
import { OrganizationShiftTimingWithShiftTypeResponse } from 'src/app/models/organization-shift-timing-with-shift-type-response';
import { OvertimeType } from 'src/app/models/overtime-type';
import { ShiftType } from 'src/app/models/shift-type';
import { Staff } from 'src/app/models/staff';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-attendance-rule-setup',
  templateUrl: './attendance-rule-setup.component.html',
  styleUrls: ['./attendance-rule-setup.component.css']
})
export class AttendanceRuleSetupComponent implements OnInit {

  stepFirst: boolean = false;
  stepSecond: boolean = false;
  stepThird: boolean = false;

  attendanceMode: boolean = false;
  shiftSettingMode: boolean = false;
  automationRulesSettingMode: boolean = false;

  isAddedAutomationRule: boolean = false;

  readonly OVERTIME_RULE = Key.OVERTIME_RULE;

  //input for selecting duration:
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);
  selectedHours: number = 0;
  selectedMinutes: number = 0;
  duration: string = '';
  selectedTime: string = '20:00';
  readonly DEDUCTION_TYPE_PER_MINUTE = Key.DEDUCTION_TYPE_PER_MINUTE;
  readonly OVERTIME_TYPE_FIXED_AMOUNT = Key.OVERTIME_TYPE_FIXED_AMOUNT;

  organizationAddressDetail: OrganizationAddressDetail = new OrganizationAddressDetail();
  organizationShiftTimingRequest: OrganizationShiftTimingRequest = new OrganizationShiftTimingRequest();
  constructor(private dataService: DataService,
    private helperService: HelperService,
    private router: Router,
    private el: ElementRef,
    private _onboardingService: OrganizationOnboardingService) { }

  ngOnInit(): void {
    this.getAttendanceModeAllMethodCall();
    this.getAttendanceModeMethodCall();
    this.getAllShiftTimingsMethodCall();
    this.attendanceMode = true;
    this.stepFirst = true;

    this.getOrganizationAddressDetailMethodCall();
    // this.helperService.showTost("Attendance Settings deleted successfully", Key.TOAST_STATUS_SUCCESS);
    this.getAttendanceModeMethodCall();
    // this.getAttendanceModeAllMethodCall();
    this.getAllShiftTimingsMethodCall();
    this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();
    this.updateDuration();
    
    if(localStorage.getItem("staffSelectionActive")=="true"){
      this.activeModel=true;
    }

    if(localStorage.getItem("AttendanceRuleStep")!="" && localStorage.getItem("AttendanceRuleStep")!= null){
      let step = localStorage.getItem("AttendanceRuleStep");
      if(step=="2"){
        this.shiftSettingStep();
        // localStorage.removeItem("AttendanceRuleStep");
      }
      else if (step=="3"){
        this.automationRulesSettingStep();
        // localStorage.removeItem("AttendanceRuleStep");
      }
    }
  }

  updateDuration(): void {
    const formattedHours = this.selectedHours.toString().padStart(2, '0');
    const formattedMinutes = this.selectedMinutes.toString().padStart(2, '0');

    debugger
    this.duration = `${formattedHours}:${formattedMinutes}`;
  }
  attendanceStep() {
    this.attendanceMode = true;
    this.shiftSettingMode = false;
    this.automationRulesSettingMode = false;
    this.stepFirst = true;
    this.stepSecond = false;
    this.stepThird = false;
  }

  shiftSettingStep() {
    this.attendanceMode = false;
    this.shiftSettingMode = true;
    this.automationRulesSettingMode = false;
    this.stepFirst = true;
    this.stepSecond = true;
    this.stepThird = false;
    this.getAllShiftTimingsMethodCall();
  }

  automationRulesSettingStep() {
    this.attendanceMode = false;
    this.shiftSettingMode = false;
    this.automationRulesSettingMode = true;
    this.stepFirst = true;
    this.stepSecond = true;
    this.stepThird = true;
    this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall()
  }

  skipAttendanceMethod() {
    this.attendanceMode = false;
    this.shiftSettingMode = true;
    this.stepSecond = true;
    this.getAllShiftTimingsMethodCall();
  }
  skipShift: boolean = false;

  skipShiftSetting() {
    this.shiftSettingMode = false;
    this.isShiftAdded = false;
    this.automationRulesSettingMode = true;

    this.stepThird = true;
    this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();

  }
  skipAutomationRulesSetting() {
    this.dataService.markStepAsCompleted(5);
    this._onboardingService.saveOrgOnboardingStep(5).subscribe();
    this.router.navigate(['/organization-onboarding/leave-rule-setup']);

  }

  skipShiftSettingDataToggle: boolean = false;
  skipShiftSettingData() {
    this.skipShiftSettingDataToggle = true;

  }

  attendanceModeList: AttendanceMode[] = [];
  getAttendanceModeAllMethodCall() {
    debugger
    this.dataService.getAttendanceModeAll().subscribe((response) => {
      this.attendanceModeList = response;
    }, (error) => {
      console.log(error);
    })
  }


  // Modal

  isAttendanceModeSelected: boolean = false;
  @ViewChild("attendancewithlocationssButton") attendancewithlocationssButton !: ElementRef;
  updateAttendanceModeMethodCall(attendanceModeId: number) {
    this.dataService.updateAttendanceMode(attendanceModeId).subscribe((response) => {
      this.getAttendanceModeMethodCall();
      if (attendanceModeId == 2 || attendanceModeId == 3) {
        this.attendancewithlocationssButton.nativeElement.click();
      }
      setTimeout(() => {
        if (attendanceModeId == 1) {
          this.isAttendanceModeSelected = true;
        }
      }, 1000);

    }, (error) => {
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
  }


  deleteAttendanceRuleTemplateLoader(id: any): boolean {
    return this.deleteAttendanceRuleLoaderStatus[id] || false;
  }

  deleteAttendanceRuleLoaderStatus: { [key: string]: boolean } = {};
  deleteAttendanceRuleLoader: boolean = false;
  deleteAttendanceRuleDefinitionMethodCall(attendanceRuleDefinitionId: number) {
    debugger
    this.deleteAttendanceRuleLoaderStatus[attendanceRuleDefinitionId] = true;
    this.dataService.deleteAttendanceRuleDefinition(attendanceRuleDefinitionId).subscribe((response) => {
      this.deleteAttendanceRuleLoaderStatus[attendanceRuleDefinitionId] = false;
      this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();
      this.helperService.showToast("Attendance rule settings deleted successfully", Key.TOAST_STATUS_SUCCESS);

    }, (error) => {
      this.deleteAttendanceRuleLoader = false;
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
  }

  attendanceRuleWithAttendanceRuleDefinitionResponseList: AttendanceRuleWithAttendanceRuleDefinitionResponse[] = [];

  attendanceRuleWithAttendanceRuleDefinitionLoading: boolean = false;
  getAttendanceRuleWithAttendanceRuleDefinitionMethodCall() {
    debugger
    this.attendanceRuleWithAttendanceRuleDefinitionLoading = true;
    this.dataService.getAttendanceRuleWithAttendanceRuleDefinitionNew().subscribe((response: any) => {
      if (response.status) {
        this.attendanceRuleWithAttendanceRuleDefinitionResponseList = response.object;
      }
      this.attendanceRuleWithAttendanceRuleDefinitionLoading = false;
    }, (error) => {
      this.attendanceRuleWithAttendanceRuleDefinitionLoading = false;
    })
  }

  selectedAttendanceModeId: number = 0;
  getAttendanceModeMethodCall() {
    debugger
    this.dataService.getAttendanceModeNew().subscribe((response:any) => {
      debugger
      if(response.status){
        this.selectedAttendanceModeId = response.object.id;
      }
    }, (error) => {
      console.log(error);
    })
  }
  
  toggle = false;
  @ViewChild("closeAddressModal") closeAddressModal !: ElementRef;
  setOrganizationAddressDetailMethodCall() {
    this.toggle = true;
    this.dataService.setOrganizationAddressDetail(this.organizationAddressDetail)
      .subscribe(
        (response: OrganizationAddressDetail) => {
          // console.log(response);  
          this.toggle = false;
          this.closeAddressModal.nativeElement.click();
          this.helperService.showToast("Attedance Mode updated successfully", Key.TOAST_STATUS_SUCCESS);


        },
        (error) => {
          console.error(error);

        })

      ;
  }
  @ViewChild("placesRef") placesRef!: GooglePlaceDirective;

  public handleAddressChange(e: any) {
    debugger
    var id = this.organizationAddressDetail.id;
    this.organizationAddressDetail = new OrganizationAddressDetail();
    this.organizationAddressDetail.id = id;
    this.organizationAddressDetail.longitude = e.geometry.location.lng();
    this.organizationAddressDetail.latitude = e.geometry.location.lat();

    console.log(e.geometry.location.lat());
    console.log(e.geometry.location.lng());
    this.organizationAddressDetail.addressLine1 = e.name + ", " + e.vicinity;


    e?.address_components?.forEach((entry: any) => {
      // console.log(entry);

      if (entry.types?.[0] === "route") {
        this.organizationAddressDetail.addressLine2 = entry.long_name + ",";
      }
      if (entry.types?.[0] === "sublocality_level_1") {
        this.organizationAddressDetail.addressLine2 = this.organizationAddressDetail.addressLine2 + entry.long_name
      }
      if (entry.types?.[0] === "locality") {
        this.organizationAddressDetail.city = entry.long_name
      }
      if (entry.types?.[0] === "administrative_area_level_1") {
        this.organizationAddressDetail.state = entry.long_name
      }
      if (entry.types?.[0] === "country") {
        this.organizationAddressDetail.country = entry.long_name
      }
      if (entry.types?.[0] === "postal_code") {
        this.organizationAddressDetail.pincode = entry.long_name
      }



    });
  }

  getOrganizationAddressDetailMethodCall() {
    this.dataService.getOrganizationAddressDetail().subscribe(
      (response: OrganizationAddressDetail) => {
        if (response) {
          // console.log(response);
          this.organizationAddressDetail = response;
        } else {
          console.log('No address details found');


        }
      },
      (error: any) => {
        console.error('Error fetching address details:', error);
      }
    );
  }

  openAddShiftTimeModal() {
    this.getShiftTypeMethodCall();
    this.getUserByFiltersMethodCall();
    this.clearShiftTimingModel();
    this.skipShift = true;
  }
  shiftTypeList: ShiftType[] = [];
  getShiftTypeMethodCall() {
    this.dataService.getAllShiftType().subscribe((response) => {
      this.shiftTypeList = response;
      // console.log(response);
    }, (error) => {
      console.log(error);
    })
  }

  itemPerPage: number = 8;
  pageNumber: number = 1;
  total !: number;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];
  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;

  activeModel:boolean=false;

  getUserByFiltersMethodCall() {
    debugger
    this.dataService.getUsersByFilter(this.itemPerPage, this.pageNumber, 'asc', 'id', this.searchText, '').subscribe((response) => {
      this.staffs = response.users.map((staff: Staff) => ({
        ...staff,
        selected: this.selectedStaffsUuids.includes(staff.uuid)
      }));
      this.total = response.count;

      this.isAllSelected = this.staffs.every(staff => staff.selected);
    }, (error) => {
      console.error(error);
    });
  }


  clearShiftTimingModel() {
    this.shiftTimingActiveTab.nativeElement.click();
    this.organizationShiftTimingRequest = new OrganizationShiftTimingRequest();
    this.selectedShiftType = new ShiftType();
  }


  organizationShiftTimingValidationErrors: { [key: string]: string } = {};
  private isValidForm(): boolean {
    return Object.keys(this.organizationShiftTimingValidationErrors).length === 0;
  }
  @ViewChild("staffActiveTabInShiftTiming") staffActiveTabInShiftTiming !: ElementRef;

  staffActiveTabInShiftTimingMethod() {

    if (this.isValidForm()) {
      this.staffActiveTabInShiftTiming.nativeElement.click();
    }

  }

  @ViewChild("shiftTimingActiveTab") shiftTimingActiveTab !: ElementRef;

  shiftTimingActiveTabMethod() {
    this.shiftTimingActiveTab.nativeElement.click();
  }

  selectedShiftType: ShiftType = new ShiftType();

  selectShiftType(shiftType: ShiftType) {
    this.selectedShiftType = shiftType;
    this.organizationShiftTimingRequest.shiftTypeId = shiftType.id;
  }

  organizationShiftTimingWithShiftTypeResponseList: OrganizationShiftTimingWithShiftTypeResponse[] = [];
  allShiftTimingsLoader: boolean = false;
  getAllShiftTimingsMethodCall() {
    debugger
    this.allShiftTimingsLoader = true;
    this.dataService.getAllShiftTimings().subscribe((response) => {
      this.organizationShiftTimingWithShiftTypeResponseList = response;
      this.allShiftTimingsLoader = false;
      if (response[0] != null) {
        this.skipShift = true
      }

      // console.log(this.organizationShiftTimingWithShiftTypeResponseList);

      if (response === undefined || response === null || response.length === 0) {
        // this.dataNotFoundPlaceholder = true;
      }
    }, (error) => {
      console.log(error);
      // this.networkConnectionErrorPlaceHolder = true;
    })

  }


  updateOrganizationShiftTiming(organizationShiftTimingResponse: OrganizationShiftTimingResponse) {

    this.shiftTimingActiveTab.nativeElement.click();
    debugger
    this.organizationShiftTimingRequest = organizationShiftTimingResponse;
    this.organizationShiftTimingRequest.shiftTypeId = organizationShiftTimingResponse.shiftType.id;
    this.selectedStaffsUuids = organizationShiftTimingResponse.userUuids;

    this.getShiftTypeMethodCall();
    this.selectedShiftType = organizationShiftTimingResponse.shiftType;
    this.getUserByFiltersMethodCall();

  }


  deleteOrganizationShiftTimingTemplateLoader(id: any): boolean {
    return this.deleteOrganizationShiftTimingLoaderStatus[id] || false;
  }

  deleteOrganizationShiftTimingLoaderStatus: { [key: string]: boolean } = {};
  deleteOrganizationShiftTimingLoader: boolean = false;

  deleteOrganizationShiftTimingMethodCall(organizationShiftTimingId: number) {
    debugger
    this.deleteOrganizationShiftTimingLoaderStatus[organizationShiftTimingId] = true;
    this.dataService.deleteOrganizationShiftTiming(organizationShiftTimingId).subscribe((response) => {
      this.deleteOrganizationShiftTimingLoaderStatus[organizationShiftTimingId] = false;
      this.getAllShiftTimingsMethodCall();
      this.helperService.showToast("Shift timing deleted successfully", Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      console.log(error);
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
  }

  async getAllUsersUuids(): Promise<string[]> {
    // Replace with your actual API call to get all users
    const response = await this.dataService.getAllUsers('asc', 'id', this.searchText, '').toPromise();
    return response.users.map((user: { uuid: any; }) => user.uuid);
  }

  activeModel2: boolean = false;
  isAllUsersSelected: boolean = false;

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach(staff => staff.selected = false);
    this.selectedStaffsUuids = [];
    this.activeModel2 = false;
  }

  selectAllUsers(isChecked: boolean) {

    // const inputElement = event.target as HTMLInputElement;
    // const isChecked = inputElement ? inputElement.checked : false;
    this.isAllUsersSelected = isChecked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach(staff => staff.selected = isChecked); // Update each staff's selected property

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffsUuids list
      this.activeModel2 = true;
      this.getAllUsersUuids().then(allUuids => {
        this.selectedStaffsUuids = allUuids;
      });
    } else {
      this.selectedStaffsUuids = [];
      this.activeModel2 = false;
    }

  }

  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach(staff => staff.selected = checked);

    // Update the selectedStaffsUuids based on the current page selection
    if (checked) {
      this.activeModel2 = true;
      this.staffs.forEach(staff => {
        if (!this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids.push(staff.uuid);
        }
      });
    } else {
      this.staffs.forEach(staff => {
        if (this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids = this.selectedStaffsUuids.filter(uuid => uuid !== staff.uuid);
        }
      });
    }
  }

  checkIndividualSelection() {
    this.isAllUsersSelected = this.staffs.every(staff => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
  }


  checkAndUpdateAllSelected() {
    this.isAllSelected = this.staffs.length > 0 && this.staffs.every(staff => staff.selected);
    this.isAllUsersSelected = this.selectedStaffsUuids.length === this.total;
  }


  updateSelectedStaffs() {
    this.staffs.forEach(staff => {
      if (staff.selected && !this.selectedStaffsUuids.includes(staff.uuid)) {
        this.selectedStaffsUuids.push(staff.uuid);
      } else if (!staff.selected && this.selectedStaffsUuids.includes(staff.uuid)) {
        this.selectedStaffsUuids = this.selectedStaffsUuids.filter(uuid => uuid !== staff.uuid);
      }
    });

    this.checkAndUpdateAllSelected();

    this.activeModel2 = true;

    if (this.selectedStaffsUuids.length === 0) {
      this.activeModel2 = false;
    }
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


  isShiftAdded: boolean = false;
  @ViewChild("closeShiftTimingModal") closeShiftTimingModal !: ElementRef;

  registerOrganizationShiftTimingMethodCall() {
    debugger
    this.organizationShiftTimingRequest.userUuids = this.selectedStaffsUuids;

    this.dataService.registerShiftTiming(this.organizationShiftTimingRequest).subscribe((response) => {
      debugger
      // console.log(response);
      this.closeShiftTimingModal.nativeElement.click();
      this.getAllShiftTimingsMethodCall();
      this.helperService.showToast("Shift Timing registered successfully", Key.TOAST_STATUS_SUCCESS);
      this.dataService.markStepAsCompleted(5);
    }, (error) => {
      console.log(error);
      this.helperService.showToast("Shift Timing registered successfully", Key.TOAST_STATUS_ERROR);
    })
  }

  searchUsers() {
    this.getUserByFiltersMethodCall();
  }


  calculateTimes(): void {
    const { inTime, outTime, startLunch, endLunch } = this.organizationShiftTimingRequest;

    // Reset errors and calculated times
    this.organizationShiftTimingValidationErrors = {};
    this.organizationShiftTimingRequest.lunchHour = '';
    this.organizationShiftTimingRequest.workingHour = '';

    // Helper function to convert time string to minutes
    const timeToMinutes = (time: any) => {
      if (!time) return 0;
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Convert times to minutes
    const inTimeMinutes = timeToMinutes(inTime);
    const outTimeMinutes = timeToMinutes(outTime);
    const startLunchMinutes = timeToMinutes(startLunch);
    const endLunchMinutes = timeToMinutes(endLunch);

    // Check for valid in and out times
    if (inTime && outTime) {
      if (outTimeMinutes < inTimeMinutes) {
        this.organizationShiftTimingValidationErrors['outTime'] = 'Out time must be after in time.';
      } else {
        const totalWorkedMinutes = outTimeMinutes - inTimeMinutes;
        this.organizationShiftTimingRequest.workingHour = this.formatMinutesToTime(totalWorkedMinutes);
      }
    }

    // Check for valid lunch start time
    if (startLunch && (startLunchMinutes < inTimeMinutes || startLunchMinutes > outTimeMinutes)) {
      this.organizationShiftTimingValidationErrors['startLunch'] = 'Lunch time should be within in and out times.';
    }

    // Check for valid lunch end time
    if (endLunch && (endLunchMinutes < inTimeMinutes || endLunchMinutes > outTimeMinutes)) {
      this.organizationShiftTimingValidationErrors['endLunch'] = 'Lunch time should be within in and out times.';
    }

    // Calculate lunch hour and adjust working hours if lunch times are valid
    if (startLunch && endLunch && startLunchMinutes < endLunchMinutes) {
      const lunchBreakMinutes = endLunchMinutes - startLunchMinutes;
      this.organizationShiftTimingRequest.lunchHour = this.formatMinutesToTime(lunchBreakMinutes);

      if (this.organizationShiftTimingRequest.workingHour) {
        const adjustedWorkedMinutes = timeToMinutes(this.organizationShiftTimingRequest.workingHour) - lunchBreakMinutes;
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

  formatMinutesToTime(minutes: any) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }


  submitShiftTimingForm(): void {
    this.calculateTimes();
    if (this.isValidForm()) {
      // Proceed with form submission logic
    } else {
      // Handle invalid form case
    }
  }

  @ViewChild('attendanceRuleDefinitionModalClose') attendanceRuleDefinitionModalClose !: ElementRef;
  attendanceRuleDefinitionRequest : AttendanceRuleDefinitionRequest = new AttendanceRuleDefinitionRequest();
  registerAttendanceRuleDefinitionMethodCall(){

    debugger
    console.log(this.selectedStaffsUuids);

    this.attendanceRuleDefinitionRequest.userUuids = this.selectedStaffsUuids;
    this.preRegisterAttendanceRuleDefinitionMethodCall();

    this.dataService.registerAttendanceRuleDefinition(this.attendanceRuleDefinitionRequest).subscribe((response) => {
      // console.log(response);
      
      localStorage.removeItem("staffSelectionActive");
      
      this.attendanceRuleDefinitionModalClose.nativeElement.click();
      this.activeModel2=false;
      this.helperService.showToast("Attendance rule registered successfully", Key.TOAST_STATUS_SUCCESS);
    }, (error) =>{
      console.log(error);
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
  }

  
  preRegisterAttendanceRuleDefinitionMethodCall(){
    if(this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceType == "Count"){
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDuration = '';
    }else{
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceCount = 0;
    }

    if(this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceType == "Count"){
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDuration = '';
    }else{
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceCount = 0;
    }

    if(this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceType == "Count"){
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDuration = '';
    }else{
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceCount = 0;
    }
  }

  @ViewChild("ruleActiveTab") ruleActiveTab !: ElementRef;

  ruleActiveTabMethod(){
    this.ruleActiveTab.nativeElement.click();
  }

  @ViewChild("staffActiveTab") staffActiveTab !: ElementRef;

  staffActiveTabMethod(){
    this.staffActiveTab.nativeElement.click();
  }

  onTimeChangeForOccerrenceDuration(salaryDeduction : any){
    salaryDeduction.updateOccurrenceDuration();
  }

  
  selectedOccurenceDropdownForCustomSalrayDeduction : string = 'Count';
  selectedOccurenceDropdownForHalfDaySalrayDeduction : string = 'Count';
  selectedOccurenceDropdownForFullDaySalrayDeduction : string = 'Count';

  selectOccurenceDropdownForCustomSalrayDeduction(occurrenceType: string) {
    this.selectedOccurenceDropdownForCustomSalrayDeduction = occurrenceType;
    this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceType = occurrenceType;
  }
  selectOccurenceDropdownForHalfDaySalrayDeduction(occurrenceType: string) {
    this.selectedOccurenceDropdownForHalfDaySalrayDeduction = occurrenceType;
    this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceType = occurrenceType;
  }
  selectOccurenceDropdownForFullDaySalrayDeduction(occurrenceType: string) {
    this.selectedOccurenceDropdownForFullDaySalrayDeduction = occurrenceType;
    this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceType = occurrenceType;
  }

  
  //Extra
  countDurationDropdownList : string[] = ["Count", "Duration"];

  
  isFull:boolean=false;
  showFullDay(){
    this.isFull= this.isFull == true ? false:true;
  }

  isHalf:boolean=false;
  showHalfDay(){
    this.isHalf= this.isHalf == true ? false:true;
  }

  isBreak:boolean=false;
  showBreak(){
    this.isBreak= this.isBreak == true ? false:true;
  }

  isdeductHalf:boolean=false;
  showeDeductHalf(){
    this.isdeductHalf= this.isdeductHalf == true ? false:true;
  }

  isfullDayy:boolean=false;
  showFullDayy(){
    this.isfullDayy= this.isfullDayy == true ? false:true;
  }

  
  onTimeChange(salaryDeduction : any){
    salaryDeduction.updateDuration();
  }

  attendanceRuleResponse : AttendanceRuleResponse = new AttendanceRuleResponse();
  openAttendanceRuleResponseModal(attendanceRuleResponse : AttendanceRuleResponse){
    this.clearModel();
    this.attendanceRuleResponse = attendanceRuleResponse;
    this.attendanceRuleDefinitionRequest.attendanceRuleId = attendanceRuleResponse.id;
    this.getUserByFiltersMethodCall();
    this.getDeductionTypeMethodCall();
    this.getOvertimeTypeMethodCall();
  }

  selectedDeductionType : DeductionType = new DeductionType();

  clearModel(){
    this.ruleActiveTab.nativeElement.click();
    this.attendanceRuleDefinitionRequest = new AttendanceRuleDefinitionRequest();
    // this.attendanceRuleDefinitionRequest = {
    //   id : 0,
    //   deductionTypeId : 0,
    //   overtimeTypeId : 0,
    //   attendanceRuleId : 0,
    //   userUuids : [],
    //   customSalaryDeduction: {
    //     hours : 0,
    //     minutes : 0,
    //     lateDuration : '',
    //     occurrenceType : 'Count',
    //     occurrenceCount : 0,
    //     occurrenceDuration : '',
    //     amountInRupees : 0
    //   },
    //   halfDaySalaryDeduction: {
    //     hours : 0,
    //     minutes : 0,
    //     lateDuration: '',
    //     occurrenceType : '',
    //     occurrenceCount: 0,
    //     occurrenceDuration: ''
    //   },
    //   fullDaySalaryDeduction: {
    //     hours : 0,
    //     minutes : 0,
    //     lateDuration: '',
    //     occurrenceType : '',
    //     occurrenceCount: 0,
    //     occurrenceDuration: ''
    //   }
    // };    

    this.activeModel = false;
    this.activeModel2 = false;

    this.isFull = false;
    this.isHalf = false;
    this.isBreak = false;
    this.isdeductHalf = false;
    this.isfullDayy = false;

    this.selectedDeductionType = new DeductionType();
    this.selectedStaffsUuids = [];

  }

  
  deductionTypeList : DeductionType[] = [];
  getDeductionTypeMethodCall(){
    this.dataService.getDeductionType().subscribe((response) => {
      this.deductionTypeList = response;
      // console.log(response);
    }, (error)=>{

      console.log(error);
    })
  }

  overtimeTypeList : OvertimeType[] = [];
  getOvertimeTypeMethodCall(){
    this.dataService.getOvertimeType().subscribe((response) => {
      this.overtimeTypeList = response;
    }, (error) => {
      console.log(error);
    })
  }

  selectDeductionType(deductionType: DeductionType) {
    this.selectedDeductionType = deductionType;
    this.attendanceRuleDefinitionRequest.deductionTypeId = deductionType.id;
  
    const res = document.getElementById('amount-in-rupees') as HTMLElement;
    res.style.display = this.selectedDeductionType?.type === "FIXED AMOUNT" ? 'block' : 'none';
  }
  
  selectedOvertimeType : OvertimeType = new OvertimeType();

  selectOvertimeType(overtimeType : OvertimeType){
    this.selectedOvertimeType = overtimeType;
    this.attendanceRuleDefinitionRequest.overtimeTypeId = overtimeType.id;

    const res = document.getElementById('amount-in-rupees') as HTMLElement;
    res.style.display = this.selectedOvertimeType?.type === "FIXED AMOUNT" ? 'block' : 'none';
  }

  trueActiveModel(){
    this.activeModel=true;
    localStorage.setItem("staffSelectionActive", this.activeModel.toString());

  }

  attendanceRuleDefinitionResponse : AttendanceRuleDefinitionResponse = new AttendanceRuleDefinitionResponse();  
  updateAttendenceRuleDefinition(attendanceRuleDefinitionResponse : AttendanceRuleDefinitionResponse, attendanceRuleResponse : AttendanceRuleResponse){
    this.ruleActiveTab.nativeElement.click();
    
    this.activeModel = true;
    this.activeModel2 = true;
    
    this.attendanceRuleResponse = attendanceRuleResponse;

    debugger
    this.attendanceRuleDefinitionRequest = attendanceRuleDefinitionResponse;
    this.selectedStaffsUuids = attendanceRuleDefinitionResponse.userUuids;

    if(attendanceRuleDefinitionResponse.customSalaryDeduction.lateDuration){
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.hours  = parseInt(attendanceRuleDefinitionResponse.customSalaryDeduction.lateDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.minutes = parseInt(attendanceRuleDefinitionResponse.customSalaryDeduction.lateDuration.split(':')[1], 10);
    } else{
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.hours  = 0;
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.minutes = 0;
    }

    if(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.lateDuration){
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.hours  = parseInt(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.lateDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.minutes = parseInt(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.lateDuration.split(':')[1], 10);
    } else{
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.hours  = 0;
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.minutes = 0;
    }

    if(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.lateDuration){
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.hours  = parseInt(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.lateDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.minutes = parseInt(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.lateDuration.split(':')[1], 10);
    } else{
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.hours  = 0;
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.minutes = 0;
    }
    

    

    if(attendanceRuleDefinitionResponse.customSalaryDeduction.occurrenceDuration){
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDurationHours  = parseInt(attendanceRuleDefinitionResponse.customSalaryDeduction.occurrenceDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDurationMinutes = parseInt(attendanceRuleDefinitionResponse.customSalaryDeduction.occurrenceDuration.split(':')[1], 10);
    } else{
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDurationHours  = 0;
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDurationMinutes = 0;
    }

    if(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.occurrenceDuration){
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDurationHours  = parseInt(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.occurrenceDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDurationMinutes = parseInt(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.occurrenceDuration.split(':')[1], 10);
    } else{
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDurationHours  = 0;
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDurationMinutes = 0;
    }

    if(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.occurrenceDuration){
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDurationHours  = parseInt(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.occurrenceDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDurationMinutes = parseInt(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.occurrenceDuration.split(':')[1], 10);
    } else{
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDurationHours  = 0;
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDurationMinutes = 0;
    }
    
    
    
    // console.log(this.attendanceRuleDefinitionRequest);

    debugger
    this.getUserByFiltersMethodCall();

    debugger
    if(attendanceRuleDefinitionResponse.deductionType === null){
      this.getOvertimeTypeMethodCall();
      this.selectOvertimeType(attendanceRuleDefinitionResponse.overtimeType);
    } else{
      this.getDeductionTypeMethodCall();
      this.selectDeductionType(attendanceRuleDefinitionResponse.deductionType);
    }

    this.isFull = true;
    this.isHalf = true;
    this.isBreak = true;
    this.isdeductHalf = true;
    this.isfullDayy = true;

    this.selectedOccurenceDropdownForCustomSalrayDeduction = attendanceRuleDefinitionResponse.customSalaryDeduction.occurrenceType;
    this.selectedOccurenceDropdownForHalfDaySalrayDeduction = attendanceRuleDefinitionResponse.halfDaySalaryDeduction.occurrenceType;
    this.selectedOccurenceDropdownForFullDaySalrayDeduction = attendanceRuleDefinitionResponse.fullDaySalaryDeduction.occurrenceType;
    // this.selectCountDurationDropdown(attendanceRuleDefinitionResponse)
  }

  saveStepToLocal(step:string){
    localStorage.setItem("AttendanceRuleStep",step);
  }

}
