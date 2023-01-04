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
    return this._httpClient.post<any>(`https://qacjvynw4hzeuc2uasy2xl737m0nuhbh.lambda-url.us-east-1.on.aws`, source)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("BUNDLE RESPONSE", response)
          // @ts-ignore
          return response.data
        })
      );
  }
}
