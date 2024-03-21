import { DatePipe } from '@angular/common';
import { Directive,Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Key } from 'src/app/constant/key';
import { UniversalHoliday } from 'src/app/models/UniversalHoliday';
import { WeekDay } from 'src/app/models/WeekDay';
import { WeeklyHoliday } from 'src/app/models/WeeklyHoliday';
import { AttendanceMode } from 'src/app/models/attendance-mode';
import { AttendanceRuleDefinitionRequest } from 'src/app/models/attendance-rule-definition-request';
import { AttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-definition-response';
import { AttendanceRuleResponse } from 'src/app/models/attendance-rule-response';
import { AttendanceRuleWithAttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-with-attendance-rule-definition-response';
import { CustomHolidays } from 'src/app/models/customHolidays';
import { DeductionType } from 'src/app/models/deduction-type';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
import { OrganizationShiftTimingRequest } from 'src/app/models/organization-shift-timing-request';
import { OrganizationShiftTimingResponse } from 'src/app/models/organization-shift-timing-response';
import { OrganizationShiftTimingWithShiftTypeResponse } from 'src/app/models/organization-shift-timing-with-shift-type-response';
import { OvertimeType } from 'src/app/models/overtime-type';
import { ShiftType } from 'src/app/models/shift-type';
import { Staff } from 'src/app/models/staff';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-attendance-setting',
  templateUrl: './attendance-setting.component.html',
  styleUrls: ['./attendance-setting.component.css']
})
export class AttendanceSettingComponent implements OnInit {


  organizationAddressDetail : OrganizationAddressDetail = new OrganizationAddressDetail();

  readonly OVERTIME_RULE = Key.OVERTIME_RULE;

  constructor(private dataService : DataService,
    private datePipe: DatePipe,
    private helperService : HelperService,
    private fb: FormBuilder,
    private router: Router,
    private el: ElementRef) {
   }

  ngOnInit(): void {

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

    this.getUniversalHolidays();
    this.getCustomHolidays();
    this.getWeeklyHolidays();
    this.getWeekDays();

  }


  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholdersMethodCall(){
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  isShimmerForAttendanceRule = false;
  dataNotFoundPlaceholderForAttendanceRule = false;
  networkConnectionErrorPlaceHolderForAttendanceRule = false;
  preRuleForShimmersAndErrorPlaceholdersForAttendanceRuleWithDefinitionMethodCall(){
    this.isShimmerForAttendanceRule = true;
    this.dataNotFoundPlaceholderForAttendanceRule = false;
    this.networkConnectionErrorPlaceHolderForAttendanceRule = false;
  }

  //input for selecting duration:
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);
  selectedHours: number = 0;
  selectedMinutes: number = 0;
  duration : string = '';
  selectedTime : string = '20:00';
  readonly DEDUCTION_TYPE_PER_MINUTE = Key.DEDUCTION_TYPE_PER_MINUTE;
  readonly OVERTIME_TYPE_FIXED_AMOUNT = Key.OVERTIME_TYPE_FIXED_AMOUNT;

  


  selectHours(hour: number) {
    this.selectedHours = hour;
  }

  selectMinutes(minute: number) {
    this.selectedMinutes = minute;
  }

  updateDuration(): void {
    const formattedHours = this.selectedHours.toString().padStart(2, '0');
    const formattedMinutes = this.selectedMinutes.toString().padStart(2, '0');

    debugger
    this.duration = `${formattedHours}:${formattedMinutes}`;
  }

  onTimeChange(salaryDeduction : any){
    salaryDeduction.updateDuration();
  }

  onTimeChangeForOccerrenceDuration(salaryDeduction : any){
    salaryDeduction.updateOccurrenceDuration();
  }

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


  attendanceRuleResponseList : AttendanceRuleResponse[] = [];
  getAttendanceRuleByOrganizationMethodCall(){
    this.dataService.getAttendanceRuleByOrganization().subscribe((response) => {
      debugger
      this.attendanceRuleResponseList = response;
      // console.log(response);
    }, (error)=>{

      console.log(error);
    });
  }

