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

  //private baseUrl = "https://backend.hajiri.work/api/v2";

  openSidebar: boolean = true;

  getUsersByFilter(itemPerPage: number, pageNumber: number, sort: string, sortBy: string, search: string, searchBy: string, organizationId: number, role: string) : Observable<any>{
    const params = new HttpParams()
    .set("item_per_page", itemPerPage.toString())
    .set("page_number", pageNumber.toString())
    .set('sort_order', sort)
    .set('sort_by', sortBy)
    .set('search', search)
    .set('search_by', searchBy)
    .set('organization_id', organizationId)
    .set('role', role);

    return this.httpClient.get<any>(`${this.baseUrl}/users/get/by-filters`, {params});
  }

  getAllUsersByFilter(sort: string, sortBy: string, search: string, searchBy: string, organizationId: number, role: string) : Observable<any>{
    const params = new HttpParams()
    .set('sortOrder', sort)
    .set('sortBy', sortBy)
    .set('search', search)
    .set('searchBy', searchBy)
    .set('organizationId', organizationId)
    .set('role', role);


    return this.httpClient.get<any>(`${this.baseUrl}/users/get/all/by-filters`, {params});
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

  getTeamsById(id: any): Observable<any> {
    const params = new HttpParams().set("id", id);
    return this.httpClient.get<TeamResponse[]>(`${this.baseUrl}/team/get-team-by-team-id`, {
      params,
    });
  }

  getAllTeamsWithUsersByUserId(userId: number, role : string): Observable<TeamResponse[]> {
    const params = new HttpParams()
    .set("userId", userId)
    .set("role",role);
    return this.httpClient.get<TeamResponse[]>(`${this.baseUrl}/team/get-all-teams-with-users-by-user-id`, {params});


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

  changeStatusById(id: number, presenceStatus: Boolean): Observable<any> {
    const params = new HttpParams()
      .set("id", id.toString())
      .set("presenceStatus", presenceStatus.toString());

    return this.httpClient.put<any>(`${this.baseUrl}/users/change-status`, params);
  }


  getDurationDetails(id : number, role : string, startDate : string, endDate : string) : Observable<any>{
    const params = new HttpParams()
    .set('id',id)
    .set('role', role)
    .set('start_date', startDate)
    .set('end_date', endDate);

    debugger
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-attendance-details`,{params});
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

  signInOrganization(email: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set("email", email)
      .set("password", password);

    return this.httpClient.get(`${this.baseUrl}/organization/signin`, {
      params,
    });
  }

  // saveTokenForOrganization(organization : Organization): Observable<any> {
   
  //   return this.httpClient.post<any>(this.baseUrl+ '/savetoken', organization);
  // }

  
  // getAccessToken(code: string): Observable<any> {
  //   const params = new HttpParams().set("code", code);

  //   return this.httpClient.get(this.baseUrl + "/get-token", { params });
  // }

  registerOrganizationUsingCodeParam(codeParam: string): Observable<any>{
    const params = new HttpParams().set("codeParam", codeParam);

    return this.httpClient.put<any>(`${this.baseUrl}/organization/register-organization-using-code-param`, {}, {params});
  }


  saveLeaveRequest(request: any): Observable<any> {
    return this.httpClient.post( this.baseUrl+'/save-users-leave',request);
  }

  getUserLeaveRequests(id: any): Observable<any> {
    const params = new HttpParams().set("id", id);
    return this.httpClient.get<any>(`${this.baseUrl}/user-leave`, {
      params,
    });
  }
  

  //Just for testing
  getUserByUserName(name : string) : Observable<any>{
    const params = new HttpParams().set("name", name);

    return this.httpClient.get<any>(`${this.baseUrl}/get/user`, {params});
  }


  registerTeam(userIds: any, name: string, description: string): Observable<any> {
    const params = new HttpParams()
    .set("name", name)
    .set("description", description);
    return this.httpClient.post(`${this.baseUrl}/team/register`, userIds, {params});
  }



  assignManagerRoleToMember(teamId: number, userId: number): Observable<any>{
    const params = new HttpParams()
    .set("teamId", teamId)
    .set("userId", userId);
    return this.httpClient.put(`${this.baseUrl}/team/assign-manager-role-to-member`, {}, {params});
  }


  assignMemberRoleToManager(teamId: number, userId: number): Observable<any>{
    const params = new HttpParams()
    .set("teamId", teamId)
    .set("userId", userId);

    return this.httpClient.put(`${this.baseUrl}/team/assign-member-role-to-manager`, {}, {params});
  }

  removeUserFromTeam(teamId: number, userId: number): Observable<string> {
    const url = `${this.baseUrl}/team/removeUser?teamId=${teamId}&userId=${userId}`;
    return this.httpClient.delete<string>(url);
  }

  addUsersToTeam(teamId: number, userIds: number[]): Observable<string> {
    const url = `${this.baseUrl}/team/add-users-by-user-ids`;

    const params = new HttpParams()
      .set('teamId', +teamId)
      .set('userIds', userIds.join(','));

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      params: params,
    };

    return this.httpClient.post<string>(url, null, httpOptions);
  }

  

  checkingUserRole(id : number): Observable<boolean>{
    const params = new HttpParams().set("id", id);
    return this.httpClient.get<boolean>(`${this.baseUrl}/team/checking-user-role`, {params});
  }

  sendInviteToUsers(emails : any): Observable<any>{
    return this.httpClient.post(`${this.baseUrl}/email/send-invite-to-users`, emails);
  }

  getTodayEmployeesData(): Observable<any>{
    return this.httpClient.get<any>(`${this.baseUrl}/today-employees-data`);
  }
  deleteTeam(id : number, role: any): Observable<any>{
    const params = new HttpParams().set("teamId", id).set("role", role);
    return this.httpClient.delete(`${this.baseUrl}/team/delete-team/Id`,{params});
  }

  // deleteTeam(teamId: any): Observable<any> {
  //   return this.httpClient.delete(
  //     `${this.baseUrl}/deleteTeam/Id/${teamId}`,S
  //   );
  // }SS
  // ###################################################################

  registerOrganizationPersonalInformation(personalInformation: any, organizationId: number): Observable<any> {
    const params = new HttpParams().set("organization_id", organizationId);

    return this.httpClient.put<any>(`${this.baseUrl}/organization-personal-information/register`, personalInformation, {params});
  }

  getOrganizationDetails(organizationId: number): Observable<any> {
    const params = new HttpParams().set("organization_id", organizationId);

    return this.httpClient.get<any>(`${this.baseUrl}/organization-personal-information/get`, { params } );
  }

  saveShiftTimings(shiftTiming: any, organizationId: number): Observable<any> {
    const params = new HttpParams().set("organization_id", organizationId);

    return this.httpClient.put(`${this.baseUrl}/organization-shift-timing/register`, shiftTiming, {params});
  }

  getShiftTimings(organizationId: number): Observable<any> {
    const params = new HttpParams().set("organization_id", organizationId);

    return this.httpClient.get<ShiftTimings[]>(`${this.baseUrl}/organization-shift-timing/get/last-detail`, { params } );
  }

  saveDailyQuestionaire(dailyQuestions: any, organizationId: number): Observable<any> {
    const params = new HttpParams().set("organization_id", organizationId);

    return this.httpClient.put(`${this.baseUrl}/organization-daily-question/register`, dailyQuestions, {params});
  }

  getDailyQuestionaire(organizationId: number): Observable<any> {
    const params = new HttpParams().set("organization_id", organizationId);

    return this.httpClient.get(`${this.baseUrl}/organization-daily-question/get`,{params});
  }

  saveLeave(leaveData: any, organizationId: number): Observable<any> {
    const params = new HttpParams().set("organization_id", organizationId);

    return this.httpClient.post(`${this.baseUrl}/organization-leave/register`, leaveData, {params});
  }

  getLeave(organizationId: number): Observable<any> {
    const params = new HttpParams().set("organization_id", organizationId);
    return this.httpClient.get<Savel[]>(`${this.baseUrl}/organization-leave/get/all`, {params});
  }

  // ###########################################################
  getAttendanceDetailsByDate(id : number, role : string, date : string): Observable<any>{

    const params = new HttpParams()
    .set("id", id)
    .set("role", role)
    .set("date", date)

    debugger
    return this.httpClient.get<any>(`${this.baseUrl}/attendance/get-attendance-details-by-date`, {params});
  }

}
