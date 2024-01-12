import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, throwError } from "rxjs";
import { Organization, Users } from "../models/users";
import { Savel } from "../models/savel";
import { DailyQuestionsCheckout } from "../models/daily-questions-check-out";
import { DailyQuestionsCheckIn } from "../models/daily-questions-check-in";
import { TeamResponse } from "../models/team";
import { AttendanceWithLatePerformerResponseDto, AttendanceWithTopPerformerResponseDto } from "../models/Attendance.model";
import { RoleRequest } from "../models/role-request";
import { UserPersonalInformationRequest } from "../models/user-personal-information-request";
import { catchError } from "rxjs/operators";
import { UserAddressDetailsRequest } from "../models/user-address-details-request";
import { UserAcademicsDetailRequest } from "../models/user-academics-detail-request";
import { UserExperience } from "../models/user-experience";
import { UserBankDetailRequest } from "../models/user-bank-detail-request";
import { UserEmergencyContactDetailsRequest } from "../models/user-emergency-contact-details-request";
import { AdditionalNotes } from "../models/additional-notes";
import { AttendanceRuleDefinitionRequest } from "../models/attendance-rule-definition-request";
import { UserDto } from "../models/user-dto.model";
import { UserLeaveRequest } from "../models/user-leave-request";
import { UserDocumentsDetailsRequest } from "../models/user-documents-details-request";

import { LeaveSettingResponse } from "../models/leave-setting-response";
import { LeaveSettingCategoryResponse } from "../models/leave-categories-response";
import { FullLeaveSettingResponse } from "../models/full-leave-setting-response";

import { FullLeaveSettingRequest } from "../models/Full-Leave-Setting-Request";
import { Testing } from "../models/testing";
import { ShiftTimings } from "../models/shifttimings";


@Injectable({
  providedIn: "root",
})
export class DataService {

  private stepsCompletionStatus = new BehaviorSubject<boolean[]>([false, false, false, false, false, false, false]);
  orgId: any;
  constructor(private httpClient: HttpClient) {}
  private orgIdEmitter = new EventEmitter<number>();
  activeTab:boolean=false;
  setOrgId(orgId: number) {
    this.orgIdEmitter.emit(orgId);
  }
  getOrgIdEmitter(): EventEmitter<number> {
    return this.orgIdEmitter;
  }
  
  private baseUrl = "http://localhost:8080/api/v2";

  // private baseUrl = "https://backend.hajiri.work/api/v2";


    //  private baseUrl = "https://production.hajiri.work/api/v2";


  openSidebar: boolean = true;
  registerOrganizationUsingCodeParam(codeParam: string): Observable<any>{
    const params = new HttpParams().set("code_param", codeParam);
    return this.httpClient.put<any>(`${this.baseUrl}/organization/register-organization-using-code-param`, {}, {params});
  }
  
