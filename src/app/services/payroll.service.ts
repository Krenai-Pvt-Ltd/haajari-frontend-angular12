import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  private _key: Key = new Key();

  constructor(private _http: HttpClient) {}


  countPayrollDashboardEmployee(startDate: string,endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this._http.get<any>(`${this._key.base_url}/salary/payroll/dashboard/employee/count`,{ params });
  }

  getMonthResponseListByYear(date: string): Observable<any>{
    const params = new HttpParams()
    .set('date', date);

    return this._http.get<any>(`${this._key.base_url}/salary/payroll-dashboard/month-response-list`, {params});
  }


  getPayrollProcessStep(startDate: string , endDate: string):Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate);

    return this._http.get<any>(`${this._key.base_url}/salary/payroll-dashboard/step`, {params});
  }


  getOrganizationIndividualMonthSalaryData(startDate: string,endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this._http.get<any>(`${this._key.base_url}/salary/organization-individual-month-data`,{ params });
  }


  getOrganizationPreviousMonthSalaryData(startDate: string,endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this._http.get<any>(`${this._key.base_url}/salary/organization-previous-month-data`,{ params });
  }


  
}
