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

  getNotification(uuid:any,databaseHelper:DatabaseHelper){
    const params = new HttpParams()
      .set('uuid', uuid)
      .set('itemPerPage', databaseHelper.itemPerPage)
      .set('currentPage', databaseHelper.currentPage)
      .set('sortBy', "id")
      .set('sortOrder', "desc")
    return this._httpClient.get<any>(this._key.base_url + this._key.get_notification, {params})
  }

  readAllNotification(uuid:any){
    const params = new HttpParams()
      .set('uuid', uuid);
    return this._httpClient.get<any>(this._key.base_url + this._key.read_all_notification, {params})
  }
}
