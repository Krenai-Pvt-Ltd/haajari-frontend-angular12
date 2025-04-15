import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Key } from '../constant/key';
import { SalaryTemplate } from '../payroll-models/SalaryTemplate';
import { UserSalaryTemplate } from '../payroll-models/UserSalaryTemplate';


@Injectable({
  providedIn: 'root'
})
export class SalaryTemplateService {

   private _key: Key = new Key();

  constructor(private _http: HttpClient) { }

  getTemplateComponents(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary-template/template-components`);
  }

  getSalaryTemplates(isActive:number,currentPage:number,itemPerPage:number,search:string): Observable<any>{
    const params = new HttpParams()
    .set('is_active', isActive)
    .set('currentPage', currentPage)
    .set('itemPerPage', itemPerPage)
    .set('search',search);
    return this._http.get<any>(`${this._key.base_url}/salary-template/template-list`,{params});
  }


  saveSalaryTemplate(salaryTemplate:SalaryTemplate): Observable<any>{
    return this._http.put<any>(`${this._key.base_url}/salary-template/template`,salaryTemplate);
  }

  chnageTemplateStatus(templateId:number): Observable<any>{
    const params = new HttpParams()
    .set('template_id', templateId)
    return this._http.put<any>(`${this._key.base_url}/salary-template/template-status`,{},{params});
  }

  deleteTemplate(templateId:number): Observable<any>{
    const params = new HttpParams()
    .set('template_id', templateId)
    return this._http.delete<any>(`${this._key.base_url}/salary-template/template`,{params});
  }

  saveUserSalaryTemplate(userSalaryTemplate:UserSalaryTemplate){
    return this._http.put<any>(`${this._key.base_url}/salary-template/user-template`,userSalaryTemplate);
  }
}
