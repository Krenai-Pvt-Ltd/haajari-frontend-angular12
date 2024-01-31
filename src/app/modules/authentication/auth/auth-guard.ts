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

    
    if(this.rbacService.getRole()! == Key.USER){
      debugger
      const r = route;
      this.router.navigate(['/auth/login']);
      return false;
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
