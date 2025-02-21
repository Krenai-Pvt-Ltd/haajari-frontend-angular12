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
}
