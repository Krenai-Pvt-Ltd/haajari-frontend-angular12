import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { Observable } from 'rxjs';
import { LopAdjustmentRequest } from '../models/lop-adjustment-request';
import { LopSummaryRequest } from '../models/lop-summary-request';
import { LopReversalRequest } from '../models/lop-reversal-request';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  private _key: Key = new Key();

  constructor(private _http: HttpClient) {}

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getMonthResponseListByYear(date: string): Observable<any>{
    const params = new HttpParams()
    .set('date', date);

    return this._http.get<any>(`${this._key.base_url}/payroll/month`, {params});
  }


  countPayrollDashboard(startDate: string,endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this._http.get<any>(`${this._key.base_url}/payroll/dashboard/count`,{ params });
  }

  getPayrollProcessStep(startDate: string , endDate: string):Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate);

    return this._http.get<any>(`${this._key.base_url}/payroll/step`, {params});
  }


  updatePayrollProcessStep(startDate: string, endDate: string, payrollProcessStepId: number):Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('payroll_process_step_id', payrollProcessStepId);

    return this._http.put<any>(`${this._key.base_url}/payroll/step`,{}, {params});
  }


  getIndividualMonthSalary(startDate: string,endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this._http.get<any>(`${this._key.base_url}/payroll/individual`,{ params });
  }


  getPreviousMonthSalary(startDate: string,endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this._http.get<any>(`${this._key.base_url}/payroll/previous`,{ params });
  }


  getGeneratedPayrollMonthlyLogs(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      return this._http.get<any>(`${this._key.base_url}/payroll/run/history`,{ params });
  }


  getUserSalaryTemplateNotConfig(): Observable<any> {

    return this._http.get<any>(`${this._key.base_url}/payroll/user/template-not-config`);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getPayrollLeaveResponse(
    startDate: any,
    endDate: any,
    itemPerPage: number,
    pageNumber: number,
    search: string,
    searchBy: string): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search)
    .set('search_by', searchBy)

    return this._http.get<any>(`${this._key.base_url}/payroll/step/attendance/get-leaves`,{ params });
  }


  getPayrollLeaveLogsResponse(
    userUuid  : string,
    startDate: any,
    endDate: any
  ): Observable<any> {

    const params = new HttpParams()
    .set('user_uuid', userUuid)
    .set('start_date', startDate)
    .set('end_date', endDate)

    return this._http.get<any>(`${this._key.base_url}/payroll/step/attendance/get-leave-logs`,{ params });
  }

  getLopSummaryResponseByOrganizationIdAndStartDateAndEndDate(
    startDate: string,
    endDate: string,
    itemPerPage: number,
    pageNumber: number,
    search: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('search', search)
      .set('search_by', searchBy);

      return this._http.get<any>(`${this._key.base_url}/payroll/step/attendance/lop-summary`,{ params });

  }

  getLopReversalResponseByOrganizationIdAndStartDateAndEndDate(
    startDate: string,
    endDate: string,
    itemPerPage: number,
    pageNumber: number,
    search: string,
    searchBy: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('item_per_page', itemPerPage)
      .set('page_number', pageNumber)
      .set('search', search)
      .set('search_by', searchBy);

      return this._http.get<any>(`${this._key.base_url}/payroll/step/attendance/lop-reversal`,{ params });
  }


  getPayrollLeaveLogResponse(userUuid : string): Observable<any> {
    const params = new HttpParams()
    .set('user_uuid', userUuid);

    return this._http.get<any>(`${this._key.base_url}/payroll/step/attendance/get-leave-logs`,{ params });
  }


  registerLopAdjustmentRequest(lopAdjustmentRequest : LopAdjustmentRequest, startDate : string, endDate : string){
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate);

    return this._http.post<any>(`${this._key.base_url}/payroll/step/attendance/register-lop-adjustment-request`,lopAdjustmentRequest,{ params });

  }

  registerLopSummaryRequestByOrganizationIdAndStartDateAndEndDate(lopSummaryRequestList : LopSummaryRequest[], startDate : string, endDate : string): Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate);

    return this._http.post<any>(`${this._key.base_url}/payroll/step/attendance/register-lop-summary`,lopSummaryRequestList,{ params });
  }

  registerLopReversalRequestByOrganizationIdAndStartDateAndEndDate(lopReversalRequestList : LopReversalRequest[], startDate : string, endDate : string): Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate);

    return this._http.post<any>(`${this._key.base_url}/payroll/step/attendance/register-lop-reversal`,lopReversalRequestList,{ params });

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getNewJoinee(startDate: string,endDate: string,itemPerPage: number,pageNumber: number,search: string): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search);
    return this._http.get<any>(`${this._key.base_url}/salary/user/change/new-joinee`,{ params });
  }


  getUserInExitProcess(startDate: string,endDate: string,itemPerPage: number,pageNumber: number,search: string): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search);
  return this._http.get<any>(`${this._key.base_url}/salary/user/change/user-exit`,{ params });
}


getFNFUser(startDate: string,endDate: string,itemPerPage: number,pageNumber: number,search: string): Observable<any> {
  const params = new HttpParams()
  .set('start_date', startDate)
  .set('end_date', endDate)
  .set('item_per_page', itemPerPage)
  .set('page_number', pageNumber)
  .set('search', search);
return this._http.get<any>(`${this._key.base_url}/salary/user/change/final-settlement`,{ params });
}

  getPendingLeaves(startDate : string, endDate : string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('current_page', page)
    .set('items_per_page', size);
    return this._http.get<any>(`${this._key.base_url}/payroll/step/attendance/pending-leaves`,{ params });
  }




  getUserSalaryChange(startDate: string,endDate: string, itemPerPage: number,pageNumber: number, search:string): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search)
    return this._http.get<any>(`${this._key.base_url}/salary/payroll-dashboard/salary-change`, {params});
  }


  getUserBonusAndDeduction(startDate: string,endDate: string, itemPerPage: number,pageNumber: number): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    return this._http.get<any>(`${this._key.base_url}/salary/payroll-dashboard/bonus`, {params});
  }

  generatePayrollReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    return this._http.get(`${this._key.base_url}/payroll/user`,{ params });
  }

  generateReport(
    startDateStr: string,
    endDateStr: string,
    reportType: string,
    search?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('startDateStr', startDateStr)
      .set('endDateStr', endDateStr)
      .set('reportType', reportType);

    if (search) {
      params = params.set('search', search);
    }

    return this._http.get(`${this._key.base_url}/salary/user/change/generate`, {
      params: params,
      responseType: 'blob',  // Ensure the response is treated as a file (Excel)
    });
  }

}
