import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import moment from 'moment';
import { Key } from 'src/app/constant/key';
import { Routes } from 'src/app/constant/Routes';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { AttendanceCheckTimeResponse, AttendanceTimeUpdateRequestDto, UserDto } from 'src/app/models/user-dto.model';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-attendance-update',
  templateUrl: './attendance-update.component.html',
  styleUrls: ['./attendance-update.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceUpdateComponent implements OnInit {
  @Input() data: any; // Existing input for passing data
  @Input() isCreate: boolean = true; // New input to toggle between create and approve/reject mode
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  isModal: boolean = true;
  constructor(
    public roleService: RoleBasedAccessControlService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private helperService: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder // Added FormBuilder for form initialization
  ) { }

  userId: any = '';
  ROLE: any = '';
  attendanceTimeUpdateForm!: FormGroup;
  attendanceData: any = {};
  logInUserUuid: string = '';

  readonly Routes = Routes;
  readonly StatusKeys =StatusKeys;
  async ngOnInit(): Promise<void> {

    this.userId = this.roleService.getUuid();
    this.ROLE = this.roleService.getRoles();
    this.logInUserUuid = await this.roleService.getUUID();

    this.initializeForm();
    this.fetchManagerNames();
    this.isModal=this.data.isModal;
    if (!this.isCreate) {
      if(this.data){
        this.attendanceData = this.data.attendanceRequest;
      }
      this.userId = this.attendanceData.userUuid;

      // this.userId = '731a011e-ae1e-11ee-9597-784f4361d885';
      this.fetchAttendanceDataForReview(); // Fetch data for review mode
      this.attendanceTimeUpdateForm.disable(); // Disable form in review mode
    }
  }

  // Initialize the form with controls
  initializeForm(): void {
    this.attendanceTimeUpdateForm = this.fb.group({
      requestedDate: [null, Validators.required],
      attendanceRequestType: ['UPDATE'],
      updateGroup: this.fb.group({
        requestType: ['', Validators.required],
        attendanceId: ['', Validators.required],
        updatedTime: [null, Validators.required],
      }),
      createGroup: this.fb.group({
        inRequestTime: [null , Validators.required],
        outRequestTime: [null , Validators.required],
      }),
      managerId: ['', Validators.required],
      requestReason: ['', Validators.required],
    });
  }

  // Demo function to fetch data for review mode (replace with actual API call)
  fetchAttendanceDataForReview(): void {
    if (this.attendanceData) {
      this.managers.push({ id: this.attendanceData.managerId, name: this.attendanceData.managerName });
      this.cdr.detectChanges();
      this.cdr.markForCheck();
      const formData = {
        requestedDate: this.attendanceData.selectedDateAttendance ? new Date(this.attendanceData.selectedDateAttendance) : this.attendanceData.inRequestTime,

        attendanceRequestType: this.attendanceData.requestType || 'CREATE',
        updateGroup: {
          requestType: this.attendanceData.requestType === 'UPDATE' ? this.attendanceData.requestOf : '',
          attendanceId: this.attendanceData.attendanceId || '',
          updatedTime: this.attendanceData.updatedTime ? new Date(this.attendanceData.updatedTime) : null,
        },
        createGroup: {
          inRequestTime: this.attendanceData.inRequestTime ? new Date(this.attendanceData.inRequestTime) : null,
          outRequestTime: this.attendanceData.outRequestTime ? new Date(this.attendanceData.outRequestTime) : null,
        },
        managerId: this.attendanceData.managerId || '',
        requestReason: this.attendanceData.requestReason || ''
      };


      this.attendanceTimeUpdateForm.patchValue(formData);

      if (this.attendanceData.requestType === 'UPDATE') {
        this.updateStatusString = this.attendanceData.requestType.charAt(0).toUpperCase() + this.attendanceData.requestType.slice(1).toLowerCase();
      }
    }
  }

  selectedRequest: string = '';
  requestedDate!: Date;
  statusString!: string;
  attendanceRequestType: string = 'UPDATE';
  selectedDateAttendance!: Date;
  choosenDateString!: string;

  emptySelectRequest() {
    this.selectedRequest = '';
  }

  resetError() {
    if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
      this.checkAttendance = false;
    } else if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
      this.getAttendanceExistanceStatus(this.selectedDateAttendance);
    }
    this.getHolidayForOrganization(this.selectedDateAttendance);
  }

  managers: UserDto[] = [];
  fetchManagerNames() {
    this.dataService.getEmployeeManagerDetails(this.userId).subscribe(
      (data: UserDto[]) => {
        this.managers = data;
      },
      (error) => {
        console.error(error);
      }
    );
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
      this.statusString = this.attendanceTimeUpdateForm.get('createGroup.requestType')?.value || '';
      this.getHolidayForOrganization(this.selectedDateAttendance);
      this.getAttendanceExistanceStatus(this.selectedDateAttendance);
    }
  }

  disabledDate = (current: Date): boolean => {
    return moment(current).isAfter(moment(), 'day');
  };

  checkAttendance: boolean = false;
  getAttendanceExistanceStatus(selectedDate: any) {
    this.checkAttendance = false;
    this.dataService.getAttendanceExistanceStatus(this.userId, this.helperService.formatDateToYYYYMMDD(selectedDate))
      .subscribe(
        (response) => {
          this.checkAttendance = response.object;
        },
        (error) => {
          console.error('Error details:', error);
        }
      );
  }

  checkHoliday: boolean = false;
  getHolidayForOrganization(selectedDate: any) {
    this.checkHoliday = false;
    this.dataService.getHolidayForOrganization(this.helperService.formatDateToYYYYMMDD(selectedDate))
      .subscribe(
        (response) => {
          this.checkHoliday = response.object;
        },
        (error) => {
          console.error('Error details:', error);
        }
      );
  }

  updateStatusString: string = 'In';
  attendanceCheckTimeResponse: AttendanceCheckTimeResponse[] = [];
  getAttendanceChecktimeListDate(statusString: string): void {
    this.updateStatusString = statusString.charAt(0).toUpperCase() + statusString.slice(1).toLowerCase();
    const formattedDate = this.datePipe.transform(this.requestedDate, 'yyyy-MM-dd');
    this.attendanceTimeUpdateForm.get('updateGroup.attendanceId')?.reset();
    this.dataService.getAttendanceChecktimeList(this.userId, formattedDate, statusString).subscribe(
      (response) => {
        this.attendanceCheckTimeResponse = response.listOfObject;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  isAttendanceFormValid(): boolean {
    if (this.checkHoliday === true || this.checkAttendance === true) {
      return false;
    }
    const requestedDate = this.attendanceTimeUpdateForm.get('requestedDate');
    if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'UPDATE') {
      const updateGroup = this.attendanceTimeUpdateForm.get('updateGroup');
      const managerId = this.attendanceTimeUpdateForm.get('managerId');
      const requestReason = this.attendanceTimeUpdateForm.get('requestReason');
      return (updateGroup ? updateGroup.valid : false) && (requestedDate ? requestedDate.valid : false) &&
        (managerId ? managerId.valid : false) &&
        (requestReason ? requestReason.valid : false);
    } else if (this.attendanceTimeUpdateForm.get('attendanceRequestType')?.value === 'CREATE') {
      const createGroup = this.attendanceTimeUpdateForm.get('createGroup');
      const managerId = this.attendanceTimeUpdateForm.get('managerId');
      const requestReason = this.attendanceTimeUpdateForm.get('requestReason');
      return (createGroup ? createGroup.valid : false) && (requestedDate ? requestedDate.valid : false) &&
        (managerId ? managerId.valid : false) &&
        (requestReason ? requestReason.valid : false);
    }
    return false;
  }

  resetForm(): void {
    this.attendanceTimeUpdateForm.reset();
  }

  @ViewChild('closeAttendanceUpdateModal') closeAttendanceUpdateModal!: ElementRef;
  attendanceUpdateRequestLoader: boolean = false;

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
    this.dataService.sendAttendanceTimeUpdateRequest(attendanceTimeUpdateRequest).subscribe(
      (response) => {
        this.attendanceUpdateRequestLoader = false;
        if (response.status === true) {
          this.resetForm();
          this.closeAttendanceUpdateModal.nativeElement.click();
          this.attendanceTimeUpdateForm.get('attendanceRequestType')?.setValue('UPDATE');
          this.helperService.showToast('Request Sent Successfully.', Key.TOAST_STATUS_SUCCESS);
        } else if (response.status === false) {
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
  }

  // Approve or Reject actions for review mode
  approveRequest(): void {
    // Implement approve logic (e.g., API call)
    this.helperService.showToast('Request Approved Successfully.', Key.TOAST_STATUS_SUCCESS);
    this.closeAttendanceUpdateModal.nativeElement.click();
  }

  rejectRequest(): void {
    // Implement reject logic (e.g., API call)
    this.helperService.showToast('Request Rejected.', Key.TOAST_STATUS_ERROR);
    this.closeAttendanceUpdateModal.nativeElement.click();
  }

  @ViewChild('closeButton') closeButton!: ElementRef ;
  approveLoader: boolean = false;
  rejectLoader: boolean = false;
  approveOrReject(id: number, reqString: string) {
    if (reqString == 'APPROVED') {
      this.approveLoader = true;
    } else if (reqString == 'REJECTED') {
      this.rejectLoader = true;
    }
    this.dataService.approveOrRejectAttendanceRequest(id, reqString).subscribe(response => {
      this.approveLoader = false;
      this.rejectLoader = false;
      // console.log('requests retrieved successfully', response.listOfObject);
      if (response.status && reqString == 'APPROVED') {
        this.helperService.showToast(
          'Request Approved Successfully.',
          Key.TOAST_STATUS_SUCCESS
        );

        this.attendanceData.status = 'APPROVED';
        this.cdr.detectChanges();
      } else if (response.status && reqString == 'REJECTED') {
        this.helperService.showToast(
          'Request Rejected Successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
        this.attendanceData.status = 'REJECTED';
        this.cdr.detectChanges();
      }
      if(this.isModal){
        this.closeButton.nativeElement.click();
        this.closeModal.emit();
      }
      this.cdr.markForCheck();
    }, error => {
      this.approveLoader = false;
      this.rejectLoader = false;
      console.error('Error details:', error);
    }
    );
  }
}
