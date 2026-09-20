import { TestBed } from '@angular/core/testing';

import { ConnectApiService } from './connect-api.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from "../../environments/environment";
import {RequestToolboxAccess} from '../models/fasten/request-toolbox-access';

describe('ConnectApiService', () => {
  let service: ConnectApiService;
  let httpTestingController: HttpTestingController;
  let documentMock: {cookie: string; location: {protocol: string}};

  beforeEach(() => {
    documentMock = {
      cookie: '',
      location: {protocol: 'https:'},
    };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ConnectApiService);
    (service as any).document = documentMock;
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

  it('requests Toolbox access and stores the email cookie after success', () => {
    const payload: RequestToolboxAccess = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: ' jane+toolbox@example.com ',
    };
    let result: boolean;

    service.requestToolboxAccess(payload).subscribe(value => result = value);

    const request = httpTestingController.expectOne(`${environment.connect_api_endpoint_base}/form/toolbox-access`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(documentMock.cookie).toBe('');

    request.flush({success: true, data: true});

    expect(result).toBeTrue();
    expect(documentMock.cookie).toBe(
      'toolbox_access_email=jane%2Btoolbox%40example.com; Max-Age=2592000; Path=/; SameSite=Lax; Secure',
    );
  });

  it('does not store the Toolbox email cookie after a failed request', () => {
    service.requestToolboxAccess({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    }).subscribe({error: () => undefined});

    const request = httpTestingController.expectOne(`${environment.connect_api_endpoint_base}/form/toolbox-access`);
    request.flush({success: false, error: 'failed'}, {status: 500, statusText: 'Server Error'});

    expect(documentMock.cookie).toBe('');
  });
});
