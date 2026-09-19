import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {LighthouseSourceMetadata} from '../models/lighthouse/lighthouse-source-metadata';
import * as Oauth from '@panva/oauth4webapi';
import {SourceState} from '../models/fasten/source-state';
import {MetadataSource} from '../models/fasten/metadata-source';
import {LighthouseSourceSearch} from '../models/lighthouse/lighthouse-source-search';
import {MedicalSourcesFilter} from '../models/lighthouse/medical-sources-filter';
import {RequestTefcaIasBeta} from "../models/fasten/request-tefca-ias-beta";

@Injectable({
  providedIn: 'root'
})
export class ConnectApiService {

  constructor(private _httpClient: HttpClient) {}

  public searchCatalogSources(filter: MedicalSourcesFilter): Observable<LighthouseSourceSearch> {
    if((typeof filter.searchAfter === 'string' || filter.searchAfter instanceof String) && (filter.searchAfter as string).length > 0){
      filter.searchAfter = (filter.searchAfter as string).split(',')
    } else {
      filter.searchAfter = []
    }
    //filter out empty string values for platformTypes
    filter.platformTypes = filter.platformTypes.filter((item) => item && item.length > 0);

    const endpointUrl = new URL(`${environment.connect_api_endpoint_base}/bridge/catalog/search?api_mode=live&public_id=public_live_luezin9lp65gprse02h0jox7dmkhi5406kujj4fjsar1b`);
    return this._httpClient.post<ResponseWrapper>(endpointUrl.toString(), filter)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("Metadata RESPONSE", response)
          return response.data as LighthouseSourceSearch
        })
      );
  }

  public getCatalogEntry(apiMode: string, connection: any): Observable<any> {
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

  public catalogEditor(submission: any): Observable<any> {
    return this._httpClient.post<any>(`${environment.connect_api_endpoint_base}/support/catalog`, submission)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("BUNDLE RESPONSE", response)
          // @ts-ignore
          return response.data
        })
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

}
