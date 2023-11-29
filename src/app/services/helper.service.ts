import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor( private httpClient : HttpClient) { }

  getDecodedValueFromToken(){
    const token = localStorage.getItem('token');

    if(token != null){
      const decodedValue : any = jwtDecode(token);
      return decodedValue;
    }
  }
  
}
