import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {LighthouseSourceMetadata} from '../models/lighthouse/lighthouse-source-metadata';
import * as Oauth from '@panva/oauth4webapi';
import {SourceState} from '../models/fasten/source-state';
import {MetadataSource} from '../models/fasten/metadata-source';
import {LighthouseSourceSearch} from '../models/lighthouse/lighthouse-source-search';
import {MedicalSourcesFilter} from '../models/lighthouse/medical-sources-filter';

@Injectable({
  providedIn: 'root'
})
export class LighthouseService {

  constructor(private _httpClient: HttpClient) {
  }

  searchMedicalContactIndividual(searchTerm: string): Observable<string[]> {
    let queryParams = {
      'terms':searchTerm,
      'df':'NPI,name.full,provider_type,addr_practice,licenses.taxonomy.code'
    }

    //https://clinicaltables.nlm.nih.gov/api/npi_idv/v3/search?df=&terms=xx
    return this._httpClient.get<any>(`https://clinicaltables.nlm.nih.gov/api/npi_idv/v3/search`, {params: queryParams})
      .pipe(
        map((response) => {
          return response[3].map((item) => {
            return item[1]
            // let addr_practice = JSON.parse(item[3])
            // return {
            //   id: item[0],
            //   identifier: [{
            //     system: 'http://hl7.org/fhir/sid/us-npi',
            //     value: item[0],
            //     type: {
            //       coding: [
            //         {
            //           system: "http://terminology.hl7.org/CodeSystem/v2-0203",
            //           code: "NPI"
            //         }
            //       ]
            //     }
            //   }],
            //   text: item[1],
            //   subtext: `${item[2]} - ${addr_practice.state}`,
            //   provider_type: {
            //     id: item[4],
            //     text: item[2],
            //     identifier: [{
            //       system: 'http://nucc.org/provider-taxonomy',
            //       code: item[4],
            //       display: item[2],
            //     }]
            //   },
            //   provider_address: {
            //     line1: addr_practice.line1,
            //     line2: addr_practice.line2,
            //     city: addr_practice.city,
            //     state: addr_practice.state,
            //     zip: addr_practice.zip,
            //     country: addr_practice.country,
            //   },
            //   provider_fax: addr_practice.fax,
            //   provider_phone: addr_practice.phone,
            // }
          })
        })
      )
  }


  // public findLighthouseSources(searchTerm: string, scrollId= "", showHidden = false): Observable<LighthouseSourceSearch> {
  //   const endpointUrl = new URL(`${environment.lighthouse_api_endpoint_base}/list/search`);
  //   if(showHidden){
  //     endpointUrl.searchParams.set('show_hidden', 'true');
  //   }
  //   if(scrollId){
  //     endpointUrl.searchParams.set('scroll_id', scrollId);
  //   }
  //   if(searchTerm){
  //     endpointUrl.searchParams.set('query', searchTerm);
  //   }
  //
  //   return this._httpClient.get<ResponseWrapper>(endpointUrl.toString())
  //     .pipe(
  //       map((response: ResponseWrapper) => {
  //         console.log("Metadata RESPONSE", response)
  //         return response.data as LighthouseSourceSearch
  //       })
  //     );
  // }


  public searchLighthouseSources(filter: MedicalSourcesFilter): Observable<LighthouseSourceSearch> {
    if((typeof filter.searchAfter === 'string' || filter.searchAfter instanceof String) && (filter.searchAfter as string).length > 0){
      filter.searchAfter = (filter.searchAfter as string).split(',')
    } else {
      filter.searchAfter = []
    }
    const endpointUrl = new URL(`${environment.lighthouse_api_endpoint_base}/search`);
    return this._httpClient.post<ResponseWrapper>(endpointUrl.toString(), filter)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("Metadata RESPONSE", response)
          return response.data as LighthouseSourceSearch
        })
      );
  }

  public getLighthouseSourceMetadataMap(show_hidden: boolean = false): Observable<{[name: string]: MetadataSource}> {
    let queryParams = {
      'show_hidden':show_hidden,
    }

    return this._httpClient.get<ResponseWrapper>(`${environment.lighthouse_api_endpoint_base}/list`,{params: queryParams})
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("Metadata RESPONSE", response)
          return response.data as {[name: string]: MetadataSource}
        })
      );
  }

  async getLighthouseSource(sourceType: string): Promise<LighthouseSourceMetadata> {
    return this._httpClient.get<any>(`${environment.lighthouse_api_endpoint_base}/connect/${sourceType}`)
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as LighthouseSourceMetadata
        })
      ).toPromise();
  }

}

export interface NlmSearchResults {
  id: string
  text: string
  subtext?: string //used for display purposes only
  parentAnswerCode?: string
  link?: string
  identifier?: any[]

  provider_type?: {
    id: string,
    text: string,
    identifier?: any[]
  }
  provider_address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  provider_phone?: string
  provider_fax?: string
}
