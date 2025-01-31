import { Injectable } from '@angular/core';
import { API_URLS } from '../constant/ApiUrls';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

   constructor(private http:HttpClient) { }
  
    getAbstract(paramsObj?: Record<string, any>): Observable <any> {
      const params = new HttpParams({ fromObject: paramsObj || {} });
      return this.http.get(`${API_URLS.base_url}${API_URLS.teamsForFilter}`, { params });
  
    }
}
