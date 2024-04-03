import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserDto } from 'src/app/models/user-dto.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-leave-request-form',
  templateUrl: './leave-request-form.component.html',
  styleUrls: ['./leave-request-form.component.css']
})
export class LeaveRequestFormComponent implements OnInit {

  userLeaveForm: FormGroup;
  submitLeaveLoader: boolean = false; 
  userUuid!: string;
  currentNewDate = new Date().toISOString().split('T')[0]; 

  constructor(private fb: FormBuilder, private dataService: DataService) { 
    this.userLeaveForm = this.fb.group({
      startDate: ["", Validators.required],
        endDate: [""],
        leaveType: ["", Validators.required],
        managerId: ["", Validators.required],
        optNotes: ["", Validators.required],
        halfDayLeave: [false],
        dayShift: [false],
        eveningShift: [false],
    });
  }

  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get('userUuid');
    this.userUuid = userUuidParam?.toString() ?? '';
    this.fetchManagerNames();
    this.getUserLeaveReq();
  } 

  saveLeaveRequestForWhatsappUser() {
    if(this.userLeaveForm.invalid) {
      return; 
    }
    this.submitLeaveLoader = true;
    this.dataService.saveLeaveRequestFromWhatsapp(this.userUuid, this.userLeaveForm.value).subscribe({
      next: () => {
        this.submitLeaveLoader = false;
        this.userLeaveForm.reset();
        window.location.href = 'https://api.whatsapp.com/send/?phone=918799754156&type=phone_number&app_absent=0';
      },
      error: (error) => {
        this.submitLeaveLoader = false;
        console.error(error);
      }
      });
  }

  managers: UserDto[] = [];
  selectedManagerId!: number;

  fetchManagerNames() {
    this.dataService.getEmployeeManagerDetails(this.userUuid).subscribe(
      (data: UserDto[]) => {
        this.managers = data;
      },
      (error) => {
      }
    );
  }

  userLeave: any = [];
  getUserLeaveReq() {
    this.dataService.getUserLeaveRequests(this.userUuid).subscribe(
      (data) => {
        if (data.body != undefined || data.body != null || data.body.length != 0) {
          this.userLeave = data.body;
        }
      },
      (error) => {
      }
    );
  }

  halfLeaveShiftToggle() {
    this.userLeaveForm.patchValue({
      halfDayLeave: !this.userLeaveForm.value.halfDayLeave
    });
  }

  // halfDayLeaveShiftToggle: boolean = false;

  // halfLeaveShiftToggle() {
  //   this.halfDayLeaveShiftToggle = this.halfDayLeaveShiftToggle == true ? false : true;
  // }

  onShiftChange(shiftType: 'day' | 'evening') {
    // Update the form control values based on the shift type
    this.userLeaveForm.patchValue({
      halfDayLeave: true, // Ensure half-day leave is selected
      dayShift: shiftType === 'day', // True if day shift is selected, false otherwise
      eveningShift: shiftType === 'evening', // True if evening shift is selected, false otherwise
    });
  }
  
  

}