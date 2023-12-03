import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestInterceptorService implements HttpInterceptor{

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const localStorageToken = localStorage.getItem('token');
    if(localStorageToken !== null){
      const token = localStorageToken.replace(/"/g, '');
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      req = req.clone({
        setParams: {
          access_token: token
        }
      });
    }

    return next.handle(req);
  }
}
