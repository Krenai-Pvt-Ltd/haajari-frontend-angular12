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


  updatePayrollProcessStep(startDate: string, endDate: string, step:number):Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('step',step)
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


  getNewJoinee(startDate: string,endDate: string,itemPerPage: number,pageNumber: number,search: string): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search);
    return this._http.get<any>(`${this._key.base_url}/payroll/step/new-joinee`,{ params });
  }


  getUserInExitProcess(startDate: string,endDate: string,itemPerPage: number,pageNumber: number,search: string): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search);
  return this._http.get<any>(`${this._key.base_url}/payroll/step/user-exit`,{ params });
}


getFNFUser(startDate: string,endDate: string,itemPerPage: number,pageNumber: number,search: string): Observable<any> {
  const params = new HttpParams()
  .set('start_date', startDate)
  .set('end_date', endDate)
  .set('item_per_page', itemPerPage)
  .set('page_number', pageNumber)
  .set('search', search);
return this._http.get<any>(`${this._key.base_url}/payroll/step/final-settlement`,{ params });
}

  getPendingLeaves(startDate : string, endDate : string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('current_page', page)
    .set('items_per_page', size);
    return this._http.get<any>(`${this._key.base_url}/payroll/step/pending-leaves`,{ params });
  }

  getLOPSummary(startDate : string, endDate : string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('current_page', page)
    .set('items_per_page', size);
    return this._http.get<any>(`${this._key.base_url}/payroll/step/lop-summary`,{ params });
  }

  getLOPReversal(startDate : string, endDate : string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('current_page', page)
    .set('items_per_page', size);
    return this._http.get<any>(`${this._key.base_url}/payroll/step/lop-reversal`,{ params });
  }



  getUserSalaryChange(startDate: string,endDate: string, itemPerPage: number,pageNumber: number, search:string): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search)
    return this._http.get<any>(`${this._key.base_url}/payroll/step/salary-change`, {params});
  }


  getUserBonusAndDeduction(startDate: string,endDate: string, itemPerPage: number,pageNumber: number): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    return this._http.get<any>(`${this._key.base_url}/payroll/step/bonus`, {params});
  }


  getUserOvertime(startDate: string,endDate: string, itemPerPage: number,pageNumber: number): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    return this._http.get<any>(`${this._key.base_url}/payroll/step/overtime`, {params});
  }


  getEpfDetails(startDate: string,endDate: string, itemPerPage: number,pageNumber: number, search: string,): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search)
    return this._http.get<any>(`${this._key.base_url}/payroll/step/epf`, {params});
  }


  getEsiDetails(startDate: string,endDate: string, itemPerPage: number,pageNumber: number, search: string,): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search)
    return this._http.get<any>(`${this._key.base_url}/payroll/step/esi`, {params});
  }


  getTdsDetails(startDate: string,endDate: string, itemPerPage: number,pageNumber: number, search: string,): Observable<any> {

    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    .set('item_per_page', itemPerPage)
    .set('page_number', pageNumber)
    .set('search', search)
    return this._http.get<any>(`${this._key.base_url}/payroll/step/tds`, {params});
  }

  generatePayrollReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)

    return this._http.get(`${this._key.base_url}/payroll/step/run`,{ params });
  }


  getPayrollBankReport(startDate: string,endDate: string): Observable<any>{
    const params = new HttpParams()
    .set('start_date', startDate)
    .set('end_date', endDate)
    return this._http.get<any>(`${this._key.base_url}/payroll/bank`, {params});
  }


 syncPayrollMonthlyData(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      return this._http.get<any>(`${this._key.base_url}/payroll/sync`,{ params });
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

    return this._http.get(`${this._key.base_url}/payroll/step/generate`, {
      params: params,
      responseType: 'blob',  // Ensure the response is treated as a file (Excel)
    });
  }


  updateUserBonusDetail(url:string, fileName:string,startDate:string, endDate:string): Observable<any>{
    const params = new HttpParams()
    .set('url',url)
    .set('fileName',fileName)
    .set('start_date',startDate)
    .set('end_date',endDate);
    return this._http.put<any>(`${this._key.base_url}/bonus/import`, {},{params});
  }


}
