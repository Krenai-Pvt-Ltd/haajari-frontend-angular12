import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UserLeaveRequest } from 'src/app/models/user-leave-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-live-manager',
  templateUrl: './live-manager.component.html',
  styleUrls: ['./live-manager.component.css'],
})
export class LiveManagerComponent implements OnInit {
  userLeaveForm: FormGroup;
  constructor(
    private dataService: DataService,
    private router: Router,
    private fb: FormBuilder,
    private helperService: HelperService
  ) {
    this.userLeaveForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: [''],
      leaveType: ['', Validators.required],
      managerId: ['', Validators.required],
      optNotes: [''],
    });
  }

  get StartDate() {
    return this.userLeaveForm.get('startDate');
  }
  get EndDate() {
    return this.userLeaveForm.get('endDate');
  }
  get LeaveType() {
    return this.userLeaveForm.get('leaveType');
  }
  get ManagerId() {
    return this.userLeaveForm.get('managerId');
  }
  get OptNotes() {
    return this.userLeaveForm.get('optNotes');
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getUserLeaveReq();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
  }

  userLeaveRequest: UserLeaveRequest = new UserLeaveRequest();

  loginDetails = this.helperService.getDecodedValueFromToken();
  // role:string = this.loginDetails.role;
  // userUuid: string = this.loginDetails.uuid;
  // orgRefId:string = this.loginDetails.orgRefId;

  resetUserLeave() {
    this.userLeaveRequest.startDate = new Date();
    this.userLeaveRequest.endDate = new Date();
    this.userLeaveRequest.leaveType = '';
    this.userLeaveRequest.managerId = 0;
    this.userLeaveRequest.optNotes = '';
  }

  saveLeaveRequestUser() {
    this.userLeaveRequest.userId = this.getLoginDetailsOrgRefId();
    debugger;
    this.dataService
      .saveLeaveRequest('dfghjhgfdfbnm', this.userLeaveRequest, '')
      .subscribe(
        (data) => {
          debugger;
          // console.log(data);
          // console.log(data.body);
          this.resetUserLeave();
          this.requestLeaveCloseModel.nativeElement.click();
        },
        (error) => {
          console.log(error.body);
        }
      );
  }

  getLoginDetailsOrgRefId() {
    const loginDetails = localStorage.getItem('loginData');
    if (loginDetails !== null) {
      const loginData = JSON.parse(loginDetails);
      return loginData.id;
    }
  }

  @ViewChild('requestLeaveCloseModel')
  requestLeaveCloseModel!: ElementRef;

  userLeave: any = [];

  getUserLeaveReq() {
    debugger;
    this.dataService
      .getUserLeaveRequests(this.getLoginDetailsOrgRefId(),0,0)
      .subscribe(
        (data) => {
          this.userLeave = data.body;
          debugger;
          // console.log(this.userLeave);
        },
        (error) => {
          debugger;
          console.log(error);
        }
      );
  }
}
