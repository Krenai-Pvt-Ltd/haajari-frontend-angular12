import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataService } from './data.service';
import { formatDate } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
import { Key } from '../constant/key';
import { RestrictedSubModule } from '../models/RestrictedSuubModule';
import { OrganizationOnboardingService } from './organization-onboarding.service';
import saveAs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private _key: Key = new Key();
  isDashboardActive: boolean=true;
  constructor( private _httpClient : HttpClient,
     private dataService: DataService,
     private router: Router,
     private _onboardingService: OrganizationOnboardingService
     ) { 
      // this.getOrganizationInitialToDoStepBar();
     }

     /**
      * FOr mobile responsive embolyee profile ui
      */
     isShowSidebar:boolean=false


  // use for employee profile 
   userJoiningDate:string='';
  // use for employee profile 
   organizationRegistrationDate:string='';
   profileChangeStatus : Subject<boolean> = new Subject<boolean>();
   resignationSubmitted : Subject<boolean> = new Subject<boolean>();

   private closeModalSubject = new Subject<void>();
   closeModal$ = this.closeModalSubject.asObservable();

  closeModal() {
    debugger
    console.log('Current Modal Ref service1:', this.closeModal$);
    console.log('Current Modal Ref service2:', this.closeModalSubject);
    this.closeModalSubject.next();
  }

   isFirstTime: boolean = true;
   markAsVisited() {
    this.isFirstTime = false;
  }

  clearHelperService(){
    // this.orgStepId = 0;
    // this.stepsData = null;
    // this.stepId = 0;
    this.subModuleResponseList = [];
  }
  restrictedModules!:RestrictedSubModule[];
  subModuleResponseList: any[] = [];



  // todoStepsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  async getDecodedValueFromToken(): Promise<any> {

    return new Promise<any>(async (resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        if (token != null) {
          const decodedValue: any = await jwtDecode(token);
          // console.log("decodedValue",decodedValue)
          resolve(decodedValue);
        } else {
          reject('Token is null!');
        }
      } catch (error) {
        reject(error);

      }
    });
  }


  async getAccessibleSubModuleResponseMethodCall(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.dataService.getAccessibleSubModuleResponse().subscribe({
        next: (data: any) => {
          resolve(data);
        },
        error: (error) => reject(error)
      });
    });
  }

  getFirstAndLastLetterFromName(name: string): string {
    let words = name.split(' ');

    if (words.length >= 2) {
        let firstLetter = words[0].charAt(0);
        let lastLetter = words[words.length - 1].charAt(0);
        return firstLetter + lastLetter;
    } else {
        return "";
    }

  }

  formatToDateTime(date : Date){
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

//   formatDateToYYYYMMDDHHmmss(date: Date): string {
//     const year = date.getFullYear();
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     const hours = date.getHours().toString().padStart(2, '0');
//     const minutes = date.getMinutes().toString().padStart(2, '0');
//     const seconds = date.getSeconds().toString().padStart(2, '0');

//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// }


  formatDateToHHmmss(date: Date): string {
    if(date != null){
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();

      // Pad with leading zeros if necessary
      let strhours = hours < 10 ? '0' + hours : hours;
      let strminutes = minutes < 10 ? '0' + minutes : minutes;
      // let strseconds = seconds < 10 ? '0' + seconds : seconds;
      let strseconds = '00';

      // Construct formatted time string
      return `${strhours}:${strminutes}:${strseconds}`;
    }
    return '';

  }

  formatDateToHHmm(date : Date){
    return formatDate(date, 'HH:mm', 'en-US');
  }





  toastSubscription:Subject<boolean> = new Subject<boolean>();

  done(){
    this.toastSubscription.next(false);
  }

  start(){
    this.toastSubscription.next(true);
  }



  toastMessage : string = '';
  toastColorStatus : string = '';
  showToast(message:string, colorStatus:string){
    this.toastMessage = message;
    this.toastColorStatus = colorStatus;
    this.start();
    setTimeout(() => {
      this.done();
    }, 5000);
  }



  private data: any;
  setData(data: any) {
    this.data = data;
  }

  getData() {
    return this.data;
  }


  private roleSectionTab : boolean = false;

  setRoleSectionTab(roleSectionTab : boolean){
    this.roleSectionTab = roleSectionTab;
  }

  getRoleSectionTab() {
    return this.roleSectionTab;
  }

  isObjectNullOrUndefined(response : any){
    if(response == undefined || response == null || response.object == undefined || response.object == null || response.object.length == 0){
      return true;
    } else{
      return false;
    }
  }

  isListOfObjectNullOrUndefined(response : any){
    debugger;
    if(response == undefined || response == null || response.listOfObject == undefined || response.listOfObject == null || response.listOfObject.length == 0){
      return true;
    } else{
      return false;
    }
  }

  //Ignore keys during search
  ignoreKeysDuringSearch(event : Event){
    if (event instanceof KeyboardEvent) {
      const ignoreKeys = [
        'Shift',
        'Control',
        'Alt',
        'Meta',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Escape',
      ];

      const isCmdA =
        (event.key === 'a' || event.key === 'A') &&
        (event.metaKey || event.ctrlKey);
      if (ignoreKeys.includes(event.key) || isCmdA) {
        return;
      }
    }
  }

  // route to user's profile
  routeToUserProfile(uuid: string) {
    let navExtra: NavigationExtras = {
      queryParams: { userId: uuid },
    };
    // this.router.navigate(['/employee'], navExtra);
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
    return;
  }

  extractMonthNameFromDate(dateString : string){
    const date = new Date(dateString);
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
    const shortMonthName = monthFormatter.format(date);

    return shortMonthName;
  }

  getTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  downloadPdf(url: string, name: string) {
    this._httpClient.get(url, { responseType: 'blob' }).subscribe(blob => {
      saveAs(blob, name+'.pdf');
    });
  }

  formatHHmmssToHHmm(time: string): string {
    const timeParts = time.split(':');

    const hours = timeParts[0];
    const minutes = timeParts[1];

    return `${hours}:${minutes}`;
  }

  durationBetweenTwoDatesInHHmmssFormat(startTime : Date | null, endTime : Date | null){

    if(startTime != null && endTime != null){
      const diffInMillis = startTime.getTime() - endTime.getTime();

      const totalSeconds = Math.floor(diffInMillis / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);

      const remSeconds = totalSeconds % 60;
      const remMinutes = totalMinutes % 60;

      return `${totalHours.toString().padStart(2, '0')}:${remMinutes.toString().padStart(2, '0')}:${remSeconds.toString().padStart(2, '0')}`;
    }

    return null;
  }

  async registerOrganizationRegistratonProcessStepData(stepId: number, statusId: number): Promise<void> {
    try {
      const response = await this.dataService.registerOrganizationRegistratonProcessStep(statusId, stepId).toPromise();
      // console.log("success", response.status, "stepId", stepId, "statusId", statusId);
      if (response.status) {
        this.stepId = stepId;
      }
    } catch (error) {
      console.log('error', error);
    }
  }


  saveOrgSecondaryToDoStepBarData(value : number) {
    debugger
    this.dataService.saveOrgSecondaryToDoStepBar(value).subscribe(
      (response) => {
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }


  detectOpenModalOnBack(){
    if(document?.body?.classList?.contains('modal-open')){
      document?.body?.classList?.remove('modal-open');
    }

  }


  getRestrictedModules() {
    return new Promise((resolve)=>{
      this.getSubscriptionRestrictedModules().subscribe((response) => {
          if (response.status){
            this.restrictedModules = response.object;
            if(this.restrictedModules ==null){
              this.restrictedModules = [];
            }
          }else{
            this.restrictedModules = [];
          }
          resolve(true);
        },(error)=>{
          resolve(true);
        });
    });
  }


  getSubscriptionRestrictedModules() {
    return this._httpClient.get<any>(this._key.base_url + this._key.get_restricted_modules)
  }


  getOrganizationRegistrationDateMethodCall() {
    this.dataService.getOrganizationRegistrationDate().subscribe(
      (response) => {
        this.organizationRegistrationDate = response;
      },
      (error) => {

      }
    );
  }


  disableMonths = (date: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const organizationRegistrationYear = new Date(
      this.organizationRegistrationDate
    ).getFullYear();
    const organizationRegistrationMonth = new Date(
      this.organizationRegistrationDate
    ).getMonth();

    // Disable if the month is before the organization registration month
    if (
      dateYear < organizationRegistrationYear ||
      (dateYear === organizationRegistrationYear &&
        dateMonth < organizationRegistrationMonth)
    ) {
      return true;
    }

    // Disable if the month is after the current month
    if (
      dateYear > currentYear ||
      (dateYear === currentYear && dateMonth > currentMonth)
    ) {
      return true;
    }

    // Enable the month if it's from January 2023 to the current month
    return false;
  };

  stepsData: any;
  stepId: number = 0;
  getStepsData() {
    debugger;
    this.dataService.getStepsData().subscribe(
      (response) => {
        this.stepsData = response.listOfObject[0];
        // console.log("success");
        this.stepId = this.stepsData?.totalCompletedSteps;
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  orgStepId !: number ;
  getOnboardingStep() {
    debugger;
    this._onboardingService
      .getOrgOnboardingStep()
      .subscribe((response: any) => {
        if (response.status) {
          this.orgStepId = response.object.step;
          // console.log(response.object.step);
        }
      });
  }


  startIndex(pageNumber:number, itemPerPage:number): number {
    return (pageNumber - 1) * itemPerPage + 1;
  }

  lastIndex(pageNumber:number, itemPerPage:number,totalItems:number): number {
    return Math.min(pageNumber * itemPerPage, totalItems);
  }


  toggleIsShowSidebar(){
    this.isShowSidebar=!this.isShowSidebar;
   }

}
