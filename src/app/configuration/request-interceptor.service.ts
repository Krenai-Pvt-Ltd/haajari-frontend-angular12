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


import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RequestInterceptorService implements HttpInterceptor {

  constructor(private dataService : DataService, private router : Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const localStorageToken = localStorage.getItem('token');
    const localStorageRefreshToken = localStorage.getItem('refresh_token');
  
    debugger
    if (localStorageToken !== null && localStorageRefreshToken !== null) {
      const token = localStorageToken.replace(/"/g, '');
      request = this.addTokenToHeaders(request, token);
  
      return next.handle(request).pipe(
        catchError(error => {
          if (error.status === 401 || error.status === 403) {
            return this.dataService.refreshFirebaseAccessToken().pipe(
              switchMap((newToken: string) => {
                if (newToken) {
                  const updatedReq = this.addTokenToHeaders(request, newToken);
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

    request = request.clone({
      setParams: {
        access_token: token
      }
    });

    return request;
  }
  
}
