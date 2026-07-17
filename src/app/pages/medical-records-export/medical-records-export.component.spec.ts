import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ToolboxService } from '../../services/toolbox.service';
import { MedicalRecordsExportComponent } from './medical-records-export.component';

describe('MedicalRecordsExportComponent', () => {
  let component: MedicalRecordsExportComponent;
  let fixture: ComponentFixture<MedicalRecordsExportComponent>;
  let toolboxService: jasmine.SpyObj<ToolboxService>;

  beforeEach(async () => {
    toolboxService = jasmine.createSpyObj('ToolboxService', [ 'getCatalogEntry' ]);
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordsExportComponent ],
      imports: [ CommonModule ],
      providers: [ { provide: ToolboxService, useValue: toolboxService } ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordsExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a choice for each completed connection', async () => {
    toolboxService.getCatalogEntry.and.returnValues(
      of({ success: true, data: { name: 'Alpha Health', location: 'California', logo: 'https://cdn.fastenhealth.com/logos/sources/brand-one.png' } }),
      of({ success: true, data: { name: 'Beta Health', logo: 'https://cdn.fastenhealth.com/logos/sources/brand-two.png' } }),
    );

    component.stitchElement.nativeElement.dispatchEvent(new CustomEvent('eventBus', {
      detail: {
        data: JSON.stringify({
          event_type: 'widget.complete',
          api_mode: 'live',
          data: [
            { org_connection_id: 'connection-one', brand_id: 'brand-one' },
            { org_connection_id: 'connection-two', brand_id: 'brand-two' },
          ]
        })
      }
    }));

    await fixture.whenStable();
    fixture.detectChanges();

    expect(toolboxService.getCatalogEntry.calls.allArgs().map(args => args[0])).toEqual([ 'live', 'live' ]);
    expect(toolboxService.getCatalogEntry.calls.allArgs().map(args => args[1].org_connection_id))
      .toEqual([ 'connection-one', 'connection-two' ]);

    const choices = fixture.nativeElement.querySelectorAll('.institution-selector button');
    expect(choices.length).toBe(2);
    expect(choices[0].querySelector('.institution-name').textContent.trim()).toBe('Alpha Health');
    expect(choices[1].querySelector('.institution-name').textContent.trim()).toBe('Beta Health');
    expect(choices[0].querySelector('.institution-location').textContent.trim()).toBe('California');

    const logo1 = choices[0].querySelector('.institution-logo');
    expect(logo1).toBeTruthy();
    expect(logo1.getAttribute('src')).toBe('https://cdn.fastenhealth.com/logos/sources/brand-one.png');
    expect(logo1.getAttribute('alt')).toBe('');

    const logo2 = choices[1].querySelector('.institution-logo');
    expect(logo2).toBeTruthy();
    expect(logo2.getAttribute('src')).toBe('https://cdn.fastenhealth.com/logos/sources/brand-two.png');
    expect(logo2.getAttribute('alt')).toBe('');

  });

  it('falls back to the brand logo and keeps providers without logos selectable', async () => {
    toolboxService.getCatalogEntry.and.returnValues(
      of({ success: true, data: { name: 'Fallback Health' } }),
      of({ success: true, data: { name: 'TEFCA Health' } }),
    );

    component.stitchElement.nativeElement.dispatchEvent(new CustomEvent('eventBus', {
      detail: {
        data: JSON.stringify({
          event_type: 'widget.complete',
          api_mode: 'test',
          data: [
            { org_connection_id: 'connection-one', brand_id: 'brand-one' },
            { org_connection_id: 'connection-two', tefca_directory_id: 'tefca-two' },
          ]
        })
      }
    }));

    await fixture.whenStable();
    fixture.detectChanges();

    const choices = fixture.nativeElement.querySelectorAll('.institution-selector button');
    expect(choices.length).toBe(2);
    expect(choices[0].querySelector('.institution-logo').getAttribute('src'))
      .toBe('https://cdn.fastenhealth.com/logos/sources/brand-one.png');
    expect(choices[1].querySelector('.institution-logo')).toBeNull();

    const fallbackLogo = choices[0].querySelector('.institution-logo');
    fallbackLogo.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.institution-selector button').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.institution-logo')).toBeNull();
  });

  it('does not pass UI-only institution fields to the callback', () => {
    const callbackUrl = component.buildCallbackUrl({
      org_connection_id: 'connection-one',
      institutionName: 'Alpha Health',
      institutionLogo: 'https://example.com/logo.png',
      institutionLocation: 'California',
    });
    const params = new URL(callbackUrl).searchParams;

    expect(params.get('org_connection_id')).toBe('connection-one');
    expect(params.get('institutionName')).toBeNull();
    expect(params.get('institutionLogo')).toBeNull();
    expect(params.get('institutionLocation')).toBeNull();
  });
});
