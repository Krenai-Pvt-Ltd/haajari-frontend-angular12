import { DatePipe } from '@angular/common';
import {
  Directive,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  NgForm,
  NgModel,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { findLastKey } from 'lodash';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Key } from 'src/app/constant/key';
import { Holiday } from 'src/app/models/Holiday';
import { ShiftCounts } from 'src/app/models/ShiftCounts';
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
import { OrganizationWeekoffInformation } from 'src/app/models/organization-weekoff-information';
import { OvertimeSettingRequest } from 'src/app/models/overtime-setting-request';
import { OvertimeSettingResponse } from 'src/app/models/overtime-setting-response';
import { OvertimeType } from 'src/app/models/overtime-type';
import { ShiftType } from 'src/app/models/shift-type';
import { Staff } from 'src/app/models/staff';
import { User } from 'src/app/models/user';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PlacesService } from 'src/app/services/places.service';
declare var google: any;
@Component({
  selector: 'app-attendance-setting',
  templateUrl: './attendance-setting.component.html',
  styleUrls: ['./attendance-setting.component.css'],
})
export class AttendanceSettingComponent implements OnInit {
  organizationAddressDetail: OrganizationAddressDetail =
    new OrganizationAddressDetail();

  readonly OVERTIME_RULE = Key.OVERTIME_RULE;

  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
    public helperService: HelperService,
    private fb: FormBuilder,
    private router: Router,
    private el: ElementRef,
    private placesService: PlacesService
  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getTeamNames();
    this.loadHolidayCounts();
    this.loadHolidays();
    this.getOrganizationAddressDetailMethodCall();
    this.getAttendanceModeMethodCall();
    this.getAllShiftTimingsMethodCall();
    this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();
    this.updateDuration();
    this.loadAllShiftCounts();
    // this.getCurrentLocation();
    if (localStorage.getItem('staffSelectionActive') == 'true') {
      this.activeModel = true;
    }

