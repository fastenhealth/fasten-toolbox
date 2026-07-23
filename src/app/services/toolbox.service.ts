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
export class ToolboxService {

  platform_url = 'https://api.platform.fastenhealth.com/v1'

  constructor(private _httpClient: HttpClient) { }

  catalogEditor(submission: any): Observable<any> {
    return this._httpClient.post<any>(`${environment.connect_api_endpoint_base}/support/catalog`, submission)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("BUNDLE RESPONSE", response)
          // @ts-ignore
          return response.data
        })
      );
  }

  getCatalogEntry(apiMode: string, connection: any): Observable<any> {
    const tefcaDirectoryId = connection.tefca_directory_id;
    const brandId = connection.brand_id;
    let params = new HttpParams()
      .set('api_mode', apiMode)
      .set('public_id', environment.records_export_public_id);

    if (tefcaDirectoryId) {
      params = params.set('tefca_directory_id', tefcaDirectoryId);
    } else if (brandId) {
      params = params.set('brand_id', brandId);
    } else {
      return throwError(() => new Error('Connection has no catalog identifier'));
    }

    return this._httpClient.get<any>(`${environment.connect_api_endpoint_base}/bridge/catalog`, {params});
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

  recordsExportContentUrl(): Observable<RecordExport> {
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


  tefcaIasBetaRequest(requestTefcaIasBeta: RequestTefcaIasBeta): Observable<any> {
    return this._httpClient.post<any>(`${environment.connect_api_endpoint_base}/form/tefca-ias-beta`, requestTefcaIasBeta)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("BUNDLE RESPONSE", response)
          // @ts-ignore
          return response.data
        })
      );
  }

  shlinkManifestCreate(exportType?: 'fhir_bundle' | 'cms_patient_shared_health_document'): Observable<SmartHealthLinkManifestCreateResponse> {

    let createEndpoint = `${this.platform_url}/shlink/manifest/create`
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
