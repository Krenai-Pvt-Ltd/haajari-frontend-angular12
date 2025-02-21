import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { RoleBasedAccessControlService } from "src/app/services/role-based-access-control.service";

export class OnboardingAuthGuard implements CanActivate{

  constructor(private router: Router, private rbacService: RoleBasedAccessControlService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const token = localStorage.getItem('token');
        if (! await (this.isValidTokenFormat(token))) {
          this.router.navigate(['/auth/login']);
          return false;
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
