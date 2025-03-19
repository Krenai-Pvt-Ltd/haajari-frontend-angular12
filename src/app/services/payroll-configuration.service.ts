import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { Observable } from 'rxjs';
import { TaxDetail } from '../payroll-models/TaxDetail';
import { EmployeeProvidentFund } from '../payroll-models/EmployeeProvidentFund';
import { EmployeeStateInsurance } from '../payroll-models/EmployeeStateInsurance';
import { Profile } from '../payroll-models/Profile';
import { add } from 'lodash';
import { PaySchedule } from '../payroll-models/PaySchedule';
import { OrganizationAddressWithStaff } from '../payroll-models/OrganizationAddressWithStaff';
import { StaffAddressDetailsForMultiLocation } from '../payroll-models/StaffAddressDetailMultiLocation';
import { OrganizationUserLocation } from '../payroll-models/OrganizationUserLocation';

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

    saveEsiDetail(isCtcIncluded:number, esiNumber:string ): Observable<any>{
      const params = new HttpParams()
      .set('is_ctc_included', isCtcIncluded)
      .set('esi_number', esiNumber)
      return this._http.put<any>(`${this._key.base_url}/payroll-config/esi`,{},{params});
    }

    getEsiDetail(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/esi`);
    }

    getAddressList(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/address-details`);
    }

    getProfessionalTax(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/professional-tax`);
    }

    savePtNumber(professionalTaxNumber:string, organizationProfessionalTaxId:number ): Observable<any>{
      const params = new HttpParams()
      .set('professional_tax_number', professionalTaxNumber)
      .set('organization_professional_tax_id', organizationProfessionalTaxId)
      return this._http.put<any>(`${this._key.base_url}/payroll-config/professional-tax`,{},{params});
    }

    getLabourWelfareFund(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/lwf`);
    }


    changeLwfStatus(addressId:number): Observable<any>{
      const params = new HttpParams()
      .set('address_id', addressId)
      return this._http.put<any>(`${this._key.base_url}/payroll-config/lwf-status`,{},{params});
    }


    getOrganizationProfile(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/profile-configuration`);
    }

    saveOrganizationProfile(data:Profile): Observable<any>{
      return this._http.put<any>(`${this._key.base_url}/payroll-config/profile-configuration`,data);
    }


   

    getPaySchedule(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/pay-schedule`);
    }

    savePaySchedule(data:PaySchedule): Observable<any>{
      return this._http.put<any>(`${this._key.base_url}/payroll-config/pay-schedule`,data);
    }

    getOrganizationAddress(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/get-multi-location`);
    }

    saveFetchedAddressStaff(addressIds:number[],isUserMap:number): Observable<any>{
      const params = new HttpParams()
      .set('is_user_map', isUserMap)
      .set("address_ids",String(addressIds))
      return this._http.post<any>(`${this._key.base_url}/payroll-config/save-user-location`,{},{params});
    }


    saveUserWorkLocation(request:StaffAddressDetailsForMultiLocation,addressId:number): Observable<any>{
      const params = new HttpParams()
      .set('address_id', addressId)
      return this._http.put<any>(`${this._key.base_url}/payroll-config/save-user-location`,request,{params});
    }

    getOrganizationUser(selectedStaffsUuids: string[], addressId: number): Observable<any> {
      const params = new HttpParams()
      .set('addressId', addressId);
  
      return this._http.post<any>(`${this._key.base_url}/payroll-config/get-organization-user-uuid`,selectedStaffsUuids, { params });
    }

    getState(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-config/state`);
    }

    deassociateUsersFromOldAddress(request:string[]): Observable<any>{
      return this._http.post<any>(`${this._key.base_url}/payroll-config/deassociate-users`,request);
    }

}