  //Attendance module
  getAttendanceDetailsByDateDuration(startDate : string, endDate : string, pageNumber: number, itemPerPage: number, search: string, searchBy: string) : Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set("page_number", pageNumber.toString())
    .set("item_per_page", itemPerPage.toString())
    .set('search', search)
    .set('search_by', searchBy);
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-attendance-details-by-date-duration`,{params});
  }

  getUserAttendanceDetailsByDateDuration(userUuid:string, role:string, startDate : string, endDate : string) : Observable<any>{
    const params = new HttpParams()
    .set('user_uuid', userUuid)
    .set('user_role', role)
    .set('start_date', startDate)
    .set('end_date', endDate);
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-attendance-details-for-user-by-date-duration`,{params});
  }

  getAttendanceDetailsByDate(date : string): Observable<any>{
    const params = new HttpParams()
    .set("date", date)
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-attendance-details-by-date`, {params});
  }


  getAttendanceDetailsReportByDate(date : string, pageNumber: number, itemPerPage: number, search: string, searchBy: string, sort: string, sortBy: string, filterCriteria: string): Observable<any>{
    const params = new HttpParams()
    .set("date", date)
    .set("page_number", pageNumber.toString())
    .set("item_per_page", itemPerPage.toString())
    .set('search', search)
    .set('search_by', searchBy)
    .set('sort_order', sort)
    .set('sort_by', sortBy)
    .set('filter_criteria', filterCriteria);
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-attendance-details-report-by-date`, {params});
  }

  
  getTodayEmployeesData(): Observable<any>{
    debugger
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-current-date-employees-data`, {});
  }
  getAttendanceTopPerformers(startDate: string, endDate: string): Observable<AttendanceWithTopPerformerResponseDto> {
    const params = new HttpParams()
      .set("startDate", startDate)
      .set("endDate", endDate)
    return this.httpClient.get<AttendanceWithTopPerformerResponseDto>(`${this.baseUrl}/attendance/get-attendance-top-late-performers-details`, {params});
  }
  //Organization daily question module
  registerDailyQuestionaire(dailyQuestions: any): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/organization-daily-question/register`, dailyQuestions);
  }
  getDailyQuestionaire(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/organization-daily-question/get`);
  }
  //Organization leave module
  registerLeave(leaveData: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/organization-leave/register`, leaveData);
  }
  getLeave(): Observable<any> {
    return this.httpClient.get<Savel[]>(`${this.baseUrl}/organization-leave/get/all`);
  }
  //Organization personal information module
  registerOrganizationPersonalInformation(personalInformation: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/organization-personal-information/register`, personalInformation);
  }
  getOrganizationDetails(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/organization-personal-information/get`);
  }

  updateOrganizationPersonalInformation(userPersonalInformationRequest: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/organization-personal-information/register`, userPersonalInformationRequest);
  }
  //Organization shift-timing module
  registerShiftTimings(shiftTiming: any): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/organization-shift-timing/register`, shiftTiming);
  }

  registerShiftTiming(shiftTimingRequest : any): Observable<any>{
    return this.httpClient.put<any>(`${this.baseUrl}/organization-shift-timing/register`, shiftTimingRequest);
  }
  
  getShiftTimings(): Observable<any> {
    return this.httpClient.get<ShiftTimings[]>(`${this.baseUrl}/organization-shift-timing/get/last-detail`);
  }

  getAllShiftTimings(): Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/organization-shift-timing/get/all`);
  }

  deleteOrganizationShiftTiming(organizationShiftTimingId : number): Observable<any>{

    const params = new HttpParams()
    .set("organization_shift_timing_id", organizationShiftTimingId);

    return this.httpClient.delete<any>(`${this.baseUrl}/organization-shift-timing/delete-by-id`, {params});
  }
  getAllShiftType(): Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/organization-shift-timing/shift-type-get-all`);
  }

  //User module
  getUsersByFilter(itemPerPage: number, pageNumber: number, sort: string, sortBy: string, search: string, searchBy: string) : Observable<any>{
    const params = new HttpParams()
    .set("item_per_page", itemPerPage.toString())
    .set("page_number", pageNumber.toString())
    .set('sort_order', sort)
    .set('sort_by', sortBy)
    .set('search', search)
    .set('search_by', searchBy);
    return this.httpClient.get<any>(`${this.baseUrl}/users/get/by-filters`, {params});
  }

  getUsersByFilterForLeaveSetting(itemPerPage: number, pageNumber: number, sort: string, sortBy: string, search: string, searchBy: string, leaveSettingId:number) : Observable<any>{
    const params = new HttpParams()
    .set("item_per_page", itemPerPage.toString())
    .set("page_number", pageNumber.toString())
    .set('sort_order', sort)
    .set('sort_by', sortBy)
    .set('search', search)
    .set('search_by', searchBy)
    .set('leave_setting_id', leaveSettingId);
    return this.httpClient.get<any>(`${this.baseUrl}/users/get/by-filters-leave-setting`, {params});
  }

  getAllUsers(sort: string, sortBy: string, search: string, searchBy: string) : Observable<any>{
    const params = new HttpParams()
    .set('sortOrder', sort)
    .set('sortBy', sortBy)
    .set('search', search)
    .set('searchBy', searchBy);
    return this.httpClient.get<any>(`${this.baseUrl}/users/get/all/by-filters`, {params});
  }
  
  changeStatusById(presenceStatus: Boolean, userUuid:string): Observable<any> {
    const params = new HttpParams()
      .set("presenceStatus", presenceStatus.toString())
      .set("userUuid", userUuid );
    return this.httpClient.put<any>(`${this.baseUrl}/users/change-status`,{},{params});
  }
  getActiveUsersCount(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/users/active-count`);
  }

  getPresentUsersCountByDate(date : string): Observable<any>{
    const params = new HttpParams()
    .set("date", date);

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/present-users-by-date-count`, {params});
  } 
  
  getAbsentUsersCountByDate(date : string): Observable<any>{
    const params = new HttpParams()
    .set("date", date);

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/absent-users-by-date-count`, {params});
  }
  //Team module
  registerTeam(userIds: any, name: string, description: string): Observable<any> {
    const params = new HttpParams()
    .set("name", name)
    .set("description", description)
    return this.httpClient.post(`${this.baseUrl}/team/register`, userIds, {params});
  }
  getTeamsByFilter(itemPerPage: number, pageNumber: number, search: string, searchBy: string, sortBy:string, sortOrder:string): Observable<any> {
    const params = new HttpParams()
      .set("item_per_page", itemPerPage.toString())
      .set("page_number", pageNumber.toString())
      .set("search", search)
      .set("search_by", searchBy).set("sort_by", sortBy).set("sort_order", sortOrder);
    return this.httpClient.get<any>(`${this.baseUrl}/team/get-all-by-filters`, { params });
  }
  getAllTeamsWithUsersByUserId(): Observable<TeamResponse[]> {
    
    return this.httpClient.get<TeamResponse[]>(`${this.baseUrl}/team/get-all-teams-with-users-by-user-id`);
  }

  // Firebase access token from refresh token
  refreshFirebaseAccessToken(): Observable<any> {

    const refreshToken = localStorage.getItem('refresh_token');

    if(refreshToken === null || refreshToken === undefined) {
      throw new Error("Refresh token not found");
    }
    
    const params = new HttpParams().set("refresh_token", refreshToken);

    return this.httpClient.get<any>(`${this.baseUrl}/firebase/refresh-access-token`, {params});
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
      .set("id", id)
      .set("name", name)
      .set("email", email)
      .set("password", password)
      .set("state", state)
      .set("country", country);
    const url = `http://localhost:8080/api/v1/attendance/register-org?${params.toString()}`;
    return this.httpClient.put(url, organizationPic);
  }
  // ##################################################3
  getTeamsById(teamUuid: string): Observable<any> {
    const params = new HttpParams().set("teamUuid", teamUuid);
    return this.httpClient.get<TeamResponse[]>(`${this.baseUrl}/team/get-team-by-team-id`, {
      params,
    });
  }
  
  // ##################################
  getOrg(orgId: any): Observable<any> {
    const params = new HttpParams().set("id", orgId);
    return this.httpClient.get<Organization[]>(this.baseUrl + "/get-org", {
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
    const params = new HttpParams().set("id", organId);
    return this.httpClient.get<DailyQuestionsCheckout[]>(`${this.baseUrl}/get-daily-questions/id`, {
      params,
    });
  }
  deleteDailyQuestions(dailyQuestionsId: any): Observable<any> {
    return this.httpClient.delete(
      `${this.baseUrl}/delete-daily-questions/${dailyQuestionsId}`,
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
    const params = new HttpParams().set("id", organnId);
    return this.httpClient.get<DailyQuestionsCheckIn[]>(`${this.baseUrl}/get-daily-questions-check-in/id`, {
      params,
    });
  }
  deleteDailyQuestionsCheckIn(dailyQuestionsId: any): Observable<any> {
    return this.httpClient.delete(
      `${this.baseUrl}/delete-daily-questions-check-in/${dailyQuestionsId}`,
    );
  }
  // #################################333
  saveDailyNotes(dailyNotesData: any): Observable<any> {
    return this.httpClient.put(
      `http://localhost:8080/api/v1/attendance/save-daily-Notes`,
      dailyNotesData
    );
  }
  // getDailyNotes(organiId: any): Observable<any> {
  //   const params = new HttpParams().set("id", organiId);
  //   return this.httpClient.get<DailyNotes[]>(`${this.baseUrl}/get-daily-Notes`, {
  //     params,
  //   });
  // }
  // getUserLeaveRequests(id: any): Observable<any> {
  //   const params = new HttpParams().set("id", id);
  //   return this.httpClient.get<DailyNotes[]>(`${this.baseUrl}/user-leave`, {
  //     params,
  //   });
  // }
//  ###################################################################################################
  saveTokenForOrganization(organization : Organization): Observable<any> {
   
    return this.httpClient.post(this.baseUrl+ '/savetoken', organization);
  }
  saveUserData(token: any): Observable<any> {
    const params = new HttpParams()
    .set('token', token)
    return this.httpClient.post(this.baseUrl+'/save-slack-data', {params});
  }
  loginUser(email: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set("email", email)
      .set("password", password);
    return this.httpClient.get(`${this.baseUrl}/users/login`, {
      params,
    });
  }

  logoutUser(email : string): Observable<any>{

    const params = new HttpParams()
    .set("email", email);

    return this.httpClient.get(`${this.baseUrl}/users/logout`, {
      params,
    })
  }

  // saveTokenForOrganization(organization : Organization): Observable<any> {
   
  //   return this.httpClient.post<any>(this.baseUrl+ '/savetoken', organization);
  // }
  
  // getAccessToken(code: string): Observable<any> {
  //   const params = new HttpParams().set("code", code);
  //   return this.httpClient.get(this.baseUrl + "/get-token", { params });
  // }
  
  saveLeaveRequest(userUuid:string, request: any): Observable<any> {
    const params = new HttpParams().set("uuid", userUuid);
    return this.httpClient.post( this.baseUrl+'/user-leave/save-users-leave',request,  {params});
  }

  // TODO
  getPendingLeaveFlag(request: UserLeaveRequest ): Observable<any> {
    // const params = new HttpParams()
    // .set("userUuid", userUuid)
    return this.httpClient.post<any>( this.baseUrl+'/user-leave/todays-pending-leave-count',request);
  }

  // getPendingLeaveFlag(userUuid:string, request: any, status:string): Observable<any> {
  //   const params = new HttpParams().set("uuid", userUuid).set("status", status);
  //   return this.httpClient.post<any>( this.baseUrl+'/user-leave/save-users-leave',request,  {params});
  // }

  getUserLeaveRequests(uuid: string): Observable<any> {
    const params = new HttpParams().set("userUuid", uuid);
    return this.httpClient.get<any>(`${this.baseUrl}/user-leave/get-user-leave`, {
      params,
    });
  }
  
  //Just for testing
  getUserByUserName(name : string) : Observable<any>{
    const params = new HttpParams().set("name", name);
    return this.httpClient.get<any>(`${this.baseUrl}/get/user`, {params});
  }
  
  assignManagerRoleToMember(teamUuid: string, userUuid: string): Observable<any>{
    const params = new HttpParams()
    .set("teamUuid", teamUuid)
    .set("userUuid", userUuid);
    return this.httpClient.put(`${this.baseUrl}/team/assign-manager-role-to-member`, {}, {params});
  }
  assignMemberRoleToManager(teamUuid: string, userUuid: string): Observable<any>{
    const params = new HttpParams()
    .set("teamUuid", teamUuid)
    .set("userUuid", userUuid);
    return this.httpClient.put(`${this.baseUrl}/team/assign-member-role-to-manager`, {}, {params});
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
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      params: params,
    };
    return this.httpClient.post<string>(url, null, httpOptions);
  }
  
  checkingUserRole(): Observable<boolean>{
    return this.httpClient.get<boolean>(`${this.baseUrl}/team/checking-user-role`);
  }
  sendInviteToUsers(emails : any): Observable<any>{
    return this.httpClient.post(`${this.baseUrl}/email/send-invite-to-users`, emails);
  }
  
  deleteTeam(id : number): Observable<any>{
    const params = new HttpParams().set("teamId", id);
    return this.httpClient.delete(`${this.baseUrl}/team/delete-team/Id`,{params});
  }
  // deleteTeam(teamId: any): Observable<any> {
  //   return this.httpClient.delete(
  //     `${this.baseUrl}/deleteTeam/Id/${teamId}`,S
  //   );
  // }SS
  // ###################################################################
  
  
  // ###########################################################
  
  getTodaysLeaveCount(): Observable<any> {
    return this.httpClient.get( this.baseUrl+'/user-leave/todays-leave-count');
  }

  // slackDataPlaceholderFlag:boolean=false;
  getSlackChannelsDataToTeam(uniqueUuid: string): Observable<any> {
    const params = new HttpParams().set("uniqueUuid", uniqueUuid);
    return this.httpClient.get<any>(`${this.baseUrl}/team/users`, {params});
    
  }
  
  
  getAllRoles(itemPerPage: number, pageNumber: number, sort: string, sortBy: string, search: string, searchBy: string, ownerRoleId: number) : Observable<any>{
    const params = new HttpParams()
    .set("item_per_page", itemPerPage.toString())
    .set("page_number", pageNumber.toString())
    .set('sort_order', sort)
    .set('sort_by', sortBy)
    .set('search', search)
    .set('search_by', searchBy)
    .set('owner_role_id', ownerRoleId);
    return this.httpClient.get<any>(`${this.baseUrl}/role/get/all`, {params});
  }
  getAttendanceLatePerformers(startDate: string, endDate: string): Observable<AttendanceWithLatePerformerResponseDto> {
    const params = new HttpParams()
      .set("startDate", startDate)
      .set("endDate", endDate)
    return this.httpClient.get<AttendanceWithLatePerformerResponseDto>(`${this.baseUrl}/attendance/get-attendance-late-performers-details`, {params});
  }
  getSubModuleByRole(roleId : number): Observable<any>{
    const params = new HttpParams().set("role_id", roleId);
    return this.httpClient.get<any>(`${this.baseUrl}/role/sub-module`, {params});
  }

  createRole(roleRequest : RoleRequest): Observable<any>{
    return this.httpClient.post<any>(`${this.baseUrl}/role/register`, roleRequest);
  }
  updateRoleWithPermissions(roleRequest : RoleRequest): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/role/update`, roleRequest);
  }
  
  //Just for testing purpose
  callingHelloWorld():Observable<any>{
    debugger
    return this.httpClient.get<any>(`${this.baseUrl}/slack/hello`);
  }

  getEmployeesStatus():Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/employee-onboarding-status/get-employee-onboarding-status`);
  }

  
  getLastApprovedAndLastRejecetd():Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/employee-onboarding-status/get-status`);
  }

  
  getUserByUuid(userUuid:any):Observable<any>{
    const params = new HttpParams()
    .set("uuid", userUuid);
    return this.httpClient.get<any>(`${this.baseUrl}/employee-onboarding-status/get-user-by-uuid`, {params});
  }

  assignRoleToUserInUserAndControl(userId: any, roleId: any, description: string): Observable<any>{
    const params = new HttpParams()
    .set("user_id", Number(userId))
    .set("role_id", Number(roleId))
    .set("description", description);
    return this.httpClient.post<any>(`${this.baseUrl}/user-and-control/register`,{}, {params});
  }
   
  updateStatusUser(userUuid:string, statusType:string):Observable<any>{
    const params = new HttpParams()
    .set("user_uuid", userUuid)
    .set("status_type", statusType);
    debugger
    return this.httpClient.put<any>(`${this.baseUrl}/employee-onboarding-status/change-employee-onboarding-status`,{}, {params});
  }

  setEmployeePersonalDetails(userPersonalInformationRequest: UserPersonalInformationRequest, userUuid: string): Observable<any> {
    debugger
    const params = new HttpParams()
    .set("userUuid", userUuid);
    console.log("save")
    return this.httpClient.put<any>(`${this.baseUrl}/users/save/employeePersonalDetails`, userPersonalInformationRequest, {params})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }

  setEmployeeByAdmin(userPersonalInformationRequest: UserPersonalInformationRequest): Observable<any> {
    debugger
    // const params = new HttpParams()
    // .set("userUuid", userUuid);
   
    return this.httpClient.put<any>(`${this.baseUrl}/users/save/employeePersonalDetails`, userPersonalInformationRequest)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
    }
  getUserAndControlRolesByFilter(itemPerPage: number, pageNumber: number, sort: string, sortBy: string, search: string, searchBy: string):Observable<any>{
    const params = new HttpParams()
    .set("item_per_page", itemPerPage.toString())
    .set("page_number", pageNumber.toString())
    .set('sort', sort)
    .set('sort_by', sortBy)
    .set('search', search)
    .set('search_by', searchBy);
    debugger
    return this.httpClient.get<any>(`${this.baseUrl}/user-and-control/get-all`, {params});
  }

  addAdditionalNotes(additionalNotes: AdditionalNotes, email: string): Observable<any>{
    const params = new HttpParams()
    .set("email", email);

    return this.httpClient.post<any>(`${this.baseUrl}/additional-notes/add`, additionalNotes, {params});
  }
  
  

  getNewUserPersonalInformation(userUuid: string): Observable<any> {
    debugger
    const params = new HttpParams()
    .set("userUuid", userUuid);
    const url = `${this.baseUrl}/users/get/employeePersonalDetails`;
    return this.httpClient.get(url, {params});
  }
  
  setEmployeeAddressDetails(userAddressDetailsRequest: UserAddressDetailsRequest, userUuid: string): Observable<any> {
    const params = new HttpParams()
    .set("userUuid", userUuid);
    return this.httpClient.put<any>(`${this.baseUrl}/user-address/save/user-address`, userAddressDetailsRequest, {params})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }
  
  getNewUserAddressDetails(userUuid: string): Observable<any> {
    const params = new HttpParams()
    .set("userUuid", userUuid);
    const url = `${this.baseUrl}/user-address/get/user-address`;
    return this.httpClient.get(url, {params});
  }

  setEmployeeAcademics(userAcademicsDetailRequest: UserAcademicsDetailRequest, userUuid: string): Observable<any> {
    const params = new HttpParams()
    .set("userUuid", userUuid);
    return this.httpClient.put<any>(`${this.baseUrl}/user-academics/save/user-academics`, userAcademicsDetailRequest, {params})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }

  getUserAcademicDetails(userUuid: string): Observable<any> {
    const params = new HttpParams()
    .set("userUuid", userUuid);
    const url = `${this.baseUrl}/user-academics/get/user-academics`;
    return this.httpClient.get(url, {params});
  }

  getEmployeeAdressDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<any>(`${this.baseUrl}/user-address/get/user-address`, {params});
  }
  
  setEmployeeDocumentsDetails(userDocumentsDetailsRequest: UserDocumentsDetailsRequest, userUuid: string): Observable<any> {
    debugger
    const params = new HttpParams()
    .set("userUuid", userUuid);
    return this.httpClient.put<any>(`${this.baseUrl}/user-documents-details/save/user-documents`, userDocumentsDetailsRequest, {params})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }

  getEmployeeDocumentDetails(userUuid: string): Observable<any> {
    debugger
    const params = new HttpParams()
    .set("userUuid", userUuid);
    const url = `${this.baseUrl}/user-documents-details/get/user-documents`;
    return this.httpClient.get(url, {params});
  }

  setEmployeeExperienceDetails(experiences: UserExperience[], userUuid: string): Observable<any> {
    const params = new HttpParams().set("userUuid", userUuid);
    return this.httpClient.put<any>(`${this.baseUrl}/user-experiences/save/experience`, experiences, { params })
        .pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error in setEmployeeExperienceDetails:', error);
                return throwError(error);
            })
        );
}
getEmployeeExperiencesDetailsOnboarding(userUuid: string): Observable<UserExperience[]> {
  debugger
  const params = new HttpParams().set("userUuid", userUuid);
  return this.httpClient.get<UserExperience[]>(`${this.baseUrl}/user-experiences/getExperiences`, { params });
}


  getEmployeeExperiencesDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<any>(`${this.baseUrl}/user-experiences/getExperiences`, {params});
  }

  

  getEmployeeAcademicDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<any>(`${this.baseUrl}/user-academics/user/getUserAcademics`, {params});
  }

  setEmployeeEmergencyContactDetails(userEmergencyContactDetailsRequest: UserEmergencyContactDetailsRequest[], userUuid: string): Observable<any> {
    const params = new HttpParams()
    .set("userUuid", userUuid);
    return this.httpClient.put<any>(`${this.baseUrl}/user-emergency-contacts/save/emergency-contacts`, userEmergencyContactDetailsRequest, {params})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }
  getEmployeeContactsDetails(userUuid:string):Observable<UserEmergencyContactDetailsRequest[]>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<UserEmergencyContactDetailsRequest[]>(`${this.baseUrl}/user-emergency-contacts/get/emergency-contacts-new`, {params});
  }

  setEmployeeBankDetails(userBankDetailRequest: UserBankDetailRequest, userUuid: string): Observable<any> {
    const params = new HttpParams()
    .set("userUuid", userUuid);
    return this.httpClient.put<any>(`${this.baseUrl}/user-bank-details/save/bank-details`, userBankDetailRequest, {params})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error in setEmployeePersonalDetails:', error);
          return throwError(error);
        })
      );
  }
  getEmployeeBankDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<any>(`${this.baseUrl}/user-bank-details/get/bank-details`, {params});
  }

  getOnboardingFormPreview(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
    
    return this.httpClient.get<any>(`${this.baseUrl}/get/onboarding/preview`, {params});
  }

  getUserLeaveLog(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<any>(`${this.baseUrl}/user-leave-logs/leave-log`, {params});
  }

  getUserLeaveLogByStatus(userUuid: string, status?: string): Observable<any> {
    let params = new HttpParams().set("userUuid", userUuid);
    if (status) {
      params = params.set("status", status);
    }
    return this.httpClient.get<any>(`${this.baseUrl}/user-leave-logs/leave-log-by-status`, { params });
  }
  
  getOrganizationOnboardingDate(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("uuid", userUuid)
   
    return this.httpClient.get<any>(`${this.baseUrl}/employee-onboarding-status/get-organization-onboarding-date`, {params});
  }

  get stepsCompletionStatus$() {
    return this.stepsCompletionStatus.asObservable();
  }
stepIndex:number=-1;
  markStepAsCompleted(stepIndex: number): void {
    this.stepIndex=stepIndex;
  }


  getAttendanceRuleByOrganization(){
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/rule/get`);
  }

  getRegisteredAttendanceRuleByOrganization(){
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/rule/get/registered-response`);
  }

  registerAttendanceRuleDefinition(attendanceRuleDefinitionRequest : AttendanceRuleDefinitionRequest):Observable<any>{
    return this.httpClient.post<any>(`${this.baseUrl}/attendance/rule/definition/register`, attendanceRuleDefinitionRequest);
  }

  getAttendanceRuleWithAttendanceRuleDefinition(): Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/rule/with/attendance/rule/definition/get`);
  }

  getAttendanceRuleDefinitionById(attendanceRuleDefinitionId : number): Observable<any>{

    const params = new HttpParams()
    .set("attendance_rule_definition_id", attendanceRuleDefinitionId);

    debugger
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/rule/definition/get/by/id`, {params});
  }

  getAttendanceRuleDefinition(attendanceRuleId : number): Observable<any>{
    const params = new HttpParams()
    .set("attendance_rule_id", attendanceRuleId);
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/rule/definition/get`,{params});
  }

  getDeductionType():Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/rule/definition/deduction-type/get`);
  }

  getOvertimeType():Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/rule/definition/overtime-type/get`);
  }

  deleteAttendanceRuleDefinition(attendanceRuleDefinitionId : number): Observable<any>{
    const params = new HttpParams()
    .set("attendance_rule_definition_id",attendanceRuleDefinitionId);

    return this.httpClient.delete<any>(`${this.baseUrl}/attendance/rule/definition/delete`,{params});
  }

  getEmployeeManagerDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("uuid", userUuid)
   
    return this.httpClient.get<UserDto[]>(`${this.baseUrl}/employee-onboarding-status/get-manager`, {params});
  }

  getEmployeeDocumentsDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<UserDto[]>(`${this.baseUrl}/user-documents-details/get/user-documents`, {params});
  }
  
  selectUserForAttendanceRule(isSelectedForAttendanceRule : boolean, userUuid : string): Observable<any>{
    const params = new HttpParams()
    .set("is_selected_for_attendance_rule", isSelectedForAttendanceRule.toString())
    .set("user_uuid", userUuid);

    return this.httpClient.put<any>(`${this.baseUrl}/users/select-for-attendance-rule`, {}, {params});
  }


  // ###################

  registerLeaveSettingTemplate(leaveSettingResponse: LeaveSettingResponse): Observable<LeaveSettingResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.httpClient.put<LeaveSettingResponse>(
      `${this.baseUrl}/leave-setting/register-leave-template`,
      leaveSettingResponse,
      { headers }
    );
  }

  registerLeaveCategories(leaveSettingCategoryResponse: LeaveSettingCategoryResponse[], leaveSettingId: number): Observable<LeaveSettingCategoryResponse[]> {
    return this.httpClient.put<LeaveSettingCategoryResponse[]>(`${this.baseUrl}/leave-categories-controller/register-leave-categories?leaveSettingId=${leaveSettingId}`, leaveSettingCategoryResponse);
  }

  // registerUserOfLeaveSetting(userLeaveSettingRule: UserLeaveSettingRule): Observable<UserLeaveSettingRule> {
  //   const url = `${this.baseUrl}/user-leave-rule/register-leave-user-rule`;
  //   return this.httpClient.put<UserLeaveSettingRule>(url, userLeaveSettingRule);
  // }

  registerUserOfLeaveSetting(leaveSettingId: number, userUuids: string[]): Observable<any> {
    const url = `${this.baseUrl}/user-leave-rule/register-leave-user-rule`;
    const payload = {
      leaveSettingId,
      userUuids
    };
    return this.httpClient.put(url, payload);
  }

  getFullLeaveSettingInformation(): Observable<FullLeaveSettingResponse[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // Add any additional headers as needed
    });

    // const params = { orgUuid };

    return this.httpClient.get<FullLeaveSettingResponse[]>(`${this.baseUrl}/user-leave-rule/get/leave-full-rule`, { headers});
  }

  getLeaveSettingInformationById(leaveSettingId: number): Observable<FullLeaveSettingResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // Add any additional headers as needed
    });

    const params = { leaveSettingId: leaveSettingId.toString() };

    return this.httpClient.get<FullLeaveSettingResponse>(`${this.baseUrl}/user-leave-rule/get/leave-rule-by-Id`, { headers, params });
  }

  deleteLeaveSettingRule(leaveSettingId: number): Observable<void> {
    const url = `${this.baseUrl}/user-leave-rule/delete-leave-setting-rule?leaveSettingId=${leaveSettingId}`;
    return this.httpClient.delete<void>(url);
  }

  sendMailToEmployeesToCompleteOnboarding(email:string):Observable<any>{

    const params = new HttpParams()
    .set("email", email);
    return this.httpClient.post<any>(`${this.baseUrl}/users/send-invite-to-employees`, {}, {params});
  }

  getAttendanceModeAll(): Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/mode/get/all`);
  }


  getAttendanceMode() : Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/mode/get`);
  }

  updateAttendanceMode(attendanceModeId: number): Observable<any> {
    const params = new HttpParams()
    .set("attendance_mode_id", attendanceModeId);

    return this.httpClient.put<any>(`${this.baseUrl}/organization/update/attendance-mode`, {}, {params});
  }

  getLateEmployeeAttendanceDetails(dataFetchingType : string): Observable<any>{
    const params = new HttpParams()
    .set("data_fetching_type", dataFetchingType);

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-late-employee-attendance-details`, {params});
  }


  registerLeaveSettingRules(fullLeaveSettingRequest: FullLeaveSettingRequest): Observable<FullLeaveSettingRequest> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.httpClient.put<FullLeaveSettingRequest>(
      `${this.baseUrl}/user-leave-rule/register-leave-setting-rules`,
      fullLeaveSettingRequest,
      { headers }
    );
  }

  getAttendanceReportByDateDuration(startDate : string, endDate : string): Observable<any>{

    const params = new HttpParams()
    .set("start_date", startDate)
    .set("end_date", endDate);

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-attendance-report-by-date-duration`, {params});
  }

  getAttendanceReportByDateDurationByUser(startDate : string, endDate : string): Observable<any>{
    const params = new HttpParams()
    .set("start_date", startDate)
    .set("end_date", endDate);

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-attendance-report-by-date-duration-by-user`, {params});
  }


  checkinCheckoutInSlack(userUuid : string, command : string): Observable<any>{
    const params = new HttpParams()
    .set("user_uuid", userUuid)
    .set("command", command);

    return this.httpClient.post<any>(`${this.baseUrl}/attendance/checkin-checkout-from-dashboard`, {}, {params});
  }

  checkinCheckoutStatus(userUuid : string): Observable<any>{
    const params = new HttpParams()
    .set("user_uuid", userUuid)

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/checkin-checkout-status`, {params});
  }

  getAttendanceLogs(email : string, date : string): Observable<any>{
    const params = new HttpParams()
    .set("email", email)
    .set("date", date);

    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-logs`,{params});
  }

  findUsersOfLeaveSetting(leaveSettingId: number , searchText: string, pageNumber: number, itemPerPage: number): Observable<any> {
    const params = new HttpParams().set('search', searchText).set('leaveSettingId', leaveSettingId)
    .set('pageNumber', pageNumber).set('itemPerPage', itemPerPage);
    return this.httpClient.get(`${this.baseUrl}/user-leave-rule/leaveSettingId/users-leave-setting`, { params });
  }


  deleteAllUsersByLeaveSettingId(userUuids: string[]): Observable<void> {
    const url = `${this.baseUrl}/user-leave-rule/delete-all-users-leave-setting-rule`;
    return this.httpClient.delete<void>(url, { body: userUuids });
  }


  deleteUserFromUserLeaveRule(userUuid: string): Observable<void> {
    const url = `${this.baseUrl}/user-leave-rule/delete-user-from-leave-setting-rule?userUuid=${userUuid}`;
    return this.httpClient.delete<void>(url);
  }
  

  addUserToLeaveRule(userUuid: string, leaveSettingId: number): Observable<any> {
    const url = `${this.baseUrl}/user-leave-rule/add-users-in-leave-setting?userUuid=${userUuid}&leaveSettingId=${leaveSettingId}`;
    return this.httpClient.post<any>(url, {});
  }

  testing(testing : Testing): Observable<any>{
    return this.httpClient.post<any>(`${this.baseUrl}/testing/register`, testing);
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

}