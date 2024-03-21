import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { AttendanceRuleDefinitionRequest } from 'src/app/models/attendance-rule-definition-request';
import { AttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-definition-response';
import { AttendanceRuleResponse } from 'src/app/models/attendance-rule-response';
import { AttendanceRuleWithAttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-with-attendance-rule-definition-response';
import { DeductionType } from 'src/app/models/deduction-type';
import { FullDaySalaryDeductionRequest } from 'src/app/models/full-day-salary-deduction-request';
import { HalfDaySalaryDeductionRequest } from 'src/app/models/half-day-salary-deduction-request';
import { OvertimeType } from 'src/app/models/overtime-type';
import { Staff } from 'src/app/models/staff';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-creat-rule',
  templateUrl: './creat-rule.component.html',
  styleUrls: ['./creat-rule.component.css']
})
export class CreatRuleComponent implements OnInit {

  readonly OVERTIME_RULE = Key.OVERTIME_RULE;
  constructor(private dataService: DataService,
    private helperService: HelperService,
    private router: Router,
    private el: ElementRef,
    private _location: Location,
    private _activeRouter: ActivatedRoute) { }

  ngOnInit(): void {
    if (localStorage.getItem("staffSelectionActive") == "true") {
      this.activeModel = true;
    }
    this.getUserByFiltersMethodCall();
    this.getDeductionTypeMethodCall();
    this.getOvertimeTypeMethodCall();
    let id = this._activeRouter.snapshot.queryParamMap.get('rule')!
    this.getAttendanceRuleByOrganizationMethodCall(id);
  }

  back() {
    this._location.back();
  }

  activeModel: boolean = false;
  trueActiveModel() {
    this.activeModel = true;
    localStorage.setItem("staffSelectionActive", this.activeModel.toString());

  }

  onTimeChange(salaryDeduction: any) {
    salaryDeduction.updateDuration();
    console.log("time : ",salaryDeduction);
    
  }

  updateDuration(): void {
    const formattedHours = this.selectedHours.toString().padStart(2, '0');
    const formattedMinutes = this.selectedMinutes.toString().padStart(2, '0');

    debugger
    this.duration = `${formattedHours}:${formattedMinutes}`;
  }

  onTimeChangeForOccerrenceDuration(salaryDeduction: any) {
    salaryDeduction.updateOccurrenceDuration();
  }

  isFull: boolean = false;
  showFullDay() {
    this.isFull = this.isFull == true ? false : true;
  }

  isHalf: boolean = false;
  showHalfDay() {
    this.isHalf = this.isHalf == true ? false : true;
  }

  isBreak: boolean = false;
  showBreak() {
    this.isBreak = this.isBreak == true ? false : true;
  }

  isdeductHalf: boolean = false;
  showDeductHalf() {
    this.isdeductHalf = this.isdeductHalf == true ? false : true;
  }

  isfullDayy: boolean = false;
  showFullDayy() {
    this.isfullDayy = this.isfullDayy == true ? false : true;
  }

  selectedDeductionType: DeductionType = new DeductionType();

  attendanceRuleDefinitionRequest: AttendanceRuleDefinitionRequest = new AttendanceRuleDefinitionRequest();
  selectDeductionType(deductionType: DeductionType) {
    this.selectedDeductionType = deductionType;
    this.attendanceRuleDefinitionRequest.deductionTypeId = deductionType.id;
  }

  selectedOvertimeType: OvertimeType = new OvertimeType();

  selectOvertimeType(overtimeType: OvertimeType) {
    this.selectedOvertimeType = overtimeType;
    this.attendanceRuleDefinitionRequest.overtimeTypeId = overtimeType.id;

    const res = document.getElementById('amount-in-rupees') as HTMLElement;
    res.style.display = this.selectedOvertimeType?.type === "FIXED AMOUNT" ? 'block' : 'none';
  }

  //Extra
  countDurationDropdownList: string[] = ["Count", "Duration"];
  // selectedCountDurationDropdown : string = '';
  selectedOccurenceDropdownForCustomSalrayDeduction: string = 'Count';
  selectedOccurenceDropdownForHalfDaySalrayDeduction: string = 'Count';
  selectedOccurenceDropdownForFullDaySalrayDeduction: string = 'Count';

  // selectCountDurationDropdown(countDurationDropdown: string) {
  //   this.selectedCountDurationDropdown = countDurationDropdown;
  // }

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

  @ViewChild("staffActiveTab") staffActiveTab !: ElementRef;

  isStaffTab: boolean = false;
  staffActiveTabMethod() {
    this.isStaffTab = true;
    this.staffActiveTab.nativeElement.click();
  }

  @ViewChild("ruleActiveTab") ruleActiveTab !: ElementRef;

  ruleActiveTabMethod() {
    this.isStaffTab = false;
    this.ruleActiveTab.nativeElement.click();
  }


  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;
  activeModel2: boolean = false;

