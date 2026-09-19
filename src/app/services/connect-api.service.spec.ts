import { TestBed } from '@angular/core/testing';

import { ConnectApiService } from './connect-api.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {RouterModule} from '@angular/router';
import {environment} from "../../environments/environment";

describe('ConnectApiService', () => {
  let service: ConnectApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ConnectApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpTestingController.verify();
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('looks up a catalog entry using the configured endpoint', () => {
    service.getCatalogEntry('test', { brand_id: 'brand-one' }).subscribe();

    const request = httpTestingController.expectOne(`${environment.connect_api_endpoint_base}/bridge/catalog?api_mode=test&public_id=${environment.records_export_public_id}&brand_id=brand-one`);
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: { name: 'Alpha Health' } });
  });
});
