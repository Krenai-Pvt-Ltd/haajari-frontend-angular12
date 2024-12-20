import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatabaseHelper } from '../models/DatabaseHelper';

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
}
