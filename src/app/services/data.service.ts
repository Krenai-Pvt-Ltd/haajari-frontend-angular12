import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Organization } from '../models/users';
import { Savel } from '../models/savel';
import { DailyQuestionsCheckout } from '../models/daily-questions-check-out';
import { DailyQuestionsCheckIn } from '../models/daily-questions-check-in';
import { TeamResponse } from '../models/team';
import {
  AttendanceWithLatePerformerResponseDto,
  AttendanceWithTopPerformerResponseDto,
} from '../models/Attendance.model';
import { RoleRequest } from '../models/role-request';
import { UserPersonalInformationRequest } from '../models/user-personal-information-request';
import { catchError, map, tap } from 'rxjs/operators';
import { UserAddressDetailsRequest } from '../models/user-address-details-request';
import { UserAcademicsDetailRequest } from '../models/user-academics-detail-request';
import { UserExperience } from '../models/user-experience';
import { UserBankDetailRequest } from '../models/user-bank-detail-request';
import { UserEmergencyContactDetailsRequest } from '../models/user-emergency-contact-details-request';
import { AdditionalNotes } from '../models/additional-notes';
import { AttendanceRuleDefinitionRequest } from '../models/attendance-rule-definition-request';
import { AttendanceTimeUpdateRequestDto, UserDto } from '../models/user-dto.model';
import { UserDocumentsDetailsRequest } from '../models/user-documents-details-request';
import { LeaveSettingResponse } from '../models/leave-setting-response';
import { LeaveSettingCategoryResponse } from '../models/leave-categories-response';
import { FullLeaveSettingResponse } from '../models/full-leave-setting-response';
import { FullLeaveSettingRequest } from '../models/Full-Leave-Setting-Request';
import { Testing } from '../models/testing';
import { ShiftTimings } from '../models/shifttimings';
import { OrganizationAddressDetail } from '../models/organization-address-detail';
import { EmployeeAttendanceLocation } from '../models/employee-attendance-location';
import { OnboardingSidebarResponse } from '../models/onboarding-sidebar-response';
import { ReasonOfRejectionProfile } from '../models/reason-of-rejection-profile';
import { UserPasswordRequest } from '../models/user-password-request';
import { UserLeaveDetailsWrapper } from '../models/UserLeaveDetailsWrapper';
import { TotalRequestedLeavesReflection } from '../models/totalRequestedLeaveReflection';
import { StatutoryRequest } from '../models/statutory-request';
import { NotificationVia } from '../models/notification-via';
import { SalaryTemplateComponentRequest } from '../models/salary-template-component-request';
import { WeeklyHoliday } from '../models/WeeklyHoliday';
import { WeekDay } from '../models/WeekDay';
import { Key } from '../constant/key';
import { ResponseEntityObject } from '../models/response-entity-object.model';
import { OrganizationWeekoffInformation } from '../models/organization-weekoff-information';
import { NewJoineeAndUserExitRequest } from '../models/new-joinee-and-user-exit-request';
import { RegisterTeamRequest } from '../modules/dynamic/components/team/team.component';
import { OnboardingFormPreviewResponse } from '../models/onboarding-form-preview-response';
import { Temp } from '../models/temp';
import { AppraisalRequest } from '../models/appraisal-request';
import { SalaryChangeBonusRequest } from '../models/salary-change-bonus-request';
import { EpfDetailsRequest } from '../models/epf-details-request';
import { EsiDetailsRequest } from '../models/esi-details-request';
import { TdsDetailsRequest } from '../models/tds-details-request';
import { AssetCategoryRequest, OrganizationAssetRequest } from '../models/asset-category-respose';
import { LopReversalApplicationRequest } from '../models/lop-reversal-application-request';
import { SalaryChangeOvertimeRequest } from '../models/salary-change-overtime-request';
import { AllocateCoinsRoleWiseRequest, AllocateCoinsToBadgeRequest } from '../models/allocate-coins-role-wise-request';
import { OvertimeSettingRequest } from '../models/overtime-setting-request';
import { OvertimeRequestDTO } from '../models/overtime-request-dto';
import { LeaveTemplateRequest } from '../models/leave-template-request';
import { OrganizationRegistrationFormRequest } from '../models/organization-registration-form-request';
import { OnboardingModule } from '../models/OnboardingModule';
import { AddressModeTypeRequest } from '../models/address-mode-type-request';
import { ExpenseType } from '../models/ExpenseType';
import { CompanyExpense } from '../models/CompanyExpense';
import { DatabaseHelper } from '../models/DatabaseHelper';
import { ApproveReq } from '../models/ApproveReq';
import { UserPositionDTO } from '../models/user-position.model';
import { AssetRequestDTO } from '../models/AssetRequestDTO';
import { ExitPolicy } from '../models/ExitPolicy';
import { UserResignation } from '../models/UserResignation';
import { EmployeeAdditionalDocument } from '../models/EmployeeAdditionalDocument';
import { EmployeeProfileResponse } from '../models/employee-profile-info';
import { NotificationTypeInfoRequest } from '../models/NotificationType';


@Injectable({
  providedIn: 'root',
})
export class DataService {
  private stepsCompletionStatus = new BehaviorSubject<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  orgId: any;
  private readonly _key: Key = new Key();
  constructor(private readonly httpClient: HttpClient) {}
  private readonly orgIdEmitter = new EventEmitter<number>();
  activeTab: boolean = false;
  setOrgId(orgId: number) {
    this.orgIdEmitter.emit(orgId);
  }
  getOrgIdEmitter(): EventEmitter<number> {
    return this.orgIdEmitter;
  }

  private readonly baseUrl = this._key.base_url;
  public employeeData: EmployeeProfileResponse = new EmployeeProfileResponse();
  openSidebar: boolean = true;

  markAttendanceModal: boolean = false;

  registerOrganizationUsingCodeParam(
    code: string,
    state: string,
    timeZone: string,
    promotionCode: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('code', code)
      .set('state', state)
      .set('time_zone', timeZone)
      .set('promotionCode', promotionCode);
    return this.httpClient.put<any>(
      `${this.baseUrl}/organization/auth/slackauth`,
      {},
      { params }
    );
  }

  userSignInWithSlack(code: string, state: string): Observable<any> {
    const params = new HttpParams().set('code', code).set('state', state);
    return this.httpClient.put<any>(
      `${this.baseUrl}/organization/user/sign/in/with/slack`,
      {},
      { params }
    );
  }

  //Attendance module

