import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';

@Injectable({providedIn: 'root'})
export class IsAuthenticatedAuthGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    const hasToolboxAccess = this.document.cookie
      .split(';')
      .map(cookie => cookie.trim())
      .some(cookie => {
        const separatorIndex = cookie.indexOf('=');
        return separatorIndex > 0
          && cookie.slice(0, separatorIndex) === 'toolbox_access_email'
          && cookie.slice(separatorIndex + 1).length > 0;
      });

    return hasToolboxAccess
      ? true
      : this.router.createUrlTree(['/auth/terms']);
  }
}
