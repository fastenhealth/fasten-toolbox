import { Injectable } from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ResponseWrapper} from '../models/response-wrapper';
import {filter, map, repeat, switchMap, take, timeout} from 'rxjs/operators';
import {Params} from '@angular/router';
import {RecordExport} from '../models/fasten/record-export';
import {RequestTefcaIasBeta} from "../models/fasten/request-tefca-ias-beta";
import {SmartHealthLinkManifestCreateResponse} from '../models/fasten/smart-health-link';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlatformApiService {

  constructor(private _httpClient: HttpClient) { }

  //returns authenticated or error
  recordsExportCallback(queryStringParams: Params ): Observable<boolean> {
    return this._httpClient.get<any>(`${environment.platform_api_endpoint_base}/records/export/callback`,
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

  recordsExportContentUrl(): Observable<RecordExport> {
    return this._httpClient.get<any>(`${environment.platform_api_endpoint_base}/records/export/download`,
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

  recordsExportDownloadContentUrl(contentUrl: string): Observable<string> {
    //contentUrl is a signed s3 url that we need to donwload
    return this._httpClient.get(contentUrl, {responseType: 'text'})
      .pipe(
        map((response: string) => {
          console.log("RECORDS EXPORT DOWNLOAD CONTENT URL RESPONSE", response)
          return response; //return the content of the file
        }),
        timeout(120*1000), //timeout after 2 minutes
        filter((response: string) => response.length > 0), //filter out empty responses
        take(1) //take only one response
      );
  }

  shlinkManifestCreate(exportType?: 'fhir_bundle' | 'cms_patient_shared_health_document'): Observable<SmartHealthLinkManifestCreateResponse> {

    let createEndpoint = `${environment.platform_api_endpoint_base}/shlink/manifest/create`
    if(exportType){
      createEndpoint = `${createEndpoint}?export_type=${exportType}`
    }

    return this._httpClient.post<any>(createEndpoint, {}, {
      withCredentials: true
    }).pipe(
      map((response: ResponseWrapper) => {
        console.log('SMART HEALTH LINK RESPONSE', response);
        // @ts-ignore
        return response.data as SmartHealthLinkManifestCreateResponse;
      })
    );
  }
}
