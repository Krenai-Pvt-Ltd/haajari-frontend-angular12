import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate{

    constructor(private router: Router){}
    

    canActivate(): boolean {
        const token = localStorage.getItem('token');
    
        if (!this.isValidTokenFormat(token)) {
          this.router.navigate(['/auth/login']);
          return false;
        }
    
        return true;
      }
    
      private isValidTokenFormat(token: string | null): boolean {
        if (!token) {
          return false;
        }
    
        const parts = token.split('.');
        return parts.length === 3;
      }
}