  saveAttendanceRuleDefinitionLoading: boolean = false;
  registerAttendanceRuleDefinitionMethodCall() {
    debugger
    this.saveAttendanceRuleDefinitionLoading = true;
    this.attendanceRuleDefinitionRequest.userUuids = this.selectedStaffsUuids;
    this.preRegisterAttendanceRuleDefinitionMethodCall();

    this.dataService.registerAttendanceRuleDefinition(this.attendanceRuleDefinitionRequest).subscribe((response) => {
      this.saveAttendanceRuleDefinitionLoading = false;

      localStorage.removeItem("staffSelectionActive");

      this.activeModel2 = false;
      this.helperService.showToast("Attendance rule registered successfully", Key.TOAST_STATUS_SUCCESS);
        this.router.navigate(['/organization-onboarding/attendance-rule-setup']);
    }, (error) => {
      console.log(error);
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      this.saveAttendanceRuleDefinitionLoading = false;
    })
  }

  preRegisterAttendanceRuleDefinitionMethodCall() {
    if (this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceType == "Count") {
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDuration = '';
    } else {
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceCount = 0;
    }

    if (this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceType == "Count") {
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDuration = '';
    } else {
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceCount = 0;
    }

    if (this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceType == "Count") {
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDuration = '';
    } else {
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceCount = 0;
    }
  }

