import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Key } from "src/app/constant/key";
import { RoleBasedAccessControlService } from "src/app/services/role-based-access-control.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private rbacService: RoleBasedAccessControlService) {}

  UUID:any;
  ROLE:any;
  async ngOnInit(): Promise<void> {
    this.UUID = await this.rbacService.getUUID();
    this.ROLE = await this.rbacService.getRole();

  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    
    const token = localStorage.getItem('token');
    if (! await (this.isValidTokenFormat(token))) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    await this.rbacService.isUserInfoInitialized();

    if(route !== null && route.routeConfig !== null){

      if(await this.rbacService.getRole() == Key.USER && route.routeConfig.path == 'dashboard') {
        this.router.navigate(['/employee-profile'], {queryParams : {"userId" : await this.rbacService.getUUID(), dashboardActive: 'true' }});
        return false;
      }

      const requiredSubmodule = '/'+route.routeConfig.path;
      if (requiredSubmodule && !(await this.rbacService.hasAccessToSubmodule(requiredSubmodule))) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }

  async isValidTokenFormat(token: string | null): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        if (!token) {
          resolve(false);
          return;
        }
  
        const parts = token.split('.');
        resolve(parts.length === 3);
      } catch (error) {
        reject(error);
      }
    });
  }
  
}