  registeredAttendanceRuleResponseList : AttendanceRuleResponse[] = [];
  getRegisteredAttendanceRuleByOrganizationMethodCall(){
    debugger
    this.dataService.getRegisteredAttendanceRuleByOrganization().subscribe((response) => {
      // console.log(response);
      this.registeredAttendanceRuleResponseList = response;
    }, (error)=>{
      console.log(error);
    });
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

  activeModel2:boolean=false;
  @ViewChild('attendanceRuleDefinitionModalClose') attendanceRuleDefinitionModalClose !: ElementRef;
  @ViewChild('addAttendanceRuleDefinitionModalClose') addAttendanceRuleDefinitionModalClose !: ElementRef;
  attendanceRuleDefinitionRequest : AttendanceRuleDefinitionRequest = new AttendanceRuleDefinitionRequest();
  saveAttendanceRuleDefinitionLoading: boolean = false;
  registerAttendanceRuleDefinitionMethodCall(){
    debugger
    this.saveAttendanceRuleDefinitionLoading = true;
    this.attendanceRuleDefinitionRequest.userUuids = this.selectedStaffsUuids;
    this.preRegisterAttendanceRuleDefinitionMethodCall();

    this.dataService.registerAttendanceRuleDefinition(this.attendanceRuleDefinitionRequest).subscribe((response) => {
      localStorage.removeItem("staffSelectionActive");
      this.addAttendanceRuleDefinitionModalClose.nativeElement.click();
      this.activeModel2=false;
      this.saveAttendanceRuleDefinitionLoading = false;
      this.helperService.showToast("Attendance rule registered successfully", Key.TOAST_STATUS_SUCCESS);
      this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();
    }, (error) =>{
      console.log(error);
      this.saveAttendanceRuleDefinitionLoading = false;
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

  attendanceRuleDefinitionResponseList : AttendanceRuleDefinitionResponse[] = [];
  getAttendanceRuleDefinitionMethodCall(attendanceRuleId : number){
    this.dataService.getAttendanceRuleDefinition(attendanceRuleId).subscribe((response) => {

      this.attendanceRuleDefinitionResponseList = response;
      // console.log(this.attendanceRuleDefinitionResponseList);
      
    }, (error) =>{
      console.log(error);
      this.networkConnectionErrorPlaceHolderForAttendanceRule = true;
    }) 
  }

  showToastMessage : boolean = false;

  deleteAttendanceRuleTemplateLoader(id: any): boolean {
    return this.deleteAttendanceRuleLoaderStatus[id] || false;
  }

  deleteAttendanceRuleLoaderStatus: { [key: string]: boolean } = {};
  deleteAttendanceRuleDefinitionMethodCall(attendanceRuleDefinitionId : number){
    debugger
    this.deleteAttendanceRuleLoaderStatus[attendanceRuleDefinitionId] = true;
    this.dataService.deleteAttendanceRuleDefinition(attendanceRuleDefinitionId).subscribe((response) => {
      // console.log(response);
      this.deleteAttendanceRuleLoaderStatus[attendanceRuleDefinitionId] = false;
      this.helperService.showToast("Attendance rule settings deleted successfully", Key.TOAST_STATUS_SUCCESS);
      this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();

    }, (error) =>{
      console.log(error);
      this.deleteAttendanceRuleLoaderStatus[attendanceRuleDefinitionId] = false;
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
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

  getAttendanceRuleDefinitionByIdMethodCall(){
    this.dataService.getAttendanceRuleDefinitionById(this.attendanceRuleDefinitionResponse.id).subscribe((response) => {
      // console.log(response);
    }, (error) => {
      console.log(error);
    })
  }

  attendanceRuleWithAttendanceRuleDefinitionResponseList : AttendanceRuleWithAttendanceRuleDefinitionResponse[] = [];
  attendanceRuleWithAttendanceRuleDefinitionLoading: boolean = false;
  getAttendanceRuleWithAttendanceRuleDefinitionMethodCall(){
    this.attendanceRuleWithAttendanceRuleDefinitionLoading = true;
    this.dataService.getAttendanceRuleWithAttendanceRuleDefinitionNew().subscribe((response) => {
      if (response.status) {
        this.attendanceRuleWithAttendanceRuleDefinitionLoading = false;
        this.attendanceRuleWithAttendanceRuleDefinitionResponseList = response.object;
        this.dataNotFoundPlaceholder = false;
        this.networkConnectionErrorPlaceHolder = false;
      }
      else
      {
        this.attendanceRuleWithAttendanceRuleDefinitionLoading = false;
        this.dataNotFoundPlaceholderForAttendanceRule = true;
      }
    }, (error) => {
      this.attendanceRuleWithAttendanceRuleDefinitionLoading = false;
      console.log(error);
      this.networkConnectionErrorPlaceHolder = true;
    })
  }


  itemPerPage : number = 8;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;
  searchText : string = '';
  staffs : Staff[] = [];

  // getUserByFiltersMethodCall(){
  //   this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'').subscribe((response) => {
  //     debugger;
  //     this.staffs = response.users;
  //     this.total = response.count;
  //     console.log(response);

  //   }, (error) => {
  //     console.log(error);
  //   })
  // }


  


  // Function to handle time change
  onTimeSet(time: string) {
    this.selectedTime = time;
  }
  
  
  searchUsers(){
    this.getUserByFiltersMethodCall();
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
  

  selectedDeductionType : DeductionType = new DeductionType();

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

  //Extra
  countDurationDropdownList : string[] = ["Count", "Duration"];
  // selectedCountDurationDropdown : string = '';
  selectedOccurenceDropdownForCustomSalrayDeduction : string = 'Count';
  selectedOccurenceDropdownForHalfDaySalrayDeduction : string = 'Count';
  selectedOccurenceDropdownForFullDaySalrayDeduction : string = 'Count';

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
  

  selectedStaffsUuids : string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;

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
    
    this.activeModel2=true;

    if(this.selectedStaffsUuids.length === 0){
      this.activeModel2 = false;
    }
  }


  // #####################################################
isAllUsersSelected: boolean = false;

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



// Asynchronous function to get all user UUIDs
async getAllUsersUuids(): Promise<string[]> {
  // Replace with your actual API call to get all users
  const response = await this.dataService.getAllUsers('asc', 'id', this.searchText, '').toPromise();
  return response.users.map((user: { uuid: any; }) => user.uuid);
}

// Call this method when the select all users checkbox value changes
onSelectAllUsersChange(event : any) {
  this.selectAllUsers(event.target.checked);
}

unselectAllUsers() {
  this.isAllUsersSelected = false;
  this.isAllSelected = false;
  this.staffs.forEach(staff => staff.selected = false);
  this.selectedStaffsUuids = [];
  this.activeModel2 = false;
}

  activeModel:boolean=false;
  trueActiveModel(){
    this.activeModel=true;
    localStorage.setItem("staffSelectionActive", this.activeModel.toString());

  }

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

  @ViewChild("staffActiveTab") staffActiveTab !: ElementRef;

  staffActiveTabMethod(){
    this.staffActiveTab.nativeElement.click();
  }

  @ViewChild("ruleActiveTab") ruleActiveTab !: ElementRef;

  ruleActiveTabMethod(){
    this.ruleActiveTab.nativeElement.click();
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

  onTableDataChange(event : any)
  {
    this.pageNumber=event;
  }



  // #########################################################

  @ViewChild("closeShiftTimingModal") closeShiftTimingModal !: ElementRef;

  registerOrganizationShiftTimingMethodCall(){

    debugger
    this.organizationShiftTimingRequest.userUuids = this.selectedStaffsUuids;

    this.dataService.registerShiftTiming(this.organizationShiftTimingRequest).subscribe((response) => {
      debugger
      // console.log(response);
      this.closeShiftTimingModal.nativeElement.click();
      this.getAllShiftTimingsMethodCall();
      this.helperService.showToast("Shift Timing registered successfully", Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      console.log(error);
      this.helperService.showToast("Shift Timing registered successfully", Key.TOAST_STATUS_ERROR);
    })
  }

  clearShiftTimingModel(){
    this.shiftTimingActiveTab.nativeElement.click();
    this.organizationShiftTimingRequest = new OrganizationShiftTimingRequest();
    this.selectedShiftType = new ShiftType();
  }
  organizationShiftTimingRequest : OrganizationShiftTimingRequest = new OrganizationShiftTimingRequest();

  submitShiftTimingForm(): void {
    this.calculateTimes();
    if (this.isValidForm()) {
        // Proceed with form submission logic
    } else {
        // Handle invalid form case
    }
  }

  organizationShiftTimingValidationErrors: { [key: string]: string } = {};

  calculateTimes(): void {
    const { inTime, outTime, startLunch, endLunch } = this.organizationShiftTimingRequest;
  
    // Reset errors and calculated times
    this.organizationShiftTimingValidationErrors = {};
    this.organizationShiftTimingRequest.lunchHour = '';
    this.organizationShiftTimingRequest.workingHour = '';
  
    // Helper function to convert time string to minutes
    const timeToMinutes = (time : any) => {
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
  
  // Helper function to format minutes back to HH:mm format
  formatMinutesToTime(minutes : any) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  

  private formatDuration(duration: number): string {
    const hours = Math.floor(duration / 1000 / 60 / 60);
    const minutes = Math.floor((duration / 1000 / 60) % 60);
    return `${this.padZero(hours)}:${this.padZero(minutes)}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  private isValidForm(): boolean {
    return Object.keys(this.organizationShiftTimingValidationErrors).length === 0;
  }


  @ViewChild("staffActiveTabInShiftTiming") staffActiveTabInShiftTiming !: ElementRef;

  staffActiveTabInShiftTimingMethod(){

    if(this.isValidForm()){
      this.staffActiveTabInShiftTiming.nativeElement.click();
    }
    
  }

  @ViewChild("shiftTimingActiveTab") shiftTimingActiveTab !: ElementRef;

  shiftTimingActiveTabMethod(){
    this.shiftTimingActiveTab.nativeElement.click();
  }



  organizationShiftTimingWithShiftTypeResponseList : OrganizationShiftTimingWithShiftTypeResponse[] = [];
  getAllShiftTimingsMethodCall(){
     debugger
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();

    // this.isShimmer = true;
    // this.dataNotFoundPlaceholder = false;
    // this.networkConnectionErrorPlaceHolder = false;

    this.dataService.getAllShiftTimings().subscribe((response) => {
      this.organizationShiftTimingWithShiftTypeResponseList = response;
      // console.log(this.organizationShiftTimingWithShiftTypeResponseList);
      // this.isShimmer = false;
      // this.dataNotFoundPlaceholder = true;
      if(response === undefined || response === null || response.length === 0){
        this.dataNotFoundPlaceholder = true;
      }
    }, (error) => {
      console.log(error);
      // this.isShimmer = false;
      this.networkConnectionErrorPlaceHolder = true;
    })

  }

  shiftTypeList : ShiftType[] = [];
  getShiftTypeMethodCall(){
    this.dataService.getAllShiftType().subscribe((response) => {
      this.shiftTypeList = response;
      // console.log(response);
    }, (error) => {
      console.log(error);
    })
  }
  
  selectedShiftType : ShiftType = new ShiftType();

  selectShiftType(shiftType : ShiftType){
    this.selectedShiftType = shiftType;
    this.organizationShiftTimingRequest.shiftTypeId = shiftType.id;
  }



  // ##############################################################
  openAddShiftTimeModal(){
    this.getShiftTypeMethodCall();
    this.getUserByFiltersMethodCall();
    this.clearShiftTimingModel();
  }

  updateOrganizationShiftTiming(organizationShiftTimingResponse : OrganizationShiftTimingResponse){

    this.shiftTimingActiveTab.nativeElement.click();
    debugger
    this.organizationShiftTimingRequest = organizationShiftTimingResponse;
    this.organizationShiftTimingRequest.shiftTypeId = organizationShiftTimingResponse.shiftType.id;
    this.selectedStaffsUuids = organizationShiftTimingResponse.userUuids;

    this.getShiftTypeMethodCall();
    this.selectedShiftType = organizationShiftTimingResponse.shiftType;
    this.getUserByFiltersMethodCall();

  }


  deleteOrganizationShiftTimingMethodCall(organizationShiftTimingId : number){
    this.dataService.deleteOrganizationShiftTiming(organizationShiftTimingId).subscribe((response)=>{
      // console.log(response);
      this.getAllShiftTimingsMethodCall();
      this.helperService.showToast("Shift timing deleted successfully", Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      console.log(error);
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
  }
  

  attendanceModeList : AttendanceMode[] = [];
  getAttendanceModeAllMethodCall(){
    this.isShimmer = true;
    this.dataService.getAttendanceModeAll().subscribe((response) => {
      this.attendanceModeList = response;
      // console.log(response);
    }, (error) =>{
      console.log(error);
    })
  }


  // Modal

  @ViewChild("attendancewithlocationssButton") attendancewithlocationssButton !: ElementRef;
  updateAttendanceModeMethodCall(attendanceModeId : number){
   
    this.dataService.updateAttendanceMode(attendanceModeId).subscribe((response) => {
      // console.log(response);
      this.getAttendanceModeMethodCall();
      if(attendanceModeId == 2 || attendanceModeId == 3){
        this.attendancewithlocationssButton.nativeElement.click();
      }
      setTimeout(() => {
        if (attendanceModeId == 1){
          this.helperService.showToast("Attedance Mode updated successfully.", Key.TOAST_STATUS_SUCCESS);
        }
        // console.log("Second line executed after 3 seconds");
      }, 1000);
      
    }, (error)=>{
      console.log(error);
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
  }

  selectedAttendanceModeId : number = 0;
  getAttendanceModeMethodCall(){
    this.isShimmer = true;
    this.getOrganizationAddressDetailMethodCall();
    this.dataService.getAttendanceMode().subscribe((response) => {
      debugger
      this.selectedAttendanceModeId = response.id;
      this.getAttendanceModeAllMethodCall();
      // console.log(this.selectedAttendanceModeId);
    }, (error) => {
      console.log(error);
    })
  }
  toggle = false;
  @ViewChild("closeAddressModal") closeAddressModal !: ElementRef;
  setOrganizationAddressDetailMethodCall(){
    this.toggle = true;
    this.dataService.setOrganizationAddressDetail(this.organizationAddressDetail)
    .subscribe(
      (response: OrganizationAddressDetail) => {
        // console.log(response);  
        this.toggle=false;
       this.closeAddressModal.nativeElement.click();
       this.helperService.showToast("Attedance Mode updated successfully", Key.TOAST_STATUS_SUCCESS);
      
        
      },
      (error) => {
        console.error(error);
        
      })
   
    ;
  }
  @ViewChild("placesRef") placesRef! : GooglePlaceDirective;

  public handleAddressChange(e: any) {
    debugger
    var id=this.organizationAddressDetail.id;
    this.organizationAddressDetail=new OrganizationAddressDetail();
    this.organizationAddressDetail.id=id;
    this.organizationAddressDetail.longitude = e.geometry.location.lng();
    this.organizationAddressDetail.latitude = e.geometry.location.lat();

    console.log(e.geometry.location.lat());
    console.log(e.geometry.location.lng());
    this.organizationAddressDetail.addressLine1=e.name + ", " + e.vicinity;


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



  // ##########  holidays #############

  isHolidayErrorPlaceholder:boolean=false;
  universalHolidays: UniversalHoliday[] = [];

  getUniversalHolidays() {
    this.dataService.getUniversalHolidays().subscribe({
      next: (holidays) => {
        this.universalHolidays = holidays;
      },
      error: (error) => {
        this.isHolidayErrorPlaceholder=true;
        console.error('Error fetching universal holidays:', error);
      }
    });
  }
  
  customHolidays: CustomHolidays[] = [];

  getCustomHolidays() {
    this.dataService.getCustomHolidays().subscribe({
      next: (holidays) => {
        this.customHolidays = holidays;
      },
      error: (error) => {
        this.isHolidayErrorPlaceholder=true;
        console.error('Error fetching custom holidays:', error);
      }
    });
  }
  
  isWeeklyHolidayErrorPlaceholder:boolean=false;
  weeklyHolidays: WeeklyHoliday[] = [];

  getWeeklyHolidays() {
    this.dataService.getWeeklyHolidays().subscribe(holidays => {
      this.weeklyHolidays = holidays;
      this.getWeekDays();

    },(error) => {
      this.isWeeklyHolidayErrorPlaceholder=true;
      console.error('Error fetching custom holidays:', error);
    });
  }

  weekDay: WeekDay[] = [];

  // getWeekDays() {
  //   debugger
  //   this.dataService.getWeekDays().subscribe(holidays => {
  //     this.weekDay = holidays;
  //     console.log(this.weekDay);
  //   });
  // }

  getWeekDays() {
    this.dataService.getWeekDays().subscribe(holidays => {
      this.weekDay = holidays.map(day => ({
        ...day,
        selected: day.selected === 1
      }));
      console.log(this.weekDay); 
    });
  }
  

  // getWeekDays() {
  //   this.dataService.getWeekDays().subscribe(holidays => {
  //     console.log(this.weekDay);

  //     this.weekDay = holidays.map(day => ({
  //       ...day,
  //       selected: day.selected === true 
  //     }));
  //     console.log(this.weekDay);
  //   });
  // }

  submitWeeklyHolidaysLoader:boolean=false;
  @ViewChild("closeWeeklyHolidayModal") closeWeeklyHolidayModal!:ElementRef;
  submitWeeklyHolidays() {
    const selectedWeekDays = this.weekDay
                              .filter(day => day.selected)
                              .map(day => day.name);
     this.submitWeeklyHolidaysLoader=true;
    this.dataService.registerWeeklyHolidays(selectedWeekDays).subscribe({
      next: (response) => {
        console.log('Weekly holidays registered successfully', response);
        this.getWeeklyHolidays(); 
        this.submitWeeklyHolidaysLoader=false;
        this.closeWeeklyHolidayModal.nativeElement.click();
      },
      error: (error) => {
        this.submitWeeklyHolidaysLoader=false;
        console.error('Failed to register weekly holidays', error);
      }
    });
  }

  deleteWeeklyHolidays(id: number) {
      this.dataService.deleteWeeklyHolidays(id).subscribe(
        response => {
          console.log(response);
          // alert('Weekly holiday deleted successfully');
          this.getWeeklyHolidays(); 
        },
        error => {
          console.error('Error deleting weekly holiday:', error);
        }
      );
  }

  deleteCustomHolidays(id:number){
    this.dataService.deleteCustomHolidays(id).subscribe(
      response => {
        console.log(response);
        this.getCustomHolidays(); 
      },
      error => {
        console.error('Error deleting weekly holiday:', error);
      }
    );
  }

  formatDateIn(newdate:any) {
    const date = new Date(newdate);
    const formattedDate = this.datePipe.transform(date, 'dd MMMM, yyyy');
    return formattedDate;
  }

  // isHoliday(weekDayId: number): boolean {
  //   return this.weeklyHolidays.some(holiday => holiday.id === weekDayId);
  // }

  
  holidayList: { name: string; date: string }[] = [{ name: '', date: '' }];

  addHoliday() {
    this.holidayList.push({ name: '', date: '' });
  }

  removeHoliday(index: number) {
    this.holidayList.splice(index, 1);
  }

  isCustomHolidayLoader:boolean=false;
  @ViewChild("customHolidayModal") customHolidayModal!:ElementRef;
  registerCustomHolidays() {
    console.log(this.holidayList);
    this.isCustomHolidayLoader=true;
    this.dataService.registerCustomHolidays(this.holidayList).subscribe({
      next: (response) => {
        console.log('Custom Holidays Registered Successfully', response)
        this.getCustomHolidays();
        this.isCustomHolidayLoader=false;
        this.holidayList= [{ name: '', date: '' }];
        this.customHolidayModal.nativeElement.click();
      },
      error: (error) => {
        this.isCustomHolidayLoader=false;
        console.error('Error registering custom holidays:', error)}
    });
  }

  isDateGreaterThanToday(date: string): boolean {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let compareDate = new Date(date);

    return compareDate > today;
  }
}
