import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {ToolboxService} from "./toolbox.service";

// based on https://stackoverflow.com/questions/46017245/how-to-handle-unauthorized-requestsstatus-with-401-or-403-with-new-httpclient
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(
    private toolboxService: ToolboxService,
    private router: Router,
  ) { }

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    //handle your auth error or rethrow
    if (err.status === 401 || err.status === 403) {
      //navigate /delete cookies or whatever
      this.toolboxService.storeAdminToken(null)
      this.router.navigateByUrl('/admin/login');
      // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
      return of(err.message); // or EMPTY may be appropriate here
    }
    return throwError(err);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.info("Intercepting Request", req)

    //only intercept requests to the fasten API & lighthouse, all other requests should be sent as-is
    let reqUrl = new URL(req.url)
    let apiUrl = new URL("https://api.connect.fastenhealth.com/v1/admin")
    if(
      !(reqUrl.origin == apiUrl.origin && reqUrl.pathname.startsWith(apiUrl.pathname))
    ){
      return next.handle(req)
    }

    // Clone the request and ensure that cookies are sent
    const authReq = req.clone({withCredentials: true, headers: req.headers.set('Authorization', `Bearer ${this.toolboxService.readAdminToken()}`)});

    // catch the error, make specific functions for catching specific errors and you can chain through them with more catch operators
    return next.handle(authReq).pipe(catchError(x=> this.handleAuthError(x))); //here use an arrow function, otherwise you may get "Cannot read property 'navigate' of undefined" on angular 4.4.2/net core 2/webpack 2.70
  }
}
