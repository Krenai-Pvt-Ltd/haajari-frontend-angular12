import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Organization, Users } from '../models/users';
import { Time } from '@angular/common';
import { Savel } from '../models/savel';
import { AttendenceDto } from '../models/attendence-dto';
import { OnboardingComponent } from '../modules/dynamic/components/onboarding/onboarding.component';
import { SlackAuthComponent } from '../modules/dynamic/components/slack-auth/slack-auth.component';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // id !: number;
   
  orgId: any;
  constructor(private httpClient: HttpClient) { 
    
  }
  // private refId = new BehaviorSubject<number | null>(null);;

  // setRefId(num: number) {
  //   console.log('Setting organization ID:', num);
  //   this.refId.next(num);
  // }

  // getRefId(): Observable<number | null> {
  //   return this.refId.asObservable();
  // }

  private orgIdEmitter = new EventEmitter<number>();

  setOrgId(orgId: number) {
    this.orgIdEmitter.emit(orgId);
  }

  getOrgIdEmitter(): EventEmitter<number> {
    return this.orgIdEmitter;
  }

  private baseUrl = "http://localhost:8080/api/v1/attendance";

  
  openSidebar:boolean=true;

  getUsersByFilter(itemPerPage: number, pageNumber: number, sort: string, sortBy: string, search: string, searchBy: string) : Observable<any>{
    const params = new HttpParams()
    .set("itemPerPage", itemPerPage.toString())
    .set("pageNumber", pageNumber.toString())
    .set('sortOrder', sort)
    .set('sortBy', sortBy)
    .set('search', search)
    .set('searchBy', searchBy);

    return this.httpClient.get<any>(`${this.baseUrl}/users/by-filters`, {params});
  }


  registerOnboardingDetails(name: string, email: string, password: string, state: string, country: string, organizationPic: File | null){
    const params = new HttpParams()
      .set('name', name)
      .set('email', email)
      .set('password', password)
      .set('state', state)
      .set('country', country)

    const url = `http://localhost:8080/api/v1/attendance/register-org?${params.toString()}`;

    return this.httpClient.post(url, organizationPic);
  }

  saveLeave(leaveData: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/save-leave`, leaveData);
}

  getLeave(): Observable<any> {
  return this.httpClient.get<Savel[]>(`${this.baseUrl}/get-leave`);
}

updateLeaveStatus(sav: Savel): Observable<any> {
  return this.httpClient.put(`${this.baseUrl}/update-leave-status/${sav.id}`, sav);
}

  changeStatusById(id: number, presenceStatus: Boolean) : Observable<any>{
    const params = new HttpParams()
    .set('id', id.toString())
    .set('presenceStatus', presenceStatus.toString());

    return this.httpClient.put<any>(`${this.baseUrl}/change-status`, params);
  }

  getDurationDetails(startDateStr : string, endDateStr : string) : Observable<Record<string,AttendenceDto[]>>{
    const params = new HttpParams()
    .set('startDateStr', startDateStr)
    .set('endDateStr', endDateStr)
    return this.httpClient.get<any>(`${this.baseUrl}/testingg`,{params});
  }

  saveShiftTimings(shiftTimingsData: any): Observable<any> {
    return this.httpClient.post(`http://localhost:8080/api/v1/attendance/save-shift-timings`, shiftTimingsData);
  }

 
  saveTokenForOrganization(token: string, organizationId: any): Observable<any> {
    const params = new HttpParams()
    .set('token', token)
    .set('organizationId',organizationId)
    

    const url = `${this.baseUrl}/savetoken`;

    return this.httpClient.put(url, {params});
  }

  signInOrganization(email: string, password: string): Observable<any>{
    const params = new HttpParams()
    .set('email', email)
    .set('password', password)

    return this.httpClient.get(`${this.baseUrl}/organization/signin`, {params});
  }

  // signUpOrganization(email: string, password: string): Observable<any>{
  //   const params = new HttpParams()
  //   .set('email', email)
  //   .set('password', password)

  //   return this.httpClient.get(`${this.baseUrl}/create-user-firebase`, {params});
  // }

}









