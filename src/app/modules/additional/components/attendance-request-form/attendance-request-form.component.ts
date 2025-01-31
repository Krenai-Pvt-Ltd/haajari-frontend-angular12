import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { Key } from 'src/app/constant/key';
import { AttendanceCheckTimeResponse, AttendanceTimeUpdateRequestDto, UserDto } from 'src/app/models/user-dto.model';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-attendance-request-form',
  templateUrl: './attendance-request-form.component.html',
  styleUrls: ['./attendance-request-form.component.css']
})
export class AttendanceRequestFormComponent implements OnInit {



    attendanceTimeUpdateForm!: FormGroup;
    requestedDate!: Date;
    statusString!: string;
    attendanceRequestType: string = 'UPDATE';
    selectedDateAttendance!: Date;
    choosenDateString!: string;
    userId: any;
    updateStatusString: string = 'In';
    attendanceCheckTimeResponse: AttendanceCheckTimeResponse[] = [];
    managers: UserDto[] = [];
    @ViewChild('closeAttendanceUpdateModal') closeAttendanceUpdateModal!: ElementRef; 
    attendanceUpdateRequestLoader: boolean = false;
    selectedRequest: string = '';
    checkHoliday: boolean = false;
    checkAttendance: boolean = false;
    attendanceLoading: boolean = false;
    
  constructor( private fb: FormBuilder, private helperService: HelperService, private dataService : DataService, private activateRoute: ActivatedRoute, private datePipe: DatePipe) {

    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }

    // comment
    // this.userId = '731a011e-ae1e-11ee-9597-784f4361d885';

