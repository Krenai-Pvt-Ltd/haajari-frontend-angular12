import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable, Subject } from 'rxjs';
import { DataService } from './data.service';
import { ModulesWithSubmodules } from '../models/modules-with-submodules';
import { ModuleResponse } from '../models/module-response';
import { RoleBasedAccessControlService } from './role-based-access-control.service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor( private httpClient : HttpClient, private dataService: DataService) {
    
   }

  clearHelperService(){
    this.subModuleResponseList = [];
  }

  subModuleResponseList: any[] = [];
  

  async getDecodedValueFromToken(): Promise<any> {
    
    return new Promise<any>((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        if (token != null) {
          const decodedValue: any = jwtDecode(token);
          resolve(decodedValue);
        } else {
          reject('Token is null');
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

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }

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
  toastMessage:string="";
  toastColorStatus:string="";
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
    if(response == undefined || response == null || response.listOfObject == undefined || response.listOfObject == null || response.listOfObject.length == 0){
      return true;
    } else{
      return false;
    }
  }
}
