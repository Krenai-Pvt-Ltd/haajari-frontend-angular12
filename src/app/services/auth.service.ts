import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  private userData: any;

  setUserData(data: any): void {
    this.userData = data;
  }

  getUserData(): any {
    return this.userData;
  }
}