  itemPerPage: number = 8;
  pageNumber: number = 1;
  total !: number;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];
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



  getUserByFiltersMethodCall() {
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

  isAllUsersSelected: boolean = false;
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


  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);
  selectedHours: number = 0;
  selectedMinutes: number = 0;
  duration: string = '';
  selectedTime: string = '20:00';
  readonly DEDUCTION_TYPE_PER_MINUTE = Key.DEDUCTION_TYPE_PER_MINUTE;
  readonly OVERTIME_TYPE_FIXED_AMOUNT = Key.OVERTIME_TYPE_FIXED_AMOUNT;
  onTimeSet(time: string) {
    this.selectedTime = time;
  }


  searchUsers() {
    this.getUserByFiltersMethodCall();
  }

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach(staff => staff.selected = false);
    this.selectedStaffsUuids = [];
    this.activeModel2 = false;
  }


  // Method to toggle all users' selection
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

  async getAllUsersUuids(): Promise<string[]> {
    // Replace with your actual API call to get all users
    const response = await this.dataService.getAllUsers('asc', 'id', this.searchText, '').toPromise();
    return response.users.map((user: { uuid: any; }) => user.uuid);
  }


  // attendanceRuleResponseList : AttendanceRuleResponse[] = [];
  // getAttendanceRuleByOrganizationMethodCall(){
  //   this.dataService.getAttendanceRuleByOrganization().subscribe((response) => {
  //     debugger
  //     this.attendanceRuleResponseList = response;
  //     // console.log(response);
  //   }, (error)=>{

  //     console.log(error);
  //   });
  // }

  registeredAttendanceRuleResponseList: AttendanceRuleResponse[] = [];
  getRegisteredAttendanceRuleByOrganizationMethodCall() {
    debugger
    this.dataService.getRegisteredAttendanceRuleByOrganization().subscribe((response) => {
      // console.log("response ===",response);
      this.registeredAttendanceRuleResponseList = response;
    }, (error) => {
      console.log(error);
    });
  }


  attendanceRuleResponse: AttendanceRuleResponse = new AttendanceRuleResponse();
  openAttendanceRuleResponseModal(attendanceRuleResponse: AttendanceRuleResponse) {
    this.clearModel();
    this.attendanceRuleResponse = attendanceRuleResponse;
    this.attendanceRuleDefinitionRequest.attendanceRuleId = attendanceRuleResponse.id;
    this.getUserByFiltersMethodCall();
    this.getDeductionTypeMethodCall();
    this.getOvertimeTypeMethodCall();
  }

  clearModel() {
    this.ruleActiveTab.nativeElement.click();
    this.attendanceRuleDefinitionRequest = new AttendanceRuleDefinitionRequest();


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

  deductionTypeList: DeductionType[] = [];
  getDeductionTypeMethodCall() {
    this.dataService.getDeductionType().subscribe((response) => {
      this.deductionTypeList = response;
      // console.log(response);
    }, (error) => {

      console.log(error);
    })
  }

  overtimeTypeList: OvertimeType[] = [];
  getOvertimeTypeMethodCall() {
    this.dataService.getOvertimeType().subscribe((response) => {
      this.overtimeTypeList = response;
    }, (error) => {
      console.log(error);
    })
  }

  attendanceRuleDefinitionResponse: AttendanceRuleDefinitionResponse = new AttendanceRuleDefinitionResponse();
  updateAttendenceRuleDefinition(attendanceRuleDefinitionResponse: AttendanceRuleDefinitionResponse, attendanceRuleResponse: AttendanceRuleResponse) {
    this.ruleActiveTab.nativeElement.click();

    this.activeModel = true;
    this.activeModel2 = true;

    this.attendanceRuleResponse = attendanceRuleResponse;

    debugger
    this.attendanceRuleDefinitionRequest = attendanceRuleDefinitionResponse;
    this.selectedStaffsUuids = attendanceRuleDefinitionResponse.userUuids;

    if (attendanceRuleDefinitionResponse.customSalaryDeduction.lateDuration) {
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.hours = parseInt(attendanceRuleDefinitionResponse.customSalaryDeduction.lateDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.minutes = parseInt(attendanceRuleDefinitionResponse.customSalaryDeduction.lateDuration.split(':')[1], 10);
    } else {
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.hours = 0;
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.minutes = 0;
    }

    if (attendanceRuleDefinitionResponse.halfDaySalaryDeduction.lateDuration) {
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.hours = parseInt(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.lateDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.minutes = parseInt(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.lateDuration.split(':')[1], 10);
    } else {
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.hours = 0;
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.minutes = 0;
    }

    if (attendanceRuleDefinitionResponse.fullDaySalaryDeduction.lateDuration) {
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.hours = parseInt(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.lateDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.minutes = parseInt(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.lateDuration.split(':')[1], 10);
    } else {
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.hours = 0;
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.minutes = 0;
    }




    if (attendanceRuleDefinitionResponse.customSalaryDeduction.occurrenceDuration) {
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDurationHours = parseInt(attendanceRuleDefinitionResponse.customSalaryDeduction.occurrenceDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDurationMinutes = parseInt(attendanceRuleDefinitionResponse.customSalaryDeduction.occurrenceDuration.split(':')[1], 10);
    } else {
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDurationHours = 0;
      this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDurationMinutes = 0;
    }

    if (attendanceRuleDefinitionResponse.halfDaySalaryDeduction.occurrenceDuration) {
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDurationHours = parseInt(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.occurrenceDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDurationMinutes = parseInt(attendanceRuleDefinitionResponse.halfDaySalaryDeduction.occurrenceDuration.split(':')[1], 10);
    } else {
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDurationHours = 0;
      this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDurationMinutes = 0;
    }

    if (attendanceRuleDefinitionResponse.fullDaySalaryDeduction.occurrenceDuration) {
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDurationHours = parseInt(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.occurrenceDuration.split(':')[0], 10);
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDurationMinutes = parseInt(attendanceRuleDefinitionResponse.fullDaySalaryDeduction.occurrenceDuration.split(':')[1], 10);
    } else {
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDurationHours = 0;
      this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDurationMinutes = 0;
    }



    // console.log(this.attendanceRuleDefinitionRequest);

    debugger
    this.getUserByFiltersMethodCall();

    debugger
    if (attendanceRuleDefinitionResponse.deductionType === null) {
      this.getOvertimeTypeMethodCall();
      this.selectOvertimeType(attendanceRuleDefinitionResponse.overtimeType);
    } else {
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

  getAttendanceRuleDefinitionByIdMethodCall() {
    this.dataService.getAttendanceRuleDefinitionById(this.attendanceRuleDefinitionResponse.id).subscribe((response) => {
      // console.log(response);
    }, (error) => {
      console.log(error);
    })
  }

  attendanceRuleWithAttendanceRuleDefinitionResponseList: AttendanceRuleWithAttendanceRuleDefinitionResponse[] = [];
  getAttendanceRuleWithAttendanceRuleDefinitionMethodCall() {
    this.dataService.getAttendanceRuleWithAttendanceRuleDefinition().subscribe((response) => {
      this.attendanceRuleWithAttendanceRuleDefinitionResponseList = response;
      // console.log(response);
    }, (error) => {
      console.log(error);
    })
  }

  onSelectAllUsersChange(event: any) {
    this.selectAllUsers(event.target.checked);
  }

  getAttendanceRuleByOrganizationMethodCall(index: any) {
    this.dataService.getAttendanceRuleByOrganization().subscribe((response) => {
      debugger
      
      this.attendanceRuleResponse = response[index];
      this.attendanceRuleDefinitionRequest.attendanceRuleId = this.attendanceRuleResponse.id;
    }, (error) => {

      console.log(error);
    });
  }

  // set late duration
  getlateDuration(event:Date){
    let duration = this.helperService.formatDateToHHmmss(event);
    this.attendanceRuleDefinitionRequest.customSalaryDeduction.lateDuration = duration;
  }

  getHalfDaylateDuration(event:Date){
    let duration = this.helperService.formatDateToHHmmss(event);
    this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.lateDuration = duration;
  }

  getFullDaylateDuration(event:Date){
    let duration = this.helperService.formatDateToHHmmss(event);
    this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.lateDuration = duration;
  }

  // set occurrence duration
  getLateOccurrenceDuration(event:Date){
    let duration = this.helperService.formatDateToHHmmss(event);
    this.attendanceRuleDefinitionRequest.customSalaryDeduction.occurrenceDuration = duration;
  }

  getHalfDayOccurrenceDuration(event:Date){
    let duration = this.helperService.formatDateToHHmmss(event);
    this.attendanceRuleDefinitionRequest.halfDaySalaryDeduction.occurrenceDuration = duration;
  }

  getFullDayOccurrenceDuration(event:Date){
    let duration = this.helperService.formatDateToHHmmss(event);
    this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.occurrenceDuration = duration;
  }

}
