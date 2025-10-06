import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import {ToolboxService} from "../services/toolbox.service";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private readonly toolboxService: ToolboxService,
    private readonly router: Router,
  ) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    return this.evaluateAccess(state.url);
  }

  canActivateChild(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    return this.evaluateAccess(state.url);
  }

  private evaluateAccess(targetUrl: string): boolean | UrlTree {
    if (this.toolboxService.readAdminToken() !== null) {
      console.log("Admin toke was found", this.toolboxService.readAdminToken())
      return true;
    } else {
      console.log("Admin token not found, ", this.toolboxService.readAdminToken())
    }

    const queryParams = targetUrl ? { returnUrl: targetUrl } : undefined;
    return this.router.createUrlTree(['/admin/login'], { queryParams });
  }
}
