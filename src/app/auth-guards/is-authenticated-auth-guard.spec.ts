import {TestBed} from '@angular/core/testing';
import {Router, UrlTree} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {IsAuthenticatedAuthGuard} from './is-authenticated-auth-guard';

describe('IsAuthenticatedAuthGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let documentMock: {cookie: string};
  let guard: IsAuthenticatedAuthGuard;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    documentMock = {cookie: ''};
    guard = new IsAuthenticatedAuthGuard(router, documentMock as unknown as Document);
  });

  it('is available through Angular dependency injection', () => {
    TestBed.configureTestingModule({imports: [RouterTestingModule]});

    expect(TestBed.inject(IsAuthenticatedAuthGuard)).toBeTruthy();
  });

  it('allows access when the Toolbox email cookie has a value', () => {
    documentMock.cookie = 'another_cookie=value; toolbox_access_email=jane%40example.com';

    const result = guard.canActivate({} as any, {url: '/records/export'} as any);

    expect(result).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects to the terms page when the Toolbox email cookie is missing', () => {
    const redirect = {} as UrlTree;
    router.createUrlTree.and.returnValue(redirect);

    const result = guard.canActivate(
      {} as any,
      {url: '/records/export?source=example#results'} as any,
    );

    expect(result).toBe(redirect);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/terms'], {
      queryParams: {returnUrl: '/records/export?source=example#results'},
    });
    expect(router.createUrlTree).toHaveBeenCalledTimes(1);
  });

  it('redirects when the Toolbox email cookie is empty', () => {
    const redirect = {} as UrlTree;
    documentMock.cookie = 'toolbox_access_email=';
    router.createUrlTree.and.returnValue(redirect);

    expect(guard.canActivate({} as any, {url: '/tefca/export'} as any)).toBe(redirect);
  });
});
