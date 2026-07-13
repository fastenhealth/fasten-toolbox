import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TefcaIasExportComponent } from './tefca-ias-export.component';

describe('TefcaIasExportComponent', () => {
  let component: TefcaIasExportComponent;
  let fixture: ComponentFixture<TefcaIasExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TefcaIasExportComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TefcaIasExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prompts for a provider when multiple connections are returned', () => {
    const connections = [
      { healthcare_institution_name: 'Massachusetts General Hospital', id: 'one' },
      { healthcare_institution_name: 'Cleveland Clinic', id: 'two' },
    ];
    spyOn(component, 'selectProvider');

    component.handleWidgetComplete(connections);

    expect(component.connections).toEqual(connections);
    expect(component.showProviderSelection).toBe(true);
    expect(component.selectProvider).not.toHaveBeenCalled();
  });

  it('continues directly when one connection is returned', () => {
    const connection = { healthcare_institution_name: 'Massachusetts General Hospital', id: 'one' };
    spyOn(component, 'selectProvider');

    component.handleWidgetComplete([connection]);

    expect(component.showProviderSelection).toBe(false);
    expect(component.selectProvider).toHaveBeenCalledWith(connection);
  });
});
