import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ToolboxService } from '../../services/toolbox.service';
import { TefcaIasExportComponent } from './tefca-ias-export.component';

describe('TefcaIasExportComponent', () => {
  let component: TefcaIasExportComponent;
  let fixture: ComponentFixture<TefcaIasExportComponent>;
  let toolboxService: jasmine.SpyObj<ToolboxService>;

  beforeEach(async () => {
    toolboxService = jasmine.createSpyObj('ToolboxService', [ 'getCatalogEntry' ]);
    await TestBed.configureTestingModule({
      declarations: [ TefcaIasExportComponent ],
      imports: [ CommonModule ],
      providers: [ { provide: ToolboxService, useValue: toolboxService } ]
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

  it('loads environment catalog metadata and renders a choice for each connection', async () => {
    toolboxService.getCatalogEntry.and.returnValues(
      of({ success: true, data: { name: 'Alpha Health', location: 'California', logo: 'https://catalog.example/alpha.png' } }),
      of({ success: true, data: { name: 'Beta Health' } }),
    );

    dispatchWidgetComplete([
      { org_connection_id: 'connection-one', tefca_directory_id: 'tefca-one', brand_id: 'brand-one' },
      { org_connection_id: 'connection-two', brand_id: 'brand-two' },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(toolboxService.getCatalogEntry.calls.allArgs().map(args => args[0])).toEqual([ 'live', 'live' ]);
    expect(toolboxService.getCatalogEntry.calls.allArgs().map(args => args[1].org_connection_id))
      .toEqual([ 'connection-one', 'connection-two' ]);

    const choices = fixture.nativeElement.querySelectorAll('.institution-selector button');
    expect(choices.length).toBe(2);
    expect(choices[0].querySelector('.institution-name').textContent.trim()).toBe('Alpha Health');
    expect(choices[0].querySelector('.institution-location').textContent.trim()).toBe('California');
    expect(choices[0].querySelector('.institution-logo').getAttribute('src')).toBe('https://catalog.example/alpha.png');
    expect(choices[1].querySelector('.institution-logo').getAttribute('src'))
      .toBe('https://cdn.fastenhealth.com/logos/sources/brand-two.png');

  });

  it('shows placeholders when the catalog has no logo or the logo cannot load', async () => {
    toolboxService.getCatalogEntry.and.returnValues(
      of({ success: true, data: { name: 'Directory Health' } }),
      of({ success: true, data: { name: 'Brand Health' } }),
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
    toolboxService.getCatalogEntry.and.returnValue(of({ success: false }));

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
