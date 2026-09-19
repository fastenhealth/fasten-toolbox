import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subject, throwError } from 'rxjs';

import { PlatformApiService } from '../../services/platform-api.service';
import { PatientSharedHealthDocumentModalComponent } from '../patient-shared-health-document-modal/patient-shared-health-document-modal.component';
import { SmartHealthLinkModalComponent } from '../smart-health-link-modal/smart-health-link-modal.component';
import { MedicalRecordsExportCallbackComponent } from './medical-records-export-callback.component';

describe('MedicalRecordsExportCallbackComponent', () => {
  let component: MedicalRecordsExportCallbackComponent;
  let fixture: ComponentFixture<MedicalRecordsExportCallbackComponent>;
  let queryParams$: Subject<Params>;
  let platformApi: jasmine.SpyObj<PlatformApiService>;
  let modalService: jasmine.SpyObj<NgbModal>;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(async () => {
    queryParams$ = new Subject<Params>();
    platformApi = jasmine.createSpyObj('PlatformApiService', [
      'recordsExportCallback',
      'recordsExportContentUrl',
      'recordsExportDownloadContentUrl',
    ]);
    modalService = jasmine.createSpyObj('NgbModal', [ 'open' ]);
    sanitizer = jasmine.createSpyObj('DomSanitizer', [ 'bypassSecurityTrustResourceUrl' ]);

    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordsExportCallbackComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$.asObservable() } },
        { provide: PlatformApiService, useValue: platformApi },
        { provide: NgbModal, useValue: modalService },
        { provide: DomSanitizer, useValue: sanitizer },
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalRecordsExportCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    queryParams$.complete();
    fixture.destroy();
  });

  it('renders an authorization error without starting an export', () => {
    queryParams$.next({
      error: 'authorization_failed',
      error_description: 'The request could not be completed.',
      request_id: 'request-one',
      org_connection_id: 'connection-one',
    });
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.hasError).toBeTrue();
    expect(component.errorMsg).toContain('error=authorization_failed');
    expect(component.errorMsg).toContain('request_id=request-one');
    expect(component.errorMsg).toContain('connection_id=connection-one');
    expect(platformApi.recordsExportCallback).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.error-card')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.phone-frame')).toBeNull();
  });

  it('rejects callback requests without a connection id', () => {
    queryParams$.next({ request_id: 'request-two' });

    expect(component.loading).toBeFalse();
    expect(component.hasError).toBeTrue();
    expect(component.errorMsg).toContain('No connection id was provided');
    expect(component.errorMsg).toContain('request_id=request-two');
    expect(platformApi.recordsExportCallback).not.toHaveBeenCalled();
  });

  it('polls immediately, downloads the complete JSONL payload, and prepares the download', () => {
    spyOn(console, 'log');
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:records');
    sanitizer.bypassSecurityTrustResourceUrl.and.returnValue('safe:records' as any);
    const payload = '{"resourceType":"Patient","id":"one"}\n{"resourceType":"Observation","id":"two"}\n';
    platformApi.recordsExportCallback.and.returnValue(of({ accepted: true } as any));
    platformApi.recordsExportContentUrl.and.returnValue(of({
      status: 'success',
      content_url: 'https://example.test/signed-content',
      download_links: [ 'one', 'two' ],
    } as any));
    platformApi.recordsExportDownloadContentUrl.and.returnValue(of(payload as any));

    queryParams$.next({ org_connection_id: 'connection-one', endpoint_id: 'endpoint-one' });
    fixture.detectChanges();

    expect(platformApi.recordsExportCallback).toHaveBeenCalledWith(jasmine.objectContaining({
      org_connection_id: 'connection-one',
      endpoint_id: 'endpoint-one',
    }));
    expect(platformApi.recordsExportContentUrl).toHaveBeenCalledTimes(1);
    expect(platformApi.recordsExportDownloadContentUrl).toHaveBeenCalledWith('https://example.test/signed-content');
    expect(component.loading).toBeFalse();
    expect(component.hasBundle).toBeTrue();
    expect(component.bundle).toBe(payload);
    expect(component.hasMultipleDownloadLinks).toBeTrue();
    expect(component.generateBundleDownloadFilename).toBe('fasten-endpoint-one.bundle.jsonl');
    expect(component.generateBundleDownloadUrl).toBe('safe:records' as any);
    expect(fixture.nativeElement.querySelector('.callback-viewport.has-success')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.success-workspace.callback-card')).toBeNull();
    expect(fixture.nativeElement.querySelector('.bundle-preview')).toBeTruthy();
  });

  it('shows a detailed error when the export reports failure', () => {
    spyOn(console, 'log');
    platformApi.recordsExportCallback.and.returnValue(of({ accepted: true } as any));
    platformApi.recordsExportContentUrl.and.returnValue(of({ status: 'failed' } as any));

    queryParams$.next({ org_connection_id: 'connection-three', request_id: 'request-three' });

    expect(component.loading).toBeFalse();
    expect(component.hasError).toBeTrue();
    expect(component.hasBundle).toBeFalse();
    expect(component.errorMsg).toContain('error=fasten_export_error');
    expect(component.errorMsg).toContain('request_id=request-three');
    expect(component.errorMsg).toContain('connection_id=connection-three');
  });

  it('surfaces polling errors with their status and API message', () => {
    spyOn(console, 'log');
    platformApi.recordsExportCallback.and.returnValue(of({ accepted: true } as any));
    platformApi.recordsExportContentUrl.and.returnValue(throwError({
      status: 503,
      error: { error: 'export_temporarily_unavailable' },
    }));

    queryParams$.next({ org_connection_id: 'connection-four', request_id: 'request-four' });

    expect(component.loading).toBeFalse();
    expect(component.hasError).toBeTrue();
    expect(component.errorMsg).toContain('status=503');
    expect(component.errorMsg).toContain('error=export_temporarily_unavailable');
  });

  it('surfaces callback registration errors before polling begins', () => {
    platformApi.recordsExportCallback.and.returnValue(throwError({
      status: 400,
      error: { error: 'invalid_connection' },
    }));

    queryParams$.next({ org_connection_id: 'connection-five', request_id: 'request-five' });

    expect(component.loading).toBeFalse();
    expect(component.hasError).toBeTrue();
    expect(component.errorMsg).toContain('status=400');
    expect(component.errorMsg).toContain('error=invalid_connection');
    expect(platformApi.recordsExportContentUrl).not.toHaveBeenCalled();
  });

  it('opens both sharing modals with the protected modal configuration', () => {
    component.openSmartHealthLinkModal();
    component.openPatientSharedHealthDocumentModal();

    const config = { size: 'md', centered: true, backdrop: 'static' as const };
    expect(modalService.open).toHaveBeenCalledWith(SmartHealthLinkModalComponent, config);
    expect(modalService.open).toHaveBeenCalledWith(PatientSharedHealthDocumentModalComponent, config);
  });
});
