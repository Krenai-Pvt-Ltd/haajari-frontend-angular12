import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatabaseHelper } from '../models/DatabaseHelper';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService {
  private _key: Key = new Key();

  constructor(private _httpClient: HttpClient) {

  }

  getNotification(orgUuid:any, uuid:any,databaseHelper:DatabaseHelper,notificationType:any){
    const params = new HttpParams()
      .set('uuid', uuid)
      .set('orgUuid', orgUuid)
      .set('itemPerPage', databaseHelper.itemPerPage)
      .set('currentPage', databaseHelper.currentPage)
      .set('sortBy', "id")
      .set('sortOrder', "desc")
      .set('notificationType', notificationType)

    return this._httpClient.get<any>(this._key.base_url + this._key.get_notification, {params})
  }

  getMailNotification(uuid:any,databaseHelper:DatabaseHelper,notificationType:any){
    const params = new HttpParams()
      .set('uuid', uuid)
      .set('itemPerPage', databaseHelper.itemPerPage)
      .set('currentPage', databaseHelper.currentPage)
      .set('sortBy', "id")
      .set('sortOrder', "desc")
      .set('notificationType', notificationType)

    return this._httpClient.get<any>(this._key.base_url + this._key.get_mail, {params})
  }


  readNotification(id:any){
    const params = new HttpParams()
      .set('id', id)
    return this._httpClient.get<any>(this._key.base_url + this._key.read_notification, {params})
  }

  readAllNotification(uuid:any,notificationType:any){
    const params = new HttpParams()
      .set('uuid', uuid)
      .set('notificationType', notificationType)
    return this._httpClient.get<any>(this._key.base_url + this._key.read_all_notification, {params})
  }

  getMail(
    notificationType: string = '',
    orgUuid: string = '',
    uuid: string = '',
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10,
    categoryIds: number[] = []
  ): Observable<any> {
    let params = new HttpParams()
      .set('notificationType', notificationType)
      .set('orgUuid', orgUuid)
      .set('uuid', uuid)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('categoryIds', categoryIds.join(','))
      .set('sort', 'id,desc');

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this._httpClient.get(`${this._key.base_url}/user-notification/mail-notification`, { params });
  }
}
