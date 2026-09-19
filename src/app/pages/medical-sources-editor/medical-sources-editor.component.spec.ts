import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';

import { ToastType } from '../../models/fasten/toast';
import { CmsService } from '../../services/cms.service';
import { ConnectApiService } from '../../services/connect-api.service';
import { PlatformApiService } from '../../services/platform-api.service';
import { ToastService } from '../../services/toast.service';
import { MedicalSourcesEditorComponent } from './medical-sources-editor.component';

describe('MedicalSourcesEditorComponent', () => {
  let component: MedicalSourcesEditorComponent;
  let fixture: ComponentFixture<MedicalSourcesEditorComponent>;
  let connectApi: jasmine.SpyObj<ConnectApiService>;
  let cmsApi: jasmine.SpyObj<CmsService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let modalService: jasmine.SpyObj<NgbModal>;

  const emptySearchResponse = {
    hits: { hits: [], total: { value: 0 } }
  } as any;

  const brand = {
    id: 'brand-one',
    name: 'Alpha Health',
    aliases: [ 'Alpha Medical' ],
    brand_website: 'https://alpha.example',
    locations: [ { state: 'ca' }, { address: { state: 'NY' } }, 'ca' ],
    portals: [],
  } as any;

  beforeEach(async () => {
    connectApi = jasmine.createSpyObj('ConnectApiService', [ 'searchCatalogSources', 'catalogEditor' ]);
    connectApi.searchCatalogSources.and.returnValue(of(emptySearchResponse));
    cmsApi = jasmine.createSpyObj('CmsService', [ 'searchMedicalContactIndividual' ]);
    toastService = jasmine.createSpyObj('ToastService', [ 'show' ]);
    modalService = jasmine.createSpyObj('NgbModal', [ 'open', 'dismissAll' ]);

    await TestBed.configureTestingModule({
      declarations: [ MedicalSourcesEditorComponent ],
      imports: [ FormsModule, ReactiveFormsModule ],
      providers: [
        { provide: ConnectApiService, useValue: connectApi },
        { provide: CmsService, useValue: cmsApi },
        { provide: PlatformApiService, useValue: {} },
        { provide: ToastService, useValue: toastService },
        { provide: NgbModal, useValue: modalService },
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalSourcesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the first catalog page on initialization', () => {
    expect(component).toBeTruthy();
    expect(connectApi.searchCatalogSources).toHaveBeenCalledTimes(1);
    expect(component.loading).toBeFalse();
    expect(component.scrollComplete).toBeTrue();
  });

  it('appends catalog pages and advances the search-after cursor', () => {
    const first = { _source: brand, sort: [ 'alpha', 'brand-one' ] };
    const second = { _source: { ...brand, id: 'brand-two', name: 'Beta Health' }, sort: [ 'beta', 'brand-two' ] };
    connectApi.searchCatalogSources.and.returnValue(of({
      hits: { hits: [ first, second ], total: { value: 10 } }
    } as any));
    component.brandsList = [];
    component.scrollComplete = false;

    component.loadMore();

    expect(component.brandsList.map(item => item.name)).toEqual([ 'Alpha Health', 'Beta Health' ]);
    expect(component.searchFilter.searchAfter).toBe('beta,brand-two');
    expect(component.scrollComplete).toBeFalse();
  });

  it('resets pagination and replaces existing results when filters change', () => {
    connectApi.searchCatalogSources.and.returnValue(of({
      hits: {
        hits: [ { _source: brand, sort: [ 'alpha' ] } ],
        total: { value: 1 },
      }
    } as any));
    component.brandsList = [ { ...brand, id: 'old-brand', name: 'Old Result' } ];
    component.searchFilter.searchAfter = 'old,cursor';
    component.scrollComplete = true;

    component.resetSearch();

    expect(component.searchFilter.searchAfter).toBeUndefined();
    expect(component.brandsList.length).toBe(1);
    expect(component.brandsList[0].name).toBe('Alpha Health');
    expect(component.scrollComplete).toBeTrue();
  });

  it('does not issue overlapping or completed-scroll requests', () => {
    connectApi.searchCatalogSources.calls.reset();
    component.loading = true;
    component.loadMore();
    expect(connectApi.searchCatalogSources).not.toHaveBeenCalled();

    component.loading = false;
    component.scrollComplete = true;
    component.onScroll();
    expect(connectApi.searchCatalogSources).not.toHaveBeenCalled();
  });

  it('recovers from catalog search errors', () => {
    spyOn(console, 'log');
    connectApi.searchCatalogSources.and.returnValue(throwError({ status: 503 }));
    component.loading = false;

    component.loadMore();

    expect(component.loading).toBeFalse();
    expect(component.brandsList).toEqual([]);
  });

  it('formats logos and deduplicated location summaries for catalog rows', () => {
    expect(component.logoUrl(brand)).toBe('https://cdn.fastenhealth.com/logos/sources/brand-one.png');
    expect(component.logoUrl({ ...brand, logo: 'https://example.test/logo.png' }))
      .toBe('https://example.test/logo.png');
    expect(component.locationSummary(brand)).toBe('CA, NY');
    expect(component.locationSummary({ ...brand, locations: [] })).toBe('N/A');

    const image = document.createElement('img');
    component.logoError({ target: image } as any);
    expect(image.src).toContain('cdn.fastenhealth.com/images/no-image.svg');
    expect(image.onerror).toBeNull();
  });

  it('opens the source editor with a form initialized from the selected brand', () => {
    component.editor = { template: true };

    component.showEditorModal(brand);

    expect(component.selectedBrandForEditor).toBe(brand);
    expect(component.brandEditorForm.get('brand_id').value).toBe('brand-one');
    expect(component.brandEditorForm.get('name').value).toBe('Alpha Health');
    expect(component.brandEditorForm.get('brand_website').value).toBe('https://alpha.example');
    expect(modalService.open).toHaveBeenCalledWith(component.editor, { size: 'lg' });
  });

  it('adds aliases and numeric NPI values while rejecting invalid entries', () => {
    component.resetEditorForm(brand);
    const aliasInput = document.createElement('input');
    aliasInput.value = 'Alpha Clinic';
    component.addAlias(aliasInput);

    const npiInput = document.createElement('input');
    npiInput.value = '1234567890';
    component.addNpiNumber(npiInput);

    expect(component.aliases.value).toEqual([ { alias: 'Alpha Clinic' } ]);
    expect(component.npi_numbers.value).toEqual([ { npi: '1234567890' } ]);
    expect(aliasInput.value).toBe('');
    expect(npiInput.value).toBe('');

    spyOn(window, 'alert');
    npiInput.value = 'not-a-number';
    component.addNpiNumber(npiInput);
    expect(window.alert).toHaveBeenCalledWith('NPI Number must be a number');
    expect(component.npi_numbers.length).toBe(1);
  });

  it('submits only changed optional fields and normalizes aliases, NPIs, and notes', () => {
    connectApi.catalogEditor.and.returnValue(of({ success: true } as any));
    component.resetEditorForm(brand);
    component.brandEditorForm.get('name').setValue('Alpha Health Updated');
    component.brandEditorForm.get('name').markAsDirty();
    component.brandEditorForm.get('submitter_email').setValue('  editor@example.com  ');
    component.brandEditorForm.get('submitter_private_note').setValue('  Verified against website  ');
    const aliasInput = document.createElement('input');
    aliasInput.value = 'Alpha Updated';
    component.addAlias(aliasInput);
    const npiInput = document.createElement('input');
    npiInput.value = '1234567890';
    component.addNpiNumber(npiInput);

    component.submit();

    const submitted = connectApi.catalogEditor.calls.mostRecent().args[0];
    expect(submitted.name).toBe('Alpha Health Updated');
    expect(submitted.aliases).toEqual([ 'Alpha Updated' ]);
    expect(submitted.npi_numbers).toEqual([ '1234567890' ]);
    expect(submitted.submitter_email).toBe('editor@example.com');
    expect(submitted.submitter_private_note).toBe('Verified against website');
    expect(submitted.brand_website).toBeUndefined();
    expect(submitted.logo_website).toBeUndefined();
    expect(component.loading_submit).toBeFalse();
    expect(modalService.dismissAll).toHaveBeenCalled();
    expect(toastService.show.calls.mostRecent().args[0].type).toBe(ToastType.Success);
  });

  it('keeps the editor open and displays an error toast when submission fails', () => {
    spyOn(console, 'log');
    connectApi.catalogEditor.and.returnValue(throwError({ status: 500 }));
    component.resetEditorForm(brand);

    component.submit();

    expect(component.loading_submit).toBeFalse();
    expect(modalService.dismissAll).not.toHaveBeenCalled();
    expect(toastService.show.calls.mostRecent().args[0].type).toBe(ToastType.Error);
  });

  it('delegates NPI typeahead searches to the CMS service', () => {
    cmsApi.searchMedicalContactIndividual.and.returnValue(of([ 'Jane Provider' ]));
    const process = jasmine.createSpy('process');

    component.npiTypeahead('Jane', process);

    expect(cmsApi.searchMedicalContactIndividual).toHaveBeenCalledWith('Jane');
    expect(process).toHaveBeenCalledWith([ 'Jane Provider' ]);
  });
});
