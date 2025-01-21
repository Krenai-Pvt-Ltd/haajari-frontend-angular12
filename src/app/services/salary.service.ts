import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BulkAction } from '../models/bulkAction';
import { BonusRequest } from '../models/bonus-request';
import { BonusAndDeductionData } from '../models/bonus-and-deduction-data';
import { EmployeeMonthWiseSalaryData } from '../models/employee-month-wise-salary-data';
import { SalaryComponentRequest } from '../models/salary-component-request';
import { SalaryComponent } from '../models/salary-component';
import { SalaryComponentReq } from '../models/SalaryComponetReq';
import { SalaryComponentResponse } from '../models/salary-component-response';

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
    return this._http.get<any>(`${this._key.base_url}/salary/template/component`);
  }


  getAllSalaryTemplate(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/salary/template/component/all`
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

  exportCurrentSalaryReport():Observable<any>{
    return this._http.get<any>(`${this._key.base_url}/salary/export`);
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


  getStatutoryAttributeByStatutoryId(statutoryId: number): Observable<any> {
    const params = new HttpParams()
    .set('statutoryId', statutoryId);

    return this._http.get<any>(`${this._key.base_url}/statutory/attribute`, {params});
  }

  getStatutoryByOrganizationId(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/statutory/employee/get/all`);
  }

  getAllTaxRegime(): Observable<any> {
    return this._http.get<any>(`${this._key.base_url}/statutory/tax-regime/get/all`);
  }


  registerBonus(bonusRequest : BonusRequest, userUuid : string): Observable<any>{
    const params = new HttpParams()
    .set('user_uuid', userUuid);

    return this._http.post<any>(`${this._key.base_url}/bonus`, bonusRequest, {params});
  }


  updateBonus(bonusRequest : BonusAndDeductionData): Observable<any>{
   
    return this._http.put<any>(`${this._key.base_url}/bonus`, bonusRequest);
  }


  deleteBonus(bonusId:number): Observable<any>{
    const params = new HttpParams()
    .set('bonus_id', bonusId);
    return this._http.delete<any>(`${this._key.base_url}/bonus`,  {params});
  }

  getBonusAndDeductionLogs(
    startDate: any,
    endDate: any,
    itemPerPage: number,
    pageNumber: number,
    search: string): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search)
    return this._http.get<any>(`${this._key.base_url}/bonus-deduction`, {params});
  }


  getMonthWiseSalaryData(startDate: any,endDate: any,itemPerPage: number,pageNumber: number,search: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('search', search)

    return this._http.get<any>(`${this._key.base_url}/salary/month-wise/data`,{ params });
  }


  updateEmployeeData(empSalaryData: EmployeeMonthWiseSalaryData): Observable<any>{
   
    return this._http.put<any>(`${this._key.base_url}/salary/month-wise/data`, empSalaryData);
  }


  getMonthWiseSalarySlipData(startDate: any,endDate: any,itemPerPage: number,pageNumber: number,search: string): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search)

    return this._http.get<any>(`${this._key.base_url}/salary/month-wise/slip`,{ params });
  }


  updateSalarySlipStatus(monthWiseIds:number[]): Observable<any>{
    const params = new HttpParams()
    .set('month_wise_ids', String(monthWiseIds));

    return this._http.put<any>(`${this._key.base_url}/salary/month-wise/slip/on-hold`,{},{ params });
  
  }

  shareSalaryPayslipVia(monthWiseIds:number[], shareVia:string ): Observable<any>{
    const params = new HttpParams()
    .set('month_wise_ids', String(monthWiseIds))
    .set('share_via', shareVia);
    return this._http.post<any>(`${this._key.base_url}/salary-slip/share`,{}, {params});
  }

  generatePaySlip(startDate: string,endDate: string): Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate);
    return this._http.put<any>(`${this._key.base_url}/salary/generate-slip`, {params});
  }


  getEmployeePayslipResponseByUserUuid(userUuid : string, startDate : string, endDate : string): Observable<any>{
    const params = new HttpParams()
    .set('user_uuid', userUuid)
    .set('start_date', startDate)
    .set('end_date', endDate);

    return this._http.get<any>(`${this._key.base_url}/salary/month-wise/pay-slip`, {params});
  }

  getEmployeePayslipBreakupResponseByUserUuid(userUuid : string, startDate : string, endDate : string): Observable<any>{
    const params = new HttpParams()
    .set('user_uuid', userUuid)
    .set('start_date', startDate)
    .set('end_date', endDate);

    return this._http.get<any>(`${this._key.base_url}/salary/month-wise/pay-slip-breakup`, {params});
  }

  getEmployeePayslipDeductionResponseByUserUuid(userUuid : string, startDate : string, endDate : string): Observable<any>{
    const params = new HttpParams()
    .set('user_uuid', userUuid)
    .set('start_date', startDate)
    .set('end_date', endDate);

    return this._http.get<any>(`${this._key.base_url}/salary/month-wise/pay-slip-deduction`, {params});
  }

  getEmployeePayslipLogByUserUuid(userUuid : string, startYear : string): Observable<any>{

    const params = new HttpParams()
    .set('user_uuid', userUuid)
    .set('start_year', startYear)
    return this._http.get<any>(`${this._key.base_url}/salary/month-wise/pay-slip-log`, {params});
  }

  getEmployeePaymentBankDetail(userUuid : string): Observable<any>{

    const params = new HttpParams()
    .set('user_uuid', userUuid)
    return this._http.get<any>(`${this._key.base_url}/users/bank`, {params});
  }

  getEmployeeStatutory(userUuid : string): Observable<any>{

    const params = new HttpParams()
    .set('user_uuid', userUuid)
    return this._http.get<any>(`${this._key.base_url}/statutory/employee`, {params});
  }


  getPayoutSummaryDetail(userUuid : string, startDate : string, endDate : string): Observable<any>{

    const params = new HttpParams()
    .set('user_uuid', userUuid)
    .set('start_date', startDate)
    .set('end_date', endDate);

    return this._http.get<any>(`${this._key.base_url}/salary/month-wise/attendance`, {params});
  }


  getEmployeeSalaryRevisionDetail(userUuid : string): Observable<any>{

    const params = new HttpParams()
    .set('user_uuid', userUuid)
    return this._http.get<any>(`${this._key.base_url}/salary/user`, {params});
  }

  getCurrentSalaryDetail(userUuid : string): Observable<any>{

    const params = new HttpParams()
    .set('user_uuid', userUuid)
    return this._http.get<any>(`${this._key.base_url}/salary/current`, {params});
  }


  saveCustomSalaryTemplate(userUuid : string, requestList:SalaryComponentResponse[]){
    const params = new HttpParams()
    .set('user_uuid', userUuid)
    return this._http.post<any>(`${this._key.base_url}/salary/current`,requestList, {params});

  }
}
