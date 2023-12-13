import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Organization, Users } from "../models/users";
import { Savel } from "../models/savel";
import { AttendenceDto } from "../models/attendence-dto";
import { OnboardingComponent } from "../modules/dynamic/components/onboarding/onboarding.component";
import { SlackAuthComponent } from "../modules/dynamic/components/slack-auth/slack-auth.component";
import { ShiftTimings } from "../models/shifttimings";
import { DailyQuestionsCheckout } from "../models/daily-questions-check-out";
import { DailyQuestionsCheckIn } from "../models/daily-questions-check-in";
import { TeamResponse } from "../models/team";
import { Key } from "../constant/key";
import { OrganizationPersonalInformation } from "../models/organization-personal-information";
import { AttendanceWithLatePerformerResponseDto, AttendanceWithTopPerformerResponseDto } from "../models/Attendance.model";
import { RoleRequest } from "../models/role-request";
import { User } from "../models/user";
import { UserDto } from "../models/user-dto.model";
@Injectable({
  providedIn: "root",
})
export class DataService {
  orgId: any;
  constructor(private httpClient: HttpClient) {}
  private orgIdEmitter = new EventEmitter<number>();
  setOrgId(orgId: number) {
    this.orgIdEmitter.emit(orgId);
  }
  getOrgIdEmitter(): EventEmitter<number> {
    return this.orgIdEmitter;
  }
  //private baseUrl = Key.ENDPOINT;
  
  private baseUrl = "http://localhost:8080/api/v2"

  //  private baseUrl = "https://backend.hajiri.work/api/v2";
  openSidebar: boolean = true;
  registerOrganizationUsingCodeParam(codeParam: string): Observable<any>{
    const params = new HttpParams().set("code_param", codeParam);
    return this.httpClient.put<any>(`${this.baseUrl}/organization/register-organization-using-code-param`, {}, {params});
  }
  //Attendance module
  getAttendanceDetailsByDateDuration(startDate : string, endDate : string) : Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate);
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
  //Organization shift-timing module
  registerShiftTimings(shiftTiming: any): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/organization-shift-timing/register`, shiftTiming);
  }
  getShiftTimings(): Observable<any> {
    return this.httpClient.get<ShiftTimings[]>(`${this.baseUrl}/organization-shift-timing/get/last-detail`);
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
  getAllUsersByFilter(sort: string, sortBy: string, search: string, searchBy: string, organizationUuid: string, role: string) : Observable<any>{
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
  //Team module
  registerTeam(userIds: any, name: string, description: string): Observable<any> {
    const params = new HttpParams()
    .set("name", name)
    .set("description", description)
    return this.httpClient.post(`${this.baseUrl}/team/register`, userIds, {params});
  }
  getTeamsByFilter(itemPerPage: number, pageNumber: number, search: string, searchBy: string): Observable<any> {
    const params = new HttpParams()
      .set("item_per_page", itemPerPage.toString())
      .set("page_number", pageNumber.toString())
      .set("search", search)
      .set("search_by", searchBy);
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

  slackDataPlaceholderFlag:boolean=false;
  getSlackChannelsDataToTeam(organizationUuid: string): Observable<any> {
    const params = new HttpParams().set("organization_uuid", organizationUuid);
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
    const params = new HttpParams()
    .set("role_id", roleId);
    return this.httpClient.get<any>(`${this.baseUrl}/role/sub-module`, {params});
  }
  updateRolePermissions(roleRequest : RoleRequest): Observable<any> {
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

   
  updateStatusUser(userUuid:string, statusType:string):Observable<any>{
    const params = new HttpParams()
    .set("user_uuid", userUuid)
    .set("status_type", statusType);
    debugger
    return this.httpClient.put<any>(`${this.baseUrl}/employee-onboarding-status/change-employee-onboarding-status`,{}, {params});
  }

  
  getEmployeeAdressDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<any>(`${this.baseUrl}/user-address/get/user-address`, {params});
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

  getEmployeeContactsDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<any>(`${this.baseUrl}/user-emergency-contacts/get/emergency-contacts`, {params});
  }

  getEmployeeBankDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("userUuid", userUuid)
   
    return this.httpClient.get<any>(`${this.baseUrl}/user-bank-details/get/bank-details`, {params});
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

  getEmployeeManagerDetails(userUuid:string):Observable<any>{
    const params = new HttpParams()
    .set("uuid", userUuid)
   
    return this.httpClient.get<UserDto[]>(`${this.baseUrl}/employee-onboarding-status/get-manager`, {params});
  }
  
}