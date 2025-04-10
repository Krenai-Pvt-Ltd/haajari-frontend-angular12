import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SalaryComponentService {

  private _key: Key = new Key();

  constructor(private _http: HttpClient) { }


  getDefaultEarningComponent(): Observable<any>{
     return this._http.get<any>(`${this._key.base_url}/salary-component/default-earning`);
  }

  getOrganizationEarningComponent(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary-component/earning`);
  }

  getOrganizationBenefitComponent(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary-component/benefit`);
  }

  getOrganizationDeductionComponent(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary-component/deduction`);
  }
  
}