    this.getUniversalHolidays();
    this.getCustomHolidays();
    this.getWeeklyHolidays();
    this.getWeekDays();
    this.getPreHourOvertimeSettingResponseMethodCall();
    this.getPostHourOvertimeSettingResponseMethodCall();
  }

  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholdersMethodCall() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  isShimmerForAttendanceRule = false;
  dataNotFoundPlaceholderForAttendanceRule = false;
  networkConnectionErrorPlaceHolderForAttendanceRule = false;
  preRuleForShimmersAndErrorPlaceholdersForAttendanceRuleWithDefinitionMethodCall() {
    this.isShimmerForAttendanceRule = true;
    this.dataNotFoundPlaceholderForAttendanceRule = false;
    this.networkConnectionErrorPlaceHolderForAttendanceRule = false;
  }

  //input for selecting duration:
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);
  selectedHours: number = 0;
  selectedMinutes: number = 0;
  duration: string = '';
  selectedTime: string = '20:00';
  readonly DEDUCTION_TYPE_PER_MINUTE = Key.DEDUCTION_TYPE_PER_MINUTE;
  readonly OVERTIME_TYPE_FIXED_AMOUNT = Key.OVERTIME_TYPE_FIXED_AMOUNT;

  disabledHours(): number[] {
    return Array.from({ length: 24 }, (_, i) => i).filter((hour) => hour > 3);
  }

  selectHours(hour: number) {
    this.selectedHours = hour;
  }

  selectMinutes(minute: number) {
    this.selectedMinutes = minute;
  }

  updateDuration(): void {
    const formattedHours = this.selectedHours.toString().padStart(2, '0');
    const formattedMinutes = this.selectedMinutes.toString().padStart(2, '0');

    this.duration = `${formattedHours}:${formattedMinutes}`;
  }

  // onTimeChange(salaryDeduction: any) {
  //   salaryDeduction.updateDuration();
  // }

  customCheckbox: boolean = true;
  halfDayCheckbox: boolean = false;
  fullDayCheckbox: boolean = false;

  tickCustomCheckbox() {
    this.customCheckbox = !this.customCheckbox;
    this.invalidCustomlateDuration1 = false;
    this.invalidCustomlateDuration2 = false;
  }

  tickHalfDayCheckbox() {
    this.halfDayCheckbox = !this.halfDayCheckbox;
    this.invalidHalfDaylateDuration1 = false;
    this.invalidHalfDaylateDuration2 = false;
  }

  tickFullDayCheckbox() {
    this.fullDayCheckbox = !this.fullDayCheckbox;
    this.invalidFullDaylateDuration1 = false;
    this.invalidFullDaylateDuration2 = false;
  }

  customOccurrenceCheckbox: boolean = false;
  halfDayOccurrenceCheckbox: boolean = false;
  fullDayOccurrenceCheckbox: boolean = false;

  tickCustomOccurrenceCheckbox() {
    this.customOccurrenceCheckbox = !this.customOccurrenceCheckbox;
  }

  tickHalfDayOccurrenceCheckbox() {
    this.halfDayOccurrenceCheckbox = !this.halfDayOccurrenceCheckbox;
  }

  tickFullDayOccurrenceCheckbox() {
    this.fullDayOccurrenceCheckbox = !this.fullDayOccurrenceCheckbox;
    // console.log('Form Valid:', this.attendanceRuleForm.valid);
    // console.log('Custom Checkbox:', this.customCheckbox);
    // console.log('Half Day Checkbox:', this.halfDayCheckbox);
    // console.log('Full Day Checkbox:', this.fullDayCheckbox);
    // console.log('Selected Deduction Type:', this.selectedDeductionType?.type);
    // console.log('Selected Overtime Type:', this.selectedOvertimeType?.type);
    // console.log('Compare Times Validation:', this.compareTimesValidation());
  }

  @ViewChild('attendanceRuleForm') attendanceRuleForm!: NgForm;
  @ViewChild('lateDuration') lateDurationControl!: NgModel;

  clearAttendanceRuleDefinitionModal() {
    this.attendanceRuleForm.resetForm();
    this.invalidCustomlateDuration1 = false;
    this.invalidCustomlateDuration2 = false;
    this.invalidHalfDaylateDuration1 = false;
    this.invalidHalfDaylateDuration2 = false;
    this.invalidFullDaylateDuration1 = false;
    this.invalidFullDaylateDuration2 = false;

    this.customCheckbox = true;
    this.halfDayCheckbox = false;
    this.fullDayCheckbox = false;

    this.customOccurrenceCheckbox = false;
    this.halfDayOccurrenceCheckbox = false;
    this.fullDayOccurrenceCheckbox = false;

    this.customLateDurationValue = null;
    this.halfDayLateDurationValue = null;
    this.fullDayLateDurationValue = null;

    this.customOvertimeDurationValue = null;
    this.halfDayOvertimeDurationValue = null;
    this.fullDayOvertimeDurationValue = null;

    this.activeModel2 = false;

    // if (this.lateDurationControl) {
    //   // Set the control as untouched
    //   this.lateDurationControl.control.markAsUntouched();
    //   // Also consider resetting the form control to clear validation errors
    //   this.lateDurationControl.control.reset();
    // }
  }

  attendanceRuleResponseList: AttendanceRuleResponse[] = [];
  getAttendanceRuleByOrganizationMethodCall() {
    this.dataService.getAttendanceRuleByOrganization().subscribe(
      (response) => {
        this.attendanceRuleResponseList = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  registeredAttendanceRuleResponseList: AttendanceRuleResponse[] = [];
  getRegisteredAttendanceRuleByOrganizationMethodCall() {
    this.dataService.getRegisteredAttendanceRuleByOrganization().subscribe(
      (response) => {
        // console.log(response);
        this.registeredAttendanceRuleResponseList = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  DEDUCTION_RULE_DEFINITION = Key.DEDUCTION_RULE_DEFINITION;
  OVERTIME_RULE_DEFINITION = Key.OVERTIME_RULE_DEFINITION;
  CURRENT_MODAL = Key.DEDUCTION_RULE_DEFINITION;

  attendanceRuleResponse: AttendanceRuleResponse = new AttendanceRuleResponse();
  openAttendanceRuleResponseModal(
    attendanceRuleResponse: AttendanceRuleResponse
  ) {
    this.clearModal();
    this.CURRENT_MODAL = attendanceRuleResponse.attendanceRuleTypeId;

    this.attendanceRuleResponse = attendanceRuleResponse;
    this.attendanceRuleDefinitionRequest.attendanceRuleId =
      attendanceRuleResponse.id;
    this.attendanceRuleDefinitionRequest.attendanceRuleTypeId =
      attendanceRuleResponse.attendanceRuleTypeId;
    this.getUserByFiltersMethodCall();
    this.getDeductionTypeMethodCall();
    this.getOvertimeTypeMethodCall();
  }

  activeModel2: boolean = false;
  @ViewChild('attendanceRuleDefinitionModalClose')
  attendanceRuleDefinitionModalClose!: ElementRef;
  @ViewChild('addAttendanceRuleDefinitionModalClose')
  addAttendanceRuleDefinitionModalClose!: ElementRef;
  attendanceRuleDefinitionRequest: AttendanceRuleDefinitionRequest =
    new AttendanceRuleDefinitionRequest();
  saveAttendanceRuleDefinitionLoading: boolean = false;

  registerAttendanceRuleDefinitionMethodCall() {
    this.saveAttendanceRuleDefinitionLoading = true;
    this.attendanceRuleDefinitionRequest.userUuids = this.selectedStaffsUuids;
    // console.log(this.selectedStaffsUuids);
    this.preRegisterAttendanceRuleDefinitionMethodCall();

    this.dataService
      .registerAttendanceRuleDefinition(this.attendanceRuleDefinitionRequest)
      .subscribe(
        (response) => {
          localStorage.removeItem('staffSelectionActive');
          this.addAttendanceRuleDefinitionModalClose.nativeElement.click();
          this.activeModel2 = false;
          this.saveAttendanceRuleDefinitionLoading = false;
          this.helperService.showToast(
            'Attendance rule registered successfully',
            Key.TOAST_STATUS_SUCCESS
          );
          this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();
        },
        (error) => {
          console.log(error);
          this.saveAttendanceRuleDefinitionLoading = false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  preRegisterAttendanceRuleDefinitionMethodCall() {}

  attendanceRuleDefinitionResponseList: AttendanceRuleDefinitionResponse[] = [];
  getAttendanceRuleDefinitionMethodCall(attendanceRuleId: number) {
    this.dataService.getAttendanceRuleDefinition(attendanceRuleId).subscribe(
      (response) => {
        this.attendanceRuleDefinitionResponseList = response;
        // console.log(this.attendanceRuleDefinitionResponseList);
      },
      (error) => {
        console.log(error);
        this.networkConnectionErrorPlaceHolderForAttendanceRule = true;
      }
    );
  }

  showToastMessage: boolean = false;

  deleteAttendanceRuleTemplateLoader(id: any): boolean {
    return this.deleteAttendanceRuleLoaderStatus[id] || false;
  }

  deleteAttendanceRuleLoaderStatus: { [key: string]: boolean } = {};
  deleteAttendanceRuleDefinitionMethodCall(
    attendanceRuleDefinitionId: number,
    attendanceRuleTypeId: number
  ) {
    this.deleteAttendanceRuleLoaderStatus[attendanceRuleDefinitionId] = true;
    this.dataService
      .deleteAttendanceRuleDefinition(
        attendanceRuleDefinitionId,
        attendanceRuleTypeId
      )
      .subscribe(
        (response) => {
          // console.log(response);
          this.deleteAttendanceRuleLoaderStatus[attendanceRuleDefinitionId] =
            false;
          this.helperService.showToast(
            'Attendance rule settings deleted successfully',
            Key.TOAST_STATUS_SUCCESS
          );
          this.getAttendanceRuleWithAttendanceRuleDefinitionMethodCall();
        },
        (error) => {
          console.log(error);
          this.deleteAttendanceRuleLoaderStatus[attendanceRuleDefinitionId] =
            false;
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  customLateDurationValue!: Date | null;
  halfDayLateDurationValue!: Date | null;
  fullDayLateDurationValue!: Date | null;

  customOvertimeDurationValue!: Date | null;
  halfDayOvertimeDurationValue!: Date | null;
  fullDayOvertimeDurationValue!: Date | null;

  attendanceRuleDefinitionResponse: AttendanceRuleDefinitionResponse =
    new AttendanceRuleDefinitionResponse();
  updateAttendanceRuleDefinition(
    attendanceRuleDefinitionResponse: AttendanceRuleDefinitionResponse,
    attendanceRuleResponse: AttendanceRuleResponse,
    automationIndex: number
  ) {
    this.CURRENT_MODAL = attendanceRuleResponse.attendanceRuleTypeId;

    this.ruleActiveTab.nativeElement.click();

    this.activeModel = true;
    this.activeModel2 = true;

    this.attendanceRuleResponse = attendanceRuleResponse;

    this.mapAttendanceRuleDefinitionResponseToAttendanceRuleDefinitionRequest(
      this.attendanceRuleDefinitionRequest,
      attendanceRuleDefinitionResponse
    );
    this.selectedStaffsUuids = attendanceRuleDefinitionResponse.userUuids;

    if (
      attendanceRuleDefinitionResponse.attendanceRuleTypeId ==
      this.DEDUCTION_RULE_DEFINITION
    ) {
      if (
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
          .customSalaryDeduction.lateDuration
      ) {
        this.customLateDurationValue = this.convertTimeStringToDate(
          attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
            .customSalaryDeduction.lateDuration
        );
        this.customCheckbox = true;
      }

      if (
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
          .halfDaySalaryDeduction.lateDuration
      ) {
        this.halfDayLateDurationValue = this.convertTimeStringToDate(
          attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
            .halfDaySalaryDeduction.lateDuration
        );
        this.halfDayCheckbox = true;
      }

      if (
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
          .fullDaySalaryDeduction.lateDuration
      ) {
        this.fullDayLateDurationValue = this.convertTimeStringToDate(
          attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
            .fullDaySalaryDeduction.lateDuration
        );
        this.fullDayCheckbox = true;
      }

      if (
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
          .customSalaryDeduction.occurrenceCount > 0
      ) {
        this.customOccurrenceCheckbox = true;
      }

      if (
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
          .halfDaySalaryDeduction.occurrenceCount > 0
      ) {
        this.halfDayOccurrenceCheckbox = true;
      }

      if (
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
          .fullDaySalaryDeduction.occurrenceCount > 0
      ) {
        this.fullDayOccurrenceCheckbox = true;
      }

      this.getDeductionTypeMethodCall();
      this.selectCustomDeductionType(
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse
          .deductionType
      );
    }

    if (
      attendanceRuleDefinitionResponse.attendanceRuleTypeId ==
      this.OVERTIME_RULE_DEFINITION
    ) {
      if (
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse
          .customDuration
      ) {
        this.customOvertimeDurationValue = this.convertTimeStringToDate(
          attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse
            .customDuration
        );
        this.customCheckbox = true;
      }

      if (
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse
          .halfDayDuration
      ) {
        this.halfDayOvertimeDurationValue = this.convertTimeStringToDate(
          attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse
            .halfDayDuration
        );
        this.halfDayCheckbox = true;
      }

      if (
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse
          .fullDayDuration
      ) {
        this.fullDayOvertimeDurationValue = this.convertTimeStringToDate(
          attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse
            .fullDayDuration
        );
        this.fullDayCheckbox = true;
      }

      this.getOvertimeTypeMethodCall();
      this.selectCustomOvertimeType(
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse
          .customOvertimeType
      );
      this.selectHalfDayOvertimeType(
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse
          .halfDayOvertimeType
      );
      this.selectFullDayOvertimeType(
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse
          .fullDayOvertimeType
      );
    }

    this.getUserByFiltersMethodCall();

    this.activeIndex5 = automationIndex;
  }

  mapAttendanceRuleDefinitionResponseToAttendanceRuleDefinitionRequest(
    attendanceRuleDefinitionRequest: AttendanceRuleDefinitionRequest,
    attendanceRuleDefinitionResponse: AttendanceRuleDefinitionResponse
  ) {
    attendanceRuleDefinitionRequest.id = attendanceRuleDefinitionResponse.id;
    attendanceRuleDefinitionRequest.attendanceRuleId =
      attendanceRuleDefinitionResponse.attendanceRuleId;
    attendanceRuleDefinitionRequest.attendanceRuleTypeId =
      attendanceRuleDefinitionResponse.attendanceRuleTypeId;

    if (
      attendanceRuleDefinitionRequest.attendanceRuleTypeId ==
      this.DEDUCTION_RULE_DEFINITION
    ) {
      attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest.customSalaryDeduction =
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse.customSalaryDeduction;
      attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest.halfDaySalaryDeduction =
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse.halfDaySalaryDeduction;
      attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest.fullDaySalaryDeduction =
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse.fullDaySalaryDeduction;
      attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest.deductionTypeId =
        attendanceRuleDefinitionResponse.deductionRuleDefinitionResponse.deductionType.id;
    }

    if (
      attendanceRuleDefinitionRequest.attendanceRuleTypeId ==
      this.OVERTIME_RULE_DEFINITION
    ) {
      attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.customDuration =
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse.customDuration;
      attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.halfDayDuration =
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse.halfDayDuration;
      attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.fullDayDuration =
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse.fullDayDuration;

      attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.customOvertimeTypeId =
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse.customOvertimeType.id;
      attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.halfDayOvertimeTypeId =
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse.halfDayOvertimeType.id;
      attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.fullDayOvertimeTypeId =
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse.fullDayOvertimeType.id;

      attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.customAmountInRupees =
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse.customAmountInRupees;
      attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.halfDayAmountInRupees =
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse.halfDayAmountInRupees;
      attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.fullDayAmountInRupees =
        attendanceRuleDefinitionResponse.overtimeRuleDefinitionResponse.fullDayAmountInRupees;
    }
  }

  customDuration: string = '';
  halfDayDuration: string = '';
  fullDayDuration: string = '';

  customOvertimeTypeId: number = 0;
  halfDayOvertimeTypeId: number = 0;
  fullDayOvertimeTypeId: number = 0;

  customAmountInRupees: number = 0;
  halfDayAmountInRupees: number = 0;
  fullDayAmountInRupees: number = 0;

  formatDurationToDate(duration: string) {
    this.convertTimeStringToDate(duration);
  }

  // set late duration
  time1!: Date;
  invalidCustomlateDuration1: boolean = false;
  invalidCustomlateDuration2: boolean = false;
  getlateDuration(event: Date, attendanceRuleTypeId: number) {
    let duration = this.helperService.formatDateToHHmmss(event);

    if (attendanceRuleTypeId == this.DEDUCTION_RULE_DEFINITION) {
      this.attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest.customSalaryDeduction.lateDuration =
        duration;
      this.time1 = this.convertTimeStringToDate(
        this.attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest
          .customSalaryDeduction.lateDuration
      );
    } else {
      this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.customDuration =
        duration;
      this.time1 = this.convertTimeStringToDate(
        this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
          .customDuration
      );
    }

    this.invalidCustomlateDuration1 = false;
    this.invalidCustomlateDuration2 = false;
    this.invalidHalfDaylateDuration1 = false;
    this.invalidFullDaylateDuration1 = false;
    this.invalidFullDaylateDuration2 = false;

    if (
      this.customCheckbox &&
      this.halfDayCheckbox &&
      this.time1 > this.time2
    ) {
      this.invalidCustomlateDuration1 = true;
    } else if (
      this.customCheckbox &&
      this.fullDayCheckbox &&
      this.time1 > this.time3
    ) {
      this.invalidCustomlateDuration2 = true;
    }
  }

  invalidHalfDaylateDuration1: boolean = false;
  invalidHalfDaylateDuration2: boolean = false;
  time2!: Date;
  getHalfDaylateDuration(event: Date, attendanceRuleTypeId: number) {
    let duration = this.helperService.formatDateToHHmmss(event);

    if (attendanceRuleTypeId == this.DEDUCTION_RULE_DEFINITION) {
      this.attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest.halfDaySalaryDeduction.lateDuration =
        duration;
      this.time2 = this.convertTimeStringToDate(
        this.attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest
          .halfDaySalaryDeduction.lateDuration
      );
    } else {
      this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.halfDayDuration =
        duration;
      this.time2 = this.convertTimeStringToDate(
        this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
          .halfDayDuration
      );
    }

    this.invalidCustomlateDuration1 = false;
    this.invalidCustomlateDuration2 = false;
    this.invalidHalfDaylateDuration1 = false;
    this.invalidHalfDaylateDuration2 = false;
    this.invalidFullDaylateDuration1 = false;
    this.invalidFullDaylateDuration2 = false;
    if (
      this.customCheckbox &&
      this.halfDayCheckbox &&
      this.time1 > this.time2
    ) {
      this.invalidHalfDaylateDuration1 = true;
    } else if (
      this.halfDayCheckbox &&
      this.halfDayCheckbox &&
      this.time2 > this.time3
    ) {
      this.invalidHalfDaylateDuration2 = true;
    }
  }

  invalidFullDaylateDuration1: boolean = false;
  invalidFullDaylateDuration2: boolean = false;
  time3!: Date;
  getFullDaylateDuration(event: Date, attendanceRuleTypeId: number) {
    let duration = this.helperService.formatDateToHHmmss(event);

    if (attendanceRuleTypeId == this.DEDUCTION_RULE_DEFINITION) {
      this.attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest.fullDaySalaryDeduction.lateDuration =
        duration;
      this.time3 = this.convertTimeStringToDate(
        this.attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest
          .fullDaySalaryDeduction.lateDuration
      );
    } else {
      this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.fullDayDuration =
        duration;
      this.time3 = this.convertTimeStringToDate(
        this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
          .fullDayDuration
      );
    }

    this.invalidCustomlateDuration1 = false;
    this.invalidCustomlateDuration2 = false;
    this.invalidHalfDaylateDuration2 = false;
    this.invalidFullDaylateDuration1 = false;
    this.invalidFullDaylateDuration2 = false;

    if (
      this.halfDayCheckbox &&
      this.fullDayCheckbox &&
      this.time2 > this.time3
    ) {
      this.invalidFullDaylateDuration1 = false;
      this.invalidFullDaylateDuration2 = true;
    } else if (
      this.customCheckbox &&
      this.fullDayCheckbox &&
      this.time1 > this.time3
    ) {
      this.invalidFullDaylateDuration2 = false;
      this.invalidFullDaylateDuration1 = true;
    }
  }

  compareTimesValidation(): boolean {
    if (
      this.invalidCustomlateDuration1 ||
      this.invalidCustomlateDuration2 ||
      this.invalidHalfDaylateDuration1 ||
      this.invalidHalfDaylateDuration2 ||
      this.invalidFullDaylateDuration1 ||
      this.invalidFullDaylateDuration2
    ) {
      return true;
    }
    return false;
  }

  // Fix Amount Validation for Overtime rule
  CUSTOM_OVERTIME_FIX_AMOUNT_STEP = Key.CUSTOM_OVERTIME_FIX_AMOUNT_STEP;
  HALF_DAY_OVERTIME_FIX_AMOUNT_STEP = Key.HALF_DAY_OVERTIME_FIX_AMOUNT_STEP;
  FULL_DAY_OVERTIME_FIX_AMOUNT_STEP = Key.FULL_DAY_OVERTIME_FIX_AMOUNT_STEP;

  invalidCustomOvertimeFixAmount: boolean = false;
  invalidHalfDayOvertimeFixAmount: boolean = false;
  invalidFullDayOvertimeFixAmount: boolean = false;

  overtimeFixAmountValidationErrors: { [key: string]: string } = {};

  checkOvertimeFixAmountValidation(OVERTIME_FIX_AMOUNT: number) {
    this.overtimeFixAmountValidationErrors = {};

    if (OVERTIME_FIX_AMOUNT == this.CUSTOM_OVERTIME_FIX_AMOUNT_STEP) {
      if (
        this.selectedHalfDayOvertimeType.id == Key.FIX_AMOUNT_STEP &&
        this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
          .customAmountInRupees >
          this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
            .halfDayAmountInRupees
      ) {
        this.overtimeFixAmountValidationErrors[
          'CUSTOM_OVERTIME_FIX_AMOUNT_ERROR'
        ] = 'It must be less than halfday pay.';
      } else if (
        this.selectedFullDayOvertimeType.id == Key.FIX_AMOUNT_STEP &&
        this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
          .customAmountInRupees >
          this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
            .fullDayAmountInRupees
      ) {
        this.overtimeFixAmountValidationErrors[
          'CUSTOM_OVERTIME_FIX_AMOUNT_ERROR'
        ] = 'It must be less than fullday pay.';
      }
    } else if (OVERTIME_FIX_AMOUNT == this.HALF_DAY_OVERTIME_FIX_AMOUNT_STEP) {
      if (
        this.selectedCustomOvertimeType.id == Key.FIX_AMOUNT_STEP &&
        this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
          .halfDayAmountInRupees <
          this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
            .customAmountInRupees
      ) {
        this.overtimeFixAmountValidationErrors[
          'HALF_DAY_OVERTIME_FIX_AMOUNT_ERROR'
        ] = 'It must be greater than custom pay.';
      } else if (
        this.selectedFullDayOvertimeType.id == Key.FIX_AMOUNT_STEP &&
        this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
          .halfDayAmountInRupees >
          this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
            .fullDayAmountInRupees
      ) {
        this.overtimeFixAmountValidationErrors[
          'HALF_DAY_OVERTIME_FIX_AMOUNT_ERROR'
        ] = 'It must be less than fullday pay.';
      }
    } else {
      if (
        this.selectedCustomOvertimeType.id == Key.FIX_AMOUNT_STEP &&
        this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
          .fullDayAmountInRupees <
          this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
            .customAmountInRupees
      ) {
        this.overtimeFixAmountValidationErrors[
          'FULL_DAY_OVERTIME_FIX_AMOUNT_ERROR'
        ] = 'It must be greater than custom pay.';
      } else if (
        this.selectedHalfDayOvertimeType.id == Key.FIX_AMOUNT_STEP &&
        this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
          .fullDayAmountInRupees <
          this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
            .halfDayAmountInRupees
      ) {
        this.overtimeFixAmountValidationErrors[
          'FULL_DAY_OVERTIME_FIX_AMOUNT_ERROR'
        ] = 'It must be greater than halfday pay.';
      }
    }

    if (
      this.invalidCustomOvertimeFixAmount ||
      this.invalidHalfDayOvertimeFixAmount ||
      this.invalidFullDayOvertimeFixAmount
    ) {
      return true;
    } else {
      return false;
    }
  }

  compareTimesForOvertimeRuleDefinition() {
    const time1 = this.convertTimeStringToDate(
      this.attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest
        .customSalaryDeduction.lateDuration
    );
    const time2 = this.convertTimeStringToDate(
      this.attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest
        .halfDaySalaryDeduction.lateDuration
    );
    // const time3 = this.convertStringToDate(this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.lateDuration);

    if (time1 < time2) {
      console.log('Time 1 is earlier than Time 2');
    } else if (time2 < time1) {
      console.log('Time 1 is later than Time 2');
    } else {
      console.log('Time 1 is equal to Time 2');
    }
  }

  compareTimesForDeductionRuleDefinition() {
    const time1 = this.convertTimeStringToDate(
      this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
        .customDuration
    );
    const time2 = this.convertTimeStringToDate(
      this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest
        .halfDayDuration
    );
    // const time3 = this.convertStringToDate(this.attendanceRuleDefinitionRequest.fullDaySalaryDeduction.lateDuration);

    if (time1 < time2) {
      console.log('Time 1 is earlier than Time 2');
    } else if (time2 < time1) {
      console.log('Time 1 is later than Time 2');
    } else {
      console.log('Time 1 is equal to Time 2');
    }
  }

  convertTimeStringToDate(timeString: string): Date {
    if (timeString == null || timeString == undefined) {
      return this.convertTimeStringToDate('00:00:00');
    }

    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);

    return date;
  }

  getAttendanceRuleDefinitionByIdMethodCall() {
    this.dataService
      .getAttendanceRuleDefinitionById(this.attendanceRuleDefinitionResponse.id)
      .subscribe(
        (response) => {
          // console.log(response);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  count: number = 0;
  attendanceRuleWithAttendanceRuleDefinitionResponseList: AttendanceRuleWithAttendanceRuleDefinitionResponse[] =
    [];
  attendanceRuleWithAttendanceRuleDefinitionLoading: boolean = false;
  getAttendanceRuleWithAttendanceRuleDefinitionMethodCall() {
    debugger;
    this.preRuleForShimmersAndErrorPlaceholdersForAttendanceRuleWithDefinitionMethodCall();
    this.dataService.getAttendanceRuleWithAttendanceRuleDefinition().subscribe(
      (response) => {
        if (
          response == null ||
          response == undefined ||
          response.listOfObject == null ||
          response.listOfObject == undefined ||
          response.listOfObject.length == 0
        ) {
          this.dataNotFoundPlaceholderForAttendanceRule = true;
        } else {
          this.attendanceRuleWithAttendanceRuleDefinitionResponseList =
            response.listOfObject;
        }
        if (this.count === 0) {
          this.activeIndex5 = 0;
          this.count++;
        }
      },
      (error) => {
        console.log(error);
        this.networkConnectionErrorPlaceHolderForAttendanceRule = true;
      }
    );
  }

  itemPerPage: number = 8;
  pageNumber: number = 1;
  lastPageNumber: number = 0;
  total!: number;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];

  // getUserByFiltersMethodCall(){
  //   this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc','id',this.searchText,'').subscribe((response) => {
  //     ;
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

  searchUsers() {
    this.getUserByFiltersMethodCall();
  }

  deductionTypeList: DeductionType[] = [];
  getDeductionTypeMethodCall() {
    this.dataService.getDeductionType().subscribe(
      (response) => {
        this.deductionTypeList = response;
        // console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  overtimeTypeList: OvertimeType[] = [];
  getOvertimeTypeMethodCall() {
    this.dataService.getOvertimeType().subscribe(
      (response) => {
        this.overtimeTypeList = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectedCustomDeductionType: DeductionType = new DeductionType();
  selectedHalfDayDeductionType: DeductionType = new DeductionType();
  selectedFullDayDeductionType: DeductionType = new DeductionType();

  selectCustomDeductionType(deductionType: DeductionType) {
    this.selectedCustomDeductionType = deductionType;
    this.attendanceRuleDefinitionRequest.deductionRuleDefinitionRequest.deductionTypeId =
      deductionType.id;

    // const res = document.getElementById('amount-in-rupees') as HTMLElement;
    // res.style.display = this.selectedDeductionType?.type === "FIXED AMOUNT" ? 'block' : 'none';
  }

  selectHalfDayDeductionType(deductionType: DeductionType) {
    this.selectedHalfDayDeductionType = deductionType;
  }

  selectFullDayDeductionType(deductionType: DeductionType) {
    this.selectedFullDayDeductionType = deductionType;
  }

  selectedCustomOvertimeType: OvertimeType = new OvertimeType();
  selectedHalfDayOvertimeType: OvertimeType = new OvertimeType();
  selectedFullDayOvertimeType: OvertimeType = new OvertimeType();

  selectCustomOvertimeType(overtimeType: OvertimeType) {
    this.selectedCustomOvertimeType = overtimeType;
    this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.customOvertimeTypeId =
      overtimeType.id;

    // const res = document.getElementById('amount-in-rupees') as HTMLElement;
    // res.style.display = this.selectedOvertimeType?.type === "FIXED AMOUNT" ? 'block' : 'none';
  }

  selectHalfDayOvertimeType(overtimeType: OvertimeType) {
    this.selectedHalfDayOvertimeType = overtimeType;
    this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.halfDayOvertimeTypeId =
      overtimeType.id;
  }

  selectFullDayOvertimeType(overtimeType: OvertimeType) {
    this.selectedFullDayOvertimeType = overtimeType;
    this.attendanceRuleDefinitionRequest.overtimeRuleDefinitionRequest.fullDayOvertimeTypeId =
      overtimeType.id;
  }

  //Extra
  countDurationDropdownList: string[] = ['Count', 'Duration'];
  // selectedCountDurationDropdown : string = '';
  selectedOccurenceDropdownForCustomSalrayDeduction: string = 'Count';
  selectedOccurenceDropdownForHalfDaySalrayDeduction: string = 'Count';
  selectedOccurenceDropdownForFullDaySalrayDeduction: string = 'Count';

  // selectCountDurationDropdown(countDurationDropdown: string) {
  //   this.selectedCountDurationDropdown = countDurationDropdown;
  // }

  //User selection in staff selection tab
  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;
  totalUserCount: number = 0;
  getUserByFiltersMethodCall() {
    debugger;
    // this.staffs = [];
    this.dataService
      .getUsersByFilter(
        this.itemPerPage,
        this.pageNumber,
        'asc',
        'id',
        this.searchText,
        '',
        this.selectedTeamId
      )
      .subscribe(
        (response) => {
          this.staffs = response.users.map((staff: Staff) => ({
            ...staff,
            selected: this.selectedStaffsUuids.includes(staff.uuid),
          }));
          if (this.selectedTeamId == 0 && this.searchText == '') {
            this.totalUserCount = response.count;
          }
          this.total = response.count;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
          this.pageNumber = Math.min(this.pageNumber, this.lastPageNumber);
          this.isAllSelected = this.staffs.every((staff) => staff.selected);

          console.log(this.staffs);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  checkIndividualSelection() {
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
  }

  checkAndUpdateAllSelected() {
    this.isAllSelected =
      this.staffs.length > 0 && this.staffs.every((staff) => staff.selected);
    this.isAllUsersSelected = this.selectedStaffsUuids.length === this.total;
  }

  updateSelectedStaffs() {
    this.staffs.forEach((staff) => {
      if (staff.selected && !this.selectedStaffsUuids.includes(staff.uuid)) {
        this.selectedStaffsUuids.push(staff.uuid);
      } else if (
        !staff.selected &&
        this.selectedStaffsUuids.includes(staff.uuid)
      ) {
        this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
          (uuid) => uuid !== staff.uuid
        );
      }
    });

    this.checkAndUpdateAllSelected();

    this.activeModel2 = true;

    if (this.selectedStaffsUuids.length === 0) {
      this.activeModel2 = false;
    }
  }

  // #####################################################
  isAllUsersSelected: boolean = false;

  selectAllUsers(event: any) {
    const isChecked = event.target.checked;
    this.isAllUsersSelected = isChecked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked));

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffsUuids list
      this.activeModel2 = true;
      this.getAllUserUuidsMethodCall().then((allUuids) => {
        this.selectedStaffsUuids = allUuids;
      });
    } else {
      this.selectedStaffsUuids = [];
      this.activeModel2 = false;
    }
  }

  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffsUuids based on the current page selection
    if (checked) {
      this.activeModel2 = true;
      this.staffs.forEach((staff) => {
        if (!this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids.push(staff.uuid);
        }
      });
    } else {
      this.staffs.forEach((staff) => {
        if (this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
            (uuid) => uuid !== staff.uuid
          );
        }
      });
    }
  }

  // Asynchronous function to get all user UUIDs
  async getAllUsersUuids(): Promise<string[]> {
    // Replace with your actual API call to get all users
    const response = await this.dataService
      .getAllUsers('asc', 'id', this.searchText, '')
      .toPromise();
    return response.users.map((user: { uuid: any }) => user.uuid);
  }

  // Fetching all the uuids of the users by organization
  allUserUuids: string[] = [];
  async getAllUserUuidsMethodCall() {
    return new Promise<string[]>((resolve, reject) => {
      this.dataService.getAllUserUuids().subscribe({
        next: (response) => {
          this.allUserUuids = response.listOfObject;
          resolve(this.allUserUuids);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  // Call this method when the select all users checkbox  changes
  onSelectAllUsersChange(event: any) {
    this.selectAllUsers(event.target.checked);
  }

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffsUuids = [];
    this.activeModel2 = false;
  }

  activeModel: boolean = false;
  trueActiveModel() {
    this.activeModel = true;
    localStorage.setItem('staffSelectionActive', this.activeModel.toString());
  }

  clearModal() {
    this.ruleActiveTab.nativeElement.click();
    this.attendanceRuleDefinitionRequest =
      new AttendanceRuleDefinitionRequest();
    this.clearSearchText();

    this.activeModel = false;
    this.activeModel2 = false;

    this.selectedCustomDeductionType = new DeductionType();
    this.selectedHalfDayDeductionType = new DeductionType();
    this.selectedFullDayDeductionType = new DeductionType();
    this.selectedCustomOvertimeType = new OvertimeType();
    this.selectedHalfDayOvertimeType = new OvertimeType();
    this.selectedFullDayOvertimeType = new OvertimeType();
    this.selectedStaffsUuids = [];
  }

  @ViewChild('ruleActiveTab') ruleActiveTab!: ElementRef;

  ruleActiveTabMethod() {
    this.ruleActiveTab.nativeElement.click();
  }

  @ViewChild('staffActiveTabInAutomationRule')
  staffActiveTabInAutomationRule!: ElementRef;

  staffActiveTabInAutomationRuleMethod() {
    debugger;
    if (this.attendanceRuleForm.invalid) {
    }
    this.staffActiveTabInAutomationRule.nativeElement.click();
    this.trueActiveModel();
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

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }

  // #########################################################

  clearSearchText() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }

  @ViewChild('closeShiftTimingModal') closeShiftTimingModal!: ElementRef;

  registerOrganizationShiftTimingMethodCall() {
    debugger;
    // this.submitWeeklyHolidays();
    this.organizationShiftTimingRequest.userUuids = this.selectedStaffsUuids;
    // Prepare data for submission
    this.organizationShiftTimingRequest.weekdayInfos = this.weekDay
      .filter((day) => day.selected)
      .map((day) => ({
        weeklyOffDay: day.name,
        isAlternateWeekoff: day.isAlternate,
        weekOffType: day.weekOffType,
        userUuids: this.selectedStaffsUuids,
      }));
      console.log("InTime: " + this.organizationShiftTimingRequest.inTime);
    this.dataService
      .registerShiftTiming(this.organizationShiftTimingRequest)
      .subscribe(
        (response) => {
          // console.log(response);
          this.closeShiftTimingModal.nativeElement.click();
          this.getAllShiftTimingsMethodCall();
          this.selectedTeamName = 'All';
          this.getUserByFiltersMethodCall();
          this.helperService.showToast(
            'Shift Timing registered successfully',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          console.log(error);
          this.helperService.showToast(
            'Shift Timing not registered successfully',
            Key.TOAST_STATUS_ERROR
          );
        }
      );
  }

  clearShiftTimingModel() {
    this.shiftTimingActiveTab.nativeElement.click();
    this.organizationShiftTimingRequest = new OrganizationShiftTimingRequest();
    this.selectedShiftType = new ShiftType();
    this.clearSearchText();
    this.teamId = 0;
    this.selectedTeamId = 0;
    this.selectedTeamName = 'All';
    this.selectedStaffsUuids = [];
    this.pageNumber = 1;
  }
  organizationShiftTimingRequest: OrganizationShiftTimingRequest =
    new OrganizationShiftTimingRequest();

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

    // Helper function to convert Date object to minutes from start of the day in local time
    const dateToLocalMinutes = (date: Date | undefined) => {
        if (!date) return 0;
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const hours = localDate.getHours();
        const minutes = localDate.getMinutes();
        return hours * 60 + minutes;
    };

    // Convert times to local minutes
    const inTimeMinutes = dateToLocalMinutes(inTime);
    const outTimeMinutes = dateToLocalMinutes(outTime);
    const startLunchMinutes = dateToLocalMinutes(startLunch);
    const endLunchMinutes = dateToLocalMinutes(endLunch);

    // Check for valid in and out times
    if (inTime && outTime) {
        if (outTimeMinutes <= inTimeMinutes) {
            this.organizationShiftTimingValidationErrors['outTime'] = 'Out time must be after in time.';
        } else {
            const totalWorkedMinutes = outTimeMinutes - inTimeMinutes;
            this.organizationShiftTimingRequest.workingHour = this.formatMinutesToTime(totalWorkedMinutes);
        }
    }

    // Check for valid lunch start time
    if (startLunch && (startLunchMinutes <= inTimeMinutes || startLunchMinutes >= outTimeMinutes)) {
        this.organizationShiftTimingValidationErrors['startLunch'] = 'Lunch time should be within in and out times.';
    }

    // Check for valid lunch end time
    if (endLunch && (endLunchMinutes <= inTimeMinutes || endLunchMinutes >= outTimeMinutes)) {
        this.organizationShiftTimingValidationErrors['endLunch'] = 'Lunch time should be within in and out times.';
    }

    // Calculate lunch hour and adjust working hours if lunch times are valid
    if (startLunch && endLunch && startLunchMinutes < endLunchMinutes) {
        const lunchBreakMinutes = endLunchMinutes - startLunchMinutes;
        this.organizationShiftTimingRequest.lunchHour = this.formatMinutesToTime(lunchBreakMinutes);

        if (this.organizationShiftTimingRequest.workingHour) {
            const workingHourMinutes = this.organizationShiftTimingRequest.workingHour.split(':').map(Number);
            const totalWorkingMinutes = workingHourMinutes[0] * 60 + workingHourMinutes[1];
            const adjustedWorkedMinutes = totalWorkingMinutes - lunchBreakMinutes;
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

// Helper method to format minutes into HH:mm format
formatMinutesToTime(minutes: number): string {
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
    return (
      Object.keys(this.organizationShiftTimingValidationErrors).length === 0
    );
  }

  @ViewChild('staffActiveTabInShiftTiming')
  staffActiveTabInShiftTiming!: ElementRef;

  isWeekOffFlag: boolean = true;

  @ViewChild('weekOffActiveTab') weekOffActiveTab!: ElementRef;

  staffActiveTabInShiftTimingMethod() {
    if (this.isValidForm()) {
      this.activeTab = 'staffselection';
      if (this.isWeekOffFlag) {
        this.weekOffActiveTab.nativeElement.click();
        this.isStaffSelectionFlag = true;
        this.isWeekOffFlag = false;
      }
    } else {
      if (this.isStaffSelectionFlag) {
        this.staffActiveTabInShiftTiming.nativeElement.click();
      }
    }
  }

  @ViewChild('shiftTimingActiveTab') shiftTimingActiveTab!: ElementRef;
  isStaffSelectionFlag: boolean = false;
  activeTab = 'shiftime';
  shiftTimingActiveTabMethod() {
    this.shiftTimingActiveTab.nativeElement.click();
    this.isStaffSelectionFlag = false;
    this.activeTab = 'shiftime';
  }
  weekOffActiveTabMethod() {
    this.activeTab = 'weeklyOff';
  }

  organizationShiftTimingWithShiftTypeResponseList: OrganizationShiftTimingWithShiftTypeResponse[] =
    [];
  getAllShiftTimingsMethodCall() {
    debugger;
    this.preRuleForShimmersAndErrorPlaceholdersMethodCall();

    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;

    this.dataService.getAllShiftTimings().subscribe(
      (response) => {
        console.log(response);
        this.organizationShiftTimingWithShiftTypeResponseList = response;
        if (
          this.organizationShiftTimingWithShiftTypeResponseList.length === 0
        ) {
          this.isShimmer = false;
          this.dataNotFoundPlaceholder = true;
        }
        if (this.organizationShiftTimingWithShiftTypeResponseList.length == 1) {
          this.activeIndex = 0;
        }
        console.log(response[0].organizationShiftTimingResponseList);
        // Iterate through each item in the response array
        this.organizationShiftTimingWithShiftTypeResponseList.forEach(
          (item) => {
            // Check if organizationShiftTimingResponseList is defined and not empty
            if (
              item.organizationShiftTimingResponseList &&
              item.organizationShiftTimingResponseList.length > 0
            ) {
              // Iterate through each shift in the organizationShiftTimingResponseList
              item.organizationShiftTimingResponseList.forEach((shift) => {
                shift.inTimeDate = shift.inTime;
                shift.outTimeDate = shift.outTime;
                shift.startLunchDate = shift.startLunch;
                shift.endLunchDate = shift.endLunch;
                console.log(shift.inTime, shift.outTime);
              });
            }
          }
        );

        // console.log(this.organizationShiftTimingWithShiftTypeResponseList);
        // this.isShimmer = false;
        // this.dataNotFoundPlaceholder = true;
      },
      (error) => {
        console.log(error);
        // this.isShimmer = false;
        this.isShimmer = false;
        this.dataNotFoundPlaceholder = false;
        this.networkConnectionErrorPlaceHolder = true;
      }
    );
  }

  shiftTypeList: ShiftType[] = [];
  getShiftTypeMethodCall() {
    debugger;
    this.dataService.getAllShiftType().subscribe(
      (response) => {
        this.shiftTypeList = response;
        // console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectedShiftType: ShiftType = new ShiftType();

  selectShiftType(shiftType: ShiftType) {
    this.selectedShiftType = shiftType;
    this.organizationShiftTimingRequest.shiftTypeId = shiftType.id;
  }

  // ##############################################################
  openAddShiftTimeModal() {
    this.getWeekDays();
    this.getShiftTypeMethodCall();
    this.getUserByFiltersMethodCall();
    this.clearShiftTimingModel();
  }

  updateOrganizationShiftTiming(
    organizationShiftTimingResponse: OrganizationShiftTimingResponse,
    tab: string
  ) {
    // this.shiftTimingActiveTab.nativeElement.click();
    this.weekDay = organizationShiftTimingResponse.weekDayResponse;

    this.organizationShiftTimingRequest = organizationShiftTimingResponse;
    this.organizationShiftTimingRequest.shiftTypeId =
      organizationShiftTimingResponse.shiftType.id;
    this.selectedStaffsUuids = organizationShiftTimingResponse.userUuids;

    // this.getWeekDays();

    this.getShiftTypeMethodCall();
    this.selectedShiftType = organizationShiftTimingResponse.shiftType;
    this.teamId = 0;
    this.selectedTeamId = 0;
    this.selectedTeamName = 'All';
    this.getUserByFiltersMethodCall();

    setTimeout(() => {
      if (tab == 'STAFF_SELECTION') {
        this.staffActiveTabInShiftTimingMethod();
      }
    }, 0);
  }

  deleteOrganizationShiftTimingMethodCall(organizationShiftTimingId: number) {
    this.dataService
      .deleteOrganizationShiftTiming(organizationShiftTimingId)
      .subscribe(
        (response) => {
          // console.log(response);
          this.getAllShiftTimingsMethodCall();
          this.helperService.showToast(
            'Shift timing deleted successfully',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          console.log(error);
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }

  attendanceModeList: AttendanceMode[] = [];
  getAttendanceModeAllMethodCall() {
    this.isShimmer = true;
    this.dataService.getAttendanceModeAll().subscribe(
      (response) => {
        this.attendanceModeList = response;
        // console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // Modal

  @ViewChild('attendancewithlocationssButton')
  attendancewithlocationssButton!: ElementRef;
  updateAttendanceModeMethodCall(attendanceModeId: number) {
    this.dataService.updateAttendanceMode(attendanceModeId).subscribe(
      (response) => {
        // console.log(response);
        if (attendanceModeId == 1) {
          this.getAttendanceModeMethodCall();
        }
        if (attendanceModeId == 2 || attendanceModeId == 3) {
          this.attendancewithlocationssButton.nativeElement.click();
        }
        setTimeout(() => {
          if (attendanceModeId == 1) {
            this.helperService.showToast(
              'Attedance Mode updated successfully.',
              Key.TOAST_STATUS_SUCCESS
            );
          }
          // console.log("Second line executed after 3 seconds");
        }, 1000);
      },
      (error) => {
        console.log(error);
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  selectedAttendanceModeId: number = 0;
  getAttendanceModeMethodCall() {
    this.isShimmer = true;
    this.getOrganizationAddressDetailMethodCall();
    this.dataService.getAttendanceMode().subscribe(
      (response) => {
        this.selectedAttendanceModeId = response.id;
        this.getAttendanceModeAllMethodCall();
        // console.log(this.selectedAttendanceModeId);
      },
      (error) => {
        console.log(error);
      }
    );
  }
  toggle = false;
  @ViewChild('closeAddressModal') closeAddressModal!: ElementRef;
  setOrganizationAddressDetailMethodCall() {
    this.toggle = true;
    this.dataService
      .setOrganizationAddressDetail(this.organizationAddressDetail)
      .subscribe(
        (response: OrganizationAddressDetail) => {
          // console.log(response);
          this.getAttendanceModeMethodCall();
          this.toggle = false;
          this.closeAddressModal.nativeElement.click();
          this.helperService.showToast(
            'Attedance Mode updated successfully',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          console.error(error);
        }
      );
  }
  @ViewChild('placesRef') placesRef!: GooglePlaceDirective;

  public handleAddressChange(e: any) {
    var id = this.organizationAddressDetail.id;
    this.organizationAddressDetail = new OrganizationAddressDetail();
    this.organizationAddressDetail.id = id;
    this.lat = e.geometry.location.lat();
    this.lng = e.geometry.location.lng();
    this.organizationAddressDetail.longitude = e.geometry.location.lng();
    this.organizationAddressDetail.latitude = e.geometry.location.lat();

    // console.log(e.geometry.location.lat());
    // console.log(e.geometry.location.lng());
    // this.organizationAddressDetail.addressLine1 = e.name + ', ' + e.vicinity;
    this.organizationAddressDetail.addressLine1 =
      e.formatted_address.toString();
    e?.address_components?.forEach((entry: any) => {
      // console.log(entry);

      if (entry.types?.[0] === 'route') {
        this.organizationAddressDetail.addressLine2 = entry.long_name + ',';
      }
      if (entry.types?.[0] === 'sublocality_level_1') {
        this.organizationAddressDetail.addressLine2 =
          this.organizationAddressDetail.addressLine2 + entry.long_name;
      }
      if (entry.types?.[0] === 'locality') {
        this.organizationAddressDetail.city = entry.long_name;
      }
      if (entry.types?.[0] === 'administrative_area_level_1') {
        this.organizationAddressDetail.state = entry.long_name;
      }
      if (entry.types?.[0] === 'country') {
        this.organizationAddressDetail.country = entry.long_name;
      }
      if (entry.types?.[0] === 'postal_code') {
        this.organizationAddressDetail.pincode = entry.long_name;
      }
    });
  }

  isShowMap: boolean = false;
  getOrganizationAddressDetailMethodCall() {
    debugger;
    this.dataService.getOrganizationAddressDetail().subscribe(
      (response: OrganizationAddressDetail) => {
        if (response) {
          // console.log(response);
          this.organizationAddressDetail = response;
          console.log(this.organizationAddressDetail.latitude);
          if (this.organizationAddressDetail.latitude == null) {
            this.currentLocation();
          } else {
            this.lat = Number(this.organizationAddressDetail.latitude);
            this.lng = Number(this.organizationAddressDetail.longitude);
            this.isShowMap = true;
          }
          // if(this.organizationAddressDetail.latitude & this.organizationAddressDetail.longitude){
          //   this.organizationAddressDetail.latitude = this.lat;
          //   this.organizationAddressDetail.longitude = this.lat
          // }
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

  isHolidayErrorPlaceholder: boolean = false;
  universalHolidays: UniversalHoliday[] = [];

  getUniversalHolidays() {
    this.dataService.getUniversalHolidays().subscribe({
      next: (holidays) => {
        this.universalHolidays = holidays;
      },
      error: (error) => {
        this.isHolidayErrorPlaceholder = true;
        console.error('Error fetching universal holidays:', error);
      },
    });
  }

  customHolidays: CustomHolidays[] = [];

  getCustomHolidays() {
    this.dataService.getCustomHolidays().subscribe({
      next: (holidays) => {
        this.customHolidays = holidays;
      },
      error: (error) => {
        this.isHolidayErrorPlaceholder = true;
        console.error('Error fetching custom holidays:', error);
      },
    });
  }

  isWeeklyHolidayErrorPlaceholder: boolean = false;
  weeklyHolidays: WeeklyHoliday[] = [];

  getWeeklyHolidays() {
    this.dataService.getWeeklyHolidays().subscribe(
      (holidays) => {
        this.weeklyHolidays = holidays;
        this.getWeekDays();
      },
      (error) => {
        this.isWeeklyHolidayErrorPlaceholder = true;
        console.error('Error fetching custom holidays:', error);
      }
    );
  }

  weekDay: WeekDay[] = [];

  // getWeekDays() {
  //
  //   this.dataService.getWeekDays().subscribe(holidays => {
  //     this.weekDay = holidays;
  //     console.log(this.weekDay);
  //   });
  // }

  // getWeekDays() {
  //   this.dataService.getWeekDays().subscribe((holidays) => {
  //     this.weekDay = holidays.map((day) => ({
  //       ...day,
  //       selected: day.selected === 1,
  //     }));
  //     console.log(this.weekDay);
  //   });
  // }
  getWeekDays() {
    this.dataService.getWeekDays().subscribe((holidays) => {
      this.weekDay = holidays.map((day) => ({
        ...day,
        selected: false, // Explicitly set selected to false
        isAlternate: false, // Ensure isAlternate is also set to false by default
        weekOffType: 0, // Set weekOffType to default value, if needed
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

  // submitWeeklyHolidays() {
  //   const selectedWeekDays = this.weekDay
  //                             .filter(day => day.selected)
  //                             .map(day => day.name);

  //    this.submitWeeklyHolidaysLoader=true;
  //   this.dataService.registerWeeklyHolidays(selectedWeekDays).subscribe({
  //     next: (response) => {
  //       // console.log('Weekly holidays registered successfully', response);
  //       this.getWeeklyHolidays();
  //       this.submitWeeklyHolidaysLoader=false;
  //       this.closeWeeklyHolidayModal.nativeElement.click();
  //     },
  //     error: (error) => {
  //       this.submitWeeklyHolidaysLoader=false;
  //       console.error('Failed to register weekly holidays', error);
  //     }
  //   });
  // }

  toggleSelection(i: number): void {
    this.weekDay[i].selected = !this.weekDay[i].selected;

    // Automatically set isAlternate to false when a day is selected
    this.weekDay[i].isAlternate = false;
  }

  toggleAlternate(i: number, isAlternate: boolean): void {
    debugger;
    this.weekDay[i].isAlternate = isAlternate;
    this.weekDay[i].weekOffType = 1;

    // Reset weekOffType to 0 when "All" is selected
    if (!isAlternate) {
      this.weekDay[i].weekOffType = 0;
    }
  }

  // toggleAlternate(shiftIndex: number, dayIndex: number, isAlternate: boolean): void {
  //   const shift = this.organizationShiftTimingWithShiftTypeResponseList[shiftIndex];
  //   const day = shift.organizationShiftTimingResponseList[0].weekDayResponse[dayIndex];

  //   day.isAlternate = isAlternate;
  //   day.weekOffType = isAlternate ? 1 : 0;  // Reset weekOffType to 0 when "All" is selected
  // }

  organizationWeekoffInformation: OrganizationWeekoffInformation[] = [];
  submitWeeklyHolidaysLoader: boolean = false;
  @ViewChild('closeWeeklyHolidayModal') closeWeeklyHolidayModal!: ElementRef;
  submitWeeklyHolidays() {
    debugger;
    this.submitWeeklyHolidaysLoader = true;

    // Prepare data for submission
    this.organizationWeekoffInformation = this.weekDay
      .filter((day) => day.selected)
      .map((day) => ({
        weeklyOffDay: day.name,
        isAlternateWeekoff: day.isAlternate,
        weekOffType: day.weekOffType,
        userUuids: this.selectedStaffsUuids,
      }));

    // Submit the data
    this.dataService
      .updateOrganizationWeekOff(this.organizationWeekoffInformation)
      .subscribe({
        next: (response) => {
          // Handle success, fetch new data if needed, hide loader, and close modal
          this.getWeeklyHolidays();
          this.submitWeeklyHolidaysLoader = false;
          this.closeWeeklyHolidayModal.nativeElement.click();
        },
        error: (error) => {
          // Handle error, hide loader
          this.submitWeeklyHolidaysLoader = false;
          console.error('Failed to register weekly holidays', error);
        },
      });
  }

  deleteWeeklyHolidays(id: number) {
    this.dataService.deleteWeeklyHolidays(id).subscribe(
      (response) => {
        // console.log(response);
        // alert('Weekly holiday deleted successfully');
        this.getWeeklyHolidays();
      },
      (error) => {
        console.error('Error deleting weekly holiday:', error);
      }
    );
  }

  deleteCustomHolidays(id: number) {
    debugger
    this.dataService.deleteCustomHolidays(id).subscribe(
      (response) => {
        // console.log(response);
        this.holidays = [];
        this.loadHolidays();
      },
      (error) => {
        console.error('Error deleting weekly holiday:', error);
      }
    );
  }

  formatDateIn(newdate: any) {
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

  isCustomHolidayLoader: boolean = false;
  @ViewChild('customHolidayModal') customHolidayModal!: ElementRef;
  registerCustomHolidays() {
    // console.log(this.holidayList);
    this.isCustomHolidayLoader = true;
    this.dataService.registerCustomHolidays(this.holidayList).subscribe({
      next: (response) => {
        // console.log('Custom Holidays Registered Successfully', response)
        this.holidays = [];
        this.page = 0;
        this.loadHolidays();
        this.loadHolidayCounts();
        this.isCustomHolidayLoader = false;
        this.holidayList = [{ name: '', date: '' }];
        this.customHolidayModal.nativeElement.click();
      },
      error: (error) => {
        this.isCustomHolidayLoader = false;
        console.error('Error registering custom holidays:', error);
      },
    });
  }

  // isDateGreaterThanToday(date: string): boolean {
  //   let today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   let compareDate = new Date(date);

  //   return compareDate > today;
  // }

  isDateGreaterThanToday(date: Date): boolean {
    const today = new Date();
    const todayStr = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const compareDate = new Date(date);

    return compareDate > todayStr;
  }

  //#######################################################################

  submitAttendanceRuleForm() {
    debugger;
    this.attendanceRuleForm;
  }

  viewAllHolidaySection: boolean = false;

  toggleViewAllHolidaySection() {
    this.viewAllHolidaySection = !this.viewAllHolidaySection;
  }

  viewAllShiftTiming: boolean = false;

  toggleViewAllShiftTiming() {
    this.viewAllShiftTiming = !this.viewAllShiftTiming;
  }

  //  get holidays

  holidays: Holiday[] = [];
  totalMoreHolidays = 0;
  page = 0;
  itemsPerPage = 6;
  isLoading = false;
  totalCount: number = 0;
  isInitialLoading: boolean = false;
  isMoreHolidayLoader: boolean = false;

  @ViewChild('holidayListContainer') holidayListContainer!: ElementRef;
  loadHolidays() {
    this.isMoreHolidayLoader = true;

    this.dataService.getHolidays(this.page, this.itemsPerPage).subscribe({
      next: (data: Holiday[]) => {
        this.holidays = this.holidays.concat(data);
        this.totalMoreHolidays =
          this.totalHolidaysNumber - this.holidays.length;
        // console.log('count + ' + this.totalMoreHolidays);
        this.isMoreHolidayLoader = false;
      },
      error: (error) => {
        console.error('Failed to fetch holidays', error);
        this.isMoreHolidayLoader = false;
      },
    });
  }

  onScroll(event: any) {
    debugger;
    if (!this.isInitialLoading) return;
    const target = event.target as HTMLElement;
    const atBottom =
      target.scrollHeight - (target.scrollTop + target.clientHeight) <= 10;

    if (atBottom && this.totalMoreHolidays > 0) {
      this.page++;
      this.loadHolidays();
    }
  }

  loadMoreHolidaysBoolean: boolean = false;
  loadMoreHolidays() {
    this.loadMoreHolidaysBoolean = true;
    this.isInitialLoading = true;
    this.openLoadMoreHoliday = false;
    this.page++;
    this.loadHolidays();
    setTimeout(() => {
      this.scrollToBottom();
    }, 500);
  }

  openLoadMoreHoliday: boolean = false;
  hideHolidays() {
    this.loadMoreHolidaysBoolean = false;
    this.openLoadMoreHoliday = true;
    this.page = 0;
    this.holidays = [];
    this.loadHolidays();
  }
  scrollToBottom() {
    if (this.holidayListContainer) {
      this.holidayListContainer.nativeElement.scrollTop =
        this.holidayListContainer.nativeElement.scrollHeight;
    }
  }

  totalHolidaysNumber: number = 0;
  universalHolidaysNumber: number = 0;
  customHolidaysNumber: number = 0;

  // holidayCounts: { [key: string]: number } | null = null;
  loadHolidayCounts() {
    debugger;
    this.dataService.getHolidayCounts().subscribe({
      next: (response) => {
        if (response.status) {
          this.totalHolidaysNumber = response.object.total || 0;
          this.universalHolidaysNumber = response.object.Universal || 0;
          this.customHolidaysNumber = response.object.Custom || 0;
        } else {
          console.error('Failed to load holiday counts:', response.message);
        }
      },
      error: (error) => {
        console.error('Error fetching holiday counts:', error);
      },
    });
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  shiftCounts!: ShiftCounts;
  totalShiftCount!: number;
  loadAllShiftCounts() {
    this.dataService.getOrganizationAllShiftCounts().subscribe({
      next: (response) => {
        if (response.status) {
          this.shiftCounts = response.object;
          this.totalShiftCount =
            this.shiftCounts.dayShiftCount +
            this.shiftCounts.nightShiftCount +
            this.shiftCounts.rotationalShiftCount;
        }
      },
      error: (err) => {
        console.error('API error:', err);
      },
    });
  }

  activeIndex: number | null = null;

  toggleCollapse(index: number): void {
    if (this.activeIndex === index) {
      this.activeIndex = null;
    } else {
      this.activeIndex = index;
    }
  }

  activeIndex5: number = -1;

  toggleCollapse5(index: number): void {
    this.activeIndex5 = this.activeIndex5 === index ? -1 : index;
  }

  teamNameList: UserTeamDetailsReflection[] = [];

  teamId: number = 0;
  getTeamNames() {
    debugger;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.teamNameList = response.object;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
      },
    });
  }

  selectedTeamName: string = 'All';
  selectedTeamId: number = 0;
  selectTeam(teamId: number) {
    debugger;
    if (teamId === 0) {
      this.selectedTeamName = 'All';
    } else {
      const selectedTeam = this.teamNameList.find(
        (team) => team.teamId === teamId
      );
      this.selectedTeamName = selectedTeam ? selectedTeam.teamName : 'All';
    }
    this.page = 0;
    this.itemPerPage = 10;
    // this.fullLeaveLogs = [];
    // this.selectedTeamName = teamName;
    this.selectedTeamId = teamId;
    this.getUserByFiltersMethodCall();
  }

  isShowAutomationRule: boolean = false;

  lat!: number;
  lng!: number;
  zoom: number = 15; // Initial zoom level of the map
  markerPosition: any;

  address: string = ''; // Add this property to hold the fetched address
  city: string = '';
  /************ GET CURRENT LOCATION ***********/
  fetchCurrentLocationLoader: boolean = false;
  locationLoader: boolean = false;
  currentLocation() {
    debugger;
    this.fetchCurrentLocationLoader = true;
    // this.locationLoader = true;
    this.getCurrentLocation()
      .then((coords) => {
        this.placesService
          .getLocationDetails(coords.latitude, coords.longitude)
          .then((details) => {
            this.locationLoader = false;
            this.fetchCurrentLocationLoader = false;
            console.log('formatted_address:', details);
            this.organizationAddressDetail.addressLine1 =
              details.formatted_address;
            this.organizationAddressDetail.addressLine2 = '';
            if (details.address_components[1].types[0] === 'locality') {
              this.organizationAddressDetail.city =
                details.address_components[2].long_name;
            }
            if (
              details.address_components[4].types[0] ===
              'administrative_area_level_1'
            ) {
              this.organizationAddressDetail.state =
                details.address_components[4].long_name;
            }
            if (details.address_components[5].types[0] === 'country') {
              this.organizationAddressDetail.country =
                details.address_components[5].long_name;
            }
            if (details.address_components[6].types[0] === 'postal_code') {
              this.organizationAddressDetail.pincode =
                details.address_components[6].long_name;
            }
          })
          .catch((error) => console.error(error));
          this.fetchCurrentLocationLoader = false;
      })
      .catch((error) => console.error(error));
      this.fetchCurrentLocationLoader = false;
  }

  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            this.isShowMap = true;
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            reject(err);
          }
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }

  mapCenter: { lat: number; lng: number } = { lat: this.lat, lng: this.lng };

  onMapClick(event: any) {
    this.organizationAddressDetail.latitude = event.coords.lat;
    this.organizationAddressDetail.longitude = event.coords.lng;
  }

  onMarkerDragEnd(event: any) {
    this.organizationAddressDetail.latitude = event.coords.lat;
    this.organizationAddressDetail.longitude = event.coords.lng;
    this.mapCenter = { lat: this.lat, lng: this.lng };
  }

  formattedTime: string | null = null;
  // organizationShiftTimingRequest: any = { inTime: '' };
  // organizationShiftTimingValidationErrors: any = {};

  onTimeChange(field: keyof OrganizationShiftTimingRequest, value: Date): void {

    
    // Set the field value directly
    switch (field) {
        case 'inTime':
            this.organizationShiftTimingRequest.inTime = value;
            break;
        case 'outTime':
            this.organizationShiftTimingRequest.outTime = value;
            break;
        case 'startLunch':
            this.organizationShiftTimingRequest.startLunch = value;
            break;
        case 'endLunch':
            this.organizationShiftTimingRequest.endLunch = value;
            break;
        default:
            break;

    }

    this.calculateTimes();

}



  isKeyOfOrganizationShiftTimingRequest(key: string): key is keyof OrganizationShiftTimingRequest {
    return key in this.organizationShiftTimingRequest;
  }

  convertTo24HourFormat(date: Date): string {
    debugger;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  convertTime(timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0); // Set milliseconds to 0
    return date;
  }



  // ################--Overtime Pre/Post hour configuration--################
  // PRE_HOUR : boolean = false;
  // POST_HOUR : boolean = false;

  PRE_HOUR = Key.PRE_HOUR;
  POST_HOUR = Key.POST_HOUR;

  ENABLE = Key.ENABLE;
  DISABLE = Key.DISABLE;

  PRE_HOUR_TOGGLE : boolean = false;
  POST_HOUR_TOGGLE : boolean = false;

  PRE_HOUR_SUBMIT_BUTTON_TOGGLE : boolean = false;
  POST_HOUR_SUBMIT_BUTTON_TOGGLE : boolean = false;


  preHourModal(accessibility : boolean){
    this.preHourOvertimeSettingResponse.loading = true;
    if(!accessibility){
      this.PRE_HOUR_TOGGLE = true;
      this.overtimeSettingRequest.accessibility = this.ENABLE;
    } else{
      this.PRE_HOUR_TOGGLE = false;
      this.overtimeSettingRequest.accessibility = this.DISABLE;
      this.enableOrDisablePreHourOvertimeSettingMethodCall();
    }

  }

  postHourModal(accessibility : boolean){
    this.postHourOvertimeSettingResponse.loading = true;
    if(!accessibility){
      this.POST_HOUR_TOGGLE = true;
      this.overtimeSettingRequest.accessibility = this.ENABLE;
    } else{
      this.POST_HOUR_TOGGLE = false;
      this.overtimeSettingRequest.accessibility = this.DISABLE;
      this.enableOrDisablePostHourOvertimeSettingMethodCall();
    }
  }

  updatePreHourOvertimeSetting(event : any){
    this.overtimeSettingRequest.upadtedHour = this.helperService.formatDateToHHmmss(event);
  }

  updatePostHourOvertimeSetting(event : any){
    this.overtimeSettingRequest.upadtedHour = this.helperService.formatDateToHHmmss(event);
  }

  preHourModalClose(){
    this.PRE_HOUR_TOGGLE = false;
    this.preHourOvertimeSettingResponse.loading = false;
    this.overtimeSettingRequest = new OvertimeSettingRequest();
  }

  postHourModalClose(){
    this.POST_HOUR_TOGGLE = false;
    this.postHourOvertimeSettingResponse.loading = false;
    this.overtimeSettingRequest = new OvertimeSettingRequest();
  }
  

  overtimeSettingRequest : OvertimeSettingRequest = new OvertimeSettingRequest();
  enableOrDisablePreHourOvertimeSettingMethodCall(){
    // this.PRE_HOUR_SUBMIT_BUTTON_TOGGLE = true;
    this.dataService.enableOrDisablePreHourOvertimeSetting(this.overtimeSettingRequest).subscribe((response) => {
      // this.PRE_HOUR_SUBMIT_BUTTON_TOGGLE = false;
      this.getPreHourOvertimeSettingResponseMethodCall();
      this.preHourModalClose();
      this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      // this.PRE_HOUR_SUBMIT_BUTTON_TOGGLE = false;
      this.preHourOvertimeSettingResponse.loading = false;
      this.helperService.showToast('Error while upating the Pre Hours!', Key.TOAST_STATUS_ERROR);
    })
  }

  enableOrDisablePostHourOvertimeSettingMethodCall(){
    this.dataService.enableOrDisablePostHourOvertimeSetting(this.overtimeSettingRequest).subscribe((response) => {
      // this.POST_HOUR_SUBMIT_BUTTON_TOGGLE = false;
      this.getPostHourOvertimeSettingResponseMethodCall();
      this.postHourModalClose();
      this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      // this.POST_HOUR_SUBMIT_BUTTON_TOGGLE = false;
      this.postHourOvertimeSettingResponse.loading = false;
      this.helperService.showToast('Error while upating the Post Hours!', Key.TOAST_STATUS_ERROR);
    })
  }

  preHourOvertimeSettingResponse : OvertimeSettingResponse = new OvertimeSettingResponse();
  postHourOvertimeSettingResponse : OvertimeSettingResponse = new OvertimeSettingResponse();
  getPreHourOvertimeSettingResponseMethodCall(){
    this.dataService.getPreHourOvertimeSettingResponse().subscribe((response) => {
      this.preHourOvertimeSettingResponse = response.object;
    }, (error) => {
      console.log(error);
    })
  }

  getPostHourOvertimeSettingResponseMethodCall(){
    this.dataService.getPostHourOvertimeSettingResponse().subscribe((response) => {
      this.postHourOvertimeSettingResponse = response.object;
    }, (error) => {
      console.log(error);
    })
  }
}