  downloadAttendanceDataInExcelFormat(
    startDate: any,
    endDate: any
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate.toString())
      .set('end_date', endDate.toString());

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/excel/download`,
      { params }
    );
  }
  downloadUserDataInExcelFormat(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/users/excel/usersData`);
  }
  getAttendanceDetailsByDateDuration(
    startDate: any,
    endDate: any,
    pageNumber: number,
    itemPerPage: number,
    search: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate.toString())
      .set('end_date', endDate.toString())
      .set('page_number', pageNumber.toString())
      .set('item_per_page', itemPerPage.toString())
      .set('search', search)
      .set('search_by', searchBy);
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-attendance-details-by-date-duration`,
      { params }
    );
  }

  getUserAttendanceDetailsByDateDuration(
    userUuid: string,
    role: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('user_uuid', userUuid)
      .set('user_role', role)
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-attendance-details-for-user-by-date-duration`,
      { params }
    );
  }

  // getAttendanceDetailsByDate(date : string): Observable<any>{
  //   const params = new HttpParams()
  //   .set("date", date)
  //   return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-attendance-details-by-date`, {params});
  // }

  getAttendanceDetailsReportByDate(
    date: string,
    pageNumber: number,
    itemPerPage: number,
    search: string,
    searchBy: string,
    sort: string,
    sortBy: string,
    filterCriteria: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('date', date)
      .set('page_number', pageNumber.toString())
      .set('item_per_page', itemPerPage.toString())
      .set('search', search)
      .set('search_by', searchBy)
      .set('sort_order', sort)
      .set('sort_by', sortBy)
      .set('filter_criteria', filterCriteria);
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-attendance-details-report-by-date`,
      { params }
    );
  }

  getAttendanceDetailsReportByDateForDashboard(
    date: string,
    pageNumber: number,
    itemPerPage: number,
    search: string,
    searchBy: string,
    sort: string,
    sortBy: string,
    filterCriteria: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('date', date)
      .set('page_number', pageNumber.toString())
      .set('item_per_page', itemPerPage.toString())
      .set('search', search)
      .set('search_by', searchBy)
      .set('sort_order', sort)
      .set('sort_by', sortBy)
      .set('filter_criteria', filterCriteria);
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-attendance-details-report-by-date-for-dashboard`,
      { params }
    );
  }

  getAttendanceDetailsBreakTimingsReportByDateByUser(
    uuid: string,
    date: string
  ) {
    const params = new HttpParams().set('uuid', uuid).set('date', date);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-break-timings`,
      { params }
    );
  }

  getAttendanceTopPerformers(
    startDate: string,
    endDate: string
  ): Observable<AttendanceWithTopPerformerResponseDto> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.httpClient.get<AttendanceWithTopPerformerResponseDto>(
      `${this.baseUrl}/attendance/get-attendance-top-late-performers-details`,
      { params }
    );
  }
  //Organization daily question module
  registerDailyQuestionaire(dailyQuestions: any): Observable<any> {
    return this.httpClient.put(
      `${this.baseUrl}/organization-daily-question/register`,
      dailyQuestions
    );
  }
  getDailyQuestionaire(): Observable<any> {
    return this.httpClient.get(
      `${this.baseUrl}/organization-daily-question/get`
    );
  }
  //Organization leave module
  registerLeave(leaveData: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/organization-leave/register`,
      leaveData
    );
  }
  getUserLeaveById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/user-leave?id=${id}`);
  }
  getLeave(): Observable<any> {
    return this.httpClient.get<Savel[]>(
      `${this.baseUrl}/organization-leave/get/all`
    );
  }
  //Organization personal information module
  registerOrganizationPersonalInformation(
    personalInformation: any,
    timeZone: string
  ): Observable<any> {
    return this.httpClient.put<any>(
      `${this.baseUrl}/organization-personal-information/register`,
      personalInformation,
      { params: { timeZone: timeZone } }
    );
  }

  getOrganizationDetails(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization-personal-information/get`
    );
  }

  updateOrganizationPersonalInformation(
    userPersonalInformationRequest: any
  ): Observable<any> {
    return this.httpClient.put<any>(
      `${this.baseUrl}/organization-personal-information/update`,
      userPersonalInformationRequest
    );
  }
  //Organization shift-timing module
  registerShiftTimings(shiftTiming: any): Observable<any> {
    return this.httpClient.put(
      `${this.baseUrl}/organization-shift-timing/register`,
      shiftTiming
    );
  }

  registerShiftTiming(shiftTimingRequest: any): Observable<any> {
    return this.httpClient.put<any>(
      `${this.baseUrl}/organization-shift-timing/register`,
      shiftTimingRequest
    );
  }

  getShiftTimings(): Observable<any> {
    return this.httpClient.get<ShiftTimings[]>(
      `${this.baseUrl}/organization-shift-timing/get/last-detail`
    );
  }

  getOrgExcelLogLink(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/whatsapp-user-onboarding/get-excel-link`
    );
  }

  getAllShiftTimings(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization-shift-timing/get/all`
    );
  }

  getShiftTimingById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/organization-shift-timing/by-id?id=${id}`);
  }

  deleteOrganizationShiftTiming(
    organizationShiftTimingId: number
  ): Observable<any> {
    const params = new HttpParams().set(
      'organization_shift_timing_id',
      organizationShiftTimingId
    );

    return this.httpClient.delete<any>(
      `${this.baseUrl}/organization-shift-timing/delete-by-id`,
      { params }
    );
  }
  getAllShiftType(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization-shift-timing/shift-type-get-all`
    );
  }

  //User module
  getUsersByFilter(
    itemPerPage: number,
    pageNumber: number,
    sort: string,
    sortBy: string,
    search: string,
    searchBy: string,
    teamId: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('item_per_page', itemPerPage.toString())
      .set('page_number', pageNumber.toString())
      .set('sort_order', sort)
      .set('sort_by', sortBy)
      .set('search', search)
      .set('search_by', searchBy)
      .set('team_id', teamId);
    return this.httpClient.get<any>(`${this.baseUrl}/users/get/by-filters`, {
      params,
    });
  }

  getUsersByFilterForEmpOnboardingNew(
    itemPerPage: number,
    pageNumber: number,
    sort: string,
    sortBy: string,
    search: string,
    searchBy: string,
    isResginationUser: number,
    filters: string[] // Add filters parameter
  ): Observable<any> {
    let params = new HttpParams()
      .set('item_per_page', itemPerPage.toString())
      .set('page_number', pageNumber.toString())
      .set('sort_order', sort)
      .set('sort_by', sortBy)
      .set('search', search)
      .set('search_by', searchBy);

    if (isResginationUser == 1) {
      params = params.set('is_resignation_user', '1');
    }

    if (filters.length > 0) {
      params = params.set('filters', filters.join(',')); // Send as comma-separated string
    }

    return this.httpClient.get<any>(
      `${this.baseUrl}/users/get/by-filters-for-employee-onboarding-data`,
      { params }
    );
  }

  getUsersByFilterForEmpOnboarding(
    itemPerPage: number,
    pageNumber: number,
    sort: string,
    sortBy: string,
    search: string,
    searchBy: string,
    isResginationUser: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('item_per_page', itemPerPage.toString())
      .set('page_number', pageNumber.toString())
      .set('sort_order', sort)
      .set('sort_by', sortBy)
      .set('search', search)
      .set('search_by', searchBy);

    if (isResginationUser == 1) {
      params = params.set('is_resignation_user', 1);
    }

    return this.httpClient.get<any>(
      `${this.baseUrl}/users/get/by-filters-for-employee-onboarding-data`,
      {
        params,
      }
    );
  }

  getUsersByOrganizationUuid(
    search: string | null,
    statuses: string[] | null,
    pageable: { page: number; size: number; sort?: string }
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (statuses && statuses.length > 0) {
      statuses.forEach((status) => {
        params = params.append('statuses', status);
      });
    }

    if (pageable.sort) {
      params = params.set('sort', pageable.sort);
    }

    return this.httpClient.get<any>(
      `${this.baseUrl}/users/onboarding-data-by-filter`,
      { params }
    );
  }

  getUsersByFilterForLeaveSetting(
    itemPerPage: number,
    pageNumber: number,
    sort: string,
    sortBy: string,
    search: string,
    searchBy: string,
    leaveSettingId: number,
    teamId: number,
    selectedStaffIdsUser: any
  ): Observable<any> {
    let params = new HttpParams()
      .set('item_per_page', itemPerPage.toString())
      .set('page_number', pageNumber.toString())
      .set('sort_order', sort)
      .set('sort_by', sortBy)
      .set('search', search)
      .set('search_by', searchBy)
      .set('leave_setting_id', leaveSettingId)
      .set('team_id', teamId)
      .set('userIds', selectedStaffIdsUser);

    if (search != null && search != '') {
      params = params.set('page_number', 0);
      params = params.set('item_per_page', 0);
    }

    return this.httpClient.get<any>(
      `${this.baseUrl}/users/get/by-filters-leave-setting`,
      { params }
    );
  }

  getAllUsers(
    sort: string,
    sortBy: string,
    search: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('sortOrder', sort)
      .set('sortBy', sortBy)
      .set('search', search)
      .set('searchBy', searchBy);
    return this.httpClient.get<any>(
      `${this.baseUrl}/users/get/all/by-filters`,
      { params }
    );
  }

  getAllUserUuids(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/users/get/all/uuids`);
  }
  saveUserPosition(userPositionDTO: any): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/user-positions/promote`,
      userPositionDTO
    );
  }
  getUserPositionsByUserId(userId: string): Observable<UserPositionDTO[]> {
    return this.httpClient.get<UserPositionDTO[]>(
      `${this.baseUrl}/user-positions/user-positions/${userId}`
    );
  }
  completeProbation(uuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', uuid);
    return this.httpClient.post(
      `${this.baseUrl}/user-positions/probation`,
      {},
      { params }
    );
  }

  changeStatusById(presenceStatus: Boolean, userUuid: string): Observable<any> {
    const params = new HttpParams()
      .set('presenceStatus', presenceStatus.toString())
      .set('userUuid', userUuid);
    return this.httpClient.put<any>(
      `${this.baseUrl}/users/change-status`,
      {},
      { params }
    );
  }
  getActiveUsersCount(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/users/active-count`);
  }

  getPresentUsersCountByDate(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/present-users-by-date-count`,
      { params }
    );
  }

  getAbsentUsersCountByDate(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/absent-users-by-date-count`,
      { params }
    );
  }
  //Team module
  registerTeam(
    name: string,
    description: string,
    registerTeamRequest: RegisterTeamRequest
  ): Observable<any> {
    const params = new HttpParams()
      .set('name', name)
      .set('description', description);
    return this.httpClient.post(
      `${this.baseUrl}/team/register`,
      registerTeamRequest,
      {
        params,
      }
    );
  }
  getTeamsByFilter(
    itemPerPage: number,
    pageNumber: number,
    search: string,
    searchBy: string,
    sortBy: string,
    sortOrder: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('item_per_page', itemPerPage.toString())
      .set('page_number', pageNumber.toString())
      .set('search', search)
      .set('search_by', searchBy)
      .set('sort_by', sortBy)
      .set('sort_order', sortOrder);
    return this.httpClient.get<any>(`${this.baseUrl}/team/get-all-by-filters`, {
      params,
    });
  }
  getAllTeamsWithUsersByUserId(): Observable<TeamResponse[]> {
    return this.httpClient.get<TeamResponse[]>(
      `${this.baseUrl}/team/get-all-teams-with-users-by-user-id`
    );
  }

  // Firebase access token from refresh token
  refreshFirebaseAccessToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken === null || refreshToken === undefined) {
      throw new Error('Refresh token not found');
    }

    const params = new HttpParams().set('refresh_token', refreshToken);

    return this.httpClient.get<any>(
      `${this.baseUrl}/firebase/refresh-access-token`,
      { params }
    );
  }

  registerOnboardingDetails(
    id: number,
    name: string,
    email: string,
    password: string,
    state: string,
    country: string,
    organizationPic: File | null
  ) {
    const params = new HttpParams()
      .set('id', id)
      .set('name', name)
      .set('email', email)
      .set('password', password)
      .set('state', state)
      .set('country', country);
    const url = `http://localhost:8080/api/v1/attendance/register-org?${params.toString()}`;
    return this.httpClient.put(url, organizationPic);
  }
  // ##################################################3
  getTeamsById(teamUuid: string): Observable<any> {
    const params = new HttpParams().set('teamUuid', teamUuid);
    return this.httpClient.get<TeamResponse[]>(
      `${this.baseUrl}/team/get-team-by-team-id`,
      {
        params,
      }
    );
  }

  // ##################################
  getOrg(orgId: any): Observable<any> {
    const params = new HttpParams().set('id', orgId);
    return this.httpClient.get<Organization[]>(this.baseUrl + '/get-org', {
      params,
    });
  }
  // getSaveLeave(orgId:any): Observable<any> {
  //   const params = new HttpParams()
  //     .set('id', orgId)
  //   return this.httpClient.get<Savel[]>(this.baseUrl + '/get-leave-detail', {params});
  // }
  updateLeaveStatus(sav: Savel): Observable<any> {
    return this.httpClient.put(
      `${this.baseUrl}/update-leave-status/${sav.id}`,
      sav
    );
  }

  // #############################################################################
  saveDailyQuestions(dailyQuestionsData: any): Observable<any> {
    return this.httpClient.post(
      `http://localhost:8080/api/v1/attendance/save-daily-questions`,
      dailyQuestionsData
    );
  }
  getDailyQuestions(organId: any): Observable<any> {
    const params = new HttpParams().set('id', organId);
    return this.httpClient.get<DailyQuestionsCheckout[]>(
      `${this.baseUrl}/get-daily-questions/id`,
      {
        params,
      }
    );
  }
  deleteDailyQuestions(dailyQuestionsId: any): Observable<any> {
    return this.httpClient.delete(
      `${this.baseUrl}/delete-daily-questions/${dailyQuestionsId}`
    );
  }
  // #############################################################3
  saveDailyQuestionsCheckIn(dailyQuestionsData: any): Observable<any> {
    return this.httpClient.post(
      `http://localhost:8080/api/v1/attendance/save-daily-questions-check-in`,
      dailyQuestionsData
    );
  }
  getDailyQuestionsCheckIn(organnId: any): Observable<any> {
    const params = new HttpParams().set('id', organnId);
    return this.httpClient.get<DailyQuestionsCheckIn[]>(
      `${this.baseUrl}/get-daily-questions-check-in/id`,
      {
        params,
      }
    );
  }
  deleteDailyQuestionsCheckIn(dailyQuestionsId: any): Observable<any> {
    return this.httpClient.delete(
      `${this.baseUrl}/delete-daily-questions-check-in/${dailyQuestionsId}`
    );
  }
  // #################################333
  saveDailyNotes(dailyNotesData: any): Observable<any> {
    return this.httpClient.put(
      `http://localhost:8080/api/v1/attendance/save-daily-Notes`,
      dailyNotesData
    );
  }
  //  ###################################################################################################
  saveTokenForOrganization(organization: Organization): Observable<any> {
    return this.httpClient.post(this.baseUrl + '/savetoken', organization);
  }
  saveUserData(token: any): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.httpClient.post(this.baseUrl + '/save-slack-data', { params });
  }
  loginUser(email: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);
    return this.httpClient.get(`${this.baseUrl}/user/auth/login`, {
      params,
    });
  }

  logoutUser(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);

    return this.httpClient.get(`${this.baseUrl}/user/auth/logout`, {
      params,
    });
  }

  saveLeaveRequest(
    userUuid: string,
    request: any,
    fileToUpload: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('uuid', userUuid)
      .set('fileToUpload', fileToUpload);
    return this.httpClient.post(this.baseUrl + '/leave/request', request, {
      params,
    });
  }

  saveLeaveRequestForLeaveManagement(
    request: any,
    fileToUpload: string
  ): Observable<any> {
    const params = new HttpParams().set('fileToUpload', fileToUpload);
    return this.httpClient.post(
      this.baseUrl + '/leave/request-leave-management',
      request,
      { params }
    );
  }


  saveLeaveRequestFromWhatsapp(
    userUuid: string,
    request: any,
    fileToUpload: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('userUuid', userUuid)
      .set('fileToUpload', fileToUpload);
    return this.httpClient.post(
      this.baseUrl + '/leave/whatsapp/request',
      request,
      { params }
    );
  }

  getUserLeaveRequests(
    uuid: string,
    isSpecificCategory?: number,
    leaveTemplateId?: number
  ): Observable<any> {
    let params = new HttpParams().set('userUuid', uuid);
    if (isSpecificCategory) {
      params = params.set('isSpecificCategory', isSpecificCategory);
    }
    if (leaveTemplateId) {
      params = params.set('leaveTemplateId', leaveTemplateId);
    }
    return this.httpClient.get<any>(`${this.baseUrl}/leave/get-user-leave`, {
      params,
    });
  }

  getUserLeaveRequestsForLeaveManagement(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/user-leave/get-user-leave-leave-management`
    );
  }

  //Just for testing
  getUserByUserName(name: string): Observable<any> {
    const params = new HttpParams().set('name', name);
    return this.httpClient.get<any>(`${this.baseUrl}/get/user`, { params });
  }

  assignManagerRoleToMember(
    teamUuid: string,
    userUuid: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('teamUuid', teamUuid)
      .set('userUuid', userUuid);
    return this.httpClient.put(
      `${this.baseUrl}/team/assign-manager-role-to-member`,
      {},
      { params }
    );
  }
  assignMemberRoleToManager(
    teamUuid: string,
    userUuid: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('teamUuid', teamUuid)
      .set('userUuid', userUuid);
    return this.httpClient.put(
      `${this.baseUrl}/team/assign-member-role-to-manager`,
      {},
      { params }
    );
  }
  removeUserFromTeam(teamUuid: string, userUuid: string): Observable<string> {
    const url = `${this.baseUrl}/team/removeUser?teamUuid=${teamUuid}&userUuid=${userUuid}`;
    return this.httpClient.delete<string>(url);
  }

  addUsersToTeam(teamUuid: string, userUuid: string[]): Observable<string> {
    const url = `${this.baseUrl}/team/add-users-by-user-ids`;
    const params = new HttpParams()
      .set('teamUuid', teamUuid)
      .set('userUuid', userUuid.join(','));
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      params: params,
    };
    return this.httpClient.post<any>(url, null, httpOptions);
  }

  checkingUserRole(): Observable<boolean> {
    return this.httpClient.get<boolean>(
      `${this.baseUrl}/team/checking-user-role`
    );
  }
  sendInviteToUsers(emails: string[], teamId: string): Observable<any> {
    const params = new HttpParams().set('teamUuid', teamId);
    return this.httpClient.post(
      `${this.baseUrl}/team/send-invite-to-users`,
      emails,
      { params }
    );
  }

  deleteTeam(id: number): Observable<any> {
    const params = new HttpParams().set('teamId', id);
    return this.httpClient.delete(`${this.baseUrl}/team/delete-team/Id`, {
      params,
    });
  }
  // deleteTeam(teamId: any): Observable<any> {
  //   return this.httpClient.delete(
  //     `${this.baseUrl}/deleteTeam/Id/${teamId}`,S
  //   );
  // }SS
  // ###################################################################

  // ###########################################################

  getTodaysLeaveCount(): Observable<any> {
    return this.httpClient.get(this.baseUrl + '/user-leave/todays-leave-count');
  }

  // slackDataPlaceholderFlag:boolean=false;
  getSlackChannelsDataToTeam(uniqueUuid: string): Observable<any> {
    const params = new HttpParams().set('uniqueUuid', uniqueUuid);
    return this.httpClient.get<any>(`${this.baseUrl}/team/users`, { params });
  }

  getAllRoles(
    itemPerPage: number,
    pageNumber: number,
    sort: string,
    sortBy: string,
    search: string,
    searchBy: string,
    ownerRoleId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('item_per_page', itemPerPage.toString())
      .set('page_number', pageNumber.toString())
      .set('sort_order', sort)
      .set('sort_by', sortBy)
      .set('search', search)
      .set('search_by', searchBy)
      .set('owner_role_id', ownerRoleId);
    return this.httpClient.get<any>(`${this.baseUrl}/role/get/all`, { params });
  }
  getAllOnboardingModules() {
    return this.httpClient.get<OnboardingModule[]>(
      `${this.baseUrl}/onboarding-setting/onboarding-module/get-all`
    );
  }
  saveSelectedModuleIds(moduleIds: number[]): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/onboarding-setting/update-permissions`,
      { moduleIds }
    );
  }
  getEnabledModuleIds(): Observable<number[]> {
    return this.httpClient.get<number[]>(
      `${this.baseUrl}/onboarding-setting/getEnabledModules`
    );
  }
  onboardingRoutes: string[] = [];
  getRoutesByOrganization(userUuid: any): Observable<string[]> {
    return this.httpClient
      .get<string[]>(`${this.baseUrl}/onboarding-setting/routes/${userUuid}`)
      .pipe(
        tap((routes: string[]) => {
          // Assign the value to the local variable before returning it
          this.onboardingRoutes = routes;
        })
      );
  }
  loadOnboardingRoute(userUuid: any): Promise<any> {
    debugger;
    console.log(' in finddding route');
    return new Promise((resolve, reject) => {
      this.httpClient
        .get<string[]>(`${this.baseUrl}/onboarding-setting/routes/${userUuid}`)
        .subscribe((routes: string[]) => {
          this.onboardingRoutes = routes;
          resolve(true);
        });
    });
  }
  isRoutePresent(routeToCheck: string): boolean {
    const isPresent = this.onboardingRoutes.includes(routeToCheck);
    console.log(`Is route present: ${isPresent}`);
    return isPresent;
  }
  isLastRoute(routeToCheck: string): boolean {
    const lastRoute = this.onboardingRoutes[this.onboardingRoutes.length - 1];
    return lastRoute === routeToCheck;
  }

  getAttendanceLatePerformers(
    startDate: string,
    endDate: string
  ): Observable<AttendanceWithLatePerformerResponseDto> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.httpClient.get<AttendanceWithLatePerformerResponseDto>(
      `${this.baseUrl}/attendance/get-attendance-late-performers-details`,
      { params }
    );
  }
  getSubModuleByRole(roleId: number): Observable<any> {
    const params = new HttpParams().set('role_id', roleId);
    return this.httpClient.get<any>(`${this.baseUrl}/role/sub-module`, {
      params,
    });
  }

  createRole(roleRequest: RoleRequest): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/role/register`,
      roleRequest
    );
  }
  updateRoleWithPermissions(roleRequest: RoleRequest): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/role/update`, roleRequest);
  }

  //Just for testing purpose
  callingHelloWorld(): Observable<any> {
    debugger;
    return this.httpClient.get<any>(`${this.baseUrl}/slack/hello`);
  }

  getEmployeesStatus(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/employee-onboarding-status/get-employee-onboarding-status`
    );
  }

  getLastApprovedAndLastRejecetd(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/employee-onboarding-status/get-status`
    );
  }

  getUserByUuid(userUuid: any): Observable<any> {
    const params = new HttpParams().set('uuid', userUuid);
    return this.httpClient.get<any>(
      `${this.baseUrl}/employee-onboarding-status/get-user-by-uuid`,
      { params }
    );
  }

  assignRoleToUserInUserAndControl(
    userId: any,
    roleId: any,
    description: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('user_id', Number(userId))
      .set('role_id', Number(roleId))
      .set('description', description);
    return this.httpClient.post<any>(
      `${this.baseUrl}/user-and-control/register`,
      {},
      { params }
    );
  }

  updateStatusUser(userUuid: string, statusType: string): Observable<any> {
    const params = new HttpParams()
      .set('user_uuid', userUuid)
      .set('status_type', statusType);
    debugger;
    return this.httpClient.put<any>(
      `${this.baseUrl}/employee-onboarding-status/change-employee-onboarding-status`,
      {},
      { params }
    );
  }

  setEmployeePersonalDetails(
    userPersonalInformationRequest: UserPersonalInformationRequest,
    userUuid: string,
    selectedTeamIds: number[],
    selectedShift: number,
    selectedLeaveIds: number[],
    invite: boolean
  ): Observable<any> {
    debugger;
    let params = new HttpParams()
      .set('userUuid', userUuid)
      .set('selectedShiftId', selectedShift)
      .set('invite', invite);
    const requestBody = {
      userPersonalInformationRequest,
      selectedTeamIds,
      selectedLeaveIds,
    };
    console.log('save');
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/users/save/employeePersonalDetails`,
        requestBody,
        { params }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }
  // setEmployeePersonalDetails(
  //   userPersonalInformationRequest: UserPersonalInformationRequest,
  //   userUuid: string,
  //   selectedTeamIds: number[]
  // ): Observable<any> {
  //   const params = new HttpParams().set('userUuid', userUuid);
  //   return this.httpClient
  //     .put<any>(
  //       `${this.baseUrl}/save/employeePersonalDetails`,
  //       {
  //         userPersonalInformationRequest,
  //         selectedTeamIds,
  //       },
  //       { params }
  //     )
  //     .pipe(
  //       catchError((error: HttpErrorResponse) => {
  //         console.error('Error in setEmployeePersonalDetails:', error);
  //         return throwError(error);
  //       })
  //     );
  // }

  // saveUserPersonalDetails(
  //   userPersonalInformationRequest: any,
  //   userUuid: string,
  //   selectedTeamIds: number[]
  // ): Observable<any> {
  //   const url = `/save/employeePersonalDetails?userUuid=${userUuid}`;
  //   return this.http.put<any>(url, {
  //     userPersonalInformationRequest,
  //     selectedTeamIds,
  //   });
  // }

  setEmployeeOnboardingPersonalDetails(
    userPersonalInformationRequest: UserPersonalInformationRequest,
    userUuid: string
  ): Observable<any> {
    debugger;
    const params = new HttpParams().set('userUuid', userUuid);
    console.log('save');
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/users/save/onboardingPersonalDetail`,
        userPersonalInformationRequest,
        { params }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }

  setEmployeeByAdmin(
    userPersonalInformationRequest: UserPersonalInformationRequest
  ): Observable<any> {
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/users/save/employeePersonalDetails`,
        userPersonalInformationRequest
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }
  getUserAndControlRolesByFilter(
    itemPerPage: number,
    pageNumber: number,
    sort: string,
    sortBy: string,
    search: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('item_per_page', itemPerPage.toString())
      .set('page_number', pageNumber.toString())
      .set('sort', sort)
      .set('sort_by', sortBy)
      .set('search', search)
      .set('search_by', searchBy);
    debugger;
    return this.httpClient.get<any>(
      `${this.baseUrl}/user-and-control/get-all`,
      { params }
    );
  }

  addAdditionalNotes(
    additionalNotes: AdditionalNotes,
    uuid: string
  ): Observable<any> {
    const params = new HttpParams().set('uuid', uuid);

    return this.httpClient.post<any>(
      `${this.baseUrl}/additional-notes/add`,
      additionalNotes,
      { params }
    );
  }

  getNewUserPersonalInformation(userUuid: string): Observable<any> {
    debugger;
    const params = new HttpParams().set('userUuid', userUuid);
    const url = `${this.baseUrl}/users/get/employeePersonalDetails`;
    return this.httpClient.get(url, { params });
  }

  setEmployeeAddressDetails(
    userAddressDetailsRequest: UserAddressDetailsRequest,
    userUuid: string
  ): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/user-address/save/user-address`,
        userAddressDetailsRequest,
        { params }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }

  getNewUserAddressDetails(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    const url = `${this.baseUrl}/user-address/get/user-address`;
    return this.httpClient.get(url, { params });
  }

  setEmployeeAcademics(
    userAcademicsDetailRequest: UserAcademicsDetailRequest,
    userUuid: string
  ): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/user-academics/save/user-academics`,
        userAcademicsDetailRequest,
        { params }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }

  getUserAcademicDetails(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    const url = `${this.baseUrl}/user-academics/get/user-academics`;
    return this.httpClient.get(url, { params });
  }

  getEmployeeAdressDetails(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/user-address/get/user-address`,
      { params }
    );
  }

  setEmployeeDocumentsDetails(
    userDocumentsDetailsRequest: UserDocumentsDetailsRequest,
    userUuid: string
  ): Observable<any> {
    debugger;
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/user-documents-details/save/user-documents`,
        userDocumentsDetailsRequest,
        { params }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }

  getEmployeeDocumentDetails(userUuid: string): Observable<any> {
    debugger;
    const params = new HttpParams().set('userUuid', userUuid);
    const url = `${this.baseUrl}/user-documents-details/get/user-documents`;
    return this.httpClient.get(url, { params });
  }

  getEmployeeDocumentAsList(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    const url = `${this.baseUrl}/user-documents-details/get/user-document-list`;
    return this.httpClient.get(url, { params });
  }

  setEmployeeExperienceDetails(
    experiences: UserExperience[],
    userUuid: string
  ): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/user-experiences/save/experience`,
        experiences,
        { params }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeeExperienceDetails:', error);
          return throwError(error);
        })
      );
  }
  getEmployeeExperiencesDetailsOnboarding(
    userUuid: string
  ): Observable<UserExperience[]> {
    debugger;
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient.get<UserExperience[]>(
      `${this.baseUrl}/user-experiences/getExperiences`,
      { params }
    );
  }

  getEmployeeExperiencesDetails(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/user-experiences/getExperiences`,
      { params }
    );
  }

  getEmployeeAcademicDetails(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/user-academics/user/getUserAcademics`,
      { params }
    );
  }

  setEmployeeEmergencyContactDetails(
    userEmergencyContactDetailsRequest: UserEmergencyContactDetailsRequest[],
    userUuid: string
  ): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/user-emergency-contacts/save/emergency-contacts`,
        userEmergencyContactDetailsRequest,
        { params }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }
  getEmployeeContactsDetails(
    userUuid: string
  ): Observable<UserEmergencyContactDetailsRequest[]> {
    const params = new HttpParams().set('userUuid', userUuid);

    return this.httpClient.get<UserEmergencyContactDetailsRequest[]>(
      `${this.baseUrl}/user-emergency-contacts/get/emergency-contacts-new`,
      { params }
    );
  }

  setEmployeeBankDetails(
    userBankDetailRequest: UserBankDetailRequest,
    userUuid: string
  ): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/user-bank-details/save/bank-details`,
        userBankDetailRequest,
        { params }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }
  getEmployeeBankDetails(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/user-bank-details/get/bank-details`,
      { params }
    );
  }

  getOnboardingFormPreview(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);

    return this.httpClient.get<any>(`${this.baseUrl}/get/onboarding/preview`, {
      params,
    });
  }

  saveOnboardingData(
    onboardingPreviewData: OnboardingFormPreviewResponse
  ): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/get/onboarding/save-onboarding-data`,
      onboardingPreviewData
    );
  }

  createRequest(userId: string): Observable<any> {
    const params = new HttpParams().set('userId', userId);
    return this.httpClient.post<any>(
      `${this.baseUrl}/profile-edit-requests`,
      params
    );
  }

  // Get Pending Request for User by UUID (returns any type)
  getPendingRequestForUser(uuid: string): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/profile-edit-requests/get/${uuid}`
    );
  }

  profileEditStatus(status: string, userId: string): Observable<any> {
    const params = new HttpParams().set('userId', userId);
    return this.httpClient.put<any>(
      `${this.baseUrl}/profile-edit-requests/status/${status}`,
      params
    );
  }

  getProfileEditRequestById(id: number): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/profile-edit-requests?id=${id}`
    );
  }

  getUserLeaveLog(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/user-leave-logs/leave-log`,
      { params }
    );
  }

  getUserLeaveLogFilter(
    userUuid: string,
    page: number,
    size: number,
    leaveType?: string,
    status?: string,
    search?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('userUuid', userUuid)
      .set('page', page)
      .set('size', size);

    if (leaveType) params = params.set('leaveType', leaveType);
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.httpClient.get<any>(
      `${this.baseUrl}/user-leave/leave-log-filter`,
      { params }
    );
  }

  deleteUserLog(id: number): Observable<void> {
    return this.httpClient.delete<void>(
      `${this.baseUrl}/user-leave-logs/${id}`
    );
  }

  getUserLeaveLogByStatus(userUuid: string, status?: string): Observable<any> {
    let params = new HttpParams().set('userUuid', userUuid);
    if (status) {
      params = params.set('status', status);
    }
    return this.httpClient.get<any>(
      `${this.baseUrl}/user-leave-logs/leave-log-by-status`,
      { params }
    );
  }

  getOrganizationOnboardingDate(userUuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', userUuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/employee-onboarding-status/get-organization-onboarding-date`,
      { params }
    );
  }

  get stepsCompletionStatus$() {
    return this.stepsCompletionStatus.asObservable();
  }

  stepIndex: number = -1;
  async markStepAsCompleted(stepIndex: number): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.stepIndex = stepIndex;
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  getAttendanceRuleByOrganization() {
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/rule/get`);
  }

  getRegisteredAttendanceRuleByOrganization() {
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/rule/get/registered-response`
    );
  }

  registerAttendanceRuleDefinition(
    attendanceRuleDefinitionRequest: AttendanceRuleDefinitionRequest
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/attendance/rule/definition/register`,
      attendanceRuleDefinitionRequest
    );
  }

  getAttendanceRuleWithAttendanceRuleDefinition(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/rule/with/attendance/rule/definition/get`
    );
  }

  //used in onboarding process (new api)
  getAttendanceRuleWithAttendanceRuleDefinitionNew(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/rule/with/attendance/rule/definition/get-new`
    );
  }

  getAttendanceRuleDefinitionById(
    attendanceRuleDefinitionId: number
  ): Observable<any> {
    const params = new HttpParams().set(
      'attendance_rule_definition_id',
      attendanceRuleDefinitionId
    );

    debugger;
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/rule/definition/get/by/id`,
      { params }
    );
  }

  getAttendanceRuleDefinition(attendanceRuleId: number): Observable<any> {
    const params = new HttpParams().set('attendance_rule_id', attendanceRuleId);
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/rule/definition/get`,
      { params }
    );
  }

  getDeductionType(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/rule/definition/deduction-type/get`
    );
  }

  getOvertimeType(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/rule/definition/overtime-type/get`
    );
  }

  deleteAttendanceRuleDefinition(
    attendanceRuleDefinitionId: number,
    attendanceRuleTypeId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('attendance_rule_definition_id', attendanceRuleDefinitionId)
      .set('attendance_rule_type_id', attendanceRuleTypeId);

    return this.httpClient.delete<any>(
      `${this.baseUrl}/attendance/rule/definition/delete`,
      { params }
    );
  }

  getEmployeeManagerDetails(userUuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', userUuid);

    return this.httpClient.get<UserDto[]>(
      `${this.baseUrl}/employee-onboarding-status/get-manager`,
      { params }
    );
  }

  getManagerBoolean(userUuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', userUuid);

    return this.httpClient.get<UserDto[]>(
      `${this.baseUrl}/employee-onboarding-status/get-boolean-for-manager-case`,
      { params }
    );
  }

  getEmployeeManagerDetailsLeaveManagemnt(): Observable<any> {
    // const params = new HttpParams()
    //   .set("uuid", userUuid)

    return this.httpClient.get<UserDto[]>(
      `${this.baseUrl}/employee-onboarding-status/get-manager-leave-management`
    );
  }

  getEmployeeManagerDetailsViaWhatsapp(userUuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', userUuid);

    return this.httpClient.get<UserDto[]>(
      `${this.baseUrl}/employee-onboarding-status/get-manager-whatsapp`,
      { params }
    );
  }

  getEmployeeDocumentsDetails(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);

    return this.httpClient.get<UserDto[]>(
      `${this.baseUrl}/user-documents-details/get/user-documents`,
      { params }
    );
  }

  selectUserForAttendanceRule(
    isSelectedForAttendanceRule: boolean,
    userUuid: string
  ): Observable<any> {
    const params = new HttpParams()
      .set(
        'is_selected_for_attendance_rule',
        isSelectedForAttendanceRule.toString()
      )
      .set('user_uuid', userUuid);

    return this.httpClient.put<any>(
      `${this.baseUrl}/users/select-for-attendance-rule`,
      {},
      { params }
    );
  }

  // ###################

  registerLeaveSettingTemplate(
    leaveSettingResponse: LeaveSettingResponse
  ): Observable<LeaveSettingResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.httpClient.put<LeaveSettingResponse>(
      `${this.baseUrl}/leave-setting/register-leave-template`,
      leaveSettingResponse,
      { headers }
    );
  }

  registerLeaveCategories(
    leaveSettingCategoryResponse: LeaveSettingCategoryResponse[],
    leaveSettingId: number
  ): Observable<LeaveSettingCategoryResponse[]> {
    return this.httpClient.put<LeaveSettingCategoryResponse[]>(
      `${this.baseUrl}/leave-setting-category/register-leave-categories?leaveSettingId=${leaveSettingId}`,
      leaveSettingCategoryResponse
    );
  }

  // registerUserOfLeaveSetting(userLeaveSettingRule: UserLeaveSettingRule): Observable<UserLeaveSettingRule> {
  //   const url = `${this.baseUrl}/user-leave-rule/register-leave-user-rule`;
  //   return this.httpClient.put<UserLeaveSettingRule>(url, userLeaveSettingRule);
  // }

  registerUserOfLeaveSetting(
    leaveSettingId: number,
    userUuids: string[]
  ): Observable<any> {
    const url = `${this.baseUrl}/user-leave-rule/register-leave-user-rule`;
    const payload = {
      leaveSettingId,
      userUuids,
    };
    return this.httpClient.put(url, payload);
  }

  getFullLeaveSettingInformation(): Observable<FullLeaveSettingResponse[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Add any additional headers as needed
    });
    return this.httpClient.get<FullLeaveSettingResponse[]>(
      `${this.baseUrl}/user-leave-rule/get/leave-full-rule`,
      { headers }
    );
  }

  getLeaveSettingInformationById(
    leaveSettingId: number
  ): Observable<FullLeaveSettingResponse> {
    const params = { leaveTemplateId: leaveSettingId.toString() };
    return this.httpClient.get<FullLeaveSettingResponse>(
      `${this.baseUrl}/leave-template/id`,
      { params }
    );
  }

  deleteLeaveSettingRule(leaveSettingId: number): Observable<void> {
    const url = `${this.baseUrl}/user-leave-rule/delete-leave-setting-rule?leaveSettingId=${leaveSettingId}`;
    return this.httpClient.delete<void>(url);
  }

  sendMailToEmployeesToCompleteOnboarding(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.httpClient.post<any>(
      `${this.baseUrl}/users/send-invite-to-employees`,
      {},
      { params }
    );
  }

  getAttendanceModeAll(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/mode/get/all`);
  }

  getAttendanceMode(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/mode/get`);
  }

  getAttendanceModeNew(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/mode/get-new`);
  }

  updateAttendanceMode(attendanceModeId: number): Observable<any> {
    const params = new HttpParams().set('attendance_mode_id', attendanceModeId);

    return this.httpClient.put<any>(
      `${this.baseUrl}/organization/update/attendance-mode`,
      {},
      { params }
    );
  }
  updateMasterAttendanceMode(
    attendanceMasterModeId: number,
    modeStepId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('attendance_master_mode_id', attendanceMasterModeId)
      .set('mode_step', modeStepId);

    return this.httpClient.put<any>(
      `${this.baseUrl}/organization/update/master/attendance-mode`,
      {},
      { params }
    );
  }

  getMasterAttendanceMode(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization/get/master/attendance-mode`
    );
  }

  getAttendanceModeStep(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization/get/attendance-mode-step`
    );
  }

  getOnboardingAdminUser(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/whatsapp-user-onboarding/onboarding-admin-user`
    );
  }

  checkShiftPresence(shiftName: string): Observable<any> {
    const params = new HttpParams().set('shiftName', shiftName);

    return this.httpClient.get<any>(
      `${this.baseUrl}/organization-shift-timing/check-shift-presence`,
      { params }
    );
  }

  getOrganizationUserNameWithShiftName(
    selectedStaffsUuids: string[],
    shiftId: number
  ): Observable<any> {
    let params = new HttpParams().set('shiftId', shiftId);

    return this.httpClient.post<any>(
      `${this.baseUrl}/organization-shift-timing/get-organization-user-shift-name`,
      selectedStaffsUuids,
      { params }
    );
  }

  getOrganizationUserNameWithBranchName(
    selectedStaffsUuids: string[],
    addressId: number
  ): Observable<any> {
    let params = new HttpParams().set('addressId', addressId);

    return this.httpClient.post<any>(
      `${this.baseUrl}/user-verification/get-organization-user-branch-name`,
      selectedStaffsUuids,
      { params }
    );
  }

  getBestPerformerAttendanceDetails(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-best-performer-attendance-details`,
      { params }
    );
  }
  getLateEmployeeAttendanceDetails(
    date: string,
    dataFetchingType: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('date', date)
      .set('data_fetching_type', dataFetchingType);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-late-employee-attendance-details`,
      { params }
    );
  }

  getLateEmployeeDashboardDetails(
    date: string,
    dataFetchingType: string,
    searchTerm: string,
    pageNumber: number,
    itemPerPage: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('date', date)
      .set('data_fetching_type', dataFetchingType)
      .set('search_term', searchTerm)
      .set('page_number', pageNumber)
      .set('items_per_page', itemPerPage);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-late-employee-dashboard`,
      { params }
    );
  }

  registerLeaveSettingRules(
    fullLeaveSettingRequest: FullLeaveSettingRequest
  ): Observable<FullLeaveSettingRequest> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.httpClient.put<FullLeaveSettingRequest>(
      `${this.baseUrl}/user-leave-rule/register-leave-setting-rules`,
      fullLeaveSettingRequest,
      { headers }
    );
  }

  getAttendanceReportByDateDuration(
    startDate: string,
    endDate: string,
    pageNumber: number,
    itemPerPage: number,
    search: string,
    searchBy: string,
    teamId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('page_number', pageNumber)
      .set('item_per_page', itemPerPage)
      .set('search', search)
      .set('search_by', searchBy)
      .set('team_id', teamId);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-attendance-report-by-date-duration`,
      { params }
    );
  }


  getAttendanceReportByDateDurationByUser(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-attendance-report-by-date-duration-by-user`,
      { params }
    );
  }

  checkinCheckoutInSlack(userUuid: string, command: string): Observable<any> {
    const params = new HttpParams()
      .set('user_uuid', userUuid)
      .set('command', command);

    return this.httpClient.post<any>(
      `${this.baseUrl}/attendance/checkin-checkout-from-dashboard`,
      {},
      { params }
    );
  }

  checkinCheckoutStatus(userUuid: string): Observable<any> {
    const params = new HttpParams().set('user_uuid', userUuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/checkin-checkout-status`,
      { params }
    );
  }

  getAttendanceLogs(uuid: string, date: string): Observable<any> {
    const params = new HttpParams().set('uuid', uuid).set('date', date);

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-logs`, {
      params,
    });
  }

  findUsersOfLeaveSetting(
    leaveSettingId: number,
    searchText: string,
    pageNumber: number,
    itemPerPage: number,
    selectedTeamIdOfAddedUsers: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('search', searchText)
      .set('leaveSettingId', leaveSettingId)
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage)
      .set('teamId', selectedTeamIdOfAddedUsers);
    return this.httpClient.get(
      `${this.baseUrl}/user-leave-rule/leaveSettingId/users-leave-setting`,
      { params }
    );
  }

  // deleteAllUsersByLeaveSettingId(userUuids: string[]): Observable<void> { amit
  //   const url = `${this.baseUrl}/user-leave-rule/delete-all-users-leave-setting-rule`;
  //   return this.httpClient.delete<void>(url, { body: userUuids });
  // }

  deleteAllUsersByLeaveSettingId(userIds: number[]): Observable<void> {
    const url = `${this.baseUrl}/user-leave-rule/delete-all-users-leave-setting-rule`;
    return this.httpClient.delete<void>(url, { body: userIds });
  }

  deleteUserFromUserLeaveRule(userUuid: string): Observable<void> {
    const url = `${this.baseUrl}/user-leave-rule/delete-user-from-leave-setting-rule?userUuid=${userUuid}`;
    return this.httpClient.delete<void>(url);
  }


  addUserToLeaveRule(userId: number, leaveSettingId: number): Observable<any> {
    const url = `${this.baseUrl}/user-leave-rule/add-users-in-leave-setting?userUuid=${userId}&leaveSettingId=${leaveSettingId}`;
    return this.httpClient.post<any>(url, {});
  }

  testing(testing: Testing): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/testing/register`,
      testing
    );
  }

  deleteUserOfRoleAndSecurity(id: number): Observable<void> {
    const url = `${this.baseUrl}/role/deleteUserAndControlById?id=${id}`;
    return this.httpClient.delete<void>(url);
  }

  deleteRolesOfRoleAndSecurity(roleId: number): Observable<void> {
    const url = `${this.baseUrl}/role/deleteAllData/roleId?roleId=${roleId}`;
    return this.httpClient.delete<void>(url);
  }

  getTotalCountOfUsersOfRoleAndSecurity(roleId: number): Observable<any> {
    const url = `${this.baseUrl}/role/totalUsersCount?roleId=${roleId}`;
    return this.httpClient.get<any>(url);
  }

  disableUserFromDashboard(userId: number): Observable<any> {
    const url = `${this.baseUrl}/users/change-disable-status?userId=${userId}`;
    return this.httpClient.post<any>(url, {});
  }

  deleteUserResignation(id: number): Observable<any> {
    const url = `${this.baseUrl}/user-resignation`;
    return this.httpClient.delete<any>(url, {
      params: { id: id.toString() },
    });
  }

  getUserResignations(
    status: string | null,
    name: string | null,
    page: number = 1,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    if (name) {
      params = params.set('name', name);
    }

    return this.httpClient.get(
      `${this.baseUrl}/user-resignation/get-by-filter`,
      { params }
    );
  }

  setOrganizationAddressDetail(
    organizationAddressDetail: OrganizationAddressDetail
  ): Observable<any> {
    return this.httpClient.put<any>(
      `${this.baseUrl}/organization-address/save-address`,
      organizationAddressDetail
    );
  }

  getOrganizationAddressDetail(): Observable<any> {
    const url = `${this.baseUrl}/organization-address/get/address`;
    return this.httpClient.get<any>(url);
  }

  getAllRoleAccessibilityType(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/role/get-all-accessibility-type`,
      {}
    );
  }

  getOrganizationLatLong(userUuid: string): Observable<any> {
    const url = `${this.baseUrl}/user-verification/address/latlong?userUuid=${userUuid}`;
    return this.httpClient.get<any>(url, {});
  }

  markAttendaceWithLocation(
    employeeAttendanceLocation: EmployeeAttendanceLocation,
    userUuid: string
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/attendance/check-in-location?userUuid=${userUuid}`,
      employeeAttendanceLocation
    );
  }

  getEmployeeStatus(userUuid: string): Observable<OnboardingSidebarResponse> {
    const url = `${this.baseUrl}/sidebar-component/get-onboarding-status?userUuid=${userUuid}`;
    return this.httpClient.get<OnboardingSidebarResponse>(url, {});
  }

  getRoleById(roleId: number): Observable<any> {
    const params = new HttpParams().set('role_id', roleId);

    return this.httpClient.get<any>(`${this.baseUrl}/role/get-by-id`, {
      params,
    });
  }

  setReasonOfRejection(
    userUuid: string,
    reasonOfRejectionProfile: ReasonOfRejectionProfile
  ): Observable<any> {
    const url = `${this.baseUrl}/employee-onboarding-status/save-rejection-reason?userUuid=${userUuid}`;
    return this.httpClient.put<any>(url, reasonOfRejectionProfile);
  }

  statusResponseMailToUser(
    userUuid: string,
    requestString: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('userUuid', userUuid)
      .set('requestString', requestString);

    return this.httpClient.post<any>(
      `${this.baseUrl}/notification/send/statusNotification/user`,
      {},
      { params }
    );
  }

  getAttendanceDetailsCount(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get-attendance-details-count`,
      { params }
    );
  }

  getAccessibleSubModuleResponse(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/role/get-accessible-sub-module-by-role-id`
    );
  }

  verifyUserOtp(email: string, otp: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.httpClient.post(
      `${this.baseUrl}/user/auth/verify/otp`,
      {},
      { params }
    );
  }

  checkUserPresence(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.httpClient.post(
      `${this.baseUrl}/user/auth/check/user/presence`,
      {},
      { params }
    );
  }

  sendUserOtpToMail(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.httpClient.post(
      `${this.baseUrl}/user/auth/sent/otp`,
      {},
      { params }
    );
  }

  sendUserOtpToMailNew(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.httpClient.post(
      `${this.baseUrl}/user/auth/sent/otp-new`,
      {},
      { params }
    );
  }

  registerPassword(email: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);
    return this.httpClient.post(
      `${this.baseUrl}/user/auth/save/password`,
      {},
      { params }
    );
  }

  resetPassword(email: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);
    return this.httpClient.post(
      `${this.baseUrl}/user/auth/reset/password`,
      {},
      { params }
    );
  }

  saveUserOnboardingFormStatus(userUuid: string): Observable<any> {
    // Construct the URL with userUuid as a parameter
    const url = `${this.baseUrl}/get/onboarding/save-form-status?userUuid=${userUuid}`;
    return this.httpClient.put<any>(url, {});
  }

  getOrganizationRegistrationDate(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization/registration/date/get`
    );
  }

  getUserJoiningDate(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient.get<any>(`${this.baseUrl}/users/joining/date`, {
      params,
    });
  }

  signInByWhatsapp(phoneNumber: string): Observable<any> {
    const url = `${this.baseUrl}/user/auth/sent/otp-whatsapp?phoneNumber=${phoneNumber}`;
    return this.httpClient.post<any>(url, {});
  }

  signInByWhatsappNew(phoneNumber: string): Observable<any> {
    const url = `${this.baseUrl}/user/auth/sent/otp-whatsapp-new?phoneNumber=${phoneNumber}`;
    return this.httpClient.post<any>(url, {});
  }

  verifyOtpByWhatsapp(phoneNumber: string, otp: string): Observable<any> {
    const url = `${this.baseUrl}/user/auth/verify/otp-whatsapp?phoneNumber=${phoneNumber}&otp=${otp}`;
    return this.httpClient.post<any>(url, {});
  }

  verifyOtpByWhatsappNew(
    phoneNumber: string,
    otp: string,
    promotionCode: string
  ): Observable<any> {
    const url = `${this.baseUrl}/user/auth/verify/otp-whatsapp-new?phoneNumber=${phoneNumber}&otp=${otp}&promotionCode=${promotionCode}`;
    return this.httpClient.post<any>(url, {});
  }

  updateUserProfilePassword(
    userPasswordRequest: UserPasswordRequest
  ): Observable<any> {
    const url = `${this.baseUrl}/user/auth/update/password`;
    return this.httpClient.post<any>(url, userPasswordRequest);
  }

  getUserAccountDetails(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/account-setting/details`);
  }

  updateProfilePicture(
    userPersonalInformationRequest: UserPersonalInformationRequest
  ): Observable<any> {
    debugger;
    const url = `${this.baseUrl}/account-setting/update/profile-picture`;
    return this.httpClient.put<any>(url, userPersonalInformationRequest);
  }
  getUserGuidelines(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/account-setting/guidelines`
    );
  }
  updateProfilePic(picUrl: string): Observable<any> {
    debugger;
    const url = `${this.baseUrl}/account-setting/update/profile-pic`;
    return this.httpClient.put<any>(url, picUrl);
  }

  lat: number = 0;
  lng: number = 0;
  radius: string = '';
  attendanceMode: number = 0;
  address!: string;
  saveEmployeeCurrentLocationLatLng(
    lat: number,
    lng: number,
    radius: string,
    attendanceMode: number,
    address: string
  ) {
    this.lat = lat;
    this.lng = lng;
    this.radius = radius;
    this.attendanceMode = attendanceMode;
    this.address = address;
  }

  checkAttendanceLocationLinkStatus(uniqueId: string): Observable<any> {
    const url = `${this.baseUrl}/user/auth/location-validator-url?uniqueId=${uniqueId}`;
    return this.httpClient.get<any>(url, {});
  }

  getLeavesDetailsOfEmployees(
    searchName: string,
    searchStatus: string,
    pageNumber: number,
    itemPerPage: number
  ): Observable<{
    totalCount: number;
    userLeaveDetails: UserLeaveDetailsWrapper[];
  }> {
    let params = new HttpParams()
      .set('searchName', searchName)
      .set('searchStatus', searchStatus)
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage);

    return this.httpClient
      .get<any>(
        `${this.baseUrl}/central-leave-management/by-filter/leave-users`,
        { params }
      )
      .pipe(
        map((response) => {
          const entries = Object.entries(response)[0];
          return {
            totalCount: Number(entries[0]),
            userLeaveDetails: entries[1] as UserLeaveDetailsWrapper[],
          };
        })
      );
  }

  getRequestedLeaveDetailsForUser(
    userUuid: string
  ): Observable<TotalRequestedLeavesReflection[]> {
    let params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient.get<TotalRequestedLeavesReflection[]>(
      `${this.baseUrl}/central-leave-management/total-requested-leaves`,
      { params }
    );
  }

  getApprovedLeaveDetailsForUser(
    userUuid: string,
    leaveType: string
  ): Observable<TotalRequestedLeavesReflection[]> {
    let params = new HttpParams()
      .set('userUuid', userUuid)
      .set('leaveType', leaveType);
    return this.httpClient.get<TotalRequestedLeavesReflection[]>(
      `${this.baseUrl}/central-leave-management/total-approved-leaves`,
      { params }
    );
  }

  approveOrRejectLeave(
    requestedLeaveId: number,
    appRejString: string,
    logInUserUuid: string
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/leave/approve-reject-leaves?requestedLeaveId=${requestedLeaveId}&appRejString=${appRejString}&userUuid=${logInUserUuid}`,
      {}
    );
  }

  //Salary module

  getSalaryCalculationModeByOrganizationId(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/calculation/mode/get`
    );
  }


  generateNewAttendanceLinkGupShup(userUuid: string): Observable<any> {
    let params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient.post<any>(
      `${this.baseUrl}/attendance/gupshup/regenerate-attendance-link`,
      {},
      { params }
    );
  }


  enableOrDisableStatutory(
    statutoryRequest: StatutoryRequest
  ): Observable<any> {
    debugger;
    return this.httpClient.post<any>(
      `${this.baseUrl}/statutory/enable-disable`,
      statutoryRequest
    );
  }

  updateTaxRegimeByUserId(taxRegimeId: number): Observable<any> {
    const params = new HttpParams().set('tax_regime_id', taxRegimeId);

    return this.httpClient.put<any>(
      `${this.baseUrl}/statutory/tax-regime/update`,
      {},
      { params }
    );
  }

  getSalaryConfigurationStep(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/configuration/step/get`
    );
  }

  updateSalaryConfigurationStep(
    salaryConfigurationStepId: number
  ): Observable<any> {
    const params = new HttpParams().set(
      'salary_configuration_step_id',
      salaryConfigurationStepId
    );

    return this.httpClient.put<any>(
      `${this.baseUrl}/salary/configuration/step/update`,
      {},
      { params }
    );
  }
  updateNotificationSetting(notificationVia: NotificationVia): Observable<any> {
    return this.httpClient.put<any>(
      `${this.baseUrl}/account-setting/update/notification-via`,
      notificationVia
    );
  }

  updateLanguageSetting(
    language: string
  ): Observable<{ [key: string]: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Call the API and pass the language as a query parameter
    return this.httpClient.put<{ [key: string]: string }>(
      `${this.baseUrl}/account-setting/user-language`,
      null,
      {
        params: { language },
        headers,
      }
    );
  }

  updateNotificationViaSetting(
    via: string
  ): Observable<{ [key: string]: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Call the API and pass the language as a query parameter
    return this.httpClient.put<{ [key: string]: string }>(
      `${this.baseUrl}/account-setting/user-notification`,
      null,
      {
        params: { via },
        headers,
      }
    );
  }
  getNotificationSetting(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/account-setting/notification-setting`
    );
  }

  sendOtptoSavePhoneNumber(phoneNumber: string): Observable<boolean> {
    const params = new HttpParams().set('phoneNumber', phoneNumber);
    return this.httpClient.post<boolean>(
      `${this.baseUrl}/account-setting/send-otp/phoneNumber`,
      {},
      { params }
    );
  }

  verifyOtpForUpdatingPhoneNumber(
    phoneNumber: string,
    otp: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('phoneNumber', phoneNumber)
      .set('otp', otp);
    return this.httpClient.post<any>(
      `${this.baseUrl}/account-setting/verifyOtp`,
      {},
      { params }
    );
  }

  registerSalaryTemplate(
    salaryTemplateComponentRequest: SalaryTemplateComponentRequest
  ): Observable<any> {
    return this.httpClient.put<any>(
      `${this.baseUrl}/salary/template/register`,
      salaryTemplateComponentRequest,
      {}
    );
  }

  // #########  holidays ###########

  registerHoliday(customHolidayRequest: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/holiday/register-custom-holidays`,
      customHolidayRequest
    );
  }

  getUniversalHolidays(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}/holiday/total-universal-holidays`
    );
  }

  registerCustomHolidays(customHolidaysRequest: any[]): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/holiday/register-custom-holidays?orgUuid`,
      customHolidaysRequest
    );
  }

  getCustomHolidays(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}/holiday/total-custom-holidays?orgUuid`
    );
  }

  deleteCustomHolidays(ids: number): Observable<any> {
    return this.httpClient.delete(
      `${this.baseUrl}/holiday/delete-custom-holidays`,
      { params: { ids: ids } }
    );
  }

  getWeeklyHolidays(): Observable<WeeklyHoliday[]> {
    return this.httpClient.get<WeeklyHoliday[]>(
      `${this.baseUrl}/holiday/total-weekly-holidays`
    );
  }

  getWeekDays(): Observable<WeekDay[]> {
    return this.httpClient.get<WeekDay[]>(
      `${this.baseUrl}/holiday/get-week-days`
    );
  }

  registerWeeklyHolidays(weeklyHolidays: string[]): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/holiday/register-weekly-holidays`,
      weeklyHolidays
    );
  }

  deleteWeeklyHolidays(id: number): Observable<any> {
    let params = new HttpParams().set('id', id.toString());
    return this.httpClient.delete(
      `${this.baseUrl}/holiday/delete-weekly-holidays`,
      { params }
    );
  }

  getAllHoliday() {
    return this.httpClient.get<WeekDay[]>(`${this.baseUrl}/holiday/all`);
  }

  // ###############

  getSalaryTemplateComponentById(salaryTemplateId: number): Observable<any> {
    const params = new HttpParams().set('salary_template_id', salaryTemplateId);

    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/template/component/get/by/id`,
      { params }
    );
  }

  getSalaryTemplateComponentByUserUuid(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/template/component/get-by-user-uuid`
    );
  }

  updateLanguagePreferredForNotification(
    languagePreferred: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('languagePreferred', languagePreferred)
      .set('phoneNumber', '');
    return this.httpClient.post<any>(
      `${this.baseUrl}/account-setting/update/language-preferred`,
      null,
      { params }
    );
  }

  deleteSalaryTemplateById(salaryTemplateId: number): Observable<any> {
    const params = new HttpParams().set('salary_template_id', salaryTemplateId);

    return this.httpClient.delete<any>(
      `${this.baseUrl}/salary/template/delete-by-id`,
      { params }
    );
  }


  generateAttendanceSummary(
    startDate: string,
    endDate: string,
    userIds: number[] | null
  ): Observable<any> {
    let params = new HttpParams()
      .append('startDate', startDate)
      .append('endDate', endDate);

    // Add userIds to the params if not null
    if (userIds) {
      params = params.append(
        'userIds',
        userIds.length > 0 ? userIds.join(',') : ''
      );
    } else {
      // Explicitly send an empty value for userIds
      params = params.append('userIds', '');
    }

    return this.httpClient.post(
      `${this.baseUrl}/generate-reports/save-attendance-summary-logs`,
      null,
      { params }
    );
  }


  generateAttendanceReport(
    startDate: string,
    endDate: string,
    userIds: number[] | null
  ): Observable<any> {
    let params = new HttpParams();
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);

    // Add userIds to the params if not null
    if (userIds) {
      params = params.append(
        'userIds',
        userIds.length > 0 ? userIds.join(',') : ''
      );
    } else {
      // Explicitly send an empty value for userIds
      params = params.append('userIds', '');
    }

    return this.httpClient.post(
      `${this.baseUrl}/generate-reports/save-attendance-report-logs`,
      null,
      { params }
    );
  }
  getAllReportLogs(): Observable<any> {
    return this.httpClient.get(
      `${this.baseUrl}/generate-reports/get-attendance-report-logs`
    );
  }

  generateSalaryReport(startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);

    return this.httpClient.post(
      `${this.baseUrl}/generate-reports/save-salary-report-logs`,
      null,
      { params }
    );
  }

  updateAttendanceNotificationSettingForManager(
    employeeAttendanceFlag: boolean,
    type: number
  ): Observable<any> {
    let params = new HttpParams();
    params = params.append('flag', employeeAttendanceFlag);
    params = params.append('type', type);

    return this.httpClient.post(
      `${this.baseUrl}/account-setting/update/Attendance-notification-setting`,
      null,
      { params }
    );
  }

  sendOnboardingNotificationInWhatsapp(): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/whatsapp-user-onboarding/send-whatsapp-onboarding-notification`,
      {}
    );
  }

  getOnboardingVia(): Observable<any> {
    return this.httpClient.get(
      `${this.baseUrl}/whatsapp-user-onboarding/get-onboarding-via`
    );
  }

  //  central - leave - management

  approveOrRejectLeaveOfUser(
    requestedLeaveId: number,
    appRejString: string,
    rejectionReason: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('requestedLeaveId', requestedLeaveId)
      .set('appRejString', appRejString)
      .set('rejectionReason', rejectionReason);
    return this.httpClient.post<any>(
      `${this.baseUrl}/leave/approve-reject-leaves`,
      {},
      { params }
    );
  }

  getFullLeaveLogsRoleWise(
    searchString: string,
    teamString: string,
    page: number,
    size: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('searchString', searchString)
      .set('teamString', teamString)
      .set('page', page)
      .set('size', size);
    return this.httpClient.get<any>(
      `${this.baseUrl}/central-leave-management/get-full-leave-logs-role-wise`,
      { params }
    );
  }

  getPendingLeaves(page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.httpClient.get<any>(
      `${this.baseUrl}/central-leave-management/get-pending-leaves-role-wise`,
      { params }
    );
  }

  getTotalCountsOfPendingLeaves(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/central-leave-management/get-count-of-pending-leaves-role-wise`
    );
  }

  getApprovedRejectedLeaveLogs(page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.httpClient.get<any>(
      `${this.baseUrl}/central-leave-management/get-approved-rejected-leave-logs-role-wise`,
      { params }
    );
  }

  getRequestedUserLeaveByLeaveIdAndLeaveType(
    leaveId: number,
    leaveType: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('leaveId', leaveId)
      .set('leaveType', leaveType);
    return this.httpClient.get<any>(
      `${this.baseUrl}/central-leave-management/get-pending-leave-by-leave-id-leave-type`,
      { params }
    );
  }

  getAllTeamNames(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/central-leave-management/get-all-team-names`
    );
  }

  shiftTimingExists(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization-shift-timing/exists`
    );
  }

  getWeeklyLeaveSummary(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}/central-leave-management/get-weekly-chart-data`
    );
  }

  getMonthlyLeaveSummary(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}/central-leave-management/get-monthly-chart-data`
    );
  }

  getConsumedLeaves(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}/central-leave-management/get-total-consumed-leaves`
    );
  }

  getOrganizationMonthWiseSalaryData(
    itemPerPage: number,
    pageNumber: number,
    sort: string,
    sortBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('item_per_page', itemPerPage)
      .set('page_numner', pageNumber)
      .set('sort', sort)
      .set('sort_by', sortBy);
    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/organization-month-wise-data`,
      { params }
    );
  }

  getEmployeeMonthWiseSalaryData(
    itemPerPage: number,
    pageNumber: number,
    search: string,
    searchBy: string,
    sort: string,
    sortBy: string
  ): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/month-wise-salary/data`);
  }
  getTotalExperiences(userUuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', userUuid);
    return this.httpClient.get<any>(
      `${this.baseUrl}/employee-onboarding-status/get-experiences-duration`,
      { params }
    );
  }

  updateOrganizationWeekOff(
    organizationWeekoffInformation: OrganizationWeekoffInformation[]
  ): Observable<any> {
    return this.httpClient.put<any>(
      `${this.baseUrl}/holiday/update-weekoffs`,
      organizationWeekoffInformation,
      {}
    );
  }

  getNewJoineeByOrganizationId(
    itemPerPage: number,
    pageNumber: number,
    search: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('search', search)
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/user/change/new-joinee`,
      { params }
    );
  }

  getUserExitByOrganizationId(
    itemPerPage: number,
    pageNumber: number,
    sort: string,
    sortBy: string,
    search: string,
    searchBy: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('sort', sort)
      .set('sort_by', sortBy)
      .set('search', search)
      .set('search_by', searchBy)
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/user/change/user-exit`,
      { params }
    );
  }

  getFinalSettlementByOrganizationId(
    itemPerPage: number,
    pageNumber: number,
    sort: string,
    sortBy: string,
    search: string,
    searchBy: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('sort', sort)
      .set('sort_by', sortBy)
      .set('search', search)
      .set('search_by', searchBy)
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/user/change/final-settlement`,
      { params }
    );
  }



  getPayActionTypeList(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/user/change/pay-action-type-get-all`,
      {}
    );
  }

  getNoticePeriodList(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/user/change/notice-period-get-all`,
      {}
    );
  }

  getHolidays(page: number, itemsPerPage: number): Observable<any> {
    const params = {
      page: `${page}`,
      itemsPerPage: `${itemsPerPage}`,
    };
    return this.httpClient.get<any>(
      `${this.baseUrl}/holiday/get-all-holidays`,
      {
        params,
      }
    );
  }

  getNextSixHolidays(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/holiday/get-next-six-holidays`
    );
  }

  getCurrentYearHolidays(year: number): Observable<any> {
    const params = new HttpParams().set('year', year);
    return this.httpClient.get<any>(`${this.baseUrl}/holiday/year-holidays`, {
      params,
    });
  }

  getHolidayCounts(): Observable<any> {
    return this.httpClient.get(
      `${this.baseUrl}/holiday/get-Counts-of-holidays`
    );
  }

  registerNewJoineeAndUserExit(
    newJoineeAndUserExitRequestList: NewJoineeAndUserExitRequest[],
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.post<any>(
      `${this.baseUrl}/salary/user/change/register-new-joinee-and-user-exit`,
      newJoineeAndUserExitRequestList,
      { params }
    );
  }

  getOrganizationAllShiftCounts(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization-shift-timing/get-organization-all-shift-counts`
    );
  }

  getAdminVerifiedForOnboardingUpdate(
    userUuid: string,
    adminUuid: string
  ): Observable<any> {
    const params = {
      userUuid: `${userUuid}`,
      adminUuid: `${adminUuid}`,
    };
    return this.httpClient.get<any>(
      `${this.baseUrl}/employee-onboarding-status/check-admin`,
      {
        params,
      }
    );
  }

  getIsAdminForWhatsappLeave(userUuid: string): Observable<any> {
    const params = {
      userUuid: `${userUuid}`,
    };
    return this.httpClient.get<any>(
      `${this.baseUrl}/employee-onboarding-status/check-admin-whatsapp-leave`,
      {
        params,
      }
    );
  }

  setEmployeeCompanyDocuments(
    userUuid: string,
    onboardingPreviewData: OnboardingFormPreviewResponse
  ): Observable<any> {
    debugger;
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient
      .put<any>(
        `${this.baseUrl}/user-documents-details/save/user-company-documents`,
        onboardingPreviewData,
        { params }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }

  getEmployeeCompanyDocuments(userUuid: string): Observable<any> {
    debugger;
    const params = new HttpParams().set('userUuid', userUuid);
    const url = `${this.baseUrl}/user-documents-details/get/user-company-documents`;
    return this.httpClient.get(url, { params });
  }

  deleteEmployeeCompanyDocById(
    documentId: number,
    userUuid: string
  ): Observable<any> {
    // Create HttpParams and chain the setting of parameters
    const params = new HttpParams()
      .set('documentId', documentId.toString()) // Ensure the ID is sent as a string
      .set('userUuid', userUuid);

    return this.httpClient.delete<any>(
      `${this.baseUrl}/user-documents-details/delete/companyDoc`,
      { params }
    );
  }

  deleteLeaveSettingCategoryById(
    leaveSettingCategoriesId: number
  ): Observable<void> {
    return this.httpClient.delete<void>(
      `${this.baseUrl}/user-leave-rule/delete-leave-setting-category-by-Id`,
      {
        params: {
          leaveSettingCategoriesId: leaveSettingCategoriesId,
        },
      }
    );
  }

  deleteLeaveTemplateCategory(id: number) {
    const params = new HttpParams().set('leaveCategoryId', id);
    return this.httpClient.delete<void>(
      `${this.baseUrl}/leave-template/category`,
      { params }
    );
  }

  deleteLeaveTemplate(id: number) {
    const params = new HttpParams().set('leaveTemplateId', id);
    return this.httpClient.delete<void>(`${this.baseUrl}/leave-template`, {
      params,
    });
  }

  getTeamListUserForEmpOnboarding(): Observable<any> {
    const url = `${this.baseUrl}/users/fetch-team-list-user`;
    return this.httpClient.get(url, {});
  }

  getTesting() {
    return this.httpClient.get(`${this.baseUrl}/attendance/testing-get`);
  }

  postTesting(temp: Temp) {
    return this.httpClient.post<any>(
      `${this.baseUrl}/attendance/testing-post`,
      temp
    );
  }

  getSlackAuthUrl() {
    return this.httpClient.get(`${this.baseUrl}/organization/slack/auth/url`);
  }

  getSlackAuthUrlForSignInWithSlack() {
    return this.httpClient.get(
      `${this.baseUrl}/organization/slack/auth/url/sign/in/with/slack`
    );
  }

  disconnectOrganization(): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/organization/disconnect/hajiri/form/slack/workspace`,
      null
    );
  }

  getOrgIsInstalledFlag(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization/is/installed/flag`
    );
  }

  getBreakUsers(
    searchTerm: string,
    pageNumber: number,
    itemsPerPage: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('searchTerm', searchTerm || '')
      .set('pageNumber', pageNumber.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/break-users`, {
      params,
    });
  }

  getLeaveUsers(
    searchTerm: string,
    pageNumber: number,
    itemsPerPage: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('searchTerm', searchTerm || '')
      .set('pageNumber', pageNumber.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/leave-users`, {
      params,
    });
  }
  getLeaveTypeResponseByUserUuid(uuid: string): Observable<any> {
    const params = new HttpParams().set('user_uuid', uuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/leave-setting-category/list-by-user-uuid`,
      { params }
    );
  }

  saveOrganizationHrPolicies(policyDocString: string): Observable<any> {
    const params = new HttpParams().set('policyDocString', policyDocString);

    const url = `${this.baseUrl}/organization-personal-information/save/policy/doc`;
    return this.httpClient.put<any>(url, {}, { params });
  }

  getOrganizationHrPolicies(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization-personal-information/get/policy/doc`
    );
  }

  saveStaffAddressDetails(
    staffAddressDetails: any,
    addressId: number
  ): Observable<any> {
    const params = new HttpParams().set('addressId', addressId);
    return this.httpClient.put(
      `${this.baseUrl}/user-verification/save/staff/location`,
      staffAddressDetails,
      { params }
    );
  }

  getAllAddressDetailsWithStaff(): Observable<any> {
    return this.httpClient.get(
      `${this.baseUrl}/user-verification/get/organization/all/multi/locations`
    );
  }

  getAddressDetailsOfStaffByAddressIdAndType(
    addressId: number,
    addressString: string
  ): Observable<any> {
    return this.httpClient.get(
      `${this.baseUrl}/user-verification/get/organization/locations/by/Id`,
      {
        params: {
          addressId: addressId.toString(),
          addressString: addressString,
        },
      }
    );
  }

  deleteByAddressId(addressId: number): Observable<any> {
    const url = `${this.baseUrl}/user-verification/delete/multilocation/addressId?addressId=${addressId}`;
    return this.httpClient.delete(url);
  }

  getEmployeeSalary(userUuid: string): Observable<any> {
    const params = new HttpParams().set('user_uuid', userUuid);

    return this.httpClient.get<any>(`${this.baseUrl}/salary/ctc`, { params });
  }

  saveAppraisalRequest(appraisalRequest: AppraisalRequest) {
    return this.httpClient.post<any>(
      `${this.baseUrl}/salary/appraisal`,
      appraisalRequest
    );
  }

  getSalaryChangeOvertimeResponseListByOrganizationId(
    startDate: string,
    endDate: string,
    itemPerPage: number,
    pageNumber: number,
    search: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('search', search)
      .set('search_by', searchBy);

    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/payroll-dashboard/salary-change/overtime`,
      { params }
    );
  }

  registerSalaryChangeBonusListByOrganizationId(
    salaryChangeBonusRequestList: SalaryChangeBonusRequest[]
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/salary/payroll-dashboard/salary-change/bonus`,
      salaryChangeBonusRequestList
    );
  }

  registerSalaryChangeOvertimeListByOrganizationId(
    salaryChangeOvertimeRequestList: SalaryChangeOvertimeRequest[]
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/salary/payroll-dashboard/salary-change/overtime`,
      salaryChangeOvertimeRequestList,
      {}
    );
  }

  getEpfDetailsResponseListByOrganizationId(
    startDate: string,
    endDate: string,
    itemPerPage: number,
    pageNumber: number,
    search: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('search', search)
      .set('search_by', searchBy);

    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/payroll-dashboard/statutory/epf`,
      { params }
    );
  }

  getEsiDetailsResponseListByOrganizationId(
    startDate: string,
    endDate: string,
    itemPerPage: number,
    pageNumber: number,
    search: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('search', search)
      .set('search_by', searchBy);

    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/payroll-dashboard/statutory/esi`,
      { params }
    );
  }

  getTdsDetailsResponseListByOrganizationId(
    startDate: string,
    endDate: string,
    itemPerPage: number,
    pageNumber: number,
    search: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('search', search)
      .set('search_by', searchBy);

    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/payroll-dashboard/statutory/tds`,
      { params }
    );
  }



  registerEpfDetailsListByOrganizationId(
    startDate: string,
    endDate: string,
    epfDetailsRequestList: EpfDetailsRequest[]
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.post<any>(
      `${this.baseUrl}/salary/payroll-dashboard/statutory/epf`,
      epfDetailsRequestList,
      { params }
    );
  }

  registerEsiDetailsListByOrganizationId(
    startDate: string,
    endDate: string,
    esiDetailsRequestList: EsiDetailsRequest[]
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.post<any>(
      `${this.baseUrl}/salary/payroll-dashboard/statutory/esi`,
      esiDetailsRequestList,
      { params }
    );
  }

  registerTdsDetailsListByOrganizationId(
    startDate: string,
    endDate: string,
    tdsDetailsRequestList: TdsDetailsRequest[]
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.post<any>(
      `${this.baseUrl}/salary/payroll-dashboard/statutory/tds`,
      tdsDetailsRequestList,
      { params }
    );
  }

  getAttendanceDetailsForUserByDate(
    userEmail: string,
    date: string
  ): Observable<any> {
    const url = `${this.baseUrl}/attendance/get-attendance-details-for-user-by-date`;

    const params = new HttpParams()
      .set('user_email', userEmail)
      .set('date', date);

    return this.httpClient.get<any>(url, { params });
  }

  sendEmails(userEmails: any, sendMail: boolean): Observable<any> {
    const url = `${this.baseUrl}/users/send-email-to-all-users`;

    const params = new HttpParams()
      .set('emails', userEmails)
      .set('sendMail', sendMail);

    return this.httpClient.post<any>(url, {}, { params });
  }

  getAtendanceDailyReport(
    startDate: string,
    userIds: number[] | null
  ): Observable<any> {
    const url = `${this.baseUrl}/attendance/excel/download/daily/report`;

    let params = new HttpParams();
    params = params.append('start_date', startDate);

    // Add userIds to the params if not null
    if (userIds) {
      params = params.append(
        'userIds',
        userIds.length > 0 ? userIds.join(',') : ''
      );
    } else {
      // Explicitly send an empty value for userIds
      params = params.append('userIds', '');
    }

    return this.httpClient.get<any>(url, { params });
  }
  getAssetCategory(): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/get/asset/category`;
    return this.httpClient.get<any>(url, {}).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getAssetCategoryById(categoryId: number): Observable<any> {
    let params = new HttpParams().set('categoryId', categoryId);
    const url = `${this.baseUrl}/asset/allocation/get/asset/category/by/Id`;
    return this.httpClient.get<any>(url, { params }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getAllAssetCategory(): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/get/All/asset/category`;
    return this.httpClient.get<any>(url, {}).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getAssetUserList(): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/get/asset/user/list`;
    return this.httpClient.get<any>(url, {}).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getTotalAsset(): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/get/total/asset`;
    return this.httpClient.get<any>(url, {}).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getTotalAssetsStatusWise(
    filterString: string,
    search: string,
    pageNumber: number,
    itemPerPage: number
  ): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/get/total/asset/by/status`;
    let params = new HttpParams()
      .set('filterString', filterString)
      .set('search', search)
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage);
    return this.httpClient.get<any>(url, { params }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getAsset(
    search: string,
    pageNumber: number,
    itemPerPage: number
  ): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/get/asset`;
    let params = new HttpParams()
      .set('search', search)
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage);
    return this.httpClient.get<any>(url, { params }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getAssetById(assetId: number): Observable<any> {
    let params = new HttpParams().set('assetId', assetId);
    const url = `${this.baseUrl}/asset/allocation/get/asset/by/Id`;
    return this.httpClient.get<any>(url, { params }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  createAsset(assetRequest: OrganizationAssetRequest): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/asset/allocation/create/asset`,
      assetRequest
    );
  }
  createAssetRequest(formData: any): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/asset-requests/create`,
      formData
    );
  }
  getAssetRequestById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/asset-requests?id=${id}`);
  }
  getAssetRequestByID(id: number): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/asset-requests/by-id?id=${id}`
    );
  }
  getAssetRequestsByUserUuid(
    uuid: string,
    page: number = 0,
    size: number = 10,
    search: string = '',
    status: string = ''
  ): Observable<{
    data: AssetRequestDTO[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('status', status.toString())
      .set('search', search);

    return this.httpClient.get<{
      data: AssetRequestDTO[];
      currentPage: number;
      totalItems: number;
      totalPages: number;
    }>(`${this.baseUrl}/asset-requests/user/${uuid}`, { params });
  }

  getAssetRequests(
    page: number = 0,
    size: number = 10,
    search: string = '',
    status: any = ''
  ): Observable<{
    data: AssetRequestDTO[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('status', status.toString())
      .set('search', search);

    return this.httpClient.get<{
      data: AssetRequestDTO[];
      currentPage: number;
      totalItems: number;
      totalPages: number;
    }>(`${this.baseUrl}/asset-requests/users`, { params });
  }

  changeAssetRequestStatus(id: number, status: string): Observable<any> {
    const url = `${this.baseUrl}/asset-requests/${id}/change-status`;
    const params = new HttpParams().set('status', status);
    return this.httpClient.post<any>(url, null, { params });
  }

  editAsset(
    assetId: number,
    assetRequest: OrganizationAssetRequest
  ): Observable<any> {
    let params = new HttpParams().set('assetId', assetId);
    return this.httpClient.put<any>(
      `${this.baseUrl}/asset/allocation/edit/asset`,
      assetRequest,
      { params }
    );
  }

  assignOrReturnAsset(
    assetId: number,
    operationString: string,
    assignOrReturnRequest: any
  ): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/assign/return/asset`;
    const params = new HttpParams()
      .set('assetId', assetId)
      .set('requestString', operationString);

    return this.httpClient.put(url, assignOrReturnRequest, { params });
  }

  getCategoryCounts(): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/category-counts`;
    return this.httpClient.get<any>(url);
  }

  deleteAsset(assetId: number): Observable<any> {
    const params = new HttpParams().set('assetId', assetId);
    return this.httpClient.delete<any>(
      `${this.baseUrl}/asset/allocation/delete/asset`,
      { params }
    );
  }

  getEmployeePayslipResponseByUserUuid(
    userUuid: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('user_uuid', userUuid)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/month-wise/pay-slip`,
      { params }
    );
  }

  getEmployeePayslipBreakupResponseByUserUuid(
    userUuid: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('user_uuid', userUuid)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/month-wise/pay-slip-breakup`,
      { params }
    );
  }

  getEmployeePayslipDeductionResponseByUserUuid(
    userUuid: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('user_uuid', userUuid)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/month-wise/pay-slip-deduction`,
      { params }
    );
  }

  getEmployeePayslipLogResponseByUserUuid(
    userUuid: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('user_uuid', userUuid)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/salary/month-wise/pay-slip-log`,
      { params }
    );
  }

  getHolidayForOrganization(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);
    return this.httpClient.get<any>(`${this.baseUrl}/holiday/check-holiday`, {
      params,
    });
  }

  getHolidayForOrganizationWhatsapp(
    userUuid: string,
    date: string
  ): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid).set('date', date);
    return this.httpClient.get<any>(
      `${this.baseUrl}/holiday/check-holiday-whatsapp`,
      { params }
    );
  }

  registerLopReversalApplication(
    lopReversalApplicationRequest: LopReversalApplicationRequest
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/lop-reversal-application/register`,
      lopReversalApplicationRequest,
      {}
    );
  }

  importSalaryExcel(file: File, fileName: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);

    return this.httpClient.put(
      `${this.baseUrl}/salary/import-salary-excel`,
      formData
    );
  }

  saveSalaryExcelLog(fireBaseUrl: string): Observable<any> {
    const url = `${this.baseUrl}/salary/save-salary-excel`;
    const params = new HttpParams().set('firebase_url', fireBaseUrl);

    return this.httpClient.put(url, {}, { params });
  }

  getAssetForUser(
    userUuid: string,
    search: string,
    pageNumber: number,
    itemPerPage: number
  ): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/get/asset/allocation/user/entries`;
    let params = new HttpParams()
      .set('userUuid', userUuid)
      .set('search', search)
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage);
    return this.httpClient.get<any>(url, { params }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getAssetLogsForUser(userUuid: string, search: string): Observable<any> {
    const url = `${this.baseUrl}/asset/allocation/get/asset/allocation/user/logs`;
    let params = new HttpParams()
      .set('userUuid', userUuid)
      .set('search', search);
    return this.httpClient.get<any>(url, { params }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getAttendanceChecktimeList(
    userUuid: string,
    requestedDate: any,
    status: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('userUuid', userUuid)
      .set('requestedDate', requestedDate)
      .set('status', status);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get/checktime/list`,
      { params }
    );
  }

  sendAttendanceTimeUpdateRequest(
    attendanceTimeUpdateRequestDto: AttendanceTimeUpdateRequestDto
  ): Observable<any> {
    const url = `${this.baseUrl}/attendance/request-update`;
    return this.httpClient.post<any>(url, attendanceTimeUpdateRequestDto, {});
  }

  getAttendanceRequestById(id: any): Observable<any> {
    const params = new HttpParams().set('id', id);
    const url = `${this.baseUrl}/attendance/by-id`;
    return this.httpClient.get<any>(url, { params });
  }

  sendAttendanceTimeUpdateRequestWhatsapp(
    attendanceTimeUpdateRequestDto: AttendanceTimeUpdateRequestDto,
    userUuid: string,
    source: string
  ): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid).set('source', source);


    const url = `${this.baseUrl}/attendance/request-update-whatsapp`;
    return this.httpClient.post<any>(url, attendanceTimeUpdateRequestDto, {
      params,
    });
  }

  getAttendanceTimeUpdateRequestById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}?id=${id}`);
  }

  getAttendanceRequestLog(
    userUuid: string,
    pageNumber: number,
    itemPerPage: number,
    status: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('status', status)
      .set('userUuid', userUuid)
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get/attendance/request/logs`,
      { params }
    );
  }

  getFullAttendanceRequestLog(
    pageNumber: number,
    itemPerPage: number,
    searchString: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage)
      .set('searchString', searchString);
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get/full/attendance/request/logs`,
      { params }
    );
  }

  getAttendanceRequests(
    pageNumber: number,
    itemPerPage: number,
    searchString: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage)
      .set('searchString', searchString)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get/attendance/requests`,
      { params }
    );
  }

  getAttendanceRequestsHistory(
    pageNumber: number,
    itemPerPage: number,
    searchString: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage)
      .set('searchString', searchString)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get/attendance/requests/history`,
      { params }
    );
  }

  getAttendanceExistanceStatus(
    userUuid: string,
    selectedDate: any
  ): Observable<any> {
    const params = new HttpParams()
      .set('userUuid', userUuid)
      .set('selectedDate', selectedDate);
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get/attendance/existance/status`,
      { params }
    );
  }

  getAttendanceRequestCount(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get/attendance/request/count`,
      { params }
    );
  }

  approveOrRejectAttendanceRequest(
    attendanceReqId: number,
    requestString: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('attendanceRequestId', attendanceReqId)
      .set('status', requestString);
    const url = `${this.baseUrl}/attendance/approve/reject/attendance/requests`;
    return this.httpClient.put<any>(url, {}, { params });
  }

  getAdminPersonalDetail(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/users/personal-detail/admin`,
      {}
    );
  }

  enableOrDisablePreHourOvertimeSetting(
    overtimeSettingRequest: OvertimeSettingRequest
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/overtime/setting/pre-hour/enable-disable`,
      overtimeSettingRequest
    );
  }

  enableOrDisablePostHourOvertimeSetting(
    overtimeSettingRequest: OvertimeSettingRequest
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/overtime/setting/post-hour/enable-disable`,
      overtimeSettingRequest
    );
  }

  getPreHourOvertimeSettingResponse(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/overtime/setting/pre-hour`,
      {}
    );
  }

  getPostHourOvertimeSettingResponse(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/overtime/setting/post-hour`,
      {}
    );
  }
  getRoles(): Observable<any> {
    return this.httpClient.get(
      `${this.baseUrl}/super-coin-allocation/get/roles`
    );
  }

  allocateCoinsRoleAndOrganizationWise(
    allocateCoinsRoleWiseRequest: AllocateCoinsRoleWiseRequest
  ): Observable<any> {
    return this.httpClient.put(
      `${this.baseUrl}/super-coin-allocation/allocate/coins`,
      allocateCoinsRoleWiseRequest,
      {}
    );
  }

  getRoleWiseAllocatedCoins(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/super-coin-allocation/get/role/wise/coins/info`
    );
  }

  enableOrDisableOvertimeSetting(
    overtimeSettingRequest: OvertimeSettingRequest
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/overtime/setting/enable-disable`,
      overtimeSettingRequest,
      {}
    );
  }

  getRoleWiseAllocatedCoinsInformationById(
    allocateSuperCoinsId: number
  ): Observable<any> {
    let params = new HttpParams().set(
      'allocateSuperCoinsId',
      allocateSuperCoinsId
    );
    return this.httpClient.get(
      `${this.baseUrl}/super-coin-allocation/get/role/wise/coins/info/by/id`,
      { params }
    );
  }

  deleteRoleWiseAllocatedCoinsInformationById(
    allocateSuperCoinsId: number
  ): Observable<ResponseEntityObject> {
    const params = new HttpParams().set(
      'allocateSuperCoinsId',
      allocateSuperCoinsId
    );
    return this.httpClient.delete<ResponseEntityObject>(
      `${this.baseUrl}/super-coin-allocation/delete/by/id`,
      { params }
    );
  }

  getSuperCoinsResponseForEmployee(userUuid: string): Observable<any> {
    let params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient.get(
      `${this.baseUrl}/super-coin-allocation/get/super/coins/data/for/employee`,
      { params }
    );
  }

  getRemainingBadges(): Observable<any> {
    return this.httpClient.get(
      `${this.baseUrl}/super-coin-allocation/get/remaining/badges`
    );
  }

  allocateCoinsForBadgeOrganizationWise(
    allocateCoinsToBadgeRequest: AllocateCoinsToBadgeRequest,
    allocateCoinstoBadgeId: number
  ): Observable<any> {
    let params = new HttpParams().set(
      'allocateCoinstoBadgeId',
      allocateCoinstoBadgeId
    );
    return this.httpClient.put(
      `${this.baseUrl}/super-coin-allocation/allocate/coins/for/Badges`,
      allocateCoinsToBadgeRequest,
      { params }
    );
  }

  getBadgeCoinsInfo(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/super-coin-allocation/get/badge/coins/info`
    );
  }

  getBadgeCoinsInformationById(
    allocatedCoinsToBadgeId: number
  ): Observable<any> {
    let params = new HttpParams().set(
      'allocatedCoinsToBadgeId',
      allocatedCoinsToBadgeId
    );
    return this.httpClient.get(
      `${this.baseUrl}/super-coin-allocation/get/badge/coins/info/by/id`,
      { params }
    );
  }

  deleteBadgeCoinsAllocationInfoById(
    allocatedCoinsToBadgeId: number
  ): Observable<ResponseEntityObject> {
    const params = new HttpParams().set(
      'allocatedCoinsToBadgeId',
      allocatedCoinsToBadgeId
    );
    return this.httpClient.delete<ResponseEntityObject>(
      `${this.baseUrl}/super-coin-allocation/delete/badge/coins/info/by/id`,
      { params }
    );
  }

  getUserListToDonateCoins(userUuid: string): Observable<any> {
    let params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient.get(
      `${this.baseUrl}/super-coin-allocation/get/user/list/to/donate/coins`,
      { params }
    );
  }

  getDonateSuperCoinReason(): Observable<any> {
    return this.httpClient.get(
      `${this.baseUrl}/super-coin-allocation/get/donate/coins/reason`
    );
  }

  // shivendra overtime code
  registerOvertimeRequest(
    overtimeRequestDTO: OvertimeRequestDTO
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/overtime/register`,
      overtimeRequestDTO,
      {}
    );
  }

  approveOrRejectOvertimeRequest(
    overtimeRequestId: number,
    requestTypeId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('overtime_request_id', overtimeRequestId)
      .set('request_type_id', requestTypeId);

    return this.httpClient.post<any>(
      `${this.baseUrl}/overtime/approve-reject`,
      {},
      { params }
    );
  }

  getOvertimeRequestLogResponseByUserUuid(
    userUuid: string,
    status: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('status', status)
      .set('user_uuid', userUuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/overtime/log/response/get-by-user-uuid`,
      { params }
    );
  }

  getOvertimeRequestLogResponseByOrganizationUuidAndStartDateAndEndDate(
    startDate: string,
    endDate: string,
    itemPerPage: number,
    pageNumber: number,
    searchText: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('search_text', searchText)
      .set('search_by', searchBy);

    return this.httpClient.get<any>(
      `${this.baseUrl}/overtime/log/response/get-by-organization-uuid`,
      { params }
    );
  }

  getOvertimeRequestResponseByOrganizationUuidAndStartDateAndEndDate(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/overtime/response/get-by-organization-uuid`,
      { params }
    );
  }

  getOvertimePendingRequestResponseByOrganizationUuidAndStartDateAndEndDate(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.httpClient.get<any>(
      `${this.baseUrl}/overtime/pending/response/get-by-organization-uuid`,
      { params }
    );
  }

  getLopReversalApplicationResponseListByUserUuid(
    userUuid: string
  ): Observable<any> {
    const params = new HttpParams().set('user_uuid', userUuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/lop-reversal-application/response/get-by-user-uuid`,
      { params }
    );
  }

  getLeaveCategoryList(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/leave-category/list`, {});
  }

  getYearTypeList(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/year-type/list`, {});
  }

  getLeaveCycleList(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/leave-cycle/list`, {});
  }

  getUnusedLeaveActionList(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/unused-leave/list`, {});
  }

  /** Get all employee type */
  getAllEmployeeType(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/emplyee-type/list`, {});
  }

  registerLeaveTemplate(
    leaveTemplateRequest: LeaveTemplateRequest
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/leave-template/register-new`,
      leaveTemplateRequest
    );
  }

  registerOrganizationRegistrationFormInfo(
    request: OrganizationRegistrationFormRequest
  ): Observable<any> {
    const url = `${this.baseUrl}/organization-registration-form/register`;
    return this.httpClient.post(url, request);
  }
  registerBillingAndSubscriptionTemp(
    subscriptionPlanId: number
  ): Observable<any> {
    const params = new HttpParams().set(
      'subscription_plan_id',
      subscriptionPlanId
    );

    return this.httpClient.post<any>(
      `${this.baseUrl}/organization-subs-plan/register-temp`,
      {},
      { params }
    );
  }

  syncSlackUsersToDatabase(): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/slack/sync/slack/users`,
      {}
    );
  }

  registerOrganizationRegistratonProcessStep(
    statusId: number,
    stepId: number
  ): Observable<any> {
    debugger;
    const params = new HttpParams()
      .set('statusId', statusId)
      .set('stepId', stepId);
    return this.httpClient.put<any>(
      `${this.baseUrl}/organization/register/onboarding/process/step`,
      {},
      { params }
    );
  }

  getOrganizationRegistratonProcessStepStatus(): Observable<any> {
    debugger;
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization/get/onboarding/process/step/status`
    );
  }

  hideOrganizationInitialToDoStepBar(): Observable<any> {
    debugger;
    return this.httpClient.put<any>(
      `${this.baseUrl}/organization/hide/org/initial/to/do/step/bar`,
      {}
    );
  }

  getOrganizationInitialToDoStepBar(): Observable<any> {
    debugger;
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization/get/org/initial/to/do/step/bar`
    );
  }

  saveOrgSecondaryToDoStepBar(hideOrUnhide: number): Observable<any> {
    debugger;
    const params = new HttpParams().set('hideOrUnhide', hideOrUnhide);
    return this.httpClient.put<any>(
      `${this.baseUrl}/organization/save/secondary/to/do/step/bar`,
      {},
      { params }
    );
  }

  getOrgSecondaryToDoStepBar(): Observable<any> {
    debugger;
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization/get/secondary/to/do/step/bar`
    );
  }

  getStepsData(): Observable<any> {
    debugger;
    return this.httpClient.get<any>(`${this.baseUrl}/organization/get/Steps`);
  }


  isToDoStepsCompleted(): Observable<any> {
    debugger;
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization/get/to-do/steps/completed`
    );
  }

  isOrgOnboarToday(): Observable<any> {
    debugger;
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization/is/organization/onboard/today`
    );
  }

  getShifts(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/organization-shift-timing/organization-shift`
    );
  }

  getLeaveTemplateResponseListByOrganizationId(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/leave-template/get`, {});
  }

  getAllLeaveTemplate(pageNumber: number, itemPerPage: number) {
    const params = new HttpParams()
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber);

    return this.httpClient.get<any>(`${this.baseUrl}/leave-template`, {
      params,
    });
  }

  saveSlackUserIdViaEmail(email: string) {
    const params = new HttpParams().set('emailId', email);

    return this.httpClient.get<any>(
      `${this.baseUrl}/users/save-slack-user-id`,
      { params }
    );
  }

  getSlackUserCount() {
    return this.httpClient.get<any>(
      `${this.baseUrl}/users/get-slack-user-count`,
      {}
    );
  }

  saveFlexibleAttendanceMode(requestType: string): Observable<any> {
    const params = new HttpParams().set('requestType', requestType);
    return this.httpClient.put<any>(
      `${this.baseUrl}/attendance/mode/save-flexible-modes-info`,
      {},
      { params }
    );
  }

  saveFlexibleAttendanceModeForAllAddresses(
    addressModes: AddressModeTypeRequest[]
  ): Observable<any> {
    return this.httpClient.put<any>(
      `${this.baseUrl}/attendance/mode/save-flexible-modes-info-for-all-addresses`,
      addressModes
    );
  }

  getFlexibleAttendanceMode(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/mode/get-flexible-modes-info`,
      {}
    );
  }

  getFlexibleAttendanceModeByUserUuid(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid);
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/mode/get-flexible-modes-info-by-user-uuid`,
      { params }
    );
  }
  getOrganizationName() {
    return this.httpClient.get<any>(`${this.baseUrl}/organization/name`);
  }

  getEmployeeProfile(uuid: string) {
    const params = new HttpParams().set('userUuid', uuid);
    return this.httpClient.get<any>(
      `${this.baseUrl}/employee-profile/profile-info`,
      { params }
    );
  }

  getExpenseType() {
    return this.httpClient.get<any>(
      `${this.baseUrl}/company-expense-policy/expense-type`
    );
  }

  getAllExpenseType() {
    return this.httpClient.get<any>(`${this.baseUrl}/company-expense-type`);
  }

  checkExpensePolicy(expenseTypeId: number, amount: any): Observable<any> {
    const params = new HttpParams()
      .set('expenseTypeId', expenseTypeId)
      .set('amount', amount);
    return this.httpClient.get<any>(`${this.baseUrl}/company-expense-policy`, {
      params,
    });
  }

  createExpense(expenseTypeReq: ExpenseType) {
    return this.httpClient.post<any>(
      `${this.baseUrl}/company-expense`,
      expenseTypeReq
    );
  }

  getTagsByOrganizationIdAndType(type: string): Observable<any> {
    const params = { type };
    return this.httpClient.get(`${this.baseUrl}/tags`, { params });
  }

  createExpensePolicy(companyExpenseReq: CompanyExpense) {
    return this.httpClient.post<any>(
      `${this.baseUrl}/company-expense-policy`,
      companyExpenseReq
    );
  }

  deleteExpense(id: number): Observable<any> {
    const params = new HttpParams().set('expenseId', id);
    return this.httpClient.delete(`${this.baseUrl}/company-expense`, {
      params,
    });
  }

  checkExpenseTransactionId(transactionId: string) {
    const params = new HttpParams().set('id', transactionId);
    return this.httpClient.get(`${this.baseUrl}/company-expense/transaction`, {
      params,
    });
  }

  exportExpense() {
    return this.httpClient.get<any>(`${this.baseUrl}/company-expense/export`);
  }


  importExpense(file: any, fileName: string) {
    debugger;
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    formdata.append('fileName', fileName);
    formdata.append('role', 'ADMIN');
    return this.httpClient.post(
      `${this.baseUrl}/company-expense/import`,
      formdata
    );
  }

  getAllExpense(
    role: string,
    pageNumber: number,
    itemPerPage: number,
    startDate: any,
    endDate: any,
    statusIds: number[],
    userUuid: any,
    tag: string,
    search: string
  ) {
    let params = new HttpParams()
      .set('currentPage', pageNumber)
      .set('itemPerPage', itemPerPage)
      .set('sortBy', 'createdDate')
      .set('sortOrder', 'desc')
      .set('role', role)
      .set('tag', tag)
      .set('search', search);

    if (startDate && endDate) {
      params = params.set('startDate', startDate);
      params = params.set('endDate', endDate);
    }

    if (statusIds.length > 0) {
      params = params.set('statusIds', statusIds.join(','));
    }

    if (userUuid) {
      params = params.set('userUuid', userUuid);
    }

    return this.httpClient.get<any>(`${this.baseUrl}/company-expense`, {
      params,
    });
  }

  saveTags(id: number, tags: string[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.baseUrl}/company-expense/save-tags?id=${id}`;
    return this.httpClient.post(url, tags, { headers });
  }

  getSettlementExpenseLog(
    role: string,
    pageNumber: number,
    itemPerPage: number,
    startDate: any,
    endDate: any,
    statusIds: number[],
    userUuid: any
  ) {
    let params = new HttpParams()
      .set('current_page', pageNumber)
      .set('item_per_page', itemPerPage)
      .set('sortBy', 'createdDate')
      .set('sortOrder', 'desc');
    // .set('role', role)

    if (startDate && endDate) {
      params = params.set('startDate', startDate);
      params = params.set('endDate', endDate);
    }

    if (statusIds.length > 0) {
      params = params.set('statusIds', statusIds.join(','));
    }

    if (userUuid) {
      params = params.set('userUuid', userUuid);
    }

    return this.httpClient.get<any>(
      `${this.baseUrl}/company-expense-settlement-log`,
      { params }
    );
  }

  getAllExpenseCount(
    role: string,
    pageNumber: number,
    itemPerPage: number,
    startDate: any,
    endDate: any,
    userUuid: any
  ) {
    var params = new HttpParams()
      .set('currentPage', pageNumber)
      .set('itemPerPage', itemPerPage)
      .set('role', role);

    if (startDate && endDate) {
      params = params.set('startDate', startDate);
      params = params.set('endDate', endDate);
    }

    if (userUuid) {
      params = params.set('userUuid', userUuid);
    }

    return this.httpClient.get<any>(`${this.baseUrl}/company-expense/count`, {
      params,
    });
  }

  getAllCompanyExpensePolicy(databaseHelper: DatabaseHelper) {
    const params = new HttpParams()
      .set('page_number', databaseHelper.currentPage)
      .set('item_per_page', databaseHelper.itemPerPage)
      .set('sortBy', 'createdDate')
      .set('sortOrder', 'desc');

    return this.httpClient.get<any>(
      `${this.baseUrl}/company-expense-policy/rule`,
      { params }
    );
  }

  updateCompanyExpense(approveReq: ApproveReq) {
    return this.httpClient.patch<any>(
      `${this.baseUrl}/company-expense`,
      approveReq
    );
  }

  getCompanyExpenseById(id: number): Observable<any> {
    const params = new HttpParams().set('id', id.toString());
    return this.httpClient.get<any>(`${this.baseUrl}/company-expense/by-id`, {
      params,
    });
  }

  deleteCompanyExpensePolicy(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this.httpClient.delete(`${this.baseUrl}/company-expense-policy`, {
      params,
    });
  }

  deleteCompanyExpenseTypePolicy(id: number): Observable<any> {
    const params = new HttpParams().set('expenseTypeId', id);
    return this.httpClient.delete(`${this.baseUrl}/company-expense-type`, {
      params,
    });
  }

  getUserMappedWithPolicy(
    selectedUserIds: any,
    companeExpensePolicyId: number
  ) {
    let params = new HttpParams().set('selectedUserIds', selectedUserIds);

    if (companeExpensePolicyId > 0) {
      params = params.set('companyExpensePolicyId', companeExpensePolicyId);
    }

    return this.httpClient.get<any>(
      `${this.baseUrl}/user_company_expense_type_policy_mapping`,
      { params }
    );
  }

  /** Exit policy */

  getUserExitPolicyType() {
    return this.httpClient.get<any>(`${this.baseUrl}/user-exit-type`);
  }

  getUserLeaveTaken() {
    return this.httpClient.get<any>(`${this.baseUrl}/exit-policy/leave`);
  }

  createExitPolicy(exitPolicyReq: ExitPolicy) {
    return this.httpClient.post<any>(
      `${this.baseUrl}/exit-policy`,
      exitPolicyReq
    );
  }

  deleteExitPolicy(id: number) {
    const params = new HttpParams().set('exitPolicyId', id);
    return this.httpClient.delete<void>(`${this.baseUrl}/exit-policy`, {
      params,
    });
  }

  getAllExitPolicy(databaseHelper: DatabaseHelper) {
    const params = new HttpParams()
      .set('page_number', databaseHelper.currentPage)
      .set('item_per_page', databaseHelper.itemPerPage)
      .set('sortBy', 'createdDate')
      .set('sortOrder', 'desc');

    return this.httpClient.get<any>(`${this.baseUrl}/exit-policy/rule`, {
      params,
    });
  }

  getUserMappedWithExitPolicy(selectedUserIds: any, exitPolicyId: number) {
    let params = new HttpParams().set('selectedUserIds', selectedUserIds);

    if (exitPolicyId > 0) {
      params = params.set('exitPolicyId', exitPolicyId);
    }

    return this.httpClient.get<any>(
      `${this.baseUrl}/user_exit_policy_mapping`,
      { params }
    );
  }

  getNoticePeriodDuration(uuid: string) {
    let params = new HttpParams().set('uuid', uuid);
    return this.httpClient.get<any>(
      `${this.baseUrl}/user_exit_policy_mapping/notice-period`,
      { params }
    );
  }

  submitResignation(userResignationReq: UserResignation) {
    return this.httpClient.post<any>(
      `${this.baseUrl}/user-resignation`,
      userResignationReq
    );
  }

  getEmployeeProfileAttendanceDetails(
    userUuid: string,
    startDate: string,
    endDate: string
  ) {
    const params = new HttpParams()
      .set('userUuid', userUuid)
      .set('startDate', startDate.toString())
      .set('endDate', endDate.toString());
    return this.httpClient.get<any>(
      `${this.baseUrl}/employee-profile/attendance`,
      { params }
    );
  }

  resignationInfo: any;
  getUserResignationInfo(uuid: string) {
    let params = new HttpParams().set('uuid', uuid);
    return this.httpClient.get<any>(`${this.baseUrl}/user-resignation`, {
      params,
    });
  }
  getUserResignationInfoById(id: number) {
    let params = new HttpParams().set('id', id);
    return this.httpClient.get<any>(`${this.baseUrl}/user-resignation`, {
      params,
    });
  }

  checkUserExist(uuid: string) {
    let params = new HttpParams().set('uuid', uuid);
    return this.httpClient.get<any>(`${this.baseUrl}/exit-policy/exist`, {
      params,
    });
  }

  // updateResignation1(id: number) {
  //   const params = new HttpParams().set('id', id);
  //   return this.httpClient.patch<any>(
  //     `${this.baseUrl}/user-resignation`,
  //     {}, // Pass an empty object as the body for PATCH if not required
  //     { params } // Use this to include query parameters
  //   );
  // }

  updateResignation(id: number) {
    const params = new HttpParams().set('id', id);
    return this.httpClient.patch<any>(
      `${this.baseUrl}/user-resignation`,
      {},
      { params }
    );
  }

  revokeResignation(id: number, message: string) {
    const params = new HttpParams().set('id', id).set('reason', message);
    return this.httpClient.patch<any>(
      `${this.baseUrl}/user-resignation/revoke`,
      {},
      { params }
    );
  }

  updateResignation2(id: number) {
    return this.httpClient.get<any>(
      `${this.baseUrl}/user-resignation/update/${id}`
    ); // Empty body if no data is needed
  }

  getDocumentsByUserId(uuid: string): Observable<EmployeeAdditionalDocument[]> {
    return this.httpClient
      .get<EmployeeAdditionalDocument[]>(
        `${this.baseUrl}/documents/user?uuid=${uuid}`
      )
      .pipe(
        map((documents) => documents || []) // Process the response to ensure it's always an array
      );
  }

  saveDocumentsForUser(
    uuid: string,
    documents: EmployeeAdditionalDocument[]
  ): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/user/${uuid}`, documents);
  }
  updateDocument(
    documentId: number,
    document: EmployeeAdditionalDocument
  ): Observable<EmployeeAdditionalDocument> {
    return this.httpClient.put<EmployeeAdditionalDocument>(
      `${this.baseUrl}/documents/${documentId}`,
      document
    );
  }
  saveDocumentForUser(
    uuid: string,
    document: EmployeeAdditionalDocument
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/documents/user/document?uuid=${uuid}`,
      document
    );
  }

  downloadAssetRequests(): Observable<Blob> {
    const url = `${this.baseUrl}/asset-requests/export`;
    return this.httpClient.get(url, { responseType: 'blob' });
  }
  getUsersWithUpcomingBirthdays(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/users/birthdays`);
  }
  getRecentlyJoinedUsers(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/users/recently-joined-users`
    );
  }
  getRecentlyWorkAnniversary(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/users/work-anniversary`);
  }

  createAttendanceEntry(file: any, fileName: string) {
    debugger;
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    formdata.append('fileName', fileName);
    return this.httpClient.post(
      `${this.baseUrl}/whatsapp-user-onboarding/create/attendance`,
      formdata
    );
  }
  saveSkills(userUuid: string, skills: string[]): Observable<any> {
    const body = skills;
    return this.httpClient.post<void>(
      `${this.baseUrl}/skills/save-skills`,
      body,
      {
        params: { userUuid },
      }
    );
  }

  getSkills(userUuid: string): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.baseUrl}/skills/get-skills`, {
      params: { userUuid },
    });
  }
  getUserAttendanceRequests(
    uuid: string,
    date: string,
    page: number,
    size: number
  ): Observable<any> {
    // Create the HTTP parameters
    const params = new HttpParams()
      .set('uuid', uuid)
      .set('date', date)
      .set('page', page.toString())
      .set('size', size.toString());

    // Make the HTTP GET request and return the observable
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/attendance-requests`,
      { params }
    );
  }
  getAttendanceSummary(userUuid: string): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/daily-summary?userUuid=${userUuid}`
    );
  }

  getUsersCountByStatus(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.baseUrl}/users/get-count`);
  }

  getRequestCountByOrganizationUuid(): Observable<string[]> {
    return this.httpClient.get<string[]>(
      `${this.baseUrl}/attendance/get-count`
    );
  }

  getAttendanceUpdateFilteredRequests(
    userUuid?: string,
    status?: string,
    requestType?: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status === 'All') {
      status = '';
    }

    if (userUuid) params = params.set('userUuid', userUuid);
    if (status) params = params.set('status', status);
    if (requestType) params = params.set('requestType', requestType);

    return this.httpClient.get<any>(
      `${this.baseUrl}/attendance/get/requests/filter`,
      { params }
    );
  }

  deletePendingAttendance(id: number): Observable<string> {
    const params = new HttpParams().set('id', id.toString());
    return this.httpClient.post<string>(
      `${this.baseUrl}/attendance/delete-pending-attendance`,
      null,
      { params }
    );
  }
  getDocumentsByTypeAndUser(
    documentType: string,
    userId: string
  ): Observable<any[]> {
    const params = new HttpParams()
      .set('documentType', documentType)
      .set('userId', userId);

    return this.httpClient.get<any[]>(
      `${this.baseUrl}/documents/documents-by-type`,
      { params }
    );
  }
  getHrPolicies(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}/documents/organization/hr-policy-documents`
    );
  }
  deleteDocument(documentId: number | undefined): Observable<string> {
    const url = `${this.baseUrl}/documents/${documentId}`;
    return this.httpClient.delete<string>(url);
  }

  getEditedFieldsByUserUuid(uuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', uuid);
    return this.httpClient.get<any>(
      `${this.baseUrl}/get/onboarding/edited-fields`,
      { params }
    );
  }

  isPendingRequest(resourceId: number): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/get/onboarding/is-pending-request`,
      { params: { resourceId } }
    );
  }

  getPendingRequestsCounter(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/asset-requests/pending-requests-counter`
    );
  }
  getRequestedTypeCount(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/asset-requests/count-by-requested-type`
    );
  }

  acceptAgreement(): Observable<any> {
    const url = `${this.baseUrl}/users/accept-agreement`;
    return this.httpClient.post(url, {});
  }

  getUserAllData(uuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', uuid);

    return this.httpClient.get<any>(
      `${this.baseUrl}/get/onboarding/get-user-all-data`,
      { params }
    );
  }

  checkStepCompletionStatusByStepId(stepId: number): Observable<any[]> {
    const params = new HttpParams().set('stepId', stepId);

    return this.httpClient.get<any[]>(
      `${this.baseUrl}/organization/check-status`,
      { params }
    );
  }

  saveAllUserData(onboardingData: any, userUuid: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { userUuid };

    return this.httpClient.post(
      `${this.baseUrl}/get/onboarding/save-all-user-data`,
      onboardingData,
      {
        headers,
        params,
      }
    );
  }

  getRequestedData(userUuid: string): Observable<any> {
    const params = { userUuid };
    return this.httpClient.get(
      `${this.baseUrl}/get/onboarding/get-requested-data`,
      {
        params,
      }
    );
  }
  getDataComparison(userUuid: string, id: number = 0): Observable<any> {
    const params = { userUuid: userUuid, id: id.toString() };
    return this.httpClient.get(
      `${this.baseUrl}/get/onboarding/requested-data-compare`,
      {
        params,
      }
    );
  }
  saveRequestedData(uuid: string): Observable<any> {
    const params = { uuid };
    return this.httpClient.post(
      `${this.baseUrl}/get/onboarding/save-requested-data`,
      null,
      {
        params,
      }
    );
  }
  rejectRequestedData(uuid: string, rejectedReason: string): Observable<any> {
    const endpoint = `${this.baseUrl}/get/onboarding/reject-requested-data`;
    return this.httpClient.post(endpoint, rejectedReason, {
      params: { uuid },
    });
  }

  getWorkedHourForEachDayOfAWeek(
    uuid: string,
    startDate: string,
    endDate: string,
    searchString: string
  ): Observable<string[]> {
    const params = new HttpParams()
      .set('uuid', uuid)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('searchString', searchString);
    return this.httpClient.get<string[]>(
      `${this.baseUrl}/attendance/get-worked-hour`,
      { params }
    );
  }

  getTeamsWithManagerInfo(uuid: string): Observable<string[]> {
    const params = new HttpParams().set('userUuid', uuid);
    return this.httpClient.get<string[]>(`${this.baseUrl}/team/manager-info`, {
      params,
    });
  }

  findTeamsMembersInfoByUserUuid(
    uuid: string,
    teamString: string,
    itemPerPage: number,
    pageNumber: number
  ): Observable<string[]> {
    const params = new HttpParams()
      .set('userUuid', uuid)
      .set('teamName', teamString)
      .set('limit', itemPerPage)
      .set('offset', pageNumber);
    return this.httpClient.get<string[]>(`${this.baseUrl}/team/members-info`, {
      params,
    });
  }

  getAllTeamsByUuid(uuid: string): Observable<string[]> {
    const params = new HttpParams().set('userUuid', uuid);
    return this.httpClient.get<string[]>(`${this.baseUrl}/team/all-teams`, {
      params,
    });
  }

  getTotalTeamMembers(uuid: string): Observable<string[]> {
    const params = new HttpParams().set('userUuid', uuid);
    return this.httpClient.get<string[]>(
      `${this.baseUrl}/team/total-team-members`,
      { params }
    );
  }

  createSubscriptionInquiryRequest(request: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/contact-and-support/save-request`,
      request
    );
  }

  getSubscriptionRequestInfo(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/contact-and-support/get-subscription-request-info`
    );
  }

  getSubscriptionRequestStatus(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/contact-and-support/get-subscription-request-status`
    );
  }

  sendNotifications(request: {
    emailUsers: string[];
    whatsappUsers: string[];
  }): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/whatsapp-user-onboarding/send-notifications`,
      request
    );
  }

  removeKeyValuePair(key: string, userId: string, value: any): Observable<any> {
    const requestBody = {
      userId: userId,
      keyValuePairs: { [key]: String(value) } // Convert value to string
    };
    return this.httpClient.post<any>(
      `${this.baseUrl}/get/onboarding/remove-field-in-requested-data`,
      requestBody
    );
  }

  // Approve a single key-value pair
  approveKeyValuePair(key: string, userId: string, value: any): Observable<any> {
    const requestBody = {
      userId: userId,
      keyValuePairs: { [key]: String(value) } // Convert value to string
    };
    return this.httpClient.post<any>(
      `${this.baseUrl}/get/onboarding/approve-field-in-requested-data`,
      requestBody
    );
  }

  createHelpRequest(helpAndSupport: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post(
      `${this.baseUrl}/help-support`,
      helpAndSupport,
      { headers }
    );
  }

  getPendingRequests(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.httpClient.get<any>(
      `${this.baseUrl}/get/onboarding/pending-requests`,
      { params }
    );
  }

  isUserUnderManager(userId: string): Observable<any> {
    const params = new HttpParams().set('userId', userId.toString());

    return this.httpClient.get<any>(
      `${this.baseUrl}/users/isUserUnderManager`,
      { params }
    );
  }

  notificationTypes(userUuid?: string): Observable<any> {
    let params = new HttpParams();

    if (userUuid) {
      params = params.set('userUuid', userUuid);
    }

    return this.httpClient.get<any>(
      `${this.baseUrl}/notification-setting/notification-types`,
      { params }
    );
  }

  saveNotification(notification: NotificationTypeInfoRequest): Observable<any> {
    return this.httpClient.put(
      `${this.baseUrl}/notification-setting/save`,
      notification
    );
  }

  disableNotification(key: string): Observable<any> {
    const params = new HttpParams().set('key', key);
    return this.httpClient.put(
      `${this.baseUrl}/notification-setting/disable/notification`,
      {},
      { params }
    );
  }

  updateUserNotification(
    notificationSettingId: number,
    statusValue: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('notificationSettingId', notificationSettingId)
      .set('statusValue', statusValue);
    return this.httpClient.put(
      `${this.baseUrl}/notification-setting/update/status/user`,
      {},
      { params }
    );
  }

  updateJoiningDate(id: number, date: Date): Observable<any> {
    const params = new HttpParams().set('id', id.toString()); // Pass id as request parameter
    return this.httpClient.post<string>(
      `${this.baseUrl}/users/joining-date`,
      date,
      { params }
    );
  }

  saveDefaultNotificationSetting(): Observable<any> {
    return this.httpClient.post<string>(
      `${this.baseUrl}/notification-setting/default/notification`,
      {}
    );
  }

  existsUserByUan(uan: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/users/by-uan/${uan}`);
  }

  existsUserByPhone(uan: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/users/by-phone/${uan}`);
  }
  existsUserByEmail(uan: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/users/by-email/${uan}`);
  }

  existsUserByEsi(esi: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/users/by-esi/${esi}`);
  }

  existsInShift(userUuid: string): Observable<any> {
    const params = new HttpParams().set('userUuid', userUuid.toString());
    return this.httpClient.get<any>(`${this.baseUrl}/users/is-in-shift`, {
      params,
    });
  }

  getFilteredAssets(
    teamId?: number,
    userId?: number,
    statusId?: number,
    assetCategoryId?: number,
    search?: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (teamId) params = params.set('teamId', teamId.toString());
    if (userId) params = params.set('userId', userId.toString());
    if (statusId) params = params.set('statusId', statusId.toString());
    if (assetCategoryId)
      params = params.set('assetCategoryId', assetCategoryId.toString());
    if (search) params = params.set('search', search);

    return this.httpClient.get(`${this.baseUrl}/assets/by-filter`, { params });
  }

  getTeamSummary(statusId: number): Observable<any> {
    const params = new HttpParams().set('statusId', statusId.toString());
    return this.httpClient.get<any>(`${this.baseUrl}/assets/team-summary`, {
      params,
    });
  }

  getStatusSummary(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/status-summary`);
  }

  getCategorySummary(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/category-summary`);
  }

  getAssetCategorySummary(categoryId: number): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/assets/category/${categoryId}/summary`
    );
  }
  getOrganizationUserList(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/user/list`);
  }
  createAssets(asset: any): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/assets/create`, asset);
  }
  changeStatus(
    assetId: number,
    status: number,
    description: string,
    userId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('status', status.toString())
      .set('description', description)
      .set('userId', userId);
    return this.httpClient.put<any>(
      `${this.baseUrl}/assets/${assetId}/status`,
      null,
      { params }
    );
  }
  getAssetHistory(assetId: number): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/assets/${assetId}/history`
    );
  }
  getAssetChangePercentageList(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/status-changes`);
  }
  updateAssetCategory(
    categoryId: number,
    category: AssetCategoryRequest
  ): Observable<any> {
    const params = new HttpParams().set('categoryId', categoryId);
    return this.httpClient.put(
      `${this.baseUrl}/assets/update-category`,
      category,
      { params }
    );
  }
  createAssetCategory(
    assetCategoryRequest: AssetCategoryRequest
  ): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/assets/create-category`,
      assetCategoryRequest
    );
  }
  getMonthlyAssignments(statusId: number): Observable<any> {
    const params = new HttpParams().set('statusId', statusId);
    return this.httpClient.get<any>(
      `${this.baseUrl}/assets/monthly-assignments`,
      { params }
    );
  }

  getAssetsByUser(
    uuid: any,
    searchTerm?: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('uuid', uuid);

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.httpClient.get(`${this.baseUrl}/assets/user-by-filter`, {
      params,
    });
  }
  getRequestedAvailableAssets(
    assetCategoryId: number = 0,
    search: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('assetCategoryId', assetCategoryId.toString())
      .set('search', search || '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.httpClient.get<any>(
      `${this.baseUrl}/assets/available-requested`,
      { params }
    );
  }
  assignRequestedAsset(
    assetId: number,
    assetRequestId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('assetId', assetId.toString())
      .set('assetRequestId', assetRequestId.toString());

    return this.httpClient.post<any>(
      `${this.baseUrl}/assets/assigned-requested-asset`,
      {},
      { params }
    );
  }

  getUserLeaveQuota(userLeaveTemplateId: number): Observable<any> {
    const params = new HttpParams().set(
      'userLeaveTemplateId',
      userLeaveTemplateId
    );
    return this.httpClient.get<any>(
      `${this.baseUrl}/leave/quota/by-user-leave-template-id`,
      { params }
    );
  }



  getAttendanceRequestsNew(
    requestType: string,
    startDate: string,
    endDate: string,
    pageNumber: number,
    itemPerPage: number,
    userIds?: number[],
    selectedRequestTypeIds?: number[],
    selectedStatusIds?: number[],
    search?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('requestType', requestType)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('pageNumber', pageNumber)
      .set('itemPerPage', itemPerPage);

    if (userIds && userIds.length > 0) {
      userIds.forEach(id => params = params.append('userIds', id));
    }

    if (selectedRequestTypeIds && selectedRequestTypeIds.length > 0) {
      selectedRequestTypeIds.forEach(id => params = params.append('selectedRequestTypeIds', id));
    }

    if (selectedStatusIds && selectedStatusIds.length > 0) {
      selectedStatusIds.forEach(id => params = params.append('selectedStatusIds', id));
    }

    if (search) {
      params = params.set('search', search);
    }

    const url = `${this.baseUrl}/attendance/requests`;
    return this.httpClient.get<any>(url, { params });
  }

  getAttendanceUpdateRequests(
    userIds?: number[],
    startDateStr?: string,
    endDateStr?: string,
    statuses?: number[],
    attendanceStatuses?: number[],
    requestTypes?: string[],
    page: number = 0,
    size: number = 10,
    search?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'id,DESC');

    if (userIds && userIds.length) {
      userIds.forEach(id => (params = params.append('userIds', id.toString())));
    }
    if (search) params = params.set('search', search);
    if (startDateStr) params = params.set('startDateStr', startDateStr);
    if (endDateStr) params = params.set('endDateStr', endDateStr);
    if (statuses && statuses.length) {
      statuses.forEach(status => (params = params.append('statuses', status.toString())));
    }
    if (attendanceStatuses && attendanceStatuses.length) {
      attendanceStatuses.forEach(status => (params = params.append('attendanceStatuses', status.toString())));
    }
    if (requestTypes && requestTypes.length) {
      requestTypes.forEach(type => (params = params.append('requestTypes', type)));
    }

    return this.httpClient.get(`${this.baseUrl}/attendance/attendance-update-requests`, { params });
  }
}




