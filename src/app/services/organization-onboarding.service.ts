import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatabaseHelper } from '../models/DatabaseHelper';
import { UserListReq } from '../models/UserListReq';
import { UserReq } from '../models/userReq';

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

  createAdmin(user:UserReq) {
    debugger
    return this._httpClient.post(this._key.base_url + this._key.create_admin, user);
  }

  createAdminNew(user:UserReq) {
    debugger
    return this._httpClient.post(this._key.base_url + this._key.create_admin_new, user);
  }

  createOnboardUser(userList:UserListReq) {
    debugger
    return this._httpClient.post(this._key.base_url + this._key.create_user, userList);
  }

  getOnboardUser() {
    debugger
    return this._httpClient.get(this._key.base_url + this._key.get_onboarding_user);
  }

  deleteOnboardUser(id:number) {
    debugger
    return this._httpClient.delete(this._key.base_url + this._key.delete_onboarding_user+"/"+id);
  }

  editOnboardUser(userReq:UserReq) {
    debugger
    return this._httpClient.put(this._key.base_url + this._key.edit_onboarding_user, userReq);
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

  checkNumberExist1(number: string) {
    debugger
    const params = new HttpParams()
      .set('phone', number);
    return this._httpClient.get(this._key.base_url + this._key.check_number_existence, {params});
  }

  checkEmailExist(email: string) {
    debugger
    const params = new HttpParams()
      .set('email', email);
    return this._httpClient.get(this._key.base_url + this._key.check_email_existence, {params});
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
