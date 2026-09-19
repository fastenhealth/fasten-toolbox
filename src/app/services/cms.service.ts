import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {encode} from "jose/dist/types/util/base64url";
import {map} from "rxjs/operators";
import {SearchResponse} from "../models/cms/search-response";

@Injectable({
  providedIn: 'root'
})
export class CmsService {

  constructor(private _httpClient: HttpClient) {}

//   await fetch("https://rce.sequoiaproject.org/wp-admin/admin-ajax.php", {
//   "credentials": "include",
//   "headers": {
//     "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:143.0) Gecko/20100101 Firefox/143.0",
//     "Accept": "application/json, text/javascript, */*; q=0.01",
//     "Accept-Language": "en-US,en;q=0.5",
//     "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
//     "X-Requested-With": "XMLHttpRequest",
//     "Sec-GPC": "1",
//     "Alt-Used": "rce.sequoiaproject.org",
//     "Sec-Fetch-Dest": "empty",
//     "Sec-Fetch-Mode": "cors",
//     "Sec-Fetch-Site": "same-origin",
//     "Priority": "u=0",
//     "Pragma": "no-cache",
//     "Cache-Control": "no-cache"
//   },
//   "referrer": "https://rce.sequoiaproject.org/tefca-map-search/",
//   "body": "action=get_stores_by_name&name=ucsf&page=1&perPage=200&participantType=all&orgType%5B%5D=TOTAL&status=active",
//   "method": "POST",
//   "mode": "cors"
// });

  public findHealthcareInstitution(searchTerm: string, zipCode?:number): Observable<SearchResponse> {
    const endpointUrl = new URL(`https://cms.jason-978.workers.dev/search`);

    // const data: Record<string,string> = {
    //   action: 'get_stores_by_name',
    //   name: searchTerm,
    //   page: '1',
    //   perPage: '200',
    //   participantType: 'all',
    //   orgType: ['TOTAL'],
    //   status: 'active',
    // };
    let params = new URLSearchParams()
    params.set('action', 'get_stores_by_name')
    params.set('name', searchTerm)
    params.set('page', '1')
    params.set('perPage', '200')
    params.set('participantType', 'all')
    params.append('orgType[]', 'TOTAL')
    params.set('status', 'active')
    if (zipCode) {
      params.set('zip', zipCode.toString())
    }

    return this._httpClient.post<SearchResponse>(endpointUrl.toString(), params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
      },
    })
      .pipe(
        map((response: any) => {
          console.log("Search RESPONSE", response)
          return response
        })
      );
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
