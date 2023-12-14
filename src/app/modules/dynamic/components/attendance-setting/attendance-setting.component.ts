import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AttendanceRuleDefinitionRequest } from 'src/app/models/attendance-rule-definition-request';
import { AttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-definition-response';
import { AttendanceRuleResponse } from 'src/app/models/attendance-rule-response';
import { AttendanceRuleWithAttendanceRuleDefinitionResponse } from 'src/app/models/attendance-rule-with-attendance-rule-definition-response';
import { DeductionType } from 'src/app/models/deduction-type';
import { Staff } from 'src/app/models/staff';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-attendance-setting',
  templateUrl: './attendance-setting.component.html',
  styleUrls: ['./attendance-setting.component.css']
})
export class AttendanceSettingComponent implements OnInit {

selectedFilter: any;
filterUsers() {
throw new Error('Method not implemented.');
}

  constructor(private dataService : DataService, private router: Router) { }

  ngOnInit(): void {
    this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();
    // this.getRegisteredAttendanceRuleByOrganizationMethodCall();
    // this.getAttendanceRuleDefinitionMethodCall();
    // console.log(this.selectedStaffs);
    // this.updateSelectedStaffs();
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
      for(let attendanceRuleResponse of this.registeredAttendanceRuleResponseList){
        this.getAttendanceRuleDefinitionMethodCall(attendanceRuleResponse.id);
      }
    }, (error)=>{
      console.log(error);
    });
  }


  attendanceRuleResponse : AttendanceRuleResponse = new AttendanceRuleResponse();
  openAttendanceRuleResponseModal(attendanceRuleResponse : AttendanceRuleResponse){
    this.attendanceRuleResponse = attendanceRuleResponse;
    this.attendanceRuleDefinitionRequest.attendanceRuleId = attendanceRuleResponse.id;
  }

  @ViewChild('attendanceRuleDefinitionModalClose') attendanceRuleDefinitionModalClose !: ElementRef;
  attendanceRuleDefinitionRequest : AttendanceRuleDefinitionRequest = new AttendanceRuleDefinitionRequest();
  registerAttendanceRuleDefinitionMethodCall(){
    this.dataService.registerAttendanceRuleDefinition(this.attendanceRuleDefinitionRequest).subscribe((response) => {
      console.log(response);
      location.reload();
      this.attendanceRuleDefinitionModalClose.nativeElement.click();
    }, (error) =>{
      console.log(error);
    })
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


  attendanceRuleDefinitionResponse : AttendanceRuleDefinitionResponse = new AttendanceRuleDefinitionResponse();  
  updateAttendenceRuleDefinition(attendanceRuleDefinitionResponse : AttendanceRuleDefinitionResponse){
    this.getDeductionTypeMethodCall();
    this.attendanceRuleDefinitionRequest = attendanceRuleDefinitionResponse;
    this.selectDeductionType(attendanceRuleDefinitionResponse.deductionType);
    this.isFull = true;
    this.isHalf = true;
    this.isBreak = true;
    this.isdeductHalf = true;
    this.isfullDayy = true;
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


  itemPerPage : number = 5;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;
  searchText : string = '';
  staffs : Staff[] = [];

  getUserByFiltersMethodCall(){
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'').subscribe((response) => {
      this.staffs = response.users;
      console.log(response);

    }, (error) => {
      console.log(error);
    })
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
  

  selectedDeductionType : DeductionType = new DeductionType();

  selectDeductionType(deductionType: DeductionType) {
    this.selectedDeductionType = deductionType;
    this.attendanceRuleDefinitionRequest.deductionTypeId = deductionType.id;

    const res = document.getElementById('amount-in-rupees') as HTMLElement;

    if(this.selectedDeductionType.type === "FIXED AMOUNT"){
      res.style.display = 'block';
    } else{
      res.style.display = 'none';
    }
  }



  //Extra
  countDurationDropdownList : string[] = ["Count", "Duration"];
  // selectedCountDurationDropdown : string = '';
  selectedOccurenceDropdownForCustomSalrayDeduction : string = '';
  selectedOccurenceDropdownForHalfDaySalrayDeduction : string = '';
  selectedOccurenceDropdownForFullDaySalrayDeduction : string = '';

  // selectCountDurationDropdown(countDurationDropdown: string) {
  //   this.selectedCountDurationDropdown = countDurationDropdown;
  // }

  selectOccurenceDropdownForCustomSalrayDeduction(_t350: string) {
    this.selectedOccurenceDropdownForCustomSalrayDeduction = _t350;
  }
  selectOccurenceDropdownForHalfDaySalrayDeduction(_t395: string) {
    this.selectedOccurenceDropdownForHalfDaySalrayDeduction = _t395;
  }
  selectOccurenceDropdownForFullDaySalrayDeduction(_t439: string) {
    this.selectedOccurenceDropdownForFullDaySalrayDeduction = _t439;
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
  updateSelectedStaffs() {
    this.selectedStaffs = this.staffs.filter(staff => staff.selected);
    this.isAllSelected = this.selectedStaffs.length === this.staffs.length;

    for(let staff of this.selectedStaffs){
      if(this.selectedStaffsUuids.includes(staff.uuid)){
        continue;
      }
      this.selectedStaffsUuids.push(staff.uuid);
    }
    this.attendanceRuleDefinitionRequest.userUuids = this.selectedStaffsUuids;
    console.log(this.selectedStaffs);
  }

  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach(staff => staff.selected = checked);
    this.updateSelectedStaffs();
  }

  checkIndividualSelection() {
    this.isAllSelected = this.staffs.every(staff => staff.selected);
    this.updateSelectedStaffs();
  }


}
