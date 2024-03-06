import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatabaseHelper } from '../models/DatabaseHelper';
import { UserListReq } from '../models/UserListReq';

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

  createUser(userList:UserListReq) {
    debugger
    return this._httpClient.post(this._key.base_url + this._key.create_user, userList);
  }

  getReport(databaseHelper: DatabaseHelper) {
    debugger
    const params = new HttpParams()
      .set('itemPerPage', databaseHelper.itemPerPage)
      .set('currentPage', databaseHelper.currentPage)
      .set('sortBy', databaseHelper.sortBy)
      .set('sortBy', databaseHelper.sortBy)
    return this._httpClient.get(this._key.base_url + this._key.get_report, { params });
  }

  checkNumberExist(number: string) {
    debugger
    const params = new HttpParams()
      .set('phone', number);
    return this._httpClient.get(this._key.base_url + this._key.check_number_existence, {params});
  }

  
  saveOrgOnboardingStep(step: number) {
    debugger
    const params = new HttpParams()
      .set('step', step);
    return this._httpClient.patch(this._key.base_url + this._key.save_organization_onboarding_step,{}, {params});
  }

  getOrgOnboardingStep() {
    debugger
    return this._httpClient.get(this._key.base_url + this._key.get_organization_onboarding_step);
  }
}
