import { Directive,Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { AttendanceMode } from 'src/app/models/attendance-mode';
import { AttendanceRuleDefinitionRequest } from 'src/app/models/attendance-rule-definition-request';
import { AttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-definition-response';
import { AttendanceRuleResponse } from 'src/app/models/attendance-rule-response';
import { AttendanceRuleWithAttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-with-attendance-rule-definition-response';
import { DeductionType } from 'src/app/models/deduction-type';
import { OrganizationShiftTimingRequest } from 'src/app/models/organization-shift-timing-request';
import { OrganizationShiftTimingResponse } from 'src/app/models/organization-shift-timing-response';
import { OrganizationShiftTimingWithShiftTypeResponse } from 'src/app/models/organization-shift-timing-with-shift-type-response';
import { OvertimeType } from 'src/app/models/overtime-type';
import { ShiftType } from 'src/app/models/shift-type';
import { Staff } from 'src/app/models/staff';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-attendance-setting',
  templateUrl: './attendance-setting.component.html',
  styleUrls: ['./attendance-setting.component.css']
})
export class AttendanceSettingComponent implements OnInit {

  readonly OVERTIME_RULE = Key.OVERTIME_RULE;

  constructor(private dataService : DataService, private router: Router, private el: ElementRef) {
   }

  ngOnInit(): void {
    this.getAttendanceModeMethodCall();
    // this.getAttendanceModeAllMethodCall();
    this.getAllShiftTimingsMethodCall();
    this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();
    this.updateDuration();
    
    if(localStorage.getItem("staffSelectionActive")=="true"){
      this.activeModel=true;
    }

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
    salaryDeduction.updateLateDuration();
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
      console.log(response);
    }, (error)=>{

      console.log(error);
    });
  }

  registeredAttendanceRuleResponseList : AttendanceRuleResponse[] = [];
  getRegisteredAttendanceRuleByOrganizationMethodCall(){
    debugger
    this.dataService.getRegisteredAttendanceRuleByOrganization().subscribe((response) => {
      console.log(response);
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
  attendanceRuleDefinitionRequest : AttendanceRuleDefinitionRequest = new AttendanceRuleDefinitionRequest();
  registerAttendanceRuleDefinitionMethodCall(){

    debugger
    console.log(this.selectedStaffsUuids);

    this.attendanceRuleDefinitionRequest.userUuids = this.selectedStaffsUuids;
    this.preRegisterAttendanceRuleDefinitionMethodCall();

    this.dataService.registerAttendanceRuleDefinition(this.attendanceRuleDefinitionRequest).subscribe((response) => {
      console.log(response);
      
      localStorage.removeItem("staffSelectionActive");
      location.reload();
      this.attendanceRuleDefinitionModalClose.nativeElement.click();
      this.activeModel2=false;
    }, (error) =>{
      console.log(error);
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
      console.log(this.attendanceRuleDefinitionResponseList);
    }, (error) =>{
      console.log(error);
    }) 
  }

  deleteAttendanceRuleDefinitionMethodCall(attendanceRuleDefinitionId : number){
    debugger
    this.dataService.deleteAttendanceRuleDefinition(attendanceRuleDefinitionId).subscribe((response) => {
      console.log(response);
      location.reload();
    }, (error) =>{
      console.log(error);
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
    
    
    
    console.log(this.attendanceRuleDefinitionRequest);

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

  getAttendanceRuleDefinitionByIdMethodCall(){
    this.dataService.getAttendanceRuleDefinitionById(this.attendanceRuleDefinitionResponse.id).subscribe((response) => {
      console.log(response);
    }, (error) => {
      console.log(error);
    })
  }

  attendanceRuleWithAttendanceRuleDefinitionResponseList : AttendanceRuleWithAttendanceRuleDefinitionResponse[] = [];
  getAttendanceRuleWithAttendanceRuleDefinitionMethodCall(){
    this.dataService.getAttendanceRuleWithAttendanceRuleDefinition().subscribe((response) => {
      this.attendanceRuleWithAttendanceRuleDefinitionResponseList = response;
      console.log(response);
    }, (error) => {
      console.log(error);
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
      console.log(response);
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
      console.log(response);
      this.closeShiftTimingModal.nativeElement.click();
      location.reload();
    }, (error) => {
      console.log(error);
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

    // Reset errors and calculated times each time we calculate
    this.organizationShiftTimingValidationErrors = {};
    this.organizationShiftTimingRequest.lunchHour = '';
    this.organizationShiftTimingRequest.workingHour = '';

    // Convert times to Date objects
    const inDateTime = inTime ? new Date(`1970-01-01T${inTime}:00Z`).getTime() : 0;
    const outDateTime = outTime ? new Date(`1970-01-01T${outTime}:00Z`).getTime() : 0;
    const startLunchDateTime = startLunch ? new Date(`1970-01-01T${startLunch}:00Z`).getTime() : 0;
    const endLunchDateTime = endLunch ? new Date(`1970-01-01T${endLunch}:00Z`).getTime() : 0;

    let totalWorkedTime  = 0 ;

    // Check for valid in and out times
    if (inTime && outTime && outDateTime < inDateTime) {
      this.organizationShiftTimingValidationErrors['outTime'] = 'Out time must be after in time.';
    } else if (inTime && outTime) {
      totalWorkedTime = outDateTime - inDateTime;
      this.organizationShiftTimingRequest.workingHour = this.formatDuration(totalWorkedTime);
    }

    // If lunch start time isn't within in and out times
    if(startLunch && inTime && outTime){
      if(startLunchDateTime < inDateTime || startLunchDateTime > outDateTime){
        this.organizationShiftTimingValidationErrors['startLunch'] = 'Lunch time should be within in and out times.';
      }
    }
    
    // If lunch end time isn't within in and out times
    if(endLunch && inTime && outTime){
      if(endLunchDateTime < inDateTime || endLunchDateTime > outDateTime){
        this.organizationShiftTimingValidationErrors['endLunch'] = 'Lunch time should be within in and out times.';
      }
    }

    // If lunch times are valid, calculate lunch hour and adjust working hours
    if (startLunch && endLunch) {
      if (endLunchDateTime <= startLunchDateTime) {
        this.organizationShiftTimingValidationErrors['endLunch'] = 'Please enter a valid back time from lunch.';
      } else if (startLunchDateTime >= endLunchDateTime) {
        this.organizationShiftTimingValidationErrors['startLunch'] = 'Please enter a valid lunch start time.';
      } else {
        const lunchBreakDuration = endLunchDateTime - startLunchDateTime;
        this.organizationShiftTimingRequest.lunchHour = this.formatDuration(lunchBreakDuration);

        // Only adjust working hours if they've been calculated (i.e., in and out times were valid)
        if (this.organizationShiftTimingRequest.workingHour) {
          const adjustedWorkedTime = totalWorkedTime - lunchBreakDuration;
          this.organizationShiftTimingRequest.workingHour = this.formatDuration(adjustedWorkedTime);
        }
      }
    }
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
    this.dataService.getAllShiftTimings().subscribe((response) => {
      this.organizationShiftTimingWithShiftTypeResponseList = response;
      console.log(this.organizationShiftTimingWithShiftTypeResponseList);
    }, (error) => {
      console.log(error);
    })
  }

  shiftTypeList : ShiftType[] = [];
  getShiftTypeMethodCall(){
    this.dataService.getAllShiftType().subscribe((response) => {
      this.shiftTypeList = response;
      console.log(response);
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
      console.log(response);
      location.reload();
    }, (error) => {
      console.log(error);
    })
  }
  

  attendanceModeList : AttendanceMode[] = [];
  getAttendanceModeAllMethodCall(){
    this.dataService.getAttendanceModeAll().subscribe((response) => {
      this.attendanceModeList = response;
      console.log(response);
    }, (error) =>{
      console.log(error);
    })
  }

  updateAttendanceModeMethodCall(attendanceModeId : number){
    this.dataService.updateAttendanceMode(attendanceModeId).subscribe((response) => {
      console.log(response);
      this.getAttendanceModeMethodCall();
    }, (error)=>{
      console.log(error);
    })
  }

  selectedAttendanceModeId : number = 0;
  getAttendanceModeMethodCall(){
    this.dataService.getAttendanceMode().subscribe((response) => {
      debugger
      this.selectedAttendanceModeId = response.id;
      this.getAttendanceModeAllMethodCall();
      console.log(this.selectedAttendanceModeId);
    }, (error) => {
      console.log(error);
    })
  }

}
