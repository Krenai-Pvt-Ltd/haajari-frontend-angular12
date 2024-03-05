import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrganizationOnboardingService {

  private _key: Key = new Key();
  constructor(private _httpClient: HttpClient) { }

  userImport(file: any, fileName: string) {
    debugger
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    formdata.append('fileName', fileName);
    return this._httpClient.post(this._key.base_url + this._key.user_import, formdata);
  }
}
