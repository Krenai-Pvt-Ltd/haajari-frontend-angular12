import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Key } from "src/app/constant/key";
import { RoleBasedAccessControlService } from "src/app/services/role-based-access-control.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private rbacService: RoleBasedAccessControlService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    if (!this.isValidTokenFormat(token)) {
      this.router.navigate(['/auth/login']);
      return false;
    }



    debugger
    if(route !== null && route.routeConfig !== null){
      if(this.rbacService.getRole() === Key.USER && route.routeConfig.path == 'dashboard') {
        this.router.navigate(['/employee-profile'], {queryParams : {"userId" : this.rbacService.getUUID()}});
        return false;
      }
    }


    const requiredSubmodule = route.data.requiredSubmodule;
    if (requiredSubmodule && !this.rbacService.hasAccessToSubmodule(requiredSubmodule)) {
      this.router.navigate(['/unauthorized']);
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
