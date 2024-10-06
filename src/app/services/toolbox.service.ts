import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ResponseWrapper} from '../models/response-wrapper';
import {map} from 'rxjs/operators';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ToolboxService {

  platform_url = 'https://api.platform.fastenhealth.com/v1'

  constructor(private _httpClient: HttpClient) { }

  catalogEditor(submission: any): Observable<any> {
    return this._httpClient.post<any>(`${this.platform_url}/catalog/editor`, submission)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("BUNDLE RESPONSE", response)
          // @ts-ignore
          return response.data
        })
      );
  }

  //returns authenticated or error
  recordsExportCallback(queryStringParams: Params ): Observable<boolean> {
    return this._httpClient.get<any>(`${this.platform_url}/records/export/callback`,
      {
        params: queryStringParams,
        withCredentials: true
      })
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RECORDS EXPORT CALLBACK RESPONSE", response)
          // @ts-ignore
          return true
        })
      );
  }

  recordsExportDownload(): Observable<any> {
    return this._httpClient.get<any>(`${this.platform_url}/records/export/download`,
      {
        withCredentials: true
      })
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RECORDS EXPORT DOWNLOAD RESPONSE", response)
          // @ts-ignore
          return response.data
        })
      );
  }

}
