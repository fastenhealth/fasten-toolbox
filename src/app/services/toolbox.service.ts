import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ResponseWrapper} from '../models/response-wrapper';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ToolboxService {

  constructor(private _httpClient: HttpClient) { }

  catalogEditor(submission: any): Observable<any> {
    return this._httpClient.post<any>(`https://api.platform.fastenhealth.com/v1/catalog/editor`, submission)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("BUNDLE RESPONSE", response)
          // @ts-ignore
          return response.data
        })
      );
  }
}
