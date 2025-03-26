import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EarningComponent } from '../payroll-models/EarrningComponent';
import { ReimbursementComponent } from '../payroll-models/ReimbursementComponent';
import { DeductionComponent } from '../payroll-models/DeductionComponent';
import { BenefitComponent } from '../payroll-models/BenefitComponent';

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

  saveEarningComponent(earningComponent: EarningComponent): Observable<any>{
    return this._http.post<any>(`${this._key.base_url}/salary-component/earning`,earningComponent);
  }

  getOrganizationBenefitComponent(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary-component/benefit`);
  }

  getBenefitPlanType(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary-component/benefit-plan-type`);
  }

  saveBenefitComponent(benefitComponent: BenefitComponent): Observable<any>{
    return this._http.post<any>(`${this._key.base_url}/salary-component/benefit`,benefitComponent);
  }


  getTaxExemptionSection(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary-component/tax-exemption-section`);
  }

  getOrganizationDeductionComponent(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary-component/deduction`);
  }

  saveDeductionComponent(deductionComponent: DeductionComponent): Observable<any>{
    return this._http.post<any>(`${this._key.base_url}/salary-component/deduction`,deductionComponent);
  }


  getDefaultReimbursementComponent(): Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary-component/reimbursement-types`);
  }

  getOrganizationReimbursementComponent(currentPage:number,itemPerPage:number): Observable<any>{
    const params = new HttpParams()
    .set('currentPage', currentPage)
    .set('itemPerPage', itemPerPage);
  return this._http.get<any>(`${this._key.base_url}/salary-component/reimbursement`,{ params });
  }

  saveReimbursementComponent(reimbursementComponent: ReimbursementComponent): Observable<any>{
  return this._http.post<any>(`${this._key.base_url}/salary-component/reimbursement`,reimbursementComponent);
}
  
}
