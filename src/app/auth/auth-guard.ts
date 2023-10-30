import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate{

    constructor(private router: Router){}
    

    canActivate(): boolean {
        const loginDetails = localStorage.getItem('loginData');

        if(!loginDetails){
            this.router.navigate(['dynamic/login']);
            return false;
        }
        return true;
    }
}
