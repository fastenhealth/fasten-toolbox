import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

import { ToolboxService } from '../../services/toolbox.service';
import { MedicalRecordsExportCallbackComponent } from './medical-records-export-callback.component';

describe('MedicalRecordsExportCallbackComponent', () => {
  let component: MedicalRecordsExportCallbackComponent;
  let fixture: ComponentFixture<MedicalRecordsExportCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordsExportCallbackComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              error: 'authorization_failed',
              error_description: 'The request could not be completed.',
              request_id: 'request-one',
            })
          }
        },
        { provide: ToolboxService, useValue: jasmine.createSpyObj('ToolboxService', [ 'recordsExportCallback' ]) },
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', [ 'open' ]) },
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordsExportCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.callback-panel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.phone-frame')).toBeNull();
    expect(fixture.nativeElement.querySelector('.error-card')).toBeTruthy();
  });
});