     this.attendanceTimeUpdateForm = this.fb.group({
          requestedDate: [null, Validators.required],
          attendanceRequestType: ['UPDATE', Validators.required], // Default to 'UPDATE'
          updateGroup: this.fb.group({
            requestType: [null, Validators.required],
            attendanceId: [null, Validators.required],
            updatedTime: [null, Validators.required],
          }),
          createGroup: this.fb.group({
            inRequestTime: [null, Validators.required],
            outRequestTime: [null, Validators.required],
          }),
          managerId: [null, Validators.required],
          requestReason: ['', [Validators.required, Validators.maxLength(255)]],
        });
    
   }

  ngOnInit(): void {
    this.fetchManagerNames();
  }
  


  onDateChange(date: Date | null): void {
    if (date && this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
      this.requestedDate = date;
      this.choosenDateString = this.helperService.formatDateToYYYYMMDD(date);
      this.statusString = this.attendanceTimeUpdateForm.get('updateGroup.requestType')?.value || '';
      this.getAttendanceChecktimeListDate(this.attendanceTimeUpdateForm.get('updateGroup.requestType')?.value);
    } else if (date && this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
      this.selectedDateAttendance = date;
      this.choosenDateString = this.helperService.formatDateToYYYYMMDD(date);
      console.log(" this.choosenDateString", this.choosenDateString);
      this.statusString = this.attendanceTimeUpdateForm.get('createGroup.requestType')?.value || '';
      this.getHolidayForOrganization(this.selectedDateAttendance);
      this.getAttendanceExistanceStatus(this.selectedDateAttendance);
    }
  }



  getHolidayForOrganization(selectedDate: any) {
    debugger
    this.checkHoliday = false;
    this.dataService.getHolidayForOrganizationWhatsapp(this.userId, this.helperService.formatDateToYYYYMMDD(selectedDate))
      .subscribe(
        (response) => {
          this.checkHoliday = response.object;
          console.log(response);
          console.error("Response", response.object);
        },
        (error) => {
          console.error('Error details:', error);
        }
      )
  }


  getAttendanceExistanceStatus(selectedDate: any) {
    debugger
    this.checkAttendance = false;
    this.dataService.getAttendanceExistanceStatus(this.userId, this.helperService.formatDateToYYYYMMDD(selectedDate))
      .subscribe(
        (response) => {
          this.checkAttendance = response.object;
          console.log(response);
          console.error("Response", response.object);
        },
        (error) => {
          console.error('Error details:', error);
        }
      )
  }


   
    getAttendanceChecktimeListDate(statusString: string): void {
      this.updateStatusString = statusString.charAt(0).toUpperCase() + statusString.slice(1).toLowerCase();
      const formattedDate = this.datePipe.transform(this.requestedDate, 'yyyy-MM-dd');

     // Reset attendanceId field when request type changes
      this.attendanceTimeUpdateForm.get('updateGroup.attendanceId')?.reset();
      this.dataService.getAttendanceChecktimeList(this.userId, formattedDate, statusString).subscribe(response => {
        this.attendanceCheckTimeResponse = response.listOfObject;
        // console.log('checktime retrieved successfully', response.listOfObject);
      }, (error) => {
        console.log(error);
      });
    }
  
    resetError() {
      if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
        this.checkAttendance = false;
      } else if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
        this.getAttendanceExistanceStatus(this.selectedDateAttendance);    
      }
      this.getHolidayForOrganization(this.selectedDateAttendance);
     
    }

      submitForm(): void {
        if (this.checkHoliday || this.checkAttendance) {
          return;
        }
        const formValue = this.attendanceTimeUpdateForm.value;
        let attendanceTimeUpdateRequest: AttendanceTimeUpdateRequestDto = {
          managerId: formValue.managerId,
          requestReason: formValue.requestReason
        };
    
        if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
          attendanceTimeUpdateRequest = {
            ...attendanceTimeUpdateRequest,
            attendanceId: formValue.updateGroup.attendanceId,
            updatedTime: formValue.updateGroup.updatedTime,
          };
        } else if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
          attendanceTimeUpdateRequest = {
            ...attendanceTimeUpdateRequest,
            selectedDateAttendance: formValue.createGroup.selectedDateAttendance,
            inRequestTime: formValue.createGroup.inRequestTime,
            outRequestTime: formValue.createGroup.outRequestTime
          };
        }
    
        this.attendanceUpdateRequestLoader = true;
        attendanceTimeUpdateRequest.userUuid = this.userId;
        attendanceTimeUpdateRequest.requestType = this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value;
        attendanceTimeUpdateRequest.choosenDateString = this.choosenDateString;
        this.dataService.sendAttendanceTimeUpdateRequestWhatsapp(attendanceTimeUpdateRequest, this.userId).subscribe(
          (response) => {
            // console.log('Request sent successfully', response);
            this.attendanceUpdateRequestLoader = false;
            console.log("retrive", response, response.status);
            if (response.status === true) {
              this.resetForm();
              // document.getElementById('attendanceUpdateModal')?.click();
              this.closeAttendanceUpdateModal.nativeElement.click();
              // this.attendanceRequestType = 'UPDATE';
              this.attendanceTimeUpdateForm.get('attendanceRequestType')?.setValue('UPDATE');
    
              // this.getAttendanceRequestLogData();
              this.helperService.showToast('Request Sent Successfully.', Key.TOAST_STATUS_SUCCESS);
            } else if (response.status === false) {
              // this.resetForm();
              // document.getElementById('attendanceUpdateModal')?.click();
              // this.getAttendanceRequestLogData();
              this.helperService.showToast('Request already registered!', Key.TOAST_STATUS_ERROR);
            }
            this.selectedRequest = '';
            this.updateStatusString = 'In';
          },
          (error) => {
            this.attendanceUpdateRequestLoader = false;
            console.error('Error sending request:', error);
          }
        );
        // }
      }
    
    emptySelectRequest() {
        this.selectedRequest = '';
    }


      
    resetForm(): void {
        this.attendanceTimeUpdateForm.reset();
    }
      
      
  
    disabledDate = (current: Date): boolean => {
      return moment(current).isAfter(moment(), 'day');
    }
  

  onRequestChange(value: string) {
    if (value === 'Attendance update') {
      // Trigger the hidden button to open the modal
      const attendanceUpdateButton = document.getElementById('attendanceUpdate');
      if (attendanceUpdateButton) {
        attendanceUpdateButton.click();
      }
    }
  }


  fetchManagerNames() {
    this.attendanceLoading = true;
    this.dataService.getEmployeeManagerDetailsViaWhatsapp(this.userId).subscribe(
      (data: UserDto[]) => {
        this.attendanceLoading = false;
        this.managers = data;
      },
      (error) => {
        this.attendanceLoading = false;
      }
    );
  }


  isAttendanceFormValid(): boolean {

    if (this.checkHoliday === true || this.checkAttendance === true) {
      return false;
    }
    if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
      const updateGroup = this.attendanceTimeUpdateForm.get('updateGroup');
      const managerId = this.attendanceTimeUpdateForm.get('managerId');
      const requestReason = this.attendanceTimeUpdateForm.get('requestReason');

      return (updateGroup ? updateGroup.valid : false) &&
        (managerId ? managerId.valid : false) &&
        (requestReason ? requestReason.valid : false);
    } else if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
      const createGroup = this.attendanceTimeUpdateForm.get('createGroup');
      const managerId = this.attendanceTimeUpdateForm.get('managerId');
      const requestReason = this.attendanceTimeUpdateForm.get('requestReason');

      return (createGroup ? createGroup.valid : false) &&
        (managerId ? managerId.valid : false) &&
        (requestReason ? requestReason.valid : false);
    }
    return false;
  }


}
