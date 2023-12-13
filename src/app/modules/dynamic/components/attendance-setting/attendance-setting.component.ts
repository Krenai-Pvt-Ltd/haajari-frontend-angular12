import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AttendanceRuleDefinitionRequest } from 'src/app/models/attendance-rule-definition-request';
import { AttendanceRuleResponse } from 'src/app/models/attendance-rule-response';
import { DeductionType } from 'src/app/models/deduction-type';
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
    this.getRegisteredAttendanceRuleByOrganizationMethodCall();
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
    this.dataService.getRegisteredAttendanceRuleByOrganization().subscribe((response) => {
      console.log(response);
      this.registeredAttendanceRuleResponseList = response;
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

  getAttendanceRuleDefinitionMethodCall(){
    this.dataService.getAttendanceRuleDefinition(this.attendanceRuleResponse.id).subscribe((response) => {
      this.attendanceRuleDefinitionRequest = response;
      console.log(response);
    }, (error) =>{
      console.log(error);
    })
  }


  itemPerPage : number = 5;
  pageNumber : number = 1;
  total !: number;
  rowNumber : number = 1;
  searchText : string = '';
  users : User[] = [];

  getUserByFiltersMethodCall(){
    this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'').subscribe((response) => {
      this.users = response.users;
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

}
