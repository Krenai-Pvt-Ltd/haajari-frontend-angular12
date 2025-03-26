// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class RequestInterceptorService implements HttpInterceptor{

//   constructor() { }

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

//     const localStorageToken = localStorage.getItem('token');
//     if(localStorageToken !== null){
//       const token = localStorageToken.replace(/"/g, '');
//       req = req.clone({
//         setHeaders: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       req = req.clone({
//         setParams: {
//           access_token: token
//         }
//       });
//     }

//     return next.handle(req);
//   }
// }


import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class RequestInterceptorService implements HttpInterceptor {

  constructor(private dataService : DataService, private router : Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('token');
    request = request.clone({
      setHeaders: {
        "ngrok-skip-browser-warning": "69420",
      }
    });
    if (token !== null) {
      request = this.addTokenToHeaders(request, token);
  
      return next.handle(request).pipe(
        catchError(error => {
          if (error.status === 401 || error.status === 400) {
            return this.dataService.refreshFirebaseAccessToken().pipe(
              switchMap((newToken: any) => {
                if (newToken) {
                  localStorage.setItem('token', newToken.access_token);
                  const updatedReq = this.addTokenToHeaders(request, newToken.access_token);
                  return next.handle(updatedReq);
                } else {
                  return throwError('Failed to refresh token');
                }
              }),
              catchError(refreshError => {
                return throwError(refreshError);
              })
            );
          } else {
            console.log("Firebase Error Checking: " + error.status);
            return throwError(error);
          }
        })
      );
    }
  
    return next.handle(request);
  }
  
  private addTokenToHeaders(request: HttpRequest<any>, token: string): HttpRequest<any> {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return request;
  }
  
}