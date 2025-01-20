import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constant/ApiUrls';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {

  constructor(private http:HttpClient) { }

  get(paramsObj?: Record<string, any>): Observable<any> {
    const params = new HttpParams({ fromObject: paramsObj || {} });
    return this.http.get(`${API_URLS.base_url}${API_URLS.leaves}`, { params });

  }

  getLeaveCountersByDateRange(paramsObj?: Record<string, any>): Observable<any> {
    const params = new HttpParams({ fromObject: paramsObj || {} });
    return this.http.get(`${API_URLS.base_url}${API_URLS.leavesCountReport}`, { params });

  }
}
