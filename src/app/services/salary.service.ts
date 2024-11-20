import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {

  private _key: Key = new Key();

  constructor(private _http: HttpClient) {}


  getAllSalaryCalculationMode(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/salary/calculation/mode/get/all`);
  }

  updateSalaryCalculationMode(salaryCalculationModeId: number): Observable<any> {
    const params = new HttpParams()
    .set('salary_calculation_mode_id',salaryCalculationModeId);

    return this._http.put<any>(`${this._key.base_url}/salary/calculation/mode/update`,{},{ params });
  }

  getSalaryDetailExcel(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary/last-salary-detail-log`);
  }

  getAllStatutories(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/statutory/get/all`);
  }

  getCurrentSalaryReport():Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary/download`);
  }

  updateUserSalaryDetail(url:string, fileName:string,): Observable<any>{
    const params = new HttpParams()
    .set('url',url)
    .set('fileName',fileName);
    return this._http.put<any>(`${this._key.base_url}/salary/import`, {},{params});
  }
}
