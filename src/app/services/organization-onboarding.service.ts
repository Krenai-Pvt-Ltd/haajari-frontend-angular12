import { Injectable } from '@angular/core';
import { Key } from '../constant/key';
import { DatabaseHelper } from '../models/DatabaseHelper';
import { UserListReq } from '../models/UserListReq';
import { UserReq } from '../models/userReq';
import {
  HttpClient,
  HttpEventType,
  HttpEvent,
  HttpResponse,
  HttpParams,
} from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrganizationOnboardingService {
  private _key: Key = new Key();
  constructor(private _httpClient: HttpClient) {}

  // private refreshSidebarSubject = new Subject<void>();
  // public refreshSidebar$ = this.refreshSidebarSubject.asObservable();

  // refreshSidebar() {
  //   this.refreshSidebarSubject.next();
  // }

  private onboardingRefreshSource = new Subject<void>();

  // Observable stream
  onboardingRefresh$ = this.onboardingRefreshSource.asObservable();

  // Service command
  refreshOnboarding() {
    this.onboardingRefreshSource.next();
  }

  userImport(file: any, fileName: string, uuid: string) {
    debugger;
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    formdata.append('fileName', fileName);
    formdata.append('uuid', uuid);
    return this._httpClient.post(
      this._key.base_url + this._key.user_import,
      formdata,
    );
  }

  userImportOnboarding(file: any, fileName: string, uniqueId: string) {
    debugger;
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    formdata.append('fileName', fileName)
    formdata.append('uniqueUuid', uniqueId);
    return this._httpClient.post(
      this._key.base_url + this._key.user_import_onboarding,
      formdata,
    );
  }



  // userImport(file: any, fileName: string, progressCallback: (progress: number) => void): Observable<any> {
  //   const formData: FormData = new FormData();
  //   formData.append('file', file);
  //   formData.append('fileName', fileName);

  //   return this._httpClient.post(this._key.base_url + this._key.user_import, formData, {
  //     reportProgress: true,
  //     observe: 'events'
  //   }).pipe(
  //     tap(event => {
  //       // Check if the event is a progress event and call the progress callback
  //       if (event.type === HttpEventType.UploadProgress) {
  //         const total = event.total ? event.total : 1;
  //         const progress = Math.round(100 * event.loaded / total);
  //         progressCallback(progress);  // Correctly send only the progress percentage
  //       }
  //     }),
  //     filter(event => event instanceof HttpResponse),  // Filter out only HttpResponse events
  //     map((response: HttpResponse<any>) => response.body)  // Now safely map to the body
  //   );
  // }

  // createAdmin(user:UserReq) {
  //   debugger
  //   return this._httpClient.post(this._key.base_url + this._key.create_admin, user);
  // }

  // createAdminNew(user:UserReq) {
  //   debugger
  //   return this._httpClient.post(this._key.base_url + this._key.create_admin_new, user);
  // }

  createOnboardUser(userList: UserListReq) {
    debugger;
    return this._httpClient.post(
      this._key.base_url + this._key.create_user,
      userList,
    );
  }

  getOnboardUser(page:number, size:number) {
    debugger;
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
    return this._httpClient.get(
      this._key.base_url + this._key.get_onboarding_user,{
        params,
      }
    );
  }

  getAllOnboardUser() {
    debugger;
    return this._httpClient.get(
      this._key.base_url + this._key.get_onboarding_user + '/all'
    );
  }

  getOnboardUserForEmpOnboardingData() {
    debugger;
    return this._httpClient.get(
      this._key.base_url + this._key.get_onboarding_user_for_emp_onboarding_data,
    );
  }

  deleteOnboardUser(id: number) {
    debugger;
    return this._httpClient.delete(
      this._key.base_url + this._key.delete_onboarding_user + '/' + id,
    );
  }

  deleteOnboardUsers(ids: any) {
    debugger;
    const params = new HttpParams()
      .set('ids', ids)
    return this._httpClient.delete(
      this._key.base_url + this._key.delete_onboarding_user,{
        params
      }
    );
  }

  editOnboardUser(userReq: UserReq) {
    debugger;
    return this._httpClient.put(
      this._key.base_url + this._key.edit_onboarding_user,
      userReq,
    );
  }

  getReport(databaseHelper: DatabaseHelper) {
    debugger;
    const params = new HttpParams()
      .set('itemPerPage', databaseHelper.itemPerPage)
      .set('currentPage', databaseHelper.currentPage)
      .set('sortBy', databaseHelper.sortBy)
      .set('sortBy', databaseHelper.sortBy);
    return this._httpClient.get(this._key.base_url + this._key.get_report, {
      params,
    });
  }

  checkEmployeeNumberExist(number: string, uuid: string) {
    debugger;
    const params = new HttpParams().set('phone', number).set('uuid', uuid);
    return this._httpClient.get(
      this._key.base_url + this._key.check_number_existence,
      { params },
    );
  }
  checkEmployeeNumberExistBefore(number: string) {
    debugger;
    const params = new HttpParams().set('phone', number);
    return this._httpClient.get(
      this._key.base_url + '/whatsapp-user-onboarding/check-existence/number',
      { params },
    );
  }

  checkEmployeeEmailExistBefore(email: string) {
    debugger;
    const params = new HttpParams().set('email', email);
    return this._httpClient.get(
      this._key.base_url + '/whatsapp-user-onboarding/check-existence/email',
      { params },
    );
  }
  checkAdminNumberExist(number: string) {
    debugger;
    const params = new HttpParams().set('phone', number);
    return this._httpClient.get(
      this._key.base_url + this._key.check_number_existence,
      { params },
    );
  }

  checkEmployeeEmailExist(email: string, uuid: string) {
    debugger;
    const params = new HttpParams().set('email', email).set('uuid', uuid);
    return this._httpClient.get(
      this._key.base_url + this._key.check_email_existence,
      { params },
    );
  }


  checkAdminNumberExistWithoutToken(number: string) {
    debugger;
    const params = new HttpParams().set('phone', number);
    return this._httpClient.get(
      this._key.base_url +this._key.check_number_existence_without_token,
      { params },
    );
  }

  checkEmployeeEmailExistWithoutToken(email: string) {
    debugger;
    const params = new HttpParams().set('email', email);
    return this._httpClient.get(
      this._key.base_url + this._key.check_email_existence_without_token,
      { params },
    );
  }


  checkAdminEmailExist(email: string) {
    debugger;
    const params = new HttpParams().set('email', email);
    return this._httpClient.get(
      this._key.base_url + this._key.check_user_email_existence,
      { params },
    );
  }

  saveOrgOnboardingStep(step: number) {
    debugger;
    const params = new HttpParams().set('step', step);
    return this._httpClient.patch(
      this._key.base_url + this._key.save_organization_onboarding_step,
      {},
      { params },
    );
  }

  getOrgOnboardingStep() {
    debugger;
    return this._httpClient.get(
      this._key.base_url + this._key.get_organization_onboarding_step,
    );
  }

  deleteOrganizationImage(): Observable<any> {
    return this._httpClient.delete(
      `${this._key.base_url}/organization-personal-information/delete/image`,
      {
        responseType: 'text',
      },
    );
  }
}
