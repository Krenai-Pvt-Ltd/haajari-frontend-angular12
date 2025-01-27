import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private _key: Key = new Key();

  constructor(private _http: HttpClient) {}


   toggleStatutory(userUuid:string, statutoryId:number):Observable<any>{
      const params = new HttpParams()
      .set('user_uuid', userUuid)
      .set('statutory_id', statutoryId)
  
      return this._http.put<any>(`${this._key.base_url}/statutory/user-toggle`,{}, {params});
    }
}
