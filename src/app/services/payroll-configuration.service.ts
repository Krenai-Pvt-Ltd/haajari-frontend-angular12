import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { Observable } from 'rxjs';
import { TaxDetail } from '../payroll-models/TaxDetail';
import { EmployeeProvidentFund } from '../payroll-models/EmployeeProvidentFund';

@Injectable({
  providedIn: 'root'
})
export class PayrollConfigurationService {
  private _key: Key = new Key();

  constructor(private _http: HttpClient) {}


  getTodoList(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-todo-step`);
    }

    getTaxDetail(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/tax`);
    }

    saveTaxDetail(data:TaxDetail): Observable<any>{
      return this._http.put<any>(`${this._key.base_url}/payroll-config/tax`,data);
    }

    getEmployee(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/employees`);
    }

    getEpfDetail(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/epf`);
    }

    getPfContribution(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/pf-contribution`);
    }

    saveEpfDetail(data:EmployeeProvidentFund): Observable<any>{
      return this._http.put<any>(`${this._key.base_url}/payroll-config/epf`,data);
    }
}
