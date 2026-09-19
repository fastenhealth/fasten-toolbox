import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CmsService } from './cms.service';

describe('CmsService', () => {
  let service: CmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ HttpClientTestingModule ] });
    service = TestBed.inject(CmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
