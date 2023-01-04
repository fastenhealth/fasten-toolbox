import { Injectable } from '@angular/core';
import {Source} from '../models/fasten/source';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ResponseWrapper} from '../models/response-wrapper';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ToolboxService {

  constructor(private _httpClient: HttpClient) { }

  exportSource(source: Source): Observable<any> {
    return this._httpClient.post<any>(`https://api.toolbox-api.fastenhealth.com/secure/export`, source)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("BUNDLE RESPONSE", response)
          // @ts-ignore
          return response.data
        })
      );
  }
}
