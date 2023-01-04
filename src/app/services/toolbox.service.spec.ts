import { TestBed } from '@angular/core/testing';

import { ToolboxService } from './toolbox.service';

describe('ToolboxService', () => {
  let service: ToolboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
