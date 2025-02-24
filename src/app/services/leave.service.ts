import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constant/ApiUrls';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {

  constructor(private http:HttpClient) { }

  // get(paramsObj?: Record<string, any>): Observable<any> {
  //   debugger
  //   const params = Object.entries(paramsObj || {})
  //     .filter(([_, value]) => value !== undefined)
  //     .reduce((acc: any, [key, value]) => {
  //       if (acc[key]) {
  //         // If key already exists, merge existing value(s) into an array
  //         acc[key] = Array.isArray(acc[key]) ? [...acc[key], value] : [acc[key], value];
  //       } else {
  //         // If key doesn't exist, assign value directly
  //         acc[key] = value;
  //       }
  //       return acc;
  //     }, {});
  
  //   return this.http.get(`${API_URLS.base_url}${API_URLS.leaves}`, { params });
  // }
  


  get(paramsObj?: Record<string, any>): Observable<any> {
    
     // Remove any keys where the value is undefined
    const params = Object.entries(paramsObj || {})
      .filter(([key, value]) => value !== undefined)
      .reduce((acc:any, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  
  
    return this.http.get(`${API_URLS.base_url}${API_URLS.leaves}`, { params });

  }
  

  getLeaveCountersByDateRange(paramsObj?: Record<string, any>): Observable<any> {
    const params = new HttpParams({ fromObject: paramsObj || {} });
    return this.http.get(`${API_URLS.base_url}${API_URLS.leavesCountReport}`, { params });

  }




  approveOrRejectLeaveOfUser(
    requestedLeaveId: number,
    appRejString: string,
    rejectionReason: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('requestedLeaveId', requestedLeaveId)
      .set('appRejString', appRejString)
      .set('rejectionReason', rejectionReason);
    return this.http.post<any>(
      `${API_URLS.base_url}/leave/approve-reject-leaves`,
      {},
      { params }
    );
  }


  getDayWiseLeaveStatus(
    userLeaveId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('userLeaveId', userLeaveId);
    return this.http.get<any>(
      `${API_URLS.base_url}/leave/day-wise/status`,
      { params }
    );
  }


  getDetailsForLeaveTeamOverview(
    tabName: string,
    startDate: string,
    endDate: string,
    itemPerPage: number,
    currentPage: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('tabName', tabName)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('itemPerPage', itemPerPage)
      .set('currentPage', currentPage);
    return this.http.get<any>(
      `${API_URLS.base_url}/leave/team-overview`,
      { params }
    );
  }


  getReportDetailsForLeaveTeamOverview(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(
      `${API_URLS.base_url}/leave/team-overview/report`,
      { params }
    );
  }


  getLeaveCategoryDetailsForLeaveTeamOverview(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(
      `${API_URLS.base_url}/leave/leave-categories`,
      {params }
    );
  }


  getLeaveTopDefaulterUser(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(
      `${API_URLS.base_url}/leave/top-defaulter-user`,
      {params }
    );
  }

  

  


  
}
