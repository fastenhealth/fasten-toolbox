import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { TefcaIasExportComponent } from './tefca-ias-export.component';

describe('TefcaIasExportComponent', () => {
  let component: TefcaIasExportComponent;
  let fixture: ComponentFixture<TefcaIasExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TefcaIasExportComponent ],
      imports: [ CommonModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TefcaIasExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function dispatchWidgetComplete(data: any[], apiMode = 'live'): void {
    component.stitchElement.nativeElement.dispatchEvent(new CustomEvent('eventBus', {
      detail: {
        data: JSON.stringify({
          event_type: 'widget.complete',
          api_mode: apiMode,
          data,
        })
      }
    }));
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirects directly when the widget completes with one connection', () => {
    const fetchSpy = spyOn(window, 'fetch');
    const redirectSpy = spyOn(component, 'redirectConnection');
    const connection = { org_connection_id: 'connection-one', tefca_directory_id: 'tefca-one' };

    dispatchWidgetComplete([connection]);

    expect(redirectSpy).toHaveBeenCalledWith(connection);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('loads environment catalog metadata and renders a choice for each connection', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.returnValues(
      Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: { name: 'Alpha Health', location: 'California', logo: 'https://catalog.example/alpha.png' } }) } as any),
      Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: { name: 'Beta Health' } }) } as any),
    );
    const redirectSpy = spyOn(component, 'redirectConnection');

    dispatchWidgetComplete([
      { org_connection_id: 'connection-one', tefca_directory_id: 'tefca-one', brand_id: 'brand-one' },
      { org_connection_id: 'connection-two', brand_id: 'brand-two' },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const catalogRequests = fetchSpy.calls.allArgs().map(args => new URL(args[0] as string));
    expect(catalogRequests.map(request => `${request.origin}${request.pathname}`)).toEqual([
      `${environment.connect_api_endpoint_base}/bridge/catalog`,
      `${environment.connect_api_endpoint_base}/bridge/catalog`,
    ]);
    expect(catalogRequests.map(request => request.searchParams.get('api_mode'))).toEqual([ 'live', 'live' ]);
    expect(catalogRequests.map(request => request.searchParams.get('public_id'))).toEqual([
      environment.records_export_public_id,
      environment.records_export_public_id,
    ]);

    const choices = fixture.nativeElement.querySelectorAll('.institution-selector button');
    expect(choices.length).toBe(2);
    expect(choices[0].querySelector('.institution-name').textContent.trim()).toBe('Alpha Health');
    expect(choices[0].querySelector('.institution-location').textContent.trim()).toBe('California');
    expect(choices[0].querySelector('.institution-logo').getAttribute('src')).toBe('https://catalog.example/alpha.png');
    expect(choices[1].querySelector('.institution-logo').getAttribute('src'))
      .toBe('https://cdn.fastenhealth.com/logos/sources/brand-two.png');

    choices[1].click();
    expect(redirectSpy).toHaveBeenCalledWith(component.connections[1]);
  });

  it('shows placeholders when the catalog has no logo or the logo cannot load', async () => {
    spyOn(window, 'fetch').and.returnValues(
      Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: { name: 'Directory Health' } }) } as any),
      Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: { name: 'Brand Health' } }) } as any),
    );

    dispatchWidgetComplete([
      { org_connection_id: 'connection-one', tefca_directory_id: 'tefca-one' },
      { org_connection_id: 'connection-two', brand_id: 'brand-two' },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const choices = fixture.nativeElement.querySelectorAll('.institution-selector button');
    expect(choices[0].querySelector('.institution-logo')).toBeNull();
    expect(choices[0].querySelector('.institution-logo-placeholder')).toBeTruthy();

    const fallbackLogo = choices[1].querySelector('.institution-logo');
    fallbackLogo.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(choices[1].querySelector('.institution-logo')).toBeNull();
    expect(choices[1].querySelector('.institution-logo-placeholder')).toBeTruthy();
  });

  it('shows a retryable error when catalog metadata cannot be loaded', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({ ok: false, json: () => Promise.resolve({ success: false }) } as any));

    dispatchWidgetComplete([
      { org_connection_id: 'connection-one', tefca_directory_id: 'tefca-one' },
      { org_connection_id: 'connection-two', tefca_directory_id: 'tefca-two' },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.text-danger').textContent.trim())
      .toBe('We could not load the institution names. Please try again.');
    expect(fixture.nativeElement.querySelector('button.btn-primary')).toBeTruthy();
  });

  it('does not pass UI-only institution fields to the callback', () => {
    const callbackUrl = component.buildCallbackUrl({
      org_connection_id: 'connection-one',
      institutionName: 'Alpha Health',
      institutionLocation: 'California',
      institutionLogo: 'https://example.com/logo.png',
    });
    const params = new URL(callbackUrl).searchParams;

    expect(params.get('org_connection_id')).toBe('connection-one');
    expect(params.get('institutionName')).toBeNull();
    expect(params.get('institutionLocation')).toBeNull();
    expect(params.get('institutionLogo')).toBeNull();
  });
});
