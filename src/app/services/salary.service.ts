import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BulkAction } from '../models/bulkAction';

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


  getAllTemplateComponents(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/salary/component`);
  }


  getAllSalaryTemplate(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/salary/template/component`
    );
  }

  getPFContributionRate(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/statutory/pf-contribution-rate`);
  }


  getESIContributionRate(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/statutory/esi-contribution-rate`);
  }

  getAllStatutories(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/statutory`);
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


  getBulkActionLog(bulkActionType: string, name:string, currentPage:number) {  
   
    var params = new HttpParams()
    params=params.set('name', name)
    params=params.set('bulkActionType', bulkActionType)
    params=params.set('currentPage', currentPage)
    params=params.set('itemsPerPage', 20)
  

    return this._http.get<any>(`${this._key.base_url}/bulk/action`,{params});
  }

  getUpdatedUser(bulkId:number): Observable<any>{
    const params = new HttpParams()
    .set('bulkId',bulkId)
    return this._http.get<any>(`${this._key.base_url}/salary/bulk-updated`,{params});
  }


}
