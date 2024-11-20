import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataService } from './data.service';
import { formatDate } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
import * as saveAs from 'file-saver';
import { Key } from '../constant/key';
import { RestrictedSubModule } from '../models/RestrictedSuubModule';
import * as moment from 'moment';
import { OrganizationOnboardingService } from './organization-onboarding.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private _key: Key = new Key();
  constructor( private _httpClient : HttpClient,
     private dataService: DataService,
     private router: Router,
     private _onboardingService: OrganizationOnboardingService,
    ) {

   }

   isFirstTime: boolean = true;
   markAsVisited() {
    this.isFirstTime = false;
  }

  clearHelperService(){
    this.subModuleResponseList = [];
  }
  restrictedModules!:RestrictedSubModule[];
  subModuleResponseList: any[] = [];

 

  todoStepsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

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
    // this.router.navigate(['/employee-profile'], navExtra);
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

  registerOrganizationRegistratonProcessStepData(statusId: number, stepId:number) {
    debugger
    this.dataService.registerOrganizationRegistratonProcessStep(statusId, stepId).subscribe(
      (response) => {
        // console.log("success");
        this.todoStepsSubject.next(true);
      },
      (error) => {
        // console.log('error');
      }
    );
  }
  

  saveOrgSecondaryToDoStepBarData(value : number) {
    debugger
    this.dataService.saveOrgSecondaryToDoStepBar(value).subscribe(
      (response) => {
        // console.log("success");  
        // this.getOrgSecondaryToDoStepBarData();
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


  getTimeDiffOfDates(date1: Date, date2: Date) {
    var tempDate1 = moment(new Date(date1)).format("HH:mm");
    var tempDate2 = moment(new Date(date2)).format("HH:mm");
    const totalHrs = moment.duration(moment(tempDate2, "HH:mm").diff(moment(tempDate1, "HH:mm"))).asMinutes();
    var duration = Math.floor(totalHrs / 60) + ":" + (totalHrs % 60);
    return duration;
  }

  getTimeDiffFromStringTime(date1: string, date2: string) {
    const totalHrs = moment.duration(moment(date2, "HH:mm").diff(moment(date1, "HH:mm"))).asMinutes();
    var duration = Math.floor(totalHrs / 60) + ":" + (totalHrs % 60);
    return duration;
  }

   checkValidNightShiftRange(startDuration: string, endDuration: string): number {
    // Parse startDuration and endDuration strings into Date objects
    
    const [startHour, startMinute] = startDuration.split(':').map(Number);
    const [endHour, endMinute] = endDuration.split(':').map(Number);
  
    // Create Date objects for inTime and outTime on the same day
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0); // Sets start time for the shift
  
    const endTime = new Date(startTime); // Clone startTime to create endTime
    endTime.setHours(endHour, endMinute, 0, 0);
  
    // Adjust endTime to the next day if it’s before or equal to startTime (crosses midnight)
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }
  
   if (endTime <= startTime) {
      return 0; // Error code 0: inTime is after outTime
    }
    
    return 1; // Return 1 for a valid shift range
  }

  calculateHoursDiff(inTime: string, outTime: string): string {
    console.log("🚀 ~ HelperService ~ calculateHoursDiff ~ outTime:", outTime)
    console.log("🚀 ~ HelperService ~ calculateHoursDiff ~ inTime:", inTime)
    // Parse inTime and outTime strings into hours and minutes
    const [inHour, inMinute] = inTime.split(':').map(Number);
    const [outHour, outMinute] = outTime.split(':').map(Number);
  
    // Create Date objects for inTime and outTime
    const startTime = new Date();
    startTime.setHours(inHour, inMinute, 0, 0);
  
    const endTime = new Date(startTime); // Clone startTime to set end time
    endTime.setHours(outHour, outMinute, 0, 0);
  
    // If outTime is earlier than inTime (indicating next day), add one day to endTime
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }
  
    // Calculate the difference in milliseconds and convert to hours
    const millisecondsDifference = endTime.getTime() - startTime.getTime();
    const totalMinutes = millisecondsDifference / (1000 * 60); // Convert ms to minutes
  const hours = Math.floor(totalMinutes / 60); // Get the whole hours
  const minutes = Math.round(totalMinutes % 60); // Get the remaining minutes

  // Format the result in HH:MM format
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  
    return formattedTime;
  }

  calculateHoursDiffInMins(inTime: string, outTime: string): number {
    // Parse inTime and outTime strings into hours and minutes
    const [inHour, inMinute] = inTime.split(':').map(Number);
    const [outHour, outMinute] = outTime.split(':').map(Number);
  
    // Create Date objects for inTime and outTime
    const startTime = new Date();
    startTime.setHours(inHour, inMinute, 0, 0);
  
    const endTime = new Date(startTime); // Clone startTime to set end time
    endTime.setHours(outHour, outMinute, 0, 0);
  
    // If outTime is earlier than inTime (indicating next day), add one day to endTime
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }
  
    // Calculate the difference in milliseconds and convert to hours
    const millisecondsDifference = endTime.getTime() - startTime.getTime();
    const totalMinutes = millisecondsDifference / (1000 * 60); // Convert ms to minutes
  
    return totalMinutes;
  }

  calculateWorkingHoursMinusLunch(inTime: string, outTime: string, lunchStart: string, lunchEnd: string): string {
    // Calculate working hours and lunch hours in minutes
    const workingMinutes = this.calculateHoursDiffInMins(inTime, outTime);
    const lunchMinutes = this.calculateHoursDiffInMins(lunchStart, lunchEnd);
  
    // Subtract lunch time from working time
    const netWorkingMinutes = workingMinutes - lunchMinutes;
  
    // Convert net working minutes back to hours and minutes
    const hours = Math.floor(netWorkingMinutes / 60);
    const minutes = Math.round(netWorkingMinutes % 60);
  
    // Format the result in HH:MM format
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
    return formattedTime;
  }
  validateLunchWithinShift(inTime: string,outTime: string,lunchStartTime: string,lunchEndTime: string,
    organizationShiftTimingValidationErrors: { [key: string]: string }): any {
    // Parse inTime, outTime, lunchStartTime, and lunchEndTime strings into hours and minutes
    const [inHour, inMinute] = inTime.split(':').map(Number);
    const [outHour, outMinute] = outTime.split(':').map(Number);
    const [lunchStartHour, lunchStartMinute] = lunchStartTime.split(':').map(Number);
    const [lunchEndHour, lunchEndMinute] = lunchEndTime.split(':').map(Number);
  
    // Create Date objects for inTime and outTime on the same day
    const startTime = new Date();
    startTime.setHours(inHour, inMinute, 0, 0);
  
    const endTime = new Date(startTime);
    endTime.setHours(outHour, outMinute, 0, 0);
  
    // Create Date objects for lunchStartTime and lunchEndTime
    const lunchStart = new Date(startTime);
    lunchStart.setHours(lunchStartHour, lunchStartMinute, 0, 0);
  
    const lunchEnd = new Date(startTime);
    lunchEnd.setHours(lunchEndHour, lunchEndMinute, 0, 0);
  
    // Adjust endTime to the next day if it’s before or equal to startTime (shift crosses midnight)
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }
  
    // Adjust lunchStart and lunchEnd to the next day if they are before startTime (lunch spans midnight)
    if (lunchStart <= startTime) {
      lunchStart.setDate(lunchStart.getDate() + 1);
    }
    if (lunchEnd <= startTime) {
      lunchEnd.setDate(lunchEnd.getDate() + 1);
    }
  
    // Validation conditions with specific error messages
    if (lunchStart < startTime) {
      organizationShiftTimingValidationErrors['startLunch']=" Lunch start time is before shift start time."
      return organizationShiftTimingValidationErrors;
    } else if (lunchEnd > endTime) {
      organizationShiftTimingValidationErrors['endLunch']=" Lunch end time is after shift end time.";
      return organizationShiftTimingValidationErrors;
    } else if (lunchEnd < lunchStart) {
      organizationShiftTimingValidationErrors['endLunch']=" Lunch end time is before lunch start time.";
      return organizationShiftTimingValidationErrors;
    } else if (lunchStart >= startTime && lunchEnd <= endTime) {
      return "1";
    } else {
      // organizationShiftTimingValidationErrors['startLunch']=" Invalid lunch timing."
      // organizationShiftTimingValidationErrors['endLunch']=" Invalid lunch timing."
      return organizationShiftTimingValidationErrors;

    }
  }
  

}
