import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { MedicalRecordsExportComponent } from './medical-records-export.component';

describe('MedicalRecordsExportComponent', () => {
  let component: MedicalRecordsExportComponent;
  let fixture: ComponentFixture<MedicalRecordsExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordsExportComponent ],
      imports: [ CommonModule ]
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
    const fetchSpy = spyOn(window, 'fetch').and.returnValues(
      Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: { name: 'Alpha Health' } }) } as any),
      Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: { name: 'Beta Health' } }) } as any),
    );
    const redirectSpy = spyOn(component, 'redirectConnection');

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

    const catalogRequests = fetchSpy.calls.allArgs().map(args => new URL(args[0] as string));
    expect(catalogRequests.map(request => `${request.origin}${request.pathname}`)).toEqual([
      `${environment.connect_api_endpoint_base}/bridge/catalog`,
      `${environment.connect_api_endpoint_base}/bridge/catalog`,
    ]);
    expect(catalogRequests.map(request => request.searchParams.get('public_id'))).toEqual([
      environment.records_export_public_id,
      environment.records_export_public_id,
    ]);

    const choices = fixture.nativeElement.querySelectorAll('.institution-selector button');
    expect(choices.length).toBe(2);
    expect(choices[0].querySelector('.institution-name').textContent.trim()).toBe('Alpha Health');
    expect(choices[1].querySelector('.institution-name').textContent.trim()).toBe('Beta Health');

    choices[1].click();
    expect(redirectSpy).toHaveBeenCalledWith(component.connections[1]);
  });
});
