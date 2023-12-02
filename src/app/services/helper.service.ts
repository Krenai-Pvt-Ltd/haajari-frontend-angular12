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
    } else{
      return {
        "aud": "haajiri",
        "auth_time": 1701537648,
        "email": "shivendra@krenai.com",
        "email_verified": false,
        "exp": 1701541248,
        "firebase": {
          "identities": {},
          "sign_in_provider": "custom"
        },
        "httpCustomStatus": "UPDATED",
        "iat": 1701537648,
        "iss": "https://securetoken.google.com/haajiri",
        "name": "Shivendra Shrivastwa",
        "orgRefId": "712c6231-911c-11ee-b371-c0cecded00dd",
        "role": "ADMIN",
        "statusResponse": "ORGANIZATION_REGISTRATION_SUCCESSFULL",
        "sub": "1Qm6Qj4hn1TL9344JCbpRva4ByB2",
        "user_id": "1Qm6Qj4hn1TL9344JCbpRva4ByB2",
        "uuid": "8ad264be-911c-11ee-b371-c0cecded00dd"
      };
      
    }
  }
  
}
