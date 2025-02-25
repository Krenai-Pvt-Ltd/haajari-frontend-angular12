import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayrollConfigurationService {
  private _key: Key = new Key();

  constructor(private _http: HttpClient) {}


  getTodoList(): Observable<any>{
      return this._http.get<any>(`${this._key.base_url}/payroll-todo-step`);
    }
}
