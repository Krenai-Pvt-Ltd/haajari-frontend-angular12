import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Organization, Users } from "../models/users";
import { Time } from "@angular/common";
import { Savel } from "../models/savel";
import { AttendenceDto } from "../models/attendence-dto";
import { OnboardingComponent } from "../modules/dynamic/components/onboarding/onboarding.component";
import { SlackAuthComponent } from "../modules/dynamic/components/slack-auth/slack-auth.component";
import { ShiftTimings } from "../models/shifttimings";
import { DailyQuestionsCheckout } from "../models/daily-questions-check-out";
import { DailyNotes } from "../models/daily-notes";
import { DailyQuestionsCheckIn } from "../models/daily-questions-check-in";
import { TeamResponse } from "../models/team";


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

  private baseUrl = "http://localhost:8080/api/v1/attendance";

  openSidebar: boolean = true;

  getUsersByFilter(itemPerPage: number, pageNumber: number, sort: string, sortBy: string, search: string, searchBy: string, organizationId: number, role: string) : Observable<any>{
    const params = new HttpParams()
    .set("itemPerPage", itemPerPage.toString())
    .set("pageNumber", pageNumber.toString())
    .set('sortOrder', sort)
    .set('sortBy', sortBy)
    .set('search', search)
    .set('searchBy', searchBy)
    .set('organizationId', organizationId)
    .set('role', role);


    return this.httpClient.get<any>(`${this.baseUrl}/users/by-filters`, {params});
  }

  getAllUsersByFilter(sort: string, sortBy: string, search: string, searchBy: string, organizationId: number, role: string) : Observable<any>{
    const params = new HttpParams()
    .set('sortOrder', sort)
    .set('sortBy', sortBy)
    .set('search', search)
    .set('searchBy', searchBy)
    .set('organizationId', organizationId)
    .set('role', role);


    return this.httpClient.get<any>(`${this.baseUrl}/all/users`, {params});
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

  saveLeave(leaveData: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/save-leave`, leaveData);
  }

  getLeave(orgId: any): Observable<any> {
    const params = new HttpParams().set("id", orgId);
    return this.httpClient.get<Savel[]>(`${this.baseUrl}/get-leave`, {
      params,
    });
  }

  // ##################################################3

  getTeamsById(id: any): Observable<any> {
    const params = new HttpParams().set("id", id);
    return this.httpClient.get<TeamResponse[]>(`${this.baseUrl}/get-team-by-team-id`, {
      params,
    });
  }

  getAllTeamsWithUsersByUserId(userId: number, role: string): Observable<TeamResponse[]> {
    const params = new HttpParams()
    .set("userId", userId)
    .set("role", role);

    return this.httpClient.get<TeamResponse[]>(`${this.baseUrl}/get-all-teams-with-users-by-user-id`, {params});
  }

  // ##################################
  getOrg(orgId: any): Observable<any> {
    const params = new HttpParams().set("id", orgId);
    return this.httpClient.get<Organization[]>(this.baseUrl + "/get-org", {
      params,
    });
  }

  getShiftTimings(orgId: any): Observable<any> {
    const params = new HttpParams().set("id", orgId);
    return this.httpClient.get<ShiftTimings[]>(
      this.baseUrl + "/get-shift-timings-detail",
      { params }
    );
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

    return this.httpClient.put<any>(`${this.baseUrl}/change-status`, params);
  }


  getDurationDetails(id : number, role : string, startDateStr : string, endDateStr : string) : Observable<any>{
    const params = new HttpParams()
    .set('id',id)
    .set('role', role)
    .set('startDateStr', startDateStr)
    .set('endDateStr', endDateStr);
    return this.httpClient.get<any>(`${this.baseUrl}/testingg`,{params});
  }

  saveShiftTimings(shiftTimingsData: any): Observable<any> {
    return this.httpClient.put(
      `http://localhost:8080/api/v1/attendance/save-shift-timings`,
      shiftTimingsData
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

  getDailyNotes(organiId: any): Observable<any> {
    const params = new HttpParams().set("id", organiId);
    return this.httpClient.get<DailyNotes[]>(`${this.baseUrl}/get-daily-Notes`, {
      params,
    });
  }

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

    return this.httpClient.put<any>(`${this.baseUrl}/register-organization-using-code-param`, {}, {params});
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
    return this.httpClient.post(`${this.baseUrl}/register-team`, userIds, {params});
  }


  sendInviteToUsers(emails : any): Observable<any>{
    return this.httpClient.post(`${this.baseUrl}/send-invite-to-users`, emails);
  }


  assignManagerRoleToMember(teamId: number, userId: number): Observable<any>{
    const params = new HttpParams()
    .set("teamId", teamId)
    .set("userId", userId);

    return this.httpClient.put(`${this.baseUrl}/assign-manager-role-to-member`, {}, {params});
  }


  assignMemberRoleToManager(teamId: number, userId: number): Observable<any>{
    const params = new HttpParams()
    .set("teamId", teamId)
    .set("userId", userId);

    return this.httpClient.put(`${this.baseUrl}/assign-member-role-to-manager`, {}, {params});
  }


}
