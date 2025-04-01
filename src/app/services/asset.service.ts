import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Key } from '../constant/key';
import { AssetCategoryRequest } from '../models/asset-category-respose';
import { AssetRequestDTO } from '../models/AssetRequestDTO';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AssetService {

constructor(private httpClient: HttpClient) { }

private _key: Key = new Key();
private baseUrl = this._key.base_url;

  getFilteredAssets(
    teamId?: number,
    userId?: number,
    statusId?: number,
    assetCategoryId?: number,
    search?: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (teamId) params = params.set('teamId', teamId.toString());
    if (userId) params = params.set('userId', userId.toString());
    if (statusId) params = params.set('statusId', statusId.toString());
    if (assetCategoryId) params = params.set('assetCategoryId', assetCategoryId.toString());
    if (search) params = params.set('search', search);

    return this.httpClient.get(`${this.baseUrl}/assets/by-filter`, { params });
  }

  getTeamSummary(statusId: number): Observable<any> {
    const params = new HttpParams().set('statusId', statusId.toString());
    return this.httpClient.get<any>(`${this.baseUrl}/assets/team-summary`, { params });
  }

  getStatusSummary(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/status-summary`);
  }

  getCategorySummary(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/category-summary`);
  }

  getAssetCategorySummary(categoryId: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/category/${categoryId}/summary`);
  }
  getOrganizationUserList(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/user/list`);
  }
  createAssets(asset: any): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/assets/create`, asset);
  }
  changeStatus(assetId: number, status: number, description: string, userId: number): Observable<any> {
    const url = `${this.baseUrl}/${assetId}/status`;
    const params = new HttpParams()
      .set('status', status.toString())
      .set('description', description)
      .set('userId', userId);
    return this.httpClient.put<any>(`${this.baseUrl}/assets/${assetId}/status`, null, { params });
  }
  getAssetHistory(assetId: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/${assetId}/history`);
  }
  getAssetChangePercentageList(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/assets/status-changes`);
  }
  updateAssetCategory(categoryId: number, category: AssetCategoryRequest): Observable<any> {
    const params = new HttpParams()
      .set('categoryId', categoryId);
    return this.httpClient.put(`${this.baseUrl}/assets/update-category`, category, { params});
  }
  createAssetCategory(assetCategoryRequest: AssetCategoryRequest): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/assets/create-category`, assetCategoryRequest);
  }
  getMonthlyAssignments(statusId: number): Observable<any> {
    const params = new HttpParams()
      .set('statusId', statusId);
    return this.httpClient.get<any>(`${this.baseUrl}/assets/monthly-assignments`, { params });
  }

  getAssetsByUser(uuid: any, searchTerm?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('uuid', uuid);

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.httpClient.get(`${this.baseUrl}/assets/user-by-filter`, { params });
  }
  getRequestedAvailableAssets(
    assetCategoryId: number = 0,
    search: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('assetCategoryId', assetCategoryId.toString())
      .set('search', search || '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.httpClient.get<any>(`${this.baseUrl}/assets/available-requested`, { params });
  }
  assignRequestedAsset(assetId: number, assetRequestId: number): Observable<any> {
    const params = new HttpParams()
      .set('assetId', assetId.toString())
      .set('assetRequestId', assetRequestId.toString());

    return this.httpClient.post<any>(`${this.baseUrl}/assets/assigned-requested-asset`, {}, { params });
  }

  createAssetRequest(formData: any): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/asset-requests/create`, formData);
  }
  getAssetRequestById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/asset-requests?id=${id}`);
  }
  getAssetRequestsByUserUuid(
    uuid: string,
    page: number = 0,
    size: number = 10,
    search: string = '',
    status: string = ''
  ): Observable<{ data: AssetRequestDTO[], currentPage: number, totalItems: number, totalPages: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('status',status.toString())
      .set('search', search);

    return this.httpClient.get<{ data: AssetRequestDTO[], currentPage: number, totalItems: number, totalPages: number }>(
      `${this.baseUrl}/asset-requests/user/${uuid}`,
      { params }
    );
  }


  getAssetRequests(
    page: number = 0,
    size: number = 10,
    search: string = '',
    status: any=''
  ): Observable<{ data: AssetRequestDTO[], currentPage: number, totalItems: number, totalPages: number}> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('status',status.toString())
      .set('search', search);

    return this.httpClient.get<{ data: AssetRequestDTO[], currentPage: number, totalItems: number, totalPages: number }>(
      `${this.baseUrl}/asset-requests/users`,
      { params }
    );
  }

  changeAssetRequestStatus(id: number, status: string): Observable<any> {
    const url = `${this.baseUrl}/asset-requests/${id}/change-status`;
    const params = new HttpParams().set('status', status);
    return this.httpClient.post<any>(url, null, { params });
  }
  downloadAssetRequests(): Observable<Blob> {
    const url = `${this.baseUrl}/asset-requests/export`;
    return this.httpClient.get(url, { responseType: 'blob' });
  }
  getPendingRequestsCounter(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/asset-requests/pending-requests-counter`);
  }
  getRequestedTypeCount(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/asset-requests/count-by-requested-type`);
  }

  getAssetCategory(): Observable<any> {
      const url = `${this.baseUrl}/assets/category-list`;
      return this.httpClient.get<any>(url, {}).pipe(
        catchError((error) => {
          throw error;
        })
      );
  }

  deleteAssetCategory(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/assets/category/${id}`);
  }
}
