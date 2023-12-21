import { Directive,Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { AttendanceRuleDefinitionRequest } from 'src/app/models/attendance-rule-definition-request';
import { AttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-definition-response';
import { AttendanceRuleResponse } from 'src/app/models/attendance-rule-response';
import { AttendanceRuleWithAttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-with-attendance-rule-definition-response';
import { DeductionType } from 'src/app/models/deduction-type';
import { OvertimeType } from 'src/app/models/overtime-type';
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

  constructor(private dataService : DataService, private router: Router, private el: ElementRef) { }

  ngOnInit(): void {
    this.getUserByFiltersMethodCall();
    this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();
    this.updateDuration();

    // this.getRegisteredAttendanceRuleByOrganizationMethodCall();
    // this.getAttendanceRuleDefinitionMethodCall();
    // console.log(this.selectedStaffs);
    // this.updateSelectedStaffs();
    
    if(localStorage.getItem("staffSelectionActive")=="true"){
      this.activeModel=true;
    }


    // const timePicker = new TimePicker(this.el.nativeElement, {
    //   lang: 'en',
    //   theme: 'dark'
    // });

    // timePicker.on('change', (evt) => {
    //   const value = (evt.hour || '00') + ':' + (evt.minute || '00');
    //   this.el.nativeElement.value = value;
    // });
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

  onTimeChange(): void {
    this.updateDuration();
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
      this.activeModel2=false;
      this.attendanceRuleDefinitionModalClose.nativeElement.click();
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
    this.activeModel = true;
    this.activeModel2 = true;
    
    this.attendanceRuleResponse = attendanceRuleResponse;
    this.attendanceRuleDefinitionRequest = attendanceRuleDefinitionResponse;

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

  // getUserByFiltersMethodCall() {
  //   this.dataService.getUsersByFilter(this.itemPerPage, this.pageNumber, 'asc', 'id', this.searchText, '').subscribe((response) => {
  //     // Assume response.users is an array of Staff
  //     this.staffs = response.users.map((staff: Staff) => ({
  //       ...staff,
  //       selected: this.selectedStaffsUuids.includes(staff.uuid)
  //     }));
  //     this.total = response.count;
  //   }, (error) => {
  //     console.error(error);
  //   });
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

  // Staff selection:
  // selectedStaffs: Staff[] = [];

  // updateSelectedStaffs() {
  //   this.selectedStaffs = this.staffs.filter(staff => staff.selected);
  // }

  // selectAll(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   const isChecked = input.checked;
  //   this.staffs.forEach(staff => staff.selected = isChecked);
  //   this.updateSelectedStaffs();
  //   console.log(this.selectedStaffs);
  // }
  

  selectedStaffsUuids : string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;

  // getUserByFiltersMethodCall() {
  //   this.dataService.getUsersByFilter(this.itemPerPage, this.pageNumber, 'asc', 'id', this.searchText, '').subscribe((response) => {
  //     // Assume response.users is an array of Staff
  //     this.staffs = response.users.map((staff: Staff) => ({
  //       ...staff,
  //       selected: this.selectedStaffsUuids.includes(staff.uuid)
  //     }));
  //     this.total = response.count;
  //   }, (error) => {
  //     console.error(error);
  //   });
  // }

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
    this.isAllSelected = this.staffs.every(staff => staff.selected);
    this.updateSelectedStaffs();
  }

  // selectAll(checked: boolean) {
  //   this.isAllSelected = checked;
  //   this.staffs.forEach(staff => staff.selected = checked);
  //   this.updateSelectedStaffs();
  // }

  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach(staff => staff.selected = checked);
    this.updateSelectedStaffs();
  }
  
  checkAndUpdateAllSelected() {
    this.isAllSelected = this.staffs.length > 0 && this.staffs.every(staff => staff.selected);
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

  // updateSelectedStaffs() {
  //   // Update the list of selected UUIDs based on the current page's staff selections
  //   this.staffs.forEach((staff: Staff) => {
  //     if (staff.selected && !this.selectedStaffsUuids.includes(staff.uuid)) {
  //       this.selectedStaffsUuids.push(staff.uuid);
  //     } else if (!staff.selected && this.selectedStaffsUuids.includes(staff.uuid)) {
  //       this.selectedStaffsUuids = this.selectedStaffsUuids.filter(uuid => uuid !== staff.uuid);
  //     }
  //   });
  // }
  
  
  // updateSelectedStaffs() {
  //   this.selectedStaffs = this.staffs.filter(staff => staff.selected);
  //   this.isAllSelected = this.selectedStaffs.length === this.staffs.length;

  //   for(let staff of this.selectedStaffs){
  //     if(this.selectedStaffsUuids.includes(staff.uuid)){
  //       continue;
  //     }
  //     this.selectedStaffsUuids.push(staff.uuid);
  //   }
  //   this.attendanceRuleDefinitionRequest.userUuids = this.selectedStaffsUuids;
  //   console.log(this.attendanceRuleDefinitionRequest.userUuids);
  // }

  

  // checkIndividualSelection() {
  //   this.isAllSelected = this.staffs.every(staff => staff.selected);
  //   this.updateSelectedStaffs();
  // }


  

  activeModel:boolean=false;
  trueActiveModel(){
    
    this.activeModel=true;
    localStorage.setItem("staffSelectionActive", this.activeModel.toString());

  }

  clearModel(){
    this.attendanceRuleDefinitionRequest = {
      id : 0,
      deductionTypeId : 0,
      overtimeTypeId : 0,
      attendanceRuleId : 0,
      userUuids : [],
      customSalaryDeduction: {
        lateDuration : '',
        occurrenceType : 'Count',
        occurrenceCount : 0,
        occurrenceDuration : '',
        amountInRupees : 0
      },
      halfDaySalaryDeduction: {
        lateDuration: '',
        occurrenceType : '',
        occurrenceCount: 0,
        occurrenceDuration: ''
      },
      fullDaySalaryDeduction: {
        lateDuration: '',
        occurrenceType : '',
        occurrenceCount: 0,
        occurrenceDuration: ''
      }
    };    

    this.activeModel = false;
    this.activeModel2 = false;

    this.isFull = false;
    this.isHalf = false;
    this.isBreak = false;
    this.isdeductHalf = false;
    this.isfullDayy = false;

    this.selectedDeductionType = new DeductionType();

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
}
